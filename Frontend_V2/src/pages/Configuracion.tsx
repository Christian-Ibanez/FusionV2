import { Settings } from 'lucide-react';

export const Configuracion = () => {
  return (
    <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(158, 206, 106, 0.1)', borderRadius: '12px', color: 'var(--color-success)' }}>
          <Settings size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Configuración del Sistema</h1>
          <p style={{ margin: 0 }}>Ajustes generales, integraciones y preferencias del servidor.</p>
        </div>
      </div>
      
      <div className="surface" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Panel de configuración en desarrollo.</p>
      </div>
    </div>
  );
};
