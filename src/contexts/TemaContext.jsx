import React, { createContext, useContext, useState, useEffect } from 'react';

const TemaContext = createContext();

export function useTema() {
  const context = useContext(TemaContext);
  if (!context) {
    throw new Error('useTema debe ser utilizado estrictamente dentro de un TemaProvider');
  }
  return context;
}

export function TemaProvider({ children }) {
  // Inicialización inteligente y síncrona para evitar parpadeos visuales en producción
  const [tema, setTema] = useState(() => {
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado) return temaGuardado;

    // Si no hay configuración previa, consultamos las media-queries del sistema operativo
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefiereOscuro ? 'dark' : 'light';
  });

  // Efecto que impacta los cambios estructurales en el DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Transición suave controlada para que el cambio de colores no sea tosco
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
    
    root.setAttribute('data-theme', tema);
    localStorage.setItem('theme', tema);
  }, [tema]);

  // Escuchar si el usuario cambia el tema nativo de su PC/Celular mientras navega
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const manejarCambioSistema = (e) => {
      // Solo actualiza si el usuario no ha forzado una preferencia manual en el localStorage
      if (!localStorage.getItem('theme')) {
        setTema(e.matches ? 'dark' : 'light');
      }
    };

    // Soporte moderno y retrocompatible para eventos de Media Query
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', manejarCambioSistema);
    } else {
      mediaQuery.addListener(manejarCambioSistema); // Fallback navegadores antiguos
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', manejarCambioSistema);
      } else {
        mediaQuery.removeListener(manejarCambioSistema);
      }
    };
  }, []);

  const alternarTema = () => {
    setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTemaManual = (nuevoTema) => {
    if (nuevoTema === 'light' || nuevoTema === 'dark') {
      setTema(nuevoTema);
    }
  };

  const value = {
    tema,
    isOscuro: tema === 'dark',
    alternarTema,
    setTemaManual
  };

  return (
    <TemaContext.Provider value={value}>
      {children}
    </TemaContext.Provider>
  );
}