# Lotus Care – Hospital Appointment Management Portal

React + Vite front end with JSON Server as the backend.

## Run it

```bash
npm install
npm run server   # JSON Server on http://localhost:3000  (keep this terminal open)
npm run dev      # React app on http://localhost:5173   (second terminal)
```

`npm run server` is the same as `npx json-server --watch db.json --port 3000`.

## Structure

```
db.json                 doctors, patients, appointments
src/services/api.js     every fetch call lives here
src/pages/              Dashboard, Doctors, Patients, Appointments + their forms
src/components/         Layout, Field, StatusBadge, ConfirmDialog
src/utils.js            statuses, date helpers, validators
```

## Where each capstone requirement is shown

| Requirement | Where |
|---|---|
| GET all / by id / POST / PUT / DELETE | `services/api.js` for all three entities |
| useEffect + fetch + setState | every page's `load` function |
| Edit flow with useParams → GET by id → populate → PUT | `DoctorForm`, `PatientForm`, `AppointmentForm` |
| Forms and validation | the three `*Form.jsx` files |
| Delete with confirmation | `ConfirmDialog` used in all three list pages |
| Search / filter | Doctors (specialization search, available only), Patients, Appointments (date + status) |
| Dashboard calculations | `Dashboard.jsx` (counts, cancellation rate, status split, specialization split) |
| Conditional rendering | loading, empty, error, unavailable doctor and cancelled appointment messages |
| React Router | `App.jsx` |
| Props, lists and keys | `StatusBadge`, `Field`, `ConfirmDialog`, `.map()` with keys everywhere |

## Behaviour worth knowing

- An unavailable doctor can't be booked. The Book button is disabled and the form blocks and explains.
- A doctor can't be double-booked for the same date and time (cancelled slots don't count).
- Cancelling keeps the record with a Cancelled status. Cancelled appointments can't be edited.
