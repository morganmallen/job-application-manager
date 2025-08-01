import React from "react";
import "./StatusChart.css";

interface ApplicationStats {
  total: number;
  applied: number;
  inProgress: number;
  rejected: number;
  accepted: number;
  jobOffered: number;
  withdrawn: number;
}

interface StatusChartProps {
  stats: ApplicationStats;
}

const StatusChart: React.FC<StatusChartProps> = ({ stats }) => {
  const statusData = [
    { label: "Applied", value: stats.applied, color: "#007bff" },
    { label: "In Progress", value: stats.inProgress, color: "#fd7e14" },
    { label: "Rejected", value: stats.rejected, color: "#dc3545" },
    { label: "Accepted", value: stats.accepted, color: "#28a745" },
    { label: "Job Offered", value: stats.jobOffered, color: "#6f42c1" },
    { label: "Withdrawn", value: stats.withdrawn, color: "#6c757d" },
  ];

  const maxValue = Math.max(...statusData.map((item) => item.value));

  return (
    <div className="status-chart">
      <div className="status-chart__bars">
        {statusData.map((item, index) => (
          <div key={index} className="status-chart__bar-container">
            <div className="status-chart__label">{item.label}</div>
            <div className="status-chart__bar-wrapper">
              <div
                className="status-chart__bar"
                style={{
                  width:
                    maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                  backgroundColor: item.color,
                }}
              />
              <span className="status-chart__value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="status-chart__legend">
        {statusData.map((item, index) => (
          <div key={index} className="status-chart__legend-item">
            <div
              className="status-chart__legend-color"
              style={{ backgroundColor: item.color }}
            />
            <span className="status-chart__legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusChart;
