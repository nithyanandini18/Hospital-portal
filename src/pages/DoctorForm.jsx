import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoctor, addDoctor, updateDoctor } from "../services/api";
import { SERVER_ERROR, isEmail, isPhone } from "../utils";
import Field from "../components/Field";

const emptyDoctor = { name: "", specialization: "", experience: "", phone: "", email: "", available: true };

export default function DoctorForm() {
  const { id } = useParams(); // only present on the edit route
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyDoctor);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getDoctor(id)
      .then(setForm)
      .catch(() => setServerError("Couldn't find that doctor."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function validate() {
    const found = {};
    if (form.name.trim().length < 3) found.name = "Enter the doctor's full name.";
    if (!form.specialization.trim()) found.specialization = "Specialization is required.";
    if (form.experience === "" || Number(form.experience) < 0 || Number(form.experience) > 60)
      found.experience = "Experience should be between 0 and 60 years.";
    if (!isPhone(form.phone)) found.phone = "Phone must be 10 digits.";
    if (!isEmail(form.email)) found.email = "Enter a valid email address.";
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const doctor = { ...form, name: form.name.trim(), specialization: form.specialization.trim(), experience: Number(form.experience) };
    try {
      if (isEdit) await updateDoctor(id, doctor);
      else await addDoctor(doctor);
      navigate("/doctors");
    } catch {
      setServerError(SERVER_ERROR);
    }
  }

  if (loading) return <p className="empty">Loading…</p>;

  return (
    <>
      <header className="page-head">
        <h1>{isEdit ? "Edit doctor" : "Add doctor"}</h1>
      </header>
      {serverError && <p className="alert alert-error">{serverError}</p>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" error={errors.name}>
          <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Dr. Ananya Rao" />
        </Field>
        <Field label="Specialization" error={errors.specialization}>
          <input className="input" name="specialization" value={form.specialization} onChange={handleChange} placeholder="Cardiology" />
        </Field>
        <Field label="Experience (years)" error={errors.experience}>
          <input className="input" type="number" name="experience" value={form.experience} onChange={handleChange} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" name="email" value={form.email} onChange={handleChange} />
        </Field>
        <label className="check">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          Available for new appointments
        </label>

        <div className="row">
          <button className="btn btn-primary" type="submit">{isEdit ? "Save changes" : "Add doctor"}</button>
          <Link className="btn btn-ghost" to="/doctors">Cancel</Link>
        </div>
      </form>
    </>
  );
}
