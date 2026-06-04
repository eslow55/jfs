import React, { useState, useEffect } from 'react';
import logoLight from '../assets/images/logo-light.png';
import logoDark from '../assets/images/logo-dark.png';

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 1. Inicia el desvanecimiento de la pantalla completa cuando el zoom termina (2.8s)
    const fadeTimer = setTimeout(() => setIsFading(true), 2800);
    
    // 2. Desmonta el componente y revela el Home de inmediato (3.4s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`netflix-container ${isFading ? 'fade-out' : ''}`}>
      {/* Aura de luz trasera que se adapta al color del tema */}
      <div className="netflix-glow" />

      <div className="netflix-theater">
        <img src={logoDark} className="splash-logo light-only" alt="JFS" />
        <img src={logoLight} className="splash-logo dark-only" alt="JFS" />
      </div>

      <style>{`
        /* --- ATMÓSFERA ADAPTATIVA --- */
        .netflix-container {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          /* CORRECCIÓN: Usa el fondo dinámico de tu proyecto en vez de negro fijo */
          background-color: var(--bg-primary, #0f172a); 
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .netflix-container.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .netflix-theater {
          position: relative;
          z-index: 10;
          perspective: 1200px; /* Espacio 3D real */
          transform-style: preserve-3d;
        }

        /* --- EL LOGO CINEMÁTICO --- */
        .splash-logo {
  width: 280px;          /* Tamaño ideal y nítido para monitores y laptops */
  max-width: 65vw;       /* En celulares, el logo se encoge para ocupar máximo el 65% del ancho de la pantalla */
  height: auto;
  display: block;
  opacity: 0;
  animation: netflixIntro 3.3s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
  will-change: transform, opacity, filter;
}

        /* --- DESTELLO DE LUZ ADAPTATIVO (Glow) --- */
        /* Por defecto en modo claro: Destello sutil oscuro para dar contraste */
        .netflix-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 0, 0, 0.03) 0%, transparent 70%);
          z-index: 5;
          pointer-events: none;
          animation: glowPulse 2.5s ease-in-out infinite alternate;
        }

        /* En modo oscuro: Destello de luz blanca/verde premium */
        [data-theme="dark"] .netflix-glow, .dark .netflix-glow {
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
        }

        /* --- CONTROL DE VISIBILIDAD DE LOGOS --- */
        .dark-only { display: none; }
        [data-theme="dark"] .dark-only, .dark .dark-only { display: block; }
        [data-theme="dark"] .light-only, .dark .light-only { display: none; }

        /* --- CORE DE LA ANIMACIÓN NETFLIX --- */
        @keyframes netflixIntro {
          0% {
            opacity: 0;
            transform: scale(0.4) translateZ(-150px);
            filter: blur(10px) brightness(1.2);
          }
          10% {
            opacity: 1;
            transform: scale(1) translateZ(0);
            filter: blur(0px) brightness(1);
          }
          65% {
            opacity: 1;
            transform: scale(1.08) translateZ(40px);
            filter: blur(0px) brightness(1);
          }
          82% {
            opacity: 1;
            filter: blur(1px);
          }
          100% {
            opacity: 0;
            /* El logo se expande e interactúa pasando la cámara */
            transform: scale(40) translateZ(600px);
            filter: blur(16px) brightness(0.5);
          }
        }

        @keyframes glowPulse {
          0% { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}