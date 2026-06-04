import React, { useState, useEffect } from 'react';
import logoLight from '../assets/images/logo-light.png';
import logoDark from '../assets/images/logo-dark.png';

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 2900);
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const clockNumbers = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className={`brutal-cinema-container ${isFading ? 'fade-out' : ''}`}>
      
      {/* LA MAQUINARIA REORGANIZADA DIRECTAMENTE EN EL ENTORNO 3D */}
      <div className="brutal-clock-machinery">
        
        {/* DIAL NUMÉRICO CON CENTRADO ULTRA-PRECISO */}
        <div className="clock-dial">
          {clockNumbers.map((num, index) => (
            <span key={num} style={{ '--index': index }}>{num}</span>
          ))}
        </div>

        {/* LOGO CENTRAL */}
        <div className="logo-core">
          <img src={logoDark} className="splash-logo light-only" alt="JFS" />
          <img src={logoLight} className="splash-logo dark-only" alt="JFS" />
        </div>

        {/* MANECILLAS MECÁNICAS */}
        <div className="brutal-hand hand-hour" />
        <div className="brutal-hand hand-minute" />
        <div className="brutal-hand hand-second" />

      </div>

      <style>{`
        /* --- CONTENEDOR RAÍZ FIJO --- */
        .brutal-cinema-container {
          position: fixed;
          inset: 0;
          width: 100%;
          /* CORRECCIÓN: dvh evita que las barras de direcciones de los celulares empujen el layout */
          height: 100dvh; 
          background-color: var(--bg-primary, #0f172a); 
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
          /* CORRECCIÓN: La perspectiva en la raíz fuerza el centro óptico en el centro de la pantalla */
          perspective: 1400px; 
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .brutal-cinema-container.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* --- ARQUITECTURA DEL RELOJ --- */
        .brutal-clock-machinery {
          position: relative;
          --clock-size: min(500px, 82vw); /* Reducido un 3% extra para dar aire de seguridad en móviles */
          width: var(--clock-size);
          height: var(--clock-size);
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          animation: netflixExplosion 3.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        /* --- DIAL NUMÉRICO GEOMÉTRICO --- */
        .clock-dial {
          position: absolute;
          inset: 0;
          font-family: 'Courier New', Courier, monospace;
          font-weight: 900;
          font-size: calc(var(--clock-size) * 0.035); 
          color: var(--text-muted, #64748b);
          transform-style: preserve-3d;
        }

        .clock-dial span {
          position: absolute;
          top: 50%; left: 50%;
          /* CORRECCIÓN: Forzamos una caja cuadrada simétrica para que ningún número se desplace por su ancho */
          width: calc(var(--clock-size) * 0.08);
          height: calc(var(--clock-size) * 0.08);
          display: flex;
          justify-content: center;
          align-items: center;
          
          /* Traslación pura basada en el centro exacto de la caja */
          transform: translate(-50%, -50%) 
                     rotate(calc(var(--index) * 30deg)) 
                     translateY(calc(var(--clock-size) * -0.41)) 
                     rotate(calc(var(--index) * -30deg));
        }

        /* --- LOGO CENTRAL --- */
        .logo-core {
          position: relative;
          z-index: 10;
          transform: translateZ(20px);
          animation: logoPulse 2s ease-in-out infinite alternate;
        }

        .splash-logo {
          width: calc(var(--clock-size) * 0.45);
          height: auto;
          display: block;
        }

        /* --- MANECILLAS --- */
        .brutal-hand {
          position: absolute;
          bottom: 50%; left: 50%;
          transform-origin: bottom center;
          background-color: var(--text-main, #ffffff);
          will-change: transform;
        }

        .hand-hour {
          width: calc(var(--clock-size) * 0.016); 
          height: calc(var(--clock-size) * 0.2); 
          margin-left: calc(var(--clock-size) * -0.008);
          animation: spinHour 2.4s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        .hand-minute {
          width: calc(var(--clock-size) * 0.010); 
          height: calc(var(--clock-size) * 0.3); 
          margin-left: calc(var(--clock-size) * -0.005);
          opacity: 0.8;
          animation: spinMinute 2.4s cubic-bezier(0.5, 0, 0.1, 1) forwards;
        }

        .hand-second {
          width: calc(var(--clock-size) * 0.004); 
          height: calc(var(--clock-size) * 0.36); 
          margin-left: calc(var(--clock-size) * -0.002);
          background-color: var(--accent, #00cc88);
          animation: spinSecond 2.4s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
        }

        /* Eje mecánico central */
        .brutal-clock-machinery::after {
          content: '';
          position: absolute;
          width: calc(var(--clock-size) * 0.024);
          height: calc(var(--clock-size) * 0.024);
          background-color: var(--accent, #00cc88);
          border: calc(var(--clock-size) * 0.005) solid var(--bg-primary);
          border-radius: 50%;
          z-index: 15;
        }

        /* --- THEME SWAPPER --- */
        .dark-only { display: none; }
        [data-theme="dark"] .dark-only, .dark .dark-only { display: block; }
        [data-theme="dark"] .light-only, .dark .light-only { display: none; }

        /* --- FÍSICAS DE ANIMACIÓN --- */
        @keyframes spinHour {
          0% { transform: rotate(0deg); }
          70% { transform: rotate(720deg); }
          100% { transform: rotate(810deg); }
        }

        @keyframes spinMinute {
          0% { transform: rotate(0deg); }
          70% { transform: rotate(2160deg); }
          100% { transform: rotate(2340deg); }
        }

        @keyframes spinSecond {
          0% { transform: rotate(0deg); }
          72% { transform: rotate(5760deg); }
          85% { transform: rotate(5760deg); }
          100% { transform: rotate(5880deg); }
        }

        @keyframes netflixExplosion {
          0% {
            opacity: 0;
            transform: scale(0.5) translateZ(-200px);
            filter: blur(10px);
          }
          12% {
            opacity: 1;
            transform: scale(1) translateZ(0);
            filter: blur(0px);
          }
          70% {
            transform: scale(1.04) translateZ(50px);
            filter: blur(0px);
            opacity: 1;
          }
          80% {
            transform: scale(1.02) translateZ(40px);
            filter: blur(0.5px);
            opacity: 1;
          }
          100% {
            /* Explosión expansiva perfectamente equilibrada */
            transform: scale(45) translateZ(1000px);
            filter: blur(32px) brightness(0.1);
            opacity: 0;
          }
        }

        @keyframes logoPulse {
          0% { transform: translateZ(20px) scale(0.97); }
          100% { transform: translateZ(35px) scale(1.03); }
        }
      `}</style>
    </div>
  );
}