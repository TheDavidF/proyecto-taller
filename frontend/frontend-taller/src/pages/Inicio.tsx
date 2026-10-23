import { Link } from "react-router-dom";
import { Panel } from "../components/Controles";
import { boton } from "../components/estilos";
const modulos = [
  {
    n: "01",
    nombre: "Perfiles",
    ruta: "/perfiles",
  },
  {
    n: "02",
    nombre: "Usuarios",
    ruta: "/usuarios",
  },
  {
    n: "03",
    nombre: "Vehículos",
    ruta: "/vehiculos",
  },
  {
    n: "04",
    nombre: "Servicios",
    ruta: "/servicios",
  },
  {
    n: "05",
    nombre: "Órdenes",
    ruta: "/ordenes",
  },
  {
    n: "06",
    nombre: "Reportes",
    ruta: "/reportes",
  },
];
export default function Inicio() {
  return (
    <div className="space-y-6">
      <Panel titulo="Administración del taller">

        <div className="mt-5">
          <Link to="/ordenes" className={boton}>
            Ir a órdenes
          </Link>
        </div>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.ruta}
            to={m.ruta}
            className="rounded-xl border border-cafe/10 bg-white p-6 shadow-sm transition hover:border-azul/50"
          >
            <span className="text-sm font-bold text-azul">{m.n}</span>
            <h2 className="mt-3 text-xl font-bold">{m.nombre}</h2>
            <span className="mt-4 inline-block text-sm font-semibold text-azul">
              Abrir módulo →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
