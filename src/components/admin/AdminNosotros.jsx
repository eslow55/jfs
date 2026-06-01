import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, doc, setDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { Save, Loader2, Users, Eye, Image as ImageIcon, Link2, Trash2, ShieldInfo } from 'lucide-react';

export default function AdminNosotros() {
  const [titulo, setTitulo] = useState('');
  const [eslogan, setEslogan] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [docId, setDocId] = useState('principal');
  const [guardando, setGuardando] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [metodoImagen, setMetodoImagen] = useState('url'); // 'url' o 'file'

  // Sincronización en tiempo real con el documento institucional único
  useEffect(() => {
    const q = query(collection(db, 'nosotros'), limit(1));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        setDocId(d.id);
        const data = d.data();
        setTitulo(data.titulo || 'Sobre Nosotros');
        setEslogan(data.eslogan || '');
        setDescripcion(data.descripcion || '');
        setImagenUrl(data.imagenUrl || '');
      }
    }, (error) => {
      console.error("Error al sincronizar datos institucionales: ", error);
    });
  }, []);

  const mostrarMensajeTemp = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
  };

  // Procesador para subida local mediante conversión asíncrona a Base64 string
  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.size > 2 * 1024 * 1024) { // Límite de seguridad de 2MB
      mostrarMensajeTemp('La imagen excede el límite de 2MB. Usa una URL externa o comprime el archivo.', 'error');
      return;
    }

    const lector = new FileReader();
    lector.onloadend = () => {
      setImagenUrl(lector.result);
    };
    lector.readAsDataURL(archivo);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;

    setGuardando(true);
    try {
      await setDoc(doc(db, 'nosotros', docId), {
        titulo: titulo.trim() || 'Sobre Nosotros',
        eslogan: eslogan.trim(),
        descripcion: descripcion.trim(),
        imagenUrl: imagenUrl.trim(),
        ultimaActualizacion: new Date().toISOString()
      }, { merge: true });
      
      mostrarMensajeTemp('Sección institucional actualizada con éxito.', 'success');
    } catch (err) {
      console.error(err);
      mostrarMensajeTemp('Error al intentar guardar en la base de datos.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ padding: '4px' }}>
      {/* CABECERA DEL MÓDULO */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Sección Institucional Comunidad
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', margin: 0 }}>
          Modifica el manifiesto, eslogan e imágenes corporativas que se despliegan en la sección de identidad de la plataforma.
        </p>
      </div>

      {/* NOTIFICACIÓN INLINE */}
      {notificacion.mostrar && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '25px',
          fontSize: '14px',
          fontWeight: '600',
          background: notificacion.tipo === 'success' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          color: notificacion.tipo === 'success' ? 'var(--accent, #3b82f6)' : '#dc3545',
          border: `1px solid ${notificacion.tipo === 'success' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(220, 53, 69, 0.2)'}`
        }}>
          {notificacion.mensaje}
        </div>
      )}

      {/* DISEÑO EN DOS COLUMNAS REESTRUCTURADO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* FORMULARIO ESTRUCTURADO */}
        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                Título de la Sección
              </label>
              <input 
                type="text" 
                placeholder="Ej: Quiénes Somos / Sobre Nosotros" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                Eslogan o Lema Corto
              </label>
              <input 
                type="text" 
                placeholder="Ej: Innovación y desarrollo comunitario" 
                value={eslogan} 
                onChange={e => setEslogan(e.target.value)} 
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* GESTIÓN AVANZADA DE IMAGEN INSTITUCIONAL */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', background: 'var(--bg-secondary)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
              Imagen Representativa Corporativa
            </label>
            
            {/* Selectores de método */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMetodoImagen('url')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', border: '1px solid var(--border)', background: metodoImagen === 'url' ? 'var(--text-main)' : 'transparent', color: metodoImagen === 'url' ? 'var(--bg-primary)' : 'var(--text-muted)' }}
              >
                <Link2 size={14} /> Enlace de imagen URL
              </button>
              <button
                type="button"
                onClick={() => setMetodoImagen('file')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', border: '1px solid var(--border)', background: metodoImagen === 'file' ? 'var(--text-main)' : 'transparent', color: metodoImagen === 'file' ? 'var(--bg-primary)' : 'var(--text-muted)' }}
              >
                <ImageIcon size={14} /> Subir archivo local
              </button>
            </div>

            {metodoImagen === 'url' ? (
              <input 
                type="text" 
                placeholder="Pegar enlace HTTPS de la imagen (Unsplash, Cloudinary, etc.)" 
                value={imagenUrl.startsWith('data:') ? '' : imagenUrl} 
                onChange={e => setImagenUrl(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
              />
            ) : (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                />
              </div>
            )}

            {imagenUrl && (
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <img src={imagenUrl} alt="Thumbnail preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {imagenUrl.startsWith('data:') ? 'Imagen binaria local precargada' : imagenUrl}
                </span>
                <button type="button" onClick={() => setImagenUrl('')} style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              Descripción o Manifiesto Institucional
            </label>
            <textarea 
              placeholder="Escribe la historia o propósitos del portal..." 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)', minHeight: '140px', lineHeight: '1.6', resize: 'vertical' }}
              required 
            />
          </div>

          <button type="submit" disabled={guardando} style={{ alignSelf: 'flex-start', borderRadius: '12px', padding: '14px 28px', background: 'var(--text-main)', color: 'var(--bg-primary)', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {guardando ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Guardando cambios públicos...</span>
              </>
            ) : (
              <>
                <Save size={16} /> Guardar Configuración Pública
              </>
            )}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

        {/* CONTENEDOR DE PREVISUALIZACIÓN VIVA */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <Eye size={18} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Previsualización del bloque institucional (Live Render)</h4>
          </div>

          <div style={{ 
            padding: '48px 24px', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)',
            borderRadius: '24px', 
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.01)'
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: imagenUrl ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '32px', alignItems: 'center' }}>
              
              {/* Columna Izquierda/Superior: Imagen corporativa */}
              {imagenUrl && (
                <div style={{ width: '100%', height: '280px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', background: '#0a0a0c' }}>
                  <img src={imagenUrl} alt="Institucional preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Columna Derecha/Inferior: Contenidos */}
              <div style={{ textAlign: imagenUrl ? 'left' : 'center' }}>
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--bg-primary)', color: 'var(--accent, #3b82f6)', marginBottom: '14px', border: '1px solid var(--border)' }}>
                  <Users size={24} />
                </div>
                
                <h2 style={{ fontSize: '28px', marginBottom: '6px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.6px', marginTop: 0 }}>
                  {titulo || 'Sobre Nosotros'}
                </h2>

                {eslogan && (
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent, #3b82f6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', marginTop: 0 }}>
                    {eslogan}
                  </p>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {descripcion || 'Escribe contenido en el editor superior para renderizar la información institucional de producción en este bloque...'}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}