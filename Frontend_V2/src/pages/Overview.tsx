import { Users, FileText, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { userApi, reportesApi, notificacionesApi, type User } from '../api';

export const Overview = ({ menuItems }: { menuItems: any[] }) => {
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const [showUsers, setShowUsers] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [coincidenciasList, setCoincidenciasList] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    reportesTotales: 0,
    usuariosRegistrados: 0,
    alertasActivas: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, reportes, activos] = await Promise.all([
          userApi.getAllUsers(),
          reportesApi.getTodos(),
          reportesApi.getActivos()
        ]);
        setUsersList(users);
        
        const alertasMascotaPerdida = activos.filter((r: any) => 
          r.tipoReporte === 'PERDIDO' || r.tipo === 'Perdido' || r.tipo === 'Mascota Perdida'
        );

        const localReportesStr = localStorage.getItem('app_reportes_v2');
        const localReportes = localReportesStr ? JSON.parse(localReportesStr) : [];
        const localActivos = localReportes.filter((r: any) => r.estado === 'Activo');
        const localAlertasMascotaPerdida = localActivos.filter((r: any) => r.tipo === 'Perdido' || r.tipo === 'Mascota Perdida');

        setStatsData({
          reportesTotales: reportes.length + localReportes.length,
          usuariosRegistrados: users.length,
          alertasActivas: alertasMascotaPerdida.length + localAlertasMascotaPerdida.length,
        });

        if (user?.id) {
          const historial = await notificacionesApi.getHistorial(String(user.id));
          const posiblesCoincidencias = historial.filter((n: any) => n.titulo?.toLowerCase().includes("coincidencia"));
          setCoincidenciasList(posiblesCoincidencias);

          const savedNotifs = JSON.parse(localStorage.getItem('app_notifications') || '[]');
          
          posiblesCoincidencias.forEach((pc: any) => {
            const yaExiste = savedNotifs.some((n: any) => n.text === pc.mensaje && n.userId === user.id);
            if (!yaExiste) {
              addNotification({
                userId: user.id,
                text: pc.mensaje,
                type: 'warning'
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching overview data", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    ...(isAdmin ? [
      { title: 'Reportes Totales', value: statsData.reportesTotales.toString(), icon: <FileText size={24} />, color: 'var(--color-primary)' },
      { title: 'Usuarios Registrados', value: statsData.usuariosRegistrados.toString(), icon: <Users size={24} />, color: 'var(--color-secondary)', onClick: () => setShowUsers(!showUsers) }
    ] : []),
    { title: 'Alertas Activas', value: statsData.alertasActivas.toString(), icon: <Activity size={24} />, color: 'var(--color-danger)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Bienvenido, {user?.nombreCompleto?.split(' ')[0] || 'Usuario'}</h1>
        <p>Este es tu panel principal. Aquí tienes un resumen del sistema.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="surface" 
            style={{ 
              padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', 
              cursor: stat.onClick ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              border: (stat.onClick && showUsers) ? `1px solid ${stat.color}` : '1px solid var(--color-border)'
            }}
            onClick={stat.onClick}
            onMouseOver={(e) => { if(stat.onClick) e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseOut={(e) => { if(stat.onClick) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              background: `${stat.color}22`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.title}</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Users List (conditionally rendered) */}
      {showUsers && isAdmin && (
        <div className="surface animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Detalle de Usuarios Registrados</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Correo</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Rol</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{u.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>{u.nombreCompleto}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{u.correoElectronico}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{u.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Posibles Coincidencias */}
      {!isAdmin && (
        <div className="surface animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--color-warning)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> Posibles Coincidencias
          </h3>
          {coincidenciasList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {coincidenciasList.map((c, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{c.titulo}</h4>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{c.mensaje}</p>
                  <small style={{ color: 'var(--color-primary)', display: 'block', marginTop: '0.5rem' }}>{c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleString() : 'Reciente'}</small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No tienes posibles coincidencias por el momento. Te notificaremos si encontramos algo.</p>
          )}
        </div>
      )}

      {/* Dashboard Menu Options */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Accesos Rápidos</h3>
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {menuItems.map((item, idx) => (
          <div 
            key={idx} 
            className="surface" 
            style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate(`/dashboard${item.path ? '/' + item.path : ''}`)}
          >
            <div style={{ 
              width: '45px', height: '45px', borderRadius: '10px', marginBottom: '1rem',
              background: `linear-gradient(135deg, var(--color-primary)22, var(--color-secondary)44)`,
              color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {item.icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
