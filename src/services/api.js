// All talking to JSON Server happens here, so the pages only deal with UI.
const BASE_URL = "http://localhost:3000";

async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

const withBody = (method, data) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// ---- Doctors ----
export const getDoctors = () => request("/doctors");
export const getDoctor = (id) => request(`/doctors/${id}`);
export const addDoctor = (doctor) => request("/doctors", withBody("POST", doctor));
export const updateDoctor = (id, doctor) => request(`/doctors/${id}`, withBody("PUT", doctor));
export const deleteDoctor = (id) => request(`/doctors/${id}`, { method: "DELETE" });

// ---- Patients ----
export const getPatients = () => request("/patients");
export const getPatient = (id) => request(`/patients/${id}`);
export const addPatient = (patient) => request("/patients", withBody("POST", patient));
export const updatePatient = (id, patient) => request(`/patients/${id}`, withBody("PUT", patient));
export const deletePatient = (id) => request(`/patients/${id}`, { method: "DELETE" });

// ---- Appointments ----
export const getAppointments = () => request("/appointments");
export const getAppointment = (id) => request(`/appointments/${id}`);
export const addAppointment = (appt) => request("/appointments", withBody("POST", appt));
export const updateAppointment = (id, appt) => request(`/appointments/${id}`, withBody("PUT", appt));
export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: "DELETE" });
