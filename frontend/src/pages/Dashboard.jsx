function Dashboard() {
  return (
    <main className="dashboard">
      <h1>Dashboard</h1>

      <p>Welcome to JobFlow.</p>

      <section className="stats">
        <div className="stat-card">
          <h3>Applications</h3>
          <p>0</p>
        </div>

        <div className="stat-card">
          <h3>Interviews</h3>
          <p>0</p>
        </div>

        <div className="stat-card">
          <h3>Offers</h3>
          <p>0</p>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
