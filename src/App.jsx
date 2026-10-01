import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import {
  Bookings,
  Movies,
  Screens,
  Seats,
  Shows,
  Theatres,
  Users,
} from "./pages/Sections";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="theatres" element={<Theatres />} />
        <Route path="movies" element={<Movies />} />
        <Route path="screens" element={<Screens />} />
        <Route path="seats" element={<Seats />} />
        <Route path="shows" element={<Shows />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}