import React from "react";

interface Activity {
  status: string;
  date: string;
  description: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div
      style={{
        background: "#1d293e",
        borderRadius: "12px",
        padding: "1.5rem",
        color: "#e0e6f7",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#fff", fontSize: "1.5rem" }}>
        Recent Activity
      </h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {activities.map((activity, index) => (
          <li
            key={index}
            style={{
              marginBottom: "1rem",
              borderBottom: "1px solid #2c3e50",
              paddingBottom: "0.5rem",
            }}
          >
            <strong>{activity.status}</strong> – <span>{activity.date}</span>
            <br />
            <small>{activity.description}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
