import React, { useState, useEffect } from 'react';
import { PerfilService } from '../services/api';

interface Perfil {
  idPerfil?: number;
  nombre: string; // Cambiado de 'nombrePerfil' a 'nombre'
}

export const PerfilPage: React.FC = () => {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarPerfiles = async () => {
    try {
      const data = await PerfilService.getAll();
      setPerfiles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      await PerfilService.create(nombre);
      setNombre('');
      cargarPerfiles();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('¿Deseas eliminar este perfil?')) {
      try {
        await PerfilService.delete(id);
        cargarPerfiles();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Gestión de Perfiles</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-brand-secondary/20">
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">Registrar Perfil</h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre del perfil"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="submit"
            className="bg-brand-primary text-white px-6 py-2 rounded-md hover:opacity-90 font-medium cursor-pointer"
          >
            Guardar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-brand-secondary/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-secondary text-white">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre del Perfil</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr><td colSpan={3} className="p-4 text-center">Cargando...</td></tr>
            ) : perfiles.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No hay perfiles registrados</td></tr>
            ) : (perfiles.map((item) => (
                <tr key={item.idPerfil} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="p-4 text-brand-dark font-medium">{item.idPerfil}</td>
                  <td className="p-4 text-brand-dark">{item.nombre}</td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => handleDelete(item.idPerfil)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};