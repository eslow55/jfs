// src/components/admin/AdminChismes.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AdminChismes() {
  const [chismes, setChismes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChismes(); }, []);

  async function fetchChismes() {
    try {
      const snap = await getDocs(query(collection(db, 'chismes'), orderBy('createdAt', 'desc')));
      setChismes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este chisme?')) return;
    try {
      await deleteDoc(doc(db, 'chismes', id));
      toast.success('Chisme eliminado');
      setChismes(prev => prev.filter(c => c.id !== id));
    } catch (e) { toast.error('Error'); }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <p className="section-count">{chismes.length} chisme(s) publicado(s)</p>
        <p className="moderation-note">🛡️ Modera el contenido inapropiado</p>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        <div className="chismes-admin-list">
          {chismes.length === 0 ? (
            <div className="empty-admin">No hay chismes publicados.</div>
          ) : chismes.map(c => (
            <div key={c.id} className="chisme-admin-item">
              <div className="chisme-admin-header">
                <div className="chisme-admin-meta">
                  <span className="anon-label">👤 Anónimo</span>
                  {c.categoria && <span className="tag tag-purple">{c.categoria}</span>}
                  <span className="chisme-admin-date">
                    {c.createdAt?.toDate ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}
                  </span>
                </div>
                <div className="chisme-admin-stats">
                  <span>❤️ {c.likes || 0}</span>
                  <button className="btn btn-ghost delete-btn" onClick={() => handleDelete(c.id)}>🗑️ Eliminar</button>
                </div>
              </div>
              <p className="chisme-admin-text">{c.texto}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-section { display: flex; flex-direction: column; gap: 20px; }
        .admin-section-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .section-count { color: var(--text3); font-size: 0.88rem; }
        .moderation-note { font-size: 0.82rem; color: var(--text3); }
        .chismes-admin-list { display: flex; flex-direction: column; gap: 10px; }
        .chisme-admin-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          transition: border-color var(--transition);
        }
        .chisme-admin-item:hover { border-color: var(--border2); }
        .chisme-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chisme-admin-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .anon-label { font-size: 0.8rem; color: var(--text3); font-family: var(--font-display); font-weight: 600; }
        .chisme-admin-date { font-size: 0.75rem; color: var(--text3); }
        .chisme-admin-stats { display: flex; align-items: center; gap: 12px; }
        .chisme-admin-stats > span { font-size: 0.82rem; color: var(--accent2); }
        .delete-btn { font-size: 0.8rem; padding: 5px 12px; color: var(--accent); }
        .delete-btn:hover { background: var(--accent-dim); }
        .chisme-admin-text { color: var(--text2); font-size: 0.95rem; line-height: 1.7; }
        .empty-admin { text-align: center; color: var(--text3); padding: 40px; }
      `}</style>
    </div>
  );
}