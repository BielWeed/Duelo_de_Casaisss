import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional: for future use if an explicit close button (e.g., 'X') is added
  children: React.ReactNode;
  title?: string; 
  modalClassName?: string;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  modalClassName = "bg-gradient-to-br from-purple-800 via-indigo-900 to-black p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-modalPanelEnter", // Use animate-modalPanelEnter
  contentClassName = "overflow-y-auto flex-grow flex flex-col"
}) => {
  if (!isOpen) return null;

  // Debounce or prevent rapid onClose calls if backdrop click is too sensitive
  const handleBackdropClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-30 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-modalBackdropFadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby="modal-description-content" // For better accessibility
    >
      <div 
        className={modalClassName}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to backdrop
      >
        {title && (
          <h2 
            id="modal-title" 
            className="text-2xl sm:text-3xl font-bold text-pink-400 mb-3 sm:mb-4 text-center border-b border-pink-500 border-opacity-50 pb-2 sm:pb-3 animate-fadeInUpShort"
            style={{animationDelay: '0.1s'}} // Slight delay for title animation after panel
          >
            {title}
          </h2>
        )}
        <div id="modal-description-content" className={contentClassName}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;