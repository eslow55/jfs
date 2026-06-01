import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Star, Layers, Sparkles, Terminal, Cpu, ShieldCheck } from 'lucide-react';

const DEFAULT_INFO = {
  descripcion: 'Somos JFS, un grupo especial con historias, momentos y chismes para compartir. Esta página es nuestro espacio operativo.',
  miembros: [],
  createdYear: '2024',
};

// --- MULTI-SKELETON LOADER ULTRA-ANIMADO ---
const SkeletonAbout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="skeleton-grid-trigger">
    <div style={{ height: '260px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }} className="cyber-skeleton-pulse" />
    <div style={{ height: '24px', width: '220px', background: 'var(--bg-secondary)', borderRadius: '6px' }} className="cyber-skeleton-pulse" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ height: '250px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border)' }} className="cyber-skeleton-pulse" />
      ))}
    </div>
  </div>
);

export default function SobreNosotros() {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    async function fetchInfo() {
      try {
        const snap = await getDoc(doc(db, 'config', 'nosotros'));
        if (snap.exists()) {
          setInfo({ ...DEFAULT_INFO, ...snap.data() });
        }
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
    <div style={{ width: '100%', minHeight: '90vh', color: 'var(--text-main)', paddingBottom: '100px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      
      {/* Luz ambiental reactiva masiva */}
      <div className="ambient-glow-mesh-prime" />
      <div className="ambient-glow-mesh-secondary" />

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: isMobile ? '24px 16px' : '56px 24px', boxSizing: 'border-box', position: 'relative', zIndex: 2 }}>
        
        {/* --- ENCABEZADO DE PÁGINA ANCHORED --- */}
        <div style={{ marginBottom: isMobile ? '36px' : '56px', textAlign: isMobile ? 'center' : 'left' }} className="fade-in-entry">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 204, 136, 0.06)', border: '1px solid rgba(0, 204, 136, 0.15)', padding: '6px 14px', borderRadius: '10px', marginBottom: '16px' }} className="badge-glow-trigger">
            <Cpu size={14} style={{ color: 'var(--accent, #00cc88)' }} className="cpu-pulse" />
            <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent, #00cc88)', letterSpacing: '0.5px' }}>SISTEMA_CORE_RUNNING</span>
          </div>
          
          <h1 style={{ 
            fontSize: isMobile ? '36px' : '52px', 
            fontWeight: '950', 
            letterSpacing: '-1.75px', 
            margin: '0 0 12px 0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isMobile ? 'center' : 'flex-start', 
            gap: '16px',
            color: 'var(--text-main)',
            lineHeight: 1.1
          }}>
            <Users size={isMobile ? 36 : 48} style={{ color: 'var(--accent)' }} className="icon-bounce-effect" /> Sobre Nosotros
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: isMobile ? '14px' : '17px', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
            Manifiesto operativo, integrantes activos e identidad centralizada del panel.
          </p>
        </div>

        {loading ? (
          <SkeletonAbout />
        ) : (
          <>
            {/* --- HERO DE PRESENTACIÓN CYBER-PUNK PREMIUM --- */}
            <div className="cyber-hero-container-v2" style={{ 
              padding: isMobile ? '40px 20px' : '64px 56px', 
              marginBottom: '56px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '28px',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.02)'
            }}>
              <div className="hero-grid-overlay-v2" />
              <div className="hero-scanline" />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 3 }}>
                <div style={{ 
                  width: '84px', height: '84px', 
                  background: 'linear-gradient(135deg, var(--accent, #00cc88), #00a3ff)', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  fontWeight: '950', 
                  color: 'white', 
                  marginBottom: '28px',
                  boxShadow: '0 16px 32px rgba(0, 204, 136, 0.25)',
                }} className="logo-box-3d">
                  JFS
                </div>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '14px' }}>
                  <Terminal size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>MANIFESTO.LOG</span>
                </div>

                <p style={{ 
                  color: 'var(--text-main)', 
                  fontSize: isMobile ? '15px' : '18px', 
                  lineHeight: '1.8', 
                  maxWidth: '740px',
                  margin: '0 auto 28px',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '-0.2px'
                }}>
                  "{info.descripcion}"
                </p>
                
                {info.createdYear && (
                  <div>
                    <span className="epoch-badge-v2">
                      <Star size={12} fill="currentColor" className="star-spin" /> ESTABLECIDO EN EL CICLO {info.createdYear}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* --- SECCIÓN INTEGRANTES (GRID MAGNÉTICO) --- */}
            {info.miembros && info.miembros.length > 0 && (
              <div style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-0.75px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Registros Operativos <span className="counter-bracket">[{info.miembros.length}]</span>
                  </h2>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(210px, 1fr))', 
                  gap: isMobile ? '16px' : '28px' 
                }}>
                  {info.miembros.map((m, i) => (
                    <div 
                      key={i} 
                      className="brutal-card-premium"
                      style={{ 
                        padding: isMobile ? '28px 16px' : '36px 24px', 
                        textAlign: 'center', 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Efectos de luces internas para Hover */}
                      <div className="card-laser-shimmer" />
                      <div className="card-neon-core" />
                      
                      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                        {/* Avatar con Marco Cuadrático Complejo */}
                        <div className="avatar-wrapper-pro">
                          <div className="avatar-inner-border" />
                          {m.foto ? (
                            <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <span className="avatar-fallback-pro">{m.nombre?.[0] || '?'}</span>
                          )}
                        </div>
                        
                        {/* Información */}
                        <h3 style={{ fontWeight: '850', fontSize: isMobile ? '16px' : '18px', margin: '0 0 6px 0', color: 'var(--text-main)', wordBreak: 'break-word', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                          {m.nombre}
                        </h3>
                        
                        {m.apodo && (
                          <div className="alias-badge-pro">
                            <Sparkles size={10} className="sparkle-icon" /> <span>{m.apodo}</span>
                          </div>
                        )}
                        
                        {m.descripcion && (
                          <p style={{ 
                            color: 'var(--text-muted)', 
                            fontSize: '13px', 
                            lineHeight: '1.55', 
                            margin: '14px 0 0 0', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 3, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden',
                            fontWeight: '500'
                          }}>
                            {m.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- MÓDULO ADICIONAL COMPACTO --- */}
            {info.seccionExtra && (
              <div className="extra-module-premium" style={{ 
                padding: isMobile ? '32px 20px' : '40px 44px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 15px 40px rgba(0,0,0,0.01)'
              }}>
                <div className="extra-glow-lens" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
                  <div style={{ padding: '6px', background: 'rgba(0, 163, 255, 0.08)', color: '#00a3ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid rgba(0, 163, 255, 0.15)' }} className="extra-icon-loop">
                    <Layers size={16} />
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', color: 'var(--text-main)' }}>
                    {info.seccionExtra.titulo}
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.75', fontSize: '14.5px', margin: 0, position: 'relative', zIndex: 2, fontWeight: '500' }}>
                  {info.seccionExtra.texto}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- INFRAESTRUCTURA CSS CYBER-ANIMADA --- */}
      <style>{`
        /* Mallas de Iluminación Ambiental de Fondo */
        .ambient-glow-mesh-prime {
          position: absolute;
          top: -10%; left: 20%; width: 60%; height: 500px;
          background: radial-gradient(circle, rgba(0, 204, 136, 0.05) 0%, transparent 70%);
          pointer-events: none; z-index: 1;
        }
        .ambient-glow-mesh-secondary {
          position: absolute;
          bottom: 10%; right: -10%; width: 45%; height: 450px;
          background: radial-gradient(circle, rgba(0, 163, 255, 0.04) 0%, transparent 75%);
          pointer-events: none; z-index: 1;
        }

        /* Animaciones del Header */
        .fade-in-entry {
          animation: globalRelease 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .cpu-pulse { animation: microPulse 2s ease-in-out infinite; }
        @keyframes microPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }

        /* Estqueleto de Carga Brutal */
        .cyber-skeleton-pulse::after {
          content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          animation: waveShift 1.4s infinite linear;
        }
        @keyframes waveShift { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        /* Hero v2 - Componentes Mecánicos */
        .cyber-hero-container-v2 {
          animation: heroPopUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .hero-grid-overlay-v2 {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px; opacity: 0.12; pointer-events: none; z-index: 1;
        }
        .hero-scanline {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(0,204,136,0.015) 50%, rgba(255,255,255,0));
          background-size: 100% 8px; pointer-events: none; z-index: 2;
        }
        .logo-box-3d {
          animation: floatBox 4s ease-in-out infinite alternate;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cyber-hero-container-v2:hover .logo-box-3d {
          transform: translateY(-6px) scale(1.05) rotate(4deg);
        }

        @keyframes floatBox {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-8px) rotate(-2deg); }
        }
        .star-spin { animation: coreSpin 8s linear infinite; }
        .epoch-badge-v2 {
          background: rgba(245, 158, 11, 0.06); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.18);
          padding: 8px 16px; borderRadius: 12px; fontSize: 11px; fontWeight: 800;
          display: inline-flex; align-items: center; gap: 8px; font-family: monospace; letter-spacing: 0.75px;
        }

        /* Estilos de las Tarjetas de Integrantes */
        .counter-bracket { color: var(--accent); font-family: 'monospace'; font-size: 18px; margin-left: 4px; }
        .brutal-card-premium {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s;
        }
        .card-laser-shimmer {
          position: absolute; top: 0; left: -150%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 204, 136, 0.04), transparent);
          transform: skewX(-20deg); pointer-events: none; z-index: 1;
        }
        .card-neon-core {
          position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%);
          width: 120px; height: 120px; background: var(--accent); filter: blur(45px);
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none; z-index: 1;
        }

        /* Marco de Avatar Cinematográfico */
        .avatar-wrapper-pro {
          width: 90px; height: 90px; border-radius: 26px; background: var(--bg-primary);
          border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; overflow: hidden; padding: 5px; box-sizing: border-box;
          position: relative; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .avatar-inner-border {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          border: 1px solid transparent; border-radius: 26px; z-index: 2; transition: border-color 0.4s;
        }
        .avatar-wrapper-pro img { border-radius: 20px; transition: transform 0.45s ease; }
        .avatar-fallback-pro {
          width: 100%; height: 100%; border-radius: 20px;
          background: linear-gradient(135deg, var(--accent, #00cc88), #00a3ff);
          display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 950; color: white;
        }

        .alias-badge-pro {
          display: inline-flex; align-items: center; gap: 5px; background: var(--bg-primary);
          border: 1px solid var(--border); padding: 4px 12px; borderRadius: 10px;
          font-size: 11px; fontWeight: 800; color: var(--accent); text-transform: uppercase;
          font-family: monospace; margin-top: 4px; transition: all 0.3s;
        }

        /* Hover dinámicos e Interactivos para Escritorio */
        @media (min-width: 768px) {
          .brutal-card-premium:hover {
            transform: translateY(-6px);
            border-color: rgba(0, 204, 136, 0.35) !important;
            box-shadow: 0 24px 48px -16px rgba(0, 204, 136, 0.12), 0 0 40px rgba(0, 204, 136, 0.01);
          }
          .brutal-card-premium:hover .card-laser-shimmer {
            left: 150%; transition: left 0.85s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .brutal-card-premium:hover .card-neon-core { opacity: 0.14; }
          .brutal-card-premium:hover .avatar-wrapper-pro {
            border-color: var(--accent); transform: scale(1.05) rotate(3deg);
          }
          .brutal-card-premium:hover .avatar-inner-border { border-color: rgba(0, 204, 136, 0.3); }
          .brutal-card-premium:hover .avatar-wrapper-pro img { transform: scale(1.08); }
          .brutal-card-premium:hover .alias-badge-pro {
            background: rgba(0, 204, 136, 0.06); border-color: rgba(0, 204, 136, 0.3);
          }
          .brutal-card-premium:hover .sparkle-icon { transform: rotate(45deg) scale(1.1); }
        }

        /* Extra Module Detallado */
        .extra-glow-lens {
          position: absolute; top: -30px; right: -30px; width: 100px; height: 100px;
          background: #00a3ff; filter: blur(40px); opacity: 0.02; pointer-events: none;
        }
        .extra-icon-loop { transition: transform 0.4s ease; }
        .extra-module-premium:hover .extra-icon-loop { transform: rotate(90deg); }

        @keyframes globalRelease {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroPopUp {
          0% { opacity: 0; transform: translateY(25px) scale(0.98); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes coreSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}