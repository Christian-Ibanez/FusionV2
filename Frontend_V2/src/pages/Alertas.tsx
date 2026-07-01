import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Info, Search } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Alertas = () => {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('app_reportes_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [filtro, setFiltro] = useState<'Todos' | 'Perdido' | 'Encontrado'>('Todos');

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_reportes_v2' && e.newValue) {
        try {
          setAlertas(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtrar los reportes según el filtro seleccionado (Perdido/Encontrado/Todos)
  const alertasParaMostrar = alertas.filter((repo) => {
    if (filtro !== 'Todos' && repo.tipo !== filtro) return false;
    return true;
  });

  const getBorderColor = (tipo: string) => tipo === 'Perdido' ? 'var(--color-danger)' : 'var(--color-success)';
  const getBadgeBg = (tipo: string) => tipo === 'Perdido' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(247, 118, 142, 0.1)', borderRadius: '12px', color: 'var(--color-danger)' }}>
          <AlertTriangle size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Alertas Locales</h1>
          <p style={{ margin: 0 }}>Mascotas reportadas en tu zona.</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFiltro('Todos')} 
          className="btn"
          style={{ 
            padding: '0.6rem 1.2rem', 
            background: filtro === 'Todos' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
            color: '#fff', 
            border: filtro === 'Todos' ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent'
          }}
        >
          Todas las alertas
        </button>
        <button 
          onClick={() => setFiltro('Perdido')} 
          className="btn"
          style={{ 
            padding: '0.6rem 1.2rem', 
            background: filtro === 'Perdido' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
            color: filtro === 'Perdido' ? 'var(--color-danger)' : 'var(--color-text-muted)',
            border: filtro === 'Perdido' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent'
          }}
        >
          Mascotas Perdidas
        </button>
        <button 
          onClick={() => setFiltro('Encontrado')} 
          className="btn"
          style={{ 
            padding: '0.6rem 1.2rem', 
            background: filtro === 'Encontrado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
            color: filtro === 'Encontrado' ? 'var(--color-success)' : 'var(--color-text-muted)',
            border: filtro === 'Encontrado' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent'
          }}
        >
          Mascotas Encontradas
        </button>
      </div>
      
      {alertasParaMostrar.length === 0 ? (
        <div className="surface" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Search size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontSize: '1.1rem' }}>No hay alertas activas para el filtro seleccionado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {alertasParaMostrar.map((alerta) => (
            <div key={alerta.id} className="surface" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', borderLeft: `4px solid ${getBorderColor(alerta.tipo)}` }}>
              {/* Contenedor de la Imagen */}
              <div style={{ width: '250px', height: '250px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {alerta.imageBase64 ? (
                  <img src={alerta.imageBase64} alt={alerta.nombre || 'Mascota'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem' }}>
                    <Info size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Sin imagen disponible</p>
                    {alerta.imageName && <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', wordBreak: 'break-all' }}>({alerta.imageName})</p>}
                  </div>
                )}
              </div>

              {/* Contenedor de la Información Detallada */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#fff' }}>{alerta.titulo} <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem', fontWeight: 'normal' }}>#{alerta.id}</span></h2>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', background: getBadgeBg(alerta.tipo), color: getBorderColor(alerta.tipo), fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {alerta.tipo === 'Perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                  {alerta.tipo === 'Perdido' && (
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nombre</p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.nombre || 'Desconocido'}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Especie</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.animal || alerta.especie || 'No especificada'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Raza</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.raza || 'No especificada'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Color</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.color || 'No especificado'}</p>
                  </div>
                  {alerta.tipo === 'Perdido' && (
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Edad</p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.edad ? `${alerta.edad} años` : 'No especificada'}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '8px', color: 'var(--color-secondary)' }}>
                  <MapPin size={20} />
                  <span style={{ fontWeight: 500 }}>
                    {alerta.tipo === 'Perdido' ? 'Coordenadas de pérdida:' : 'Coordenadas de hallazgo:'}
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>Lat: {alerta.lat?.toFixed(4)}, Lng: {alerta.lng?.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
