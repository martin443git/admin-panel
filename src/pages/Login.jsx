import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.is_staff) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.non_field_errors?.[0] ||
          data?.detail ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Theatre Booking Admin</h1>
        <p className="muted">Sign in with your staff account</p>
        {error && <div className="error">{error}</div>}
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}