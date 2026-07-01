import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Info, Search, Eye, MessageCircle, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../AuthContext';

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
  const [selectedAlerta, setSelectedAlerta] = useState<any>(null);

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

  const alertasParaMostrar = alertas.filter((repo) => {
    if (repo.estado && repo.estado.toLowerCase() === 'resuelto') return false;
    if (filtro !== 'Todos' && repo.tipo !== filtro) return false;
    return true;
  });

  const getBorderColor = (tipo: string) => tipo === 'Perdido' ? 'var(--color-danger)' : 'var(--color-success)';
  const getBadgeBg = (tipo: string) => tipo === 'Perdido' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';

  const getDistanceMock = (lat?: number, lng?: number) => {
    if (!lat || !lng) return 'Ubicación desconocida';
    // Generar una distancia determinística basada en las coordenadas
    const dist = (Math.abs(lat * lng) % 5) + 0.5;
    const target = user?.rol === 'VETERINARIA' ? 'de tu clínica' : 'de ti';
    return `A ${dist.toFixed(1)} km ${target}`;
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <style>{`
        @keyframes borderPulse {
          0% { border-left-color: var(--color-danger); }
          50% { border-left-color: rgba(239, 68, 68, 0.4); }
          100% { border-left-color: var(--color-danger); }
        }
        .urgent-border {
          border-left-width: 8px !important;
          animation: borderPulse 2s infinite;
        }
      `}</style>
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
          {alertasParaMostrar.map((alerta) => {
            const isUrgent = alerta.tipo === 'Perdido'; // Simular urgencia para mascotas perdidas
            return (
            <div key={alerta.id} className={`surface ${isUrgent ? 'urgent-border' : ''}`} style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              gap: '2rem', 
              alignItems: 'flex-start', 
              borderLeft: `4px solid ${getBorderColor(alerta.tipo)}`,
              position: 'relative'
            }}>
              {/* ID Reporte en esquina superior derecha */}
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                ID: #{alerta.id}
              </div>

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

              {/* Contenedor de la Información Detallada y Botones */}
              <div style={{ flex: 1, display: 'flex', gap: '2rem', minHeight: '250px' }}>
                
                {/* Información */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2.2rem', fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' }}>{alerta.titulo}</h2>
                    <span style={{ padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', background: getBadgeBg(alerta.tipo), color: getBorderColor(alerta.tipo), fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {alerta.tipo === 'Perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    {alerta.tipo === 'Perdido' && (
                      <div>
                        <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Nombre</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.nombre || 'Desconocido'}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Especie</p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.animal || alerta.especie || 'No especificada'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Raza</p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.raza || 'No especificada'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Color</p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.color || 'No especificado'}</p>
                    </div>
                    {alerta.tipo === 'Perdido' && (
                      <div>
                        <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Edad</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{alerta.edad ? `${alerta.edad} años` : 'No especificada'}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '8px', color: 'var(--color-secondary)' }}>
                    <MapPin size={24} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 500, fontSize: '1.1rem', color: '#fff' }}>
                      📍 {getDistanceMock(alerta.lat, alerta.lng)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>
                      {alerta.tipo === 'Perdido' ? 'Última vez visto' : 'Ubicación actual'}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '220px', justifyContent: 'center' }}>
                  {user && (user.id === alerta.userId || user.id === alerta.usuarioId) ? (
                    <button className="btn" style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                      padding: '1rem', width: '100%', borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'default'
                    }}>
                      Este es tu reporte
                    </button>
                  ) : (
                    <>
                      {user?.rol === 'REFUGIO' && alerta.tipo === 'Encontrado' && (
                        <button className="btn" style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                          padding: '1rem', width: '100%', borderRadius: '8px', 
                          background: 'var(--color-success)', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s', textAlign: 'center', lineHeight: 1.2
                        }}
                        onClick={() => alert(`Mensaje enviado a la comunidad: "Somos el refugio ${user?.nombreCompleto || 'asociado'}, tenemos espacio, tráelo."`)}>
                          Me ofrezco como hogar temporal
                        </button>
                      )}
                      <button className="btn" style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                        padding: '1rem', width: '100%', borderRadius: '8px', 
                        background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'all 0.2s'
                      }}>
                        <MessageCircle size={20} />
                        Chat / Contactar
                      </button>
                    </>
                  )}
                  <button className="btn" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    padding: '1rem', width: '100%', borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onClick={() => setSelectedAlerta(alerta)}
                  >
                    <Eye size={20} />
                    Ver Detalles
                  </button>
                </div>

              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalles del Reporte */}
      {selectedAlerta && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '12px' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={20} color="var(--color-primary)" /> Detalles del Caso #{selectedAlerta.id}
              </h3>
              <button onClick={() => setSelectedAlerta(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                
                {/* Columna Izquierda: Imagen y Resumen */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                    {selectedAlerta.imageBase64 ? (
                      <img src={selectedAlerta.imageBase64} alt={selectedAlerta.nombre || 'Mascota'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <Info size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>Sin imagen disponible</p>
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>Resumen</h4>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Especie:</strong> {selectedAlerta.animal || selectedAlerta.especie || 'N/A'}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Raza:</strong> {selectedAlerta.raza || 'N/A'}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Color:</strong> {selectedAlerta.color || 'N/A'}</p>
                  </div>
                </div>

                {/* Columna Derecha: Descripción y Mapa */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Info size={18} /> Descripción Adicional
                    </h4>
                    <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {selectedAlerta.descripcion ? selectedAlerta.descripcion : 'No se proporcionó información adicional para este reporte.'}
                    </p>
                  </div>

                  <div style={{ flex: 1, minHeight: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--color-sidebar)', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--color-primary)" /> Ubicación Registrada
                    </div>
                    <div style={{ flex: 1 }}>
                      <MapContainer center={[selectedAlerta.lat || -33.4489, selectedAlerta.lng || -70.6693]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[selectedAlerta.lat || -33.4489, selectedAlerta.lng || -70.6693]}>
                          <Popup>
                            <strong>Ubicación del reporte:</strong><br />
                            {selectedAlerta.titulo}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', fontWeight: 'bold' }} onClick={() => setSelectedAlerta(null)}>
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
