'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Menu, 
  Globe, 
  Crown, 
  ChevronRight, 
  X,
  CheckCircle2
} from 'lucide-react';

interface ReaderWalkthroughProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId: string; // The ID of the element to highlight
  position: 'bottom' | 'top' | 'left' | 'right';
}

export default function ReaderWalkthrough({ onComplete, isDarkMode }: ReaderWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: Step[] = [
    {
      id: 'theme',
      title: 'Choose Your Atmosphere',
      description: 'Switch between Light and Dark mode to find your perfect reading environment.',
      icon: isDarkMode ? <Sun className="w-6 h-6 text-gold" /> : <Moon className="w-6 h-6 text-gold" />,
      targetId: 'theme-toggle',
      position: 'bottom',
    },
    {
      id: 'toc',
      title: 'Navigate the Kingdom',
      description: 'Quickly jump to any chapter or section using the Table of Contents.',
      icon: <Menu className="w-6 h-6 text-gold" />,
      targetId: 'toc-toggle',
      position: 'bottom',
    },
    {
      id: 'translate',
      title: 'Universal Language',
      description: 'Translate the entire book into your preferred language with a single click.',
      icon: <Globe className="w-6 h-6 text-gold" />,
      targetId: 'language-dropdown',
      position: 'bottom',
    },
    {
      id: 'audio',
      title: 'The Royal Narrator',
      description: 'Experience the story through high-quality read-aloud. Perfect for hands-free immersion.',
      icon: <Crown className="w-6 h-6 text-gold" />,
      targetId: 'audio-toggle',
      position: 'bottom',
    },
  ];

  useEffect(() => {
    const updateTargetRect = () => {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dim Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Spotlight Effect (using SVG mask) */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.left - 8} 
                y={targetRect.top - 8} 
                width={targetRect.width + 16} 
                height={targetRect.height + 16} 
                rx="8" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" mask="url(#spotlight-mask)" />
      </svg>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              left: targetRect.left + (targetRect.width / 2),
              top: targetRect.bottom + 20
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-[101] w-80 -translate-x-1/2 pointer-events-auto"
          >
            <div className={`p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-onyx border-gold/30' : 'bg-ivory border-gold/40'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gold/10">
                  {step.icon}
                </div>
                <h3 className={`font-serif text-lg font-bold ${isDarkMode ? 'text-parchment' : 'text-charcoal'}`}>
                  {step.title}
                </h3>
              </div>
              
              <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`}>
                {step.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentStep ? 'w-4 bg-gold' : 'bg-gold/20'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleSkip}
                    className="text-xs text-gray-500 hover:text-gold transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-bold rounded-full hover:bg-gold/90 transition-all shadow-lg"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enter Kingdom
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Arrow pointing up */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t ${
              isDarkMode ? 'bg-onyx border-gold/30' : 'bg-ivory border-gold/40'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
