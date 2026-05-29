import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  deleteDoc, doc, serverTimestamp, updateDoc, increment,
  setDoc, getDoc 
} from 'firebase/firestore';
import { 
  Heart, Trash2, Send, Image as ImageIcon, 
  Loader2, User, MessageSquare, X 
} from 'lucide-react';
import { useTema } from "../contexts/TemaContext";

const themeStyles = {
  light: {
    bg: '#f8fafc', card: '#ffffff', text: '#111827', textMuted: '#6b7280', 
    border: '#e5e7eb', inputBg: '#f3f4f6', primary: '#3b82f6', danger: '#ef4444'
  },
  dark: {
    bg: '#000000', card: '#0a0a0a', text: '#ffffff', textMuted: '#a1a1aa', 
    border: '#262626', inputBg: '#171717', primary: '#3b82f6', danger: '#f43f5e'
  }
};

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// --- COMPONENTE DE COMENTARIOS ---
const CommentSection = ({ chismeId, theme }) => {
  const [comentarios, setComentarios] = useState([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'chismes', chismeId, 'comentarios'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [chismeId]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addDoc(collection(db, 'chismes', chismeId, 'comentarios'), {
      texto: input, autor: 'Anónimo', createdAt: serverTimestamp(), parentId: replyingTo
    });
    setInput(''); setReplyingTo(null);
  };

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        {comentarios.filter(c => !c.parentId).map(parent => (
          <div key={parent.id}>
            <div style={{ background: theme.inputBg, padding: '10px', borderRadius: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Anónimo: </span>
              <span style={{ fontSize: '0.9rem' }}>{parent.texto}</span>
              <button onClick={() => setReplyingTo(parent.id)} style={{ display: 'block', fontSize: '0.7rem', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginTop: '4px' }}>Responder</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleEnviar} style={{ display: 'flex', gap: '8px' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Comentar..." style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text }} />
        <button type="submit" style={{ background: theme.primary, border: 'none', color: '#fff', borderRadius: '8px', padding: '0 15px' }}><Send size={16} /></button>
      </form>
    </div>
  );
};

export default function Chismes() {
  const { tema } = useTema();
  const t = themeStyles[tema === 'dark' ? 'dark' : 'light'];
  
  const [chismes, setChismes] = useState([]);
  const [likes, setLikes] = useState({});
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const myUserId = useMemo(() => {
    let id = localStorage.getItem('user_id');
    if (!id) { id = 'u_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('user_id', id); }
    return id;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'chismes'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChismes(data);
      setLoading(false);
    });
  }, []);

  const handleEliminar = async (chismeId) => {
    if (window.confirm("¿Seguro que quieres borrar este chisme?")) {
      await deleteDoc(doc(db, 'chismes', chismeId));
    }
  };

  const handleLike = async (chismeId, isLiked) => {
    const likeRef = doc(db, 'chismes', chismeId, 'likes', myUserId);
    const chismeRef = doc(db, 'chismes', chismeId);
    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(chismeRef, { likes: increment(-1) });
      setLikes(prev => ({ ...prev, [chismeId]: false }));
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(chismeRef, { likes: increment(1) });
      setLikes(prev => ({ ...prev, [chismeId]: true }));
    }
  };

  const handlePublicar = async () => {
    if (!texto.trim() && !archivo) return;
    setCargando(true);
    try {
      let url = '';
      if (archivo) {
        const formData = new FormData();
        formData.append("file", archivo);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const data = await res.json();
        url = data.secure_url;
      }
      await addDoc(collection(db, 'chismes'), {
        contenido: texto,
        multimedia: url,
        createdAt: serverTimestamp(),
        likes: 0,
        creatorId: myUserId // Guardamos el ID para verificar el borrado
      });
      setTexto(''); setArchivo(null);
    } catch (e) { alert("Error al subir"); } finally { setCargando(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Chismes</h1>
        </header>

        <div style={{ background: t.card, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${t.border}`, marginBottom: '2rem' }}>
          <textarea 
            value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Qué está pasando?"
            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', color: t.text, outline: 'none', resize: 'none' }}
          />
          {archivo && (
            <div style={{ position: 'relative', margin: '10px 0' }}>
              <img src={URL.createObjectURL(archivo)} style={{ width: '100%', borderRadius: '12px' }} alt="prev" />
              <button onClick={() => setArchivo(null)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', cursor: 'pointer' }}><X size={16} /></button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer', color: t.textMuted }}><ImageIcon size={20} /><input type="file" onChange={(e) => setArchivo(e.target.files[0])} style={{ display: 'none' }} /></label>
            <button onClick={handlePublicar} disabled={cargando} style={{ padding: '8px 20px', background: t.primary, border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
              {cargando ? <Loader2 className="animate-spin" /> : 'Publicar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {chismes.map(chisme => (
            <div key={chisme.id} style={{ background: t.card, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${t.border}` }}>
              <p style={{ margin: '0 0 1rem 0', lineHeight: 1.5 }}>{chisme.contenido}</p>
              {chisme.multimedia && <img src={chisme.multimedia} style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} alt="post" />}
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button onClick={() => handleLike(chisme.id, likes[chisme.id])} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', color: likes[chisme.id] ? t.danger : t.textMuted, cursor: 'pointer' }}><Heart size={18} fill={likes[chisme.id] ? t.danger : 'none'} /> {chisme.likes || 0}</button>
                    <MessageSquare size={18} color={t.textMuted} />
                </div>
                
                {/* BOTÓN ELIMINAR: Solo se muestra si el usuario es el creador */}
                {chisme.creatorId === myUserId && (
                    <button onClick={() => handleEliminar(chisme.id)} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer' }}>
                        <Trash2 size={18} />
                    </button>
                )}
              </div>
              <CommentSection chismeId={chisme.id} theme={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}