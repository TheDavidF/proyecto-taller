import type { TablaExportacion } from "../utils/exportaciones";
import { moneda } from "../utils/formato";

export default function TablaReporte({ tabla }: { tabla: TablaExportacion }) {
  if (!tabla.filas.length)
    return (
      <p className="rounded-lg bg-crema p-5 text-center">
        No hay registros para este filtro.
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {tabla.columnas.map((c) => (
              <th key={c.titulo}>{c.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((valor, j) => (
                <td
                  key={tabla.columnas[j].titulo}
                  className="whitespace-pre-wrap break-words"
                >
                  {valor === null
                    ? ""
                    : tabla.columnas[j].moneda
                      ? moneda(Number(valor))
                      : valor}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
