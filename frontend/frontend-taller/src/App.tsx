import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./pages/Login";
import { consultarSesion, cerrarSesion } from "./services/accesoServices";
import type { Sesion } from "./services/accesoServices";
import { mensajeError } from "./utils/formato";
import { Avisos } from "./components/Controles";
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
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let vigente = true;
    const expirar = () => { setSesion(null); setError("Tu sesión terminó. Ingresa nuevamente."); };
    window.addEventListener("sesion-expirada", expirar);
    consultarSesion().then(({ data }) => { if (vigente) { setSesion(data); setError(""); } })
      .catch((e) => { if (vigente) setError(axios.isAxiosError(e) && e.response?.status === 401 ? "" : mensajeError(e)); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; window.removeEventListener("sesion-expirada", expirar); };
  }, []);
  async function salir() {
    setSaliendo(true); setError("");
    try { await cerrarSesion(); setSesion(null); }
    catch (e) { setError(mensajeError(e)); }
    finally { setSaliendo(false); }
  }
  if (cargando) return <main className="p-8 text-center">Cargando...</main>;
  if (!sesion) return <Login aviso={error} alIngresar={(actual) => { setSesion(actual); setError(""); }} />;
  const administrador = sesion.rol === "ADMIN";
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
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{sesion.nombre} · {sesion.perfil}</span>
            <button type="button" disabled={saliendo} onClick={() => void salir()}
              className="rounded-lg border border-white/40 px-4 py-2 hover:bg-white/10 disabled:opacity-60">
              {saliendo ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </header>
      <nav
        aria-label="Menú principal"
        className="border-b border-cafe/10 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6">
          {enlaces.filter((e) => administrador || !["/perfiles", "/usuarios"].includes(e.ruta)).map((e) => (
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
        <Avisos error={error} mensaje="" />
        <Routes>
          <Route path="/" element={<Inicio administrador={administrador} />} />
          <Route path="/perfiles" element={administrador ? <Perfiles /> : <Navigate to="/" replace />} />
          <Route path="/usuarios" element={administrador ? <Usuarios /> : <Navigate to="/" replace />} />
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
