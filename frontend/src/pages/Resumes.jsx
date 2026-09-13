import { useState } from "react";
import useResumes from "../hooks/useResumes";
import api from "../services/api";

const emptyForm = {
  title: "",
  target_role: "",
  notes: "",
  is_default: false,
};

function Resumes() {
  const { resumes, setResumes, loading, error, setError } = useResumes();
  const [formData, setFormData] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingResume, setEditingResume] = useState(null);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFile(null);
    setEditingResume(null);
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("target_role", formData.target_role.trim());
    payload.append("notes", formData.notes.trim());
    payload.append("is_default", formData.is_default ? "true" : "false");
    if (file) {
      payload.append("file", file);
    }
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingResume) {
        const response = await api.patch(
          `/resumes/${editingResume.id}/`,
          buildPayload(),
        );
        setResumes((current) => {
          const updated = current.map((resume) =>
            resume.id === editingResume.id ? response.data : resume,
          );
          return response.data.is_default
            ? updated.map((resume) =>
                resume.id === response.data.id
                  ? resume
                  : { ...resume, is_default: false },
              )
            : updated;
        });
      } else {
        const response = await api.post("/resumes/", buildPayload());
        setResumes((current) => {
          const next = [response.data, ...current];
          return response.data.is_default
            ? next.map((resume) =>
                resume.id === response.data.id
                  ? resume
                  : { ...resume, is_default: false },
              )
            : next;
        });
      }

      resetForm();
      setError("");
    } catch (err) {
      console.error("Failed to save resume:", err);
      setError("Failed to save resume. Check the form and try again.");
    }
  };

  const handleEdit = (resume) => {
    setEditingResume(resume);
    setFormData({
      title: resume.title || "",
      target_role: resume.target_role || "",
      notes: resume.notes || "",
      is_default: Boolean(resume.is_default),
    });
    setFile(null);
    setError("");
  };

  const handleSetDefault = async (resume) => {
    try {
      const payload = new FormData();
      payload.append("is_default", "true");
      const response = await api.patch(`/resumes/${resume.id}/`, payload);
      setResumes((current) =>
        current.map((item) => ({
          ...item,
          is_default: item.id === resume.id,
          ...(item.id === resume.id ? response.data : {}),
        })),
      );
    } catch (err) {
      console.error("Failed to set default resume:", err);
      setError("Failed to set default resume.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resume version?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/resumes/${id}/`);
      setResumes((current) => current.filter((resume) => resume.id !== id));
      if (editingResume?.id === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setError("Failed to delete resume.");
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Resumes</h1>
          <p>Keep tailored versions ready for the roles you are applying to.</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingResume ? "Edit Resume" : "Add Resume Version"}</h2>
        <p>
          {editingResume
            ? "Update this version or replace the file."
            : "Upload a general resume or a role-specific version."}
        </p>
        {error ? <p className="form-error">{error}</p> : null}

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Resume 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Target role</label>
            <input
              type="text"
              name="target_role"
              value={formData.target_role}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Keywords, companies this version is for..."
            />
          </div>

          <div className="form-group">
            <label>File</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setFile(event.target.files[0] || null)}
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
            />
            Set as default resume
          </label>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingResume ? "Save Changes" : "Add Resume"}
            </button>
            {editingResume ? (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="applications-list">
        <h2>Your Resumes</h2>
        {loading ? (
          <p className="empty-message">Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="empty-message">No resume versions yet.</p>
        ) : (
          resumes.map((resume) => (
            <div className="application-item" key={resume.id}>
              <div className="application-info">
                <strong>
                  {resume.title}
                  {resume.is_default ? " · Default" : ""}
                </strong>
                {resume.target_role ? <span>{resume.target_role}</span> : null}
                {resume.notes ? <span>{resume.notes}</span> : null}
                {resume.file_url ? (
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="job-link"
                  >
                    Open file
                  </a>
                ) : (
                  <span>No file uploaded</span>
                )}
              </div>
              <div className="application-actions">
                {!resume.is_default ? (
                  <button
                    className="edit-btn"
                    onClick={() => handleSetDefault(resume)}
                  >
                    Make default
                  </button>
                ) : (
                  <span className="status offer">Default</span>
                )}
                <button className="edit-btn" onClick={() => handleEdit(resume)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(resume.id)}
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

export default Resumes;
