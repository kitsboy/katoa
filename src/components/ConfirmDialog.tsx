import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-gray-300 text-sm sm:text-base mb-6 leading-relaxed">{message}</p>
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={loading} className="min-h-[44px]">
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading} className="min-h-[44px]" autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}