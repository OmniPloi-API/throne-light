'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Send, X, FileText, User, Mail, MessageSquare, Upload, File } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Vault Door Handle SVG Component
const VaultHandle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer ring */}
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" opacity="0.6" />
    {/* Inner ring */}
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    {/* Handle spokes */}
    <line x1="50" y1="15" x2="50" y2="35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="65" x2="50" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="65" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    {/* Center hub */}
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.6" />
  </svg>
);

export default function GateSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    genre: '',
    synopsis: '',
    sampleChapter: '',
  });
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      setManuscriptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('title', formData.title);
      submitData.append('genre', formData.genre);
      submitData.append('synopsis', formData.synopsis);
      submitData.append('sampleChapter', formData.sampleChapter);
      
      if (manuscriptFile) {
        submitData.append('manuscript', manuscriptFile);
      }
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: submitData,
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', title: '', genre: '', synopsis: '', sampleChapter: '' });
        setManuscriptFile(null);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    {/* Submission Modal */}
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-charcoal/90 backdrop-blur-sm p-4 pt-16 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-onyx border border-gold/30 rounded-2xl shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-b from-charcoal to-onyx px-6 py-8 text-center border-b border-gold/20 rounded-t-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-parchment/40 hover:text-parchment transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-gold text-4xl mb-4"
              >
                <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12" />
              </motion.div>
              
              <h2 className="font-serif text-2xl md:text-3xl text-parchment mb-2">
                Submit Your Manuscript
              </h2>
              <p className="text-parchment/60 text-sm">
                The Gate has opened. Present your work for consideration.
              </p>
            </div>

            {/* Form Content */}
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-parchment mb-2">Submission Received</h3>
                <p className="text-parchment/60">Your manuscript has been delivered to the altar. We will review it with care.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Author Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Your name or pen name"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Manuscript Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Title of your work"
                    />
                  </div>
                  
                  {/* Genre */}
                  <div>
                    <label className="block text-parchment/60 text-sm mb-2">Genre / Category</label>
                    <select
                      required
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment focus:border-gold/50 focus:outline-none transition-colors"
                    >
                      <option value="">Select genre...</option>
                      <option value="prophetic">Prophetic / Spiritual</option>
                      <option value="devotional">Devotional</option>
                      <option value="memoir">Memoir / Testimony</option>
                      <option value="self-help">Self-Help / Empowerment</option>
                      <option value="poetry">Poetry</option>
                      <option value="fiction">Fiction</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block text-parchment/60 text-sm mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Synopsis (200-500 words)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your book and its divine purpose..."
                  />
                </div>

                {/* Sample Chapter */}
                <div>
                  <label className="block text-parchment/60 text-sm mb-2">Sample Chapter (First 1000 words)</label>
                  <textarea
                    rows={6}
                    value={formData.sampleChapter}
                    onChange={(e) => setFormData({ ...formData, sampleChapter: e.target.value })}
                    className="w-full bg-charcoal border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                    placeholder="Paste the first chapter or a compelling excerpt..."
                  />
                </div>

                {/* Manuscript Upload */}
                <div>
                  <label className="block text-parchment/60 text-sm mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Manuscript (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="manuscript-upload"
                    />
                    <label
                      htmlFor="manuscript-upload"
                      className={`flex items-center justify-center gap-3 w-full bg-charcoal border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors ${
                        manuscriptFile 
                          ? 'border-gold/50 bg-gold/5' 
                          : 'border-gold/20 hover:border-gold/40'
                      }`}
                    >
                      {manuscriptFile ? (
                        <div className="flex items-center gap-3 text-gold">
                          <File className="w-6 h-6" />
                          <div className="text-left">
                            <p className="text-sm font-medium">{manuscriptFile.name}</p>
                            <p className="text-xs text-parchment/50">
                              {(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setManuscriptFile(null);
                            }}
                            className="ml-auto text-parchment/40 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                          <p className="text-parchment/60 text-sm">
                            Drop your manuscript here or click to browse
                          </p>
                          <p className="text-parchment/30 text-xs mt-1">
                            PDF or Word document, max 10MB
                          </p>
                        </div>
                      )}
                    </label>
                    {uploadError && (
                      <p className="text-red-400 text-xs mt-2">{uploadError}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-royal inline-flex items-center justify-center gap-2 py-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit to Throne Light</span>
                    </>
                  )}
                </motion.button>

                <p className="text-parchment/30 text-xs text-center mt-4">
                  By submitting, you confirm this is your original work and grant Throne Light Publishing permission to review it.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <section className="relative bg-charcoal py-24 md:py-32">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,169,97,0.03)_0%,_transparent_50%)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-gold/40 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.gate.label}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-parchment mb-8">
            {dict.gate.headline}
          </h2>
        </motion.div>

        {/* Vault Door Handle - Interactive */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <motion.div
            className="relative inline-block cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => setIsModalOpen(true)}
          >
            {/* Vault Handle Container */}
            <motion.div
              animate={{ 
                rotate: isHovered ? 90 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-28 h-28 rounded-full bg-onyx/80 border-2 border-gold/30 flex items-center justify-center shadow-lg relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <motion.div
                animate={{ opacity: isHovered ? 0.3 : 0 }}
                className="absolute inset-0 bg-gold rounded-full blur-md"
              />
              <VaultHandle className="w-16 h-16 text-gold/60 relative z-10" />
            </motion.div>
            
            {/* Decorative rings */}
            <motion.div 
              animate={{ scale: isHovered ? 1.2 : 1, opacity: isHovered ? 0.3 : 0.1 }}
              transition={{ duration: 0.4 }}
              className="absolute -inset-4 border border-gold rounded-full" 
            />
            <motion.div 
              animate={{ scale: isHovered ? 1.3 : 1, opacity: isHovered ? 0.2 : 0.05 }}
              transition={{ duration: 0.5 }}
              className="absolute -inset-8 border border-gold rounded-full" 
            />

            {/* Hover prompt text */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2"
                >
                  <p className="text-xs font-sans tracking-[0.25em] uppercase text-gold/80">
                    Click to submit
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="font-serif text-2xl md:text-3xl text-parchment mb-4">
            {dict.gate.status}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-parchment/60 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            {dict.gate.description}
          </p>
        </motion.div>

        {/* Clear Boundary */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-block bg-onyx/50 border border-parchment/10 rounded-lg px-8 py-4">
            <p className="text-parchment/40 text-sm">
              <span className="text-gold">{dict.gate.notice}</span>
            </p>
          </div>
        </motion.div>

        {/* Decorative Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/20" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/THRONELIGHT-LOGO.png" alt="Throne Light Publishing" className="w-8 h-8 opacity-30" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/20" />
        </motion.div>
      </div>
    </section>
    </>
  );
}
