import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, AlertTriangle, MessageSquare, Calendar, User, ShieldAlert, CheckCircle } from 'lucide-react';

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
    <div className="forum-admin-container">
      
      {/* CABECERA EN TRES BLOQUES SEMÁNTICOS (RESPONSIVE) */}
      <div className="forum-header">
        <div className="forum-title-area">
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Control & Moderación del Foro
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', margin: 0 }}>
            Inspecciona hilos de debate, archivos adjuntos de usuarios y procesa reportes de la comunidad.
          </p>
        </div>

        {/* INTERRUPTOR DE SEGURIDAD (FILTRO EN MÓVIL SE ADAPTA A ANCHO COMPLETO) */}
        <div className="forum-filter-group" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFiltroReportados(false)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '10px',
              background: !filtroReportados ? 'var(--text-main)' : 'var(--bg-primary)',
              color: !filtroReportados ? 'var(--bg-secondary)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
            className="filter-toggle-btn"
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            className="filter-toggle-btn"
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
          <div style={{ padding: '40px', background: 'var(--bg-primary)', border: '1px dashed var(--border)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
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
                  gap: '20px',
                  boxShadow: 'var(--shadow)',
                  position: 'relative'
                }}
                className="forum-admin-row"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minWidth: 0 }}>
                  
                  {/* METADATOS SUPERIORES */}
                  <div className="forum-metadata" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-main)' }}>
                      <User size={14} /> {d.username || d.authorName || 'Usuario Anónimo'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {evaluarFecha(d.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={14} /> {d.repliesCount || 0} <span className="replies-text">respuestas</span>
                    </span>
                  </div>

                  {/* ALERTA DE REPORTES EN CASO DE DETECCIÓN */}
                  {tieneReportes && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(220, 53, 69, 0.08)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(220, 53, 69, 0.15)' }}>
                      <AlertTriangle size={14} /> <span>Reportado ({d.reportsCount} avisos)</span>
                    </div>
                  )}

                  {/* CUERPO DEL CONTENIDO TEXTUAL */}
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {d.contenido}
                  </p>

                  {/* RENDERIZADOR MULTIMEDIA */}
                  {d.urlMedia && (
                    <div className="forum-media-wrapper" style={{ 
                      marginTop: '8px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      maxHeight: '260px', 
                      background: '#050505', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
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
                    padding: '12px', 
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }} 
                  className="forum-delete-btn"
                >
                  <Trash2 size={18} /> <span className="delete-btn-text">Eliminar Hilo</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ESTILOS DE ADAPTACIÓN (CSS IN JS) */}
      <style>{`
        /* Estilos base / Escritorio */
        .forum-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 30px;
        }
        .forum-title-area {
          flex: 1;
        }
        .forum-admin-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: start;
        }
        .forum-media-wrapper {
          max-width: 450px;
        }
        .delete-btn-text {
          display: none; /* En escritorio basta con el ícono de basura */
        }
        .forum-delete-btn {
          align-self: center;
        }

        /* Hover behaviors en Escritorio */
        .forum-admin-row {
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .forum-admin-row:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }
        .forum-delete-btn {
          transition: all 0.2s ease;
        }
        .forum-delete-btn:hover {
          background: rgba(220, 53, 69, 0.1) !important;
          border-color: rgba(220, 53, 69, 0.15) !important;
        }

        /* --- CONFIGURACIÓN RESPONSIVE MEDIANA (Tablets / max-width: 768px) --- */
        @media (max-width: 768px) {
          .forum-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          .forum-filter-group {
            width: 100%;
          }
          .filter-toggle-btn {
            flex: 1; /* Los dos botones superiores toman la mitad exacta de la pantalla */
            padding: 10px 12px !important;
          }
          .forum-admin-row {
            grid-template-columns: 1fr; /* Rompe el grid lateral. Pasa a una columna vertical */
            padding: 16px;
          }
          .forum-media-wrapper {
            max-width: 100%; /* La imagen adjunta ocupa todo el ancho del card */
            max-height: 200px;
          }
          .forum-media-wrapper img, .forum-media-wrapper video {
            max-height: 200px;
          }
          .forum-delete-btn {
            align-self: stretch; /* El botón de borrar se expande horizontalmente */
            background: rgba(220, 53, 69, 0.05);
            border: 1px solid rgba(220, 53, 69, 0.1);
            margin-top: 8px;
          }
          .delete-btn-text {
            display: inline; /* Se activa el texto al lado del basurero para mejor UX */
            font-size: 13.5px;
            font-weight: 600;
            margin-left: 6px;
          }
        }

        /* --- PANTALLAS EXTRA PEQUEÑAS (Celulares / max-width: 480px) --- */
        @media (max-width: 480px) {
          .forum-metadata {
            gap: 8px;
          }
          .replies-text {
            display: none; /* Ahorra espacio: cambia "3 respuestas" a solo "3" con su ícono */
          }
          .forum-admin-row {
            padding: 14px 12px;
          }
        }
      `}</style>
    </div>
  );
}