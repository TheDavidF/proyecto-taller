import type { ReactNode } from "react";
export function Panel({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-cafe/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-azul">{titulo}</h2>
      {children}
    </section>
  );
}
export function Avisos({ error, mensaje }: { error: string; mensaje: string }) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-coral bg-white p-4"
        >
          {error}
        </p>
      )}
      {mensaje && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-azul bg-white p-4 text-azul"
        >
          {mensaje}
        </p>
      )}
    </>
  );
}
export function Etiqueta({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {titulo}
      </label>
      {children}
    </div>
  );
}
export function Estado({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${activo ? "bg-azul/10 text-azul" : "bg-coral/20 text-cafe"}`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
