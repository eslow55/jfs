import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

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
      // Redirección exitosa al Panel Administrativo
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Verifica el acceso del administrador.');
    } finally {
      setCargando(false);
    }
  };

  // Estilo común para optimizar el tamaño y la legibilidad de las cajas de texto
  const estiloInput = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ 
      maxWidth: '440px', 
      margin: '80px auto 0', 
      padding: '0 20px',
      boxSizing: 'border-box',
      color: 'var(--text-main)' 
    }}>
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border)', 
        borderRadius: '24px', 
        padding: '36px 30px', 
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)' 
      }}>
        
        {/* --- ENCABEZADO --- */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '16px', 
            color: 'var(--accent)', 
            marginBottom: '14px' 
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Acceso Staff
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', margin: 0 }}>
            Panel exclusivo para la gestión de JFS Página
          </p>
        </div>

        {/* --- ALERTA DE ERROR --- */}
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'var(--bg-primary)', 
            border: '1px solid var(--danger)', 
            padding: '12px 14px', 
            borderRadius: '12px', 
            color: 'var(--danger)', 
            fontSize: '13.5px', 
            marginBottom: '20px',
            boxSizing: 'border-box'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        )}

        {/* --- FORMULARIO DE ACCESO --- */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* CAMPO: CORREO */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="admin@jfs.com"
                style={estiloInput}
                className="login-input"
              />
            </div>
          </div>

          {/* CAMPO: CONTRASEÑA */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Contraseña de Seguridad
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                style={estiloInput}
                className="login-input"
              />
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN ACCESIBLE */}
          <button
            type="submit"
            disabled={cargando}
            style={{ 
              marginTop: '8px', 
              height: '46px', 
              borderRadius: '12px', 
              background: cargando ? 'var(--border)' : 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: cargando ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}
            className="login-submit"
          >
            {cargando ? (
              <>
                <Loader2 size={16} className="spinner" /> Verificando...
              </>
            ) : 'Autenticar'}
          </button>

        </form>
      </div>

      {/* --- INYECCIÓN DE ANIMACIONES E INTERACCIONES --- */}
      <style>{`
        .login-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
        }
        .login-submit:not(:disabled):hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .login-submit:not(:disabled):active {
          transform: translateY(0);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}