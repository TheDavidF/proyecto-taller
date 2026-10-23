import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Perfiles from "./pages/Perfiles";
import Usuarios from "./pages/Usuarios";
import Vehiculos from "./pages/Vehiculos";
import Servicios from "./pages/Servicios";
import Ordenes from "./pages/Ordenes";
import Reportes from "./pages/Reportes";
const enlaces = [
  { ruta: "/", nombre: "Inicio" },
  { ruta: "/perfiles", nombre: "Perfiles" },
  { ruta: "/usuarios", nombre: "Usuarios" },
  { ruta: "/vehiculos", nombre: "Vehículos" },
  { ruta: "/servicios", nombre: "Servicios" },
  { ruta: "/ordenes", nombre: "Órdenes" },
  { ruta: "/reportes", nombre: "Reportes" },
];
export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-coral bg-azul text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/70">
              Administración
            </p>
            <h1 className="text-2xl font-bold">Gestión del Taller</h1>
            <p className="mt-1 text-sm text-white/80">
              Vehículos, servicios y órdenes de trabajo
            </p>
          </div>
          <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
            Control de operaciones
          </span>
        </div>
      </header>
      <nav
        aria-label="Menú principal"
        className="border-b border-cafe/10 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6">
          {enlaces.map((e) => (
            <NavLink
              key={e.ruta}
              to={e.ruta}
              end={e.ruta === "/"}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-azul text-white" : "text-cafe hover:bg-crema"}`
              }
            >
              {e.nombre}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/perfiles" element={<Perfiles />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-7xl px-6 pb-6 text-xs text-cafe/65">
        Gestión del Taller · Proyecto universitario
      </footer>
    </div>
  );
}
