import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, User, ArrowLeft, Image as ImageIcon, Clock, Share2, Bookmark, Check } from 'lucide-react';

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

export default function NoticiaDetalle() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Estados funcionales avanzados
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'info' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // Verificar si esta noticia ya está guardada en LocalStorage de forma local y real
    const favoritos = JSON.parse(localStorage.getItem('noticias_favoritas') || '[]');
    if (favoritos.includes(id)) {
      setIsBookmarked(true);
    }
    
    async function fetchNoticia() {
      try {
        const snap = await getDoc(doc(db, 'noticias', id));
        if (snap.exists()) {
          const data = snap.data();
          setNoticia({ 
            id: snap.id, 
            ...data,
            fotoDefinitiva: obtenerFotoNoticia(data)
          });
          
          document.title = `${data.titulo || 'Noticia'} | Comunidad`;
        }
      } catch (e) { 
        console.error("Error cargando la crónica:", e); 
      } finally { 
        setLoading(false); 
      }
    }

    fetchNoticia();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id]);

  // --- FUNCIÓN DE TOAST (NOTIFICACIÓN TEMPORAL) ---
  const mostrarToast = (mensaje, tipo = 'info') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast({ visible: false, mensaje: '', tipo: 'info' });
    }, 3000);
  };

  // --- FUNCIÓN REAL DE COMPARTIR ---
  const handleShare = async () => {
    const shareData = {
      title: noticia?.titulo || 'Noticia de Interés',
      text: noticia?.descripcion?.slice(0, 100) || 'Echa un vistazo a esta publicación.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        mostrarToast('¡Compartido con éxito!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    } else {
      // Fallback profesional: Copiar enlace al portapapeles de forma silenciosa
      try {
        await navigator.clipboard.writeText(window.location.href);
        mostrarToast('¡Enlace copiado al portapapeles!', 'success');
      } catch (err) {
        mostrarToast('No se pudo copiar el enlace automáticamente', 'error');
      }
    }
  };

  // --- FUNCIÓN REAL DE MARCADOR/BOOKMARK ---
  const handleBookmark = () => {
    let favoritos = JSON.parse(localStorage.getItem('noticias_favoritas') || '[]');
    
    if (isBookmarked) {
      favoritos = favoritos.filter(favId => favId !== id);
      mostrarToast('Artículo removido de tus marcadores', 'info');
      setIsBookmarked(false);
    } else {
      favoritos.push(id);
      mostrarToast('Artículo guardado para leer después', 'success');
      setIsBookmarked(true);
    }
    
    localStorage.setItem('noticias_favoritas', JSON.stringify(favoritos));
  };

  const formatearFecha = (data) => {
    if (!data) return "Reciente";
    const date = data.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '820px', margin: '60px auto', padding: '0 24px', animation: 'pulse-detail 1.5s infinite ease-in-out' }}>
        <div style={{ height: '32px', width: '140px', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '20px', marginBottom: '24px' }} />
        <div style={{ height: '48px', width: '90%', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '12px', marginBottom: '20px' }} />
        <div style={{ height: '20px', width: '40%', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '6px', marginBottom: '40px' }} />
        <div style={{ height: '460px', width: '100%', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '28px', marginBottom: '40px' }} />
        <style>{`@keyframes pulse-detail { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--text-main, #111827)', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>Comunicado no disponible</h2>
        <p style={{ color: 'var(--text-muted, #6b7280)', marginBottom: '32px', fontSize: '16px' }}>El artículo fue archivado o la ruta es inválida.</p>
        <Link to="/noticias" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', padding: '12px 24px', borderRadius: '14px', background: 'white' }}>
          <ArrowLeft size={16} /> Regresar al listado
        </Link>
      </div>
    );
  }

  const imagenPrincipal = noticia.fotoDefinitiva;
  const cuerpoTexto = noticia.descripcion || noticia.contenido || noticia.resumen || "";
  const fechaPublicacion = noticia.fecha || noticia.createdAt;

  const conteoPalabras = cuerpoTexto.split(/\s+/).filter(Boolean).length;
  const tiempoLectura = Math.max(1, Math.ceil(conteoPalabras / 200));

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary, #ffffff)', color: 'var(--text-main, #111827)', paddingBottom: '100px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
      
      {/* BARRA DE PROGRESO DE LECTURA TOP */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: `${scrollProgress}%`, height: '3.5px', background: 'var(--accent, #3b82f6)', zIndex: 9999, transition: 'width 0.1s ease-out' }} />

      {/* TOAST DE AVISOS NOTIFICADOR */}
      {toast.visible && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 10000, background: '#1e293b', color: '#ffffff', padding: '14px 24px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: toast.tipo === 'success' ? '#10b981' : '#3b82f6' }}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </div>
          {toast.mensaje}
        </div>
      )}

      <article style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '32px 16px' : '50px 32px', boxSizing: 'border-box', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} className="article-container">
        
        {/* LÍNEA DE ACCIONES SUPERIOR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/noticias" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #6b7280)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }} className="hover-back-link">
            <ArrowLeft size={16} className="arrow-back-icon" /> Volver a Prensa
          </Link>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleBookmark} 
              style={{ background: 'var(--bg-secondary, #f3f4f6)', border: '1px solid var(--border, #e5e7eb)', color: isBookmarked ? 'var(--accent, #3b82f6)' : 'var(--text-muted, #6b7280)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} 
              className="action-circle-btn"
              title="Guardar noticia"
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare} 
              style={{ background: 'var(--bg-secondary, #f3f4f6)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-muted, #6b7280)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} 
              className="action-circle-btn"
              title="Compartir o copiar enlace"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* ENCABEZADO EDITORIAL */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '36px' }}>
          {noticia.categoria && (
            <span style={{ alignSelf: 'flex-start', background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)', color: 'var(--accent, #3b82f6)', padding: '6px 16px', borderRadius: '24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {noticia.categoria}
            </span>
          )}
          
          <h1 style={{ fontSize: isMobile ? '30px' : '46px', fontWeight: '850', lineHeight: '1.2', letterSpacing: '-1.5px', margin: 0, color: 'var(--text-main, #111827)' }}>
            {noticia.titulo}
          </h1>

          {/* METADATOS METICULOSOS */}
          <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted, #6b7280)', fontSize: '13.5px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border, #e5e7eb)', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '14px', paddingTop: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
              <Calendar size={14} style={{ color: 'var(--accent, #3b82f6)' }} /> {formatearFecha(fechaPublicacion)}
            </span>
            {noticia.autor && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <User size={14} /> Redacción: <strong>{noticia.autor}</strong>
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: isMobile ? '0' : 'auto', fontSize: '13px', background: 'var(--bg-secondary, #f9fafb)', padding: '4px 10px', borderRadius: '8px' }}>
              <Clock size={13} /> {tiempoLectura} {tiempoLectura === 1 ? 'min' : 'mins'} de lectura
            </span>
          </div>
        </header>

        {/* PORTADA PRINCIPAL FLUIDA */}
        {imagenPrincipal ? (
          <div style={{ width: '100%', height: isMobile ? '260px' : '480px', borderRadius: '28px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid var(--border, #e5e7eb)', background: '#050507' }}>
            <img src={imagenPrincipal} alt={noticia.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ) : (
          <div style={{ width: '100%', height: '180px', borderRadius: '28px', background: 'var(--bg-secondary, #f9fafb)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', border: '1px solid var(--border, #e5e7eb)' }}>
            <ImageIcon size={40} style={{ opacity: 0.25, color: 'var(--accent, #3b82f6)' }} />
          </div>
        )}

        {/* CUERPO DEL ARTÍCULO (ESTILO MEDIUM) */}
        <div style={{ fontSize: isMobile ? '16.5px' : '19px', lineHeight: '1.85', color: 'var(--text-main, #111827)', letterSpacing: '-0.01em' }} className="article-body-content">
          {cuerpoTexto.split('\n').map((parrafo, i) => parrafo.trim() ? (
            <p key={i} style={{ marginBottom: '24px', wordBreak: 'break-word', fontWeight: '400', opacity: 0.9 }}>{parrafo}</p>
          ) : (
            <div key={i} style={{ height: '12px' }} />
          ))}
        </div>

        {/* COMPLEMENTOS MULTIMEDIA REFINADOS */}
        {noticia.mediaUrls && noticia.mediaUrls.length > 0 && (
          <div style={{ marginTop: '56px', paddingTop: '36px', borderTop: '1px solid var(--border, #e5e7eb)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
              <ImageIcon size={20} style={{ color: 'var(--accent, #3b82f6)' }} /> Archivos gráficos vinculados
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              {noticia.mediaUrls.map((url, i) => {
                const esVideo = url.includes('video') || url.match(/\.(mp4|mov|webm)/i);
                return (
                  <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid var(--border, #e5e7eb)', background: '#000', height: '240px' }}>
                    {esVideo ? (
                      <video src={url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={url} alt={`Adjunto informativo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCIÓN DE CIERRE */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border, #e5e7eb)', display: 'flex', justifyContent: 'center' }}>
          <Link to="/noticias" style={{ background: 'var(--bg-secondary, #f3f4f6)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-main, #111827)', padding: '14px 32px', borderRadius: '16px', textDecoration: 'none', fontSize: '14.5px', fontWeight: '700', transition: 'all 0.2s ease' }} className="back-panel-btn">
            Regresar a la cartelera principal
          </Link>
        </div>

      </article>

      {/* INYECCIÓN DE ESTILOS AVANZADOS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .hover-back-link { transition: color 0.2s ease; }
        .hover-back-link:hover { color: var(--text-main, #111827) !important; }
        .hover-back-link:hover .arrow-back-icon { transform: translateX(-3px); }
        .arrow-back-icon { transition: transform 0.2s ease; }
        
        .action-circle-btn:hover {
          background: var(--border, #e5e7eb) !important;
          color: var(--text-main, #111827) !important;
        }
        .back-panel-btn:hover { background: var(--border, #e5e7eb) !important; transform: translateY(-1px); }
        
        /* Letra capital pulida e institucional */
        .article-body-content p:first-of-type::first-letter {
          font-size: ${isMobile ? 'inherit' : '3.8rem'};
          font-weight: 900;
          color: var(--accent, #3b82f6);
          float: left;
          line-height: 0.85;
          margin-right: 10px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}