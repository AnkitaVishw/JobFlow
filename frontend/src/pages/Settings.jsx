import { useState } from "react";
import useProfile from "../hooks/useProfile";
import api from "../services/api";

function Settings() {
  const { profile, setProfile, loading, error, setError } = useProfile();
  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.patch("/profile/", {
        full_name: profile.full_name,
        email: profile.email,
        target_role: profile.target_role,
        location: profile.location,
        weekly_goal: Number(profile.weekly_goal) || 0,
        notify_interviews: profile.notify_interviews,
      });
      setProfile(response.data);
      setError("");
      setSaved(true);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings.");
      setSaved(false);
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Personalize JobFlow for your search.</p>
        </div>
      </div>

      <div className="form-card">
        <h2>Profile</h2>
        <p>This name shows on the dashboard greeting.</p>
        {error ? <p className="form-error">{error}</p> : null}
        {saved ? <p className="form-success">Settings saved.</p> : null}

        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <form className="application-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleChange}
                placeholder="e.g. Ankita"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Target role</label>
              <input
                type="text"
                name="target_role"
                value={profile.target_role || ""}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location || ""}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
              />
            </div>

            <div className="form-group">
              <label>Weekly application goal</label>
              <input
                type="number"
                min="0"
                name="weekly_goal"
                value={profile.weekly_goal ?? 5}
                onChange={handleChange}
              />
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="notify_interviews"
                checked={Boolean(profile.notify_interviews)}
                onChange={handleChange}
              />
              Remind me about upcoming interviews on the dashboard
            </label>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Settings;
