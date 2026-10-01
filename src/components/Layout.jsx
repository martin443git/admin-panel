import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  ["dashboard", "Dashboard"],
  ["theatres", "Theatres"],
  ["movies", "Movies"],
  ["screens", "Screens"],
  ["seats", "Seats"],
  ["shows", "Shows"],
  ["bookings", "Bookings"],
  ["users", "Users"],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Theatre Booking Admin</div>
        <nav>
          {links.map(([path, label]) => (
            <NavLink key={path} to={`/admin/${path}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="content">
        <header className="topbar">Signed in as <b>{user?.username}</b></header>
        <Outlet />
      </main>
    </div>
  );
}