import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import DoctorForm from "./pages/DoctorForm";
import Patients from "./pages/Patients";
import PatientForm from "./pages/PatientForm";
import Appointments from "./pages/Appointments";
import AppointmentForm from "./pages/AppointmentForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/new" element={<DoctorForm />} />
          <Route path="doctors/:id/edit" element={<DoctorForm />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id/edit" element={<PatientForm />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/new" element={<AppointmentForm />} />
          <Route path="appointments/:id/edit" element={<AppointmentForm />} />
          <Route path="*" element={<p className="empty">That page doesn't exist.</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
