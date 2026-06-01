import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { ChevronRight, Newspaper, MessageSquare, Image as ImageIcon, Users, Calendar, Eye, ArrowUpRight, Film, Terminal, Sparkles, Activity } from 'lucide-react';

// --- SKELETON PREMIUM CON RASTREO OPERATIVO ---
const HomeSkeleton = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
    <div style={{ height: '480px', background: 'var(--bg-secondary, #1e293b)', borderRadius: '28px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }} className="cyber-home-pulse" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: '340px', background: 'var(--bg-secondary, #1e293b)', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }} className="cyber-home-pulse" />
      ))}
    </div>
    <style>{`
      .cyber-home-pulse::after {
        content: '';
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        background: linear-gradient(90deg, transparent, var(--border, rgba(255,255,255,0.05)), transparent);
        animation: homeScanWave 1.6s infinite linear;
      }
      @keyframes homeScanWave {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

const extraerImagenDeFormaSegura = (data) => {
  if (!data) return null;
  const camposComunes = [data.imagen, data.urlImagen, data.imageUrl, data.multimedia, data.foto, data.url, data.banner];
  for (const valor of camposComunes) {
    if (typeof valor === 'string' && valor.trim() !== '') return valor;
  }
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
  
  // Control de cargas individuales para evitar pop-in asíncrono
  const [cargas, setCargas] = useState({ noticias: true, foro: true, galeria: true, nosotros: true });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincronización Multicanal en Tiempo Real Activa
  useEffect(() => {
    const qNoticias = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(15));
    const unsubNoticias = onSnapshot(qNoticias, (snapshot) => {
      setNoticias(snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          fotoDefinitiva: extraerImagenDeFormaSegura(data)
        };
      }));
      setCargas(prev => ({ ...prev, noticias: false }));
    }, (error) => {
      console.error("Error operativo en canal noticias:", error);
      setCargas(prev => ({ ...prev, noticias: false }));
    });

    const qForo = query(collection(db, 'foro'), orderBy('createdAt', 'desc'), limit(5));
    const unsubForo = onSnapshot(qForo, (snapshot) => {
      setForo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargas(prev => ({ ...prev, foro: false }));
    }, (error) => {
      console.error("Error operativo en canal foro:", error);
      setCargas(prev => ({ ...prev, foro: false }));
    });

    const qGaleria = query(collection(db, 'galeria'), orderBy('fecha', 'desc'), limit(9));
    const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
      setGaleria(snapshot.docs.map(doc => {
        const d = doc.data();
        return { id: doc.id, ...d, urlDefinitiva: d.imagen || d.url || '' };
      }));
      setCargas(prev => ({ ...prev, galeria: false }));
    }, (error) => {
      console.error("Error operativo en canal galeria:", error);
      setCargas(prev => ({ ...prev, galeria: false }));
    });

    const qNosotros = query(collection(db, 'nosotros'), limit(1));
    const unsubNosotros = onSnapshot(qNosotros, (snapshot) => {
      const firstDoc = snapshot.docs[0];
      if (firstDoc) {
        setNosotros({ id: firstDoc.id, ...firstDoc.data() });
      }
      setCargas(prev => ({ ...prev, nosotros: false }));
    }, (error) => {
      console.error("Error operativo en canal nosotros:", error);
      setCargas(prev => ({ ...prev, nosotros: false }));
    });

    // Desmontaje limpio de listeners para prevenir fugas de conexiones WebSocket
    return () => {
      unsubNoticias();
      unsubForo();
      unsubGaleria();
      unsubNosotros();
    };
  }, []);

  // Memorización reactiva de ordenamientos complejos
  const noticiasOrdenadas = useMemo(() => {
    return [...noticias].sort((a, b) => {
      const aDestacada = a.destacada === true;
      const bDestacada = b.destacada === true;
      if (aDestacada && !bDestacada) return -1;
      if (!aDestacada && bDestacada) return 1;
      const fechaA = a.fecha?.toDate ? a.fecha.toDate().getTime() : 0;
      const fechaB = b.fecha?.toDate ? b.fecha.toDate().getTime() : 0;
      return fechaB - fechaA;
    });
  }, [noticias]);

  const featured = useMemo(() => noticiasOrdenadas[0] || null, [noticiasOrdenadas]);

  const noticiasSecundarias = useMemo(() => {
    if (!noticiasOrdenadas.length) return [];
    const idDestacado = featured?.id;
    return noticiasOrdenadas.filter(n => n.id !== idDestacado).slice(0, 4);
  }, [noticiasOrdenadas, featured]);

  // Consolidación de carga
  const isGlobalLoading = useMemo(() => {
    return cargas.noticias || cargas.foro || cargas.galeria || cargas.nosotros;
  }, [cargas]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isGlobalLoading) return <HomeSkeleton />;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary, #ffffff)', color: 'var(--text-main, #111827)', paddingBottom: '80px', overflowX: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Malla de iluminación de fondo general */}
      <div className="home-ambient-glow" />

      {/* --- SECCIÓN HERO CENTRALIZADA --- */}
      <section style={{ padding: isMobile ? '20px 16px' : '40px 32px' }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          minHeight: isMobile ? '450px' : '600px', 
          borderRadius: '32px', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'flex-end', 
          padding: isMobile ? '32px 20px' : '64px', 
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          boxShadow: 'var(--shadow, 0 20px 40px -15px rgba(0,0,0,0.3))',
          border: '1px solid var(--border)'
        }} className="hero-cyber-panel">
          
          <div className="brutal-grid-overlay" />
          
          {featured?.fotoDefinitiva && (
            <img 
              src={featured.fotoDefinitiva} 
              alt="Contexto Principal"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              className="hero-background-image"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(2, 6, 23, 1) 12%, rgba(2, 6, 23, 0.6) 55%, rgba(0, 0, 0, 0.1) 100%)', zIndex: 2 }} />

          <div style={{ maxWidth: '880px', position: 'relative', zIndex: 3 }}>
            
            <div className="cyber-badge-system" style={{ background: featured?.destacada ? 'rgba(0, 204, 136, 0.12)' : 'rgba(0, 163, 255, 0.12)', border: featured?.destacada ? '1px solid rgba(0, 204, 136, 0.3)' : '1px solid rgba(0, 163, 255, 0.3)', color: featured?.destacada ? '#00cc88' : '#00a3ff' }}>
              <Terminal size={12} className="pulse-icon" style={{ color: 'inherit' }} />
              <span>{featured?.destacada ? 'DESTACADO' : 'CRÓNICA DESTACADA'}</span>
            </div>

            <h1 style={{ fontSize: isMobile ? '34px' : '56px', margin: '0 0 16px 0', lineHeight: '1.1', fontWeight: '950', color: '#ffffff', letterSpacing: '-2px' }}>
              {featured?.titulo || 'Bienvenidos al Panel Operativo'}
            </h1>
            
            <p style={{ color: 'rgba(241, 245, 249, 0.85)', marginBottom: '32px', fontSize: isMobile ? '14.5px' : '17.5px', lineHeight: '1.7', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500', maxWidth: '780px' }}>
              {featured?.descripcion || featured?.contenido || 'Monitorización e hilos informativos de la plataforma en tiempo real.'}
            </p>
            
            {featured && (
              <Link to={`/noticias/${featured.id}`} className="brutal-main-action-btn">
                <span>ABRIR REPORTE NÚCLEO</span> <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DISTRIBUIDORA ASIMÉTRICA --- */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px' : '24px 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: '48px', boxSizing: 'border-box' }}>
        
        {/* COLUMNA CRÓNICAS (IZQUIERDA) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.8px', margin: 0 }}>
              <Newspaper size={24} style={{ color: 'var(--accent, #00cc88)' }} /> Prensa & Bitácoras
            </h2>
            <Link to="/noticias" className="industrial-link">
              <span>Ver archivo completo</span> <ChevronRight size={14} />
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            {noticiasSecundarias.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>No se registran bitácoras adicionales en este bloque.</p>
            ) : (
              noticiasSecundarias.map(n => (
                <article key={n.id} className="brutal-news-card" style={{ borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
                  
                  {n.destacada && (
                    <div className="card-floating-badge">
                      <Sparkles size={11} /> <span>FIJADO</span>
                    </div>
                  )}

                  {n.fotoDefinitiva && (
                    <div style={{ height: '190px', overflow: 'hidden', background: '#000', position: 'relative' }}>
                      <img 
                        src={n.fotoDefinitiva} 
                        alt={n.titulo} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                        className="news-card-img" 
                        loading="lazy" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="card-img-gradient" />
                    </div>
                  )}
                  
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'monospace' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} style={{ color: 'var(--accent)' }} /> {formatearFecha(n.fecha)}</span>
                      {n.views !== undefined && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {n.views} VISTAS</span>}
                    </div>
                    
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '900', lineHeight: '1.35', color: 'var(--text-main)', letterSpacing: '-0.4px' }}>{n.titulo}</h3>
                    
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6', fontWeight: '500' }}>
                      {n.descripcion || n.contenido}
                    </p>
                    
                    <Link to={`/noticias/${n.id}`} className="card-action-trigger" style={{ marginTop: 'auto' }}>
                      <span>INGRESAR LECTURA</span> <ChevronRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* ASIDE DE CONEXIÓN E INTERACCIONES (DERECHA) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* MÓDULO FORO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
                <MessageSquare size={22} style={{ color: 'var(--accent, #00cc88)' }} /> Canales Activos
              </h2>
              <Link to="/foro" className="industrial-link-simple">Crear Hilo</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {foro.length === 0 ? (
                <div style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: '500' }}>
                  No se registran transmisiones o debates activos.
                </div>
              ) : (
                foro.map(f => (
                  <Link key={f.id} to="/foro" className="brutal-forum-item" style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)', display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
                    <div className="forum-item-glow" />
                    <span style={{ fontSize: '11px', color: 'var(--accent, #00cc88)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontFamily: 'monospace' }}>
                      <Activity size={10} /> {f.categoria || 'GENERAL//COMUNIDAD'}
                    </span>
                    <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--text-main)', lineHeight: '1.45', fontWeight: '750', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {f.titulo || f.contenido}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'monospace' }}>
                      <span>USR_ [{f.usuario || 'ANÓNIMO'}]</span>
                      <span>{formatearFecha(f.createdAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* MÓDULO GALERÍA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
                <ImageIcon size={22} style={{ color: 'var(--accent, #00cc88)' }} /> Galería Índice
              </h2>
              <Link to="/galeria" className="industrial-link-simple">Desplegar Todo</Link>
            </div>
            {galeria.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>Sin capturas ni cargas multimedia en este índice.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {galeria.map(g => (
                  <Link key={g.id} to="/galeria" className="brutal-thumb-container" style={{ borderRadius: '16px', overflow: 'hidden', height: '100px', border: '1px solid var(--border)', background: '#020617', display: 'block', position: 'relative' }}>
                    {g.tipo === 'video' ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video src={g.urlDefinitiva} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} muted playsInline />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: 'rgba(0,0,0,0.3)' }}>
                          <Film size={18} />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={g.urlDefinitiva} 
                        alt="Indexación de Galería" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                        onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* --- SECCIÓN MANIFIESTO --- */}
      {nosotros && (
        <section style={{ padding: isMobile ? '40px 16px 0' : '72px 32px 0' }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: isMobile ? '48px 20px' : '64px 40px', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)',
            borderRadius: '32px', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }} className="brutal-manifesto-box">
            <div className="manifesto-grid-overlay" />
            
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '20px', background: 'var(--bg-primary)', color: 'var(--accent, #00cc88)', marginBottom: '22px', border: '1px solid var(--border)', position: 'relative', zIndex: 2 }}>
              <Users size={30} />
            </div>
            
            <h2 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '950', color: 'var(--text-main)', letterSpacing: '-1.2px', position: 'relative', zIndex: 2, margin: 0 }}>
              Operación Colectiva
            </h2>
            
            <p style={{ maxWidth: '800px', margin: '14px auto 0', color: 'var(--text-muted)', fontSize: '15.5px', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontWeight: '500', position: 'relative', zIndex: 2 }}>
              {nosotros.descripcion}
            </p>
          </div>
        </section>
      )}

      {/* COMPILADO INTERACTIVO CSS - PRODUCCIÓN BRUTALISTA */}
      <style>{`
        .home-ambient-glow {
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 600px;
          background: radial-gradient(circle, rgba(0, 204, 136, 0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .brutal-grid-overlay, .manifesto-grid-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 2;
        }
        .manifesto-grid-overlay {
          background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
          opacity: 0.12;
          z-index: 1;
        }

        .cyber-badge-system {
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
          padding: 6px 14px; 
          border-radius: 10px; 
          font-size: 11px; 
          font-weight: 900; 
          margin-bottom: 24px;
          font-family: monospace;
        }
        .pulse-icon {
          animation: badgePulse 2s infinite ease-in-out;
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .brutal-main-action-btn {
          background: #ffffff; 
          color: #020617; 
          font-weight: 800; 
          padding: 16px 32px; 
          border-radius: 16px; 
          display: inline-flex; 
          align-items: center; 
          gap: 10px; 
          font-size: 14px; 
          text-decoration: none; 
          font-family: monospace;
          border: 1px solid transparent;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .brutal-news-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-floating-badge {
          position: absolute; top: 16px; right: 16px; 
          background: #00cc88; color: #020617; 
          padding: 5px 10px; border-radius: 8px; 
          font-size: 10px; font-weight: 900; z-index: 5; 
          display: flex; align-items: center; gap: 4px;
          font-family: monospace;
        }
        .card-img-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, var(--bg-secondary) 5%, transparent 60%);
          z-index: 2;
        }
        .card-action-trigger {
          color: var(--accent, #00cc88); 
          font-weight: 800; 
          font-size: 12px; 
          display: inline-flex; 
          align-items: center; 
          gap: 4px; 
          text-decoration: none;
          font-family: monospace;
          transition: gap 0.2s;
        }

        .brutal-forum-item {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .forum-item-glow {
          position: absolute; right: -30px; bottom: -30px;
          width: 80px; height: 80px;
          background: var(--accent, #00cc88);
          filter: blur(35px); opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        @media (min-width: 992px) {
          .hero-cyber-panel:hover .hero-background-image {
            transform: scale(1.03);
          }
          .brutal-main-action-btn:hover {
            transform: translateY(-3px);
            background: var(--accent, #00cc88);
            color: #ffffff;
            box-shadow: 0 16px 32px rgba(0, 204, 136, 0.25);
          }
          .brutal-news-card:hover {
            transform: translateY(-6px);
            border-color: rgba(0, 204, 136, 0.4) !important;
            box-shadow: 0 20px 40px -10px rgba(0, 204, 136, 0.08);
          }
          .brutal-news-card:hover .news-card-img {
            transform: scale(1.04);
          }
          .brutal-news-card:hover .card-action-trigger {
            gap: 8px;
          }
          .brutal-forum-item:hover {
            transform: translateX(4px);
            border-color: rgba(0, 204, 136, 0.3) !important;
          }
          .brutal-forum-item:hover .forum-item-glow {
            opacity: 0.15;
          }
          .brutal-thumb-container:hover img {
            transform: scale(1.08);
          }
          .brutal-thumb-container:hover {
            border-color: var(--accent, #00cc88) !important;
            box-shadow: 0 8px 16px rgba(0, 204, 136, 0.1);
          }
          .industrial-link:hover span, .industrial-link-simple:hover {
            color: var(--accent, #00cc88);
            text-decoration: underline;
          }
        }

        .industrial-link, .industrial-link-simple {
          color: var(--text-muted); text-decoration: none; font-size: 13.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: color 0.2s;
        }
        .industrial-link-simple { font-size: 13px; font-family: monospace; color: var(--accent, #00cc88); }
      `}</style>
    </div>
  );
}