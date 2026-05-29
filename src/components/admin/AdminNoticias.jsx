// src/components/admin/AdminNoticias.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const CATEGORIAS = ['General', 'Eventos', 'Fotos', 'Logros', 'Otro'];

const EMPTY_FORM = { titulo: '', resumen: '', contenido: '', categoria: 'General', autor: '' };

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [extraFiles, setExtraFiles] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const imgRef = useRef();
  const extrasRef = useRef();

  useEffect(() => { fetchNoticias(); }, []);

  async function fetchNoticias() {
    try {
      const snap = await getDocs(query(collection(db, 'noticias'), orderBy('createdAt', 'desc')));
      setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleExtrasChange(e) {
    const files = Array.from(e.target.files);
    setExtraFiles(files);
    setExtraPreviews(files.map(f => ({ url: URL.createObjectURL(f), type: f.type })));
  }

  async function uploadFile(file, path) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      task.on('state_changed',
        snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) { toast.error('El título es obligatorio'); return; }
    setSubmitting(true);
    setUploading(true);
    try {
      let imageUrl = editId ? noticias.find(n => n.id === editId)?.imageUrl || '' : '';
      let mediaUrls = editId ? noticias.find(n => n.id === editId)?.mediaUrls || [] : [];

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, `noticias/${Date.now()}_${imageFile.name}`);
      }
      if (extraFiles.length > 0) {
        const urls = await Promise.all(extraFiles.map(f => uploadFile(f, `noticias/extras/${Date.now()}_${f.name}`)));
        mediaUrls = [...mediaUrls, ...urls];
      }

      const data = { ...form, imageUrl, mediaUrls, updatedAt: serverTimestamp() };

      if (editId) {
        await updateDoc(doc(db, 'noticias', editId), data);
        toast.success('Noticia actualizada ✅');
      } else {
        await addDoc(collection(db, 'noticias'), { ...data, createdAt: serverTimestamp() });
        toast.success('Noticia publicada 🎉');
      }

      setForm(EMPTY_FORM);
      setImageFile(null); setImagePreview('');
      setExtraFiles([]); setExtraPreviews([]);
      setEditId(null); setShowForm(false);
      fetchNoticias();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar');
    } finally {
      setSubmitting(false); setUploading(false); setProgress(0);
    }
  }

  async function handleDelete(noticia) {
    if (!window.confirm(`¿Eliminar "${noticia.titulo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'noticias', noticia.id));
      if (noticia.imageUrl) {
        try { await deleteObject(ref(storage, noticia.imageUrl)); } catch (_) {}
      }
      toast.success('Noticia eliminada');
      fetchNoticias();
    } catch (e) { toast.error('Error al eliminar'); }
  }

  function handleEdit(n) {
    setForm({ titulo: n.titulo || '', resumen: n.resumen || '', contenido: n.contenido || '', categoria: n.categoria || 'General', autor: n.autor || '' });
    setImagePreview(n.imageUrl || '');
    setEditId(n.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <p className="section-count">{noticias.length} noticia{noticias.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); setImagePreview(''); }}>
          {showForm ? '✕ Cancelar' : '+ Nueva Noticia'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="admin-form-card">
          <h3 className="form-card-title">{editId ? '✏️ Editar noticia' : '📰 Nueva noticia'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título de la noticia" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-select" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Autor</label>
              <input className="form-input" value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} placeholder="Nombre del autor (opcional)" />
            </div>

            <div className="form-group">
              <label className="form-label">Resumen corto</label>
              <input className="form-input" value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} placeholder="Descripción breve para la lista" />
            </div>

            <div className="form-group">
              <label className="form-label">Contenido completo *</label>
              <textarea className="form-textarea" value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} placeholder="Escribe la noticia aquí..." rows={8} />
            </div>

            {/* Imagen principal */}
            <div className="form-group">
              <label className="form-label">Imagen principal</label>
              <div className="upload-area" onClick={() => imgRef.current.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span>🖼️</span>
                    <span>Haz clic para subir imagen</span>
                    <span className="upload-hint">JPG, PNG, WebP</span>
                  </div>
                )}
              </div>
              <input type="file" ref={imgRef} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              {imagePreview && <button type="button" className="btn btn-ghost clear-btn" onClick={() => { setImageFile(null); setImagePreview(''); }}>✕ Quitar imagen</button>}
            </div>

            {/* Archivos extra */}
            <div className="form-group">
              <label className="form-label">Fotos/Videos extra (galería)</label>
              <div className="upload-area-sm" onClick={() => extrasRef.current.click()}>
                <span>📎 Agregar fotos o videos adicionales</span>
              </div>
              <input type="file" ref={extrasRef} accept="image/*,video/*" multiple onChange={handleExtrasChange} style={{ display: 'none' }} />
              {extraPreviews.length > 0 && (
                <div className="extras-preview">
                  {extraPreviews.map((p, i) => (
                    p.type.startsWith('video') ?
                      <video key={i} src={p.url} className="extra-thumb" /> :
                      <img key={i} src={p.url} alt="" className="extra-thumb" />
                  ))}
                </div>
              )}
            </div>

            {uploading && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
                <span>{progress}%</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
              {submitting ? 'Guardando...' : editId ? '💾 Actualizar' : '🚀 Publicar noticia'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? <div className="loading-spinner" /> : (
        <div className="noticias-list">
          {noticias.length === 0 ? (
            <div className="empty-admin">No hay noticias publicadas.</div>
          ) : noticias.map(n => (
            <div key={n.id} className="noticia-admin-item">
              {n.imageUrl && <img src={n.imageUrl} alt={n.titulo} className="noticia-admin-thumb" />}
              <div className="noticia-admin-info">
                <div className="noticia-admin-header">
                  <span className="tag tag-accent">{n.categoria}</span>
                  <span className="noticia-admin-date">
                    {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: es }) : ''}
                  </span>
                </div>
                <h3 className="noticia-admin-title">{n.titulo}</h3>
                {n.resumen && <p className="noticia-admin-excerpt">{n.resumen}</p>}
              </div>
              <div className="noticia-admin-actions">
                <button className="btn btn-ghost action-btn" onClick={() => handleEdit(n)}>✏️ Editar</button>
                <button className="btn btn-ghost action-btn delete" onClick={() => handleDelete(n)}>🗑️ Borrar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-section { display: flex; flex-direction: column; gap: 24px; }
        .admin-section-header { display: flex; align-items: center; justify-content: space-between; }
        .section-count { color: var(--text3); font-size: 0.88rem; }
        .admin-form-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
        }
        .form-card-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
        .admin-form { display: flex; flex-direction: column; gap: 18px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 200px; gap: 16px; }
        .upload-area {
          border: 2px dashed var(--border2);
          border-radius: var(--radius);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--transition);
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upload-area:hover { border-color: var(--accent); }
        .upload-preview { width: 100%; max-height: 280px; object-fit: contain; }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text3);
          font-size: 0.9rem;
          padding: 24px;
        }
        .upload-placeholder span:first-child { font-size: 2rem; }
        .upload-hint { font-size: 0.75rem; color: var(--text3); }
        .upload-area-sm {
          border: 1.5px dashed var(--border2);
          border-radius: var(--radius);
          padding: 14px 20px;
          cursor: pointer;
          color: var(--text3);
          font-size: 0.88rem;
          text-align: center;
          transition: border-color var(--transition);
        }
        .upload-area-sm:hover { border-color: var(--accent); color: var(--text2); }
        .extras-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .extra-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
        .clear-btn { margin-top: 8px; font-size: 0.8rem; padding: 4px 12px; }
        .progress-bar {
          background: var(--bg3);
          border-radius: var(--radius-full);
          height: 8px;
          position: relative;
          overflow: hidden;
        }
        .progress-fill {
          background: var(--accent);
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.3s;
        }
        .progress-bar span {
          position: absolute;
          right: 0; top: -20px;
          font-size: 0.75rem;
          color: var(--text3);
        }
        .submit-btn { justify-content: center; padding: 14px; }

        /* List */
        .noticias-list { display: flex; flex-direction: column; gap: 12px; }
        .noticia-admin-item {
          display: flex;
          gap: 16px;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          transition: border-color var(--transition);
        }
        .noticia-admin-item:hover { border-color: var(--border2); }
        .noticia-admin-thumb {
          width: 80px; height: 60px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .noticia-admin-info { flex: 1; min-width: 0; }
        .noticia-admin-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .noticia-admin-date { font-size: 0.75rem; color: var(--text3); }
        .noticia-admin-title { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .noticia-admin-excerpt { font-size: 0.82rem; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .noticia-admin-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .action-btn { font-size: 0.8rem; padding: 6px 12px; }
        .action-btn.delete { color: var(--accent); }
        .action-btn.delete:hover { background: var(--accent-dim); }
        .empty-admin { text-align: center; color: var(--text3); padding: 40px; }

        @media (max-width: 600px) {
          .form-row-2 { grid-template-columns: 1fr; }
          .noticia-admin-item { flex-wrap: wrap; }
          .noticia-admin-actions { width: 100%; }
        }
      `}</style>
    </div>
  );
}