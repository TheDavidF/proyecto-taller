import axios from "axios";
export const moneda = (valor: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    valor,
  );
export const fecha = (valor: string | null) =>
  valor ? valor.split("-").reverse().join("/") : "Sin definir";
export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function mensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data;
    if (datos?.errores && typeof datos.errores === "object") {
      const texto = Object.entries(datos.errores)
        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
        .join(". ");
      if (texto) return texto;
    }
    return typeof datos?.mensaje === "string"
      ? datos.mensaje
      : error.response
        ? "No se pudo completar la operación."
        : "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}
export const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
