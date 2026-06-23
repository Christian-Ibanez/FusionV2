import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

const countryCodes = [
  { code: '+54', country: 'Argentina' },
  { code: '+591', country: 'Bolivia' },
  { code: '+55', country: 'Brasil' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+53', country: 'Cuba' },
  { code: '+593', country: 'Ecuador' },
  { code: '+503', country: 'El Salvador' },
  { code: '+34', country: 'España' },
  { code: '+1', country: 'EE.UU / Canadá' },
  { code: '+502', country: 'Guatemala' },
  { code: '+504', country: 'Honduras' },
  { code: '+52', country: 'México' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+507', country: 'Panamá' },
  { code: '+595', country: 'Paraguay' },
  { code: '+51', country: 'Perú' },
  { code: '+598', country: 'Uruguay' },
  { code: '+58', country: 'Venezuela' }
];

export const Register = () => {
  const [codigoPais, setCodigoPais] = useState('+56');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    nombreInstitucion: '',
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números y un máximo de 9 dígitos
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, telefono: value });
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!validatePassword(formData.contrasena)) {
      setError('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.');
      return;
    }

    if (formData.telefono.length !== 9) {
      setError('El número de teléfono local debe tener exactamente 9 dígitos.');
      return;
    }

    const dataToSubmit = {
      ...formData,
      telefono: `${codigoPais} ${formData.telefono}`
    };

    setIsLoading(true);
    setError('');
    try {
      await authApi.register(dataToSubmit);
      // Automatically navigate to login on success
      navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <UserPlus size={32} color="#fff" />
          </div>
          <h2>Crear Cuenta</h2>
          <p>Únete a Sanos y Salvos</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <User size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                name="nombre"
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                name="correo"
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-input" 
                style={{ width: '110px', flexShrink: 0, paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
              >
                {countryCodes.map((c, i) => (
                  <option key={i} value={c.code}>{c.code} {c.country}</option>
                ))}
              </select>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="tel" 
                  name="telefono"
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '3rem' }}
                  value={formData.telefono}
                  onChange={handlePhoneChange}
                  placeholder="Ej: 987654321"
                  required
                />
              </div>
            </div>
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block', fontSize: '0.75rem' }}>
              Debe contener exactamente 9 dígitos.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={mostrarContrasena ? "text" : "password"} 
                name="contrasena"
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem', paddingRight: '3rem' }}
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                {mostrarContrasena ? <EyeOff size={20} color="var(--color-text-muted)" /> : <Eye size={20} color="var(--color-text-muted)" />}
              </button>
            </div>
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block', fontSize: '0.75rem' }}>
              Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={mostrarConfirmarContrasena ? "text" : "password"} 
                name="confirmarContrasena"
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem', paddingRight: '3rem' }}
                value={formData.confirmarContrasena}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                {mostrarConfirmarContrasena ? <EyeOff size={20} color="var(--color-text-muted)" /> : <Eye size={20} color="var(--color-text-muted)" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Completar Registro'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};
