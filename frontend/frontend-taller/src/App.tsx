import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Ordenes from "./pages/Ordenes";

const enlaces = [
  { ruta: "/perfiles", nombre: "Perfiles" },
  { ruta: "/usuarios", nombre: "Usuarios" },
  { ruta: "/vehiculos", nombre: "Vehículos" },
  { ruta: "/servicios", nombre: "Servicios" },
  { ruta: "/ordenes", nombre: "Órdenes" },
];

function PantallaPendiente({ titulo }: { titulo: string }) {
  return (
    <section className="rounded-xl border border-cafe/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-azul">{titulo}</h2>

      <p className="mt-2 text-cafe/75">
        Aquí construiremos la gestión de {titulo.toLowerCase()}.
      </p>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-coral bg-azul text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold">Gestión del Taller</h1>

          <p className="mt-1 text-sm text-white/80">
            Vehículos, servicios y órdenes de trabajo
          </p>
        </div>
      </header>

      <nav aria-label="Menú principal" className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3 sm:px-6">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-azul text-white" : "text-cafe hover:bg-crema"
                }`
              }
            >
              {enlace.nombre}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to="/perfiles" replace />} />

          {enlaces.map((enlace) => (
            <Route
              key={enlace.ruta}
              path={enlace.ruta}
              element={
                enlace.ruta === "/ordenes" ? (
                  <Ordenes />
                ) : (
                  <PantallaPendiente titulo={enlace.nombre} />
                )
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/perfiles" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
