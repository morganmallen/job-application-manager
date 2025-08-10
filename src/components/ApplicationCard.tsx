import React, { useEffect, useState, useCallback } from "react";
import "./ApplicationCard.css";
import { formatDateForDisplay } from "../utils";

interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
}

interface ApplicationCardData {
  id: string;
  position: string;
  status: string;
  appliedAt: string;
  salary?: string;
  notes?: string;
  location?: string;
  remote: boolean;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationCardProps {
  application: ApplicationCardData;
  onDragStart: (application: ApplicationCardData) => void;
  onViewDetails?: (application: ApplicationCardData) => void;
  isDragging?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDragStart,
  onViewDetails,
  isDragging = false,
}) => {
  const [eventCount, setEventCount] = useState(0);

  const fetchEventCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events?applicationId=${
          application.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const events = await response.json();
        setEventCount(events.length);
      }
    } catch (error) {
      console.error("Failed to fetch event count:", error);
    }
  }, [application.id]);

  useEffect(() => {
    if (application.status === "In progress") {
      fetchEventCount();
    }
  }, [application.status, fetchEventCount]);

  const handleDragStart = () => {
    onDragStart(application);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(application);
    }
  };

  return (
    <div
      className={`application-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
    >
      <div className="card-content">
        <div className="position-header">
          <h3 className="position">{application.position}</h3>
          <div className="position-actions">
            <span className="date">
              {formatDateForDisplay(application.appliedAt)}
            </span>
          </div>
        </div>

        <h4 className="company-name">
          {application.company?.name || "Unknown Company"}
        </h4>

        {application.salary && <p className="salary">{application.salary}</p>}

        {application.status === "In progress" && (
          <div className="events-info">
            <span className="event-count">
              📅 {eventCount} event{eventCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
