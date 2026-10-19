# Servivio_Comedor

Sistema de solicitudes de comedor del CTP Cañas. Incluye ficha 2027 editable para impresión, consulta local de PDF y estadísticas por nivel, categoría socioeconómica y género.

## Página web

En Settings → Pages, seleccione Deploy from a branch, rama main y carpeta / (root). La dirección esperada es https://marcitica.github.io/Servivio_Comedor/ una vez activado GitHub Pages.

- `index.html`: solicitud original y enlaces a ficha e informes.
- `ficha2027.html`: espacios editables e impresión de la ficha 2027. La paginación puede diferir del Word original.
- Los PDF cargados en esa página se consultan en el navegador y se pueden imprimir. No se almacenan en línea. Los cambios de la ficha se conservan mediante imprimir / guardar PDF.
- `informes.html`: estadísticas y notificaciones de solicitudes aceptadas; requiere el backend y credenciales docentes.

## Servidor y datos

GitHub Pages no ejecuta Node ni MongoDB. Las operaciones de registro, solicitudes e informes necesitan el backend original. Actualmente sus llamadas apuntan a `http://localhost:3000`; para producción se debe alojar el backend en HTTPS y configurar esas direcciones. La recepción centralizada de expedientes no está desplegada.

Para ejecutar localmente, configure `backend/.env` con MONGO_URI, EMAIL_USER y EMAIL_PASS; luego ejecute `npm install` y `npm start` dentro de backend. Mantenga su base de datos y uploads originales. No publique credenciales ni expedientes en este repositorio.

Se verificaron la sintaxis y los límites de clasificación. La conexión a MongoDB y la paginación de impresión quedan pendientes de validación en el entorno institucional.
