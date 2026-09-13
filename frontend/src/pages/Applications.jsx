import { useRef, useState } from "react";
import AddApplicationForm from "../components/AddApplicationForm";
import useApplications from "../hooks/useApplications";
import api from "../services/api";
import { formatDate, formatDateTime, followUpState } from "../utils/datetime";
import { statusClass } from "../utils/status";

function Applications() {
  const { applications, setApplications, loading, error, setError } =
    useApplications();
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingApplication, setEditingApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const formCardRef = useRef(null);

  const handleEdit = (application) => {
    setEditingApplication(application);
    setError("");
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelEdit = () => {
    setEditingApplication(null);
    setError("");
  };

  const handleUpdateApplication = async (id, updatedApplication) => {
    try {
      const response = await api.patch(
        `/applications/${id}/`,
        updatedApplication,
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id ? response.data : application,
        ),
      );

      setEditingApplication(null);
      setError("");
    } catch (err) {
      console.error("Failed to update application:", err);
      console.error("Django response:", err.response?.data);
      setError("Failed to update application. Check the form and try again.");
    }
  };

  const handleAddApplication = async (newApplication, options = {}) => {
    const duplicate = applications.find(
      (application) =>
        (application.company || "").toLowerCase() ===
          newApplication.company.toLowerCase() &&
        (application.role || "").toLowerCase() ===
          newApplication.role.toLowerCase(),
    );

    if (duplicate && !options.force) {
      const confirmed = window.confirm(
        `You already applied to ${duplicate.company} for ${duplicate.role}. Add another anyway?`,
      );
      if (!confirmed) {
        return false;
      }
    }

    try {
      const response = await api.post("/applications/", {
        ...newApplication,
        force: Boolean(duplicate) || Boolean(options.force),
      });

      setApplications((currentApplications) => [
        response.data,
        ...currentApplications,
      ]);
      setError("");
      return true;
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.duplicate) {
        const confirmed = window.confirm(
          `${err.response.data.detail} Add another anyway?`,
        );
        if (confirmed) {
          return handleAddApplication(newApplication, { force: true });
        }
        return false;
      }
      console.error("Failed to add application:", err);
      console.error("Django response:", err.response?.data);
      setError("Failed to add application. Check the form and try again.");
      return false;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/applications/${id}/`, {
        status: newStatus,
      });

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id ? response.data : application,
        ),
      );
      setError("");
    } catch (err) {
      console.error("Status update failed:", err);
      console.error("Django response:", err.response?.data);
      setError("Failed to update status.");
    }
  };

  const handleDeleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/applications/${id}/`);

      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== id),
      );

      if (editingApplication?.id === id) {
        setEditingApplication(null);
      }
      setError("");
    } catch (err) {
      console.error("Failed to delete application:", err);
      console.error("Django response:", err.response?.data);
      setError("Failed to delete application.");
    }
  };

  const filteredApplications = applications.filter((application) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (application.company || "").toLowerCase().includes(search) ||
      (application.role || "").toLowerCase().includes(search) ||
      (application.recruiter_name || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All"
        ? application.status !== "Rejected"
        : application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p>Track and manage your job applications.</p>
        </div>
      </div>

      <div className="form-card" ref={formCardRef}>
        <h2>
          {editingApplication ? "Edit Application" : "Add New Application"}
        </h2>
        <p>
          {editingApplication
            ? "Update the details for this application."
            : "Enter the details of the job you're applying for."}
        </p>

        {error ? <p className="form-error">{error}</p> : null}

        <AddApplicationForm
          onAddApplication={handleAddApplication}
          editingApplication={editingApplication}
          onUpdateApplication={handleUpdateApplication}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="applications-list">
        <h2>Your Applications</h2>
        <input
          type="text"
          placeholder="Search by company, role, or location..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="status-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Screening">Screening</option>
          <option value="Interview">Interview</option>
          <option value="Technical Round">Technical Round</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        {loading ? (
          <p className="empty-message">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="empty-message">No applications added yet.</p>
        ) : filteredApplications.length === 0 ? (
          <p className="empty-message">No applications found.</p>
        ) : (
          filteredApplications.map((application) => (
            <div
              className={`application-item ${followUpState(application.follow_up_on)}`}
              key={application.id}
            >
              <div className="application-info">
                <strong>{application.company}</strong>
                <span>{application.role}</span>
                {application.location ? (
                  <span>{application.location}</span>
                ) : null}
                {application.salary ? <span>{application.salary}</span> : null}
                {application.resume_title ? (
                  application.resume_file_url ? (
                    <a
                      href={application.resume_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="job-link"
                    >
                      Resume: {application.resume_title}
                    </a>
                  ) : (
                    <span>Resume: {application.resume_title} (no file)</span>
                  )
                ) : null}
                {application.date_applied ? (
                  <span>Applied {formatDate(application.date_applied)}</span>
                ) : null}
                {application.next_action ? (
                  <span>
                    Next: {application.next_action}
                    {application.follow_up_on
                      ? ` · ${formatDate(application.follow_up_on)}`
                      : ""}
                  </span>
                ) : application.follow_up_on ? (
                  <span>Follow up {formatDate(application.follow_up_on)}</span>
                ) : null}
                {application.recruiter_name ? (
                  <span>
                    Recruiter: {application.recruiter_name}
                    {application.recruiter_email ? (
                      <>
                        {" · "}
                        <a
                          href={`mailto:${application.recruiter_email}`}
                          className="job-link"
                        >
                          {application.recruiter_email}
                        </a>
                      </>
                    ) : null}
                  </span>
                ) : application.recruiter_email ? (
                  <a
                    href={`mailto:${application.recruiter_email}`}
                    className="job-link"
                  >
                    {application.recruiter_email}
                  </a>
                ) : null}
                {application.recruiter_linkedin ? (
                  <a
                    href={application.recruiter_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="job-link"
                  >
                    Recruiter LinkedIn
                  </a>
                ) : null}
                {application.job_url ? (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="job-link"
                  >
                    View job posting
                  </a>
                ) : null}
                {application.status_history?.length ? (
                  <ol className="timeline">
                    {application.status_history.map((item) => (
                      <li key={item.id}>
                        {item.from_status
                          ? `${item.from_status} → ${item.to_status}`
                          : item.to_status}
                        {item.changed_at
                          ? ` · ${formatDateTime(item.changed_at)}`
                          : ""}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>

              <div className="application-actions">
                <select
                  value={application.status}
                  onChange={(event) =>
                    handleStatusChange(application.id, event.target.value)
                  }
                  className={`status-select ${statusClass(application.status)}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Technical Round">Technical Round</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(application)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteApplication(application.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Applications;
