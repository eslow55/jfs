import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../contexts/TemaContext';
import { Shield, Sun, Moon, Menu, X, LogOut, User, ChevronDown, Home } from 'lucide-react';

// Importación de logos
import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';

export default function Navbar() {
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
    padding: isMobile ? '14px 20px' : '8px 14px',
    borderRadius: '10px',
    background: isActive(path) ? 'var(--bg-secondary)' : 'transparent',
    border: '1px solid',
    borderColor: isActive(path) ? 'var(--border)' : 'transparent',
    transition: 'all 0.2s ease',
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
        height: isMobile ? '60px' : '68px', 
        margin: '0 auto', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* CONTENEDOR DEL LOGO (Optimizado en tamaño y visibilidad) */}
        <Link to="/" style={{ 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          zIndex: 1002 
        }}>
          <img 
            src={tema === 'dark' ? logoLight : logoDark} 
            alt="JFS Logo" 
            style={{ 
              /* AJUSTE PRECISIÓN: Tamaño estilizado para que no se vea gigante */
              height: isMobile ? '24px' : '26px', 
              width: 'auto',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
        </Link>

        {/* --- NAVEGACIÓN VERSIÓN ESCRITORIO --- */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link to="/" style={estiloLink('/')}>
              <Home size={15} /> Inicio
            </Link>
            <Link to="/noticias" style={estiloLink('/noticias')}>Noticias</Link>
            <Link to="/foro" style={estiloLink('/foro')}>Foro</Link>
            <Link to="/galeria" style={estiloLink('/galeria')}>Galería</Link>
            
            <div style={{ height: '16px', width: '1px', background: 'var(--border)', margin: '0 8px' }} />

            {/* Botón de Cambio de Tema */}
            <button onClick={alternarTema} style={{ 
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
              padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {tema === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Panel de Autenticación / Perfil */}
            {usuario ? (
              <div style={{ position: 'relative', marginLeft: '6px' }}>
                <button 
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  style={{ background: 'var(--bg-secondary)', border: `1px solid var(--border)`, padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  <User size={15} style={{ color: 'var(--accent)' }} />
                  <span>Mi Perfil</span>
                  <ChevronDown size={13} style={{ transform: menuUsuarioAbierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Menú Desplegable */}
                {menuUsuarioAbierto && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '6px', width: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <Link to="/admin" style={{ ...estiloLink('/admin'), padding: '8px 10px' }}>
                      <Shield size={14} style={{ color: 'var(--accent)' }} /> Panel Admin
                    </Link>
                    <button onClick={desloguear} style={{ width: '100%', background: 'transparent', border: 'none', padding: '8px 10px', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', textAlign: 'left' }}>
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{ ...estiloLink('/login'), background: 'var(--accent)', color: '#fff', marginLeft: '6px', fontWeight: '600', padding: '8px 16px' }}>
                Ingresar
              </Link>
            )}
          </div>
        )}

        {/* --- BOTÓN MENÚ HAMBURGUESA (SÓLO MÓVIL) --- */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', zIndex: 1003 }}>
            <button onClick={alternarTema} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}>
              {tema === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} 
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {menuMovilAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

      </div>

      {/* --- DESPLEGABLE DE NAVEGACIÓN MÓVIL --- */}
      {isMobile && menuMovilAbierto && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'var(--bg-primary)', padding: '80px 24px 24px 24px', 
          display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box',
          zIndex: 1001
        }}>
          <Link to="/" style={estiloLink('/')}>
            <Home size={16} /> Inicio
          </Link>
          <Link to="/noticias" style={estiloLink('/noticias')}>Noticias</Link>
          <Link to="/foro" style={estiloLink('/foro')}>Foro</Link>
          <Link to="/galeria" style={estiloLink('/galeria')}>Galería</Link>

          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

          {usuario ? (
            <>
              <Link to="/admin" style={estiloLink('/admin')}>
                <Shield size={15} style={{ color: 'var(--accent)' }} /> Panel de Control
              </Link>
              <button onClick={desloguear} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '10px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
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