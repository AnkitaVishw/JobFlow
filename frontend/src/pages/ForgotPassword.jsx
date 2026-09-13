import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function ForgotPassword() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/auth/forgot-password/", { email });
      setSent(true);
      setResetUrl(response.data.reset_url || "");
    } catch (err) {
      setError(
        err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Could not send a reset link. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Forgot password</h2>
        <p className="auth-subtitle">
          Enter the email on your account and we&apos;ll send a reset link.
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        {sent ? (
          <>
            <p className="form-success">
              If an account exists for that email, we sent a password reset
              link.
            </p>
            {resetUrl ? (
              <p className="field-hint">
                Local development link:{" "}
                <Link to={resetUrl.replace(/^https?:\/\/[^/]+/, "")}>
                  Reset password
                </Link>
              </p>
            ) : null}
            <Link to="/login" className="auth-submit auth-link-btn">
              Back to sign in
            </Link>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@email.com"
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <p className="auth-switch">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
