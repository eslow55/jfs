import React, { createContext, useContext, useState, useEffect } from 'react';

const TemaContext = createContext();

export function TemaProvider({ children }) {
  // Revisamos si ya tenía una preferencia guardada, por defecto iniciamos en 'light' (Blanco)
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Inyectamos el atributo en la etiqueta <html> para que el CSS cambie las variables
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}