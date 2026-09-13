import { Link } from "react-router-dom";
import useApplications from "../hooks/useApplications";
import useInterviews from "../hooks/useInterviews";
import useProfile from "../hooks/useProfile";
import useResumes from "../hooks/useResumes";
import { startOfWeek, toISODate } from "../utils/datetime";
import { isInterviewStage, statusClass } from "../utils/status";

const STATUSES = [
  "Applied",
  "Screening",
  "Interview",
  "Technical Round",
  "Offer",
  "Rejected",
];

function percent(part, total) {
  if (!total) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

function Analytics() {
  const { applications, loading, error } = useApplications();
  const { interviews, loading: interviewsLoading } = useInterviews();
  const { resumes, loading: resumesLoading } = useResumes();
  const { profile, loading: profileLoading } = useProfile();

  const pageLoading =
    loading || interviewsLoading || resumesLoading || profileLoading;
  const total = applications.length;
  const interviewApps = applications.filter((application) =>
    isInterviewStage(application.status),
  ).length;
  const offers = applications.filter(
    (application) => application.status === "Offer",
  ).length;
  const rejected = applications.filter(
    (application) => application.status === "Rejected",
  ).length;
  const reachedInterview = applications.filter((application) =>
    ["Interview", "Technical Round", "Offer"].includes(application.status),
  ).length;
  const responded = applications.filter(
    (application) => application.status && application.status !== "Applied",
  ).length;

  const weekStart = startOfWeek();
  const appliedThisWeek = applications.filter((application) => {
    return (application.date_applied || "") >= toISODate(weekStart);
  }).length;
  const upcomingInterviews = interviews.filter(
    (interview) => interview.status === "Upcoming",
  ).length;
  const weeklyGoal = Number(profile.weekly_goal) || 0;

  const statusCounts = applications.reduce((counts, application) => {
    const status = application.status || "Applied";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const maxStatusCount = Math.max(1, ...STATUSES.map((status) => statusCounts[status] || 0));

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>See how your pipeline, interviews, and weekly goal are doing.</p>
        </div>
      </div>

      {error ? <p className="empty-message">{error}</p> : null}

      <div className="stats">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>{pageLoading ? "—" : total}</p>
        </div>
        <div className="stat-card">
          <h3>Interview Rate</h3>
          <p>{pageLoading ? "—" : `${percent(reachedInterview, total)}%`}</p>
        </div>
        <div className="stat-card">
          <h3>Offer Rate</h3>
          <p>
            {pageLoading ? "—" : `${percent(offers, reachedInterview || total)}%`}
          </p>
        </div>
        <div className="stat-card">
          <h3>Weekly Goal</h3>
          <p>
            {pageLoading
              ? "—"
              : `${appliedThisWeek}/${weeklyGoal || 0}`}
          </p>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>Active Interviews</h3>
          <p>{pageLoading ? "—" : interviewApps}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Rounds</h3>
          <p>{pageLoading ? "—" : upcomingInterviews}</p>
        </div>
        <div className="stat-card">
          <h3>Resume Versions</h3>
          <p>{pageLoading ? "—" : resumes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p>{pageLoading ? "—" : rejected}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Pipeline</h2>
        <div className="overview-card">
          {pageLoading ? (
            <p>Loading analytics...</p>
          ) : total === 0 ? (
            <p>
              Add applications to see analytics.{" "}
              <Link to="/applications">Go to Applications</Link>
            </p>
          ) : (
            <>
              <p className="analytics-rate">
                Response rate: {percent(responded, total)}% · Interview rate:{" "}
                {percent(reachedInterview, total)}% · Offer rate:{" "}
                {percent(offers, total)}%
              </p>
              <div className="funnel">
                {STATUSES.map((status) => {
                  const count = statusCounts[status] || 0;
                  return (
                    <div className="funnel-row" key={status}>
                      <span className={`status ${statusClass(status)}`}>
                        {status}
                      </span>
                      <div className="funnel-bar-track">
                        <div
                          className={`funnel-bar ${statusClass(status)}`}
                          style={{
                            width: `${(count / maxStatusCount) * 100}%`,
                          }}
                        />
                      </div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
