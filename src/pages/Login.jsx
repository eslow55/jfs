import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

// Importación de tus imágenes reales
import logoDark from '../assets/images/logo-dark.png';
import logoLight from '../assets/images/logo-light.png';

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
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Acceso denegado. Verifica las credenciales de administrador.');
    } finally {
      setCargando(false);
    }
  };

  const estiloInput = {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: 'var(--bg-primary, #ffffff)',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: '14px',
    color: 'var(--text-main, #0f172a)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  // Componente interno para no repetir el marcado de imágenes del logo
  const LogoAsset = () => (
    <>
      <img src={logoDark} className="particle-img light-only" alt="JFS" />
      <img src={logoLight} className="particle-img dark-only" alt="JFS" />
    </>
  );

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '40px 20px 140px',
      boxSizing: 'border-box'
    }}>
      
      {/* --- MATRIZ MASIVA DE LOGOS ANIMADOS (PARALAJE INTERACTIVO) --- */}
      <div className="login-bg-matrix">
        {/* PLANO PROFUNDO (Chicos, muy sutiles, lentos) */}
        <div className="orbit-node back p1"><LogoAsset /></div>
        <div className="orbit-node back p2"><LogoAsset /></div>
        <div className="orbit-node back p3"><LogoAsset /></div>
        <div className="orbit-node back p4"><LogoAsset /></div>

        {/* PLANO MEDIO (Tamaño estándar, órbitas elípticas) */}
        <div className="orbit-node mid p5"><LogoAsset /></div>
        <div className="orbit-node mid p6"><LogoAsset /></div>
        <div className="orbit-node mid p7"><LogoAsset /></div>
        <div className="orbit-node mid p8"><LogoAsset /></div>

        {/* PLANO FRONTAL (Grandes, desenfoque ligero opcional, dinámicos) */}
        <div className="orbit-node front p9"><LogoAsset /></div>
        <div className="orbit-node front p10"><LogoAsset /></div>
        <div className="orbit-node front p11"><LogoAsset /></div>
        <div className="orbit-node front p12"><LogoAsset /></div>
      </div>

      {/* Aura de iluminación atmosférica central */}
      <div className="login-glow-core" />

      {/* --- TARJETA PREMIUM ESTILO CYBER-MINIMALISTA --- */}
      <div style={{ 
        maxWidth: '440px',
        width: '100%',
        background: 'var(--bg-secondary, #ffffff)', 
        border: '1px solid var(--border, #e2e8f0)', 
        borderRadius: '28px', 
        padding: '44px 36px', 
        position: 'relative',
        zIndex: 5,
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.04)'
      }} className="login-card-premium">
        
        {/* --- ENCABEZADO --- */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '14px', 
            background: 'rgba(0, 204, 136, 0.08)', 
            border: '1px solid rgba(0, 204, 136, 0.2)',
            borderRadius: '20px', 
            color: 'var(--accent, #00cc88)', 
            marginBottom: '18px'
          }} className="badge-pulse">
            <ShieldCheck size={28} className="shield-icon" />
          </div>
          
          <h2 style={{ 
            fontSize: '26px', 
            fontWeight: '800', 
            letterSpacing: '-0.75px', 
            margin: 0, 
            color: 'var(--text-main, #0f172a)' 
          }}>
            Acceso Staff
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '14px', marginTop: '6px', margin: 0 }}>
            Panel de administración JFS
          </p>
        </div>

        {/* --- ALERTA DE ERROR --- */}
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'rgba(239, 68, 68, 0.06)', 
            border: '1px solid var(--danger, #ef4444)', 
            padding: '14px', 
            borderRadius: '14px', 
            color: 'var(--danger, #ef4444)', 
            fontSize: '13.5px', 
            marginBottom: '26px',
            boxSizing: 'border-box'
          }} className="shake-alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        )}

        {/* --- FORMULARIO --- */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div className="cyber-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted, #64748b)', marginBottom: '8px' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)', transition: 'all 0.3s' }} className="field-icon" />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="admin@jfs.com"
                style={estiloInput}
                className="input-premium"
              />
            </div>
          </div>

          <div className="cyber-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted, #64748b)', marginBottom: '8px' }}>
              Contraseña de Seguridad
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748b)', transition: 'all 0.3s' }} className="field-icon" />
              <input
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                style={estiloInput}
                className="input-premium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{ 
              marginTop: '12px', 
              height: '50px', 
              borderRadius: '14px', 
              background: cargando ? 'var(--border, #e2e8f0)' : 'var(--accent, #00cc88)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: cargando ? 'none' : '0 6px 24px rgba(0, 204, 136, 0.2)'
            }}
            className="btn-premium"
          >
            {cargando ? (
              <>
                <Loader2 size={16} className="loader-spin" /> Verificando...
              </>
            ) : (
              <>
                <span>Ingresar</span>
                <div className="btn-shimmer" />
              </>
            )}
          </button>

        </form>
      </div>

      {/* --- ARQUITECTURA DE ESTILOS Y CINEMÁTICA --- */}
      <style>{`
        .login-bg-matrix {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 1;
          perspective: 1200px;
        }

        /* Swapper automático de logos de acuerdo a las clases globales del theme */
        .dark-only { display: none; }
        [data-theme="dark"] .dark-only, .dark .dark-only { display: block; }
        [data-theme="dark"] .light-only, .dark .light-only { display: none; }

        .particle-img {
          width: 100%; height: auto; display: block;
        }

        /* Estructura base de los nodos del fondo */
        .orbit-node {
          position: absolute;
          user-select: none;
          will-change: transform, opacity;
        }

        /* --- FILTROS DE CAPAS (Profundidad de Campo) --- */
        .back { opacity: 0.02; filter: blur(1px); }
        .mid { opacity: 0.04; }
        .front { opacity: 0.06; filter: drop-shadow(0 15px 30px rgba(0,204,136,0.05)); }

        /* --- COORDENADAS Y CONFIGURACIONES BRUTALES DE VELOCIDAD --- */
        /* Plano del Fondo (Lentos y envolventes) */
        .p1 { width: 70px; top: 8%; left: 12%; animation: orbitClockwise 32s linear infinite; }
        .p2 { width: 60px; top: 82%; left: 8%; animation: orbitCounter 28s linear infinite; }
        .p3 { width: 85px; top: 12%; right: 15%; animation: orbitCounter 35s linear infinite; }
        .p4 { width: 65px; top: 78%; right: 5%; animation: orbitClockwise 30s linear infinite; }

        /* Plano Medio (Estándar con balanceo lateral progresivo) */
        .p5 { width: 110px; top: 40%; left: 5%; animation: orbitShiftX 22s ease-in-out infinite alternate; }
        .p6 { width: 95px; top: 22%; left: 75%; animation: orbitClockwise 24s linear infinite; }
        .p7 { width: 105px; top: 68%; left: 38%; animation: orbitShiftY 26s ease-in-out infinite alternate; }
        .p8 { width: 90px; top: 52%; right: 8%; animation: orbitCounter 21s linear infinite; }

        /* Plano Frontal (Dinámicos y con micro-escalas) */
        .p9 { width: 150px; top: -2%; left: 35%; animation: orbitComplex 18s linear infinite; }
        .p10 { width: 130px; top: 85%; left: 78%; animation: orbitComplex 20s linear infinite; }
        .p11 { width: 120px; top: 48%; left: 88%; animation: orbitClockwise 16s linear infinite; }
        .p12 { width: 140px; top: 55%; left: -4%; animation: orbitCounter 19s linear infinite; }

        /* --- ANIMACIONES DE CINEMÁTICA PURA --- */
        @keyframes orbitClockwise {
          0% { transform: rotate(0deg) translateY(0) scale(1); }
          50% { transform: rotate(180deg) translateY(-15px) scale(1.05); }
          100% { transform: rotate(360deg) translateY(0) scale(1); }
        }
        @keyframes orbitCounter {
          0% { transform: rotate(360deg) translateY(0) scale(1); }
          50% { transform: rotate(180deg) translateY(15px) scale(0.95); }
          100% { transform: rotate(0deg) translateY(0) scale(1); }
        }
        @keyframes orbitComplex {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-25px) translateX(15px) rotate(120deg); }
          66% { transform: translateY(15px) translateX(-20px) rotate(240deg); }
          100% { transform: translateY(0) translateX(0) rotate(360deg); }
        }
        @keyframes orbitShiftX {
          0% { transform: translateX(-20px) rotate(-10deg); }
          100% { transform: translateX(20px) rotate(15deg); }
        }
        @keyframes orbitShiftY {
          0% { transform: translateY(-30px) scale(0.95); }
          100% { transform: translateY(20px) scale(1.05); }
        }

        /* Iluminación Atmosférica de Fondo */
        .login-glow-core {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 140%; height: 140%;
          background: radial-gradient(circle, rgba(0, 204, 136, 0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 2;
          animation: pulseAura 6s ease-in-out infinite alternate;
        }
        @keyframes pulseAura {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.93); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
        }

        /* --- COMPORTAMIENTO DE INTERFAZ PREMIUM --- */
        .login-card-premium {
          animation: premiumEntry 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transition: border-color 0.4s, box-shadow 0.4s, transform 0.4s;
        }
        .login-card-premium:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 204, 136, 0.3) !important;
          box-shadow: 0 45px 90px rgba(0,0,0,0.07), 0 0 60px rgba(0, 204, 136, 0.03) !important;
        }
        @keyframes premiumEntry {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        /* Animación del Escudo */
        .badge-pulse { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .login-card-premium:hover .badge-pulse { 
          transform: scale(1.12) rotate(8deg); 
          background: rgba(0, 204, 136, 0.12);
        }

        /* Inputs de Alto Rendimiento */
        .input-premium:focus {
          border-color: var(--accent, #00cc88) !important;
          box-shadow: 0 0 0 5px rgba(0, 204, 136, 0.08) !important;
          transform: scale(1.015);
        }
        .cyber-field:focus-within .field-icon {
          color: var(--accent, #00cc88) !important;
          transform: translateY(-50%) scale(1.15);
        }

        /* Destello que cruza el Botón Principal (Shimmer Effect) */
        .btn-shimmer {
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-30deg);
        }
        .btn-premium:not(:disabled):hover .btn-shimmer {
          left: 160%;
          transition: left 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .btn-premium:not(:disabled):hover {
          box-shadow: 0 8px 30px rgba(0, 204, 136, 0.4) !important;
          transform: translateY(-2px);
        }
        .btn-premium:not(:disabled):active {
          transform: translateY(0) scale(0.985);
        }

        /* Alerta de Error Dinámica */
        .shake-alert { animation: dynamicShake 0.4s ease-in-out; }
        @keyframes dynamicShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .loader-spin { animation: coreSpin 0.75s linear infinite; }
        @keyframes coreSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}