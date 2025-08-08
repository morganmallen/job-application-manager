import React from "react";
import { Link } from "react-router-dom";
import "./EmptyAnalytics.css";

interface EmptyAnalyticsProps {
  onCreateApplication: () => void;
}

const EmptyAnalytics: React.FC<EmptyAnalyticsProps> = ({
  onCreateApplication,
}) => {
  return (
    <div className="empty-analytics">
      <div className="empty-analytics-content">
        <div className="empty-analytics-icon">📊</div>
        <h2 className="empty-analytics-title">No Applications Yet</h2>
        <p className="empty-analytics-description">
          You haven't added any job applications yet. Start tracking your job
          search progress by adding your first application.
        </p>
        <div className="empty-analytics-actions">
          <button
            className="empty-analytics-primary-btn"
            onClick={onCreateApplication}
          >
            + Add Your First Application
          </button>
          <Link to="/board" className="empty-analytics-secondary-btn">
            Go to Board
          </Link>
        </div>
        <div className="empty-analytics-features">
          <h3>What you'll be able to track:</h3>
          <ul>
            <li>📈 Application success rates and trends</li>
            <li>🎯 Response rates from companies</li>
            <li>📅 Monthly application activity</li>
            <li>📊 Status distribution across your applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyAnalytics;
