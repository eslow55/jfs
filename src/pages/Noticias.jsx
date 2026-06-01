import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, ArrowUpRight, ShieldAlert, Search, Image as ImageIcon, Bookmark, Layers } from 'lucide-react';

// --- SKELETON LOADER RESPONSIVO EN CUADRÍCULA ---
const SkeletonLoader = () => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '24px' 
  }}>
    {[1, 2, 3].map(i => (
      <div 
        key={i} 
        style={{ 
          height: '390px', 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          border: '1px solid var(--border)', 
          animation: 'pulse-news 1.5s infinite ease-in-out' 
        }} 
      />
    ))}
    <style>{`
      @keyframes pulse-news { 
        0%, 100% { opacity: 0.6; } 
        50% { opacity: 0.25; } 
      }
    `}</style>
  </div>
);

// --- FUNCIÓN EXTRACTORA DE IMÁGENES ANTIFALLOS ---
const obtenerFotoNoticia = (data) => {
  if (!data) return null;
  
  const directa = data.imagen || data.urlImagen || data.imageUrl || data.multimedia || data.url;
  if (directa) return directa;

  for (const clave in data) {
    if (typeof data[clave] === 'string' && (data[clave].startsWith('http://') || data[clave].startsWith('https://'))) {
      return data[clave];
    }
  }
  return null;
};

// --- COMPONENTE PRINCIPAL ---
export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todas'); // 'todas' o 'guardadas'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Inicializar favoritos locales reales desde el almacenamiento local
    const listaFavs = JSON.parse(localStorage.getItem('noticias_favoritas') || '[]');
    setFavoritos(listaFavs);
    
    // Consulta reactiva en tiempo real a Firestore
    const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setNoticias(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fotoDefinitiva: obtenerFotoNoticia(data)
        };
      }));
      setCargando(false);
    }, (error) => {
      console.error("Error al suscribirse a noticias:", error);
      setCargando(false);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsub();
    };
  }, []);

  // --- CONTROLADOR DE GUARDADO/MARCADOR PERSISTENTE ---
  const toggleBookmark = (e, id) => {
    e.preventDefault(); // Detiene la navegación del Link contenedor
    e.stopPropagation(); // Evita que el evento escale en el árbol del DOM

    let nuevosFavs = [...favoritos];
    if (nuevosFavs.includes(id)) {
      // FIX: Se corrigió el typo de "nuevsFavs" a "nuevosFavs"
      nuevosFavs = nuevosFavs.filter(favId => favId !== id);
    } else {
      nuevosFavs.push(id);
    }

    setFavoritos(nuevosFavs);
    localStorage.setItem('noticias_favoritas', JSON.stringify(nuevosFavs));
  };

  // --- FILTRADO MULTINIVEL OPTIMIZADO EN MEMORIA ---
  const noticiasFiltradas = useMemo(() => {
    const busquedaLimpia = busqueda.toLowerCase().trim();
    return noticias.filter(n => {
      if (!n || !n.id) return false; // Protección contra documentos corruptos
      
      // Discriminador por pestaña activa (Todas vs Guardadas)
      if (filtroActivo === 'guardadas' && !favoritos.includes(n.id)) {
        return false;
      }
      // Discriminador por caja de búsqueda de texto
      return (
        (n.titulo || '').toLowerCase().includes(busquedaLimpia) || 
        (n.descripcion || n.contenido || '').toLowerCase().includes(busquedaLimpia)
      );
    });
  }, [noticias, busqueda, filtroActivo, favoritos]);

  const formatearFecha = (data) => {
    if (!data) return 'Reciente';
    try {
      const date = data.toDate ? data.toDate() : new Date(data);
      return isNaN(date.getTime()) ? 'Reciente' : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Reciente';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '32px 16px' : '50px 24px', minHeight: '80vh', boxSizing: 'border-box' }}>
      
      {/* --- CABECERA Y CAJA DE BÚSQUEDA --- */}
      <div style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <span style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent, #3b82f6)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Prensa & Comunicados
          </span>
          <h1 style={{ fontSize: isMobile ? '34px' : '44px', fontWeight: '800', letterSpacing: '-1.2px', margin: '12px 0 8px 0', color: 'var(--text-main)', lineHeight: '1.1' }}>
            Crónicas & <span style={{ color: 'var(--accent, #3b82f6)' }}>Anuncios</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: isMobile ? '14.5px' : '16.5px', fontWeight: '400' }}>
            Canal oficial de actualizaciones, boletines y novedades de la comunidad.
          </p>
        </div>

        {/* Barra de Búsqueda */}
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Buscar comunicados por título, contenido o palabras clave..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ 
                width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
                padding: '16px 16px 16px 52px', borderRadius: '18px', color: 'var(--text-main)', 
                outline: 'none', fontSize: '14.5px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box',
                boxShadow: 'var(--shadow)'
              }}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* --- SELECTOR DE FILTROS REALES (TABS) --- */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '36px', overflowX: 'auto' }}>
        <button 
          onClick={() => setFiltroActivo('todas')}
          style={{
            background: filtroActivo === 'todas' ? 'var(--text-main, #111827)' : 'transparent',
            color: filtroActivo === 'todas' ? 'var(--bg-primary, #ffffff)' : 'var(--text-muted, #6b7280)',
            border: 'none', padding: '8px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease'
          }}
        >
          <Layers size={15} /> Todos los artículos
        </button>
        
        <button 
          onClick={() => setFiltroActivo('guardadas')}
          style={{
            background: filtroActivo === 'guardadas' ? 'var(--accent, #3b82f6)' : 'transparent',
            color: filtroActivo === 'guardadas' ? '#ffffff' : 'var(--text-muted, #6b7280)',
            border: 'none', padding: '8px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease'
          }}
          className={filtroActivo !== 'guardadas' ? 'bookmark-tab-trigger' : ''}
        >
          <Bookmark size={15} fill={filtroActivo === 'guardadas' ? 'currentColor' : 'none'} /> 
          Mis Guardados ({favoritos.length})
        </button>
      </div>

      {/* --- RENDERIZADO DE LAS TARJETAS --- */}
      {cargando ? (
        <SkeletonLoader />
      ) : (
        noticiasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed var(--border)', borderRadius: '24px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <ShieldAlert size={40} style={{ marginBottom: '14px', opacity: 0.6, color: 'var(--accent, #3b82f6)' }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
              {filtroActivo === 'guardadas' 
                ? 'No tienes lecturas pendientes en tus marcadores.' 
                : 'No se encontraron artículos con ese criterio de búsqueda.'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(310px, 1fr))', 
            gap: '28px' 
          }}>
            {noticiasFiltradas.map((noticia) => {
              const extractoTexto = noticia.descripcion || noticia.contenido || 'Sin descripción adicional.';
              const marcadoComoFav = favoritos.includes(noticia.id);

              return (
                <Link 
                  key={noticia.id} 
                  to={`/noticias/${noticia.id}`}
                  style={{ 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '24px', 
                    overflow: 'hidden', textDecoration: 'none', transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow)',
                    willChange: 'transform, border-color'
                  }}
                  className="news-card"
                >
                  
                  {/* BOTÓN INTEGRADOR DE FAVORITOS DENTRO DE LA CARD */}
                  <button
                    onClick={(e) => toggleBookmark(e, noticia.id)}
                    style={{
                      position: 'absolute', top: '14px', right: '14px', zIndex: 12,
                      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)',
                      color: marcadoComoFav ? 'var(--accent, #3b82f6)' : '#111827',
                      padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="card-bookmark-trigger"
                    title={marcadoComoFav ? "Quitar de marcadores" : "Guardar para después"}
                  >
                    <Bookmark size={15} fill={marcadoComoFav ? "currentColor" : "none"} />
                  </button>

                  {/* IMAGEN DE PORTADA */}
                  {noticia.fotoDefinitiva ? (
                    <div style={{ height: '190px', width: '100%', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: '#0a0a0c', position: 'relative' }}>
                      <img 
                        src={noticia.fotoDefinitiva} 
                        alt={noticia.titulo || "Imagen de noticia"} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                        className="card-image"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div style={{ height: '190px', width: '100%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', justifyContent: 'center' }}>
                      <ImageIcon size={32} style={{ opacity: 0.25, color: 'var(--accent, #3b82f6)' }} />
                    </div>
                  )}
                  
                  {/* CUERPO TEXTUAL */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      <Calendar size={13} style={{ color: 'var(--accent, #3b82f6)' }} /> {formatearFecha(noticia.fecha || noticia.createdAt)}
                    </div>
                    
                    <h3 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 10px 0', color: 'var(--text-main)', lineHeight: '1.4', letterSpacing: '-0.3px' }}>
                      {noticia.titulo}
                    </h3>
                    
                    <p style={{ 
                      color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0', 
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                    }}>
                      {extractoTexto}
                    </p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--accent, #3b82f6)', fontSize: '13.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="read-more-btn">
                        Leer boletín completo <ArrowUpRight size={14} style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }} className="arrow-icon" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* --- INYECCIÓN DE ESTILOS DE INTERACCIÓN PULIDOS --- */}
      <style>{`
        .news-card:hover { 
          transform: translateY(-6px); 
          border-color: var(--accent, #3b82f6); 
          box-shadow: 0 22px 40px rgba(0, 0, 0, 0.08); 
        }
        .news-card:hover .card-image {
          transform: scale(1.04);
        }
        .news-card:hover .arrow-icon {
          transform: translate(3px, -3px);
        }
        .search-input:focus {
          border-color: var(--accent, #3b82f6) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
        }
        .bookmark-tab-trigger:hover {
          background: var(--bg-secondary) !important;
          color: var(--text-main) !important;
        }
        .card-bookmark-trigger:hover {
          transform: scale(1.08);
          background: #ffffff !important;
          color: #000000 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}