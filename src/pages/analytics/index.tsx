import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Loading } from "../../components/loading";
import { ErrorHandler } from "../../components/error-handling";
import { useErrorHandler } from "../../hooks/error-handling";
import "./styles.css";
import {
  AnalyticsCard,
  StatusChart,
  TimelineChart,
  EmptyAnalytics,
} from "../../components/analytics";
import AddApplicationModal from "../../components/AddApplicationModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

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

  const handleCreateApplication = async (applicationData: {
    position: string;
    companyName: string;
    website?: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
  }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Create company first
      const companyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/companies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: applicationData.companyName,
            website: applicationData.website,
            location: applicationData.location,
          }),
        }
      );

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.message || "Failed to create company");
      }

      const newCompany = await companyResponse.json();

      // Create application
      const applicationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            position: applicationData.position,
            companyId: newCompany.id,
            salary: applicationData.salary,
            location: applicationData.location,
            notes: applicationData.notes,
            remote: applicationData.remote,
            status: "Applied",
            appliedAt: new Date().toISOString(),
          }),
        }
      );

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.message || "Failed to create application");
      }

      // Refresh analytics data
      await fetchAnalytics();
      setIsModalOpen(false);
    } catch (err: any) {
      handleError(err);
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
          <Loading />
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

  // Check if user has no applications
  if (stats.total === 0) {
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
          <EmptyAnalytics onCreateApplication={() => setIsModalOpen(true)} />
        </div>
        <Footer />
        <AddApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateApplication}
        />
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
