import React from "react";

interface Activity {
  id: string;
  type: "application" | "event" | "note";
  title: string;
  description: string;
  date: string;
  status?: string;
  companyName?: string;
  position?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return "📝";
      case "event":
        return "📅";
      case "note":
        return "📌";
      default:
        return "📋";
    }
  };

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
      {activities.length === 0 ? (
        <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>
          No recent activity yet
        </p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {activities.map((activity) => (
            <li
              key={activity.id}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #2c3e50",
                paddingBottom: "0.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>
                {getActivityIcon(activity.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.25rem",
                  }}
                >
                  <strong style={{ color: "#fff" }}>{activity.title}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {formatDate(activity.date)}
                  </span>
                </div>
                <small style={{ color: "#9ca3af", lineHeight: "1.4" }}>
                  {activity.description}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
