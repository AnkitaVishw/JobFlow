import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useResumes from "../hooks/useResumes";
import { todayISO } from "../utils/datetime";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  salary: "",
  jobUrl: "",
  date_applied: todayISO(),
  follow_up_on: "",
  next_action: "",
  resume: "",
  recruiter_name: "",
  recruiter_email: "",
  recruiter_linkedin: "",
};

function defaultResumeId(resumes) {
  const defaultResume = resumes.find((resume) => resume.is_default);
  if (defaultResume) {
    return String(defaultResume.id);
  }
  if (resumes.length === 1) {
    return String(resumes[0].id);
  }
  return "";
}

function formFromApplication(application, resumes = []) {
  if (!application) {
    return {
      ...emptyForm,
      date_applied: todayISO(),
      resume: defaultResumeId(resumes),
    };
  }

  return {
    company: application.company || "",
    role: application.role || "",
    location: application.location || "",
    salary: application.salary || "",
    jobUrl: application.job_url || "",
    date_applied: application.date_applied || todayISO(),
    follow_up_on: application.follow_up_on || "",
    next_action: application.next_action || "",
    resume: application.resume ? String(application.resume) : "",
    recruiter_name: application.recruiter_name || "",
    recruiter_email: application.recruiter_email || "",
    recruiter_linkedin: application.recruiter_linkedin || "",
  };
}

function AddApplicationForm({
  onAddApplication,
  editingApplication,
  onUpdateApplication,
  onCancelEdit,
}) {
  const { resumes } = useResumes();
  const [formData, setFormData] = useState(
    formFromApplication(editingApplication, resumes),
  );

  useEffect(() => {
    setFormData(formFromApplication(editingApplication, resumes));
  }, [editingApplication]);

  useEffect(() => {
    if (editingApplication) {
      return;
    }

    setFormData((current) => {
      if (current.resume) {
        return current;
      }

      const resumeId = defaultResumeId(resumes);
      if (!resumeId) {
        return current;
      }

      return { ...current, resume: resumeId };
    });
  }, [resumes, editingApplication]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      salary: formData.salary.trim(),
      job_url: formData.jobUrl.trim(),
      date_applied: formData.date_applied,
      follow_up_on: formData.follow_up_on || null,
      next_action: formData.next_action.trim(),
      resume: formData.resume ? Number(formData.resume) : null,
      recruiter_name: formData.recruiter_name.trim(),
      recruiter_email: formData.recruiter_email.trim(),
      recruiter_linkedin: formData.recruiter_linkedin.trim(),
    };

    if (editingApplication) {
      await onUpdateApplication(editingApplication.id, payload);
    } else {
      const saved = await onAddApplication(payload);
      if (saved !== false) {
        setFormData(formFromApplication(null, resumes));
      }
    }
  };

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="e.g. Google"
          required
        />
      </div>

      <div className="form-group">
        <label>Job Role</label>
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="e.g. Frontend Developer"
          required
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Bengaluru"
        />
      </div>

      <div className="form-group">
        <label>Salary</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="e.g. ₹8 LPA"
        />
      </div>

      <div className="form-group">
        <label>Job URL</label>
        <input
          type="url"
          name="jobUrl"
          value={formData.jobUrl}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div className="form-group">
        <label>Resume used</label>
        <select name="resume" value={formData.resume} onChange={handleChange}>
          <option value="">Select a resume</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title}
              {resume.is_default ? " (Default)" : ""}
              {resume.target_role ? ` — ${resume.target_role}` : ""}
            </option>
          ))}
        </select>
        {resumes.length === 0 ? (
          <span className="field-hint">
            No resumes yet. <Link to="/resumes">Add a resume</Link> first.
          </span>
        ) : null}
      </div>

      <div className="form-group">
        <label>Date applied</label>
        <input
          type="date"
          name="date_applied"
          value={formData.date_applied}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Follow up on</label>
        <input
          type="date"
          name="follow_up_on"
          value={formData.follow_up_on}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Next action</label>
        <input
          type="text"
          name="next_action"
          value={formData.next_action}
          onChange={handleChange}
          placeholder="e.g. Mail recruiter, prep system design"
        />
      </div>

      <div className="form-group">
        <label>Recruiter name</label>
        <input
          type="text"
          name="recruiter_name"
          value={formData.recruiter_name}
          onChange={handleChange}
          placeholder="e.g. Priya Sharma"
        />
      </div>

      <div className="form-group">
        <label>Recruiter email</label>
        <input
          type="email"
          name="recruiter_email"
          value={formData.recruiter_email}
          onChange={handleChange}
          placeholder="recruiter@company.com"
        />
      </div>

      <div className="form-group">
        <label>Recruiter LinkedIn</label>
        <input
          type="url"
          name="recruiter_linkedin"
          value={formData.recruiter_linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {editingApplication ? "Save Changes" : "Add Application"}
        </button>
        {editingApplication ? (
          <button type="button" className="cancel-btn" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default AddApplicationForm;
