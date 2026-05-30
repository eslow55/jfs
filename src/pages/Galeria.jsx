import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Play, Calendar, Maximize2, X, Image as ImageIcon, Film } from 'lucide-react';

// --- SKELETON LOADER PRECIOSISTA EN CUADRÍCULA ---
const SkeletonGallery = () => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
    gap: '20px',
    animation: 'pulse-galeria 1.5s infinite ease-in-out' 
  }}>
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div 
        key={i} 
        style={{ 
          aspectRatio: '1/1', 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)' 
        }} 
      />
    ))}
    <style>{`@keyframes pulse-galeria { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.25; } }`}</style>
  </div>
);

export default function Galeria() {
  const [medios, setMedios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalMedia, setModalMedia] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const q = query(collection(db, 'galeria'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedios(snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          urlDefinitiva: data.imagen || data.url || '' 
        };
      }));
      setCargando(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatearFechaCorta = (data) => {
    if (!data) return "Reciente";
    const date = data.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: isMobile ? '40px 20px' : '60px 32px', boxSizing: 'border-box', color: 'var(--text-main)', minHeight: '90vh' }}>
      
      {/* --- ENCABEZADO --- */}
      <div style={{ marginBottom: '50px', textAlign: isMobile ? 'center' : 'left' }}>
        <span style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          Registros Audiovisuales
        </span>
        <h1 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '850', letterSpacing: '-1.5px', margin: '16px 0 12px 0', lineHeight: '1.1' }}>
          Galería de <span style={{ color: 'var(--accent)' }}>Medios</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '15px' : '17.5px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
          Colección compartida en tiempo real. Momentos capturados por el staff y miembros de la comunidad.
        </p>
      </div>

      {/* --- GRILLA DE CONTENIDO --- */}
      {cargando ? (
        <SkeletonGallery />
      ) : medios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '120px 20px', background: 'var(--bg-secondary)', borderRadius: '28px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          <ImageIcon size={48} style={{ marginBottom: '18px', opacity: 0.5, color: 'var(--accent)' }} />
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No hay registros multimedia disponibles en la galería.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(270px, 1fr))', 
          gap: isMobile ? '16px' : '28px', 
          marginBottom: '60px' 
        }}>
          {medios.map((medio) => (
            <div 
              key={medio.id}
              onClick={() => setModalMedia(medio)}
              style={{ 
                background: '#0a0a0c', 
                border: '1px solid var(--border)', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                aspectRatio: '1/1', 
                position: 'relative', 
                cursor: 'pointer',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="gallery-item"
            >
              {medio.tipo === 'video' ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <video src={medio.urlDefinitiva} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
                    <div style={{ background: 'var(--accent)', padding: isMobile ? '12px' : '16px', borderRadius: '50%', color: '#ffffff', display: 'flex', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)' }}>
                      <Play size={isMobile ? 14 : 18} fill="#ffffff" style={{ transform: 'translateX(1px)' }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(5, 5, 8, 0.75)', backdropFilter: 'blur(8px)', padding: '6px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '11px', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Film size={12} style={{ color: 'var(--accent)' }} /> VIDEO
                  </div>
                </div>
              ) : (
                <img src={medio.urlDefinitiva} alt="Aporte comunitario" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="gallery-img" loading="lazy" />
              )}

              {/* Capa de Información Integrada (Hover) */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.4) 60%, transparent 100%)', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-end',
                opacity: isMobile ? 1 : 0, 
                transition: 'opacity 0.25s ease'
              }}
              className="gallery-overlay"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f4f4f5', fontSize: '13px', fontWeight: '600' }}>
                  <Calendar size={14} style={{ color: 'var(--accent)' }} />
                  <span>{formatearFechaCorta(medio.fecha).split(' de ')[0]}</span> {/* Muestra formato compacto */}
                </div>
                {!isMobile && (
                  <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', display: 'flex', color: '#fff' }}>
                    <Maximize2 size={14} />
                  </div>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* --- LIGHTBOX MODAL ULTRAPROFESIONAL CINEMÁTICO --- */}
      {modalMedia && (
        <div 
          onClick={() => setModalMedia(null)}
          style={{ 
            position: 'fixed', inset: 0, 
            background: 'rgba(4, 4, 6, 0.98)', 
            backdropFilter: 'blur(20px)',
            zIndex: 99999, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '16px' : '40px', boxSizing: 'border-box'
          }}
        >
          {/* BOTÓN CERRAR PREMIUM FLOTANTE */}
          <button 
            onClick={() => setModalMedia(null)}
            style={{ 
              position: 'absolute', 
              top: isMobile ? '16px' : '32px', 
              right: isMobile ? '16px' : '32px', 
              background: 'rgba(255, 255, 255, 0.06)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: '#ffffff', 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              zIndex: 100000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
            className="lightbox-close-btn"
            title="Cerrar Visualización"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
          
          {/* CONTENEDOR CENTRAL DEL ARTWORK / MEDIO */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: isMobile ? '100%' : '85vw',
              maxHeight: isMobile ? '70vh' : '78vh', 
              borderRadius: '28px', 
              overflow: 'hidden', 
              background: '#020203', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative'
            }}
          >
            {modalMedia.tipo === 'video' ? (
              <video 
                src={modalMedia.urlDefinitiva} 
                controls 
                autoPlay 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: isMobile ? '70vh' : '78vh', 
                  width: 'auto', 
                  height: 'auto', 
                  display: 'block' 
                }} 
              />
            ) : (
              <img 
                src={modalMedia.urlDefinitiva} 
                alt="Detalle de galería" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: isMobile ? '70vh' : '78vh', 
                  objectFit: 'contain', 
                  display: 'block' 
                }} 
              />
            )}
          </div>

          {/* TARJETA INFORMATIVA INFERIOR EDITORIAL */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: '24px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 28px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: '#e4e4e7',
              fontSize: '14.5px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Calendar size={16} style={{ color: 'var(--accent)' }} />
            <span>Publicado el {formatearFechaCorta(modalMedia.fecha)}</span>
          </div>
        </div>
      )}

      {/* --- INYECCIÓN DE ESTILOS DE INTERACCIÓN DE ALTA GAMA --- */}
      <style>{`
        .gallery-item:hover {
          transform: translateY(-6px);
          border-color: var(--accent) !important;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
        }
        .gallery-item:hover .gallery-img {
          transform: scale(1.04);
        }
        .gallery-item:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .lightbox-close-btn:hover {
          transform: scale(1.08);
          background: #ffffff !important;
          color: #050508 !important;
        }
      `}</style>

    </div>
  );
}