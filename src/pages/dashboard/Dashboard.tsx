import RecentActivityList from "../../components/overview/RecentActivity";
import StatisticsCards from "../../components/overview/StatisticsCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { activeCardsAtom } from "../../store/dashboardAtoms";

const OverviewDashboard = () => {
  const [stats] = useAtom(activeCardsAtom);
  const setActiveCards = useSetAtom(activeCardsAtom);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/signin");
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const columns = [
          "Applied",
          "In progress",
          "Job Offered",
          "Accepted",
          "Rejected",
          "Withdraw",
        ];
        const cardCountsByCategory: Record<string, number> = {};
        columns.forEach((col) => {
          cardCountsByCategory[col] = data.filter(
            (app: any) => app.status === col
          ).length;
        });
        setActiveCards(cardCountsByCategory);
      })
      .finally(() => setLoading(false));
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(userData.first_name || "User");
  }, [navigate, setActiveCards]);

  const safeStats = stats || {
    Applied: 0,
    "In progress": 0,
    "Job Offered": 0,
    Accepted: 0,
    Rejected: 0,
    Withdraw: 0,
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

  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="hero-section p">Loading dashboard data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app page-root">
      <Header />
      <main className="main-content">
        <section className="greetings">
          <h1>Welcome in, {username}!</h1>
        </section>
        <section className="hero-section">
          <h1>Overview Dashboard</h1>
          <p>
            Track your job applications and stay updated with your latest
            progress.
          </p>

          <button
            className="go-to-board-button"
            onClick={() => navigate("/board")}
          >
            Go to Board
          </button>
        </section>

        <div className="dashboard-grid">
          <section className="statistics-section">
            <h2 style={{ marginBottom: "1rem" }}>Statistics</h2>
            <StatisticsCards
              stats={Object.entries(stats).map(([key, value]) => ({
                label: key,
                count: value,
              }))}
            />
            <button
              className="see-more-button"
              onClick={() => navigate("/analytics")}
            >
              See more...
            </button>
          </section>

          <section className="activity-section">
            <h2 style={{ marginBottom: "1rem" }}>Recent Activity</h2>
            <RecentActivityList activities={recentActivities} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OverviewDashboard;
