import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors, getPatients, getAppointments, updateAppointment, deleteAppointment } from "../services/api";
import { STATUSES, SERVER_ERROR, prettyDate, sameId } from "../utils";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toDelete, setToDelete] = useState(null);

  async function loadAll() {
    try {
      const [a, d, p] = await Promise.all([getAppointments(), getDoctors(), getPatients()]);
      setAppointments(a);
      setDoctors(d);
      setPatients(p);
      setError("");
    } catch {
      setError(SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const patientName = (id) => patients.find((p) => sameId(p.id, id))?.name || "Unknown patient";
  const doctorName = (id) => doctors.find((d) => sameId(d.id, id))?.name || "Unknown doctor";

  async function changeStatus(appt, status) {
    try {
      await updateAppointment(appt.id, { ...appt, status });
      if (status === "Cancelled") {
        setNotice(`Appointment cancelled: ${patientName(appt.patientId)} with ${doctorName(appt.doctorId)} on ${prettyDate(appt.date)}, ${appt.time}. The slot is free again.`);
      } else {
        setNotice(`Marked ${patientName(appt.patientId)}'s appointment as ${status.toLowerCase()}.`);
      }
      loadAll();
    } catch {
      setError("Couldn't update the appointment. Try again.");
    }
  }

  async function handleDelete() {
    try {
      await deleteAppointment(toDelete.id);
      setNotice("Appointment deleted.");
    } catch {
      setError("Couldn't delete the appointment. Try again.");
    }
    setToDelete(null);
    loadAll();
  }

  const visible = appointments
    .filter((a) => (!dateFilter || a.date === dateFilter) && (!statusFilter || a.status === statusFilter))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Appointments</h1>
          <p className="muted">{visible.length} shown of {appointments.length}</p>
        </div>
        <Link to="/appointments/new" className="btn btn-primary">Book appointment</Link>
      </header>

      <div className="toolbar">
        <input className="input" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} aria-label="Filter by date" />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(dateFilter || statusFilter) && (
          <button className="btn btn-ghost" onClick={() => { setDateFilter(""); setStatusFilter(""); }}>Clear filters</button>
        )}
      </div>

      {notice && (
        <p className="alert alert-info" onClick={() => setNotice("")}>{notice}</p>
      )}
      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="empty">Loading appointments…</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="empty">No appointments match these filters.</p>
      )}

      {visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>When</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((a) => {
                const cancelled = a.status === "Cancelled";
                const done = a.status === "Completed";
                const doctor = doctors.find((d) => sameId(d.id, a.doctorId));
                return (
                  <tr key={a.id} className={cancelled ? "row-cancelled" : ""}>
                    <td><strong>{prettyDate(a.date)}</strong><br /><span className="muted small">{a.time}</span></td>
                    <td>{patientName(a.patientId)}</td>
                    <td>
                      {doctorName(a.doctorId)}
                      {doctor && !doctor.available && !cancelled && !done && (
                        <span className="small warn"><br />Doctor is unavailable now</span>
                      )}
                    </td>
                    <td>
                      {a.reason}
                      {cancelled && <span className="small warn"><br />Cancelled. This appointment can't be edited.</span>}
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="actions">
                      {a.status === "Booked" && <button className="btn btn-sm" onClick={() => changeStatus(a, "Confirmed")}>Confirm</button>}
                      {a.status === "Confirmed" && <button className="btn btn-sm" onClick={() => changeStatus(a, "Completed")}>Complete</button>}
                      {!cancelled && !done && <Link className="btn btn-sm" to={`/appointments/${a.id}/edit`}>Edit</Link>}
                      {!cancelled && !done && <button className="btn btn-sm btn-ghost-danger" onClick={() => changeStatus(a, "Cancelled")}>Cancel</button>}
                      <button className="btn btn-sm btn-ghost-danger" onClick={() => setToDelete(a)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this appointment?"
          message="The record will be removed for good. To keep a record, cancel it instead."
          confirmLabel="Delete appointment"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
