import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { ChevronRight, Newspaper, MessageSquare, Image as ImageIcon, Users, Calendar, Eye, ArrowUpRight, Film } from 'lucide-react';

// --- SKELETON PARA LA CARGA DE PANTALLA ---
const HomeSkeleton = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
    <div style={{ height: '480px', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '28px', animation: 'pulse-home 1.5s infinite' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: '320px', background: 'var(--bg-secondary, #f3f4f6)', borderRadius: '24px', animation: 'pulse-home 1.5s infinite' }} />
      ))}
    </div>
    <style>{`@keyframes pulse-home { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.25; } }`}</style>
  </div>
);

// FUNCIÓN RECOLECTORA ANTIFALLOS: Escanea todo el objeto buscando cualquier URL de imagen válida
const extraerImagenDeFormaSegura = (data) => {
  if (!data) return null;
  // 1. Intento con nombres de campos estándar conocidos
  const camposComunes = [data.imagen, data.urlImagen, data.imageUrl, data.multimedia, data.foto, data.url, data.banner];
  for (const valor of camposComunes) {
    if (typeof valor === 'string' && valor.trim() !== '') return valor;
  }
  // 2. Contingencia extrema: Buscar cualquier string que empiece con http en el documento
  for (const propiedad in data) {
    const stringPosible = data[propiedad];
    if (typeof stringPosible === 'string' && (stringPosible.startsWith('http://') || stringPosible.startsWith('https://'))) {
      return stringPosible;
    }
  }
  return null;
};

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [foro, setForo] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [nosotros, setNosotros] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincronización en Tiempo Real con Firebase
  useEffect(() => {
    const qNoticias = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(6));
    const unsubNoticias = onSnapshot(qNoticias, (snapshot) => {
      setNoticias(snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          fotoDefinitiva: extraerImagenDeFormaSegura(data)
        };
      }));
      setLoading(false);
    }, (error) => console.error("Error noticias:", error));

    const qForo = query(collection(db, 'foro'), orderBy('createdAt', 'desc'), limit(5));
    const unsubForo = onSnapshot(qForo, (snapshot) => {
      setForo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error foro:", error));

    const qGaleria = query(collection(db, 'galeria'), orderBy('fecha', 'desc'), limit(9));
    const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
      setGaleria(snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, urlDefinitiva: data.imagen || data.url || '' };
      }));
    }, (error) => console.error("Error galería:", error));

    const qNosotros = query(collection(db, 'nosotros'), limit(1));
    const unsubNosotros = onSnapshot(qNosotros, (snapshot) => {
      const firstDoc = snapshot.docs[0];
      if (firstDoc) setNosotros({ id: firstDoc.id, ...firstDoc.data() });
    }, (error) => console.error("Error nosotros:", error));

    return () => {
      unsubNoticias();
      unsubForo();
      unsubGaleria();
      unsubNosotros();
    };
  }, []);

  // Determinar Artículo Destacado (Por visualizaciones o el primero de la lista)
  const featured = useMemo(() => {
    if (!noticias.length) return null;
    return [...noticias].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  }, [noticias]);

  // Filtrar artículos secundarios
  const noticiasSecundarias = useMemo(() => {
    if (!noticias.length) return [];
    const idDestacado = featured?.id;
    return noticias.filter(n => n.id !== idDestacado).slice(0, 4);
  }, [noticias, featured]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return <HomeSkeleton />;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary, #ffffff)', color: 'var(--text-main, #111827)', paddingBottom: '80px', overflowX: 'hidden', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ==========================================================================
          HERO SECTION REESTRUCTURADO (CON ETIQUETA <img> NATIVA ABSOLUTA)
          ========================================================================== */}
      <section style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          minHeight: isMobile ? '420px' : '560px', 
          borderRadius: '32px', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'flex-end', 
          padding: isMobile ? '32px 24px' : '64px', 
          position: 'relative', // Obligatorio para contener la imagen y la capa oscura
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Fondo de respaldo sólido
          boxShadow: 'var(--shadow, 0 10px 25px -5px rgba(0,0,0,0.1))',
          border: '1px solid var(--border, #e5e7eb)'
        }} className="hero-banner">
          
          {/* 1. RENDERIZADO HTML NATIVO DE LA PORTADA DESTACADA */}
          {featured?.fotoDefinitiva && (
            <img 
              src={featured.fotoDefinitiva} 
              alt="Portada Destacada"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1 // Capa más baja
              }}
              onError={(e) => {
                console.error("Error cargando la imagen del Hero, usando respaldo.");
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* 2. FILTRO GRADIENTE OSCURO PARA LA LEGIBILIDAD DEL TEXTO */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(10, 10, 15, 0.98) 15%, rgba(10, 10, 15, 0.5) 65%, rgba(0, 0, 0, 0.2) 100%)',
            zIndex: 2 // Capa intermedia
          }} />

          {/* 3. CONTENEDOR DE CONTENIDO DEL HERO */}
          <div style={{ maxWidth: '850px', position: 'relative', zIndex: 3 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', marginBottom: '20px', textTransform: 'uppercase' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} /> Editorial Destacada
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', margin: '0 0 16px 0', lineHeight: '1.15', fontWeight: '850', color: '#ffffff', letterSpacing: '-1.5px' }}>
              {featured?.titulo || 'Bienvenidos a la Comunidad'}
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '32px', fontSize: isMobile ? '14.5px' : '17px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '400' }}>
              {featured?.descripcion || featured?.contenido || 'Accede a los comunicados institucionales, debates del foro y material audiovisual en tiempo real.'}
            </p>
            {featured && (
              <Link to={`/noticias/${featured.id}`} style={{ background: '#ffffff', color: '#050508', fontWeight: '700', padding: '14px 28px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px', textDecoration: 'none', transition: 'all 0.25s' }} className="hero-main-btn">
                Leer artículo completo <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          MÓDULO CENTRAL ASIMÉTRICO (PRENSA, DISCUSIONES Y CAPTURAS)
          ========================================================================== */}
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: isMobile ? '0 16px' : '0 32px', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', 
        gap: '48px',
        boxSizing: 'border-box'
      }}>
        
        {/* COLUMNA IZQUIERDA: COMUNICADOS SECUNDARIOS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: '850', letterSpacing: '-0.8px', margin: 0, color: 'var(--text-main, #111827)' }}>
              <Newspaper size={24} style={{ color: 'var(--accent, #3b82f6)' }} /> Prensa & Crónicas
            </h2>
            <Link to="/noticias" style={{ color: 'var(--accent, #3b82f6)', textDecoration: 'none', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }} className="view-all-link">
              Ver todo <ChevronRight size={14} />
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            {noticiasSecundarias.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '14px', fontStyle: 'italic' }}>No hay comunicados adicionales.</p>
            ) : (
              noticiasSecundarias.map(n => (
                <article key={n.id} className="home-card" style={{ borderRadius: '24px', border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-secondary, #f9fafb)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))' }}>
                  {n.fotoDefinitiva && (
                    <div style={{ height: '180px', overflow: 'hidden', background: '#000' }}>
                      <img src={n.fotoDefinitiva} alt={n.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  )}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted, #6b7280)', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} style={{ color: 'var(--accent, #3b82f6)' }} /> {formatearFecha(n.fecha)}</span>
                      {n.views !== undefined && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={13} /> {n.views}</span>}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', lineHeight: '1.35', color: 'var(--text-main, #111827)', letterSpacing: '-0.3px' }}>{n.titulo}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted, #6b7280)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.55' }}>
                      {n.descripcion || n.contenido}
                    </p>
                    <Link to={`/noticias/${n.id}`} style={{ color: 'var(--accent, #3b82f6)', fontWeight: '700', fontSize: '14px', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                      Apertura <ChevronRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA: ASIDE INTERACTIVO */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* FORO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '850', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main, #111827)' }}>
                <MessageSquare size={22} style={{ color: 'var(--accent, #3b82f6)' }} /> Hilos Activos
              </h2>
              <Link to="/foro" style={{ color: 'var(--accent, #3b82f6)', textDecoration: 'none', fontSize: '13.5px', fontWeight: '700' }}>Participar</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {foro.length === 0 ? (
                <div style={{ padding: '24px', background: 'var(--bg-secondary, #f9fafb)', border: '1px dashed var(--border, #e5e7eb)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted, #6b7280)', fontSize: '14px' }}>
                  Sin debates abiertos en este ciclo.
                </div>
              ) : (
                foro.map(f => (
                  <Link key={f.id} to="/foro" style={{ padding: '18px', background: 'var(--bg-secondary, #f9fafb)', borderRadius: '16px', border: '1px solid var(--border, #e5e7eb)', display: 'block', textDecoration: 'none', transition: 'all 0.2s ease', boxShadow: 'var(--shadow, 0 1px 2px rgba(0,0,0,0.03))' }} className="forum-sidebar-item">
                    <span style={{ fontSize: '11px', color: 'var(--accent, #3b82f6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      {f.categoria || 'Comunidad'}
                    </span>
                    <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--text-main, #111827)', lineHeight: '1.45', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {f.titulo || f.contenido}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted, #6b7280)' }}>
                      <span>Por {f.usuario || 'Anónimo'}</span>
                      <span>{formatearFecha(f.createdAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* GALERÍA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '850', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main, #111827)' }}>
                <ImageIcon size={22} style={{ color: 'var(--accent, #3b82f6)' }} /> Capturas
              </h2>
              <Link to="/galeria" style={{ color: 'var(--accent, #3b82f6)', textDecoration: 'none', fontSize: '13.5px', fontWeight: '700' }}>Ver multimedia</Link>
            </div>
            {galeria.length === 0 ? (
              <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '14px' }}>No hay archivos multimedia en exhibición.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {galeria.map(g => (
                  <Link key={g.id} to="/galeria" style={{ borderRadius: '12px', overflow: 'hidden', height: '95px', border: '1px solid var(--border, #e5e7eb)', background: '#050505', display: 'block', position: 'relative' }} className="gallery-thumbnail">
                    {g.tipo === 'video' ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video src={g.urlDefinitiva} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} muted playsInline />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: 'rgba(0,0,0,0.25)' }}>
                          <Film size={18} />
                        </div>
                      </div>
                    ) : (
                      <img src={g.urlDefinitiva} alt="Recurso de galería" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* SOBRE NOSOTROS */}
      {nosotros && (
        <section style={{ padding: isMobile ? '48px 16px 0' : '80px 32px 0' }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: isMobile ? '48px 24px' : '64px 40px', 
            background: 'linear-gradient(135deg, var(--bg-secondary, #f9fafb) 0%, rgba(59, 130, 246, 0.03) 100%)', 
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: '32px', 
            textAlign: 'center',
            boxShadow: 'var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.02))'
          }}>
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--bg-primary, #ffffff)', color: 'var(--accent, #3b82f6)', marginBottom: '20px', border: '1px solid var(--border, #e5e7eb)' }}>
              <Users size={32} />
            </div>
            <h2 style={{ fontSize: '30px', marginBottom: '16px', fontWeight: '850', color: 'var(--text-main, #111827)', letterSpacing: '-0.8px' }}>Sobre Nosotros</h2>
            <p style={{ maxWidth: '750px', margin: '0 auto', color: 'var(--text-muted, #6b7280)', fontSize: '15.5px', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontWeight: '400' }}>
              {nosotros.descripcion}
            </p>
          </div>
        </section>
      )}

      {/* --- EFECTOS HOVER --- */}
      <style>{`
        .home-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .home-card:hover { transform: translateY(-5px); border-color: var(--accent, #3b82f6) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; }
        .hero-main-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3); background: var(--accent, #3b82f6) !important; color: white !important; }
        .forum-sidebar-item:hover { border-color: rgba(59, 130, 246, 0.4) !important; transform: translateX(4px); }
        .gallery-thumbnail { position: relative; overflow: hidden; transition: border-color 0.2s; }
        .gallery-thumbnail::after { content: ''; position: absolute; inset: 0; background: rgba(59,130,246,0); transition: background 0.3s; }
        .gallery-thumbnail:hover::after { background: rgba(59, 130, 246, 0.15); }
        .gallery-thumbnail:hover img { transform: scale(1.06); }
        .gallery-thumbnail:hover { border-color: var(--accent, #3b82f6) !important; }
        .view-all-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}