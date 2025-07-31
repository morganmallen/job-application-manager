import React from "react";
import "./TimelineChart.css";

interface MonthlyData {
  month: string;
  applied: number;
  inProgress: number;
  rejected: number;
  accepted: number;
}

interface TimelineChartProps {
  data: MonthlyData[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="timeline-chart">
        <div className="timeline-chart__empty">
          <p>No data available for timeline chart</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((item) => [
      item.applied,
      item.inProgress,
      item.rejected,
      item.accepted,
    ])
  );

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="timeline-chart">
      <div className="timeline-chart__container">
        <div className="timeline-chart__y-axis">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="timeline-chart__y-tick">
              <span className="timeline-chart__y-label">{tick}%</span>
            </div>
          ))}
        </div>

        <div className="timeline-chart__chart">
          <div className="timeline-chart__grid">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="timeline-chart__grid-line"
                style={{ top: `${100 - tick}%` }}
              />
            ))}
          </div>

          <div className="timeline-chart__lines">
            {/* Applied line */}
            <svg
              className="timeline-chart__line"
              viewBox={`0 0 ${data.length * 100} 100`}
            >
              <polyline
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100 + 50},${
                        100 - (item.applied / maxValue) * 100
                      }`
                  )
                  .join(" ")}
                stroke="#007bff"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* In Progress line */}
            <svg
              className="timeline-chart__line"
              viewBox={`0 0 ${data.length * 100} 100`}
            >
              <polyline
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100 + 50},${
                        100 - (item.inProgress / maxValue) * 100
                      }`
                  )
                  .join(" ")}
                stroke="#fd7e14"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Rejected line */}
            <svg
              className="timeline-chart__line"
              viewBox={`0 0 ${data.length * 100} 100`}
            >
              <polyline
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100 + 50},${
                        100 - (item.rejected / maxValue) * 100
                      }`
                  )
                  .join(" ")}
                stroke="#dc3545"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Accepted line */}
            <svg
              className="timeline-chart__line"
              viewBox={`0 0 ${data.length * 100} 100`}
            >
              <polyline
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100 + 50},${
                        100 - (item.accepted / maxValue) * 100
                      }`
                  )
                  .join(" ")}
                stroke="#28a745"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          <div className="timeline-chart__x-axis">
            {data.map((item, index) => (
              <div key={index} className="timeline-chart__x-tick">
                <span className="timeline-chart__x-label">
                  {formatMonth(item.month)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="timeline-chart__legend">
        <div className="timeline-chart__legend-item">
          <div
            className="timeline-chart__legend-color"
            style={{ backgroundColor: "#007bff" }}
          />
          <span>Applied</span>
        </div>
        <div className="timeline-chart__legend-item">
          <div
            className="timeline-chart__legend-color"
            style={{ backgroundColor: "#fd7e14" }}
          />
          <span>In Progress</span>
        </div>
        <div className="timeline-chart__legend-item">
          <div
            className="timeline-chart__legend-color"
            style={{ backgroundColor: "#dc3545" }}
          />
          <span>Rejected</span>
        </div>
        <div className="timeline-chart__legend-item">
          <div
            className="timeline-chart__legend-color"
            style={{ backgroundColor: "#28a745" }}
          />
          <span>Accepted</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
