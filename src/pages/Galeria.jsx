import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Play, Eye, Calendar, Maximize2, X } from 'lucide-react';

export default function Galeria() {
  const [medios, setMedios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalMedia, setModalMedia] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'galeria'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 20px' }}>
      
      {/* Header */}
      <div style={{ margin: '40px 0 40px', borderBottom: '1px solid #1f1f24', paddingBottom: '20px' }}>
        <span style={{ background: 'rgba(0, 194, 255, 0.1)', color: '#00c2ff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Registros Audiovisuales
        </span>
        <h1 style={{ fontSize: '38px', fontWeight: '800', marginTop: '10px', letterSpacing: '-1px' }}>
          Galería de <span style={{ color: 'var(--accent)' }}>Medios</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
          Colección compartida del grupo. Momentos guardados de forma permanente.
        </p>
      </div>

      {cargando ? (
        <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <p>Indexando almacenamiento multimedia...</p>
        </div>
      ) : medios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#111114', borderRadius: '16px', border: '1px dashed #232329', color: 'var(--text-muted)' }}>
          No hay registros disponibles en la galería pública.
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '20px', 
            marginBottom: '60px' 
          }}
        >
          {medios.map((medio) => (
            <div 
              key={medio.id}
              onClick={() => setModalMedia(medio)}
              style={{ 
                background: '#111114', 
                border: '1px solid #1f1f24', 
                borderRadius: '14px', 
                overflow: 'hidden', 
                aspectRatio: '1/1', 
                position: 'relative', 
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              className="gallery-item"
            >
              {medio.tipo === 'video' ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <video src={medio.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '50%', color: '#000', boxShadow: '0 4px 12px rgba(0,255,135,0.3)' }}>
                      <Play size={16} fill="#000" />
                    </div>
                  </div>
                </div>
              ) : (
                <img src={medio.url} alt="Media JFS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* Hover Overlay de alta gama */}
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-end',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
                className="gallery-overlay"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d4d4d8', fontSize: '12px' }}>
                    <Calendar size={12} />
                    <span>{new Date(medio.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <Maximize2 size={14} color="var(--accent)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CINEMATIC LIGHTBOX MODAL */}
      {modalMedia && (
        <div 
          onClick={() => setModalMedia(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(5, 5, 7, 0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
        >
          <button 
            onClick={() => setModalMedia(null)}
            style={{ position: 'absolute', top: '25px', right: '25px', background: '#202024', border: '1px solid #2e2e36', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '95vw', maxHeight: '85vh', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
          >
            {modalMedia.tipo === 'video' ? (
              <video src={modalMedia.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', background: '#000' }} />
            ) : (
              <img src={modalMedia.url} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }} />
            )}
          </div>
        </div>
      )}

      <style>{`
        .gallery-item:hover {
          transform: translateY(-2px);
          border-color: #2e2e36 !important;
        }
        .gallery-item:hover .gallery-overlay {
          opacity: 1 !important;
        }
      `}</style>

    </div>
  );
}