import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Loader2, UploadCloud, X, Film, ImageIcon } from 'lucide-react';

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
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Manejador y validador de archivos binarios locales
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const isVideo = selectedFile.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Petición asíncrona hacia la API de Cloudinary
  const uploadToCloudinary = async () => {
    if (!file) return '';
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
    return data.secure_url;
  };

  const handleSubirItem = async (e) => {
    e.preventDefault();
    if (!file) return;

    setCargando(true);
    try {
      const secureMediaUrl = await uploadToCloudinary();

      // Almacenamiento unificado en Firestore
      await addDoc(collection(db, 'galeria'), {
        imagen: secureMediaUrl, 
        tipo: fileType,
        fecha: new Date().toISOString()
      });

      // Limpieza de estados
      setFile(null);
      setPreviewUrl('');
      setFileType('');
    } catch (err) {
      alert('Error de red al subir el archivo local. Revisa los presets de Cloudinary.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarItem = async (id) => {
    if (window.confirm('¿Deseas remover este recurso de la galería global de forma permanente?')) {
      await deleteDoc(doc(db, 'galeria', id));
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
      
      {/* FORMULARIO DE CARGA DRAG & DROP */}
      <form onSubmit={handleSubirItem} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        <div style={{ width: '100%' }}>
          {!previewUrl ? (
            /* Área de Carga Personalizada Avanzada (Dropzone) */
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
              style={{
                border: '2px dashed var(--border, #d1d5db)',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
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
              {/* Contenedor circular elegante para el ícono */}
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

              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main, #111827)' }}>
                Selecciona una foto o video desde tu dispositivo
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted, #6b7280)' }}>
                Formatos aceptados: PNG, JPG, WEBP, MP4 o MOV (Max 10MB)
              </p>
            </div>
          ) : (
            /* Previsualizador de alta fidelidad cuando ya hay archivo */
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border, #e5e7eb)', background: '#0b0b0e', maxHeight: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {fileType === 'video' ? (
                <video src={previewUrl} controls style={{ maxHeight: '360px', width: '100%', objectFit: 'contain' }} />
              ) : (
                <img src={previewUrl} alt="Preview temporal" style={{ maxHeight: '360px', width: '100%', objectFit: 'contain' }} />
              )}
              
              <button 
                type="button"
                onClick={() => { setFile(null); setPreviewUrl(''); setFileType(''); }}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(15, 15, 20, 0.85)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 15, 20, 0.85)'}
              >
                <X size={18} />
              </button>
            </div>
          )}
          
          {/* Input oculto controlado por la Ref */}
          <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        {/* Botón de Envíos Estilizado Completamente */}
        <button 
          type="submit" 
          disabled={cargando || !file} 
          style={{ 
            alignSelf: 'flex-start', 
            borderRadius: '12px', 
            padding: '14px 28px',
            background: (cargando || !file) ? 'var(--text-muted, #9ca3af)' : 'var(--accent, #10b981)',
            color: '#fff',
            border: 'none',
            fontWeight: '700',
            fontSize: '14.5px',
            cursor: (cargando || !file) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: (cargando || !file) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}
        >
          {cargando ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Transfiriendo archivos a la nube...</span>
            </>
          ) : (
            <>
              <Plus size={18} /> Añadir al Portafolio Público
            </>
          )}
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e5e7eb)', margin: '40px 0' }} />

      {/* MÓDULO GRID DE VISUALIZACIÓN MULTIMEDIA */}
      <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main, #111827)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Contenido en Exhibición ({items.length})
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
        {items.map(img => (
          <div 
            key={img.id} 
            style={{ 
              position: 'relative', 
              borderRadius: '14px', 
              overflow: 'hidden', 
              height: '140px', 
              border: '1px solid var(--border, #e5e7eb)',
              background: '#050505',
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

            {/* BOTÓN OVERLAY DE ELIMINACIÓN */}
            <button 
              onClick={() => handleEliminarItem(img.id)}
              style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'var(--danger, #ef4444)', 
                color: '#ffffff', 
                padding: '6px', 
                borderRadius: '50%', 
                boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)',
                border: 'none',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="trash-overlay-btn"
              title="Remover permanentemente"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ESTILOS INTERACTIVOS FLUIDOS INYECTADOS */}
      <style>{`
        .galeria-admin-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .galeria-admin-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
        }
        .trash-overlay-btn:hover {
          background: var(--danger-hover, #dc2626) !important;
          transform: scale(1.12);
        }
      `}</style>
    </div>
  );
}