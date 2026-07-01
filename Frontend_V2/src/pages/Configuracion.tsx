import { useState } from 'react';
import { Settings, Bell, Server, Shield, Save, Sliders } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Configuracion = () => {
  const { addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState('General');

  // General State
  const [modoMantenimiento, setModoMantenimiento] = useState(false);
  const [correoSoporte, setCorreoSoporte] = useState('soporte@miapp.com');
  const [textosLegales, setTextosLegales] = useState('Términos y Condiciones...');

  // Alertas State
  const [radioAlertas, setRadioAlertas] = useState(5);
  const [expiracionReportes, setExpiracionReportes] = useState(30);
  const [limiteReportesUsuario, setLimiteReportesUsuario] = useState(5);

  // APIs State
  const [mapApiKey, setMapApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [awsS3AccessKey, setAwsS3AccessKey] = useState('');

  // Seguridad State
  const [palabrasProhibidas, setPalabrasProhibidas] = useState('spam, fraude, insulto');
  const [politicaRegistro, setPoliticaRegistro] = useState('correo');

  const handleSave = () => {
    addNotification({
      text: 'Configuración guardada correctamente.',
      type: 'success'
    });
  };

  const tabs = [
    { id: 'General', label: 'General', icon: Sliders },
    { id: 'Alertas', label: 'Alertas', icon: Bell },
    { id: 'APIs', label: 'Integraciones y APIs', icon: Server },
    { id: 'Seguridad', label: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(158, 206, 106, 0.1)', borderRadius: '12px', color: 'var(--color-success)' }}>
            <Settings size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Configuración del Sistema</h1>
            <p style={{ margin: 0 }}>Ajustes generales, integraciones y preferencias de la plataforma.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> Guardar Cambios
        </button>
      </div>
      
      {/* Tabs Menu (Horizontal) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Tab Content */}
        <div className="surface" style={{ padding: '2rem' }}>
          {activeTab === 'General' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="var(--color-primary)" /> Configuración General y de Mantenimiento
              </h3>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Modo Mantenimiento</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Desactiva temporalmente el acceso público a la plataforma si necesitan hacer una actualización crítica.</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '48px', height: '24px', background: modoMantenimiento ? 'var(--color-danger)' : 'var(--color-border)', borderRadius: '12px', transition: '0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: modoMantenimiento ? '26px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s' }}></div>
                  </div>
                  <input type="checkbox" style={{ display: 'none' }} checked={modoMantenimiento} onChange={(e) => setModoMantenimiento(e.target.checked)} />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Correos de Soporte/Contacto</label>
                <input type="email" className="form-input" value={correoSoporte} onChange={(e) => setCorreoSoporte(e.target.value)} placeholder="Dónde llegan los mensajes si un usuario tiene problemas..." />
              </div>

              <div className="form-group">
                <label className="form-label">Gestión de Textos Legales (Políticas de Privacidad o Términos y Condiciones)</label>
                <textarea className="form-input" style={{ minHeight: '150px', resize: 'vertical' }} value={textosLegales} onChange={(e) => setTextosLegales(e.target.value)} placeholder="Actualizar las Políticas de Privacidad o Términos y Condiciones..."></textarea>
              </div>
            </div>
          )}

          {activeTab === 'Alertas' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="var(--color-primary)" /> Parámetros del Sistema de Alertas (El Core del Negocio)
              </h3>

              <div className="form-group">
                <label className="form-label">Radio de Alertas Locales (km)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="range" min="1" max="50" value={radioAlertas} onChange={(e) => setRadioAlertas(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-primary)' }} />
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 'bold' }}>{radioAlertas} km</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Definir el radio geográfico por defecto al que se envía una alerta cuando se pierde una mascota.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiración de Reportes (días)</label>
                  <input type="number" className="form-input" value={expiracionReportes} onChange={(e) => setExpiracionReportes(Number(e.target.value))} min="1" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Cuántos días debe permanecer activo un reporte antes de archivarse.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Límites de Usuario (reportes/día)</label>
                  <input type="number" className="form-input" value={limiteReportesUsuario} onChange={(e) => setLimiteReportesUsuario(Number(e.target.value))} min="1" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Cuántos reportes puede crear un usuario por día (evitar spam).</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'APIs' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={20} color="var(--color-primary)" /> Integraciones y APIs (Clave técnica)
              </h3>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--color-secondary)' }}>Mapas (Geolocalización)</h4>
                <div className="form-group">
                  <label className="form-label">API Key (Google Maps / Mapbox / Leaflet)</label>
                  <input type="password" className="form-input" value={mapApiKey} onChange={(e) => setMapApiKey(e.target.value)} placeholder="••••••••••••••••••••••••" />
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--color-secondary)' }}>Servicio de Correos (SMTP)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Para el envío de correos transaccionales (confirmación de cuentas, notificaciones de coincidencias).</p>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Servidor SMTP</label>
                    <input type="text" className="form-input" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.ejemplo.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Puerto</label>
                    <input type="text" className="form-input" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Usuario SMTP</label>
                    <input type="text" className="form-input" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contraseña SMTP</label>
                    <input type="password" className="form-input" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--color-secondary)' }}>Almacenamiento (Ej. AWS S3)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Integrar credenciales para servicios de almacenamiento en la nube donde se suben fotos de mascotas.</p>
                <div className="form-group">
                  <label className="form-label">Access Key / Cloud Name</label>
                  <input type="text" className="form-input" value={awsS3AccessKey} onChange={(e) => setAwsS3AccessKey(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secret Key</label>
                  <input type="password" className="form-input" placeholder="••••••••••••••••••••••••" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Seguridad' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--color-primary)" /> Moderación y Seguridad
              </h3>

              <div className="form-group">
                <label className="form-label">Filtro de Contenido</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '100px', resize: 'vertical' }} 
                  value={palabrasProhibidas} 
                  onChange={(e) => setPalabrasProhibidas(e.target.value)}
                  placeholder="Ej: grosería1, grosería2..."
                ></textarea>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Lista de palabras prohibidas que el sistema bloquee automáticamente en las descripciones de los reportes.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Políticas de Registro</label>
                <select className="form-input" value={politicaRegistro} onChange={(e) => setPoliticaRegistro(e.target.value)}>
                  <option value="libre">Libre (Cualquiera puede registrarse)</option>
                  <option value="correo">Requiere confirmación por correo electrónico obligatoria</option>
                  <option value="restringido">Restringido (Solo invitaciones o manual)</option>
                </select>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Define cómo se comportan los nuevos registros de usuarios.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
