import { useEffect, useState } from "react";
import api from "../services/api";

function useInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get("/interviews/");
        setInterviews(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
        setError("Could not load interviews. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return { interviews, setInterviews, loading, error, setError };
}

export default useInterviews;
