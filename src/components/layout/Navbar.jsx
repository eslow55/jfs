import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../contexts/TemaContext';
import { Shield, Sun, Moon, Menu, X, LogOut, User, ChevronDown, Home } from 'lucide-react';

// Importación de logos
import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';

export default function Navbar() {
  // CORRECCIÓN: Se extrae 'desloguear' que es la función real de tu AuthContext
  const { usuario, desloguear } = useAuth(); 
  const { tema, alternarTema } = useTema();
  const location = useLocation();

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMenuMovilAbierto(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMenuMovilAbierto(false);
    setMenuUsuarioAbierto(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const estiloLink = (path) => ({
    fontSize: '14px',
    fontWeight: isActive(path) ? '700' : '500',
    color: isActive(path) ? 'var(--text-main)' : 'var(--text-muted)',
    padding: isMobile ? '14px 20px' : '10px 16px',
    borderRadius: '12px',
    background: isActive(path) ? 'var(--bg-secondary)' : 'transparent',
    border: '1px solid',
    borderColor: isActive(path) ? 'var(--border)' : 'transparent',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    width: isMobile ? '100%' : 'auto',
    boxSizing: 'border-box'
  });

  return (
    <nav style={{ 
      background: 'var(--bg-primary)', 
      borderBottom: '1px solid var(--border)', 
      padding: '0', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        height: isMobile ? '70px' : '80px', 
        margin: '0 auto', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* CONTENEDOR DEL LOGO */}
        <Link to="/" style={{ 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          zIndex: 1001 
        }}>
          <img 
            src={tema === 'light' ? logoDark : logoLight} 
            alt="JFS Logo" 
            style={{ 
              height: isMobile ? '40px' : '48px', 
              width: 'auto', 
              maxHeight: '100%',
              transition: 'transform 0.3s ease',
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Link>

        {/* --- NAVEGACIÓN VERSIÓN ESCRITORIO --- */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link to="/" style={estiloLink('/')}>
              <Home size={16} /> Inicio
            </Link>
            <Link to="/noticias" style={estiloLink('/noticias')}>Noticias</Link>
            <Link to="/foro" style={estiloLink('/foro')}>Foro</Link>
            <Link to="/galeria" style={estiloLink('/galeria')}>Galería</Link>
            
            <div style={{ height: '20px', width: '1px', background: 'var(--border)', margin: '0 10px' }} />

            {/* Botón de Cambio de Tema */}
            <button onClick={alternarTema} style={{ 
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
              padding: '10px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
            }} className="nav-btn">
              {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Panel de Autenticación / Perfil */}
            {usuario ? (
              <div style={{ position: 'relative', marginLeft: '10px' }}>
                <button 
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  style={{ background: 'var(--bg-secondary)', border: `1px solid var(--border)`, padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}
                >
                  <User size={16} style={{ color: 'var(--accent)' }} />
                  <span>Mi Perfil</span>
                  <ChevronDown size={14} style={{ transform: menuUsuarioAbierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Menú Desplegable */}
                {menuUsuarioAbierto && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '8px', width: '200px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <Link to="/admin" style={{ ...estiloLink('/admin'), padding: '10px 12px' }}>
                      <Shield size={16} style={{ color: 'var(--accent)' }} /> Panel Admin
                    </Link>
                    {/* CORRECCIÓN: Ahora ejecuta desloguear en lugar de cerrarSesion */}
                    <button onClick={desloguear} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', borderRadius: '10px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left' }}>
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{ ...estiloLink('/login'), background: 'var(--accent)', color: '#fff', marginLeft: '10px', fontWeight: '600' }}>
                Ingresar
              </Link>
            )}
          </div>
        )}

        {/* --- BOTÓN MENÚ HAMBURGUESA (SÓLO MÓVIL) --- */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1001 }}>
            <button onClick={alternarTema} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
              {tema === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <button 
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} 
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {menuMovilAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}

      </div>

      {/* --- DESPLEGABLE DE NAVEGACIÓN MÓVIL --- */}
      {isMobile && menuMovilAbierto && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'var(--bg-primary)', padding: '100px 24px 24px 24px', 
          display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box'
        }}>
          <Link to="/" style={estiloLink('/')}>
            <Home size={18} /> Inicio
          </Link>
          <Link to="/noticias" style={estiloLink('/noticias')}>Noticias</Link>
          <Link to="/foro" style={estiloLink('/foro')}>Foro</Link>
          <Link to="/galeria" style={estiloLink('/galeria')}>Galería</Link>

          <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />

          {usuario ? (
            <>
              <Link to="/admin" style={estiloLink('/admin')}>
                <Shield size={16} style={{ color: 'var(--accent)' }} /> Panel de Control
              </Link>
              {/* CORRECCIÓN: Ejecuta desloguear también en la vista de dispositivos móviles */}
              <button onClick={desloguear} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '14px 20px', borderRadius: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" style={{ ...estiloLink('/login'), background: 'var(--accent)', color: '#fff', textAlign: 'center', justifyContent: 'center', fontWeight: '600' }}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}