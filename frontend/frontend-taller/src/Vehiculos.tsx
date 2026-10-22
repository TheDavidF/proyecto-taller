import React, { useState, useEffect } from 'react';

const colors = {
  bgLight: '#F5EBDD',     // Crema
  primaryCoral: '#F2765E', // Coral
  darkBlue: '#315B8C',    // Azul Oscuro
  darkCoffee: '#413333',  // Café Oscuro
  white: '#FFFFFF',
};

const API_VEHICULOS = 'http://localhost:8080/api/vehiculos';

export const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [form, setForm] = useState({ id: null, placa: '', marca: '', modelo: '', anio: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarVehiculos = async () => {
    try {
      const res = await fetch(API_VEHICULOS);
      if (res.ok) setVehiculos(await res.json());
    } catch (e) {
      console.error('Error al cargar vehículos:', e);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const guardarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editandoId ? `${API_VEHICULOS}/${editandoId}` : API_VEHICULOS;
    const method = editandoId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ id: null, placa: '', marca: '', modelo: '', anio: '' });
    setEditandoId(null);
    cargarVehiculos();
  };

  const eliminarVehiculo = async (id: number) => {
    if (confirm('¿Desea eliminar este vehículo?')) {
      await fetch(`${API_VEHICULOS}/${id}`, { method: 'DELETE' });
      cargarVehiculos();
    }
  };

  return (
    <div style={{ backgroundColor: colors.bgLight, padding: '20px', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: colors.darkBlue }}>Gestión de Vehículos</h2>

      {/* Formulario */}
      <form onSubmit={guardarVehiculo} style={{ backgroundColor: colors.white, padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editandoId ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Placa"
            value={form.placa}
            onChange={(e) => setForm({ ...form, placa: e.target.value })}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Marca"
            value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Modelo"
            value={form.modelo}
            onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: colors.primaryCoral,
              color: colors.white,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {editandoId ? 'Guardar Cambios' : '+ Crear Vehículo'}
          </button>
        </div>
      </form>

      {/* Tabla */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: colors.white, borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: colors.darkBlue, color: colors.white }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Placa</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Marca</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Modelo</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{v.placa}</td>
              <td style={{ padding: '10px' }}>{v.marca}</td>
              <td style={{ padding: '10px' }}>{v.modelo}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={() => { setEditandoId(v.id); setForm(v); }}
                    style={{ backgroundColor: colors.darkBlue, color: colors.white, padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarVehiculo(v.id)}
                    style={{ backgroundColor: colors.darkCoffee, color: colors.white, padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};