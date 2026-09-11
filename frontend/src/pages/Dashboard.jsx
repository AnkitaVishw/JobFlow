function Dashboard() {
  const applications = [
    {
      id: 1,
      company: "Google",
      role: "Frontend Developer",
      status: "Interview",
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Software Engineer",
      status: "Applied",
    },
    {
      id: 3,
      company: "Amazon",
      role: "React Developer",
      status: "Rejected",
    },
  ];
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Good morning 👋</h1>
          <p>Here's your job search overview.</p>
        </div>
        <button className="add-job-btn">+ Add Application</button>
      </div>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Application</h3>
          <p>24</p>
        </div>
        <div className="stat-card">
          <h3>Interviews</h3>
          <p>8</p>
        </div>
        <div className="stat-card">
          <h3>Offers</h3>
          <p>2</p>
        </div>

        <div className="stat-card">
          <h3>Offers</h3>
          <p>2</p>
        </div>
        <div className="stat-card">
          <h3>Response Rate</h3>
          <p>33%</p>
        </div>
      </div>
      <div className="dashboard-section">
        <h2>Application Overview</h2>

        <div className="overview-card">
          <p>Application statistics will appear here.</p>
        </div>
      </div>
      <div className="dashboard-section ">
        <h2>Recent Applications</h2>
        <div className="recent-applications">
          {applications.map((application) => (
            <div className="application-row" key={application.id}>
              <div>
                <strong>{application.company}</strong>
                <span>{application.role}</span>
              </div>
              <span className={`status ${application.status.toLowerCase()}`}>
                {application.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
