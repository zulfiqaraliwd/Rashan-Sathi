import { AlertTriangle, HelpCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/** Replaces window.confirm(). `children` can hold extra fields (e.g. an input). */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, continue',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}) => {
  const Icon = variant === 'danger' ? AlertTriangle : HelpCircle;
  const tone =
    variant === 'danger'
      ? 'bg-red-50 text-red-600'
      : 'bg-primary-50 text-primary-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
        {message && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>
        )}
      </div>

      {children && <div className="mt-5 text-left">{children}</div>}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          fullWidth
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
