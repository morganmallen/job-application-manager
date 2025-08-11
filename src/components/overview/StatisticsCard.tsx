import React from "react";

// Props for statistics cards
type StatisticsCardProps = {
  stats: { count: number; label: string }[];
};

// Renders a set of statistics cards
const StatisticsCards: React.FC<StatisticsCardProps> = ({ stats }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      {stats.map((item, index) => (
        <div
          key={index}
          style={{
            background: "#1d293e",
            color: "#e0e6f7",
            padding: "1.5rem",
            borderRadius: "12px",
            flex: "1 1 200px",
            boxShadow: "0 4px 12px rgba(30, 41, 59, 0.3)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            {item.count}
          </h2>
          <p style={{ fontSize: "1rem" }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
