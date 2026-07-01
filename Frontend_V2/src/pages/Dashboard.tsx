import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogOut, LayoutDashboard, Settings, User as UserIcon, Shield, FileText, AlertTriangle, Users, Bell, Check, X } from 'lucide-react';
import { useNavigate, Link, useLocation, Routes, Route } from 'react-router-dom';

import { Overview } from './Overview';
import { Usuarios } from './Usuarios';
import { Reportes } from './Reportes';
import { Alertas } from './Alertas';
import { Configuracion } from './Configuracion';
import { Perfil } from './Perfil';
import { SolicitudesRol } from './SolicitudesRol';
import { Clinicas } from './Clinicas';
import { Notificaciones } from './Notificaciones';
import { userApi } from '../api';

export const Dashboard = () => {
  const { user, logout, notifications: allNotifications, updateNotification, addNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (rol: string | undefined) => {
    switch (rol) {
      case 'ADMINISTRADOR': return 'var(--color-danger)';
      case 'VETERINARIA': return 'var(--color-success)';
      case 'REFUGIO': return 'var(--color-warning)';
      default: return 'var(--color-primary)';
    }
  };

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = allNotifications.filter(n => {
    if (n.read) return false;
    if (isAdmin && n.type === 'role_request') return true;
    return n.userId === user?.id;
  });

  const closeAndClearNotifications = () => {
    setShowNotifications(false);
    // Marcamos todas las notificaciones push (no de rol) como leídas
    const idsToClear = notifications.filter(n => n.type !== 'role_request').map(n => n.id);
    idsToClear.forEach(id => updateNotification(id, { read: true }));
  };

  const handleAcceptRole = async (notif: any) => {
    try {
      await userApi.updateRole(notif.actionData.userId, notif.actionData.requestedRole);
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
    updateNotification(notif.id, { read: true, type: 'role_request_rejected', text: `Solicitud de ${notif.actionData.requestedRole} de ${notif.actionData.userName} (Rechazada)` });
    addNotification({
      userId: notif.actionData.userId,
      text: `Tu solicitud de cambio de rol a ${notif.actionData.requestedRole} ha sido rechazada.`,
      type: 'danger'
    });
  };

  const adminMenu = [
    { title: 'Resumen', path: '', icon: <LayoutDashboard size={20} /> },
    { title: 'Gestión Usuarios', path: 'usuarios', icon: <Users size={20} /> },
    { title: 'Solicitudes de Rol', path: 'solicitudes-rol', icon: <Shield size={20} /> },
    { title: 'Reportes Generales', path: 'reportes', icon: <FileText size={20} /> },
    { title: 'Notificaciones', path: 'notificaciones', icon: <Bell size={20} /> },
    { title: 'Mi Perfil', path: 'perfil', icon: <UserIcon size={20} /> },
    { title: 'Configuración del Sistema', path: 'configuracion', icon: <Settings size={20} /> },
  ];

  const userMenu = [
    { title: 'Mi Panel', path: '', icon: <LayoutDashboard size={20} /> },
    { title: 'Reportes', path: 'reportes', icon: <FileText size={20} /> },
    { title: 'Alertas Locales', path: 'alertas', icon: <AlertTriangle size={20} /> },
    { title: 'Notificaciones', path: 'notificaciones', icon: <Bell size={20} /> },
    { title: 'Mi Perfil', path: 'perfil', icon: <UserIcon size={20} /> },
  ];

  const vetMenu = [
    { title: 'Mi Panel', path: '', icon: <LayoutDashboard size={20} /> },
    { title: 'Reportes', path: 'reportes', icon: <FileText size={20} /> },
    { title: 'Directorio Clínicas', path: 'clinicas', icon: <Shield size={20} /> },
    { title: 'Alertas Locales', path: 'alertas', icon: <AlertTriangle size={20} /> },
    { title: 'Notificaciones', path: 'notificaciones', icon: <Bell size={20} /> },
    { title: 'Mi Perfil', path: 'perfil', icon: <UserIcon size={20} /> },
  ];

  const refugioMenu = [
    { title: 'Mi Panel', path: '', icon: <LayoutDashboard size={20} /> },
    { title: 'Animales en Custodia', path: 'reportes', icon: <FileText size={20} /> },
    { title: 'Alertas Locales', path: 'alertas', icon: <AlertTriangle size={20} /> },
    { title: 'Notificaciones', path: 'notificaciones', icon: <Bell size={20} /> },
    { title: 'Mi Perfil', path: 'perfil', icon: <UserIcon size={20} /> },
  ];

  const sidebarMenu = isAdmin ? adminMenu : (user?.rol === 'VETERINARIA' ? vetMenu : (user?.rol === 'REFUGIO' ? refugioMenu : userMenu));

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Sanos y Salvos</h2>
        </div>

        <nav className="sidebar-nav">
          {sidebarMenu.map((item, idx) => {
            const fullPath = `/dashboard${item.path ? '/' + item.path : ''}`;
            const isActive = location.pathname === fullPath || location.pathname === fullPath + '/';
            return (
              <Link 
                to={fullPath} 
                key={idx} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              Panel {isAdmin ? 'de Administración' : 'de Usuario'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => {
                if (showNotifications) {
                  closeAndClearNotifications();
                } else {
                  setShowNotifications(true);
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={24} />
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="surface animate-fade-in" style={{ position: 'absolute', top: '100%', right: '100px', width: '340px', marginTop: '1.5rem', padding: '1rem', zIndex: 1000, boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notificaciones</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{notif.text}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{notif.date}</span>
                      {notif.type === 'role_request' && isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => handleAcceptRole(notif)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}><Check size={14}/> Aceptar</button>
                          <button onClick={() => handleRejectRole(notif)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}><X size={14}/> Rechazar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <UserIcon size={18} color="var(--color-text-muted)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.nombreCompleto || 'Usuario'}</span>
              <span style={{ 
                fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', 
                background: 'rgba(255,255,255,0.1)', color: getRoleColor(user?.rol), fontWeight: 700 
              }}>
                {user?.rol || 'CIUDADANO'}
              </span>
            </div>
          </div>
        </header>

        <main className="container" style={{ paddingBottom: '4rem', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Overview menuItems={sidebarMenu} />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="solicitudes-rol" element={<SolicitudesRol />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="alertas" element={<Alertas />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="clinicas" element={<Clinicas />} />
            <Route path="notificaciones" element={<Notificaciones />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
