import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Newspaper, 
  MessageSquare, 
  Image, 
  Info, 
  LogIn 
} from 'lucide-react';

export default function Footer() {
  const [anchoVentana, setAnchoVentana] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setAnchoVentana(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Definición de Breakpoints responsivos
  const isMobile = anchoVentana < 600;
  const isTablet = anchoVentana >= 600 && anchoVentana < 960;

  // Manejo fluido de columnas según el ancho de pantalla
  const obtenerColumnasGrilla = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '1fr 1fr'; // Distribución limpia en cuadrícula de 2x2 para tablets
    return '3fr 2fr 2fr 2fr'; // Configuración original de escritorio completo
  };

  const estiloEnlace = {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: isMobile ? '15px' : '14px', // Tipografía ligeramente más grande en móviles para facilitar el toque táctil
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: 'fit-content',
    padding: isMobile ? '6px 0' : '2px 0' // Zona de interacción ampliada para móviles
  };

  return (
    <footer style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)',
      padding: isMobile ? '48px 20px 32px 20px' : isTablet ? '60px 32px 40px 32px' : '72px 24px 40px 24px',
      marginTop: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Contenedor Principal con Grilla Dinámica */}
      <div style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: obtenerColumnasGrilla(), 
        gap: isMobile ? '32px' : isTablet ? '40px' : '48px' 
      }}>
        
        {/* Columna 1: Identidad Corporativa */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          gridColumn: isTablet ? '1 / span 2' : 'auto', // En tablets abarca todo el ancho superior para equilibrar el espacio
          marginBottom: isTablet ? '10px' : '0'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            margin: 0, 
            color: 'var(--text-main)',
            letterSpacing: '-0.6px'
          }}>
            JFS<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '14px', 
            maxWidth: isTablet ? '100%' : '280px',
            lineHeight: '1.6',
            margin: 0 
          }}>
            Plataforma de gestión centralizada. Acceso directo a módulos de contenido, actualización de crónicas y paneles de administración.
          </p>
        </div>

        {/* Columna 2: Contenido */}
        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            textTransform: 'uppercase', 
            color: 'var(--text-main)', 
            marginBottom: '16px',
            letterSpacing: '0.8px'
          }}>
            Contenido
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
            <li>
              <Link to="/" style={estiloEnlace} className="footer-link">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/noticias" style={estiloEnlace} className="footer-link">
                <Newspaper size={14} className="footer-icon" /> Noticias
              </Link>
            </li>
            <li>
              <Link to="/foro" style={estiloEnlace} className="footer-link">
                <MessageSquare size={14} className="footer-icon" /> Foro
              </Link>
            </li>
            <li>
              <Link to="/galeria" style={estiloEnlace} className="footer-link">
                <Image size={14} className="footer-icon" /> Galería
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Institucional */}
        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            textTransform: 'uppercase', 
            color: 'var(--text-main)', 
            marginBottom: '16px',
            letterSpacing: '0.8px'
          }}>
            Institucional
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
            <li>
              <Link to="/SobreNosotros" style={estiloEnlace} className="footer-link">
                <Info size={14} className="footer-icon" /> Sobre Nosotros
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Gestión */}
        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            textTransform: 'uppercase', 
            color: 'var(--text-main)', 
            marginBottom: '16px',
            letterSpacing: '0.8px'
          }}>
            Gestión de Plataforma
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
            <li>
              <Link to="/admin" style={estiloEnlace} className="footer-link-admin">
                <Shield size={14} /> Panel de Control
              </Link>
            </li>
            <li>
              <Link to="/login" style={estiloEnlace} className="footer-link">
                <LogIn size={14} className="footer-icon" /> Acceso Admin
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Barra de Cierre / Copyright */}
      <div style={{ 
        maxWidth: '1140px', 
        margin: isMobile ? '40px auto 0' : '56px auto 0', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--border)', 
        color: 'var(--text-muted)', 
        fontSize: '13px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: '16px',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        <div>
          <span>© {new Date().getFullYear()} JFS — Todos los derechos reservados.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <span style={{ 
            fontSize: '11px', 
            fontFamily: 'monospace', 
            opacity: 0.6, 
            background: 'var(--bg-primary)', 
            padding: '3px 8px', 
            borderRadius: '6px', 
            border: '1px solid var(--border)' 
          }}>
            v2.1.0
          </span>
        </div>
      </div>

      {/* Inyección de Animaciones y Reglas de Optimización */}
      <style>{`
        .footer-link {
          position: relative;
        }
        .footer-link .footer-icon {
          opacity: 0.6;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        
        /* Desactivamos animaciones de desplazamiento lateral en móviles para evitar saltos táctiles incómodos */
        @media (min-width: 600px) {
          .footer-link:hover {
            color: var(--text-main) !important;
            transform: translateX(4px);
          }
          .footer-link-admin:hover {
            color: var(--accent) !important;
            transform: translateX(4px);
          }
        }

        /* En móviles, el cambio de estado es puramente de color al presionar */
        @media (max-width: 599px) {
          .footer-link:active, .footer-link:hover {
            color: var(--text-main) !important;
          }
          .footer-link-admin:active, .footer-link-admin:hover {
            color: var(--accent) !important;
          }
        }

        .footer-link:hover .footer-icon {
          opacity: 1;
          color: var(--accent);
          transform: scale(1.1);
        }

        .footer-link-admin {
          color: var(--text-muted);
        }
      `}</style>
    </footer>
  );
}