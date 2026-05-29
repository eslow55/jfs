import React, { useState, useEffect } from 'react';
import { db, storage } from "@/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Newspaper, MessageSquare, Image, Plus, Trash2, FileVideo, LogOut, AlertTriangle, UploadCloud } from 'lucide-react';

export default function Admin() {
  const { logout } = useAuth();
  const [pestaña, setPestaña] = useState('noticias'); // 'noticias', 'chismes' o 'galeria'

  // Estados para Noticias
  const [noticias, setNoticias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivoNoticia, setArchivoNoticia] = useState(null);
  const [previewNoticia, setPreviewNoticia] = useState(null);
  const [cargandoNoticia, setCargandoNoticia] = useState(false);

  // Estados para Chismes
  const [chismes, setChismes] = useState([]);

  // Estados para Galería
  const [medios, setMedios] = useState([]);
  const [archivoGaleria, setArchivoGaleria] = useState(null);
  const [previewGaleria, setPreviewGaleria] = useState(null);
  const [cargandoGaleria, setCargandoGaleria] = useState(false);

  // Cargar datos en tiempo real de las 3 colecciones
  useEffect(() => {
    const qNoticias = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
    const unsubNoticias = onSnapshot(qNoticias, (snapshot) => {
      setNoticias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qChismes = query(collection(db, 'chismes'), orderBy('fecha', 'desc'));
    const unsubChismes = onSnapshot(qChismes, (snapshot) => {
      setChismes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qGaleria = query(collection(db, 'galeria'), orderBy('fecha', 'desc'));
    const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
      setMedios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubNoticias();
      unsubChismes();
      unsubGaleria();
    };
  }, []);

  // Controladores de archivos
  const handleFileNoticia = (e) => {
    const file = e.target.files[0];
    if (file) { setArchivoNoticia(file); setPreviewNoticia(URL.createObjectURL(file)); }
  };

  const handleFileGaleria = (e) => {
    const file = e.target.files[0];
    if (file) { setArchivoGaleria(file); setPreviewGaleria(URL.createObjectURL(file)); }
  };

  // Guardar Noticia Nueva
  const handlePublishNoticia = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;
    setCargandoNoticia(true);
    let urlMedia = '';
    let tipoMedia = null;

    try {
      if (archivoNoticia) {
        const nameUnico = `${Date.now()}_${archivoNoticia.name}`;
        const storageRef = ref(storage, `noticias/${nameUnico}`);
        const snapshot = await uploadBytes(storageRef, archivoNoticia);
        urlMedia = await getDownloadURL(snapshot.ref);
        tipoMedia = archivoNoticia.type.split('/')[0];
      }
      await addDoc(collection(db, 'noticias'), {
        titulo, descripcion, multimedia: urlMedia, tipoMultimedia: tipoMedia, fecha: new Date().toISOString()
      });
      setTitulo(''); setDescripcion(''); setArchivoNoticia(null); setPreviewNoticia(null);
    } catch (error) { console.error(error); alert("Error al subir noticia."); }
    finally { setCargandoNoticia(false); }
  };

  // Guardar Archivo en Galería
  const handleUploadGaleria = async (e) => {
    e.preventDefault();
    if (!archivoGaleria) return;
    setCargandoGaleria(true);

    try {
      const nameUnico = `${Date.now()}_${archivoGaleria.name}`;
      const storageRef = ref(storage, `galeria/${nameUnico}`);
      const snapshot = await uploadBytes(storageRef, archivoGaleria);
      const urlMedia = await getDownloadURL(snapshot.ref);
      const tipoMedia = archivoGaleria.type.split('/')[0];

      await addDoc(collection(db, 'galeria'), {
        url: urlMedia,
        tipo: tipoMedia,
        nombreOriginal: archivoGaleria.name,
        fecha: new Date().toISOString()
      });

      setArchivoGaleria(null);
      setPreviewGaleria(null);
    } catch (error) {
      console.error(error);
      alert("Error al subir archivo a la galería.");
    } finally {
      setCargandoGaleria(false);
    }
  };

  // Funciones de eliminación
  const handleDeleteNoticia = async (id) => { if (window.confirm("¿Borrar noticia?")) await deleteDoc(doc(db, 'noticias', id)); };
  const handleDeleteChisme = async (id) => { if (window.confirm("¿Borrar chisme?")) await deleteDoc(doc(db, 'chismes', id)); };
  const handleDeleteGaleria = async (id) => { if (window.confirm("¿Eliminar este archivo de la galería pública?")) await deleteDoc(doc(db, 'galeria', id)); };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Panel de <span style={{ color: 'var(--accent)' }}>Control</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gestión de contenidos de JFS Página</p>
        </div>
        <button onClick={logout} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#202024', color: '#ff4a4a', border: '1px solid #2c2c35', padding: '10px 18px', borderRadius: '30px' }}>
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #232329', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setPestaña('noticias')} style={{ width: 'auto', background: pestaña === 'noticias' ? 'rgba(0, 255, 135, 0.1)' : 'transparent', color: pestaña === 'noticias' ? 'var(--accent)' : 'var(--text-muted)', border: pestaña === 'noticias' ? '1px solid var(--accent)' : '1px solid transparent', padding: '10px 18px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <Newspaper size={15} /> Noticias
        </button>
        <button onClick={() => setPestaña('chismes')} style={{ width: 'auto', background: pestaña === 'chismes' ? 'rgba(0, 255, 135, 0.1)' : 'transparent', color: pestaña === 'chismes' ? 'var(--accent)' : 'var(--text-muted)', border: pestaña === 'chismes' ? '1px solid var(--accent)' : '1px solid transparent', padding: '10px 18px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <MessageSquare size={15} /> Chismes ({chismes.length})
        </button>
        <button onClick={() => setPestaña('galeria')} style={{ width: 'auto', background: pestaña === 'galeria' ? 'rgba(0, 255, 135, 0.1)' : 'transparent', color: pestaña === 'galeria' ? 'var(--accent)' : 'var(--text-muted)', border: pestaña === 'galeria' ? '1px solid var(--accent)' : '1px solid transparent', padding: '10px 18px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <Image size={15} /> Galería ({medios.length})
        </button>
      </div>

      {/* PESTAÑA: NOTICIAS */}
      {pestaña === 'noticias' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="admin-grid">
          <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}><Plus size={16} color="var(--accent)" /> Nueva Noticia</h3>
            <form onSubmit={handlePublishNoticia} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Título de la noticia..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              <textarea placeholder="Descripción..." rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
              {previewNoticia && <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>{archivoNoticia?.type.startsWith('video/') ? <video src={previewNoticia} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} muted /> : <img src={previewNoticia} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} />}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#202024', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: archivoNoticia ? 'var(--accent)' : '#a4a4a8' }}>
                  {archivoNoticia?.type.startsWith('video/') ? <FileVideo size={15} /> : <Image size={15} />}
                  <span>Adjuntar Archivo</span>
                  <input type="file" accept="image/*,video/*" onChange={handleFileNoticia} style={{ display: 'none' }} />
                </label>
                <button type="submit" disabled={setCargandoNoticia} style={{ width: 'auto' }}>{cargandoNoticia ? 'Publicando...' : 'Publicar'}</button>
              </div>
            </form>
          </div>
          <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Noticias Activas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {noticias.map(n => (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#0e0e11', borderRadius: '12px', border: '1px solid #1f1f24' }}>
                  <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{n.titulo}</span>
                  <button onClick={() => handleDeleteNoticia(n.id)} style={{ width: 'auto', background: 'transparent', color: '#ff4a4a' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: MODERAR CHISMES */}
      {pestaña === 'chismes' && (
        <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '25px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} color="#ffb84d" /> Muro de Moderación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chismes.map(c => (
              <div key={c.id} style={{ padding: '15px', background: '#0e0e11', borderRadius: '12px', border: '1px solid #1f1f24', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                <div><p style={{ fontSize: '14px', color: '#efeff1' }}>{c.contenido}</p></div>
                <button onClick={() => handleDeleteChisme(c.id)} style={{ width: 'auto', background: 'rgba(255, 74, 74, 0.1)', color: '#ff4a4a', padding: '6px' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: GESTIONAR GALERÍA */}
      {pestaña === 'galeria' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="admin-grid">
          <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}><UploadCloud size={16} color="var(--accent)" /> Cargar a la Galería</h3>
            <form onSubmit={handleUploadGaleria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', background: '#0e0e11', border: '2px dashed #232329', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
                <UploadCloud size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                <span style={{ fontSize: '14px', color: '#fff' }}>{archivoGaleria ? archivoGaleria.name : 'Selecciona foto o video'}</span>
                <input type="file" accept="image/*,video/*" onChange={handleFileGaleria} style={{ display: 'none' }} required />
              </label>

              {previewGaleria && <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>{archivoGaleria?.type.startsWith('video/') ? <video src={previewGaleria} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} muted /> : <img src={previewGaleria} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} />}</div>}
              
              <button type="submit" disabled={cargandoGaleria || !archivoGaleria}>
                {cargandoGaleria ? 'Subiendo Archivo...' : 'Subir a la Galería'}
              </button>
            </form>
          </div>

          <div style={{ background: '#16161a', border: '1px solid #232329', borderRadius: '16px', padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Medios en Galería</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
              {medios.map(m => (
                <div key={m.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#0e0e11', aspectRatio: '1/1', border: '1px solid #232329' }}>
                  {m.tipo === 'video' ? <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted /> : <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <button onClick={() => handleDeleteGaleria(m.id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,74,74,0.8)', padding: '4px', borderRadius: '50%', width: '24px', height: '24px' }}><Trash2 size={12} color="#fff" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@media (min-width: 850px) { .admin-grid { grid-template-columns: 1.2fr 1fr !important; } }`}</style>
    </div>
  );
}