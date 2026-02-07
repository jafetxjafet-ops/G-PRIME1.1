
import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    target: '.tutorial-profile',
    title: 'MI PERFIL Y MENÚ',
    description: 'Aquí gestionas tu cuenta, estadísticas, amigos y el Reloj Multifunciones.',
    position: 'bottom'
  },
  {
    target: '.tutorial-exp',
    title: 'PROGRESO ÉLITE',
    description: 'Aquí verás tu progreso real basado en tu esfuerzo meritocrático.',
    position: 'bottom'
  },
  {
    target: '.tutorial-fab',
    title: 'INICIAR ENTRENAMIENTO',
    description: 'Toca aquí para iniciar tu sesión y elegir entre 150 ejercicios o deportes de combate.',
    position: 'left'
  },
  {
    target: '.tutorial-goals',
    title: 'TUS DESAFÍOS',
    description: 'Aquí verás los desafíos que te has propuesto vencer. ¡Mantén la disciplina!',
    position: 'top'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateSpotlight = () => {
      const step = TUTORIAL_STEPS[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        setSpotlightRect(element.getBoundingClientRect());
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!spotlightRect) return null;

  const stepInfo = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle 
              cx={spotlightRect.left + spotlightRect.width / 2} 
              cy={spotlightRect.top + spotlightRect.height / 2} 
              r={Math.max(spotlightRect.width, spotlightRect.height) / 1.5 + 10} 
              fill="black" 
              className="transition-all duration-500 ease-in-out"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Tutorial Tooltip */}
      <div 
        className="absolute z-10 w-72 p-8 glass-card rounded-[2.5rem] border-t-4 accent-border shadow-2xl transition-all duration-500 ease-in-out animate-in zoom-in-95"
        style={{
          left: Math.max(20, Math.min(window.innerWidth - 300, 
            stepInfo.position === 'left' ? spotlightRect.left - 300 : 
            stepInfo.position === 'right' ? spotlightRect.right + 20 : 
            spotlightRect.left + spotlightRect.width / 2 - 144
          )),
          top: Math.max(20, Math.min(window.innerHeight - 300,
            stepInfo.position === 'bottom' ? spotlightRect.bottom + 20 : 
            stepInfo.position === 'top' ? spotlightRect.top - 250 : 
            spotlightRect.top + spotlightRect.height / 2 - 100
          ))
        }}
      >
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#F5F5F5] mb-2">{stepInfo.title}</h3>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
          {stepInfo.description}
        </p>
        
        <div className="flex justify-between items-center">
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
             Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
           </span>
           <button 
            onClick={nextStep}
            className="accent-btn text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
           >
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'TERMINAR' : 'SIGUIENTE'}
           </button>
        </div>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-[0.4em] transition-all z-20"
      >
        SALTAR TUTORIAL
      </button>
    </div>
  );
};

export default TutorialOverlay;
