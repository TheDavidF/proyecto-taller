import { Link } from "react-router-dom";
import { Panel } from "../components/Controles";
import { boton } from "../components/estilos";
const modulos = [
  {
    n: "01",
    nombre: "Perfiles",
    ruta: "/perfiles",
    texto: "Define los perfiles que se asignarán a los usuarios.",
  },
  {
    n: "02",
    nombre: "Usuarios",
    ruta: "/usuarios",
    texto: "Registra responsables y vincúlalos con un perfil.",
  },
  {
    n: "03",
    nombre: "Vehículos",
    ruta: "/vehiculos",
    texto: "Organiza las placas y los datos de los propietarios.",
  },
  {
    n: "04",
    nombre: "Servicios",
    ruta: "/servicios",
    texto: "Define los trabajos y sus precios base.",
  },
  {
    n: "05",
    nombre: "Órdenes",
    ruta: "/ordenes",
    texto: "Reúne vehículo, responsable y servicios en una orden.",
  },
  {
    n: "06",
    nombre: "Reportes",
    ruta: "/reportes",
    texto: "Consulta las órdenes por fecha y exporta el listado.",
  },
];
export default function Inicio() {
  return (
    <div className="space-y-6">
      <Panel titulo="Administración del taller">
        <p className="max-w-3xl leading-relaxed text-cafe/80">
          Comienza registrando los catálogos y después crea las órdenes de
          servicio. Desde cada módulo puedes consultar, modificar, anular y
          reactivar registros.
        </p>
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
            <p className="mt-2 text-sm leading-relaxed text-cafe/75">
              {m.texto}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-azul">
              Abrir módulo →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
