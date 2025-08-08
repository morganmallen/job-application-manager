import { useState, useEffect } from "react";
import "./styles.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  AnalyticsCard,
  StatusChart,
  TimelineChart,
} from "../../components/analytics";
import { ErrorHandler } from "../../components";
import { useErrorHandler } from "../../hooks";

interface ApplicationStats {
  total: number;
  applied: number;
  inProgress: number;
  rejected: number;
  accepted: number;
  jobOffered: number;
  withdrawn: number;
}

interface MonthlyData {
  month: string;
  applied: number;
  inProgress: number;
  rejected: number;
  accepted: number;
}

const Analytics = () => {
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    applied: 0,
    inProgress: 0,
    rejected: 0,
    accepted: 0,
    jobOffered: 0,
    withdrawn: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError, setCustomError } = useErrorHandler();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Create a proper error object that parseServerError can handle
        const error = {
          response: {
            status: response.status,
            data: errorData,
          },
        };
        throw error;
      }

      const data = await response.json();
      setStats(data.stats);
      setMonthlyData(data.monthlyData);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = () => {
    if (stats.total === 0) return 0;
    return (((stats.accepted + stats.jobOffered) / stats.total) * 100).toFixed(
      1
    );
  };

  const calculateResponseRate = () => {
    if (stats.applied === 0) return 0;
    const responded =
      stats.inProgress + stats.rejected + stats.accepted + stats.jobOffered;
    return ((responded / stats.applied) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <div className="analytics-page">
          <div className="analytics-header">
            <h1 className="analytics-title">Application Analytics</h1>
            <p className="analytics-subtitle">
              Track your job search progress and performance
            </p>
          </div>
          <div className="loading-spinner">Loading analytics...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app page-root">
        <Header />
        <div className="analytics-page">
          <div className="analytics-header">
            <h1 className="analytics-title">Application Analytics</h1>
            <p className="analytics-subtitle">
              Track your job search progress and performance
            </p>
          </div>
          <ErrorHandler error={error} onDismiss={clearError} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app page-root">
      <Header />
      <div className="analytics-page">
        <div className="analytics-header">
          <h1 className="analytics-title">Application Analytics</h1>
          <p className="analytics-subtitle">
            Track your job search progress and performance
          </p>
        </div>

        <div className="analytics-grid">
          <AnalyticsCard
            title="Total Applications"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <AnalyticsCard
            title="Success Rate"
            value={`${calculateSuccessRate()}%`}
            icon="🎯"
            color="green"
          />
          <AnalyticsCard
            title="Response Rate"
            value={`${calculateResponseRate()}%`}
            icon="📞"
            color="orange"
          />
          <AnalyticsCard
            title="Active Applications"
            value={stats.inProgress}
            icon="⏳"
            color="purple"
          />
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h2 className="chart-title">Application Status Distribution</h2>
            <StatusChart stats={stats} />
          </div>

          <div className="chart-container">
            <h2 className="chart-title">Monthly Application Trends</h2>
            <TimelineChart data={monthlyData} />
          </div>
        </div>

        <div className="detailed-stats">
          <h2 className="section-title">Detailed Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Applied</span>
              <span className="stat-value">{stats.applied}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{stats.inProgress}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rejected</span>
              <span className="stat-value">{stats.rejected}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accepted</span>
              <span className="stat-value">{stats.accepted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Job Offered</span>
              <span className="stat-value">{stats.jobOffered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Withdrawn</span>
              <span className="stat-value">{stats.withdrawn}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;
