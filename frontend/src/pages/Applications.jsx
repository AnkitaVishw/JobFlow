import { useEffect, useState } from "react";
import AddApplicationForm from "../components/AddApplicationForm";
import api from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications/");
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAddApplication = async (newApplication) => {
    try {
      const response = await api.post("/applications/", newApplication);

      setApplications((currentApplications) => [
        response.data,
        ...currentApplications,
      ]);
    } catch (error) {
      console.error("Failed to add application:", error);
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p>Track and manage your job applications.</p>
        </div>
      </div>

      <div className="form-card">
        <h2>Add New Application</h2>
        <p>Enter the details of the job you're applying for.</p>

        <AddApplicationForm onAddApplication={handleAddApplication} />
      </div>

      <div className="applications-list">
        <h2>Your Applications</h2>

        {loading ? (
          <p className="empty-message">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="empty-message">No applications added yet.</p>
        ) : (
          applications.map((application) => (
            <div className="application-item" key={application.id}>
              <div>
                <strong>{application.company}</strong>
                <span>{application.role}</span>
                <span>{application.location}</span>
              </div>

              <span
                className={`status ${application.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {application.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Applications;
