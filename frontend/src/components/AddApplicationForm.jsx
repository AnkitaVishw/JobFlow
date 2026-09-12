import { useState } from "react";

function AddApplicationForm({ onAddApplication }) {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    jobUrl: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onAddApplication(formData);

    setFormData({
      company: "",
      role: "",
      location: "",
      status: "Applied",
      salary: "",
      jobUrl: "",
    });
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

      <button type="submit" className="submit-btn">
        Add Application
      </button>
    </form>
  );
}

export default AddApplicationForm;
