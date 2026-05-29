import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)',
      padding: '60px 20px',
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr', 
        gap: '40px' 
      }}>
        
        {/* Lado izquierdo: Identidad */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--text-main)' }}>JFS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>
            Plataforma de gestión centralizada. Acceso directo a módulos de contenido y administración.
          </p>
        </div>

        {/* Centro: Navegación de Contenido */}
        <div>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '15px' }}>Contenido</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/noticias" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Noticias</Link></li>
            <li><Link to="/chismes" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Chismes</Link></li>
            <li><Link to="/galeria" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Galería</Link></li>
          </ul>
        </div>

        {/* Derecha: Gestión */}
        <div>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '15px' }}>Gestión</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Panel de Control</Link></li>
            <li><Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Acceso Admin</Link></li>
          </ul>
        </div>
      </div>

      {/* Pie inferior */}
      <div style={{ maxWidth: '1140px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px' }}>
        © {new Date().getFullYear()} JFS — Todos los derechos reservados.
      </div>
    </footer>
  );
}