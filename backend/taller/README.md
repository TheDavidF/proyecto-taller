# Backend del taller

Java 21 · Spring Boot 4.1.1 · MySQL. Ejecutar desde `backend/taller`.

## Preparación en Windows (PowerShell)

1. Crear la base ejecutando `database/database.sql` en MySQL **solo en una base nueva**. Si ya tienes la base, conserva tus datos y no vuelvas a crear las tablas.
2. Definir las variables en la terminal donde arrancará Java:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/taller_db"
$env:DB_USER="root"
$env:DB_PASSWORD="tu_clave_local"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
.\mvnw.cmd spring-boot:run
```

Linux/macOS: exportar las mismas variables y ejecutar `bash mvnw spring-boot:run`.
La API escucha en `http://localhost:8080/api`. `PORT` permite cambiar el puerto.
Hibernate valida las tablas existentes; no las modifica ni elimina.

## Contrato común

Los recursos son `perfiles`, `servicios`, `usuarios`, `vehiculos` y `ordenes`.

| Método y ruta relativa a /api | Resultado |
|---|---|
| GET /{recurso} | 200, arreglo de registros activos |
| GET /{recurso}?incluirInactivos=true | 200, todos los registros |
| GET /{recurso}/{id} | 200, un registro; 404 si no existe |
| POST /{recurso} | 201, registro creado |
| PUT /{recurso}/{id} | 200, reemplaza los campos editables |
| DELETE /{recurso}/{id} | 204, anula sin borrar |
| PUT /{recurso}/{id}/anular | 204, misma anulación |
| PUT /{recurso}/{id}/activar | 200, reactiva |

En PUT se envían todos los campos obligatorios; no es PATCH. Si se omite `estado`, conserva el valor existente. GET por ID también permite consultar registros inactivos. Las relaciones históricas se conservan: anular un catálogo no anula en cascada las órdenes ni otros catálogos. Para nuevas órdenes se requieren vehículo, usuario, perfil y servicios activos.

Los identificadores principales y `idOrden` dentro de cada detalle los determina el servidor. Las respuestas de usuarios son planas (`idPerfil`), ya no incluyen la entidad `perfil` anidada.

## Ejemplos JSON para POST

Crear primero perfil, servicio, vehículo y usuario; después la orden. Sustituir los IDs de ejemplo por los recibidos.

**/perfiles**
```json
{"nombre":"Administrador"}
```

**/servicios**
```json
{"nombre":"Cambio de aceite","precioBase":150.00}
```

**/vehiculos**
```json
{"placa":"P123ABC","marca":"Toyota","modelo":"2015","propietario":"David Cano","telefonoPropietario":"55555555"}
```

**/usuarios**
```json
{"idPerfil":1,"nombre":"David Cano","usuario":"david","contrasena":"UnaClave123","correo":"david@example.com"}
```

La contraseña requiere al menos 8 caracteres y como máximo 72 bytes UTF-8. Se almacena con BCrypt y nunca se devuelve, tampoco su hash. En PUT omitir `contrasena` para conservarla o enviar una nueva para cambiarla. Los registros previos no se convierten automáticamente: para reemplazar una clave anterior, actualizarla por este endpoint. Esta API no implementa login, sesiones ni autorización; perfiles son un catálogo, no permisos de acceso aplicados. No publicar la API en Internet sin implementar esos controles.

**/ordenes**
```json
{
  "idVehiculo":1,
  "idUsuario":1,
  "fechaIngreso":"2026-10-19",
  "fechaEntrega":null,
  "estadoOrden":"PENDIENTE",
  "detalles":[
    {"idServicio":1,"precioAplicado":150.00,"observaciones":"Usar aceite 10W-30"}
  ]
}
```

Estados de trabajo admitidos: `PENDIENTE`, `EN_PROCESO`, `FINALIZADA`, `ENTREGADA`. Se puede cambiar entre ellos mediante PUT; no se impone un flujo secuencial. `estado` es independiente e indica si el registro está activo. Los datos históricos con otras etiquetas siguen siendo consultables; al editar debe enviarse una etiqueta admitida.

El total enviado por el cliente se ignora: se suman los precios aplicados de los detalles activos. Los precios aplicados pueden diferir del precio base (cotización del trabajo), pero deben ser no negativos y tener hasta dos decimales. El total máximo es 99,999,999.99. La orden requiere al menos un detalle activo y fecha de entrega igual o posterior al ingreso.

Al editar una orden, enviar la lista completa de detalles deseados: conservar `idDetalleOrden` de los existentes, omitirlo para los nuevos y quitar de la lista los que deban eliminarse. Un ID ajeno o repetido devuelve 400. Los detalles omitidos se eliminan físicamente dentro de la transacción; la anulación de la orden, en cambio, conserva todos los detalles. No hay endpoint independiente de detalles.

## Errores

400: validación o JSON incorrecto; 404: registro o relación inexistente; 409: duplicado o relación inactiva.

```json
{"fecha":"2026-10-20T00:00:00Z","status":400,"mensaje":"Revisa los campos enviados","ruta":"/api/servicios","errores":{"precioBase":"debe ser mayor o igual que 0.00"}}
```

El frontend puede usar `error.response.data.mensaje` y `errores` para mostrar avisos junto a cada campo. No intentar leer JSON al recibir 204.

## Pruebas

```powershell
.\mvnw.cmd test
```

Las pruebas usan H2 aislado y no acceden a tu MySQL. Verifican HTTP real, validación, anulación, BCrypt, CORS, actualización de detalles y rollback. Para una comprobación adicional con MySQL de prueba, establecer `TEST_DB_URL`, `TEST_DB_USER`, `TEST_DB_PASSWORD`, `TEST_DB_DRIVER=com.mysql.cj.jdbc.Driver`. **Las pruebas borran y recrean las tablas de esa base; jamás apuntar a datos reales.**

Las pruebas de integración pueden ejecutarse con `-Dtest=ApiIntegrationTests`. En Linux/macOS usar `bash mvnw` en los comandos equivalentes.

## Conexión desde React

En `frontend/frontend-taller/.env`:
```dotenv
VITE_API_URL=http://localhost:8080
```

Crear una instancia Axios con esa base y consultar, por ejemplo, `/api/servicios`. Axios y React Router deben instalarse dentro de `frontend/frontend-taller`, donde está la aplicación, no en la carpeta superior. Si Vite usa otro puerto, agregar su origen a `CORS_ALLOWED_ORIGINS` y reiniciar el backend.

## Cambios respecto al backend anterior

- DELETE ahora anula; ya no borra físicamente los catálogos ni órdenes.
- Los listados excluyen inactivos de forma predeterminada.
- Usuarios y vehículos reciben/devuelven DTO; usuario recibe `idPerfil`.
- PUT de perfiles y servicios es explícito y comprueba existencia.
- Las respuestas de usuario excluyen contraseña y hash.
- Las órdenes conservan los IDs de detalles presentes en PUT.

Las placas se comprueban por aplicación; la tabla actual no tiene restricción UNIQUE de placa, por lo que inserciones simultáneas requieren una migración adicional si se necesita esa garantía. Usuario sí tiene una restricción UNIQUE en el esquema original. La comprobación de placas incluye registros inactivos.
