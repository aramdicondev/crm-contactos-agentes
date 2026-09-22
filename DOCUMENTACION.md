# CRM Contactos — Documentación

## 1. Qué es este proyecto

Un CRM básico para gestionar contactos comerciales, con dos pantallas:
un **Dashboard** que muestra el total de contactos y una gráfica
circular por status (Lead / Aceptado / Rechazado), y una pantalla de
**Contactos** para agregar, editar, cambiar el status y eliminar
contactos. Backend en Node.js + Express, frontend en HTML/CSS/JS
vanilla (sin frameworks ni librerías de gráficos).

## 2. Instalación

Requisitos: Node.js instalado (con npm).

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar el servidor:
   ```bash
   npm start
   ```
   (equivale a `node server.js`). Por defecto escucha en el puerto
   `3000`, o en el valor de la variable de entorno `PORT` si está
   definida, por ejemplo:
   ```bash
   PORT=3456 node server.js
   ```
3. Abrir en el navegador `http://localhost:3000` (o el puerto que
   hayas usado) para ver el Dashboard.

No hay ningún paso de creación de base de datos: esta versión no usa
SQLite ni ningún motor de base de datos — ver sección 7.

## 3. Estructura de archivos

- **`server.js`** — Punto de entrada. Arranca Express, sirve el
  frontend estático desde `public/` (`express.static`), monta las
  rutas de la API en `/api/contactos` y levanta el servidor en el
  puerto configurado.
- **`contactosStore.js`** — Almacenamiento de datos **en memoria**
  (un array `let contactos = [...]`, sin base de datos). Expone las
  funciones `listarTodos`, `obtenerPorId`, `crear`, `actualizar`,
  `eliminar`, `resumenPorStatus` y la lista `STATUSES_VALIDOS`.
  Contiene los 9 contactos de ejemplo hardcodeados y el contador
  `siguienteId` para asignar ids nuevos.
- **`routes/contactos.js`** — Router de Express con los endpoints
  REST de `/api/contactos` (listar, obtener por id, crear, actualizar,
  eliminar, resumen), incluyendo la validación de `nombre`, `email`,
  `telefono` y `status` de cada request.
- **`public/index.html`** — Pantalla del Dashboard: título, total de
  contactos, gráfica de pastel dibujada a mano en SVG (sin librerías
  de gráficos) con un segmento por status, leyenda de colores y link
  a la pantalla de Contactos.
- **`public/contactos.html`** — Pantalla de gestión de contactos:
  formulario para agregar contacto, tabla con nombre/email/teléfono,
  un `<select>` de status por fila (cambia el status al instante) y
  botones de Editar/Eliminar por fila.
- **`package.json`** — Metadatos del proyecto, script `npm start` y
  la única dependencia real: `express`.
- **`.claude/agents/*.md`** — Definiciones de los agentes usados para
  construir este proyecto (planificador, arquitecto-datos,
  disenador-ux, fullstack, tester, revisor, documentacion, devops).
  No forman parte de la aplicación en sí.
- **`bitacora.md`** — Bitácora del ciclo de agentes que construyó el
  proyecto: decisiones de diseño, contrato de API acordado, pruebas
  realizadas y hallazgos de la revisión de código.
- **`README.md`** — Descripción inicial del ejercicio (contexto de
  cómo arrancó el repo).

## 4. Endpoints disponibles

Base URL: `/api/contactos`. Todas las respuestas de error usan el
formato `{ "error": "mensaje descriptivo" }`.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/contactos` | Lista todos los contactos |
| GET | `/api/contactos/resumen` | Devuelve el conteo de contactos por status |
| GET | `/api/contactos/:id` | Obtiene un contacto por id |
| POST | `/api/contactos` | Crea un contacto nuevo |
| PUT | `/api/contactos/:id` | Actualiza campos de un contacto existente |
| DELETE | `/api/contactos/:id` | Elimina un contacto |

> Nota de implementación: `/api/contactos/resumen` está registrada
> antes que `/api/contactos/:id` para que Express no interprete
> `"resumen"` como un id.

### GET /api/contactos

Request: sin body.

Respuesta `200 OK`:
```json
[
  { "id": 1, "nombre": "Ana Torres", "email": "ana.torres@example.com", "telefono": "555-0101", "status": "lead", "creadoEn": "2026-09-01T09:00:00.000Z" },
  { "id": 2, "nombre": "Bruno Martínez", "email": "bruno.martinez@example.com", "telefono": null, "status": "lead", "creadoEn": "2026-09-02T10:15:00.000Z" }
]
```

### GET /api/contactos/resumen

Request: sin body.

Respuesta `200 OK` (las tres claves siempre están presentes, incluso
en 0):
```json
{ "lead": 4, "aceptado": 3, "rechazado": 2 }
```

### GET /api/contactos/:id

Request: sin body. Ejemplo `GET /api/contactos/3`.

Respuesta `200 OK`:
```json
{ "id": 3, "nombre": "Carla Núñez", "email": "carla.nunez@example.com", "telefono": "555-0103", "status": "aceptado", "creadoEn": "2026-09-03T11:30:00.000Z" }
```

Errores:
- `400 Bad Request` si `:id` no es un entero: `{ "error": "id inválido" }`
- `404 Not Found` si no existe: `{ "error": "contacto no encontrado" }`

### POST /api/contactos

Request:
```json
{ "nombre": "Lucía Gómez", "email": "lucia.gomez@example.com", "telefono": "555-0110" }
```

Respuesta `201 Created` (si `status` se omite, el servidor asigna
`"lead"` por default; `id` y `creadoEn` los asigna siempre el
servidor):
```json
{ "id": 10, "nombre": "Lucía Gómez", "email": "lucia.gomez@example.com", "telefono": "555-0110", "status": "lead", "creadoEn": "2026-09-22T14:03:00.000Z" }
```

Errores `400 Bad Request`:
- `{ "error": "nombre es obligatorio" }`
- `{ "error": "email es obligatorio y debe tener formato válido" }`
- `{ "error": "status debe ser uno de: lead, aceptado, rechazado" }`
- `{ "error": "telefono debe ser una cadena de texto" }`

### PUT /api/contactos/:id

Actualización parcial: solo se cambian los campos enviados. Ejemplo
`PUT /api/contactos/3` para cambiar el status:

Request:
```json
{ "status": "rechazado" }
```

Respuesta `200 OK`:
```json
{ "id": 3, "nombre": "Carla Núñez", "email": "carla.nunez@example.com", "telefono": "555-0103", "status": "rechazado", "creadoEn": "2026-09-03T11:30:00.000Z" }
```

Errores:
- `400 Bad Request` si `:id` no es entero, o si `nombre`/`email`
  vienen vacíos, o `status` no es uno de los 3 valores válidos, o
  `telefono` no es string.
- `404 Not Found` si el id no existe: `{ "error": "contacto no encontrado" }`

### DELETE /api/contactos/:id

Request: sin body. Ejemplo `DELETE /api/contactos/3`.

Respuesta `204 No Content` (sin cuerpo).

Errores:
- `400 Bad Request` si `:id` no es entero: `{ "error": "id inválido" }`
- `404 Not Found` si no existe: `{ "error": "contacto no encontrado" }`

## 5. Modelo de datos

No hay tabla SQL: los contactos son objetos JavaScript planos dentro
de un array en memoria (`contactosStore.js`). Forma del objeto
`contacto`:

```js
{
  id: number,                                  // asignado por el servidor, nunca se reutiliza tras un delete
  nombre: string,                               // obligatorio
  email: string,                                // obligatorio, formato válido
  telefono: string | null,                      // opcional
  status: 'lead' | 'aceptado' | 'rechazado',    // default 'lead' si se omite al crear
  creadoEn: string,                             // ISO 8601, asignado por el servidor al crear
}
```

El módulo arranca con **9 contactos de ejemplo hardcodeados** (ids 1
a 9) y un contador `siguienteId` que empieza en `10` para los
contactos nuevos.

## 6. Cómo usar la interfaz

1. **Ver el dashboard**: abrir `http://localhost:3000/` (o
   `index.html`). Muestra el total de contactos y una gráfica circular
   con un segmento por status (amarillo = Lead, verde = Aceptado,
   rojo = Rechazado), con su leyenda.
2. **Ir a Contactos**: hacer click en el botón "Ver contactos" del
   dashboard, o abrir directamente `contactos.html`. Desde ahí se
   puede volver al dashboard con el link "Volver al Dashboard".
3. **Agregar un contacto**: completar Nombre y Email (obligatorios) y
   Teléfono (opcional) en el formulario de la parte superior y hacer
   click en "Agregar contacto". El contacto nuevo se crea con status
   `lead` por default; la tabla se actualiza automáticamente.
4. **Cambiar el status de un contacto**: elegir el nuevo valor en el
   `<select>` de la columna Status de la fila correspondiente. El
   cambio se guarda de inmediato (no requiere botón de confirmar). Si
   falla, el select vuelve al valor anterior y se muestra un aviso.
5. **Editar un contacto**: click en "Editar" en la fila; las celdas de
   Nombre, Email y Teléfono se vuelven editables in-place. Click en
   "Guardar" para confirmar (Nombre y Email siguen siendo
   obligatorios) o "Cancelar" para descartar los cambios.
6. **Eliminar un contacto**: click en "Eliminar" en la fila; aparece
   una confirmación nativa del navegador antes de borrar
   definitivamente el contacto.

## 7. Limitaciones conocidas

- **No hay base de datos real.** Esta versión guarda los contactos en
  un array en memoria del proceso de Node (`contactosStore.js`), sin
  SQLite ni ningún otro motor de base de datos.
- **No hay persistencia.** Los datos viven solo mientras el proceso
  del servidor sigue corriendo. Al reiniciar el servidor (o si se
  cae y se vuelve a levantar), los contactos **vuelven siempre a los
  9 contactos de ejemplo hardcodeados originales** y cualquier
  contacto creado, editado o eliminado durante la sesión anterior se
  pierde. Esto es un comportamiento esperado de esta versión, no un
  bug.
- **Sin autenticación.** Cualquiera que pueda acceder al servidor
  puede leer, crear, editar o eliminar contactos; no hay usuarios,
  login ni permisos.
- **Sin búsqueda ni paginación.** `GET /api/contactos` siempre
  devuelve la lista completa.
- **Pensado solo para pruebas/demo locales**, no para producción ni
  para manejar datos reales o sensibles.
- **Observaciones de la revisión de código no corregidas en esta
  corrida:** el revisor del proyecto dejó anotados hallazgos de
  manejo de errores y logging (los `catch` de `routes/contactos.js`
  no loguean el error antes de responder 500, falta un middleware de
  errores JSON global y un manejador 404 genérico en `server.js`).
  Quedan documentados como estado del proyecto, sin implementar en
  esta corrida — ver el detalle completo en `bitacora.md`, sección
  "6. revisor".
