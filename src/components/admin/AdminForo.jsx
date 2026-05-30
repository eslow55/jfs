import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, AlertTriangle, MessageSquare, Calendar, User, Film, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminForo() {
  const [debates, setDebates] = useState([]);
  const [filtroReportados, setFiltroReportados] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '' });

  // Sincronización en tiempo real con la colección del foro
  useEffect(() => {
    const q = query(collection(db, 'foro'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setDebates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const triggerToast = (mensaje) => {
    setToast({ mostrar: true, mensaje });
    setTimeout(() => setToast({ mostrar: false, mensaje: '' }), 3500);
  };

  const handleModeracion = async (id) => {
    if (window.confirm('¿Confirmas la eliminación permanente de este hilo y todo su contenido adjunto?')) {
      try {
        await deleteDoc(doc(db, 'foro', id));
        triggerToast('Hilo de discusión removido por moderación.');
      } catch (error) {
        console.error("Error al moderar el foro: ", error);
        alert('Ocurrió un error al intentar eliminar el documento.');
      }
    }
  };

  // Formateador de fechas robusto
  const evaluarFecha = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const f = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return f.toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Filtrado reactivo en memoria para optimizar lecturas de Firebase
  const debatesFiltrados = debates.filter(d => {
    if (filtroReportados) return d.reportsCount && d.reportsCount > 0;
    return true;
  });

  return (
    <div>
      {/* CABECERA EN TRES BLOQUES SEMÁNTICOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Control & Moderación del Foro
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', margin: 0 }}>
            Inspecciona hilos de debate, archivos adjuntos de usuarios y procesa reportes de la comunidad.
          </p>
        </div>

        {/* INTERRUPTOR DE SEGURIDAD (FILTRO) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFiltroReportados(false)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '10px',
              background: !filtroReportados ? 'var(--text-main)' : 'var(--bg-primary)',
              color: !filtroReportados ? 'var(--bg-secondary)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              boxShadow: 'none',
              transform: 'none'
            }}
          >
            Todos ({debates.length})
          </button>
          <button
            onClick={() => setFiltroReportados(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '10px',
              background: filtroReportados ? 'var(--danger)' : 'var(--bg-primary)',
              color: filtroReportados ? '#ffffff' : 'var(--text-muted)',
              border: `1px solid ${filtroReportados ? 'var(--danger)' : 'var(--border)'}`,
              boxShadow: 'none',
              transform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldAlert size={14} /> Reportados ({debates.filter(d => d.reportsCount > 0).length})
          </button>
        </div>
      </div>

      {/* FEEDBACK NOTIFICACIÓN TOAST */}
      {toast.mostrar && (
        <div style={{ padding: '12px 20px', background: 'var(--text-main)', color: 'var(--bg-primary)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow)' }}>
          <CheckCircle size={16} style={{ color: 'var(--accent)' }} /> {toast.mensaje}
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DE DISCUSIONES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {debatesFiltrados.length === 0 ? (
          <div style={{ padding: '40px', background: 'var(--bg-primary)', border: '1px dashed var(--border)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay hilos de discusión abiertos que coincidan con el filtro seleccionado.
          </div>
        ) : (
          debatesFiltrados.map(d => {
            const tieneReportes = d.reportsCount && d.reportsCount > 0;
            return (
              <div 
                key={d.id} 
                style={{ 
                  padding: '24px', 
                  border: `1px solid ${tieneReportes ? 'rgba(220, 53, 69, 0.3)' : 'var(--border)'}`, 
                  borderRadius: '16px', 
                  background: 'var(--bg-secondary)', 
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '24px',
                  alignItems: 'start',
                  boxShadow: 'var(--shadow)',
                  position: 'relative'
                }}
                className="forum-admin-row"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* METADATOS SUPERIORES */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-main)' }}>
                      <User size={14} /> {d.username || d.authorName || 'Usuario Anónimo'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {evaluarFecha(d.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={14} /> {d.repliesCount || 0} respuestas
                    </span>
                  </div>

                  {/* ALERTA DE REPORTES EN CASO DE DETECCIÓN */}
                  {tieneReportes && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(220, 53, 69, 0.08)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(220, 53, 69, 0.15)' }}>
                      <AlertTriangle size={14} /> Contenido Reportado por la Comunidad ({d.reportsCount} avisos)
                    </div>
                  )}

                  {/* CUERPO DEL CONTENIDO TEXTUAL */}
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {d.contenido}
                  </p>

                  {/* RENDERIZADOR RESPONSIVO DE ARCHIVOS MULTIMEDIA ADJUNTOS DESDE CELULAR/PC */}
                  {d.urlMedia && (
                    <div style={{ 
                      marginTop: '8px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      maxHeight: '260px', 
                      maxWidth: '450px',
                      background: '#050505', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {d.tipoMedia === 'video' ? (
                        <video src={d.urlMedia} controls style={{ width: '100%', maxHeight: '260px', objectFit: 'contain' }} />
                      ) : (
                        <img src={d.urlMedia} alt="Adjunto del foro" style={{ width: '100%', maxHeight: '260px', objectFit: 'contain' }} />
                      )}
                    </div>
                  )}
                </div>

                {/* ACCIÓN DE ELIMINACIÓN DE CONTENIDO */}
                <button 
                  onClick={() => handleModeracion(d.id)} 
                  style={{ 
                    background: 'transparent', 
                    color: 'var(--danger)', 
                    boxShadow: 'none', 
                    padding: '12px', 
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    alignSelf: 'center'
                  }} 
                  className="forum-delete-btn"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .forum-admin-row {
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .forum-admin-row:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }
        .forum-delete-btn:hover {
          background: rgba(220, 53, 69, 0.1) !important;
          border-color: rgba(220, 53, 69, 0.15) !important;
        }
      `}</style>
    </div>
  );
}