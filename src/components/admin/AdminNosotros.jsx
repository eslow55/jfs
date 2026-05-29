// src/components/admin/AdminNosotros.jsx
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import toast from 'react-hot-toast';

const EMPTY_MEMBER = { nombre: '', apodo: '', descripcion: '', foto: '' };

export default function AdminNosotros() {
  const [info, setInfo] = useState({ descripcion: '', createdYear: '', miembros: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMember, setNewMember] = useState(EMPTY_MEMBER);
  const [memberPhotoFile, setMemberPhotoFile] = useState(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState('');
  const photoRef = useRef();

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, 'config', 'nosotros'));
        if (snap.exists()) setInfo(snap.data());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  async function handleSaveInfo() {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'nosotros'), info, { merge: true });
      toast.success('Información guardada ✅');
    } catch (e) { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  }

  async function handleAddMember() {
    if (!newMember.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      let fotoUrl = '';
      if (memberPhotoFile) {
        await new Promise((resolve, reject) => {
          const storageRef = ref(storage, `miembros/${Date.now()}_${memberPhotoFile.name}`);
          const task = uploadBytesResumable(storageRef, memberPhotoFile);
          task.on('state_changed', null, reject, async () => {
            fotoUrl = await getDownloadURL(task.snapshot.ref);
            resolve();
          });
        });
      }
      const miembro = { ...newMember, foto: fotoUrl };
      const updated = { ...info, miembros: [...(info.miembros || []), miembro] };
      setInfo(updated);
      await setDoc(doc(db, 'config', 'nosotros'), updated, { merge: true });
      setNewMember(EMPTY_MEMBER);
      setMemberPhotoFile(null);
      setMemberPhotoPreview('');
      toast.success('Miembro agregado 👥');
    } catch (e) { toast.error('Error'); }
    finally { setSaving(false); }
  }

  async function handleRemoveMember(i) {
    const updated = { ...info, miembros: info.miembros.filter((_, idx) => idx !== i) };
    setInfo(updated);
    await setDoc(doc(db, 'config', 'nosotros'), updated, { merge: true });
    toast.success('Miembro eliminado');
  }

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="admin-section">
      {/* Info general */}
      <div className="admin-form-card">
        <h3 className="form-card-title">📝 Información del grupo</h3>
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              value={info.descripcion || ''}
              onChange={e => setInfo({ ...info, descripcion: e.target.value })}
              placeholder="Cuéntanos sobre el grupo..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Año de fundación</label>
            <input
              className="form-input"
              value={info.createdYear || ''}
              onChange={e => setInfo({ ...info, createdYear: e.target.value })}
              placeholder="Ej: 2022"
            />
          </div>
          <button className="btn btn-primary" onClick={handleSaveInfo} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar información'}
          </button>
        </div>
      </div>

      {/* Miembros */}
      <div className="admin-form-card">
        <h3 className="form-card-title">👥 Miembros del grupo</h3>

        {/* Lista miembros */}
        {info.miembros && info.miembros.length > 0 && (
          <div className="members-list">
            {info.miembros.map((m, i) => (
              <div key={i} className="member-item">
                <div className="member-avatar">
                  {m.foto ? <img src={m.foto} alt={m.nombre} /> : <span>{m.nombre?.[0]}</span>}
                </div>
                <div className="member-info">
                  <strong>{m.nombre}</strong>
                  {m.apodo && <span className="member-apodo">"{m.apodo}"</span>}
                  {m.descripcion && <span className="member-desc">{m.descripcion}</span>}
                </div>
                <button className="btn btn-ghost delete-btn" onClick={() => handleRemoveMember(i)}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar miembro */}
        <div className="add-member-form">
          <h4 className="add-member-title">+ Agregar miembro</h4>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={newMember.nombre} onChange={e => setNewMember({ ...newMember, nombre: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="form-group">
              <label className="form-label">Apodo</label>
              <input className="form-input" value={newMember.apodo} onChange={e => setNewMember({ ...newMember, apodo: e.target.value })} placeholder="Ej: El Crack" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción corta</label>
            <input className="form-input" value={newMember.descripcion} onChange={e => setNewMember({ ...newMember, descripcion: e.target.value })} placeholder="Ej: El más chistoso del grupo" />
          </div>
          <div className="form-group">
            <label className="form-label">Foto (opcional)</label>
            <div className="member-upload" onClick={() => photoRef.current.click()}>
              {memberPhotoPreview ? (
                <img src={memberPhotoPreview} alt="Preview" className="member-photo-preview" />
              ) : (
                <span>📷 Subir foto</span>
              )}
            </div>
            <input type="file" ref={photoRef} accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files[0];
              if (f) { setMemberPhotoFile(f); setMemberPhotoPreview(URL.createObjectURL(f)); }
            }} />
          </div>
          <button className="btn btn-primary" onClick={handleAddMember} disabled={saving}>
            {saving ? 'Agregando...' : '+ Agregar miembro'}
          </button>
        </div>
      </div>

      <style>{`
        .admin-section { display: flex; flex-direction: column; gap: 24px; }
        .admin-form-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
        }
        .form-card-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
        .admin-form { display: flex; flex-direction: column; gap: 16px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .members-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .member-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 16px;
        }
        .member-avatar {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--purple));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          color: white;
          font-size: 1.2rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .member-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .member-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .member-info strong { font-family: var(--font-display); font-size: 0.95rem; }
        .member-apodo { color: var(--accent2); font-size: 0.82rem; font-style: italic; }
        .member-desc { color: var(--text3); font-size: 0.8rem; }
        .delete-btn { font-size: 0.8rem; padding: 5px 10px; color: var(--accent); }

        .add-member-form {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .add-member-title {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text2);
        }
        .member-upload {
          border: 2px dashed var(--border2);
          border-radius: var(--radius);
          padding: 16px;
          text-align: center;
          cursor: pointer;
          color: var(--text3);
          font-size: 0.88rem;
          transition: border-color var(--transition);
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .member-upload:hover { border-color: var(--accent); }
        .member-photo-preview { width: 80px; height: 80px; object-fit: cover; border-radius: 50%; }

        @media (max-width: 600px) {
          .form-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}