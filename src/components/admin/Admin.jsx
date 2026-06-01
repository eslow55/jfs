import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Newspaper, MessageSquare, Image as ImageIcon, Users, LogOut, Shield } from 'lucide-react';

// Importación de subcomponentes específicos
import AdminNoticias from './AdminNoticias';
import AdminForo from './AdminForo';
import AdminGaleria from './AdminGaleria';
import AdminNosotros from './AdminNosotros';

export default function Admin() {
  const { desloguear } = useAuth();
  const [activeTab, setActiveTab] = useState('noticias');

  const menuItems = [
    { id: 'noticias', label: 'Crónicas & Anuncios', icon: <Newspaper size={18} /> },
    { id: 'foro', label: 'Moderación de Foro', icon: <MessageSquare size={18} /> },
    { id: 'galeria', label: 'Portfolio Galería', icon: <ImageIcon size={18} /> },
    { id: 'nosotros', label: 'Sección Institucional', icon: <Users size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'noticias': return <AdminNoticias />;
      case 'foro': return <AdminForo />;
      case 'galeria': return <AdminGaleria />;
      case 'nosotros': return <AdminNosotros />;
      default: return <AdminNoticias />;
    }
  };

  return (
    <div className="admin-container" style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--bg-primary)', boxSizing: 'border-box' }}>
      <div className="admin-layout">
        
        {/* SIDEBAR DE CONTROL RESPONSIVE */}
        <aside className="admin-sidebar" style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow)', 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'fit-content',
          position: 'sticky',
          top: '100px'
        }}>
          {/* Info de cabecera en el Sidebar */}
          <div className="sidebar-header" style={{ alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ background: 'var(--bg-primary)', color: 'var(--accent)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Panel</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Administrador</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: '14px',
                    padding: '14px 16px', // Corrección: Se añade padding inline explícito aquí
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? 'var(--button-text)' : 'var(--text-main)',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14.5px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--shadow)' : 'none',
                    justifyContent: 'flex-start',
                    transition: 'all 0.2s ease'
                  }}
                  className={`sidebar-btn ${isSelected ? 'is-selected' : ''}`}
                >
                  {item.icon}
                  <span className="btn-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button 
            onClick={desloguear}
            style={{ 
              background: 'transparent', 
              color: 'var(--danger)', 
              border: '1px solid var(--border)', 
              borderRadius: '14px', 
              padding: '14px', 
              fontWeight: '600', 
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="sidebar-logout-btn"
          >
            <LogOut size={16} /> <span className="logout-label">Cerrar Sesión</span>
          </button>
        </aside>

        {/* ÁREA DE TRABAJO RESPONSIVE */}
        <main className="admin-main" style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow)',
          minHeight: '600px'
        }}>
          {renderContent()}
        </main>

      </div>

      {/* ESTILOS INTERACTIVOS Y MEDIA QUERIES APILADAS */}
      <style>{`
        /* Configuración base de espaciados */
        .admin-container {
          padding: 40px 24px;
        }
        .admin-layout {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
        }
        .admin-sidebar {
          padding: 28px 20px;
          gap: 28px;
        }
        .sidebar-header {
          display: flex;
          padding-bottom: 20px;
        }
        .admin-main {
          padding: 40px;
        }
        .sidebar-btn {
          width: 100%;
        }

        /* Hover states en escritorio */
        .sidebar-btn:hover {
          background: var(--bg-primary) !important;
          transform: translateX(4px);
        }
        .sidebar-btn.is-selected:hover {
          background: var(--accent) !important;
        }
        .sidebar-logout-btn:hover {
          background: var(--danger) !important;
          color: white !important;
          border-color: var(--danger) !important;
        }

        /* --- BREAKPOINT PARA TABLETS (A partir de 1024px hacia abajo) --- */
        @media (max-width: 1024px) {
          .admin-layout {
            grid-template-columns: 80px 1fr;
            gap: 20px;
          }
          .admin-sidebar {
            padding: 20px 10px;
            align-items: center;
          }
          .sidebar-header {
            flex-direction: column;
            text-align: center;
            padding-bottom: 14px;
          }
          .sidebar-header div:last-child {
            display: none; /* Oculta texto de rol administrativo */
          }
          .btn-label, .logout-label {
            display: none; /* Colapsa el menú para mostrar solo iconos */
          }
          .sidebar-btn {
            justify-content: center;
            padding: 14px !important;
          }
          .sidebar-btn:hover {
            transform: scale(1.05);
          }
          .admin-main {
            padding: 30px;
          }
        }

        /* --- BREAKPOINT PARA MÓVILES (A partir de 768px hacia abajo) --- */
        @media (max-width: 768px) {
          .admin-container {
            padding: 16px 12px;
          }
          .admin-layout {
            display: flex;
            flex-direction: column; /* Cambia a flujo vertical de una columna */
            gap: 16px;
          }
          .admin-sidebar {
            position: static; /* Desactiva el sticky vertical */
            padding: 12px;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;
          }
          .sidebar-header {
            display: none; /* Remueve la cabecera repetitiva en móvil */
          }
          .sidebar-nav {
            flex-direction: row !important; /* El menú se vuelve horizontal */
            overflow-x: auto; /* Scroll táctil si los ítems desbordan */
            width: 100%;
            padding-bottom: 4px;
            scrollbar-width: none; /* Oculta barra en Firefox */
          }
          .sidebar-nav::-webkit-scrollbar {
            display: none; /* Oculta barra en Chrome/Safari */
          }
          .sidebar-btn {
            flex: 0 0 auto; /* Evita que los botones se achiquen */
            padding: 10px 14px !important;
            justify-content: center;
            width: auto;
          }
          .btn-label {
            display: inline !important; /* Recupera el texto al lado del icono para claridad */
            font-size: 13px;
          }
          .sidebar-btn:hover {
            transform: none;
          }
          .sidebar-logout-btn {
            padding: 10px !important;
            margin-top: 0 !important;
            width: 100%;
          }
          .logout-label {
            display: inline !important;
          }
          .admin-main {
            padding: 20px 16px;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}