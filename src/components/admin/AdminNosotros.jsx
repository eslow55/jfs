import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, doc, setDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { Save, Loader2, Users, Layout, Eye } from 'lucide-react';

export default function AdminNosotros() {
  const [titulo, setTitulo] = useState('');
  const [eslogan, setEslogan] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [docId, setDocId] = useState('principal');
  const [guardando, setGuardando] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

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
      }
    });
  }, []);

  const mostrarMensajeTemp = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 4000);
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
    <div>
      {/* CABECERA DEL MÓDULO */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Sección Institucional Comunidad
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', margin: 0 }}>
          Modifica el manifiesto, valores o información corporativa que se despliega al pie de la página principal.
        </p>
      </div>

      {/* COMPONENTE DE NOTIFICACIÓN INLINE */}
      {notificacion.mostrar && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '600',
          background: notificacion.tipo === 'success' ? 'rgba(0, 179, 89, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          color: notificacion.tipo === 'success' ? 'var(--accent)' : 'var(--danger)',
          border: `1px solid ${notificacion.tipo === 'success' ? 'rgba(0, 179, 89, 0.2)' : 'rgba(220, 53, 69, 0.2)'}`
        }}>
          {notificacion.mensaje}
        </div>
      )}

      {/* DISEÑO EN DOS COLUMNAS: FORMULARIO Y PREVIEW SIMULTÁNEO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        
        {/* FORMULARIO ESTRUCTURADO */}
        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                Título de la Sección
              </label>
              <input 
                type="text" 
                placeholder="Ej: Quiénes Somos / Sobre Nosotros" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                Eslogan o Lema Corto (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Ej: Innovación y desarrollo comunitario en tiempo real" 
                value={eslogan} 
                onChange={e => setEslogan(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
              Descripción o Manifiesto Institucional
            </label>
            <textarea 
              placeholder="Escribe aquí de manera detallada la historia, misión o propósitos del portal..." 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              style={{ minHeight: '160px', lineHeight: '1.6', resize: 'vertical' }}
              required 
            />
          </div>

          <button type="submit" disabled={guardando} style={{ alignSelf: 'flex-start', borderRadius: '14px', padding: '14px 30px' }}>
            {guardando ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Impactando cambios...</span>
              </>
            ) : (
              <>
                <Save size={16} /> Guardar Configuración Pública
              </>
            )}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '15px 0' }} />

        {/* CONTENEDOR DE PREVISUALIZACIÓN EN TIEMPO REAL */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-muted)' }}>
            <Eye size={18} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Previsualización en tiempo real (Live Render)</h4>
          </div>

          <div style={{ 
            padding: '40px 24px', 
            background: 'var(--bg-primary)', 
            border: '1px solid var(--border)',
            borderRadius: '20px', 
            textAlign: 'center',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent)', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <Users size={28} />
            </div>
            
            <h2 style={{ fontSize: '26px', marginBottom: '6px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {titulo || 'Sobre Nosotros'}
            </h2>

            {eslogan && (
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', marginTop: 0 }}>
                {eslogan}
              </p>
            )}

            <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
              {descripcion || 'Escribe contenido en el editor superior para previsualizar el render de producción en este bloque...'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}