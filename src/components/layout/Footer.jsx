import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Newspaper, 
  MessageSquare, 
  Image, 
  Info, 
  LogIn,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function Footer() {
  const [anchoVentana, setAnchoVentana] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setAnchoVentana(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = anchoVentana < 600;
  const isTablet = anchoVentana >= 600 && anchoVentana < 960;

  const obtenerColumnasGrilla = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '1fr 1fr'; 
    return '3.5fr 2fr 2fr 2.5fr'; 
  };

  return (
    <footer style={{ 
      background: 'var(--nav-bg-blur, rgba(var(--bg-secondary-rgb, 20, 20, 25), 0.95))', 
      borderTop: '1px solid var(--border)',
      padding: isMobile ? '48px 24px 32px 24px' : isTablet ? '64px 40px 40px 40px' : '80px 40px 40px 40px',
      marginTop: 'auto',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Línea de Neón Decorativa Superior */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--accent, #00cc88), #00a3ff, transparent)',
        opacity: 0.4
      }} />

      {/* Contenedor Principal con Grilla */}
      <div style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: obtenerColumnasGrilla(), 
        gap: isMobile ? '40px' : isTablet ? '48px' : '64px',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Columna 1: Identidad Corporativa / Core Node */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          gridColumn: isTablet ? '1 / span 2' : 'auto',
          marginBottom: isTablet ? '16px' : '0'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '900', 
            margin: 0, 
            color: 'var(--text-main)',
            letterSpacing: '-0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            JFS<span style={{ color: 'var(--accent, #00cc88)', textShadow: '0 0 12px var(--accent)' }}>.</span>
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '14px', 
            maxWidth: isTablet ? '100%' : '290px',
            lineHeight: '1.65',
            margin: 0,
            fontWeight: '500'
          }}>
            Plataforma centralizada hiper-reactiva. Interconexión directa de módulos informativos, hilos de discusión y arquitecturas administrativas de alta fidelidad.
          </p>
          
          {/* Status Tracker Futurista */}
          <div className="status-node">
            <Activity size={12} className="status-pulse-icon" />
            <span className="status-text">CORE STATUS:</span>
            <span className="status-value">ONLINE</span>
            <span className="status-ping-dot" />
          </div>
        </div>

        {/* Columna 2: Contenido */}
        <div>
          <h3 className="footer-section-title">Exploración</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/" className="cyber-footer-link">
                <span className="link-bullet">/</span> Inicio
              </Link>
            </li>
            <li>
              <Link to="/noticias" className="cyber-footer-link">
                <span className="link-bullet">/</span> <Newspaper size={13} className="f-icon" /> Noticias
              </Link>
            </li>
            <li>
              <Link to="/foro" className="cyber-footer-link">
                <span className="link-bullet">/</span> <MessageSquare size={13} className="f-icon" /> Foro
              </Link>
            </li>
            <li>
              <Link to="/galeria" className="cyber-footer-link">
                <span className="link-bullet">/</span> <Image size={13} className="f-icon" /> Galería
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Institucional */}
        <div>
          <h3 className="footer-section-title">Estructura</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/SobreNosotros" className="cyber-footer-link">
                <span className="link-bullet">/</span> <Info size={13} className="f-icon" /> Sobre Nosotros
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Gestión Seguro */}
        <div>
          <h3 className="footer-section-title">Sistemas de Control</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/admin" className="cyber-admin-card">
              <div className="card-glitch-layer" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2 }}>
                <Shield size={15} style={{ color: 'var(--accent)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="card-title">Panel de Control</span>
                  <span className="card-subtitle">Terminal raíz</span>
                </div>
              </div>
              <ArrowUpRight size={14} className="card-arrow" />
            </Link>

            <Link to="/login" className="cyber-sub-link">
              <LogIn size={13} /> <span>Acceso de Personal</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Barra de Cierre / Copyright */}
      <div style={{ 
        maxWidth: '1140px', 
        margin: isMobile ? '48px auto 0' : '64px auto 0', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--border)', 
        color: 'var(--text-muted)', 
        fontSize: '13px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: '20px',
        alignItems: isMobile ? 'flex-start' : 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ fontWeight: '500', opacity: 0.8 }}>
          <span>© {new Date().getFullYear()} JFS — Todos los derechos reservados de manera digital.</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <div className="spec-badge">
            <span className="spec-label">ENV</span>
            <span className="spec-value">PROD_BUILD</span>
          </div>
          <span className="version-tag">
            v2.1.0
          </span>
        </div>
      </div>

      {/* INYECCIÓN DE ESTILOS AVANZADOS CYBERPUNK */}
      <style>{`
        /* --- TÍTULOS DE SECCIÓN --- */
        .footer-section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-main);
          margin: 0 0 20px 0;
          letter-spacing: 1.5px;
          position: relative;
          display: inline-block;
        }
        .footer-section-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 12px;
          height: 1.5px;
          background: var(--accent, #00cc88);
        }

        /* --- LISTAS Y ENLACES KINETICOS --- */
        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cyber-footer-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 3px 0;
          width: fit-content;
        }
        .link-bullet {
          color: var(--accent);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.25s ease;
          font-family: monospace;
          font-weight: 800;
        }
        .cyber-footer-link .f-icon {
          opacity: 0.6;
          transition: transform 0.2s ease;
        }

        /* Hover dinámico para dispositivos no táctiles */
        @media (min-width: 900px) {
          .cyber-footer-link:hover {
            color: var(--text-main) !important;
            padding-left: 6px;
          }
          .cyber-footer-link:hover .link-bullet {
            opacity: 1;
            transform: translateX(0);
          }
          .cyber-footer-link:hover .f-icon {
            opacity: 1;
            transform: scale(1.15);
            color: var(--text-main);
          }
        }

        /* --- PANEL INTERACTIVO DE CONTROL --- */
        .cyber-admin-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cyber-admin-card .card-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          transition: color 0.2s;
        }
        .cyber-admin-card .card-subtitle {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.2px;
        }
        .cyber-admin-card .card-arrow {
          color: var(--text-muted);
          transition: all 0.3s ease;
        }
        .cyber-admin-card:hover {
          border-color: rgba(0, 204, 136, 0.4);
          box-shadow: 0 8px 24px -8px rgba(0, 204, 136, 0.15);
          transform: translateY(-2px);
        }
        .cyber-admin-card:hover .card-title {
          color: var(--accent);
        }
        .cyber-admin-card:hover .card-arrow {
          transform: translate(2px, -2px);
          color: var(--accent);
        }

        /* --- SUB LINKS --- */
        .cyber-sub-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 8px 4px;
          transition: color 0.2s ease;
          width: fit-content;
        }
        .cyber-sub-link:hover {
          color: var(--text-main);
        }

        /* --- BADGES / MONOSPACE METRICS --- */
        .status-node {
          display: inline-flex;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 8px;
          width: fit-content;
          gap: 6px;
          font-family: monospace;
          font-size: 11px;
        }
        .status-pulse-icon {
          color: var(--accent);
        }
        .status-text {
          color: var(--text-muted);
          font-weight: 700;
        }
        .status-value {
          color: var(--accent);
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .status-ping-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px var(--accent);
          animation: statusBlink 1.8s infinite ease-in-out;
        }

        .version-tag {
          font-size: 11px;
          font-family: monospace;
          font-weight: 700;
          color: var(--text-muted);
          opacity: 0.8;
          background: var(--bg-primary);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        .spec-badge {
          display: flex;
          font-family: monospace;
          font-size: 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .spec-label {
          background: var(--bg-primary);
          color: var(--text-muted);
          padding: 4px 8px;
          font-weight: 700;
        }
        .spec-value {
          background: rgba(0, 163, 255, 0.1);
          color: #00a3ff;
          padding: 4px 8px;
          font-weight: 800;
        }

        /* --- KEYFRAMES --- */
        @keyframes statusBlink {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 12px var(--accent); }
        }
      `}</style>
    </footer>
  );
}