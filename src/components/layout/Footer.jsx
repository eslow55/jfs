import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  // Detectar si la pantalla es de celular de forma nativa
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estilo base interactivo para los enlaces del footer
  const estiloEnlace = {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  };

  return (
    <footer style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)',
      padding: isMobile ? '40px 24px' : '60px 24px',
      marginTop: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        display: 'grid', 
        // Si es móvil usa 1 sola columna, si es escritorio usa la estructura original
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', 
        gap: isMobile ? '30px' : '40px' 
      }}>
        
        {/* Lado izquierdo: Identidad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: '800', 
            margin: 0, 
            color: 'var(--text-main)',
            letterSpacing: '-0.5px' 
          }}>
            JFS<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '14px', 
            maxWidth: '320px',
            lineHeight: '1.6',
            margin: 0 
          }}>
            Plataforma de gestión centralizada. Acceso directo a módulos de contenido, actualización de crónicas y paneles de administración.
          </p>
        </div>

        {/* Centro: Navegación de Contenido */}
        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            textTransform: 'uppercase', 
            color: 'var(--text-main)', 
            marginBottom: '15px',
            letterSpacing: '0.5px'
          }}>
            Contenido
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <Link to="/noticias" style={estiloEnlace} className="footer-link">Noticias</Link>
            </li>
            <li>
              <Link to="/foro" style={estiloEnlace} className="footer-link">Foro</Link>
            </li>
            <li>
              <Link to="/galeria" style={estiloEnlace} className="footer-link">Galería</Link>
            </li>
          </ul>
        </div>

        {/* Derecha: Gestión */}
        <div>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            textTransform: 'uppercase', 
            color: 'var(--text-main)', 
            marginBottom: '15px',
            letterSpacing: '0.5px'
          }}>
            Gestión
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <Link to="/admin" style={estiloEnlace} className="footer-link">Panel de Control</Link>
            </li>
            <li>
              <Link to="/login" style={estiloEnlace} className="footer-link">Acceso Admin</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Pie inferior / Copyright */}
      <div style={{ 
        maxWidth: '1140px', 
        margin: '40px auto 0', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--border)', 
        color: 'var(--text-muted)', 
        fontSize: '13px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: '10px',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        <span>© {new Date().getFullYear()} JFS — Todos los derechos reservados.</span>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>v2.1.0</span>
      </div>

      {/* Inyección de estilos CSS para el efecto Hover profesional */}
      <style>{`
        .footer-link:hover {
          color: var(--text-main) !important;
          text-decoration: underline !important;
          text-underline-offset: 4px;
        }
      `}</style>
    </footer>
  );
}