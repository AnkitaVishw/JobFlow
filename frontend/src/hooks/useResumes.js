import { useEffect, useState } from "react";
import api from "../services/api";

function useResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes/");
        setResumes(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
        setError("Could not load resumes. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return { resumes, setResumes, loading, error, setError };
}

export default useResumes;
