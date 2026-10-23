import { useEffect, useState } from "react";
import type { TablaExportacion } from "../utils/exportaciones";
import { boton, secundario } from "./estilos";
import { hoy, mensajeError } from "../utils/formato";

export default function Exportaciones({
  tabla,
  deshabilitado = false,
}: {
  tabla: TablaExportacion;
  deshabilitado?: boolean;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [vista, setVista] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (vista) URL.revokeObjectURL(vista);
    },
    [vista],
  );
  useEffect(() => {
    if (!vista) return;
    const cerrar = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVista(null);
    };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [vista]);
  async function exportar(tipo: "pdf" | "vista" | "xlsx") {
    setOcupado(true);
    setError("");
    try {
      const { generarPDF, generarExcel, descargar } =
        await import("../utils/exportaciones");
      if (tipo === "xlsx")
        descargar(await generarExcel(tabla), `${tabla.archivo}-${hoy()}.xlsx`);
      else {
        const pdf = generarPDF(tabla);
        if (tipo === "vista") setVista(URL.createObjectURL(pdf.output("blob")));
        else descargar(pdf.output("blob"), `${tabla.archivo}-${hoy()}.pdf`);
      }
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  const disabled = deshabilitado || ocupado || tabla.filas.length === 0;
  return (
    <div className="no-print mb-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={boton}
          disabled={disabled}
          onClick={() => void exportar("pdf")}
        >
          Descargar PDF
        </button>
        <button
          type="button"
          className={secundario}
          disabled={disabled}
          onClick={() => void exportar("vista")}
        >
          Vista previa PDF
        </button>
        <button
          type="button"
          className={secundario}
          disabled={disabled}
          onClick={() => void exportar("xlsx")}
        >
          Descargar Excel XLSX
        </button>
        {ocupado && <span role="status">Preparando documento...</span>}
      </div>
      {error && <p role="alert">{error}</p>}
      {vista && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa PDF"
          className="fixed inset-0 z-50 flex flex-col gap-3 bg-crema p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-azul">Vista previa PDF</h2>
            <button
              autoFocus
              type="button"
              className={secundario}
              onClick={() => setVista(null)}
            >
              Cerrar vista previa
            </button>
          </div>
          <p className="text-sm">
            Si tu navegador no muestra el documento, utiliza Descargar PDF.
          </p>
          <iframe
            title="Documento PDF"
            src={vista}
            className="min-h-0 w-full flex-1 border border-cafe/20 bg-white"
          />
        </div>
      )}
    </div>
  );
}
