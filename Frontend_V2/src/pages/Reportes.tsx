import { useState, useEffect } from 'react';
import { FileText, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
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

export const Reportes = () => {
  const { addNotification, user } = useAuth();
  const [reportesDummy, setReportesDummy] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('app_reportes_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

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

  const handleSaveReport = () => {
    const newReport = {
      id: Date.now(),
      lat: nuevoReporte.lat,
      lng: nuevoReporte.lng,
      titulo: nuevoReporte.titulo || (nuevoReporte.tipo === 'Perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'),
      tipo: nuevoReporte.tipo,
      estado: 'Activo',
      userId: user?.id,
      // extra fields for later use
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
    setIsModalOpen(false);
    // Reset form
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

  const misReportes = reportesDummy.filter(r => r.userId === user?.id && user?.id !== undefined);
  const reportesGenerales = reportesDummy.filter(r => r.userId !== user?.id || user?.id === undefined);

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(255, 0, 127, 0.1)', borderRadius: '12px', color: 'var(--color-secondary)' }}>
          <FileText size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Reportes de Mascotas</h1>
          <p style={{ margin: 0 }}>Visualiza y gestiona los reportes de mascotas perdidas y encontradas.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--color-primary)" /> Mapa de Geolocalización
            </h3>
            <button
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              onClick={() => setIsModalOpen(true)}
            >
              + Nuevo Reporte
            </button>
          </div>

          <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <MapContainer center={[-33.4489, -70.6693]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reportesDummy.map((repo) => (
                <Marker key={repo.id} position={[repo.lat, repo.lng]}>
                  <Popup>
                    <strong style={{ color: '#000' }}>{repo.titulo}</strong><br />
                    <span style={{ color: repo.tipo === 'Perdido' ? 'red' : 'green' }}>{repo.tipo}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--color-primary)" /> Mis Reportes
          </h3>
          {misReportes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No tienes reportes creados aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {misReportes.map((repo) => (
                <div key={repo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{repo.titulo}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.tipo === 'Perdido' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: repo.tipo === 'Perdido' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {repo.tipo}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.estado === 'Activo' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: repo.estado === 'Activo' ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                        {repo.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--color-primary)" /> Reportes generales
          </h3>
          {reportesGenerales.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay reportes generales disponibles.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reportesGenerales.map((repo) => (
                <div key={repo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{repo.titulo}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.tipo === 'Perdido' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: repo.tipo === 'Perdido' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {repo.tipo}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: repo.estado === 'Activo' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: repo.estado === 'Activo' ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                        {repo.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nuevo reporte */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} color="var(--color-primary)" /> Crear Nuevo Reporte
            </h2>
            <div className="form-group">
              <label className="form-label">Título del reporte</label>
              <input type="text" className="form-input" placeholder="Ej. Perrito blanco perdido en Providencia" value={nuevoReporte.titulo} onChange={(e) => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Reporte</label>
              <select className="form-input" value={nuevoReporte.tipo} onChange={(e) => setNuevoReporte({ ...nuevoReporte, tipo: e.target.value })}>
                <option value="Perdido">Mascota Perdida</option>
                <option value="Encontrado">Mascota Encontrada</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Especie</label>
              <select className="form-input" value={nuevoReporte.animal} onChange={(e) => setNuevoReporte({ ...nuevoReporte, animal: e.target.value })}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
              </select>
            </div>
            {/* Conditional fields based on report type */}
            {nuevoReporte.tipo === 'Perdido' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre de la mascota</label>
                  <input type="text" className="form-input" value={nuevoReporte.nombre} onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input type="number" className="form-input" min="0" value={nuevoReporte.edad} onChange={(e) => setNuevoReporte({ ...nuevoReporte, edad: e.target.value })} />
                </div>
              </>
            )}
            {/* Campos comunes */}
            <div className="form-group">
              <label className="form-label">Color</label>
              <input type="text" className="form-input" value={nuevoReporte.color} onChange={(e) => setNuevoReporte({ ...nuevoReporte, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Raza</label>
              {nuevoReporte.animal === 'Perro' ? (
                <select className="form-input" value={nuevoReporte.raza} onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })}>
                  <option value="">Seleccione una raza...</option>
                  <option value="Labrador Retriever">Labrador Retriever</option>
                  <option value="Pastor Alemán">Pastor Alemán</option>
                  <option value="Bulldog Francés">Bulldog Francés</option>
                  <option value="Golden Retriever">Golden Retriever</option>
                  <option value="Chihuahua">Chihuahua</option>
                  <option value="Caniche (Poodle)">Caniche (Poodle)</option>
                  <option value="Border Collie">Border Collie</option>
                </select>
              ) : nuevoReporte.animal === 'Gato' ? (
                <select className="form-input" value={nuevoReporte.raza} onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })}>
                  <option value="">Seleccione una raza...</option>
                  <option value="Persa">Persa</option>
                  <option value="Siamés">Siamés</option>
                  <option value="Maine Coon">Maine Coon</option>
                  <option value="Sphynx (Esfinge)">Sphynx (Esfinge)</option>
                  <option value="Bengala">Bengala</option>
                  <option value="Ragdoll">Ragdoll</option>
                  <option value="Gato Común Europeo">Gato Común Europeo</option>
                </select>
              ) : nuevoReporte.animal === 'Conejo' ? (
                <select className="form-input" value={nuevoReporte.raza} onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })}>
                  <option value="">Seleccione una raza...</option>
                  <option value="Belier (Lop)">Belier (Lop)</option>
                  <option value="Cabeza de León">Cabeza de León</option>
                  <option value="Angora">Angora</option>
                  <option value="Rex">Rex</option>
                  <option value="Holandés Enano">Holandés Enano</option>
                  <option value="Gigante de Flandes">Gigante de Flandes</option>
                  <option value="Conejo Holandés">Conejo Holandés</option>
                </select>
              ) : (
                <input type="text" className="form-input" placeholder="Escribe la raza" value={nuevoReporte.raza} onChange={(e) => setNuevoReporte({ ...nuevoReporte, raza: e.target.value })} />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Imagen del animal</label>
              <input type="file" accept="image/*" className="form-input" onChange={(e) => {
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
              }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Ubicación (Haz clic en el mapa para marcar el punto y generar el radio de 5km)</label>
              <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <MapContainer center={[-33.4489, -70.6693]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onLocationSelected={(lat, lng) => setNuevoReporte({ ...nuevoReporte, lat, lng })} />
                  {nuevoReporte.lat && nuevoReporte.lng && (
                    <>
                      <Marker position={[nuevoReporte.lat, nuevoReporte.lng]} />
                      <Circle center={[nuevoReporte.lat, nuevoReporte.lng]} radius={5000} pathOptions={{ color: 'var(--color-primary)', fillColor: 'var(--color-primary)', fillOpacity: 0.2 }} />
                    </>
                  )}
                </MapContainer>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveReport}>Guardar Reporte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
