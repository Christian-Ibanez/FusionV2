import { Users, FileText, Activity, AlertCircle, Clock, MapPin, TrendingUp, TrendingDown, Check, X, Server, BarChart3, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { userApi, reportesApi, coincidenciasApi, type User } from '../api';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with bundlers
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (e) {
  console.log('Leaflet icon fix skipped');
}


export const Overview = ({ menuItems }: { menuItems: any[] }) => {
  const navigate = useNavigate();
  const { user, notifications, removeNotification, addNotification } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const [usersList, setUsersList] = useState<User[]>([]);
  const [coincidenciasList, setCoincidenciasList] = useState<any[]>([]);
  const [alertasList, setAlertasList] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    reportesTotales: 0,
    usuariosRegistrados: 0,
    alertasActivas: 0,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, reportes, activos] = await Promise.all([
          userApi.getAllUsers(),
          reportesApi.getTodos(),
          reportesApi.getActivos()
        ]);
        
        const alertasMascotaPerdida = activos.filter((r: any) => 
          r.tipoReporte === 'PERDIDO' || r.tipo === 'Perdido' || r.tipo === 'Mascota Perdida'
        );

        const localReportesStr = localStorage.getItem('app_reportes_v2');
        const localReportes = localReportesStr ? JSON.parse(localReportesStr) : [];
        const localActivos = localReportes.filter((r: any) => r.estado === 'Activo');
        const localAlertasMascotaPerdida = localActivos.filter((r: any) => r.tipo === 'Perdido' || r.tipo === 'Mascota Perdida');

        const combinedActivos = [...activos, ...localActivos];
        // Sort by ID or date descending
        combinedActivos.sort((a, b) => (b.id || 0) - (a.id || 0));
        setAlertasList(combinedActivos);

        // Build Audit Log
        if (isAdmin) {
          const recentUsers = users.slice(0, 3).map(u => ({
            id: `usr-${u.id}`,
            text: `Nuevo usuario registrado: ${u.nombreCompleto}`,
            time: 'Reciente',
            icon: <Users size={16} color="var(--color-secondary)" />
          }));
          const recentAlerts = combinedActivos.slice(0, 3).map(a => ({
            id: `al-${a.id}`,
            text: `Nueva alerta generada: ${a.titulo} (${a.tipo})`,
            time: 'Reciente',
            icon: <AlertCircle size={16} color="var(--color-danger)" />
          }));
          setAuditLog([...recentUsers, ...recentAlerts].slice(0, 5));
        }

        setStatsData({
          reportesTotales: reportes.length + localReportes.length,
          usuariosRegistrados: users.length,
          alertasActivas: alertasMascotaPerdida.length + localAlertasMascotaPerdida.length,
        });

        if (user?.id) {
          // Get user's lost pet reports
          const misReportesPerdidos = activos.filter((r: any) => 
            (r.tipoReporte === 'PERDIDO' || r.tipo === 'Perdido' || r.tipo === 'Mascota Perdida') && 
            String(r.usuarioId) === String(user.id)
          );

          // Fetch matches for each report
          let coincidenciasDetalladas: any[] = [];
          for (const reporte of misReportesPerdidos) {
            try {
              const matches = await coincidenciasApi.getByReporte(reporte.id);
              coincidenciasDetalladas = [...coincidenciasDetalladas, ...matches.map((m: any) => ({
                ...m,
                titulo: `¡Coincidencia del ${m.porcentajeSimilitud}%!`,
                mensaje: `Se encontró un posible match para tu reporte (ID: ${m.reportePerdidoId}). El reporte coincidente tiene el ID: ${m.reporteEncontradoId}. Estado: ${m.estado}`,
                fechaCreacion: m.fechaCalculo
              }))];
            } catch (err) {
              console.error("No se pudieron cargar coincidencias para reporte " + reporte.id);
            }
          }

          setCoincidenciasList(coincidenciasDetalladas);

          const savedNotifs = JSON.parse(localStorage.getItem('app_notifications') || '[]');
          
          coincidenciasDetalladas.forEach((pc: any) => {
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

  const handleAcceptRole = async (notif: any) => {
    try {
      await userApi.updateRole(notif.actionData.userId, notif.actionData.requestedRole);
      removeNotification(notif.id);
      addNotification({
        userId: notif.actionData.userId,
        text: `Tu solicitud de cambio de rol a ${notif.actionData.requestedRole} ha sido aceptada.`,
        type: 'success'
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleRejectRole = (notif: any) => {
    removeNotification(notif.id);
    addNotification({
      userId: notif.actionData.userId,
      text: `Tu solicitud de cambio de rol a ${notif.actionData.requestedRole} ha sido rechazada.`,
      type: 'danger'
    });
  };

  const roleRequests = notifications.filter(n => n.type === 'role_request');

  const stats = [
    ...(isAdmin ? [
      { title: 'Reportes Totales', value: statsData.reportesTotales.toString(), icon: <FileText size={24} />, color: 'var(--color-primary)', path: '/dashboard/reportes', trend: { value: '+12%', text: 'este mes', type: 'up' } },
      { title: 'Usuarios Registrados', value: statsData.usuariosRegistrados.toString(), icon: <Users size={24} />, color: 'var(--color-secondary)', path: '/dashboard/usuarios', trend: { value: '+5', text: 'esta semana', type: 'up' } }
    ] : []),
    { title: 'Alertas Activas', value: statsData.alertasActivas.toString(), icon: <Activity size={24} />, color: 'var(--color-danger)', path: isAdmin ? '/dashboard/reportes' : '/dashboard/alertas', trend: { value: '-2', text: 'desde ayer', type: 'down' } },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Bienvenido, {user?.nombreCompleto?.split(' ')[0] || 'Usuario'}</h1>
        <p>Este es tu panel principal. Aquí tienes un resumen del sistema.</p>
      </div>

      {/* Stats row for Admin only */}
      {isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => navigate(stat.path)}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = stat.color; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: `${stat.color}22`, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.title}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                    <h2 style={{ margin: 0, fontSize: '2rem', color: '#fff', lineHeight: 1 }}>{stat.value}</h2>
                    {stat.trend && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: stat.trend.type === 'up' ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {stat.trend.type === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{stat.trend.value}</span>
                      </div>
                    )}
                  </div>
                  {stat.trend && (
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{stat.trend.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Actividad Visual (Chart) */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                <BarChart3 size={20} color="var(--color-primary)" /> Volumen de Reportes (Últimos 7 días)
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '1rem 0', gap: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                {[30, 45, 20, 60, 80, 50, 95].map((val, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                    <div style={{ 
                      width: '100%', maxWidth: '30px', height: `${val}%`, 
                      background: idx === 6 ? 'var(--color-primary)' : 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '4px 4px 0 0', transition: 'height 1s ease-out'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas Pendientes (Role Requests) */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                <Check size={20} color="var(--color-success)" /> Tareas Pendientes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {roleRequests.slice(0, 3).map((notif) => (
                  <div key={notif.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#fff' }}>{notif.text}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleAcceptRole(notif)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Aprobar</button>
                      <button onClick={() => handleRejectRole(notif)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>Rechazar</button>
                    </div>
                  </div>
                ))}
                {roleRequests.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)' }}>
                    <Check size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>No hay tareas pendientes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Registro de Actividad (Audit Log) */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                <List size={20} color="var(--color-secondary)" /> Actividad Reciente (Audit Log)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {auditLog.map((log) => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {log.icon}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#fff' }}>{log.text}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado de Salud del Sistema */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                <Server size={20} color="var(--color-success)" /> Estado del Sistema
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }}></div>
                    <span style={{ fontWeight: 500, color: 'var(--color-success)' }}>Todos los sistemas en línea</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>99.9% Uptime</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Base de Datos</p>
                    <p style={{ margin: 0, fontWeight: 500, color: '#fff' }}>Conectada (12ms)</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Microservicios</p>
                    <p style={{ margin: 0, fontWeight: 500, color: '#fff' }}>Operativos (4/4)</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* 2-Column Layout for Standard User */}
      {!isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Alertas Activas & Recientes (Left Column) */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--color-danger)', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <Activity size={20} color="var(--color-danger)" /> Alertas Activas
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{statsData.alertasActivas}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>en total</span>
                </div>
              </div>
              
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actividad Reciente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {alertasList.slice(0, 3).map((alerta, idx) => (
                  <div key={alerta.id || idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: alerta.tipo === 'Perdido' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: alerta.tipo === 'Perdido' ? 'var(--color-danger)' : 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {alerta.titulo}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                          {alerta.animal || alerta.especie || 'N/A'} • {alerta.tipo}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                           <Clock size={12} /> {idx === 0 ? 'Hace 10 min' : idx === 1 ? 'Hace 2 horas' : 'Ayer'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/dashboard/alertas')} 
                      className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      Ver
                    </button>
                  </div>
                ))}
                {alertasList.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>No hay actividad reciente en tu zona.</p>
                )}
              </div>
              <button 
                onClick={() => navigate('/dashboard/alertas')} 
                className="btn btn-ghost" style={{ width: '100%', marginTop: 'auto', background: 'rgba(255,255,255,0.03)' }}
              >
                Ver todas las alertas
              </button>
            </div>

            {/* Posibles Coincidencias (Right Column) */}
            <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--color-warning)', height: '100%' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} /> Posibles Coincidencias
              </h3>
              {coincidenciasList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  {coincidenciasList.map((c, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{c.titulo}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{c.mensaje}</p>
                      <small style={{ color: 'var(--color-primary)', display: 'block', marginTop: '0.8rem', fontWeight: 500 }}>{c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleString() : 'Reciente'}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                  <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p style={{ margin: 0, textAlign: 'center', marginBottom: '1.5rem' }}>No tienes posibles coincidencias por el momento. Te notificaremos si encontramos algo.</p>
                  <button 
                    onClick={() => navigate('/dashboard/reportes')} 
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}
                  >
                    Crear nuevo reporte
                  </button>
                </div>
              )}
            </div>
            
          </div>

          {/* Mapa de Alertas (Full Width Bottom) */}
          <div className="surface animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                <MapPin size={20} color="var(--color-primary)" /> Mapa de Alertas Activas
              </h3>
              {locationBlocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> Activa tu ubicación para ver las alertas cercanas
                </div>
              )}
            </div>
            <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
              {!mapLoaded && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, color: '#fff', backdropFilter: 'blur(2px)' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ marginTop: '1rem', fontWeight: 500 }}>Cargando mapa de alertas...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              <MapContainer center={[-33.4489, -70.6693]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {alertasList.map((repo) => (
                  <Marker key={repo.id} position={[repo.lat || -33.4489, repo.lng || -70.6693]}>
                    <Popup>
                      <strong style={{ color: '#000' }}>{repo.titulo}</strong><br />
                      <span style={{ color: repo.tipo === 'Perdido' || repo.tipo === 'Mascota Perdida' ? 'red' : 'green' }}>
                        {repo.tipo === 'Perdido' || repo.tipo === 'Mascota Perdida' ? 'Perdido' : 'Encontrado'}
                      </span>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
