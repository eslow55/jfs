import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../contexts/TemaContext';
import { Shield, Sun, Moon } from 'lucide-react';

// Importación de tus logos
import logoLight from '../../assets/images/logo-light.png';
import logoDark from '../../assets/images/logo-dark.png';

export default function Navbar() {
  const { usuario } = useAuth();
  const { tema, alternarTema } = useTema();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Estilo base de los links
  const estiloLink = (path) => ({
    fontSize: '14px',
    fontWeight: isActive(path) ? '700' : '500',
    color: isActive(path) ? 'var(--text-main)' : 'var(--text-muted)',
    padding: '10px 20px',
    borderRadius: '12px',
    background: isActive(path) ? 'var(--bg-secondary)' : 'transparent',
    border: isActive(path) ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: isActive(path) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
  });

  return (
    <nav style={{ 
      background: 'var(--bg-primary)', 
      borderBottom: '2px solid var(--border)', 
      padding: '20px 0', // Ajustado para el nuevo tamaño de logo
      position: 'sticky', 
      top: 0, 
      zIndex: 1000 
    }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* LOGO CON TAMAÑO AUMENTADO */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img 
            src={tema === 'light' ? logoDark : logoLight} 
            alt="JFS Logo" 
            style={{ 
              height: '40px', 
              width: 'auto', 
              transition: 'opacity 0.3s ease' 
            }} 
          />
        </Link>

        {/* NAVEGACIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/noticias" style={estiloLink('/noticias')}>Noticias</Link>
          <Link to="/chismes" style={estiloLink('/chismes')}>Chismes</Link>
          <Link to="/galeria" style={estiloLink('/galeria')}>Galería</Link>
          
          {usuario && (
            <Link to="/admin" style={{ ...estiloLink('/admin'), borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              <Shield size={16} /> Admin
            </Link>
          )}

          <div style={{ height: '24px', width: '2px', background: 'var(--border)', margin: '0 12px' }} />

          <button onClick={alternarTema} style={{ 
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
            padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' 
          }}>
            {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}