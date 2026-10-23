# Publicación en Render con MySQL de Aiven

La imagen Docker compila React y lo incluye en Spring Boot. Ambos se sirven bajo la misma
URL HTTPS. Para desarrollo local se conservan Vite en 5173 y Spring Boot en 8080.

## Base de datos

Antes del despliegue, importar estructura y datos en `defaultdb` de Aiven.
La aplicación valida el esquema; no crea, borra ni modifica las tablas.
Conservar una copia local de la base. La sesión del login se pierde al reiniciar el servicio;
los datos siguen en Aiven.

## Crear el servicio

En Render, crear **New → Web Service**, conectar `TheDavidF/proyecto-taller` y seleccionar
la rama `feature/despliegue-render`.

| Campo | Valor |
|---|---|
| Language / Runtime | Docker |
| Root Directory | Vacío (raíz del repositorio) |
| Dockerfile Path | `./Dockerfile` |
| Instance Type | Free |
| Health Check Path | `/api/health` |

No se necesitan Build Command ni Start Command: los define el Dockerfile.

## Variables de entorno de Render

| Variable | Valor |
|---|---|
| `DB_URL` | `jdbc:mysql://HOST_AIVEN:PUERTO/defaultdb` |
| `DB_USER` | Usuario de MySQL en Aiven (normalmente `avnadmin`) |
| `DB_PASSWORD` | Contraseña del servicio de MySQL |

`HOST_AIVEN` y `PUERTO` se copian de Connection information. No usar la URI `mysql://`:
Java requiere el prefijo `jdbc:mysql://`. No poner usuario o contraseña dentro de la URL.
El perfil `prod`, las cookies Secure y la verificación TLS se configuran en la imagen.
Render proporciona `PORT` automáticamente. No establecer `VITE_API_URL` para esta imagen:
React consulta `/api` desde su propio dominio.

## Certificado CA

En la configuración del servicio de Render, agregar un **Secret File**:

- Filename: `ca.pem`.
- Contents: contenido completo del certificado CA descargado de Aiven, incluidas las líneas
  `-----BEGIN CERTIFICATE-----` y `-----END CERTIFICATE-----`.

Render lo monta como `/etc/secrets/ca.pem`. El arranque crea un almacén de confianza
con esa CA y MySQL usa `VERIFY_IDENTITY` para comprobar certificado y nombre del servidor.
El archivo solo contiene un certificado público. `changeit` protege este almacén temporal
sin claves privadas y no es la contraseña de MySQL.
No guardar contraseñas ni archivos de conexión en GitHub.

## Comprobación

Crear el servicio y esperar a que termine el despliegue. Abrir su URL HTTPS, iniciar sesión
con una cuenta importada activa de perfil Administrador o Empleado, recargar `/ordenes`,
guardar una orden y comprobar PDF/Excel. Si ya se importaron las cuentas, no definir
`ADMIN_USER` ni `ADMIN_PASSWORD`.

El plan Free de Render puede suspenderse por inactividad. Su arranque vuelve a conectar con
MySQL y exige iniciar sesión nuevamente si el proceso se reinició.

Si falla: revisar los logs sin publicar contraseñas. Un error de validación de Hibernate
normalmente indica tablas incompletas o una base distinta de la que se importó.
