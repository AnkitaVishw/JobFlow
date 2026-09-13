import { Link } from "react-router-dom";
import useApplications from "../hooks/useApplications";
import useInterviews from "../hooks/useInterviews";
import useProfile from "../hooks/useProfile";
import { formatDateTime, followUpState, formatDate, isSameLocalDay, startOfWeek, toISODate } from "../utils/datetime";
import { isInterviewStage, statusClass } from "../utils/status";

function Dashboard() {
  const { applications, loading, error } = useApplications();
  const { interviews, loading: interviewsLoading } = useInterviews();
  const { profile, loading: profileLoading } = useProfile();

  const total = applications.length;
  const interviewCount = applications.filter((application) =>
    isInterviewStage(application.status),
  ).length;
  const offers = applications.filter(
    (application) => application.status === "Offer",
  ).length;
  const responded = applications.filter(
    (application) => application.status && application.status !== "Applied",
  ).length;
  const responseRate = total === 0 ? 0 : Math.round((responded / total) * 100);
  const weekStart = startOfWeek();
  const appliedThisWeek = applications.filter((application) => {
    return (application.date_applied || "") >= toISODate(weekStart);
  }).length;
  const weeklyGoal = Number(profile.weekly_goal) || 0;
  const followUps = applications
    .filter((application) => {
      if (application.status === "Rejected" || !application.follow_up_on) {
        return false;
      }
      const state = followUpState(application.follow_up_on);
      return state === "overdue" || state === "due-today";
    })
    .sort((a, b) => String(a.follow_up_on).localeCompare(String(b.follow_up_on)));
  const upcomingInterviews = interviews
    .filter((interview) => interview.status === "Upcoming")
    .slice(0, 3);
  const firstName = (profile.full_name || "").trim().split(" ")[0];
  const greeting = firstName ? `Hi ${firstName} 👋` : "Good morning 👋";

  const statusCounts = applications.reduce((counts, application) => {
    const status = application.status || "Applied";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const recentApplications = applications.slice(0, 5);
  const pageLoading = loading || interviewsLoading || profileLoading;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{greeting}</h1>
          <p>
            {profile.target_role
              ? `Tracking your search for ${profile.target_role}.`
              : "Here's your job search overview."}
          </p>
        </div>
        <Link to="/applications" className="add-job-btn">
          + Add Application
        </Link>
      </div>

      {error ? <p className="empty-message">{error}</p> : null}

      <div className="stats">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>{pageLoading ? "—" : total}</p>
        </div>
        <div className="stat-card">
          <h3>Interviews</h3>
          <p>{pageLoading ? "—" : interviewCount}</p>
        </div>
        <div className="stat-card">
          <h3>Offers</h3>
          <p>{pageLoading ? "—" : offers}</p>
        </div>
        <div className="stat-card">
          <h3>Response Rate</h3>
          <p>{pageLoading ? "—" : `${responseRate}%`}</p>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <p>{pageLoading ? "—" : `${appliedThisWeek}/${weeklyGoal || 0}`}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Application Overview</h2>
        <div className="overview-card">
          {pageLoading ? (
            <p>Loading statistics...</p>
          ) : total === 0 ? (
            <p>Add applications to see statistics here.</p>
          ) : (
            <div className="overview-stats">
              {[
                "Applied",
                "Screening",
                "Interview",
                "Technical Round",
                "Offer",
                "Rejected",
              ].map((status) => (
                <div className="overview-stat" key={status}>
                  <span className={`status ${statusClass(status)}`}>
                    {status}
                  </span>
                  <strong>{statusCounts[status] || 0}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {profile.notify_interviews !== false ? (
        <div className="dashboard-section">
          <h2>Upcoming Interviews</h2>
          <div className="recent-applications">
            {pageLoading ? (
              <p>Loading interviews...</p>
            ) : upcomingInterviews.length === 0 ? (
              <p>
                No upcoming rounds.{" "}
                <Link to="/interviews">Schedule an interview</Link>
              </p>
            ) : (
              upcomingInterviews.map((interview) => (
                <div
                  className={`application-row ${isSameLocalDay(interview.scheduled_at) ? "due-today" : ""}`}
                  key={interview.id}
                >
                  <div>
                    <strong>
                      {interview.company} — {interview.role}
                    </strong>
                    <span>
                      {interview.interview_type} ·{" "}
                      {formatDateTime(interview.scheduled_at)}
                      {isSameLocalDay(interview.scheduled_at) ? " · Today" : ""}
                    </span>
                  </div>
                  <span
                    className={`status ${statusClass(interview.status)} ${isSameLocalDay(interview.scheduled_at) ? "due-today" : ""}`}
                  >
                    {isSameLocalDay(interview.scheduled_at)
                      ? "Today"
                      : interview.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="dashboard-section">
        <h2>Follow-ups</h2>
        <div className="recent-applications">
          {pageLoading ? (
            <p>Loading follow-ups...</p>
          ) : followUps.length === 0 ? (
            <p>
              Nothing due today. Add a follow-up date on an application to see
              it here.
            </p>
          ) : (
            followUps.map((application) => {
              const state = followUpState(application.follow_up_on);
              return (
                <div className={`application-row ${state}`} key={application.id}>
                  <div>
                    <strong>{application.company}</strong>
                    <span>
                      {application.next_action || "Follow up"}
                      {application.follow_up_on
                        ? ` · ${formatDate(application.follow_up_on)}`
                        : ""}
                    </span>
                  </div>
                  <span className={`status ${state}`}>
                    {state === "overdue" ? "Overdue" : "Due today"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Applications</h2>
        <div className="recent-applications">
          {pageLoading ? (
            <p>Loading applications...</p>
          ) : recentApplications.length === 0 ? (
            <p>No applications added yet.</p>
          ) : (
            recentApplications.map((application) => (
              <div className="application-row" key={application.id}>
                <div>
                  <strong>{application.company}</strong>
                  <span>{application.role}</span>
                </div>
                <span className={`status ${statusClass(application.status)}`}>
                  {application.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
