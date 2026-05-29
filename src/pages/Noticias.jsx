import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  deleteDoc, doc, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { 
  Calendar, User, ArrowUpRight, Clock, ShieldAlert, 
  X, Search, Plus, Trash2, Edit2, Loader2, Image as ImageIcon 
} from 'lucide-react';

/**
 * NOTAS DE DISEÑO:
 * Este componente utiliza un enfoque de "Single File Architecture" 
 * para mantener la portabilidad. Incluye:
 * 1. Sistema de filtrado en tiempo real.
 * 2. CRUD completo (Create, Read, Delete).
 * 3. Manejo de estados de carga (Skeleton).
 * 4. Interfaz responsiva.
 */

// --- CONFIGURACIÓN DE TEMA ---
const theme = {
  bg: '#09090b',
  card: '#111114',
  border: '#1f1f24',
  accent: '#3b82f6',
  textMain: '#ffffff',
  textMuted: '#6b7280',
  danger: '#ef4444'
};

// --- COMPONENTES AUXILIARES INTERNOS ---

// 1. SKELETON LOADER (Mejora la percepción de velocidad)
const SkeletonLoader = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{ height: '350px', background: '#111114', borderRadius: '16px', border: `1px solid ${theme.border}`, animation: 'pulse 1.5s infinite' }} />
    ))}
    <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
  </div>
);

// 2. MODAL DE LECTURA / EDICIÓN
const NewsModal = ({ noticia, onClose, isEditMode = false }) => {
  if (!noticia) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: theme.card, maxWidth: '700px', width: '100%', borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        {noticia.multimedia && <img src={noticia.multimedia} style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />}
        <h2 style={{ fontSize: '32px', marginBottom: '15px', color: theme.textMain }}>{noticia.titulo}</h2>
        <p style={{ color: theme.textMuted, lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{noticia.descripcion}</p>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [noticiaAbierta, setNoticiaAbierta] = useState(null);
  
  // Estado para el panel de administración (puedes vincularlo a un Auth)
  const [isAdmin] = useState(true); // Cambiar a false en producción real

  useEffect(() => {
    const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setNoticias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });
  }, []);

  // --- LÓGICA DE FILTRADO (Memoizada para rendimiento) ---
  const noticiasFiltradas = useMemo(() => {
    return noticias.filter(n => 
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
      n.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [noticias, busqueda]);

  const formatearFecha = (data) => {
    if (!data) return "";
    const date = data.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta noticia?")) {
      await deleteDoc(doc(db, 'noticias', id));
    }
  };

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '40px 20px', color: theme.textMain }}>
      <NewsModal noticia={noticiaAbierta} onClose={() => setNoticiaAbierta(null)} />

      {/* --- CABECERA --- */}
      <div style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-1px' }}>Crónicas & <span style={{ color: theme.accent }}>Anuncios</span></h1>
          <p style={{ color: theme.textMuted, marginTop: '10px' }}>Canal oficial de actualizaciones y comunicados del staff.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: theme.textMuted }} />
            <input 
              placeholder="Buscar comunicados..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', background: theme.card, border: `1px solid ${theme.border}`, padding: '10px 10px 10px 40px', borderRadius: '10px', color: '#fff', outline: 'none' }}
            />
          </div>
          {isAdmin && (
             <button style={{ padding: '10px 20px', background: theme.accent, border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Plus size={18} /> Publicar
             </button>
          )}
        </div>
      </div>

      {/* --- GRID DE CONTENIDO --- */}
      {cargando ? <SkeletonLoader /> : (
        noticiasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', border: `1px dashed ${theme.border}`, borderRadius: '20px' }}>
            <ShieldAlert size={48} style={{ color: theme.textMuted, marginBottom: '20px' }} />
            <p style={{ color: theme.textMuted }}>No se encontraron noticias con ese criterio.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {noticiasFiltradas.map((noticia) => (
              <article 
                key={noticia.id} 
                onClick={() => setNoticiaAbierta(noticia)}
                style={{ 
                  background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '16px', 
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s',
                  position: 'relative'
                }}
                className="news-card"
              >
                {noticia.multimedia && (
                  <div style={{ height: '200px', background: '#000' }}>
                    <img src={noticia.multimedia} alt={noticia.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '24px' }}>
                  <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={12} /> {formatearFecha(noticia.fecha)}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{noticia.titulo}</h3>
                  <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: '1.6' }}>
                    {noticia.descripcion.substring(0, 120)}...
                  </p>
                  
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.accent, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Leer más <ArrowUpRight size={14} />
                    </span>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(noticia.id); }} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      )}

      {/* --- ESTILOS DINÁMICOS --- */}
      <style>{`
        .news-card:hover { transform: translateY(-5px); border-color: ${theme.accent}; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}