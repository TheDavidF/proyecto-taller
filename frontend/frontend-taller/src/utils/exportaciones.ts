import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { hoy } from "./formato";

export interface TablaExportacion {
  titulo: string;
  archivo: string;
  filtros: string;
  columnas: { titulo: string; moneda?: boolean }[];
  filas: (string | number | null)[][];
  resumen?: string;
}

export function generarPDF(tabla: TablaExportacion) {
  const doc = new jsPDF({
    orientation: tabla.columnas.length > 5 ? "landscape" : "portrait",
  });
  const ancho = doc.internal.pageSize.getWidth() - 28;
  doc.setTextColor("#315B8C");
  doc.setFontSize(16);
  doc.text(tabla.titulo, 14, 16);
  doc.setTextColor("#413333");
  doc.setFontSize(9);
  const notas = doc.splitTextToSize(
    `Fecha: ${hoy()} · ${tabla.filtros}${tabla.resumen ? ` · ${tabla.resumen}` : ""}`,
    ancho,
  );
  doc.text(notas, 14, 24);
  autoTable(doc, {
    startY: 28 + notas.length * 4,
    margin: { left: 14, right: 14, bottom: 16 },
    head: [tabla.columnas.map((c) => c.titulo)],
    body: tabla.filas.map((fila) =>
      fila.map((valor, i) =>
        valor === null
          ? ""
          : tabla.columnas[i].moneda
            ? Number(valor).toFixed(2)
            : String(valor),
      ),
    ),
    styles: {
      fontSize: tabla.columnas.length > 8 ? 7 : 9,
      cellPadding: 2,
      textColor: "#413333",
      overflow: "linebreak",
    },
    headStyles: { fillColor: "#315B8C", textColor: "#FFFFFF" },
    alternateRowStyles: { fillColor: "#F5EBDD" },
  });
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`${i} / ${paginas}`, 14, doc.internal.pageSize.getHeight() - 7);
  }
  return doc;
}

export async function generarExcel(tabla: TablaExportacion) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet("Reporte");
  hoja.addRow([tabla.titulo]).font = {
    bold: true,
    size: 16,
    color: { argb: "FF315B8C" },
  };
  hoja.addRow([`Fecha: ${hoy()}`]);
  hoja.addRow([tabla.filtros]);
  if (tabla.resumen) hoja.addRow([tabla.resumen]);
  hoja.addRow([]);
  const cabecera = hoja.addRow(tabla.columnas.map((c) => c.titulo));
  cabecera.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF315B8C" },
    };
  });
  tabla.filas.forEach((datos, i) => {
    const fila = hoja.addRow(datos);
    fila.eachCell((celda, j) => {
      // User text is always a string, never an Excel formula object.
      celda.font = { color: { argb: "FF413333" } };
      celda.alignment = { vertical: "top", wrapText: true };
      if (tabla.columnas[j - 1].moneda) celda.numFmt = '"Q" #,##0.00';
      if (i % 2 === 1)
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5EBDD" },
        };
    });
  });
  tabla.columnas.forEach((c, i) => {
    hoja.getColumn(i + 1).width = c.moneda
      ? 18
      : Math.min(36, Math.max(18, c.titulo.length + 3));
  });
  hoja.views = [{ state: "frozen", ySplit: cabecera.number }];
  if (tabla.filas.length)
    hoja.autoFilter = {
      from: { row: cabecera.number, column: 1 },
      to: {
        row: cabecera.number + tabla.filas.length,
        column: tabla.columnas.length,
      },
    };
  const buffer = await libro.xlsx.writeBuffer();
  return new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function descargar(blob: Blob, archivo: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = archivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
