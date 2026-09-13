import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setSubmitting(false);
          return;
        }
        await register({
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
        });
      } else {
        await login({
          username: formData.username.trim(),
          password: formData.password,
        });
      }
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        "Could not sign in. Check your details and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-subtitle">
          {mode === "register"
            ? "Set up JobFlow in a minute. You can change these details later."
            : "Enter your details to continue your job search."}
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-username">
              {mode === "login" ? "Username or email" : "Username"}
            </label>
            <input
              id="auth-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={
                mode === "login" ? "jane.doe or jane@email.com" : "jane.doe"
              }
              autoComplete="username"
              required
            />
          </div>
          {mode === "register" ? (
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@email.com"
                autoComplete="email"
                required
              />
            </div>
          ) : null}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="auth-password">Password</label>
              {mode === "login" ? (
                <Link to="/forgot-password" className="auth-inline-link">
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <PasswordInput
              id="auth-password"
              value={formData.password}
              onChange={handleChange}
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "register" ? "At least 8 characters" : "Your password"
              }
            />
          </div>
          {mode === "register" ? (
            <div className="form-group">
              <label htmlFor="auth-confirm">Confirm password</label>
              <PasswordInput
                id="auth-confirm"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </div>
          ) : null}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-toggle"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-toggle"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
