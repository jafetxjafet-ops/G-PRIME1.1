
import React, { useState, useEffect } from 'react';

export interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface SectionTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
}

const SectionTutorial: React.FC<SectionTutorialProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateSpotlight = () => {
      const step = steps[currentStep];
      if (step.position === 'center') {
        setSpotlightRect(null);
        return;
      }
      const element = document.querySelector(step.target);
      if (element) {
        setSpotlightRect(element.getBoundingClientRect());
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStep, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const stepInfo = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden">
      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="section-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <circle 
                cx={spotlightRect.left + spotlightRect.width / 2} 
                cy={spotlightRect.top + spotlightRect.height / 2} 
                r={Math.max(spotlightRect.width, spotlightRect.height) / 1.5 + 20} 
                fill="black" 
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#section-spotlight-mask)" />
      </svg>

      {/* Tooltip */}
      <div 
        className="absolute z-10 w-72 p-8 glass-card rounded-[2.5rem] border-t-4 accent-border shadow-2xl transition-all duration-500 ease-in-out animate-in zoom-in-95"
        style={spotlightRect ? {
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
        } : {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="mb-4">
           <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#F5F5F5] leading-tight">{stepInfo.title}</h3>
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">by Ludwig Feria</p>
        </div>
        
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
          {stepInfo.description}
        </p>
        
        <div className="flex justify-between items-center">
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
             {currentStep + 1} / {steps.length}
           </span>
           <button 
            onClick={nextStep}
            className="accent-btn text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
           >
            {currentStep === steps.length - 1 ? 'ENTENDIDO' : 'SIGUIENTE'}
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

export default SectionTutorial;
