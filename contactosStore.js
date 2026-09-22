// Almacenamiento en memoria de contactos (sin base de datos real).
// Los datos NO persisten entre reinicios del proceso — esperado.

let contactos = [
  { id: 1, nombre: 'Ana Torres',      email: 'ana.torres@example.com',      telefono: '555-0101', status: 'lead',      creadoEn: '2026-09-01T09:00:00.000Z' },
  { id: 2, nombre: 'Bruno Martínez',  email: 'bruno.martinez@example.com',  telefono: null,        status: 'lead',      creadoEn: '2026-09-02T10:15:00.000Z' },
  { id: 3, nombre: 'Carla Núñez',     email: 'carla.nunez@example.com',     telefono: '555-0103', status: 'aceptado',  creadoEn: '2026-09-03T11:30:00.000Z' },
  { id: 4, nombre: 'Diego Ramírez',   email: 'diego.ramirez@example.com',   telefono: '555-0104', status: 'aceptado',  creadoEn: '2026-09-04T12:45:00.000Z' },
  { id: 5, nombre: 'Elena Vidal',     email: 'elena.vidal@example.com',     telefono: null,        status: 'rechazado', creadoEn: '2026-09-05T13:00:00.000Z' },
  { id: 6, nombre: 'Franco Silva',    email: 'franco.silva@example.com',    telefono: '555-0106', status: 'rechazado', creadoEn: '2026-09-06T14:20:00.000Z' },
  { id: 7, nombre: 'Gabriela Ríos',   email: 'gabriela.rios@example.com',   telefono: '555-0107', status: 'lead',      creadoEn: '2026-09-07T15:10:00.000Z' },
  { id: 8, nombre: 'Hugo Fernández',  email: 'hugo.fernandez@example.com',  telefono: null,        status: 'aceptado',  creadoEn: '2026-09-08T16:05:00.000Z' },
  { id: 9, nombre: 'Irene Castro',    email: 'irene.castro@example.com',    telefono: '555-0109', status: 'lead',      creadoEn: '2026-09-09T17:40:00.000Z' },
];

let siguienteId = 10;

const STATUSES_VALIDOS = ['lead', 'aceptado', 'rechazado'];

function listarTodos() {
  return contactos;
}

function obtenerPorId(id) {
  return contactos.find((c) => c.id === id) || null;
}

function crear(datos) {
  const nuevo = {
    id: siguienteId++,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono !== undefined ? datos.telefono : null,
    status: datos.status || 'lead',
    creadoEn: new Date().toISOString(),
  };
  contactos.push(nuevo);
  return nuevo;
}

function actualizar(id, cambios) {
  const contacto = obtenerPorId(id);
  if (!contacto) return null;

  if (cambios.nombre !== undefined) contacto.nombre = cambios.nombre;
  if (cambios.email !== undefined) contacto.email = cambios.email;
  if (cambios.telefono !== undefined) contacto.telefono = cambios.telefono;
  if (cambios.status !== undefined) contacto.status = cambios.status;
  // id y creadoEn nunca se modifican, aunque vengan en `cambios`.

  return contacto;
}

function eliminar(id) {
  const indice = contactos.findIndex((c) => c.id === id);
  if (indice === -1) return false;
  contactos.splice(indice, 1);
  return true;
}

function resumenPorStatus() {
  const resumen = { lead: 0, aceptado: 0, rechazado: 0 };
  for (const c of contactos) {
    if (resumen[c.status] !== undefined) {
      resumen[c.status]++;
    }
  }
  return resumen;
}

module.exports = {
  listarTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  resumenPorStatus,
  STATUSES_VALIDOS,
};
