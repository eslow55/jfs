import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../contexts/TemaContext';
import { Shield, Sun, Moon, Menu, X, LogOut, User, ChevronDown, Home, Radio } from 'lucide-react';

import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';

export default function Navbar() {
  const { usuario, desloguear } = useAuth(); 
  const { tema, alternarTema } = useTema();
  const location = useLocation();

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMenuMovilAbierto(false); 
    };

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuMovilAbierto(false);
    setMenuUsuarioAbierto(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ 
      background: scrolled ? 'var(--nav-bg-blur, rgba(var(--bg-primary-rgb, 255, 255, 255), 0.72))' : 'var(--bg-primary)', 
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid var(--accent-alpha, rgba(0, 204, 136, 0.15))' : '1px solid var(--border)', 
      padding: '0', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.05), inset 0 -1px 0 0 var(--border)' : 'none'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        height: isMobile ? '64px' : scrolled ? '64px' : '76px', 
        margin: '0 auto', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* LOGO CON RADAR PULSANTE FUTURISTA */}
        <Link to="/" style={{ 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          zIndex: 1002,
          position: 'relative'
        }} className="nav-logo-container">
          <img 
            src={tema === 'dark' ? logoLight : logoDark} 
            alt="JFS Logo" 
            style={{ 
              height: isMobile ? '26px' : '28px', 
              width: 'auto',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} 
          />
          <span className="logo-glow" />
        </Link>

        {/* --- NAVEGACIÓN ESCRITORIO --- */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Link to="/" className={`futuristic-link ${isActive('/') ? 'active' : ''}`}>
                <Home size={14} /> <span>Inicio</span>
              </Link>
              <Link to="/noticias" className={`futuristic-link ${isActive('/noticias') ? 'active' : ''}`}>
                <span>Noticias</span>
              </Link>
              <Link to="/foro" className={`futuristic-link ${isActive('/foro') ? 'active' : ''}`}>
                <span>Foro</span>
              </Link>
              <Link to="/galeria" className={`futuristic-link ${isActive('/galeria') ? 'active' : ''}`}>
                <span>Galería</span>
              </Link>
            </div>
            
            <div style={{ height: '20px', width: '1px', background: 'var(--border)', margin: '0 6px' }} />

            {/* Alternador de Tema */}
            <button onClick={alternarTema} className="theme-toggle-btn" title="Alternar Dimensión Visual">
              {tema === 'light' ? <Moon size={16} className="icon-spin" /> : <Sun size={16} className="icon-spin" />}
            </button>

            {/* Perfil de Usuario / Admin */}
            {usuario ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className={`user-profile-btn ${menuUsuarioAbierto ? 'active' : ''}`}
                >
                  <div className="avatar-pulse"><User size={14} /></div>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>Mi Cuenta</span>
                  <ChevronDown size={13} style={{ transform: menuUsuarioAbierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                </button>

                {/* Dropdown de Usuario */}
                {menuUsuarioAbierto && (
                  <div className="futuristic-dropdown">
                    <div className="dropdown-header">MÓDULOS DE CONTROL</div>
                    <Link to="/admin" className="dropdown-item">
                      <Shield size={14} style={{ color: 'var(--accent)' }} /> Panel Admin
                    </Link>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                    <button onClick={desloguear} className="dropdown-item logout">
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="futuristic-auth-btn">
                <span>Ingresar</span>
                <ArrowNeonGlow />
              </Link>
            )}
          </div>
        )}

        {/* --- INTERFAZ MÓVIL (TRIGGER) --- */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1003 }}>
            <button onClick={alternarTema} className="theme-toggle-btn">
              {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} 
              className={`mobile-menu-trigger ${menuMovilAbierto ? 'open' : ''}`}
            >
              {menuMovilAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

      </div>

      {/* --- MENÚ DESPLEGABLE MÓVIL FULLSCREEN --- */}
      {isMobile && (
        <div className={`mobile-overlay-menu ${menuMovilAbierto ? 'visible' : ''}`}>
          <div className="mobile-links-container">
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
              <Home size={18} /> <span>Inicio</span>
            </Link>
            <Link to="/noticias" className={`mobile-nav-link ${isActive('/noticias') ? 'active' : ''}`}>
              <span>Noticias</span>
            </Link>
            <Link to="/foro" className={`mobile-nav-link ${isActive('/foro') ? 'active' : ''}`}>
              <span>Foro</span>
            </Link>
            <Link to="/galeria" className={`mobile-nav-link ${isActive('/galeria') ? 'active' : ''}`}>
              <span>Galería</span>
            </Link>

            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0', width: '100%' }} />

            {usuario ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <Link to="/admin" className="mobile-nav-link admin-flag">
                  <Shield size={18} /> <span>Panel de Control</span>
                </Link>
                <button onClick={desloguear} className="mobile-logout-btn">
                  <LogOut size={16} /> <span>Desconectarse</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="mobile-auth-button">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}

      {/* INYECCIÓN CORE DE ANIMACIONES Y HOVERS CINÉTICOS (CSS) */}
      <style>{`
        /* --- ESTILOS DE LINKS EN ESCRITORIO --- */
        .futuristic-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .futuristic-link:hover {
          color: var(--text-main);
        }
        .futuristic-link.active {
          color: #ffffff !important;
          background: var(--accent, #00cc88);
          box-shadow: 0 4px 12px rgba(0, 204, 136, 0.25);
        }

        /* --- BOTÓN ENTRADA ANIMADA --- */
        .futuristic-auth-btn {
          background: linear-gradient(90deg, var(--accent, #00cc88), #00a3ff);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 20px;
          border-radius: 10px;
          text-decoration: none;
          letter-spacing: 0.3px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 204, 136, 0.2);
        }
        .futuristic-auth-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(0, 204, 136, 0.35);
          filter: brightness(1.05);
        }

        /* --- PERFIL DE USUARIO --- */
        .user-profile-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 8px 14px;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .user-profile-btn:hover, .user-profile-btn.active {
          border-color: var(--accent);
          background: var(--bg-primary);
          box-shadow: 0 0 12px rgba(0, 204, 136, 0.1);
        }
        .avatar-pulse {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0, 204, 136, 0.1);
          color: var(--accent);
        }

        /* --- DROPDOWN FUTURISTA --- */
        .futuristic-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-top: 2px solid var(--accent);
          border-radius: 12px;
          padding: 8px;
          width: 190px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          animation: dropReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
        }
        .dropdown-header {
          font-size: 9px;
          font-weight: 800;
          color: var(--text-muted);
          padding: 6px 10px;
          letter-spacing: 1px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: var(--bg-secondary);
          padding-left: 14px;
          color: var(--accent);
        }
        .dropdown-item.logout:hover {
          color: var(--danger, #ff4d4d);
        }

        /* --- BOTÓN TEMAS --- */
        .theme-toggle-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 9px;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .theme-toggle-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: rotate(15deg);
        }

        /* --- HOVER EFECTO LOGO --- */
        .nav-logo-container:hover .logo-glow {
          opacity: 1;
        }
        .nav-logo-container:hover img {
          transform: scale(1.04);
        }
        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: var(--accent);
          filter: blur(25px);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s ease;
        }

        /* --- INTERFAZ MOBILE OVERLAY --- */
        .mobile-menu-trigger {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        .mobile-menu-trigger.open {
          border-color: var(--accent);
          color: var(--accent);
        }
        .mobile-overlay-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: var(--bg-primary);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          padding: 90px 24px 24px 24px;
          box-sizing: border-box;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-10px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-overlay-menu.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        .mobile-links-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .mobile-nav-link {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 14px 20px;
          border-radius: 12px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }
        .mobile-nav-link:active, .mobile-nav-link.active {
          background: var(--bg-secondary);
          color: var(--accent) !important;
          padding-left: 24px;
        }
        .mobile-nav-link.admin-flag {
          border: 1px solid var(--border);
          background: rgba(0, 204, 136, 0.03);
        }
        .mobile-logout-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          padding: 14px;
          border-radius: 12px;
          color: var(--danger, #ff4d4d);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .mobile-auth-button {
          background: var(--accent);
          color: white;
          text-decoration: none;
          text-align: center;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 4px 15px rgba(0, 204, 136, 0.2);
        }

        /* --- ANIMACIONES KEYFRAMES --- */
        @keyframes dropReveal {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </nav>
  );
}

// Micro-componente auxiliar decorativo
function ArrowNeonGlow() {
  return (
    <span style={{
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transform: 'skewX(-25deg)',
      animation: 'shineGlow 4s infinite linear'
    }}>
      <style>{`
        @keyframes shineGlow {
          0% { left: -100%; }
          15% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
    </span>
  );
}