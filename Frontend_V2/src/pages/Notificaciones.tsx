import { useAuth } from '../AuthContext';
import { userApi } from '../api';
import { Bell, Check, X, ShieldAlert } from 'lucide-react';

export const Notificaciones = () => {
  const { user, notifications: allNotifications, updateNotification, addNotification } = useAuth();
  
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const notifications = allNotifications.filter(n => {
    if (isAdmin) {
      return !n.userId || n.userId === user?.id;
    } else {
      if (n.userId === user?.id) return true;
      if (!n.userId && n.type !== 'role_request') return true;
      return false;
    }
  });

  const handleAcceptRole = async (notif: any) => {
    try {
      await userApi.updateRole(notif.actionData.userId, notif.actionData.requestedRole);
      // Actualizamos para que quede en el historial permanente y desaparezca de las push
      updateNotification(notif.id, { read: true, type: 'role_request_accepted', text: `Solicitud de ${notif.actionData.requestedRole} de ${notif.actionData.userName} (Aceptada)` });
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
    // Actualizamos para que quede en el historial permanente y desaparezca de las push
    updateNotification(notif.id, { read: true, type: 'role_request_rejected', text: `Solicitud de ${notif.actionData.requestedRole} de ${notif.actionData.userName} (Rechazada)` });
    addNotification({
      userId: notif.actionData.userId,
      text: `Tu solicitud de cambio de rol a ${notif.actionData.requestedRole} ha sido rechazada.`,
      type: 'danger'
    });
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
          <Bell size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Centro de Notificaciones</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Mantente al tanto de tus alertas y solicitudes.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
        {notifications.length === 0 ? (
          <div className="surface" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Bell size={48} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem' }}>No tienes notificaciones en este momento.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="surface" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '50%', 
                background: notif.type === 'role_request' ? 'rgba(122, 92, 255, 0.1)' : 
                            notif.type === 'role_request_accepted' ? 'rgba(16, 185, 129, 0.1)' : 
                            notif.type === 'role_request_rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                            'rgba(255, 255, 255, 0.05)',
                color: notif.type === 'role_request' ? 'var(--color-secondary)' : 
                       notif.type === 'role_request_accepted' ? 'var(--color-success)' :
                       notif.type === 'role_request_rejected' ? 'var(--color-danger)' :
                       '#fff'
              }}>
                {(notif.type.includes('role_request')) ? <ShieldAlert size={24} /> : <Bell size={24} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>{notif.text}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Recibido: {notif.date}</p>
                
                {notif.type === 'role_request' && isAdmin && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                    <button 
                      onClick={() => handleAcceptRole(notif)} 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Check size={18} /> Aceptar Solicitud
                    </button>
                    <button 
                      onClick={() => handleRejectRole(notif)} 
                      className="btn" 
                      style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <X size={18} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
