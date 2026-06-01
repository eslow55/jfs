import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './global.css';

// Contenedor principal del DOM
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se encontró el elemento raíz '#root'. Asegúrate de que existe en tu index.html");
}

const root = ReactDOM.createRoot(rootElement);

// Renderizado optimizado para producción
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);