// Label + input wrapper with an inline error message
export default function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  );
}
