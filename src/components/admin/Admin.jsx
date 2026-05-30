import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Newspaper, MessageSquare, Image as ImageIcon, Users, LogOut, Shield, LayoutDashboard } from 'lucide-react';

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
    <div style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--bg-primary)', padding: '40px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        
        {/* SIDEBAR DE CONTROL */}
        <aside style={{ 
          background: 'var(--bg-secondary)', 
          padding: '28px 20px', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '28px',
          height: 'fit-content',
          position: 'sticky',
          top: '100px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ background: 'var(--bg-primary)', color: 'var(--accent)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Panel Principal</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Modo Administrador</span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
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
                  className="sidebar-btn"
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button 
            onClick={desloguear}
            style={{ 
              marginTop: '40px', 
              background: 'transparent', 
              color: 'var(--danger)', 
              border: '1px solid var(--border)', 
              borderRadius: '14px', 
              padding: '14px', 
              fontWeight: '600', 
              boxShadow: 'none',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            className="sidebar-logout-btn"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </aside>

        {/* ÁREA DE TRABAJO */}
        <main style={{ 
          background: 'var(--bg-secondary)', 
          padding: '40px', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow)',
          minHeight: '600px'
        }}>
          {renderContent()}
        </main>

      </div>

      <style>{`
        .sidebar-btn:hover {
          background: ${activeTab ? 'var(--accent-hover)' : 'var(--bg-input)'} !important;
          color: ${activeTab ? 'var(--button-text)' : 'var(--text-main)'} !important;
          transform: translateX(4px);
        }
        .sidebar-logout-btn:hover {
          background: var(--danger) !important;
          color: white !important;
          border-color: var(--danger) !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
}