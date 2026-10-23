# Frontend del taller

React + TypeScript + Vite + Tailwind CSS + Axios + React Router.

## Ejecutar

Desde esta carpeta:

```powershell
npm install
```

Si no existe `.env`, copiar `.env.example` a `.env`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

La variable es `VITE_API_URL=http://localhost:8080`. No agregar `/api` al final. Reiniciar Vite después de cambiarla. El backend debe estar funcionando y aceptar CORS para http://localhost:5173. El puerto de Vite está fijado en 5173 para coincidir con la configuración del backend.

Usar Node.js 22.12 o posterior compatible con Vite 8 (también funciona Node 24). Este paquete no modifica el backend ni crea datos automáticamente.

## Módulos incluidos

- Inicio y navegación adaptable a pantallas pequeñas.
- Perfiles: listar, buscar, crear, editar, anular y reactivar.
- Usuarios: selección de perfil activo, crear, editar sin cambiar contraseña si se deja vacía, anular y reactivar.
- Vehículos: placa, marca, modelo, propietario, teléfono; CRUD y estados.
- Servicios: nombre y precio base; CRUD y estados.
- Órdenes: vehículo, responsable con perfil activo, fechas, estado de trabajo, varios servicios, precios y observaciones editables; total, listado, búsqueda, filtro por trabajo, detalle, edición, anulación y reactivación.
- Reportes: filtro por fecha de ingreso y estado, total de órdenes activas filtradas, exportación CSV e impresión/guardar PDF desde el navegador.

La exportación CSV se puede abrir con Excel, pero no es un archivo XLSX. El PDF se guarda usando el diálogo de impresión del navegador. Los totales de órdenes no representan pagos ni utilidades; el modelo actual no tiene un módulo de cobros.

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

No se incluyen archivos de pruebas automatizadas. La compilación y la revisión de código no reemplazan la comprobación manual con tu MySQL.

## Alcance

Este frontend corresponde al backend preparado en esta conversación: rutas `/api/perfiles`, `/api/usuarios`, `/api/vehiculos`, `/api/servicios`, `/api/ordenes`, parámetro `incluirInactivos` y operaciones `/anular` y `/activar`.

No implementa autenticación, sesiones ni autorización: el backend actual tampoco tiene endpoints de login. Perfiles es un catálogo de asignación de usuarios, no un sistema de permisos. No se agregaron pantallas de login que aparenten proteger la API.

No subir `.env`, `node_modules` ni `dist`. El archivo `.env.example` sí se puede compartir. Conserva `package-lock.json` para instalar las mismas versiones.
