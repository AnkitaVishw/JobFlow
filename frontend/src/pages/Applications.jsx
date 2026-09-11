import { useState } from "react";
import AddApplicationForm from "../components/AddApplicationForm";

function Applications() {
  const [applications, setApplications] = useState([]);

  const handleAddApplication = (newApplication) => {
    setApplications((currentApplications) => [
      ...currentApplications,
      {
        ...newApplication,
        id: Date.now(),
      },
    ]);
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

        {applications.length === 0 ? (
          <p className="empty-message">No applications added yet.</p>
        ) : (
          applications.map((application) => (
            <div className="application-item" key={application.id}>
              <div>
                <strong>{application.company}</strong>
                <span>{application.role}</span>
              </div>

              <span className="status">{application.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Applications;
