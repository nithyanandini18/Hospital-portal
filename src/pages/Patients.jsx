import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients, deletePatient } from "../services/api";
import { SERVER_ERROR } from "../utils";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);

  async function loadPatients() {
    try {
      setPatients(await getPatients());
      setError("");
    } catch {
      setError(SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function handleDelete() {
    try {
      await deletePatient(toDelete.id);
    } catch {
      setError("Couldn't delete that patient. Try again.");
    }
    setToDelete(null);
    loadPatients();
  }

  const query = search.trim().toLowerCase();
  const visible = patients.filter(
    (p) => p.name.toLowerCase().includes(query) || p.phone.includes(query)
  );

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Patients</h1>
          <p className="muted">{patients.length} registered</p>
        </div>
        <Link to="/patients/new" className="btn btn-primary">Add patient</Link>
      </header>

      <div className="toolbar">
        <input
          className="input grow"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="empty">Loading patients…</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="empty">{patients.length === 0 ? "No patients yet. Add the first one." : `No patient matches "${search}".`}</p>
      )}

      {visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Email</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td className="actions">
                    <Link className="btn btn-sm" to={`/patients/${p.id}/edit`}>Edit</Link>
                    <button className="btn btn-sm btn-ghost-danger" onClick={() => setToDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this patient?"
          message={`${toDelete.name}'s record will be removed. This can't be undone.`}
          confirmLabel="Delete patient"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
