import { useState, useEffect } from 'react';
import { FileText, MapPin, X, Search, Filter, Eye, Edit, Trash2, Check, List, User, UploadCloud, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
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

const MapClickHandler = ({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to programmatically update map view
const MapUpdater = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

export const Reportes = () => {
  const { addNotification, user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const [reportesDummy, setReportesDummy] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('app_reportes_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEspecie, setFilterEspecie] = useState('Todos');
  
  // Pestañas para el ciudadano alternar vistas
  const [activeTab, setActiveTab] = useState<'mis_reportes' | 'todos'>(isAdmin ? 'todos' : 'mis_reportes');

  // Address search for Map
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_reportes_v2', JSON.stringify(reportesDummy));
  }, [reportesDummy]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_reportes_v2' && e.newValue) {
        try {
          setReportesDummy(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    tipo: 'Perdido',
    animal: 'Perro',
    lat: -33.4489,
    lng: -70.6693,
    nombre: '',
    color: '',
    raza: '',
    edad: '',
    image: null as File | null,
    imageBase64: '',
  });

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingReportId(null);
    setAddressSearch('');
    setNuevoReporte({
      titulo: '',
      tipo: 'Perdido',
      animal: 'Perro',
      lat: -33.4489,
      lng: -70.6693,
      nombre: '',
      color: '',
      raza: '',
      edad: '',
      image: null,
      imageBase64: '',
    });
  };

  const handleSearchAddress = async () => {
    if (!addressSearch) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setNuevoReporte({ ...nuevoReporte, lat: parseFloat(lat), lng: parseFloat(lon) });
        addNotification({ text: 'Ubicación encontrada en el mapa.', type: 'success' });
      } else {
        addNotification({ text: 'No se encontró la dirección.', type: 'warning' });
      }
    } catch(e) {
      console.error(e);
      addNotification({ text: 'Error al buscar la ubicación.', type: 'danger' });
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleSaveReport = () => {
    if (editingReportId) {
      const updatedReports = reportesDummy.map(r => {
        if (r.id === editingReportId) {
          return {
            ...r,
            lat: nuevoReporte.lat,
            lng: nuevoReporte.lng,
            titulo: nuevoReporte.titulo || (nuevoReporte.tipo === 'Perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'),
            tipo: nuevoReporte.tipo,
            nombre: nuevoReporte.nombre,
            color: nuevoReporte.color,
            raza: nuevoReporte.raza,
            edad: nuevoReporte.edad,
            animal: nuevoReporte.animal,
            imageName: nuevoReporte.image?.name ?? r.imageName,
            imageBase64: nuevoReporte.imageBase64 || r.imageBase64,
          };
        }
        return r;
      });
      setReportesDummy(updatedReports);
      addNotification({
        text: `Reporte actualizado correctamente.`,
        type: 'success'
      });
    } else {
      const newReport = {
        id: Date.now(),
        lat: nuevoReporte.lat,
        lng: nuevoReporte.lng,
        titulo: nuevoReporte.titulo || (nuevoReporte.tipo === 'Perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'),
        tipo: nuevoReporte.tipo,
        estado: 'Activo',
        userId: user?.id,
        nombre: nuevoReporte.nombre,
        color: nuevoReporte.color,
        raza: nuevoReporte.raza,
        edad: nuevoReporte.edad,
        animal: nuevoReporte.animal,
        imageName: nuevoReporte.image?.name ?? '',
        imageBase64: nuevoReporte.imageBase64,
      };
      
      addNotification({
        text: `Nuevo reporte: ${newReport.titulo}.`,
        type: 'info'
      });
      setReportesDummy([...reportesDummy, newReport]);
    }
    
    resetForm();
  };

  const handleAction = (id: number, action: string) => {
    if (action === 'delete') {
      if(confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
        setReportesDummy(reportesDummy.filter(r => r.id !== id));
        addNotification({ text: 'Reporte eliminado correctamente.', type: 'info' });
      }
    } else if (action === 'resolve') {
      setReportesDummy(reportesDummy.map(r => r.id === id ? { ...r, estado: 'Resuelto' } : r));
      addNotification({ text: 'Reporte marcado como resuelto. ¡Felicidades!', type: 'success' });
    } else if (action === 'edit') {
      const reportToEdit = reportesDummy.find(r => r.id === id);
      if (reportToEdit) {
        setNuevoReporte({
          titulo: reportToEdit.titulo || '',
          tipo: reportToEdit.tipo || 'Perdido',
          animal: reportToEdit.animal || reportToEdit.especie || 'Perro',
          lat: reportToEdit.lat || -33.4489,
          lng: reportToEdit.lng || -70.6693,
          nombre: reportToEdit.nombre || '',
          color: reportToEdit.color || '',
          raza: reportToEdit.raza || '',
          edad: reportToEdit.edad || '',
          image: null,
          imageBase64: reportToEdit.imageBase64 || '',
        });
        setEditingReportId(id);
        setIsModalOpen(true);
      }
    }
  };

  const misReportes = reportesDummy.filter(r => String(r.userId) === String(user?.id) && user?.id !== undefined);
  const todosReportes = reportesDummy;

  const baseReportes = isAdmin ? todosReportes : (activeTab === 'mis_reportes' ? misReportes : todosReportes);

  const reportesFiltrados = baseReportes.filter(r => {
    if (filterEstado !== 'Todos' && r.estado !== filterEstado) return false;
    if (filterTipo !== 'Todos' && r.tipo !== filterTipo) return false;
    if (filterEspecie !== 'Todos' && r.animal !== filterEspecie && r.especie !== filterEspecie) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const idStr = String(r.id);
      const raza = (r.raza || '').toLowerCase();
      const userStr = (r.userId || '').toString().toLowerCase();
      if (!idStr.includes(term) && !raza.includes(term) && !userStr.includes(term)) return false;
    }
    return true;
  });

  const humanizeLocation = (lat: number, lng: number) => {
    if (!lat || !lng) return 'N/A';
    const communes = ['Providencia', 'Ñuñoa', 'Santiago Centro', 'Las Condes', 'Maipú', 'La Florida', 'Vitacura', 'Macul'];
    const idx = Math.floor((Math.abs(lat) + Math.abs(lng)) * 100) % communes.length;
    return `${communes[idx]}, Región Metropolitana`;
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 0, 127, 0.1)', borderRadius: '12px', color: 'var(--color-secondary)' }}>
            <FileText size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Reportes de Mascotas</h1>
            <p style={{ margin: 0 }}>Visualiza y gestiona los reportes de mascotas perdidas y encontradas.</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          + Nuevo Reporte
        </button>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Filtros Globales (Afectan lista y mapa) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-sidebar)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 2, minWidth: '200px' }}>
            <Search size={18} color="var(--color-text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por ID, raza o usuario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
            />
          </div>
          <select className="form-input" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ padding: '0.6rem 1rem' }}>
            <option value="Todos">Estado: Todos</option>
            <option value="Activo">Estado: Activo</option>
            <option value="Resuelto">Estado: Resuelto</option>
          </select>
          <select className="form-input" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ padding: '0.6rem 1rem' }}>
            <option value="Todos">Tipo: Todos</option>
            <option value="Perdido">Tipo: Perdido</option>
            <option value="Encontrado">Tipo: Encontrado</option>
          </select>
          <select className="form-input" value={filterEspecie} onChange={(e) => setFilterEspecie(e.target.value)} style={{ padding: '0.6rem 1rem' }}>
            <option value="Todos">Especie: Todas</option>
            <option value="Perro">Especie: Perro</option>
            <option value="Gato">Especie: Gato</option>
            <option value="Conejo">Especie: Conejo</option>
          </select>
        </div>

        {/* Mapa sincronizado */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--color-primary)" /> Mapa de Resultados
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
              Mostrando {reportesFiltrados.length} resultados
            </span>
          </div>

          <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <MapContainer center={[-33.4489, -70.6693]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reportesFiltrados.map((repo) => (
                <Marker key={repo.id} position={[repo.lat || -33.4489, repo.lng || -70.6693]}>
                  <Popup>
                    <strong style={{ color: '#000' }}>{repo.titulo}</strong><br />
                    <span style={{ color: repo.tipo === 'Perdido' || repo.tipo === 'Mascota Perdida' ? 'red' : 'green' }}>{repo.tipo}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Pestañas para el ciudadano */}
        {!isAdmin && (
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => setActiveTab('mis_reportes')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px',
                background: activeTab === 'mis_reportes' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'mis_reportes' ? '#fff' : 'var(--color-text)',
                border: 'none', cursor: 'pointer', fontWeight: activeTab === 'mis_reportes' ? 600 : 400, transition: 'all 0.2s'
              }}
            >
              <User size={18} /> Mis Reportes
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px',
                background: activeTab === 'todos' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'todos' ? '#fff' : 'var(--color-text)',
                border: 'none', cursor: 'pointer', fontWeight: activeTab === 'todos' ? 600 : 400, transition: 'all 0.2s'
              }}
            >
              <List size={18} /> Todos los Reportes
            </button>
          </div>
        )}

        {/* Lista de Reportes */}
        <div className="surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--color-primary)" /> {isAdmin ? 'Todos los Reportes' : (activeTab === 'mis_reportes' ? 'Mis Reportes' : 'Todos los Reportes')}
          </h3>

          {reportesFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>No se encontraron reportes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reportesFiltrados.map((repo) => {
                const isMine = String(repo.userId) === String(user?.id);
                return (
                  <div key={repo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {repo.titulo}
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>#{repo.id}</span>
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.tipo === 'Perdido' || repo.tipo === 'Mascota Perdida' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: repo.tipo === 'Perdido' || repo.tipo === 'Mascota Perdida' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {repo.tipo}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.estado === 'Activo' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: repo.estado === 'Activo' ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                              {repo.estado}
                            </span>
                          </div>
                          
                          {(isAdmin || isMine) && (
                            <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                              {!isMine && <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--color-secondary)' }} title="Ver Detalle"><Eye size={18} /></button>}
                              <button onClick={() => handleAction(repo.id, 'edit')} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--color-warning)' }} title="Editar"><Edit size={18} /></button>
                              {repo.estado !== 'Resuelto' && (
                                <button onClick={() => handleAction(repo.id, 'resolve')} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--color-success)' }} title="Marcar como Resuelto"><Check size={18} /></button>
                              )}
                              <button onClick={() => handleAction(repo.id, 'delete')} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--color-danger)' }} title={isAdmin ? "Eliminar/Bloquear" : "Eliminar"}><Trash2 size={18} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0 }}><strong>Especie:</strong> {repo.animal || repo.especie || 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>Raza:</strong> {repo.raza || 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>Ubicación:</strong> {humanizeLocation(repo.lat, repo.lng)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal interactivo de creación/edición con scroll y grids */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          
          <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            
            {/* Cabecera del modal (fija) */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} color="var(--color-primary)" /> {editingReportId ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
              </h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s', padding: '0.2rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* Cuerpo del formulario (con scroll) */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              
              <div className="form-group">
                <label className="form-label">Título del reporte</label>
                <input type="text" className="form-input" placeholder="Ej. Perrito blanco perdido en Providencia" value={nuevoReporte.titulo} onChange={(e) => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })} />
              </div>

              {/* Grid 2 columnas: Tipo y Especie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipo de Reporte</label>
                  <select className="form-input" value={nuevoReporte.tipo} onChange={(e) => setNuevoReporte({ ...nuevoReporte, tipo: e.target.value })}>
                    <option value="Perdido">Mascota Perdida</option>
                    <option value="Encontrado">Mascota Encontrada</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Especie</label>
                  <select className="form-input" value={nuevoReporte.animal} onChange={(e) => setNuevoReporte({ ...nuevoReporte, animal: e.target.value })}>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Conejo">Conejo</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 columnas: Nombre y Edad (solo si se perdió) */}
              {nuevoReporte.tipo === 'Perdido' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nombre de la mascota</label>
                    <input type="text" className="form-input" placeholder="Ej. Toby" value={nuevoReporte.nombre} onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Edad (años)</label>
                    <input type="number" className="form-input" min="0" placeholder="Ej. 3" value={nuevoReporte.edad} onChange={(e) => setNuevoReporte({ ...nuevoReporte, edad: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Grid 2 columnas: Color y Raza */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Color predominante</label>
                  <input type="text" className="form-input" placeholder="Ej. Blanco con manchas negras" value={nuevoReporte.color} onChange={(e) => setNuevoReporte({ ...nuevoReporte, color: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Raza</label>
                  <input type="text" className="form-input" placeholder="Ej. Poodle" value={nuevoReporte.raza} onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })} />
                </div>
              </div>

              {/* Zona de subida de imagen estilizada (Drag & Drop look) */}
              <div className="form-group">
                <label className="form-label">Fotografía</label>
                <label 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '2rem', 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    background: 'rgba(255,255,255,0.02)', 
                    transition: 'all 0.2s', 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <UploadCloud size={40} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    Sube una foto de la mascota
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    {nuevoReporte.image ? <span style={{color: 'var(--color-success)'}}>Seleccionado: {nuevoReporte.image.name}</span> : 'PNG, JPG o JPEG (Máx. 5MB)'}
                  </span>
                  
                  <div className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem' }}>
                    Explorar archivos
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNuevoReporte({ ...nuevoReporte, image: file, imageBase64: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setNuevoReporte({ ...nuevoReporte, image: null, imageBase64: '' });
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Sección del Mapa con Autocompletado */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ubicación del suceso</label>
                
                {/* Input de Búsqueda de Ubicación */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-sidebar)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 1 }}>
                    <Map size={18} color="var(--color-text-muted)" />
                    <input 
                      type="text" 
                      placeholder="Escribe una calle, comuna o sector..." 
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                      style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleSearchAddress} disabled={isSearchingMap} style={{ padding: '0.5rem 1.5rem' }}>
                    {isSearchingMap ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <MapContainer center={[nuevoReporte.lat || -33.4489, nuevoReporte.lng || -70.6693]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater lat={nuevoReporte.lat || -33.4489} lng={nuevoReporte.lng || -70.6693} />
                    <MapClickHandler onLocationSelected={(lat, lng) => setNuevoReporte({ ...nuevoReporte, lat, lng })} />
                    {nuevoReporte.lat && nuevoReporte.lng && (
                      <>
                        <Marker position={[nuevoReporte.lat, nuevoReporte.lng]} />
                        <Circle center={[nuevoReporte.lat, nuevoReporte.lng]} radius={4000} pathOptions={{ color: 'var(--color-primary)', fillColor: 'var(--color-primary)', fillOpacity: 0.2 }} />
                      </>
                    )}
                  </MapContainer>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  * Puedes hacer clic directamente en el mapa para ajustar con precisión la ubicación donde viste o perdiste a la mascota. El círculo indica el área de influencia del reporte.
                </p>
              </div>
            </div>

            {/* Footer del Modal (fijo al final) */}
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-sidebar)', flexShrink: 0, display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} onClick={resetForm}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveReport}>
                {editingReportId ? 'Guardar Cambios' : 'Publicar Reporte'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
