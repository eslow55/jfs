import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { Flame, ChevronRight, Newspaper, MessageCircle, Image as ImageIcon, Users } from 'lucide-react';

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [chismes, setChismes] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [nosotros, setNosotros] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FIREBASE REALTIME
  // =========================
  useEffect(() => {
    const unsubNoticias = onSnapshot(query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(6)), (snapshot) => {
      setNoticias(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubChismes = onSnapshot(query(collection(db, 'chismes'), orderBy('fecha', 'desc'), limit(4)), (snapshot) => {
      setChismes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubGaleria = onSnapshot(query(collection(db, 'galeria'), orderBy('fecha', 'desc'), limit(8)), (snapshot) => {
      setGaleria(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubNosotros = onSnapshot(query(collection(db, 'nosotros'), limit(1)), (snapshot) => {
      const doc = snapshot.docs[0];
      if (doc) setNosotros({ id: doc.id, ...doc.data() });
    });

    return () => { unsubNoticias(); unsubChismes(); unsubGaleria(); unsubNosotros(); };
  }, []);

  const featured = useMemo(() => {
    if (!noticias.length) return null;
    return [...noticias].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  }, [noticias]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando portal...</div>;

  return (
    <div style={{ width: '100%', minHeight: '100vh', color: '#1e293b', paddingBottom: '80px' }}>
      
      {/* HERO SECTION */}
      <section style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto', minHeight: '500px', borderRadius: '40px', overflow: 'hidden', display: 'flex', alignItems: 'end', padding: '60px', background: featured?.imagen ? `linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,.2)), url(${featured.imagen}) center/cover` : '#1e293b' }}>
          <div style={{ maxWidth: '700px', color: 'white' }}>
            <span style={{ background: '#3b82f6', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>DESTACADO</span>
            <h1 style={{ fontSize: '48px', margin: '15px 0' }}>{featured?.titulo || 'Bienvenidos a JFS'}</h1>
            <p style={{ opacity: 0.9, marginBottom: '20px' }}>{featured?.descripcion || 'Contenido exclusivo en tiempo real.'}</p>
            <Link to={`/noticias/${featured?.id}`} style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>Leer completa <ChevronRight size={18}/></Link>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <main style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        
        {/* COLUMNA IZQ: NOTICIAS */}
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}><Newspaper /> Noticias Recientes</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {noticias.slice(1).map(n => (
              <div key={n.id} style={{ padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{n.titulo}</h3>
                <Link to={`/noticias/${n.id}`} style={{ color: '#2563eb', fontWeight: '600' }}>Ver detalle →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMNA DER: CHISMES Y GALERIA */}
        <aside>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><MessageCircle /> Chismes</h2>
            {chismes.map(c => (
              <div key={c.id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '10px', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>{c.titulo}</p>
              </div>
            ))}
          </div>
          
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><ImageIcon /> Galería</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {galeria.map(g => (
                <img key={g.id} src={g.imagen} alt="galeria" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* SECCIÓN NOSOTROS */}
      {nosotros && (
        <section style={{ maxWidth: '1500px', margin: '60px auto', padding: '40px', background: '#0f172a', color: 'white', borderRadius: '30px', textAlign: 'center' }}>
          <Users size={40} style={{ marginBottom: '15px' }} />
          <h2>Sobre Nosotros</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>{nosotros.descripcion}</p>
        </section>
      )}
    </div>
  );
}