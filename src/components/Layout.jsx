import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/doctors", label: "Doctors" },
  { to: "/patients", label: "Patients" },
  { to: "/appointments", label: "Appointments" },
];

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <div>
            <strong>Lotus Care</strong>
            <small>Front desk</small>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
