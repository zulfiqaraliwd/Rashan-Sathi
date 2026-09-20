import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Portal → always sits above the sticky navbar, whatever page it's opened from.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex animate-fade items-end justify-center bg-primary-950/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${sizes[size] ?? sizes.md} max-h-[90dvh] animate-pop overflow-y-auto rounded-3xl bg-white shadow-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className={title ? 'px-6 pb-6 pt-2' : 'p-6'}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
