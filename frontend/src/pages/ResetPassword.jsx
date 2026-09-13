import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function ResetPassword() {
  const { isAuthenticated } = useAuth();
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/auth/reset-password/", {
        uid,
        token,
        password,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.password?.[0] ||
          "This reset link is invalid or has expired.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Set a new password</h2>
        <p className="auth-subtitle">
          Choose a new password for your JobFlow account.
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New password</label>
            <PasswordInput
              id="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;
