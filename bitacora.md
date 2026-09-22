# Bitácora — CRM básico (ciclo de agentes)

## 1. planificador
## Etapa actual del ciclo

El repo (`/home/user/crm-contactos-agentes`) está vacío salvo `README.md` y `.claude/agents/*.md`. No hay ningún archivo de proyecto todavía. Etapa que sigue: **arquitectura de datos** (adaptada a memoria, no SQL) → diseño UX → construcción fullstack → pruebas → revisión → documentación → empaquetado local.

## ⚠️ Aviso de override para esta corrida (léanlo antes de ejecutar cualquier agente)

Los archivos `.claude/agents/arquitecto-datos.md`, `.claude/agents/fullstack.md` y `.claude/agents/devops.md` tal como están guardados en el repo **piden SQLite / `better-sqlite3` / `CREATE TABLE`**. Para esta corrida esa parte de sus propias definiciones queda **anulada explícitamente** por la excepción de alcance que me diste: no hay base de datos real, todo vive en un array en memoria dentro del proceso de Node, y los datos no persisten entre reinicios (esto es esperado, no un bug). Cada agente abajo debe ignorar la sección de SQL de su propio prompt y seguir las tareas concretas que le doy aquí en su lugar. Todo lo demás del alcance (Node.js + Express puro, JS vanilla, campos nombre/email/telefono/status, dashboard con gráfica circular) se mantiene sin cambios.

## Punto de alcance no claro (no lo resuelvo por mi cuenta)

El alcance que definiste solo pide los campos **nombre, email, telefono, status**. No se pidió un campo de timestamp de creación. La versión previa del agente `arquitecto-datos.md` incluía `creado_en` por iniciativa propia al diseñar para SQL — eso no está en tu alcance declarado. Se lo dejo como decisión explícita al arquitecto-datos abajo, en vez de asumir que debe incluirse o excluirse.

---

## 1. arquitecto-datos (siguiente agente a correr)

Entregable: forma exacta de los datos en memoria + contrato de API. Nada de SQL, nada de `CREATE TABLE`, nada de índices.

1. Define la forma del objeto `contacto` en JS plano: `{ id: number, nombre: string, email: string, telefono: string|null, status: 'lead'|'aceptado'|'rechazado' }`. Decide explícitamente si agrega o no un campo de timestamp de creación (no está pedido en el alcance — si lo agrega, debe justificarlo como decisión propia y dejarlo anotado, no como parte del alcance del planificador).
2. Define el módulo de almacenamiento en memoria (nombre de archivo sugerido: `contactosStore.js`, pero el arquitecto puede proponer otro): un array mutable (`let contactos = [...]`) con **8 a 10 contactos de ejemplo hardcodeados**, cubriendo una mezcla de los 3 status (al menos 2 de cada uno) para que el dashboard tenga datos variados desde el arranque.
3. Define la estrategia de asignación de `id`: contador incremental en memoria (ej. `let siguienteId`), empezando en un valor fijo, que nunca se reutiliza tras un `delete`.
4. Define las funciones que expone el módulo de almacenamiento (firma exacta, sin implementarlas): listar todos, obtener por id, crear, actualizar, eliminar, y un resumen de conteo por status.
5. Define el contrato completo de la API REST que el fullstack debe implementar, con método, ruta, body esperado, status codes y forma de la respuesta para cada caso (éxito y error):
   - `GET /api/contactos`
   - `GET /api/contactos/:id`
   - `POST /api/contactos`
   - `PUT /api/contactos/:id`
   - `DELETE /api/contactos/:id`
   - `GET /api/contactos/resumen` — debe devolver conteo de los 3 status, incluyendo los que estén en 0 (para que el dashboard siempre pinte los 3 segmentos aunque falte algún status).
6. Especifica reglas de validación exactas: `nombre` y `email` obligatorios; `telefono` opcional; `status` debe ser uno de los 3 valores exactos o la petición se rechaza con 400; qué pasa si `status` no se manda en el `POST` (¿default `lead`? dejarlo explícito).
7. Deja anotado, solo como nota para mí (planificador) y no para construir ahora: si el proyecto migrara después a una base de datos real, qué cambiaría en este contrato — sin construir nada de eso.

## 2. disenador-ux

Corre después de arquitecto-datos, usando su contrato de campos (no cambia por ser memoria en vez de SQL).

1. Pantalla Dashboard: título, conteo total de contactos, gráfica circular (SVG o canvas dibujado a mano, sin librerías) con un segmento por status usando el conteo de `GET /api/contactos/resumen`, colores sugeridos por status (ej. amarillo=lead, verde=aceptado, rojo=rechazado) y ubicación de la leyenda. Navegación hacia la pantalla de contactos.
2. Pantalla Contactos: tabla con columnas nombre, email, teléfono, status, acciones (editar/eliminar), usando exactamente los campos definidos por arquitecto-datos.
3. Formulario para agregar contacto: ubicación en la pantalla, qué campos son obligatorios (nombre, email) y cuáles no (teléfono), qué pasa si falta un obligatorio.
4. Mecanismo para cambiar el status de un contacto existente (dropdown en la fila u otro, el más simple de implementar en JS vanilla).
5. Confirmación antes de eliminar un contacto.
6. Sin animaciones, sin librerías de diseño — texto estructurado, no mockup visual.

## 3. fullstack

Corre después de disenador-ux. Debe construir sobre el array en memoria del arquitecto-datos, sin SQLite ni ningún motor de base de datos.

1. `server.js`: arranca Express, sirve el frontend estático (`express.static`), monta las rutas de contactos.
2. Módulo de datos en memoria (nombre exacto que definió arquitecto-datos, ej. `contactosStore.js`): implementa el array hardcodeado con los 8-10 contactos y las funciones que definió arquitecto-datos. **No usar `better-sqlite3`, `sqlite3` ni ningún paquete de base de datos.**
3. `routes/contactos.js`: implementa exactamente el contrato de API entregado por arquitecto-datos (rutas, status codes, validaciones), usando el módulo de datos en memoria.
4. Validación de body en cada ruta de escritura según lo que definió arquitecto-datos (nombre/email obligatorios, status limitado a los 3 valores).
5. Manejo de errores con try/catch y status codes correctos (201 al crear, 400 en validación, 404 si el id no existe, 204 o 200 en delete según lo que haya definido arquitecto-datos).
6. Frontend: `public/index.html` (dashboard) y `public/contactos.html` (gestión de contactos), siguiendo exactamente las pantallas del disenador-ux. La gráfica circular se dibuja a mano con `<canvas>` o SVG — nada de Chart.js ni librerías externas de gráficas. Nada de React/Vue.
7. El frontend consume la API vía `fetch` contra las rutas del backend.
8. No agregar persistencia a disco, no agregar autenticación, no agregar paginación/búsqueda — no están en el alcance.

## 4. tester

Corre después de fullstack, sobre el código ya construido.

1. Verificar que `node server.js` levante sin errores.
2. Probar cada endpoint según el contrato de arquitecto-datos: crear válido (201), crear con status inválido (400, no se guarda), crear sin nombre o sin email (400, no se guarda), listar (array correcto), `GET /api/contactos/resumen` (el conteo coincide con el array en memoria del servidor en ese momento), actualizar status (el resumen refleja el cambio después), eliminar (ya no aparece en la lista ni en el resumen).
3. Confirmar explícitamente que al reiniciar el servidor los datos vuelven a los 8-10 contactos hardcodeados originales (es decir, que no hay ningún intento de persistencia a disco).
4. Confirmar que los ids no se repiten después de un delete seguido de un create nuevo.
5. Si el frontend es accesible, verificar que el dashboard muestre la gráfica con los 3 segmentos y que el formulario de contactos funcione.
6. Reportar cada fallo con: qué esperabas, qué pasó, en qué archivo está el problema. No corregir código. Si todo pasa: "LISTO — todos los casos pasaron" con resumen breve.

## 5. revisor

Corre después del tester. Solo lee código (`Read`, `Grep`, `Glob`), no lo edita.

1. Validación de entrada: rutas que no validan el body antes de usarlo, o que aceptan un status fuera de los 3 valores.
2. Manejo de errores: promesas sin try/catch, errores tragados sin loguear.
3. Códigos de estado HTTP correctos en cada caso.
4. Buenas prácticas de frontend vanilla: JS mezclado en HTML sin necesidad, listeners no limpiados, fetch sin manejo de error.
5. Confirmar que no haya quedado ningún resto de SQL, `better-sqlite3`, `sqlite3` u otro motor de base de datos en el código o en `package.json` — para esta corrida es un hallazgo a reportar si aparece, no una preferencia de estilo.
6. Responder "LISTO" o "SEGUIR: <lista con archivo y qué corregir>".

## 6. documentacion

Corre después de que el revisor dé LISTO. Genera `DOCUMENTACION.md`:

1. Qué es el proyecto (2-3 líneas).
2. Instalación: `npm install`, cómo se levanta el servidor. **No incluir ningún paso de creación de base de datos** — no aplica en esta versión.
3. Estructura de archivos: qué hace cada archivo/carpeta.
4. Endpoints disponibles: tabla con método, ruta, qué hace, ejemplo de request/response, tomado del contrato real implementado.
5. Modelo de datos: la forma del objeto `contacto` en memoria y sus campos (no una tabla SQL).
6. Cómo usar la interfaz: agregar contacto, cambiar status, ver el dashboard.
7. Limitaciones conocidas: dejar anotado explícitamente que esta versión usa un **array en memoria sin persistencia** — los datos se reinician a los valores hardcodeados en cada reinicio del servidor, no hay base de datos real, no hay autenticación, es solo para pruebas locales.

## 7. devops

Corre en paralelo con o después de documentación.

1. `package.json` con `npm start` → `node server.js`. Dependencias: solo `express` (y lo que el fullstack haya usado realmente). **No incluir `better-sqlite3` ni `sqlite3`.**
2. `.gitignore` básico: `node_modules/`, `.env` si existe. No hace falta ignorar ningún archivo `.db` — no existe ninguno en esta versión.
3. Opcional: `Dockerfile` simple para levantar el proyecto con `docker build` + `docker run`.
4. Verificar que no haya credenciales ni rutas absolutas de máquina hardcodeadas.
5. Nada de configuración de nube ni CI/CD — fuera de alcance.

---

Archivos relevantes ya existentes: `/home/user/crm-contactos-agentes/README.md`, `/home/user/crm-contactos-agentes/.claude/agents/*.md`. Ningún archivo de proyecto (`server.js`, `public/`, etc.) existe todavía — el arquitecto-datos es quien debe empezar.
