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
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/applications/${id}/`, {
        status: newStatus,
      });

      console.log("Status updated:", response.data);

      setApplications((currentApplications) =>
        currentApplications
          .map((application) =>
            application.id === id
              ? { ...application, status: newStatus }
              : application,
          )
          .filter((application) => application.status !== "Rejected"),
      );
    } catch (error) {
      console.error("Status update failed:", error);
      console.error("Django response:", error.response?.data);
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

              <select
                value={application.status}
                onChange={(event) =>
                  handleStatusChange(application.id, event.target.value)
                }
                className={`status-select ${application.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Technical Round">Technical Round</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Applications;
