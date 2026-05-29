// src/pages/SobreNosotros.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_INFO = {
  descripcion: 'Somos JFS, un grupo especial con historias, momentos y chismes para compartir. Esta página es nuestro espacio.',
  miembros: [],
  createdYear: '2024',
};

export default function SobreNosotros() {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const snap = await getDoc(doc(db, 'config', 'nosotros'));
        if (snap.exists()) setInfo({ ...DEFAULT_INFO, ...snap.data() });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchInfo();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-in">
          <h1 className="page-title">👥 Sobre Nosotros</h1>
          <p className="page-subtitle">Quiénes somos y de qué va todo esto</p>
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <>
            <div className="about-hero card animate-in">
              <div className="about-badge">JFS</div>
              <h2 className="about-title">El Grupo</h2>
              <p className="about-desc">{info.descripcion}</p>
              {info.createdYear && (
                <div className="about-since">
                  <span className="tag tag-gold">✨ Desde {info.createdYear}</span>
                </div>
              )}
            </div>

            {info.miembros && info.miembros.length > 0 && (
              <div className="miembros-section">
                <h2 className="section-heading">Los del grupo</h2>
                <div className="miembros-grid">
                  {info.miembros.map((m, i) => (
                    <div key={i} className="miembro-card card animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="miembro-avatar">
                        {m.foto ? <img src={m.foto} alt={m.nombre} /> : <span>{m.nombre?.[0] || '?'}</span>}
                      </div>
                      <div className="miembro-info">
                        <h3 className="miembro-nombre">{m.nombre}</h3>
                        {m.apodo && <span className="miembro-apodo">"{m.apodo}"</span>}
                        {m.descripcion && <p className="miembro-desc">{m.descripcion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {info.seccionExtra && (
              <div className="extra-section card">
                <h3 className="extra-title">{info.seccionExtra.titulo}</h3>
                <p className="extra-text">{info.seccionExtra.texto}</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .page-header { margin-bottom: 36px; }
        .about-hero {
          padding: 48px;
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, var(--surface), var(--surface2));
          border-color: var(--border2);
        }
        .about-badge {
          width: 80px; height: 80px;
          background: var(--accent);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          margin: 0 auto 20px;
        }
        .about-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .about-desc {
          color: var(--text2);
          font-size: 1.1rem;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto 20px;
        }
        .about-since { margin-top: 8px; }

        .miembros-section { margin-bottom: 40px; }
        .section-heading {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .miembros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .miembro-card { padding: 24px; text-align: center; }
        .miembro-avatar {
          width: 70px; height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          overflow: hidden;
        }
        .miembro-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .miembro-nombre {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .miembro-apodo { color: var(--accent2); font-size: 0.85rem; font-style: italic; display: block; margin-bottom: 8px; }
        .miembro-desc { color: var(--text3); font-size: 0.82rem; line-height: 1.5; }

        .extra-section { padding: 32px; }
        .extra-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; }
        .extra-text { color: var(--text2); line-height: 1.7; }
      `}</style>
    </div>
  );
}