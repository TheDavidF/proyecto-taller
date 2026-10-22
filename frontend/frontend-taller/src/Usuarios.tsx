import React, { useState, useEffect } from 'react';

const colors = {
  bgLight: '#F5EBDD',     // Crema
  primaryCoral: '#F2765E', // Coral
  darkBlue: '#315B8C',    // Azul Oscuro
  darkCoffee: '#413333',  // Café Oscuro
  white: '#FFFFFF',
};

const API_USUARIOS = 'http://localhost:8080/api/usuarios';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', email: '', telefono: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API_USUARIOS}?incluirInactivos=${incluirInactivos}`);
      if (res.ok) setUsuarios(await res.json());
    } catch (e) {
      console.error('Error al cargar usuarios:', e);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [incluirInactivos]);

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editandoId ? `${API_USUARIOS}/${editandoId}` : API_USUARIOS;
    const method = editandoId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ id: null, nombre: '', email: '', telefono: '' });
    setEditandoId(null);
    cargarUsuarios();
  };

  const anularUsuario = async (id: number) => {
    if (confirm('¿Desea anular este usuario?')) {
      await fetch(`${API_USUARIOS}/${id}`, { method: 'DELETE' });
      cargarUsuarios();
    }
  };

  const activarUsuario = async (id: number) => {
    await fetch(`${API_USUARIOS}/${id}/activar`, { method: 'PUT' });
    cargarUsuarios();
  };

  return (
    <div style={{ backgroundColor: colors.bgLight, padding: '20px', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: colors.darkBlue }}>Gestión de Usuarios</h2>

      {/* Formulario */}
      <form onSubmit={guardarUsuario} style={{ backgroundColor: colors.white, padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editandoId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
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
            {editandoId ? 'Guardar Cambios' : '+ Crear Usuario'}
          </button>
        </div>
      </form>

      {/* Checkbox Inactivos */}
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        <input
          type="checkbox"
          checked={incluirInactivos}
          onChange={(e) => setIncluirInactivos(e.target.checked)}
        />
        Incluir usuarios inactivos
      </label>

      {/* Tabla */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: colors.white, borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: colors.darkBlue, color: colors.white }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{u.id}</td>
              <td style={{ padding: '10px' }}>{u.nombre}</td>
              <td style={{ padding: '10px' }}>{u.email}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={() => { setEditandoId(u.id); setForm(u); }}
                    style={{ backgroundColor: colors.darkBlue, color: colors.white, padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                  {u.activo !== false ? (
                    <button
                      onClick={() => anularUsuario(u.id)}
                      style={{ backgroundColor: colors.darkCoffee, color: colors.white, padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Anular
                    </button>
                  ) : (
                    <button
                      onClick={() => activarUsuario(u.id)}
                      style={{ backgroundColor: colors.primaryCoral, color: colors.white, padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Activar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};