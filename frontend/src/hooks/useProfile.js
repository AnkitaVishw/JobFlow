import { useEffect, useState } from "react";
import api from "../services/api";

function useProfile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    target_role: "",
    location: "",
    weekly_goal: 5,
    notify_interviews: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/");
        setProfile(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load settings. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, setProfile, loading, error, setError };
}

export default useProfile;
