import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getDoctors, getPatients, getAppointments, getAppointment, addAppointment, updateAppointment } from "../services/api";
import { STATUSES, SERVER_ERROR, todayStr, sameId } from "../utils";
import Field from "../components/Field";

const emptyAppointment = { patientId: "", doctorId: "", date: "", time: "", reason: "", status: "Booked" };

export default function AppointmentForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // /appointments/new?doctorId=3 pre-selects a doctor
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ ...emptyAppointment, doctorId: searchParams.get("doctorId") || "" });
  const [original, setOriginal] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [d, p, a] = await Promise.all([getDoctors(), getPatients(), getAppointments()]);
        setDoctors(d);
        setPatients(p);
        setAllAppointments(a);
        if (isEdit) {
          const existing = await getAppointment(id);
          setForm(existing);
          setOriginal(existing);
        }
      } catch {
        setServerError(SERVER_ERROR);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  const selectedDoctor = doctors.find((d) => sameId(d.id, form.doctorId));
  const doctorChanged = !original || !sameId(original.doctorId, form.doctorId);
  const doctorBlocked = selectedDoctor && !selectedDoctor.available && doctorChanged;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const found = {};
    if (!form.patientId) found.patientId = "Choose a patient.";
    if (!form.doctorId) found.doctorId = "Choose a doctor.";
    else if (doctorBlocked) found.doctorId = `${selectedDoctor.name} is unavailable. Pick another doctor.`;
    if (!form.date) found.date = "Pick a date.";
    else if (!isEdit && form.date < todayStr()) found.date = "Date can't be in the past.";
    if (!form.time) found.time = "Pick a time.";
    if (form.reason.trim().length < 3) found.reason = "Add a short reason for the visit.";

    // same doctor, same slot, and the other appointment isn't cancelled
    const clash = allAppointments.some(
      (a) =>
        !sameId(a.id, id ?? -1) &&
        a.status !== "Cancelled" &&
        sameId(a.doctorId, form.doctorId) &&
        a.date === form.date &&
        a.time === form.time
    );
    if (clash && form.date && form.time && !found.doctorId) {
      found.time = "This doctor already has an appointment at that time.";
    }
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const appointment = { ...form, reason: form.reason.trim() };
    try {
      if (isEdit) await updateAppointment(id, appointment);
      else await addAppointment(appointment);
      navigate("/appointments");
    } catch {
      setServerError(SERVER_ERROR);
    }
  }

  if (loading) return <p className="empty">Loading…</p>;

  if (original?.status === "Cancelled") {
    return (
      <>
        <header className="page-head"><h1>Edit appointment</h1></header>
        <p className="alert alert-info">
          This appointment was cancelled, so it can't be changed. Book a new one instead.
        </p>
        <div className="row">
          <Link className="btn btn-primary" to="/appointments/new">Book new appointment</Link>
          <Link className="btn btn-ghost" to="/appointments">Back to list</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="page-head">
        <h1>{isEdit ? "Edit appointment" : "Book appointment"}</h1>
      </header>
      {serverError && <p className="alert alert-error">{serverError}</p>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Patient" error={errors.patientId}>
          <select className="input" name="patientId" value={form.patientId} onChange={handleChange}>
            <option value="">Select a patient…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>

        <Field label="Doctor" error={errors.doctorId}>
          <select className="input" name="doctorId" value={form.doctorId} onChange={handleChange}>
            <option value="">Select a doctor…</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization}){d.available ? "" : " – unavailable"}
              </option>
            ))}
          </select>
        </Field>
        {doctorBlocked && !errors.doctorId && (
          <p className="alert alert-warn">{selectedDoctor.name} isn't taking appointments right now. Choose another doctor.</p>
        )}

        <div className="form-pair">
          <Field label="Date" error={errors.date}>
            <input className="input" type="date" name="date" min={isEdit ? undefined : todayStr()} value={form.date} onChange={handleChange} />
          </Field>
          <Field label="Time" error={errors.time}>
            <input className="input" type="time" name="time" value={form.time} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Reason for visit" error={errors.reason}>
          <textarea className="input" rows="3" name="reason" value={form.reason} onChange={handleChange} />
        </Field>

        {isEdit && (
          <Field label="Status">
            <select className="input" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}

        <div className="row">
          <button className="btn btn-primary" type="submit">{isEdit ? "Save changes" : "Book appointment"}</button>
          <Link className="btn btn-ghost" to="/appointments">Back</Link>
        </div>
      </form>
    </>
  );
}
