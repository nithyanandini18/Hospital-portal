export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="row-end">
          <button className="btn btn-ghost" onClick={onCancel}>Keep it</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
