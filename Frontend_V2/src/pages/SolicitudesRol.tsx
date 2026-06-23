import { useAuth } from '../AuthContext';
import { Check, X, FileText, Download } from 'lucide-react';
import { userApi } from '../api';

export const SolicitudesRol = () => {
  const { notifications, removeNotification, addNotification } = useAuth();

  const roleRequests = notifications.filter(n => n.type === 'role_request');

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
      alert("Error al actualizar el rol. Por favor, intenta de nuevo.");
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

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(122, 92, 255, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
          <FileText size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Solicitudes de Cambio de Rol</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Gestiona las solicitudes de los usuarios para cambiar su rol.</p>
        </div>
      </div>

      <div className="surface" style={{ padding: '2rem' }}>
        {roleRequests.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No hay solicitudes de cambio de rol pendientes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {roleRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {req.actionData.userName} <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(122, 92, 255, 0.1)', color: 'var(--color-primary)' }}>Solicita: {req.actionData.requestedRole}</span>
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Fecha de solicitud: {req.date}</p>
                  
                  {req.actionData.documentoNombre && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <FileText size={16} color="var(--color-text-muted)" />
                      <span style={{ fontSize: '0.9rem' }}>{req.actionData.documentoNombre}</span>
                      {req.actionData.documentoUrl && (
                        <a href={req.actionData.documentoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                          <Download size={14} /> Ver Documento
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleRejectRole(req)} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <X size={16} /> Rechazar
                  </button>
                  <button onClick={() => handleAcceptRole(req)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={16} /> Aceptar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
