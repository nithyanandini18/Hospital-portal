import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors, deleteDoctor } from "../services/api";
import { SERVER_ERROR, initials } from "../utils";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  async function loadDoctors() {
    try {
      setDoctors(await getDoctors());
      setError("");
    } catch {
      setError(SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  async function handleDelete() {
    try {
      await deleteDoctor(toDelete.id);
      setToDelete(null);
      loadDoctors();
    } catch {
      setError("Couldn't delete that doctor. Try again.");
      setToDelete(null);
    }
  }

  const query = search.trim().toLowerCase();
  const visible = doctors.filter((d) => {
    const matches =
      d.specialization.toLowerCase().includes(query) || d.name.toLowerCase().includes(query);
    return matches && (!onlyAvailable || d.available);
  });

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Doctors</h1>
          <p className="muted">{doctors.length} on the roster</p>
        </div>
        <Link to="/doctors/new" className="btn btn-primary">Add doctor</Link>
      </header>

      <div className="toolbar">
        <input
          className="input grow"
          placeholder="Search by specialization, e.g. Cardiology"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="check">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Available only
        </label>
      </div>

      <div className="chips">
        {specializations.map((s) => (
          <button
            key={s}
            className={`chip ${query === s.toLowerCase() ? "chip-on" : ""}`}
            onClick={() => setSearch(query === s.toLowerCase() ? "" : s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="empty">Loading doctors…</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="empty">No doctors match "{search}". Try another specialization.</p>
      )}

      <div className="card-grid">
        {visible.map((doctor) => (
          <article key={doctor.id} className={`card ${doctor.available ? "" : "card-off"}`}>
            <div className="card-top">
              <span className="avatar">{initials(doctor.name)}</span>
              <div>
                <h3>{doctor.name}</h3>
                <p className="muted">{doctor.specialization} · {doctor.experience} yrs</p>
              </div>
            </div>
            <p className="small">{doctor.phone}<br />{doctor.email}</p>

            {doctor.available ? (
              <p className="tag tag-ok">Available for appointments</p>
            ) : (
              <p className="tag tag-off">Unavailable right now. New appointments can't be booked.</p>
            )}

            <div className="row">
              {doctor.available ? (
                <Link className="btn btn-primary btn-sm" to={`/appointments/new?doctorId=${doctor.id}`}>Book</Link>
              ) : (
                <button className="btn btn-sm" disabled>Book</button>
              )}
              <Link className="btn btn-sm" to={`/doctors/${doctor.id}/edit`}>Edit</Link>
              <button className="btn btn-sm btn-ghost-danger" onClick={() => setToDelete(doctor)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this doctor?"
          message={`${toDelete.name} will be removed from the roster. This can't be undone.`}
          confirmLabel="Delete doctor"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
