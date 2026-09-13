import { Briefcase, CheckCircle2 } from "lucide-react";

const highlights = [
  "See what is due today",
  "Keep recruiter details with each job",
  "Know which resume you sent",
];

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <span className="auth-logo-mark">
              <Briefcase size={18} />
            </span>
            JobFlow
          </div>
          <h1>Track every application in one place.</h1>
          <p>
            Sign in to manage jobs, interviews, resumes, and follow-ups from a
            single dashboard.
          </p>
          <ul>
            {highlights.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="auth-panel">{children}</main>
    </div>
  );
}

export default AuthLayout;
