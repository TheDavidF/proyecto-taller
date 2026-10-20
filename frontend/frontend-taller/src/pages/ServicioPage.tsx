import React, { useState } from 'react';

interface Servicio {
  idServicio?: number;
  nombreServicio: string;
  precio: number;
}

export const ServicioPage: React.FC = () => {
  const [servicios] = useState<Servicio[]>([
    { idServicio: 1, nombreServicio: 'Cambio de Aceite', precio: 150.00 },
    { idServicio: 2, nombreServicio: 'Alineación y Balanceo', precio: 220.00 },
    { idServicio: 3, nombreServicio: 'Revisión de Frenos', precio: 180.00 },
  ]);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Gestión de Servicios</h1>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-brand-secondary/20">
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">Registrar / Editar Servicio</h2>
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <input
            type="number"
            placeholder="Precio (Q)"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="submit"
            className="bg-brand-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Guardar
          </button>
        </form>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-brand-secondary/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary text-white">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Servicio</th>
              <th className="p-4 font-semibold">Precio (Q)</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {servicios.map((item) => (
              <tr key={item.idServicio} className="hover:bg-brand-bg/50 transition-colors">
                <td className="p-4 text-brand-dark font-medium">{item.idServicio}</td>
                <td className="p-4 text-brand-dark">{item.nombreServicio}</td>
                <td className="p-4 text-brand-dark">Q {item.precio.toFixed(2)}</td>
                <td className="p-4 text-center space-x-2">
                  <button className="px-3 py-1 bg-brand-secondary text-white text-sm rounded hover:opacity-90">
                    Editar
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};