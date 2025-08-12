import React, { useEffect, useState, useCallback } from "react";
import "./ApplicationCard.css";
// import { formatDateForDisplay } from "../utils";

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
  // Track the number of events for this application
  const [eventCount, setEventCount] = useState(0);

  // Fetch event count from API for applications in progress
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

  // Fetch event count when application status is "In progress"
  useEffect(() => {
    if (application.status === "In progress") {
      fetchEventCount();
    }
  }, [application.status, fetchEventCount]);

  // Handle drag start event for drag and drop functionality
  const handleDragStart = () => {
    onDragStart(application);
  };

  // Handle card click to view application details
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
        </div>

        <h4 className="company-name">
          {application.company?.name || "Unknown Company"}
        </h4>

        {application.salary && <p className="salary">{application.salary}</p>}

        {/* Event count display for applications in progress */}
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
