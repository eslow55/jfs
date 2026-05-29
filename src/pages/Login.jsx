import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(correo, contrasena);
      // Si todo sale bien, lo mandamos al Panel de Control principal
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Verifica el acceso del administrador.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto 0', padding: '0 20px' }}>
      <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0, 255, 135, 0.05)', borderRadius: '50%', color: 'var(--accent)', marginBottom: '12px' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Acceso Staff</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Panel exclusivo para la gestión de JFS Página</p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 74, 74, 0.1)', border: '1px solid rgba(255, 74, 74, 0.2)', padding: '12px', borderRadius: '8px', color: '#ff6b6b', fontSize: '13.5px', marginBottom: '20px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#62626a' }} />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="admin@jfs.com"
                style={{ paddingLeft: '42px', background: '#0e0e11', border: '1px solid #232329' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Contraseña de Seguridad</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#62626a' }} />
              <input
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '42px', background: '#0e0e11', border: '1px solid #232329' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{ marginTop: '10px', height: '46px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 255, 135, 0.15)' }}
          >
            {cargando ? 'Verificando...' : 'Autenticar'}
          </button>

        </form>
      </div>
    </div>
  );
}