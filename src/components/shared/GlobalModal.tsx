'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type ModalType = 'alert' | 'confirm' | 'info' | 'success' | 'error';

interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const closeModal = () => setModal(null);

  const showAlert = (message: string, title = 'Notice') => {
    setModal({
      type: 'alert',
      title,
      message,
      confirmText: 'OK',
      onConfirm: closeModal,
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title = 'Confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    setModal({
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
      onCancel: closeModal,
    });
  };

  const showSuccess = (message: string, title = 'Success') => {
    setModal({
      type: 'success',
      title,
      message,
      confirmText: 'OK',
      onConfirm: closeModal,
    });
  };

  const showError = (message: string, title = 'Error') => {
    setModal({
      type: 'error',
      title,
      message,
      confirmText: 'OK',
      onConfirm: closeModal,
    });
  };

  const showInfo = (message: string, title = 'Information') => {
    setModal({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      onConfirm: closeModal,
    });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showSuccess, showError, showInfo }}>
      {children}
      {modal && <GlobalModal config={modal} onClose={closeModal} />}
    </ModalContext.Provider>
  );
}

function GlobalModal({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-400" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gold" />;
    }
  };

  const getIconBgColor = () => {
    switch (config.type) {
      case 'success':
        return 'bg-green-400/10 border-green-400/30';
      case 'error':
        return 'bg-red-400/10 border-red-400/30';
      case 'info':
        return 'bg-blue-400/10 border-blue-400/30';
      default:
        return 'bg-gold/10 border-gold/30';
    }
  };

  const getTitleColor = () => {
    switch (config.type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gold';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gold/30 rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-6 rounded-full border flex items-center justify-center ${getIconBgColor()}`}>
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-bold mb-3 text-center ${getTitleColor()}`}>
          {config.title}
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          {config.message}
        </p>

        {/* Buttons */}
        <div className={`flex gap-3 ${config.type === 'confirm' ? '' : 'justify-center'}`}>
          {config.type === 'confirm' ? (
            <>
              <button
                onClick={config.onConfirm}
                className="flex-1 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-lg font-semibold transition shadow-lg shadow-gold/20 hover:shadow-gold/30"
              >
                {config.confirmText}
              </button>
              <button
                onClick={config.onCancel}
                className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 px-6 py-3 rounded-lg font-semibold transition border border-[#333]"
              >
                {config.cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={config.onConfirm}
              className="bg-gold hover:bg-gold/90 text-black px-8 py-3 rounded-lg font-semibold transition shadow-lg shadow-gold/20 hover:shadow-gold/30"
            >
              {config.confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
