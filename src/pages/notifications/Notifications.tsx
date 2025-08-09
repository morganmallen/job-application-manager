import React, { useEffect, useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  status: "UNREAD" | "READ";
  type: "INTERVIEW_REMINDER" | "APPLICATION_UPDATE" | "SYSTEM";
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (e) {
      console.error(e);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) return <div className="app page-root"><main className="board-main"><p>Loading notifications...</p></main></div>;
  if (error) return <div className="app page-root"><main className="board-main"><p>{error}</p></main></div>;

  return (
    <div className="app page-root">
      <main className="board-main" style={{ maxWidth: 720, margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>All Notifications</h2>
          {notifications.some((n) => n.status === "UNREAD") && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>Mark all read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 12,
                background: n.status === "UNREAD" ? "rgba(79,195,247,0.06)" : "#0e172a"
              }}>
                <div style={{ fontSize: 20 }}>
                  {n.type === "INTERVIEW_REMINDER" ? "📅" : n.type === "APPLICATION_UPDATE" ? "📝" : "🔔"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0 }}>{n.title}</h4>
                    <small style={{ color: "#94a3b8" }}>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#e2e8f0" }}>{n.message}</p>
                </div>
                {n.status === "UNREAD" && (
                  <button className="mark-all-read-btn" onClick={() => markOneRead(n.id)}>Mark read</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
