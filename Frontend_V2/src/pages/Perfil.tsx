import { useState, useEffect } from 'react';
import { User as UserIcon, Edit2, Check, X, ShieldAlert, UploadCloud, FileText, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { userApi } from '../api';

export const Perfil = () => {
  const { user, updateUser, addNotification } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [requestedRole, setRequestedRole] = useState('VETERINARIA');
  const [certificado, setCertificado] = useState<File | null>(null);
  const [roleModalError, setRoleModalError] = useState('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  useEffect(() => {
    if (user) {
      setNombreCompleto(user.nombreCompleto || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user || !user.id) return;
    setCargando(true);
    setMensaje('');
    try {
      const updatedUser = await userApi.updateProfile(user.id, {
        nombreCompleto,
        telefono
      });
      updateUser(updatedUser);
      setMensaje('Perfil actualizado correctamente.');
      setIsEditing(false); // volver a la vista estática
    } catch (error) {
      console.error(error);
      setMensaje('Error al actualizar el perfil.');
    } finally {
      setCargando(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setNombreCompleto(user.nombreCompleto || '');
      setTelefono(user.telefono || '');
    }
    setIsEditing(false);
    setMensaje('');
  };

  const handleRoleRequest = async () => {
    if (!user) return;

    if (!certificado) {
      setRoleModalError("Debe subir un documento que valide su institución");
      return;
    }

    setRoleModalError('');
    setIsSubmittingRole(true);

    // Simulamos un tiempo de subida de archivo para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 1500));

    addNotification({
      userId: user.id,
      text: `Tu solicitud de cambio de rol a ${requestedRole} está pendiente de aprobación.`,
      type: 'pending'
    });

    addNotification({
      text: `Solicitud de cambio de rol: ${user.nombreCompleto} desea ser ${requestedRole}.`,
      type: 'role_request',
      actionData: {
        userId: user.id,
        userName: user.nombreCompleto,
        requestedRole: requestedRole,
        documentoNombre: certificado?.name,
        documentoUrl: certificado ? URL.createObjectURL(certificado) : null
      }
    });

    setMensaje(`Solicitud para cambiar de rol a ${requestedRole} enviada al administrador.`);
    setIsRoleModalOpen(false);
    setCertificado(null);
    setIsSubmittingRole(false);
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(122, 92, 255, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
          <UserIcon size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Mi Perfil</h1>
          <p style={{ margin: 0 }}>Consulta y gestiona tu información personal.</p>
        </div>
      </div>
      
      <div className="surface" style={{ padding: '2rem', maxWidth: '600px', position: 'relative' }}>
        {mensaje && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: mensaje.includes('Error') ? 'rgba(255, 99, 132, 0.1)' : 'rgba(75, 192, 192, 0.1)', color: mensaje.includes('Error') ? '#ff6384' : '#4bc0c0' }}>
            {mensaje}
          </div>
        )}

        {!isEditing ? (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Nombre Completo</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user?.nombreCompleto}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Correo Electrónico</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user?.correoElectronico}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Teléfono</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user?.telefono || 'No registrado'}</p>
            </div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Rol / Tipo de Cuenta</p>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(122, 92, 255, 0.1)', color: 'var(--color-primary)', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 }}>
                  {user?.rol}
                </span>
              </div>
              {user?.rol !== 'ADMINISTRADOR' && (
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setIsRoleModalOpen(true)}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
                >
                  <ShieldAlert size={16} /> Solicitar cambio de rol
                </button>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => { setIsEditing(true); setMensaje(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Edit2 size={18} /> Modificar datos
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                value={nombreCompleto} 
                onChange={(e) => setNombreCompleto(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-input" 
                value={user?.correoElectronico || ''} 
                readOnly 
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>El correo electrónico no se puede modificar.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input 
                type="text" 
                className="form-input" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdate}
                disabled={cargando}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}
              >
                {cargando ? 'Guardando...' : <><Check size={18} /> Guardar cambios</>}
              </button>
              <button 
                className="btn" 
                onClick={handleCancel}
                disabled={cargando}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <X size={18} /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Modal de Solicitud de Cambio de Rol */}
        {isRoleModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
              <button onClick={() => { setIsRoleModalOpen(false); setRoleModalError(''); setCertificado(null); }} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={24} color="var(--color-secondary)" /> Solicitar Cambio de Rol
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Si representas a una veterinaria o refugio, puedes solicitar un cambio de rol. Un administrador revisará tu solicitud.
              </p>

              {roleModalError && (
                <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255, 99, 132, 0.1)', color: '#ff6384', fontSize: '0.9rem' }}>
                  {roleModalError}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Rol solicitado</label>
                <select className="form-input" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)}>
                  {user?.rol !== 'VETERINARIA' && <option value="VETERINARIA">Veterinaria</option>}
                  {user?.rol !== 'REFUGIO' && <option value="REFUGIO">Refugio</option>}
                  {user?.rol !== 'CIUDADANO' && <option value="CIUDADANO">Ciudadano</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Archivo de Certificación (PDF o Imagen)</label>
                
                <div style={{
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  position: 'relative',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => !certificado && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseOut={(e) => !certificado && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                >
                  <input 
                    type="file" 
                    id="certificado-upload"
                    accept=".pdf,image/*"
                    onChange={(e) => setCertificado(e.target.files?.[0] ?? null)}
                    style={{ display: 'none' }}
                  />
                  
                  {!certificado ? (
                    <label htmlFor="certificado-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', height: '100%' }}>
                      <UploadCloud size={40} color="var(--color-primary)" style={{ opacity: 0.8 }} />
                      <p style={{ margin: 0, fontWeight: 500, color: '#fff' }}>Arrastra tu certificado aquí o haz clic para explorar</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Formatos soportados: PDF, JPG, PNG</p>
                    </label>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(122, 92, 255, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                      <FileText size={24} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500, color: '#fff', wordBreak: 'break-all' }}>{certificado.name}</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setCertificado(null); }}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: 'var(--color-danger)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Eliminar archivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <small style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.75rem', display: 'block', fontSize: '0.85rem' }}>
                  Sube un documento oficial que certifique tu solicitud para ser {requestedRole.toLowerCase()}.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  className="btn" 
                  style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} 
                  onClick={() => { setIsRoleModalOpen(false); setRoleModalError(''); setCertificado(null); }}
                  disabled={isSubmittingRole}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleRoleRequest}
                  disabled={isSubmittingRole}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center', opacity: isSubmittingRole ? 0.7 : 1 }}
                >
                  {isSubmittingRole ? (
                    <>
                      <Loader size={18} className="animate-spin-custom" /> Enviando...
                    </>
                  ) : 'Enviar Solicitud'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
