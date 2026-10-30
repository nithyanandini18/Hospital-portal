import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPatient, addPatient, updatePatient } from "../services/api";
import { SERVER_ERROR, isEmail, isPhone } from "../utils";
import Field from "../components/Field";

const emptyPatient = { name: "", age: "", gender: "", phone: "", email: "" };

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyPatient);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getPatient(id)
      .then(setForm)
      .catch(() => setServerError("Couldn't find that patient."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const found = {};
    if (form.name.trim().length < 3) found.name = "Enter the patient's full name.";
    if (form.age === "" || Number(form.age) < 0 || Number(form.age) > 120) found.age = "Age should be between 0 and 120.";
    if (!form.gender) found.gender = "Choose a gender.";
    if (!isPhone(form.phone)) found.phone = "Phone must be 10 digits.";
    if (!isEmail(form.email)) found.email = "Enter a valid email address.";
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const patient = { ...form, name: form.name.trim(), age: Number(form.age) };
    try {
      if (isEdit) await updatePatient(id, patient);
      else await addPatient(patient);
      navigate("/patients");
    } catch {
      setServerError(SERVER_ERROR);
    }
  }

  if (loading) return <p className="empty">Loading…</p>;

  return (
    <>
      <header className="page-head">
        <h1>{isEdit ? "Edit patient" : "Add patient"}</h1>
      </header>
      {serverError && <p className="alert alert-error">{serverError}</p>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" error={errors.name}>
          <input className="input" name="name" value={form.name} onChange={handleChange} />
        </Field>
        <div className="form-pair">
          <Field label="Age" error={errors.age}>
            <input className="input" type="number" name="age" value={form.age} onChange={handleChange} />
          </Field>
          <Field label="Gender" error={errors.gender}>
            <select className="input" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select…</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </Field>
        </div>
        <Field label="Phone" error={errors.phone}>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" name="email" value={form.email} onChange={handleChange} />
        </Field>

        <div className="row">
          <button className="btn btn-primary" type="submit">{isEdit ? "Save changes" : "Add patient"}</button>
          <Link className="btn btn-ghost" to="/patients">Cancel</Link>
        </div>
      </form>
    </>
  );
}
