import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors, getPatients, getAppointments } from "../services/api";
import { STATUSES, SERVER_ERROR, todayStr, prettyDate, sameId } from "../utils";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [d, p, a] = await Promise.all([getDoctors(), getPatients(), getAppointments()]);
        setDoctors(d);
        setPatients(p);
        setAppointments(a);
      } catch {
        setError(SERVER_ERROR);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="empty">Loading dashboard…</p>;
  if (error) return <p className="alert alert-error">{error}</p>;

  // ---- calculations ----
  const today = todayStr();
  const availableDoctors = doctors.filter((d) => d.available).length;
  const todaysAppointments = appointments
    .filter((a) => a.date === today && a.status !== "Cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
  const cancelRate = appointments.length ? Math.round((cancelled / appointments.length) * 100) : 0;

  const statusCounts = STATUSES.map((s) => ({
    status: s,
    count: appointments.filter((a) => a.status === s).length,
  }));

  const specializations = {};
  doctors.forEach((d) => {
    specializations[d.specialization] = (specializations[d.specialization] || 0) + 1;
  });

  const patientName = (id) => patients.find((p) => sameId(p.id, id))?.name || "Unknown patient";
  const doctorName = (id) => doctors.find((d) => sameId(d.id, id))?.name || "Unknown doctor";

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Good to see you</h1>
          <p className="muted">{prettyDate(today)} · here's how the clinic looks today.</p>
        </div>
        <Link to="/appointments/new" className="btn btn-primary">Book appointment</Link>
      </header>

      <section className="stat-strip">
        <div><b>{availableDoctors}<small>/{doctors.length}</small></b><span>doctors available</span></div>
        <div><b>{patients.length}</b><span>registered patients</span></div>
        <div><b>{todaysAppointments.length}</b><span>appointments today</span></div>
        <div><b>{cancelRate}<small>%</small></b><span>cancellation rate</span></div>
      </section>

      <div className="two-col">
        <section className="panel">
          <h2>Today's schedule</h2>
          {todaysAppointments.length === 0 ? (
            <p className="empty">Nothing scheduled for today.</p>
          ) : (
            <ul className="timeline">
              {todaysAppointments.map((a) => (
                <li key={a.id}>
                  <time>{a.time}</time>
                  <div>
                    <strong>{patientName(a.patientId)}</strong>
                    <span className="muted"> with {doctorName(a.doctorId)}</span>
                    <p className="muted small">{a.reason}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="stack">
          <section className="panel">
            <h2>Appointments by status</h2>
            <div className="bar">
              {statusCounts.map((s) => (
                <span
                  key={s.status}
                  className={`seg seg-${s.status.toLowerCase()}`}
                  style={{ flexGrow: s.count }}
                  title={`${s.status}: ${s.count}`}
                />
              ))}
            </div>
            <ul className="legend">
              {statusCounts.map((s) => (
                <li key={s.status}>
                  <i className={`dot seg-${s.status.toLowerCase()}`} />
                  {s.status} <b>{s.count}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Doctors by specialization</h2>
            <ul className="plain-list">
              {Object.entries(specializations).map(([name, count]) => (
                <li key={name}>
                  <span>{name}</span>
                  <b>{count}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
