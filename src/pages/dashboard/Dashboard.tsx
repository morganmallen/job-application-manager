import { useEffect, useState } from "react";
import RecentActivityList from "../../components/overview/RecentActivity";
import StatisticsCards from "../../components/overview/StatisticsCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Loading } from "../../components/loading";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import { activeCardsAtom } from "../../store/dashboardAtoms";

// Type for recent activity items
interface RecentActivity {
  id: string;
  type: "application" | "event" | "note";
  title: string;
  description: string;
  date: string;
  status?: string;
  companyName?: string;
  position?: string;
}

const OverviewDashboard = () => {
  // Jotai atom for statistics
  const [stats] = useAtom(activeCardsAtom);
  const setActiveCards = useSetAtom(activeCardsAtom);

  // Local state for loading, username, and recent activities
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const navigate = useNavigate();

  // Fetch statistics and recent activity on mount
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    // Fetch job applications for statistics
    fetch(`${import.meta.env.VITE_API_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Count applications per status/category
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
      .catch((error) => {
        console.error("Failed to fetch applications:", error);
      });

    // Fetch recent activity (limit to 5)
    fetch(`${import.meta.env.VITE_API_URL}/recent-activity?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRecentActivities(data);
      })
      .catch((error) => {
        console.error("Failed to fetch recent activity:", error);
        setRecentActivities([]);
      })
      .finally(() => setLoading(false));

    // Get username from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(userData.first_name || "User");
  }, [setActiveCards]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <main className="main-content">
          <Loading message="Loading dashboard data..." fullScreen={false} />
        </main>
        <Footer />
      </div>
    );
  }

  // Main dashboard layout
  return (
    <div className="app page-root">
      <Header />
      <main className="main-content">
        {/* Greeting section */}
        <section className="greetings">
          <h1>Welcome in, {username}!</h1>
        </section>
        {/* Dashboard hero section */}
        <section className="hero-section">
          <h1>Overview Dashboard</h1>
          <p>
            Track your job applications and stay updated with your latest
            progress.
          </p>
          {/* Button to go to board page */}
          <button
            className="go-to-board-button"
            onClick={() => navigate("/board")}
          >
            Go to Board
          </button>
        </section>

        {/* Statistics and recent activity grid */}
        <div className="dashboard-grid">
          {/* Statistics cards */}
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

          {/* Recent activity list */}
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
