import { Users, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userApi, type User } from '../api';
import { useAuth } from '../AuthContext';

export const Usuarios = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number | undefined) => {
    if (!id) return;
    if (id === user?.id) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario de la base de datos?")) return;
    try {
      await userApi.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar el usuario");
    }
  };

  if (!isAdmin) {
    return (
      <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
        <h2>No tienes permisos para ver esta página.</h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(122, 92, 255, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
          <Users size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Gestión de Usuarios</h1>
          <p style={{ margin: 0 }}>Administra los usuarios del sistema y elimina cuentas de la base de datos.</p>
        </div>
      </div>
      
      <div className="surface" style={{ padding: '2rem', color: 'var(--color-text)' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando usuarios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Correo</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Rol Actual</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{u.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>{u.nombreCompleto}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{u.correoElectronico}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>
                      <span style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: 'rgba(255,255,255,0.1)',
                        color: u.rol === 'ADMINISTRADOR' ? 'var(--color-danger)' : u.rol === 'VETERINARIA' ? 'var(--color-success)' : 'var(--color-primary)'
                      }}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn" 
                          style={{ background: 'var(--color-danger)', color: '#fff', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
