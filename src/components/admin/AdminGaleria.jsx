// src/components/admin/AdminGaleria.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import toast from 'react-hot-toast';

export default function AdminGaleria() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progresses, setProgresses] = useState([]);
  const fileRef = useRef();

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const snap = await getDocs(query(collection(db, 'galeria'), orderBy('createdAt', 'desc')));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type, name: f.name })));
    setProgresses(selected.map(() => 0));
  }

  async function handleUpload() {
    if (files.length === 0) { toast.error('Selecciona archivos primero'); return; }
    setUploading(true);
    try {
      await Promise.all(files.map((file, i) => new Promise((resolve, reject) => {
        const tipo = file.type.startsWith('video') ? 'video' : 'foto';
        const storageRef = ref(storage, `galeria/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        task.on('state_changed',
          snap => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setProgresses(prev => { const next = [...prev]; next[i] = pct; return next; });
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            await addDoc(collection(db, 'galeria'), { url, tipo, titulo: titulo || file.name, createdAt: serverTimestamp() });
            resolve();
          }
        );
      })));
      toast.success(`${files.length} archivo(s) subidos 🎉`);
      setFiles([]); setPreviews([]); setTitulo(''); setProgresses([]);
      fetchItems();
    } catch (e) {
      console.error(e);
      toast.error('Error al subir archivos');
    } finally { setUploading(false); }
  }

  async function handleDelete(item) {
    if (!window.confirm('¿Eliminar este archivo de la galería?')) return;
    try {
      await deleteDoc(doc(db, 'galeria', item.id));
      try { await deleteObject(ref(storage, item.url)); } catch (_) {}
      toast.success('Eliminado');
      fetchItems();
    } catch (e) { toast.error('Error al eliminar'); }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <p className="section-count">{items.length} archivo(s) en galería</p>
      </div>

      {/* Upload */}
      <div className="admin-form-card">
        <h3 className="form-card-title">📤 Subir fotos/videos</h3>
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          {previews.length === 0 ? (
            <div className="upload-placeholder">
              <span style={{ fontSize: '3rem' }}>📁</span>
              <span>Haz clic o arrastra archivos aquí</span>
              <span className="upload-hint">Fotos y videos desde tu celular o computador</span>
            </div>
          ) : (
            <div className="upload-previews-grid">
              {previews.map((p, i) => (
                <div key={i} className="upload-preview-item">
                  {p.type.startsWith('video') ? (
                    <video src={p.url} className="up-thumb" />
                  ) : (
                    <img src={p.url} alt="" className="up-thumb" />
                  )}
                  {uploading && (
                    <div className="up-progress">
                      <div className="up-progress-fill" style={{ width: `${progresses[i] || 0}%` }} />
                    </div>
                  )}
                  <span className="up-name">{p.name.substring(0, 20)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="file" ref={fileRef} accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: 'none' }} />

        {files.length > 0 && (
          <div className="upload-controls">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Título (opcional, se aplica a todos)</label>
              <input className="form-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Salida del viernes" />
            </div>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? `Subiendo...` : `📤 Subir ${files.length} archivo(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Lista */}
      {loading ? <div className="loading-spinner" /> : (
        <div className="galeria-admin-grid">
          {items.length === 0 ? (
            <div className="empty-admin">No hay archivos en la galería.</div>
          ) : items.map(item => (
            <div key={item.id} className="galeria-admin-item">
              {item.tipo === 'video' ? (
                <video src={item.url} className="galeria-admin-media" />
              ) : (
                <img src={item.url} alt={item.titulo} className="galeria-admin-media" loading="lazy" />
              )}
              <div className="galeria-admin-overlay">
                <span className="galeria-admin-name">{item.titulo}</span>
                <button className="delete-fab" onClick={() => handleDelete(item)}>🗑️</button>
              </div>
              <div className="galeria-admin-type">
                {item.tipo === 'video' ? '🎬' : '📸'}
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

        .upload-zone {
          border: 2px dashed var(--border2);
          border-radius: var(--radius-lg);
          min-height: 180px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color var(--transition);
          overflow: hidden;
          padding: 16px;
        }
        .upload-zone:hover { border-color: var(--teal); }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text3);
          text-align: center;
        }
        .upload-hint { font-size: 0.78rem; }
        .upload-previews-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .upload-preview-item {
          width: 100px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }
        .up-thumb { width: 100px; height: 80px; object-fit: cover; border-radius: 8px; }
        .up-progress {
          height: 4px;
          width: 100%;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .up-progress-fill { height: 100%; background: var(--teal); transition: width 0.3s; }
        .up-name { font-size: 0.7rem; color: var(--text3); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

        .upload-controls {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        /* Galeria grid admin */
        .galeria-admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        .galeria-admin-item {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 1;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .galeria-admin-media { width: 100%; height: 100%; object-fit: cover; display: block; }
        .galeria-admin-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          opacity: 0;
          transition: opacity var(--transition);
        }
        .galeria-admin-item:hover .galeria-admin-overlay { opacity: 1; }
        .galeria-admin-name { font-size: 0.72rem; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .delete-fab {
          background: rgba(255,77,109,0.8);
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .galeria-admin-type {
          position: absolute;
          top: 8px; right: 8px;
          font-size: 0.85rem;
          background: rgba(0,0,0,0.6);
          border-radius: 6px;
          padding: 2px 6px;
        }
        .empty-admin { text-align: center; color: var(--text3); padding: 40px; grid-column: 1/-1; }
      `}</style>
    </div>
  );
}