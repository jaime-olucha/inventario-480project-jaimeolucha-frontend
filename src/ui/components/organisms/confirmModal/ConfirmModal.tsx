interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ title, message, confirmLabel = "Confirmar", loading = false, onConfirm, onCancel }: Props) => {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-modal_title">{title}</h2>
        <p className="confirm-modal_message">{message}</p>
        <div className="confirm-modal_actions">
          <button className="confirm-modal_btn confirm-modal_btn--cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="confirm-modal_btn confirm-modal_btn--confirm" onClick={onConfirm} disabled={loading}>
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
