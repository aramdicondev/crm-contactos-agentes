const express = require('express');
const store = require('../contactosStore');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarNombre(nombre) {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

function validarEmail(email) {
  return typeof email === 'string' && email.trim().length > 0 && EMAIL_REGEX.test(email.trim());
}

function validarStatus(status) {
  return store.STATUSES_VALIDOS.includes(status);
}

// GET /api/contactos/resumen -- DEBE ir antes de /:id para que Express no
// interprete "resumen" como un id.
router.get('/resumen', (req, res) => {
  try {
    const resumen = store.resumenPorStatus();
    res.status(200).json(resumen);
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// GET /api/contactos
router.get('/', (req, res) => {
  try {
    res.status(200).json(store.listarTodos());
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// GET /api/contactos/:id
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id inválido' });
    }
    const contacto = store.obtenerPorId(id);
    if (!contacto) {
      return res.status(404).json({ error: 'contacto no encontrado' });
    }
    res.status(200).json(contacto);
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// POST /api/contactos
router.post('/', (req, res) => {
  try {
    const { nombre, email, telefono, status } = req.body || {};

    if (!validarNombre(nombre)) {
      return res.status(400).json({ error: 'nombre es obligatorio' });
    }
    if (!validarEmail(email)) {
      return res.status(400).json({ error: 'email es obligatorio y debe tener formato válido' });
    }
    if (status !== undefined && !validarStatus(status)) {
      return res.status(400).json({ error: 'status debe ser uno de: lead, aceptado, rechazado' });
    }
    if (telefono !== undefined && telefono !== null && typeof telefono !== 'string') {
      return res.status(400).json({ error: 'telefono debe ser una cadena de texto' });
    }

    const nuevo = store.crear({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono !== undefined && telefono !== null ? telefono.trim() : null,
      status,
    });

    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// PUT /api/contactos/:id
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id inválido' });
    }

    const existente = store.obtenerPorId(id);
    if (!existente) {
      return res.status(404).json({ error: 'contacto no encontrado' });
    }

    const { nombre, email, telefono, status } = req.body || {};
    const cambios = {};

    if (nombre !== undefined) {
      if (!validarNombre(nombre)) {
        return res.status(400).json({ error: 'nombre no puede quedar vacío' });
      }
      cambios.nombre = nombre.trim();
    }

    if (email !== undefined) {
      if (!validarEmail(email)) {
        return res.status(400).json({ error: 'email no puede quedar vacío y debe tener formato válido' });
      }
      cambios.email = email.trim();
    }

    if (telefono !== undefined) {
      if (telefono !== null && typeof telefono !== 'string') {
        return res.status(400).json({ error: 'telefono debe ser una cadena de texto' });
      }
      cambios.telefono = telefono !== null ? telefono.trim() : null;
    }

    if (status !== undefined) {
      if (!validarStatus(status)) {
        return res.status(400).json({ error: 'status debe ser uno de: lead, aceptado, rechazado' });
      }
      cambios.status = status;
    }

    const actualizado = store.actualizar(id, cambios);
    res.status(200).json(actualizado);
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

// DELETE /api/contactos/:id
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id inválido' });
    }

    const existente = store.obtenerPorId(id);
    if (!existente) {
      return res.status(404).json({ error: 'contacto no encontrado' });
    }

    store.eliminar(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'error interno del servidor' });
  }
});

module.exports = router;
