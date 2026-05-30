import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Star, Layers } from 'lucide-react';

const DEFAULT_INFO = {
  descripcion: 'Somos JFS, un grupo especial con historias, momentos y chismes para compartir. Esta página es nuestro espacio.',
  miembros: [],
  createdYear: '2024',
};

// --- MULTI-SKELETON LOADER INTERNO ---
const SkeletonAbout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'pulse-about 1.5s infinite' }}>
    <div style={{ height: '220px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border)' }} />
    <div style={{ height: '30px', width: '200px', background: 'var(--bg-secondary)', borderRadius: '8px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: '180px', background: 'var(--bg-secondary)', borderRadius: '20px' }} />
      ))}
    </div>
    <style>{`@keyframes pulse-about { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
  </div>
);

export default function SobreNosotros() {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);
  
  // Estado para control interactivo en celulares
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    async function fetchInfo() {
      try {
        const snap = await getDoc(doc(db, 'config', 'nosotros'));
        if (snap.exists()) setInfo({ ...DEFAULT_INFO, ...snap.data() });
      } catch (e) { 
        console.error("Error al traer información de equipo:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    
    fetchInfo();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '80vh', color: 'var(--text-main)', paddingBottom: '60px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px', boxSizing: 'border-box' }}>
        
        {/* --- ENCABEZADO DE PÁGINA --- */}
        <div style={{ marginBottom: '36px', textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', letterSpacing: '-1px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '12px' }}>
            <Users size={isMobile ? 30 : 38} style={{ color: 'var(--accent)' }} /> Sobre Nosotros
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>
            Quiénes somos y de qué va todo esto.
          </p>
        </div>

        {loading ? (
          <SkeletonAbout />
        ) : (
          <>
            {/* --- HERO DE PRESENTACIÓN --- */}
            <div style={{ 
              padding: isMobile ? '32px 20px' : '48px', 
              textAlign: 'center', 
              marginBottom: '40px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '24px',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '70px', height: '70px', 
                background: 'var(--accent)', 
                borderRadius: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.5rem', 
                fontWeight: '900', 
                color: 'white', 
                margin: '0 auto 20px',
                boxShadow: '0 8px 20px rgba(59,130,246,0.2)'
              }}>
                JFS
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '14px', margin: 0 }}>El Grupo</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.7', maxWidth: '650px', margin: '12px auto 20px' }}>
                {info.descripcion}
              </p>
              {info.createdYear && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} fill="#eab308" /> Desde {info.createdYear}
                  </span>
                </div>
              )}
            </div>

            {/* --- CUADRÍCULA DE MIEMBROS --- */}
            {info.miembros && info.miembros.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', textAlign: isMobile ? 'center' : 'left' }}>
                  Los del grupo ({info.miembros.length})
                </h2>
                
                <div style={{ 
                  display: 'grid', 
                  // Diseño elástico según el espacio disponible en celular
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(145px, 1fr))' : 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: isMobile ? '12px' : '20px' 
                }}>
                  {info.miembros.map((m, i) => (
                    <div 
                      key={i} 
                      className="miembro-card"
                      style={{ 
                        padding: isMobile ? '20px 12px' : '24px', 
                        textAlign: 'center', 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '20px',
                        transition: 'transform 0.25s ease, border-color 0.25s' 
                      }}
                    >
                      <div style={{ 
                        width: isMobile ? '75px' : '85px', 
                        height: isMobile ? '75px' : '85px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, var(--accent), #a855f7)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 14px', 
                        fontSize: '1.6rem', 
                        fontWeight: '800', 
                        color: 'white', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {m.foto ? <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{m.nombre?.[0] || '?'}</span>}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h3 style={{ fontWeight: '700', fontSize: isMobile ? '14px' : '16px', margin: 0, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                          {m.nombre}
                        </h3>
                        {m.apodo && (
                          <span style={{ color: 'var(--accent)', fontSize: '12px', fontStyle: 'italic', fontWeight: '500' }}>
                            "{m.apodo}"
                          </span>
                        )}
                        {m.descripcion && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4', margin: '6px 0 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {m.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SECCIÓN EXTRA --- */}
            {info.seccionExtra && (
              <div style={{ 
                padding: '32px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: '24px' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Layers size={16} style={{ color: 'var(--accent)' }} /> {info.seccionExtra.titulo}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '14px', marginTop: '10px', margin: 0 }}>
                  {info.seccionExtra.texto}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* INTERACCIONES DE INTERFAZ */}
      <style>{`
        .miembro-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
}