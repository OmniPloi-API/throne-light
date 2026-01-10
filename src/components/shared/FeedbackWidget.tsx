'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Camera, Mic, MicOff, X, Send, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePathname } from 'next/navigation';

interface FeedbackWidgetProps {
  enabled?: boolean;
}

export default function FeedbackWidget({ enabled = true }: FeedbackWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [partnerName, setPartnerName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackNumber, setFeedbackNumber] = useState('');
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  const checkVisibility = useCallback(async () => {
    try {
      const res = await fetch('/api/feedback/settings');
      if (res.ok) {
        const data = await res.json();
        setIsVisible(!!data.feedbackWidgetEnabled);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkVisibility();
  }, [checkVisibility, pathname]);

  useEffect(() => {
    const handleFocus = () => {
      checkVisibility();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkVisibility();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVisibility]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            transcriptRef.current += finalTranscript;
            setFeedback(transcriptRef.current);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // Restart if still recording
            try {
              recognitionRef.current.start();
            } catch (e) {
              setIsRecording(false);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    setIsOpen(false); // Close widget temporarily for clean screenshot
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Wait for widget to close
    
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      });
      
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      setScreenshot(base64);
      setIsOpen(true);
    } catch (err) {
      console.error('Screenshot failed:', err);
      setError('Failed to capture screenshot');
      setIsOpen(true);
    }
    
    setIsCapturing(false);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      transcriptRef.current = feedback; // Preserve existing text
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!partnerName.trim() || !feedback.trim()) {
      setError('Please enter your name and feedback');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partnerName.trim(),
          pageUrl: window.location.href,
          sectionName: document.querySelector('[data-section]')?.getAttribute('data-section') || undefined,
          screenshotBase64: screenshot || undefined,
          rawFeedback: feedback.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFeedbackNumber(data.feedbackNumber);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFeedback('');
    setScreenshot(null);
    setIsSubmitted(false);
    setFeedbackNumber('');
    setError('');
    transcriptRef.current = '';
  };

  if (!enabled || !isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gold hover:bg-gold/90 text-charcoal p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="Submit Feedback"
          >
            <MessageSquarePlus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Capturing Overlay */}
      {isCapturing && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="text-charcoal font-medium">Capturing screenshot...</span>
          </div>
        </div>
      )}

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-charcoal border border-gold/30 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gold/10 border-b border-gold/20 px-4 py-3 flex items-center justify-between">
              <h3 className="font-serif text-gold text-lg">Request Changes</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-parchment/60 hover:text-parchment transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isSubmitted ? (
                // Success State
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-serif text-xl text-parchment mb-2">Feedback Submitted!</h4>
                  <p className="text-parchment/70 text-sm mb-4">
                    Your request has been recorded as<br />
                    <span className="text-gold font-mono">{feedbackNumber}</span>
                  </p>
                  <button
                    onClick={resetForm}
                    className="text-gold hover:text-gold/80 text-sm underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                // Form
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded px-3 py-2 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Partner Name */}
                  <div>
                    <label className="block text-parchment/60 text-xs uppercase tracking-wide mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-onyx border border-gold/20 rounded px-3 py-2 text-parchment placeholder:text-parchment/40 focus:border-gold/50 focus:outline-none"
                    />
                  </div>

                  {/* Screenshot Preview */}
                  {screenshot && (
                    <div className="relative">
                      <img
                        src={screenshot}
                        alt="Screenshot"
                        className="w-full h-32 object-cover rounded border border-gold/20"
                      />
                      <button
                        onClick={() => setScreenshot(null)}
                        className="absolute top-2 right-2 bg-charcoal/80 text-parchment p-1 rounded-full hover:bg-charcoal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Feedback Text */}
                  <div>
                    <label className="block text-parchment/60 text-xs uppercase tracking-wide mb-1">
                      Describe the changes you want
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what changes you'd like to see... You can type or use the mic button to speak."
                      rows={4}
                      className="w-full bg-onyx border border-gold/20 rounded px-3 py-2 text-parchment placeholder:text-parchment/40 focus:border-gold/50 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={captureScreenshot}
                      disabled={isCapturing}
                      className="flex-1 flex items-center justify-center gap-2 bg-onyx hover:bg-onyx/80 border border-gold/20 text-parchment py-2 rounded transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Screenshot</span>
                    </button>
                    <button
                      onClick={toggleRecording}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition ${
                        isRecording
                          ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                          : 'bg-onyx hover:bg-onyx/80 border border-gold/20 text-parchment'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span className="text-sm">Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Dictate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-300 text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Listening... speak your feedback
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !partnerName.trim() || !feedback.trim()}
                    className="w-full bg-gold hover:bg-gold/90 disabled:bg-gold/30 disabled:cursor-not-allowed text-charcoal font-semibold py-3 rounded flex items-center justify-center gap-2 transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
