import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(form);

      alert("Registration successful!");

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="logo">
          🛡️
        </div>

        <h1>Create Account</h1>

        <p className="subtitle">
          Insider Threat Detection System
        </p>

        <form onSubmit={handleSubmit}>

          <label>Username</label>

          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <p className="switch">
          Already have an account?{" "}
          <Link to="/">
            Sign In
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;