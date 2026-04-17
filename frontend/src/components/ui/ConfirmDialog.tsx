import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Подтверждение", message, loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-600 text-sm mb-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Отмена</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Удаление..." : "Удалить"}
        </button>
      </div>
    </Modal>
  );
}
