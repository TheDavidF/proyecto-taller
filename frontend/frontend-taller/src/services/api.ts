const API_BASE_URL = 'http://localhost:8080/api';

// Servicio para Perfiles
export const PerfilService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/perfiles`);
    if (!res.ok) throw new Error('Error al obtener perfiles');
    return res.json();
  },
  create: async (nombre: string) => {
    const res = await fetch(`${API_BASE_URL}/perfiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, estado: true }), // Cambiado de 'nombrePerfil' a 'nombre'
    });
    if (!res.ok) throw new Error('Error al crear perfil');
    return res.json();
  },
  delete: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/perfiles/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar perfil');
  },
};

// Servicio para Servicios
export const ServicioService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/servicios`);
    if (!res.ok) throw new Error('Error al obtener servicios');
    return res.json();
  },
  create: async (nombre: string, precio: number) => {
    const res = await fetch(`${API_BASE_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio, estado: true }), // Verifica las llaves exactas de ServicioDTO
    });
    if (!res.ok) throw new Error('Error al crear servicio');
    return res.json();
  },
  delete: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/servicios/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar servicio');
  },
};