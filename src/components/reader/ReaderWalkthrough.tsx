'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Menu, 
  Globe, 
  Crown, 
  ChevronRight, 
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
  targetId: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom';
  arrowLeft: number;
}

export default function ReaderWalkthrough({ onComplete, isDarkMode }: ReaderWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const steps: Step[] = useMemo(() => [
    {
      id: 'toc',
      title: 'Navigate the Kingdom',
      description: 'Quickly jump to any chapter or section using the Table of Contents.',
      icon: <Menu className="w-6 h-6 text-gold" />,
      targetId: 'toc-toggle',
    },
    {
      id: 'translate',
      title: 'Universal Language',
      description: 'Translate the entire book into your preferred language with a single click.',
      icon: <Globe className="w-6 h-6 text-gold" />,
      targetId: 'language-dropdown',
    },
    {
      id: 'theme',
      title: 'Choose Your Atmosphere',
      description: 'Switch between Light and Dark mode to find your perfect reading environment.',
      icon: isDarkMode ? <Sun className="w-6 h-6 text-gold" /> : <Moon className="w-6 h-6 text-gold" />,
      targetId: 'theme-toggle',
    },
    {
      id: 'audio',
      title: 'The Royal Narrator',
      description: 'Experience the story through high-quality read-aloud. Perfect for hands-free immersion.',
      icon: <Crown className="w-6 h-6 text-gold" />,
      targetId: 'audio-toggle',
    },
  ], [isDarkMode]);

  const TOOLTIP_WIDTH = 320;
  const TOOLTIP_HEIGHT = 180;
  const ARROW_OFFSET = 20;
  const PADDING = 16;

  useEffect(() => {
    const updateTargetRect = () => {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [currentStep, steps]);

  const calculatePosition = (): TooltipPosition => {
    if (!targetRect) {
      return { top: 100, left: windowSize.width / 2 - TOOLTIP_WIDTH / 2, arrowPosition: 'top', arrowLeft: TOOLTIP_WIDTH / 2 };
    }

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const spaceBelow = windowSize.height - targetRect.bottom;
    const spaceAbove = targetRect.top;

    // Determine vertical position (prefer below, use above if not enough space)
    let top: number;
    let arrowPosition: 'top' | 'bottom';

    if (spaceBelow >= TOOLTIP_HEIGHT + ARROW_OFFSET + PADDING) {
      // Position below the target
      top = targetRect.bottom + ARROW_OFFSET;
      arrowPosition = 'top';
    } else if (spaceAbove >= TOOLTIP_HEIGHT + ARROW_OFFSET + PADDING) {
      // Position above the target
      top = targetRect.top - TOOLTIP_HEIGHT - ARROW_OFFSET;
      arrowPosition = 'bottom';
    } else {
      // Default to center of screen
      top = Math.max(PADDING, (windowSize.height - TOOLTIP_HEIGHT) / 2);
      arrowPosition = 'top';
    }

    // Determine horizontal position (center on target, but keep within bounds)
    let left = targetCenterX - TOOLTIP_WIDTH / 2;
    let arrowLeft = TOOLTIP_WIDTH / 2;

    // Clamp to screen bounds
    if (left < PADDING) {
      arrowLeft = targetCenterX - PADDING;
      left = PADDING;
    } else if (left + TOOLTIP_WIDTH > windowSize.width - PADDING) {
      const rightEdge = windowSize.width - PADDING - TOOLTIP_WIDTH;
      arrowLeft = targetCenterX - rightEdge;
      left = rightEdge;
    }

    // Ensure arrow stays within tooltip bounds
    arrowLeft = Math.max(20, Math.min(TOOLTIP_WIDTH - 20, arrowLeft));

    return { top, left, arrowPosition, arrowLeft };
  };

  const position = calculatePosition();

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
        className="absolute inset-0 bg-black/70 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Spotlight Effect */}
      {targetRect && (
        <div 
          className="absolute rounded-lg pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            zIndex: 101,
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[102] pointer-events-auto"
            style={{
              top: position.top,
              left: position.left,
              width: TOOLTIP_WIDTH,
            }}
          >
            {/* Arrow pointing to target */}
            {position.arrowPosition === 'top' && (
              <div 
                className={`absolute -top-2 w-4 h-4 rotate-45 border-l border-t ${
                  isDarkMode ? 'bg-[#0a0a0a] border-gold/30' : 'bg-ivory border-gold/40'
                }`}
                style={{ left: position.arrowLeft - 8 }}
              />
            )}

            <div className={`p-5 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-[#0a0a0a] border-gold/30' : 'bg-ivory border-gold/40'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gold/10 flex-shrink-0">
                  {step.icon}
                </div>
                <h3 className={`font-serif text-lg font-bold ${isDarkMode ? 'text-parchment' : 'text-charcoal'}`}>
                  {step.title}
                </h3>
              </div>
              
              <p className={`text-sm leading-relaxed mb-5 ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`}>
                {step.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentStep ? 'w-4 bg-gold' : 'w-1.5 bg-gold/20'
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
                        Begin Reading
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

            {/* Arrow pointing to target (bottom) */}
            {position.arrowPosition === 'bottom' && (
              <div 
                className={`absolute -bottom-2 w-4 h-4 rotate-45 border-r border-b ${
                  isDarkMode ? 'bg-[#0a0a0a] border-gold/30' : 'bg-ivory border-gold/40'
                }`}
                style={{ left: position.arrowLeft - 8 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
