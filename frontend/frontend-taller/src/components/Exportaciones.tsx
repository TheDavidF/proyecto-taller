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
  async function exportar(tipo: "pdf" | "vista" | "xlsx") {
    const ventana = tipo === "vista" ? window.open("", "_blank") : null;
    if (ventana) ventana.opener = null;
    setOcupado(true);
    setError("");
    try {
      const { generarPDF, generarExcel, descargar } =
        await import("../utils/exportaciones");
      if (tipo === "xlsx")
        descargar(await generarExcel(tabla), `${tabla.archivo}-${hoy()}.xlsx`);
      else {
        const pdf = generarPDF(tabla);
        if (tipo === "vista") {
          if (!ventana) throw new Error("Permite abrir ventanas para ver el documento.");
          const url = URL.createObjectURL(pdf.output("blob"));
          setVista(url);
          ventana.location.replace(url);
        }
        else descargar(pdf.output("blob"), `${tabla.archivo}-${hoy()}.pdf`);
      }
    } catch (e) {
      ventana?.close();
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  const disabled = deshabilitado || ocupado || tabla.filas.length === 0;
  return (
    <div className="no-print mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <details className="relative">
          <summary className={`${boton} cursor-pointer list-none`}>Exportar</summary>
          <div className="absolute left-0 z-20 mt-2 flex min-w-48 flex-col gap-2 rounded-lg border border-cafe/10 bg-white p-2 shadow-lg">
            {([
              ["vista", "Vista previa"],
              ["pdf", "Descargar documento"],
              ["xlsx", "Exportar a Excel"],
            ] as const).map(([tipo, texto]) => (
              <button key={tipo} type="button" className={secundario}
                disabled={disabled} onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  void exportar(tipo);
                }}>{texto}</button>
            ))}
          </div>
        </details>
        {ocupado && <span role="status">Preparando documento...</span>}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
