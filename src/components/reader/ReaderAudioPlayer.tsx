'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ThumbsDown,
  X,
  Loader2,
  ListMusic,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

import { useAudioSync, ParagraphData } from '@/hooks/useAudioSync';

// Custom "person speaking" icon - profile with sound waves from mouth
const SpeakingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Head profile */}
    <path d="M12 2C9.5 2 7 4 7 7c0 2 1 3.5 2 4.5L7 14v3c0 1 1 2 2 2h2c1 0 2-1 2-2v-2" />
    <circle cx="10" cy="7" r="3" />
    {/* Sound waves from mouth area */}
    <path d="M15 10c1 0.5 1.5 1.5 1.5 2.5s-0.5 2-1.5 2.5" />
    <path d="M18 8c1.5 1 2.5 3 2.5 4.5s-1 3.5-2.5 4.5" />
  </svg>
);

interface ReaderAudioPlayerProps {
  paragraphs: ParagraphData[];
  bookId: string;
  languageCode?: string;
  voiceId?: string;
  isDarkMode?: boolean;
  onReady?: (controls: { skipTo: (index: number) => void }) => void;
}

const ISSUE_TYPES = [
  { value: 'wrong_language', label: 'Wrong Language' },
  { value: 'glitch', label: 'Audio Glitch/Static' },
  { value: 'robotic', label: 'Sounds Too Robotic' },
  { value: 'mispronunciation', label: 'Mispronunciation' },
  { value: 'wrong_speed', label: 'Wrong Speed' },
  { value: 'other', label: 'Other Issue' },
];

export default function ReaderAudioPlayer({
  paragraphs,
  bookId,
  languageCode = 'en',
  voiceId = 'shimmer',
  isDarkMode = true,
  onReady,
}: ReaderAudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [issueComment, setIssueComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const {
    isPlaying,
    isLoading,
    activeParagraphIndex,
    currentVersion,
    autoScrollEnabled,
    error,
    totalParagraphs,
    togglePlay,
    pause,
    skipForward,
    skipBackward,
    skipTo,
    toggleAutoScroll,
    reportIssue,
    audioRef,
  } = useAudioSync(paragraphs, {
    bookId,
    languageCode,
    voiceId,
  });

  // Expose controls to parent component and set up click handlers
  useEffect(() => {
    // Call onReady with skipTo function
    onReady?.({ skipTo });

    // Add click handlers to all paragraph elements
    const handleParagraphClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const id = target.id;
      if (id && id.startsWith('para-')) {
        // Extract index from element ID (format: para-{sectionId}-{index})
        const parts = id.split('-');
        const index = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(index)) {
          skipTo(index);
        }
      }
    };

    // Add click handlers to all paragraphs
    paragraphs.forEach((p) => {
      const element = document.getElementById(p.elementId);
      if (element) {
        element.classList.add('audio-clickable-paragraph');
        element.addEventListener('click', handleParagraphClick);
      }
    });

    // Cleanup
    return () => {
      paragraphs.forEach((p) => {
        const element = document.getElementById(p.elementId);
        if (element) {
          element.classList.remove('audio-clickable-paragraph');
          element.removeEventListener('click', handleParagraphClick);
        }
      });
    };
  }, [paragraphs, skipTo, onReady]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, audioRef]);

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!selectedIssue) return;

    setIsSubmitting(true);
    const result = await reportIssue(selectedIssue, issueComment);
    setIsSubmitting(false);

    if (result) {
      setReportSuccess(result.message);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(null);
        setSelectedIssue('');
        setIssueComment('');
      }, 2000);
    }
  };

  // Open report modal
  const handleThumbsDown = () => {
    pause();
    setShowReportModal(true);
  };

  const bgColor = isDarkMode ? 'bg-onyx/95' : 'bg-ivory/95';
  const textColor = isDarkMode ? 'text-parchment' : 'text-charcoal';
  const borderColor = isDarkMode ? 'border-gold/20' : 'border-charcoal/20';

  return (
    <>
      {/* Floating Audio Player */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${bgColor} backdrop-blur-lg border ${borderColor} rounded-2xl shadow-2xl`}
      >
        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gold/10"
            >
              <div className="p-4 space-y-3">
                {/* Progress Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className={`${textColor} opacity-60`}>
                    Paragraph {activeParagraphIndex + 1} of {totalParagraphs}
                  </span>
                  <span className="text-gold text-xs">
                    v{currentVersion}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gold/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((activeParagraphIndex + 1) / totalParagraphs) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Auto-scroll Toggle */}
                <button
                  onClick={toggleAutoScroll}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    autoScrollEnabled ? 'text-gold' : `${textColor} opacity-50`
                  }`}
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Auto-scroll {autoScrollEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Controls */}
        <div className="flex items-center gap-2 p-3">
          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg hover:bg-gold/10 transition-colors ${textColor}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {/* Skip Back */}
          <button
            onClick={skipBackward}
            disabled={activeParagraphIndex === 0}
            className={`p-2 rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-30 ${textColor}`}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="p-3 bg-gold hover:bg-gold/90 text-onyx rounded-full transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            disabled={activeParagraphIndex >= totalParagraphs - 1}
            className={`p-2 rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-30 ${textColor}`}
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg hover:bg-gold/10 transition-colors ${textColor}`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* Thumbs Down (only visible when playing) */}
          <AnimatePresence>
            {isPlaying && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleThumbsDown}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                title="Report Issue"
              >
                <ThumbsDown className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3"
            >
              <p className="text-red-400 text-xs">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Report Issue Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md ${bgColor} border ${borderColor} rounded-2xl p-6 shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {reportSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`${textColor} font-medium`}>{reportSuccess}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`font-serif text-xl ${textColor}`}>
                      Report Audio Issue
                    </h3>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className={`p-2 hover:bg-gold/10 rounded-lg transition-colors ${textColor}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Issue Type Selection */}
                    <div>
                      <label className={`block text-sm mb-2 ${textColor} opacity-70`}>
                        What&apos;s the issue?
                      </label>
                      <select
                        value={selectedIssue}
                        onChange={(e) => setSelectedIssue(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} focus:border-gold outline-none`}
                      >
                        <option value="">Select an issue...</option>
                        {ISSUE_TYPES.map((issue) => (
                          <option key={issue.value} value={issue.value}>
                            {issue.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optional Comment */}
                    <div>
                      <label className={`block text-sm mb-2 ${textColor} opacity-70`}>
                        Additional details (optional)
                      </label>
                      <textarea
                        value={issueComment}
                        onChange={(e) => setIssueComment(e.target.value)}
                        placeholder="Describe the issue..."
                        rows={3}
                        className={`w-full p-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} placeholder:opacity-40 focus:border-gold outline-none resize-none`}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleReportSubmit}
                      disabled={!selectedIssue || isSubmitting}
                      className="w-full py-3 bg-gold hover:bg-gold/90 text-onyx font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit & Try Next Version'
                      )}
                    </button>

                    <p className={`text-xs text-center ${textColor} opacity-50`}>
                      We&apos;ll try a slightly different version of this audio.
                      {currentVersion >= 3 && ' (Max versions reached - feedback will be reviewed by admin)'}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for active paragraph highlight */}
      <style jsx global>{`
        .audio-active-paragraph {
          background-color: rgba(212, 175, 55, 0.15) !important;
          border-left: 3px solid rgba(212, 175, 55, 0.8);
          padding-left: 12px;
          margin-left: -15px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .audio-playing-now {
          background-color: rgba(212, 175, 55, 0.2) !important;
        }
        
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        
        .audio-playing-indicator {
          animation: pulse-gold 2s infinite;
        }
        
        /* Make paragraphs clickable when audio player is active */
        .audio-clickable-paragraph {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .audio-clickable-paragraph:hover {
          background-color: rgba(212, 175, 55, 0.08);
        }
      `}</style>
    </>
  );
}
