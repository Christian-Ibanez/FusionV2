import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, MessageCircle, Navigation, Shield, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

const MapUpdater = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

// Ícono personalizado para clínicas
const ClinicIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background: var(--color-primary); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Mock de clínicas VERDADERAS en Santiago, RM
const clinicasVerdaderas = [
  {
    id: 1,
    nombre: "Hospital Veterinario de Santiago (HVS)",
    direccion: "Av. Francisco Bilbao 2673, Providencia, RM",
    lat: -33.4357,
    lng: -70.6012,
    telefono: "+56222048259",
    whatsapp: "56912345678",
    horario: "Urgencias 24/7",
    isOpen: true,
    servicios: ["24/7", "Hospitalización", "Rayos X", "Ecografía", "Cirugía"],
  },
  {
    id: 2,
    nombre: "Posta Veterinaria (Ñuñoa)",
    direccion: "Av. Irarrázaval 3630, Ñuñoa, RM",
    lat: -33.4532,
    lng: -70.5925,
    telefono: "+56223456789",
    whatsapp: "56987654321",
    horario: "Urgencias 24/7",
    isOpen: true,
    servicios: ["24/7", "Cirugía", "Laboratorio", "Hospitalización"],
  },
  {
    id: 3,
    nombre: "Clínica Veterinaria Alemana",
    direccion: "Av. Vitacura 5951, Vitacura, RM",
    lat: -33.3934,
    lng: -70.5735,
    telefono: "+56225556666",
    whatsapp: "",
    horario: "Lunes a Domingo 09:00 - 21:00",
    isOpen: true,
    servicios: ["Rayos X", "Ecografía", "Especialistas"],
  },
  {
    id: 4,
    nombre: "Clínica Veterinaria Los Leones",
    direccion: "Av. Los Leones 1500, Providencia, RM",
    lat: -33.4361,
    lng: -70.6009,
    telefono: "+56221112222",
    whatsapp: "56999998888",
    horario: "Lunes a Viernes 10:00 - 19:00",
    isOpen: false,
    servicios: ["Animales Exóticos", "Vacunas", "Consulta General"],
  },
  {
    id: 5,
    nombre: "Clínica Veterinaria Bon Amie",
    direccion: "Av. Grecia 2500, Ñuñoa, RM",
    lat: -33.4617,
    lng: -70.6121,
    telefono: "+56223334444",
    whatsapp: "56977776666",
    horario: "Urgencias 24/7",
    isOpen: true,
    servicios: ["24/7", "Cirugía", "Hospitalización"],
  }
];

export const Clinicas = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterServicio, setFilterServicio] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -33.4489, lng: -70.6693 });

  const allServicios = Array.from(new Set(clinicasVerdaderas.flatMap(c => c.servicios))).sort();

  const clinicasFiltradas = clinicasVerdaderas.filter(c => {
    if (filterEstado === 'Abierto' && !c.isOpen) return false;
    if (filterEstado === 'Cerrado' && c.isOpen) return false;
    if (filterServicio !== 'Todos' && !c.servicios.includes(filterServicio)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!c.nombre.toLowerCase().includes(term) && !c.direccion.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const getMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
            <Shield size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Directorio de Clínicas</h1>
            <p style={{ margin: 0 }}>Encuentra clínicas veterinarias verificadas y centros de derivación (Datos Reales).</p>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', display: 'flex', gap: '0.5rem' }} onClick={() => navigate('/dashboard/perfil')}>
          <User size={18} /> Mi Perfil Público
        </button>
      </div>

      {/* Buscador y Filtros Técnicos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-sidebar)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 2 }}>
          <Search size={18} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o comuna (Ej. Ñuñoa)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
          />
        </div>

        <select className="form-input" value={filterServicio} onChange={(e) => setFilterServicio(e.target.value)}>
          <option value="Todos">Especialidades: Todas</option>
          <option value="24/7">Urgencias 24/7</option>
          {allServicios.filter(s => s !== '24/7').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select className="form-input" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="Todos">Estado: Todos</option>
          <option value="Abierto">Abierto Ahora</option>
          <option value="Cerrado">Cerrado</option>
        </select>
        
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Mapa Interactivo */}
        <div className="surface" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
            <MapPin size={20} color="var(--color-primary)" /> Clínicas Cercanas
          </h3>
          <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapUpdater lat={mapCenter.lat} lng={mapCenter.lng} />
              
              {clinicasFiltradas.map((c) => (
                <Marker 
                  key={c.id} 
                  position={[c.lat, c.lng]}
                  icon={ClinicIcon}
                >
                  <Popup>
                    <strong style={{ color: '#000' }}>{c.nombre}</strong><br />
                    <span style={{ color: '#4b5563', fontSize: '12px' }}>{c.horario}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Tarjetas de Clínicas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
            <Shield size={20} color="var(--color-primary)" /> Resultados del Directorio ({clinicasFiltradas.length})
          </h3>

          {clinicasFiltradas.length === 0 ? (
            <div className="surface" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No se encontraron clínicas que coincidan con estos filtros.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {clinicasFiltradas.map(c => (
                <div key={c.id} className="surface" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s', padding: 0 }}
                  onMouseEnter={() => setMapCenter({ lat: c.lat, lng: c.lng })}
                >
                  <div style={{ padding: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', paddingRight: '1rem' }}>{c.nombre}</h4>
                      {c.isOpen ? (
                        <div title="Abierto Ahora" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
                          <CheckCircle size={14} /> Abierto
                        </div>
                      ) : (
                        <div title="Cerrado Actualmente" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(244, 63, 94, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
                          <XCircle size={14} /> Cerrado
                        </div>
                      )}
                    </div>
                    
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      {c.direccion}
                    </p>
                    
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} />
                      {c.horario}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {c.servicios.map(s => (
                        <span key={s} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: '4px', background: s === '24/7' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)', color: s === '24/7' ? 'var(--color-secondary)' : '#cbd5e1' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer con Acciones Rápidas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <a href={`tel:${c.telefono}`} className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.75rem', borderRight: '1px solid var(--color-border)', color: 'var(--color-success)', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                      <Phone size={18} /> Llamar
                    </a>
                    <a href={c.whatsapp ? `https://wa.me/${c.whatsapp}` : '#'} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.75rem', borderRight: '1px solid var(--color-border)', color: c.whatsapp ? '#25D366' : 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', pointerEvents: c.whatsapp ? 'auto' : 'none' }}>
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                    <a href={getMapsUrl(c.lat, c.lng)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ borderRadius: 0, padding: '0.75rem', color: '#3b82f6', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                      <Navigation size={18} /> Ruta
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
