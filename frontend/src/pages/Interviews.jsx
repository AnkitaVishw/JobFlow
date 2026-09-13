import { useState } from "react";
import useApplications from "../hooks/useApplications";
import useInterviews from "../hooks/useInterviews";
import api from "../services/api";
import { formatDateTime, toDateTimeLocal, isSameLocalDay } from "../utils/datetime";
import { statusClass } from "../utils/status";

const emptyForm = {
  application: "",
  scheduled_at: "",
  interview_type: "Technical",
  meeting_link: "",
  notes: "",
  status: "Upcoming",
};

function Interviews() {
  const { applications, loading: appsLoading } = useApplications();
  const { interviews, setInterviews, loading, error, setError } =
    useInterviews();
  const [formData, setFormData] = useState(emptyForm);
  const [editingInterview, setEditingInterview] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Upcoming");

  const activeApplications = applications.filter(
    (application) => application.status !== "Rejected",
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingInterview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      application: Number(formData.application),
    };

    try {
      if (editingInterview) {
        const response = await api.patch(
          `/interviews/${editingInterview.id}/`,
          payload,
        );
        setInterviews((current) =>
          current.map((interview) =>
            interview.id === editingInterview.id ? response.data : interview,
          ),
        );
      } else {
        const response = await api.post("/interviews/", payload);
        setInterviews((current) => [...current, response.data]);
      }

      resetForm();
      setError("");
    } catch (err) {
      console.error("Failed to save interview:", err);
      setError("Failed to save interview. Check the form and try again.");
    }
  };

  const handleEdit = (interview) => {
    setEditingInterview(interview);
    setFormData({
      application: String(interview.application),
      scheduled_at: toDateTimeLocal(interview.scheduled_at),
      interview_type: interview.interview_type,
      meeting_link: interview.meeting_link || "",
      notes: interview.notes || "",
      status: interview.status,
    });
    setError("");
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.patch(`/interviews/${id}/`, { status });
      setInterviews((current) =>
        current.map((interview) =>
          interview.id === id ? response.data : interview,
        ),
      );
    } catch (err) {
      console.error("Failed to update interview status:", err);
      setError("Failed to update interview status.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this interview?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/interviews/${id}/`);
      setInterviews((current) =>
        current.filter((interview) => interview.id !== id),
      );
      if (editingInterview?.id === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Failed to delete interview:", err);
      setError("Failed to delete interview.");
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (statusFilter === "All") {
      return true;
    }
    return interview.status === statusFilter;
  });

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Interviews</h1>
          <p>Schedule rounds and keep track of what is coming next.</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingInterview ? "Edit Interview" : "Schedule Interview"}</h2>
        <p>
          {editingInterview
            ? "Update the round details."
            : "Link a round to an existing application."}
        </p>
        {error ? <p className="form-error">{error}</p> : null}

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Application</label>
            <select
              name="application"
              value={formData.application}
              onChange={handleChange}
              required
            >
              <option value="">Select an application</option>
              {activeApplications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company} — {application.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date and time</label>
            <input
              type="datetime-local"
              name="scheduled_at"
              value={formData.scheduled_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Round type</label>
            <select
              name="interview_type"
              value={formData.interview_type}
              onChange={handleChange}
            >
              <option value="Phone Screen">Phone Screen</option>
              <option value="HR">HR</option>
              <option value="Technical">Technical</option>
              <option value="Hiring Manager">Hiring Manager</option>
              <option value="Onsite">Onsite</option>
              <option value="Offer Discussion">Offer Discussion</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Meeting link or location</label>
            <input
              type="text"
              name="meeting_link"
              value={formData.meeting_link}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Prep topics, interviewer name..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingInterview ? "Save Changes" : "Schedule Interview"}
            </button>
            {editingInterview ? (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="applications-list">
        <h2>Your Interviews</h2>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="status-filter"
        >
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="All">All</option>
        </select>

        {loading || appsLoading ? (
          <p className="empty-message">Loading interviews...</p>
        ) : activeApplications.length === 0 && interviews.length === 0 ? (
          <p className="empty-message">
            Add an application first, then schedule a round here.
          </p>
        ) : filteredInterviews.length === 0 ? (
          <p className="empty-message">No interviews in this view.</p>
        ) : (
          filteredInterviews.map((interview) => (
            <div
              className={`application-item ${isSameLocalDay(interview.scheduled_at) ? "due-today" : ""}`}
              key={interview.id}
            >
              <div className="application-info">
                <strong>
                  {interview.company} — {interview.role}
                </strong>
                <span>
                    {interview.interview_type} · {formatDateTime(interview.scheduled_at)}
                    {isSameLocalDay(interview.scheduled_at) ? " · Today" : ""}
                </span>
                {interview.meeting_link ? (
                  interview.meeting_link.startsWith("http") ? (
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="job-link"
                    >
                      Join meeting
                    </a>
                  ) : (
                    <span>{interview.meeting_link}</span>
                  )
                ) : null}
                {interview.notes ? <span>{interview.notes}</span> : null}
              </div>
              <div className="application-actions">
                <select
                  value={interview.status}
                  onChange={(event) =>
                    handleStatusChange(interview.id, event.target.value)
                  }
                  className={`status-select ${statusClass(interview.status)}`}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(interview)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(interview.id)}
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

export default Interviews;
