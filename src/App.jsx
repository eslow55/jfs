import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TemaProvider } from './contexts/TemaContext';

// Importación de Componentes de Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Importación de Páginas
import Home from './pages/Home';
import Noticias from './pages/Noticias';
import Chismes from './pages/Chismes';
import Galeria from './pages/Galeria';
import Login from './pages/Login';
import Admin from './components/admin/Admin';

// Componente para proteger rutas de administración
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  
  if (cargando) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <Router>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--bg-primary)',
            transition: 'background-color 0.3s ease' 
          }}>
            
            <Navbar />
            
            <main style={{ flex: 1, padding: '20px 0 60px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/chismes" element={<Chismes />} />
                <Route path="/galeria" element={<Galeria />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={
                  <RutaProtegida>
                    <Admin />
                  </RutaProtegida>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            
            <Footer />
            
          </div>
        </Router>
      </AuthProvider>
    </TemaProvider>
  );
}