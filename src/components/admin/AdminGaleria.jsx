import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Loader2, UploadCloud, X, Film } from 'lucide-react';

export default function AdminGaleria() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState(''); // 'image' o 'video'
  const [cargando, setCargando] = useState(false);
  
  const fileInputRef = useRef(null);

  // Variables de entorno de Cloudinary instanciadas en Vite
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Sincronización en tiempo real de la galería multimedia
  useEffect(() => {
    const q = query(collection(db, 'galeria'), orderBy('fecha', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error en sincronización de galería:", error);
    });
    return () => unsub();
  }, []);

  // Manejador y validador de archivos binarios locales
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Revocar URL anterior para evitar fugas de memoria
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    const isVideo = selectedFile.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Limpieza de estados multimedia
  const resetFileState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Petición asíncrona hacia la API de Cloudinary
  const uploadToCloudinary = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const resourceType = fileType === 'video' ? 'video' : 'image';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Error al procesar la subida multimedia.');
    const data = await res.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  };

  const handleSubirItem = async (e) => {
    e.preventDefault();
    if (!file) return;

    setCargando(true);
    try {
      const uploadResult = await uploadToCloudinary();

      if (uploadResult) {
        await addDoc(collection(db, 'galeria'), {
          imagen: uploadResult.url, 
          publicId: uploadResult.publicId,
          tipo: fileType,
          fecha: new Date().toISOString()
        });
      }

      resetFileState();
    } catch (err) {
      alert('Error de red al subir el archivo local. Revisa los presets de Cloudinary.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarItem = async (id, publicId) => {
    if (window.confirm('¿Deseas remover este recurso de la galería global de forma permanente?')) {
      try {
        await deleteDoc(doc(db, 'galeria', id));
        if (publicId) {
          console.log(`Recurso con Public ID: ${publicId} desvinculado de la base de datos.`);
        }
      } catch (error) {
        console.error("Error al eliminar el elemento:", error);
        alert("Ocurrió un error al intentar eliminar el elemento.");
      }
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--text-main, #111827)' }}>
      
      {/* CABECERA DEL MÓDULO */}
      <div style={{ borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '20px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main, #111827)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Portfolio <span style={{ color: 'var(--accent, #10b981)' }}>Galería Histórica</span>
        </h3>
        <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '14.5px', margin: 0 }}>
          Sube fotografías del servidor, capturas de pantalla de la comunidad o videoclips en alta fidelidad.
        </p>
      </div>
      
      {/* FORMULARIO DE CARGA */}
      <form onSubmit={handleSubirItem} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        <div style={{ width: '100%' }}>
          {!previewUrl ? (
            /* Área de Carga Dropzone Responsive */
            <div 
              onClick={() => fileInputRef.current.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent, #10b981)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #d1d5db)';
                e.currentTarget.style.background = 'var(--bg-primary, #f9fafb)';
              }}
              className="gallery-dropzone"
              style={{
                border: '2px dashed var(--border, #d1d5db)',
                borderRadius: '16px',
                background: 'var(--bg-primary, #f9fafb)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                background: 'var(--bg-secondary, #ffffff)',
                padding: '14px',
                borderRadius: '50%',
                marginBottom: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UploadCloud size={26} style={{ color: 'var(--text-muted, #9ca3af)' }} />
              </div>

              <p className="dropzone-text-main" style={{ margin: 0, fontWeight: '700', color: 'var(--text-main, #111827)' }}>
                Selecciona una foto o video desde tu dispositivo
              </p>
              <p className="dropzone-text-sub" style={{ margin: '6px 0 0 0', color: 'var(--text-muted, #6b7280)' }}>
                Formatos aceptados: PNG, JPG, WEBP, MP4 o MOV (Max 10MB)
              </p>
            </div>
          ) : (
            /* Previsualizador con protección de altura en móviles */
            <div className="gallery-preview-box" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border, #e5e7eb)', background: '#0b0b0e', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {fileType === 'video' ? (
                <video src={previewUrl} controls style={{ width: '100%', objectFit: 'contain' }} className="preview-media" />
              ) : (
                <img src={previewUrl} alt="Preview temporal" style={{ width: '100%', objectFit: 'contain' }} className="preview-media" />
              )}
              
              <button 
                type="button"
                onClick={resetFileState}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'rgba(15, 15, 20, 0.85)', color: '#ffffff',
                  border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s, transform 0.1s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 15, 20, 0.85)'}
              >
                <X size={18} />
              </button>
            </div>
          )}
          
          <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <button 
          type="submit" 
          disabled={cargando || !file} 
          className="gallery-submit-btn"
          style={{ 
            borderRadius: '12px', padding: '14px 28px',
            background: (cargando || !file) ? 'var(--text-muted, #9ca3af)' : 'var(--accent, #10b981)',
            color: '#fff', border: 'none', fontWeight: '700', fontSize: '14.5px',
            cursor: (cargando || !file) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.2s ease'
          }}
        >
          {cargando ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Transfiriendo archivos...</span>
            </>
          ) : (
            <>
              <Plus size={18} /> Añadir al Portafolio Público
            </>
          )}
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e5e7eb)', margin: '40px 0' }} />

      {/* GRID DE VISUALIZACIÓN MULTIMEDIA */}
      <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main, #111827)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Contenido en Exhibición ({items.length})
      </h4>

      <div className="gallery-responsive-grid">
        {items.map(img => (
          <div 
            key={img.id} 
            style={{ 
              position: 'relative', borderRadius: '14px', overflow: 'hidden', 
              border: '1px solid var(--border, #e5e7eb)', background: '#050505',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))'
            }} 
            className="galeria-admin-card"
          >
            {img.tipo === 'video' ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video src={img.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', padding: '5px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '11px', fontWeight: '600' }}>
                  <Film size={12} /> VÍDEO
                </div>
              </div>
            ) : (
              <img src={img.imagen} alt="Elemento de Galeria" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}

            <button 
              onClick={() => handleEliminarItem(img.id, img.publicId)}
              style={{ 
                position: 'absolute', top: '10px', right: '10px', 
                background: 'var(--danger, #ef4444)', color: '#ffffff', 
                padding: '6px', borderRadius: '50%', border: 'none',
                width: '32px', height: '32px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)',
                zIndex: 5
              }}
              className="trash-overlay-btn"
              title="Remover permanentemente"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* COMPLEMENTOS MULTI-PLATAFORMA (CSS) */}
      <style>{`
        /* Configuración de Escritorio Extendido */
        .gallery-dropzone {
          padding: 48px 24px;
        }
        .dropzone-text-main { fontSize: 15px; }
        .dropzone-text-sub { fontSize: 12.5px; }
        
        .gallery-preview-box { maxHeight: 360px; }
        .preview-media { maxHeight: 360px; }
        
        .gallery-submit-btn {
          align-self: flex-start;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        
        /* Grid inteligente por defecto */
        .gallery-responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }
        .galeria-admin-card {
          height: 150px;
        }

        /* Hover animations */
        .galeria-admin-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .galeria-admin-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
        }
        .trash-overlay-btn {
          transition: all 0.2s ease;
        }
        .trash-overlay-btn:hover {
          background: #dc2626 !important;
          transform: scale(1.12);
        }

        /* --- BREAKPOINT PARA TABLETS (max-width: 768px) --- */
        @media (max-width: 768px) {
          .gallery-dropzone {
            padding: 36px 16px;
          }
          .gallery-submit-btn {
            align-self: stretch; /* Botón a ancho completo */
            width: 100%;
          }
          .gallery-responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Columnas un poco más angostas */
            gap: 12px;
          }
          .galeria-admin-card {
            height: 120px; /* Reducción de tamaño del card para que entren más en pantalla */
          }
        }

        /* --- BREAKPOINT PARA DISPOSITIVOS MÓVILES (max-width: 480px) --- */
        @media (max-width: 480px) {
          .gallery-dropzone {
            padding: 24px 12px;
          }
          .dropzone-text-main { 
            fontSize: 13.5px; 
          }
          .dropzone-text-sub { 
            display: none; /* Simplifica espacio removiendo el texto secundario en teléfonos */
          }
          .gallery-preview-box, .preview-media { 
            max-height: 240px; /* Reduce la altura máxima de previsualización en smartphones */
          }
          .gallery-responsive-grid {
            grid-template-columns: repeat(2, 1fr); /* Fuerza un layout exacto de 2 columnas simétricas */
            gap: 10px;
          }
          .galeria-admin-card {
            height: 110px;
          }
          .trash-overlay-btn {
            width: 36px;  /* Botón ligeramente más grande en celular para facilitar el toque */
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
}