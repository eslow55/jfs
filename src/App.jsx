import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- IMPORTACIÓN DE CONTEXTOS ---
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TemaProvider } from './contexts/TemaContext';

// --- IMPORTACIÓN DE COMPONENTES DE LAYOUT ---
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SplashScreen from './components/SplashScreen'; // <-- NUEVA IMPORTACIÓN

// --- IMPORTACIÓN DE PÁGINAS ---
import Home from './pages/Home';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle'; 
import Foro from './pages/Foro'; 
import Galeria from './pages/Galeria';
import SobreNosotros from './pages/SobreNosotros'; 
import Login from './pages/Login';
import Admin from './components/admin/Admin';

// --- COMPONENTE DE OPTIMIZACIÓN UX: RESET DE SCROLL ---
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// --- PROTECCIÓN DE RUTAS ADMINISTRATIVAS ---
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  
  if (cargando) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontWeight: '600',
        letterSpacing: '-0.2px'
      }}>
        <span className="loading-pulse">Verificando credenciales del staff...</span>
        <style>{`
          .loading-pulse { animation: pulse 1.5s infinite ease-in-out; }
          @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        `}</style>
      </div>
    );
  }
  
  return usuario ? children : <Navigate to="/login" replace />;
}

// --- CONTROLADOR DE LAYOUT DINÁMICO ---
function LayoutEstructurado({ children }) {
  const location = useLocation();
  const esAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-main)',
      transition: 'background-color 0.3s ease, color 0.3s ease' 
    }}>
      
      {/* NAVBAR */}
      <div style={{ 
        transform: esAdmin ? 'scale(0.98)' : 'none', 
        transition: 'transform 0.3s ease',
        maxHeight: esAdmin ? '65px' : 'auto',
        overflow: esAdmin ? 'hidden' : 'visible'
      }} className={esAdmin ? 'navbar-admin-compact' : ''}>
        <Navbar />
      </div>
      
      {/* CONTENEDOR VARIABLE */}
      <main style={{ 
        flex: 1, 
        padding: esAdmin ? '0' : '0 0 60px 0', 
        boxSizing: 'border-box' 
      }}>
        {children}
      </main>
      
      {/* FOOTER CONDICIONAL */}
      {!esAdmin && <Footer />}

      <style>{`
        .navbar-admin-compact header, 
        .navbar-admin-compact nav {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
          background: var(--bg-secondary) !important;
          border-bottom: 1px solid var(--border) !important;
        }
      `}</style>
    </div>
  );
}

// --- COMPONENTE ENRUTADOR PRINCIPAL ---
export default function App() {
  // 1. ESTADO DE LA PANTALLA DE CARGA CINEMÁTICA
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('hasSeenSplash') !== 'true';
  });

  // 2. FUNCIÓN PARA DESMONTAR EL SPLASH
  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <TemaProvider>
      <AuthProvider>
        {/* 3. LÓGICA CONDICIONAL DE RENDERIZADO */}
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <div className="app-content-fade-in">
            <Router>
              <ScrollToTop />
              
              <LayoutEstructurado>
                <Routes>
                  {/* Rutas Públicas Estándar */}
                  <Route path="/" element={<Home />} />
                  <Route path="/noticias" element={<Noticias />} />
                  
                  {/* Ruta Dinámica para la Lectura de Crónicas Individuales */}
                  <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                  
                  {/* Vinculado correctamente con el componente Foro */}
                  <Route path="/foro" element={<Foro />} />
                  
                  <Route path="/galeria" element={<Galeria />} />
                  <Route path="/SobreNosotros" element={<SobreNosotros />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Panel de administración protegido */}
                  <Route path="/admin" element={
                    <RutaProtegida>
                      <Admin />
                    </RutaProtegida>
                  } />
                  
                  {/* Normalización de Endpoints Antiguos */}
                  <Route path="/chismes" element={<Navigate to="/foro" replace />} />
                  
                  {/* Fallback de Seguridad Absoluta */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </LayoutEstructurado>
            </Router>
          </div>
        )}

        {/* 4. ESTILOS DE TRANSICIÓN PARA LA ENTRADA DE LA APP */}
        <style>{`
          .app-content-fade-in {
            animation: appReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes appReveal {
            0% { opacity: 0; transform: scale(0.98); filter: blur(4px); }
            100% { opacity: 1; transform: scale(1); filter: blur(0); }
          }
        `}</style>

      </AuthProvider>
    </TemaProvider>
  );
}