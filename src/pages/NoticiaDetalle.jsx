// src/pages/NoticiaDetalle.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NoticiaDetalle() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const snap = await getDoc(doc(db, 'noticias', id));
        if (snap.exists()) setNoticia({ id: snap.id, ...snap.data() });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchNoticia();
  }, [id]);

  if (loading) return <div className="page-wrapper"><div className="loading-spinner" /></div>;
  if (!noticia) return (
    <div className="page-wrapper container">
      <div className="not-found">
        <h2>Noticia no encontrada</h2>
        <Link to="/noticias" className="btn btn-ghost" style={{ marginTop: 16 }}>← Volver</Link>
      </div>
    </div>
  );

  const fecha = noticia.createdAt?.toDate ? format(noticia.createdAt.toDate(), "d 'de' MMMM 'de' yyyy", { locale: es }) : '';

  return (
    <div className="page-wrapper">
      <article className="container article">
        <Link to="/noticias" className="back-link">← Volver a noticias</Link>

        <div className="article-header animate-in">
          {noticia.categoria && <span className="tag tag-accent">{noticia.categoria}</span>}
          <h1 className="article-title">{noticia.titulo}</h1>
          {noticia.resumen && <p className="article-summary">{noticia.resumen}</p>}
          <div className="article-meta">
            <span>📅 {fecha}</span>
            {noticia.autor && <span>✍️ {noticia.autor}</span>}
          </div>
        </div>

        {noticia.imageUrl && (
          <div className="article-hero-img">
            <img src={noticia.imageUrl} alt={noticia.titulo} />
          </div>
        )}

        <div className="article-body">
          {noticia.contenido?.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : <br key={i} />)}
        </div>

        {/* Multimedia extra */}
        {noticia.mediaUrls && noticia.mediaUrls.length > 0 && (
          <div className="article-gallery">
            <h3 className="gallery-title">📸 Galería</h3>
            <div className="gallery-grid">
              {noticia.mediaUrls.map((url, i) => (
                url.includes('video') || url.match(/\.(mp4|mov|webm)/) ? (
                  <video key={i} src={url} controls className="gallery-item" />
                ) : (
                  <img key={i} src={url} alt={`Media ${i + 1}`} className="gallery-item" loading="lazy" />
                )
              ))}
            </div>
          </div>
        )}

        <div className="article-footer">
          <Link to="/noticias" className="btn btn-ghost">← Más noticias</Link>
        </div>
      </article>

      <style>{`
        .article { max-width: 780px; }
        .back-link {
          display: inline-block;
          color: var(--text3);
          font-size: 0.88rem;
          margin-bottom: 28px;
          transition: color var(--transition);
        }
        .back-link:hover { color: var(--text2); }
        .article-header { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
        .article-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .article-summary { color: var(--text2); font-size: 1.15rem; line-height: 1.7; }
        .article-meta { display: flex; gap: 20px; color: var(--text3); font-size: 0.85rem; flex-wrap: wrap; }
        .article-hero-img { border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 36px; }
        .article-hero-img img { width: 100%; max-height: 480px; object-fit: cover; }
        .article-body {
          font-size: 1.05rem;
          line-height: 1.9;
          color: var(--text2);
        }
        .article-body p { margin-bottom: 16px; }
        .article-gallery { margin-top: 48px; }
        .gallery-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .gallery-item { width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius); }
        .article-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); }
        .not-found { padding: 80px 20px; text-align: center; }
      `}</style>
    </div>
  );
}