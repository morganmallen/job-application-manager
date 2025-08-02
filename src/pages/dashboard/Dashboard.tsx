import React from "react";
import RecentActivityList from "../../components/overview/RecentActivity";
import "./Dashboard.css";
import StatisticsCards from "../../components/overview/StatisticsCard";

const OverviewDashboard = () => {
  const stats = {
    totalApplications: 42,
    interviewsScheduled: 8,
    offersReceived: 3,
    rejections: 12,
    pending: 19,
  };

  const recentActivities = [
    {
      id: 1,
      action: "Moved application to 'First Interview'",
      date: "2025-08-01",
      status: "Interview",
      description: "Application moved to first interview stage.",
    },
    {
      id: 2,
      action: "Submitted resume to TechCorp",
      date: "2025-07-31",
      status: "Submitted",
      description: "Resume submitted to TechCorp.",
    },
    {
      id: 3,
      action: "Received rejection from WebStart",
      date: "2025-07-30",
      status: "Rejected",
      description: "Received a rejection from WebStart.",
    },
    {
      id: 4,
      action: "Scheduled interview with DevX",
      date: "2025-07-29",
      status: "Interview Scheduled",
      description: "Interview scheduled with DevX.",
    },
    {
      id: 5,
      action: "Moved application to 'Waiting for Response'",
      date: "2025-07-28",
      status: "Pending",
      description: "Application is waiting for response.",
    },
  ];

  return (
    <div className="app page-root">
      <main className="main-content">
        <section className="hero-section">
          <h1>Overview Dashboard</h1>
          <p>
            Track your job applications and stay updated with your latest
            progress.
          </p>
        </section>

        <section className="statistics-section">
          <h2 style={{ color: "#e0e6f7", marginBottom: "1rem" }}>Statistics</h2>
          <StatisticsCards
            stats={Object.entries(stats).map(([key, value]) => ({
              label: key,
              count: value,
            }))}
          />
        </section>

        <section className="activity-section" style={{ marginTop: "3rem" }}>
          <h2 style={{ color: "#e0e6f7", marginBottom: "1rem" }}>
            Recent Activity
          </h2>
          <RecentActivityList activities={recentActivities} />
        </section>
      </main>
    </div>
  );
};

export default OverviewDashboard;
