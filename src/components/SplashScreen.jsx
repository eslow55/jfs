import React, { useState, useEffect } from 'react';
import logoLight from '../assets/images/logo-light.png';
import logoDark from '../assets/images/logo-dark.png';

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 1. Inicia la desaparición total justo cuando la explosión termina (2.9s)
    const fadeTimer = setTimeout(() => setIsFading(true), 2900);
    
    // 2. Desmonta el componente y libera el Home (3.5s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Generamos los indicadores del reloj (01 a 12)
  const clockNumbers = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className={`brutal-cinema-container ${isFading ? 'fade-out' : ''}`}>
      
      {/* ESCENARIO DEL RELOJ CINEMÁTICO */}
      <div className="netflix-theater">
        <div className="brutal-clock-machinery">
          
          {/* DIAL NUMÉRICO ENORME */}
          <div className="clock-dial">
            {clockNumbers.map((num, index) => (
              <span key={num} style={{ '--index': index }}>{num}</span>
            ))}
          </div>

          {/* LOGO CENTRAL AGRANDADO */}
          <div className="logo-core">
            <img src={logoDark} className="splash-logo light-only" alt="JFS" />
            <img src={logoLight} className="splash-logo dark-only" alt="JFS" />
          </div>

          {/* MANECILLAS MÁS LARGAS Y PESADAS */}
          <div className="brutal-hand hand-hour" />
          <div className="brutal-hand hand-minute" />
          <div className="brutal-hand hand-second" />

        </div>
      </div>

      <style>{`
        /* --- ATMÓSFERA ADAPTATIVA DE ALTA GAMA --- */
        .brutal-cinema-container {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-color: var(--bg-primary, #0f172a); 
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .brutal-cinema-container.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* --- PERSPECTIVA NETFLIX 3D --- */
        .netflix-theater {
          perspective: 1400px;
          transform-style: preserve-3d;
        }

        /* --- CONTENEDOR MAQUINARIA (Escala brutal aumentada) --- */
        .brutal-clock-machinery {
          position: relative;
          /* CAMBIO: De 360px a 500px para una presencia masiva en escritorio */
          width: 500px; height: 500px;
          max-width: 92vw; max-height: 92vw; /* Máximo aprovechamiento en móviles */
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          animation: netflixExplosion 3.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        /* --- DIAL NUMÉRICO GRANDE --- */
        .clock-dial {
          position: absolute;
          inset: 0;
          font-family: 'Courier New', Courier, monospace;
          font-weight: 900;
          /* CAMBIO: Tipografía un poco más grande y ruda */
          font-size: 16px; 
          color: var(--text-muted, #64748b);
        }

        .clock-dial span {
          position: absolute;
          top: 50%; left: 50%;
          /* CAMBIO: Radio expandido de -140px a -200px para abrir el círculo */
          transform: translate(-50%, -50%) 
                     rotate(calc(var(--index) * 30deg)) 
                     translateY(-200px) 
                     rotate(calc(var(--index) * -30deg));
        }

        /* --- LOGO CENTRAL ESCALADO --- */
        .logo-core {
          position: relative;
          z-index: 10;
          transform: translateZ(20px);
          animation: logoPulse 2s ease-in-out infinite alternate;
        }

        .splash-logo {
          /* CAMBIO: De 160px a 230px para que domine el centro del reloj */
          width: 230px;
          max-width: 45vw;
          height: auto;
          display: block;
        }

        /* --- MANECILLAS MAXIMIZADAS --- */
        .brutal-hand {
          position: absolute;
          bottom: 50%; left: 50%;
          transform-origin: bottom center;
          background-color: var(--text-main, #ffffff);
          will-change: transform;
        }

        /* Horario */
        .hand-hour {
          width: 8px; height: 100px; /* Más grueso y largo */
          margin-left: -4px;
          animation: spinHour 2.4s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        /* Minutero */
        .hand-minute {
          width: 5px; height: 150px; /* Mayor alcance visual */
          margin-left: -2.5px;
          opacity: 0.8;
          animation: spinMinute 2.4s cubic-bezier(0.5, 0, 0.1, 1) forwards;
        }

        /* Segundero Industrial */
        .hand-second {
          width: 2px; height: 180px; /* Roza casi el borde de los números */
          margin-left: -1px;
          background-color: var(--accent, #00cc88);
          animation: spinSecond 2.4s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
        }

        /* Centro del eje */
        .brutal-clock-machinery::after {
          content: '';
          position: absolute;
          width: 12px; height: 12px;
          background-color: var(--accent, #00cc88);
          border: 2.5px solid var(--bg-primary);
          border-radius: 50%;
          z-index: 15;
        }

        /* --- CONTROL DE LOGOS --- */
        .dark-only { display: none; }
        [data-theme="dark"] .dark-only, .dark .dark-only { display: block; }
        [data-theme="dark"] .light-only, .dark .light-only { display: none; }

        /* --- KEYFRAMES CINEMÁTICOS --- */
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
            /* Al ser más grande el contenedor, scale(35) devora el viewport con furia */
            transform: scale(35) translateZ(900px);
            filter: blur(30px) brightness(0.1);
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