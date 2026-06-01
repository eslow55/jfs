import React, { useState, useEffect, useRef } from 'react';
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { PlusCircle, Trash2, Calendar, Eye, Loader2, CheckCircle, Star, Film, Image as ImageIcon, Upload, Link2, AlertCircle } from 'lucide-react';

// CONFIGURACIÓN DE CLOUDINARY
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "TU_CLOUD_NAME"; 
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "TU_UPLOAD_PRESET"; 

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados del Formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState(''); 
  const [destacada, setDestacada] = useState(false);

  // Estados para la subida local
  const [tipoMetodo, setTipoMetodo] = useState('local'); 
  const [archivoLocal, setArchivoLocal] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const fileInputRef = useRef(null);

  const esVideo = (url) => {
    if (!url) return false;
    const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const esUrlVideoDirecto = extensionesVideo.some(ext => url.toLowerCase().includes(ext));
    const esYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    return esUrlVideoDirecto || esYoutube;
  };

  const obtenerEmbedYoutube = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split(/[&#]/)[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // SOLUCIÓN AL HOME: Sincronización en tiempo real usando onSnapshot en el Admin también
  useEffect(() => {
    const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNoticias(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar noticias en tiempo real:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const subirACloudinary = async (file) => {
    const esVideoArchivo = file.type.startsWith('video/');
    const resourceType = esVideoArchivo ? 'video' : 'image';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );

    if (!respuesta.ok) throw new Error("Error en el servidor de Cloudinary");
    const data = await respuesta.json();
    return data.secure_url; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return alert("Por favor llena los campos requeridos");

    setSubmitting(true);
    setSuccess(false);

    try {
      let urlFinalMultimedia = imagenUrl.trim();

      if (tipoMetodo === 'local' && archivoLocal) {
        setSubiendoArchivo(true);
        urlFinalMultimedia = await subirACloudinary(archivoLocal);
        setSubiendoArchivo(false);
      }

      if (destacada) {
        const batch = writeBatch(db);
        noticias.forEach((noticia) => {
          if (noticia.destacada) {
            const docRef = doc(db, 'noticias', noticia.id);
            batch.update(docRef, { destacada: false });
          }
        });
        await batch.commit();
      }

      await addDoc(collection(db, 'noticias'), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen: urlFinalMultimedia || '',
        views: 0,
        destacada: destacada,
        fecha: serverTimestamp()
      });

      // Resetear estados
      setTitulo('');
      setDescripcion('');
      setImagenUrl('');
      setArchivoLocal(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setDestacada(false);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error al publicar la noticia:", error);
      alert("Hubo un problema al subir el archivo o conectar con la base de datos.");
    } finally {
      setSubmitting(false);
      setSubiendoArchivo(false);
    }
  };

  const toggleDestacadoExistente = async (id, estadoActual) => {
    try {
      if (!estadoActual) {
        const batch = writeBatch(db);
        noticias.forEach((noticia) => {
          if (noticia.destacada) {
            batch.update(doc(db, 'noticias', noticia.id), { destacada: false });
          }
        });
        batch.update(doc(db, 'noticias', id), { destacada: true });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'noticias', id), { destacada: false });
      }
    } catch (error) {
      console.error("Error cambiando el destacado:", error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta noticia definitivamente? Esta acción no se puede deshacer.")) return;
    try {
      await deleteDoc(doc(db, 'noticias', id));
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };

  const obtenerPreviewLocal = () => {
    if (archivoLocal) return URL.createObjectURL(archivoLocal);
    return imagenUrl;
  };

  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-primary, #ffffff)',
    border: '1px solid var(--border, #d1d5db)',
    borderRadius: '8px',
    color: 'var(--text-main, #1f2937)',
    fontSize: '14.5px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const labelStyles = {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted, #4b5563)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '40px 24px', color: 'var(--text-main, #111827)', minHeight: '90vh', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }} className="admin-noticias-container">
      
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '24px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', margin: 0, color: 'var(--text-main, #111827)' }}>
          Consola de <span style={{ color: 'var(--accent, #10b981)' }}>Noticias & Prensa</span>
        </h1>
        <p style={{ color: 'var(--text-muted, #6b7280)', margin: '8px 0 0 0', fontSize: '15px' }}>
          Gestiona, redacta y publica artículos o contenido multimedia directamente al inicio.
        </p>
      </div>

      {/* DASHBOARD GRID RESPONSIVE */}
      <div className="noticias-dashboard-grid">
        
        {/* ================= FORMULARIO DE CREACIÓN ================= */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border, #e5e7eb)', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '16px' }}>
            <PlusCircle size={22} style={{ color: 'var(--accent, #10b981)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Redactar Nueva Noticia</h2>
          </div>

          {success && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} /> Noticia indexada y publicada exitosamente.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyles}>Título del Artículo <span style={{color: '#ef4444'}}>*</span></label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ej: Tráiler oficial de la nueva temporada" style={inputStyles} />
          </div>

          {/* SELECTOR DE MÉTODO MULTIMEDIA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyles}>Origen Multimedia</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-primary, #f3f4f6)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border, #e5e7eb)' }}>
              <button type="button" onClick={() => { setTipoMetodo('local'); setImagenUrl(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: tipoMetodo === 'local' ? 'var(--accent, #10b981)' : 'transparent', color: tipoMetodo === 'local' ? '#fff' : 'var(--text-muted, #4b5563)', boxShadow: tipoMetodo === 'local' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
                <Upload size={16} /> Subir archivo
              </button>
              <button type="button" onClick={() => { setTipoMetodo('link'); setArchivoLocal(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: tipoMetodo === 'link' ? 'var(--accent, #10b981)' : 'transparent', color: tipoMetodo === 'link' ? '#fff' : 'var(--text-muted, #4b5563)', boxShadow: tipoMetodo === 'link' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
                <Link2 size={16} /> Pegar enlace
              </button>
            </div>
          </div>

          {/* INPUT DEPENDIENDO DEL MÉTODO */}
          {tipoMetodo === 'local' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyles}>Selecciona Imagen o Video</label>
              <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={(e) => setArchivoLocal(e.target.files[0] || null)} style={{ display: 'none' }} />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '100%', padding: '24px 16px', background: 'var(--bg-secondary, #ffffff)', 
                  border: `2px dashed ${archivoLocal ? 'var(--accent, #10b981)' : 'var(--border, #d1d5db)'}`, 
                  borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center', boxSizing: 'border-box'
                }}
                className="dropzone-area"
              >
                <div style={{ background: archivoLocal ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary, #f3f4f6)', padding: '12px', borderRadius: '50%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {archivoLocal ? (
                    esVideo(archivoLocal.name) ? <Film size={22} style={{ color: 'var(--accent, #10b981)' }} /> : <ImageIcon size={22} style={{ color: 'var(--accent, #10b981)' }} />
                  ) : (
                    <Upload size={22} style={{ color: 'var(--text-muted, #9ca3af)' }} />
                  )}
                </div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: archivoLocal ? 'var(--accent, #10b981)' : 'var(--text-main, #111827)' }}>
                  {archivoLocal ? '¡Archivo Cargado!' : 'Examinar archivos locales'}
                </p>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted, #6b7280)', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {archivoLocal ? archivoLocal.name : 'Arrastra o selecciona fotos/videos'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={labelStyles}>URL Externa (MP4, YouTube, etc.)</label>
              <input type="url" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://ejemplo.com/video.mp4" style={inputStyles} />
            </div>
          )}

          {/* PREVISUALIZADOR */}
          {(archivoLocal || imagenUrl.trim()) && (
            <div style={{ background: 'var(--bg-primary, #f9fafb)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border, #d1d5db)' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {esVideo(archivoLocal?.name || imagenUrl) ? <Film size={14} /> : <ImageIcon size={14} />} Vista previa del archivo
              </p>
              <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#111', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                {esVideo(archivoLocal?.name || imagenUrl) ? (
                  (archivoLocal === null && (imagenUrl.includes('youtube.com') || imagenUrl.includes('youtu.be'))) ? (
                    <iframe src={obtenerEmbedYoutube(imagenUrl)} title="Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
                  ) : (
                    <video src={obtenerPreviewLocal()} controls muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )
                ) : (
                  <img src={obtenerPreviewLocal()} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
            </div>
          )}

          {/* INTERRUPTOR DESTACAR */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: destacada ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-primary, #f9fafb)', padding: '16px', borderRadius: '12px', border: destacada ? '1px solid var(--accent, #10b981)' : '1px solid var(--border, #e5e7eb)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Star size={20} style={{ color: destacada ? 'var(--accent, #10b981)' : 'var(--text-muted, #9ca3af)' }} fill={destacada ? 'var(--accent, #10b981)' : 'transparent'} />
              <div>
                <p style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: 'var(--text-main, #111827)' }}>Fijar como Destacada</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted, #6b7280)', marginTop: '2px' }}>Aparecerá en el Banner principal del Home</p>
              </div>
            </div>
            <input type="checkbox" checked={destacada} onChange={(e) => setDestacada(e.target.checked)} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--accent, #10b981)' }} />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyles}>Cuerpo / Descripción <span style={{color: '#ef4444'}}>*</span></label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows={5} placeholder="Escribe el contenido detallado aquí..." style={{...inputStyles, resize: 'vertical', lineHeight: '1.6'}} />
          </div>

          <button type="submit" disabled={submitting || subiendoArchivo} style={{ background: (submitting || subiendoArchivo) ? 'var(--text-muted, #9ca3af)' : 'var(--accent, #10b981)', color: '#fff', padding: '16px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '15px', cursor: (submitting || subiendoArchivo) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.3s, transform 0.1s', boxShadow: (submitting || subiendoArchivo) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            {(submitting || subiendoArchivo) ? (
              <>
                <Loader2 className="animate-spin" size={20} /> 
                {subiendoArchivo ? 'Procesando Multimedia...' : 'Publicando Noticia...'}
              </>
            ) : 'Publicar Noticia'}
          </button>
        </form>

        {/* ================= LISTADO DE CONTROL HISTORIAL ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main, #111827)' }}>Historial de Publicaciones</h2>
            <span style={{ background: 'var(--bg-secondary, #f3f4f6)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted, #4b5563)', border: '1px solid var(--border, #e5e7eb)' }}>
              {noticias.length} Registros
            </span>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', padding: '60px', justifyContent: 'center', color: 'var(--accent, #10b981)' }}><Loader2 size={32} className="animate-spin" /></div>
          ) : noticias.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: 'var(--bg-secondary, #f9fafb)', borderRadius: '16px', border: '1px dashed var(--border, #d1d5db)', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted, #9ca3af)', marginBottom: '12px' }} />
              <p style={{ margin: 0, color: 'var(--text-muted, #6b7280)', fontWeight: '500', fontSize: '15px' }}>No hay noticias registradas aún.<br/>Usa el panel izquierdo para crear la primera.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {noticias.map(n => (
                <div key={n.id} className="noticia-item-card" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary, #ffffff)', border: n.destacada ? '1px solid var(--accent, #10b981)' : '1px solid var(--border, #e5e7eb)', padding: '16px', borderRadius: '12px', gap: '16px', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: n.destacada ? '0 4px 12px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }} className="noticia-item-left">
                    
                    {/* MINIATURA */}
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, position: 'relative', border: '1px solid var(--border, #e5e7eb)' }}>
                      {n.imagen ? (
                         esVideo(n.imagen) ? (
                          <>
                            <video src={n.imagen.includes('youtube.com') || n.imagen.includes('youtu.be') ? '' : n.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                              <Film size={16} />
                            </div>
                          </>
                        ) : (
                          <img src={n.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main, #111827)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.titulo}</h4>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: 'var(--text-muted, #6b7280)', marginTop: '6px', fontWeight: '500' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {n.fecha?.toDate ? n.fecha.toDate().toLocaleDateString() : 'Procesando...'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {n.views || 0} Visitas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="noticia-item-actions">
                    <button onClick={() => toggleDestacadoExistente(n.id, n.destacada)} style={{ background: n.destacada ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary, #f3f4f6)', border: 'none', color: n.destacada ? 'var(--accent, #10b981)' : 'var(--text-muted, #6b7280)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }} title={n.destacada ? "Quitar destacado" : "Destacar ahora"}>
                      <Star size={18} fill={n.destacada ? 'var(--accent, #10b981)' : 'transparent'} />
                    </button>
                    <button onClick={() => handleEliminar(n.id)} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }} title="Eliminar noticia">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ESTILOS DE MEDIA QUERIES INYECTADOS */}
      <style>{`
        /* Configuración base para escritorio */
        .noticias-dashboard-grid {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 40px;
          align-items: start;
        }

        /* --- MEDIANAS Y TABLETS (max-width: 1024px) --- */
        @media (max-width: 1024px) {
          .noticias-dashboard-grid {
            grid-template-columns: 1fr; /* Cambia a una sola columna */
            gap: 48px;
          }
        }

        /* --- TELÉFONOS MÓVILES (max-width: 580px) --- */
        @media (max-width: 580px) {
          .admin-noticias-container {
            padding: 24px 16px !important;
          }
          form {
            padding: 20px !important; /* Menos padding en pantallas muy chicas */
          }
          .noticia-item-card {
            flex-direction: column; /* Apila miniatura/texto y botones verticalmente */
            align-items: stretch !important;
            gap: 14px !important;
          }
          .noticia-item-left {
            width: 100%;
          }
          .noticia-item-actions {
            justify-content: flex-end;
            border-top: 1px solid var(--border, #e5e7eb);
            padding-top: 10px;
          }
          .noticia-item-actions button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}