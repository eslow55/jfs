import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  deleteDoc, doc, serverTimestamp, updateDoc, increment,
  setDoc, getDocs
} from 'firebase/firestore';
import { 
  Heart, Trash2, Send, Image as ImageIcon, 
  Loader2, MessageSquare, X, MessageCircle 
} from 'lucide-react';
import { useTema } from "../contexts/TemaContext";

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// --- COMPONENTE DE COMENTARIOS (HILO DE DISCUSIÓN) ---
const SeccionComentarios = ({ publicacionId, myUserId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hoverEliminar, setHoverEliminar] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, 'foro', publicacionId, 'comentarios'), 
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [publicacionId]);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!input.trim() || enviando) return;
    
    setEnviando(true);
    try {
      await addDoc(collection(db, 'foro', publicacionId, 'comentarios'), {
        texto: input.trim(),
        autor: 'Miembro de la Comunidad',
        creatorId: myUserId,
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      console.error("Error al añadir comentario:", err);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarComentario = async (comentarioId) => {
    if (window.confirm("¿Deseas eliminar este comentario permanentemente?")) {
      await deleteDoc(doc(db, 'foro', publicacionId, 'comentarios', comentarioId));
    }
  };

  return (
    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
      {/* Lista de respuestas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {comentarios.map(comentario => (
          <div 
            key={comentario.id} 
            style={{ 
              background: 'var(--bg-primary)', 
              padding: '12px 14px', 
              borderRadius: '12px',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              position: 'relative',
              zIndex: 10
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)', marginBottom: '4px' }}>
                {comentario.autor}
              </div>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-main)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                {comentario.texto}
              </p>
            </div>

            {comentario.creatorId === myUserId && (
              <button 
                onClick={() => handleEliminarComentario(comentario.id)}
                onMouseEnter={() => setHoverEliminar(prev => ({ ...prev, [comentario.id]: true }))}
                onMouseLeave={() => setHoverEliminar(prev => ({ ...prev, [comentario.id]: false }))}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--danger)', 
                  cursor: 'pointer', 
                  padding: '2px', 
                  display: 'flex', 
                  opacity: hoverEliminar[comentario.id] ? 1 : 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleEnviarComentario} style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 10 }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Escribe una respuesta comunitaria..." 
          style={{ 
            flex: 1, padding: '10px 14px', borderRadius: '10px', 
            border: '1px solid var(--border)', background: 'var(--bg-primary)', 
            color: 'var(--text-main)', fontSize: '13.5px', outline: 'none' 
          }} 
        />
        <button 
          type="submit" 
          disabled={!input.trim() || enviando}
          style={{ 
            background: 'var(--accent)', border: 'none', color: '#fff', 
            borderRadius: '10px', padding: '0 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: (!input.trim() || enviando) ? 0.5 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {enviando ? (
            <Loader2 size={15} className="spinner" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DEL FORO ---
export default function Foro() {
  const { tema } = useTema();
  
  const [publicaciones, setPublicaciones] = useState([]);
  const [misReacciones, setMisReacciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [hilosAbiertos, setHilosAbiertos] = useState({});

  // Estados de control para hovers dinámicos inline
  const [hoverImagen, setHoverImagen] = useState(false);
  const [hoverEliminarPost, setHoverEliminarPost] = useState({});
  const [hoverReaccion, setHoverReaccion] = useState({});
  const [hoverRespuestas, setHoverRespuestas] = useState({});

  // Generación y persistencia de ID único de usuario
  const myUserId = useMemo(() => {
    let id = localStorage.getItem('forum_user_id');
    if (!id) { 
      id = 'usr_' + Math.random().toString(36).substring(2, 11); 
      localStorage.setItem('forum_user_id', id); 
    }
    return id;
  }, []);

  // Escucha activa en tiempo real de Firestore
  useEffect(() => {
    const q = query(collection(db, 'foro'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const listaDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublicaciones(listaDocs);
      
      const mapaReacciones = {};
      for (let post of listaDocs) {
        const queryReaccion = await getDocs(collection(db, 'foro', post.id, 'likes'));
        const yaReacciono = queryReaccion.docs.some(doc => doc.id === myUserId);
        mapaReacciones[post.id] = yaReacciono;
      }
      setMisReacciones(mapaReacciones);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myUserId]);

  const handleEliminarPublicacion = async (pubId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este hilo de discusión?")) {
      await deleteDoc(doc(db, 'foro', pubId));
    }
  };

  const handleVotarPublicacion = async (pubId) => {
    const haVotado = misReacciones[pubId];
    const reaccionRef = doc(db, 'foro', pubId, 'likes', myUserId);
    const postRef = doc(db, 'foro', pubId);

    try {
      if (haVotado) {
        await deleteDoc(reaccionRef);
        await updateDoc(postRef, { likes: increment(-1) });
        setMisReacciones(prev => ({ ...prev, [pubId]: false }));
      } else {
        await setDoc(reaccionRef, { createdAt: serverTimestamp() });
        await updateDoc(postRef, { likes: increment(1) });
        setMisReacciones(prev => ({ ...prev, [pubId]: true }));
      }
    } catch (err) {
      console.error("Error al procesar voto:", err);
    }
  };

  const handlePublicarHilo = async () => {
    if (!texto.trim() && !archivo) return;
    setCargandoEnvio(true);
    
    try {
      let urlMultimedia = '';
      if (archivo) {
        const formData = new FormData();
        formData.append("file", archivo);
        formData.append("upload_preset", UPLOAD_PRESET);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { 
          method: "POST", 
          body: formData 
        });
        const data = await res.json();
        urlMultimedia = data.secure_url;
      }

      await addDoc(collection(db, 'foro'), {
        contenido: texto.trim(),
        multimedia: urlMultimedia,
        createdAt: serverTimestamp(),
        likes: 0,
        creatorId: myUserId
      });

      setTexto('');
      setArchivo(null);
    } catch (e) {
      alert("Error al subir el archivo al almacenamiento.");
    } finally {
      setCargandoEnvio(false);
    }
  };

  const toggleHiloComentarios = (pubId) => {
    setHilosAbiertos(prev => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  // --- ESTRUCTURA DE ESTILOS INLINE NATIVOS ---
  const contenedorPrincipalEstilos = {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-main)',
    padding: '40px 16px',
    boxSizing: 'border-box',
    position: 'relative',
    overflowX: 'hidden'
  };

  // CAPA DE LOGOS DE FONDO (Igual a la del Login)
  const capaLogosFondoEstilos = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('/logo-pattern.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: '180px',
    opacity: 0.03,
    pointerEvents: 'none',
    zIndex: 1
  };

  const tarjetaEstilos = {
    background: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
    position: 'relative',
    zIndex: 10
  };

  return (
    <div style={contenedorPrincipalEstilos}>
      {/* Capa inferior con el patrón repetitivo de logos */}
      <div style={capaLogosFondoEstilos} />

      <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* --- ENCABEZADO --- */}
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>
            Foro de la <span style={{ color: 'var(--accent)' }}>Comunidad</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', margin: 0 }}>
            Espacio abierto de debate, ideas y consultas técnicas.
          </p>
        </header>

        {/* --- EDITOR DE PUBLICACIONES --- */}
        <div style={{ ...tarjetaEstilos, marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <textarea 
            value={texto} 
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Abre un nuevo tema de discusión con la comunidad..."
            style={{ 
              width: '100%', minHeight: '90px', border: 'none', background: 'transparent', 
              color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '15px',
              lineHeight: '1.5', fontFamily: 'inherit', boxSizing: 'border-box'
            }}
          />
          
          {archivo && (
            <div style={{ position: 'relative', margin: '14px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={URL.createObjectURL(archivo)} style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }} alt="Preview multimedia" />
              <button 
                onClick={() => setArchivo(null)} 
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <label 
              onMouseEnter={() => setHoverImagen(true)}
              onMouseLeave={() => setHoverImagen(false)}
              style={{ 
                cursor: 'pointer', 
                color: hoverImagen ? 'var(--text-main)' : 'var(--text-muted)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
            >
              <ImageIcon size={18} />
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Añadir imagen</span>
              <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} style={{ display: 'none' }} />
            </label>
            
            <button 
              onClick={handlePublicarHilo} 
              disabled={cargandoEnvio || (!texto.trim() && !archivo)} 
              style={{ 
                padding: '10px 22px', background: 'var(--accent)', border: 'none', 
                color: '#fff', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', 
                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', 
                transition: 'opacity 0.2s',
                opacity: (cargandoEnvio || (!texto.trim() && !archivo)) ? 0.5 : 1
              }}
            >
              {cargandoEnvio ? <Loader2 size={16} className="spinner" /> : 'Publicar Hilo'}
            </button>
          </div>
        </div>

        {/* --- LISTADO DE DISCUSIONES (FEED) --- */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="spinner" style={{ marginBottom: '12px', color: 'var(--accent)' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Sincronizando hilos de discusión...</p>
          </div>
        ) : publicaciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <MessageCircle size={36} style={{ marginBottom: '12px', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Aún no hay discusiones abiertas. ¡Sé el primero en iniciar una!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {publicaciones.map(chisme => {
              const tieneMiLike = misReacciones[chisme.id];
              return (
                <div key={chisme.id} style={tarjetaEstilos}>
                  <p style={{ margin: '0 0 14px 0', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                    {chisme.contenido}
                  </p>
                  
                  {chisme.multimedia && (
                    <div style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', border: '1px solid var(--border)' }}>
                      <img src={chisme.multimedia} style={{ width: '100%', display: 'block', maxHeight: '360px', objectFit: 'cover' }} alt="Post adjunto" />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      
                      {/* BOTÓN REACCIÓN (VOTAR) */}
                      <button 
                        onClick={() => handleVotarPublicacion(chisme.id)}
                        onMouseEnter={() => setHoverReaccion(prev => ({ ...prev, [chisme.id]: true }))}
                        onMouseLeave={() => setHoverReaccion(prev => ({ ...prev, [chisme.id]: false }))}
                        style={{ 
                          background: 'none', border: 'none', display: 'flex', alignItems: 'center', 
                          gap: '6px', 
                          color: tieneMiLike ? 'var(--danger)' : (hoverReaccion[chisme.id] ? 'var(--danger)' : 'var(--text-muted)'), 
                          cursor: 'pointer', padding: '6px 0', fontSize: '14px', fontWeight: '500',
                          transition: 'color 0.2s'
                        }}
                      >
                        <Heart size={17} fill={tieneMiLike ? 'var(--danger)' : 'none'} style={{ transition: 'transform 0.2s' }} /> 
                        <span>{chisme.likes || 0}</span>
                      </button>
                      
                      {/* BOTÓN DESPLEGAR RESPUESTAS */}
                      <button 
                        onClick={() => toggleHiloComentarios(chisme.id)}
                        onMouseEnter={() => setHoverRespuestas(prev => ({ ...prev, [chisme.id]: true }))}
                        onMouseLeave={() => setHoverRespuestas(prev => ({ ...prev, [chisme.id]: false }))}
                        style={{ 
                          background: 'none', border: 'none', display: 'flex', alignItems: 'center', 
                          gap: '6px', 
                          color: hilosAbiertos[chisme.id] ? 'var(--accent)' : (hoverRespuestas[chisme.id] ? 'var(--text-main)' : 'var(--text-muted)'), 
                          cursor: 'pointer', padding: '6px 0', fontSize: '14px', fontWeight: '500',
                          transition: 'color 0.2s'
                        }}
                      >
                        <MessageSquare size={17} />
                        <span>{hilosAbiertos[chisme.id] ? 'Ocultar debate' : 'Ver respuestas'}</span>
                      </button>
                    </div>
                    
                    {/* ACCIÓN DE ELIMINACIÓN PROPIA */}
                    {chisme.creatorId === myUserId && (
                      <button 
                        onClick={() => handleEliminarPublicacion(chisme.id)}
                        onMouseEnter={() => setHoverEliminarPost(prev => ({ ...prev, [chisme.id]: true }))}
                        onMouseLeave={() => setHoverEliminarPost(prev => ({ ...prev, [chisme.id]: false }))}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: hoverEliminarPost[chisme.id] ? 'var(--danger)' : 'var(--text-muted)', 
                          cursor: 'pointer', 
                          padding: '6px', 
                          display: 'flex',
                          transition: 'color 0.2s'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Renderizado condicional de la caja de discusión interna */}
                  {hilosAbiertos[chisme.id] && (
                    <SeccionComentarios publicacionId={chisme.id} myUserId={myUserId} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- REGLAS DE ANIMACIÓN NATIVAS --- */}
      <style>{`
        .spinner {
          animation: forum-spin 1s linear infinite;
        }
        @keyframes forum-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}