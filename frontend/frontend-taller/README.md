# Frontend del taller

React + TypeScript + Vite + Tailwind CSS + Axios + React Router.

## Ejecutar

Desde esta carpeta:

```powershell
npm ci
```

Si no existe `.env`, copiar `.env.example` a `.env`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

La variable es `VITE_API_URL=http://localhost:8080`. No agregar `/api` al final. Reiniciar Vite después de cambiarla. El backend debe estar funcionando y aceptar CORS para http://localhost:5173. El puerto de Vite está fijado en 5173 para coincidir con la configuración del backend.

Usar Node.js 22.12 o posterior compatible con Vite 8 (también funciona Node 24). Este paquete no modifica el backend ni crea datos automáticamente.

Linux/macOS, desde `frontend/frontend-taller`:

```bash
npm ci
if [ ! -f .env ]; then cp .env.example .env; fi
npm run dev
```

`.env.example` está versionado y permitido por `.gitignore`; `.env` y sus valores locales permanecen ignorados. No incluir credenciales en variables `VITE_*`: se publican en el navegador.

## Módulos incluidos

- Inicio y navegación adaptable a pantallas pequeñas.
- Perfiles: listar, buscar, crear, editar, anular y reactivar.
- Usuarios: selección de perfil activo, crear, editar sin cambiar contraseña si se deja vacía, anular y reactivar.
- Vehículos: placa, marca, modelo, propietario, teléfono; CRUD y estados.
- Servicios: nombre y precio base; CRUD y estados.
- Órdenes: vehículo, responsable con perfil activo, fechas, estado de trabajo, varios servicios, precios y observaciones editables; total, listado, búsqueda, filtro por trabajo, detalle, edición, anulación y reactivación.
- Reportes: órdenes relacionadas con vehículo, propietario y responsable; órdenes con servicios, precios aplicados, observaciones y estado de cada detalle; usuarios relacionados con perfiles. Filtros por fecha de ingreso y estado de trabajo/anulación para órdenes, y búsqueda e inclusión de inactivos para usuarios.

## Exportaciones

Los cinco listados (Perfiles, Usuarios, Vehículos, Servicios y Órdenes) y los tres reportes permiten un menú **Exportar** con **Vista previa**, **Descargar documento** (PDF) y **Exportar a Excel**. El PDF se genera con jsPDF y AutoTable; XLSX es un libro real de ExcelJS con importes numéricos. Las bibliotecas se cargan al solicitar una exportación.

Las exportaciones utilizan las mismas filas filtradas que la pantalla e incluyen la búsqueda, los estados y las fechas aplicables. Las referencias inactivas siguen disponibles para consultar los registros relacionados. No se exportan formularios, contraseñas ni hashes. Los botones se deshabilitan durante la carga, ante errores o sin resultados.

La vista previa abre el mismo PDF de la descarga en una pestaña nueva, mediante el visor del navegador. Para documentos grandes, la generación puede tardar unos segundos.

El reporte **Órdenes con servicios** reutiliza los filtros del reporte de órdenes. Incluye todos los detalles de las órdenes seleccionadas y distingue los inactivos (no suman). El total de cada orden figura **una sola vez**, en la primera fila de sus detalles. El resumen suma únicamente las órdenes activas, una vez por orden; si se incluyen anuladas, sus importes se muestran como información y quedan fuera de ese resumen. Los totales no representan pagos ni utilidades.

**Imprimir** imprime los reportes visibles con sus filtros. No se necesitan endpoints nuevos: los reportes usan los DTO existentes de órdenes, vehículos, usuarios, servicios y perfiles.

## Orden para registrar datos

1. Crear un perfil, por ejemplo Administrador.
2. Crear un usuario asociado al perfil.
3. Crear un vehículo.
4. Crear uno o varios servicios con sus precios base.
5. Ir a Órdenes, elegir vehículo y responsable, pulsar Agregar servicio, elegir el servicio y guardar.
6. Verificar el detalle y el total; probar edición, anulación y reactivación con una orden de práctica.
7. Revisar Reportes.

Los datos se guardan en tu MySQL a través de la API. No se usan registros simulados ni localStorage para reemplazar la base.

## Particularidades de órdenes

- Cada fila de servicio permite cambiar precio y observaciones directamente.
- "Incluir en el total" corresponde al campo `estado` del detalle. Los detalles desmarcados se guardan como inactivos y no suman.
- Se exige al menos un detalle activo.
- El servidor vuelve a calcular el total; el frontend no envía el total como autoridad.
- Al editar se conservan los IDs de los detalles existentes.
- Quitar un detalle de una orden y guardar lo elimina de esa orden. Anular la orden conserva todo su historial.
- Un vehículo, usuario/perfil o servicio inactivo no puede usarse al guardar una orden. El formulario muestra la referencia histórica y permite sustituirla por una activa.
- El estado de trabajo admite PENDIENTE, EN_PROCESO, FINALIZADA y ENTREGADA. La anulación es un estado independiente y no cambia el trabajo.

## Arquitectura

```text
src/
  api/          instancia de Axios
  types/        interfaces TypeScript
  services/     funciones para los endpoints
  hooks/        lógica reutilizada por los catálogos
  components/   paneles, etiquetas, mensajes y estilos comunes
  pages/        pantallas completas
  utils/        fechas, moneda y mensajes de error
```

`useCatalogo` evita repetir las mismas operaciones en Perfiles, Usuarios, Vehículos y Servicios. Cada pantalla mantiene su formulario, validaciones y columnas. Órdenes tiene su propia lógica por manejar varios detalles.

## Paleta

- Crema #F5EBDD: fondo.
- Coral #F2765E: anulación y acentos.
- Azul #315B8C: navegación y acciones principales.
- Café #413333: textos.

Los colores se definen en `src/index.css` y las clases compartidas en `src/components/estilos.ts`.

## Comprobaciones

```powershell
npm run build
npm run lint
```

No se agregan pruebas automatizadas al frontend. El backend conserva sus pruebas existentes con H2: desde `backend/taller`, ejecutar `bash mvnw test` (o `.\mvnw.cmd test` en PowerShell).

Para revisar manualmente las exportaciones en una base de práctica: filtrar un listado, incluir/excluir inactivos y comparar las filas del PDF y XLSX con la tabla; abrir la vista previa; comprobar una orden con varios detalles activos/inactivos y verificar que su total aparece una sola vez en el reporte detallado. Probar un filtro sin resultados y un intervalo inválido. No usar datos reales ni apuntar las pruebas de backend a una base que quieras conservar.

## Alcance

Este frontend corresponde al backend preparado en esta conversación: rutas `/api/perfiles`, `/api/usuarios`, `/api/vehiculos`, `/api/servicios`, `/api/ordenes`, parámetro `incluirInactivos` y operaciones `/anular` y `/activar`.

No implementa autenticación, sesiones ni autorización: el backend actual tampoco tiene endpoints de login. Perfiles es un catálogo de asignación de usuarios, no un sistema de permisos. No se agregaron pantallas de login que aparenten proteger la API.

No subir `.env`, `node_modules` ni `dist`. El archivo `.env.example` sí se puede compartir. Conserva `package-lock.json` para instalar las mismas versiones.
