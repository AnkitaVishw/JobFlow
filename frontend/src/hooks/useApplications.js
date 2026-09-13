import { useEffect, useState } from "react";
import api from "../services/api";

function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("/applications/");
        setApplications(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Could not load applications. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return { applications, setApplications, loading, error, setError };
}

export default useApplications;
