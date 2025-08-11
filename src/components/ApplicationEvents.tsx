import React, { useState, useEffect, useCallback } from "react";
import "./ApplicationEvents.css";
import {
  EVENT_TYPE_LABELS,
  fetchEventsForApplication,
  createEvent,
} from "../utils/events";
import type { InterviewEvent } from "../utils/events";

type Event = InterviewEvent;

interface ApplicationEventsProps {
  applicationId: string;
  isVisible: boolean;
  canAdd?: boolean;
  onAdded?: () => void;
}

const ApplicationEvents: React.FC<ApplicationEventsProps> = ({
  applicationId,
  isVisible,
  canAdd = true,
  onAdded,
}) => {
  // State for events list and UI controls
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding new events
  const [newEvent, setNewEvent] = useState({
    type: "",
    title: "",
    description: "",
    scheduledAt: "",
  });

  // Fetch events for the current application
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const data = await fetchEventsForApplication(token || "", applicationId);
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Load events when component becomes visible
  useEffect(() => {
    if (isVisible && applicationId) {
      fetchEvents();
    }
  }, [isVisible, applicationId, fetchEvents]);

  // Hide add form if adding is not allowed
  useEffect(() => {
    if (!canAdd && showAddForm) {
      setShowAddForm(false);
    }
  }, [canAdd, showAddForm]);

  // Handle form submission for adding new events
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAdd || !newEvent.type || !newEvent.title) return;

    try {
      const token = localStorage.getItem("access_token");
      await createEvent(token || "", { ...newEvent, applicationId });
      setNewEvent({ type: "", title: "", description: "", scheduledAt: "" });
      setShowAddForm(false);
      fetchEvents();
      if (onAdded) onAdded();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  // Format date for display in event list
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine event status based on completion and scheduling
  const getEventStatus = (event: Event) => {
    if (event.completedAt) return "completed";
    if (event.scheduledAt && new Date(event.scheduledAt) < new Date())
      return "history";
    if (event.scheduledAt) return "scheduled";
    return "pending";
  };

  // Don't render if component is not visible
  if (!isVisible) return null;

  return (
    <div className="application-events">
      <div className="events-header">
        <h4>Interview Events ({events.length})</h4>
        {canAdd && (
          <button
            className="add-event-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "+ Add Event"}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form onSubmit={handleAddEvent} className="add-event-form">
          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>
              <select
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, type: e.target.value })
                }
                required
              >
                <option value="">Select type</option>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="e.g., Technical Interview"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={newEvent.scheduledAt}
              onChange={(e) =>
                setNewEvent({ ...newEvent, scheduledAt: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Add Event
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="events-loading">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="no-events">
          <p>
            {canAdd
              ? "No events yet. Add your first interview event!"
              : "No events yet. Events will appear here when the application moves to 'In Progress'."}
          </p>
        </div>
      ) : (
        <div className="events-list">
          {(() => {
            const now = new Date();

            // Filter and sort upcoming events
            const upcoming = events
              .filter(
                (e) =>
                  e.scheduledAt &&
                  !e.completedAt &&
                  new Date(e.scheduledAt) > now
              )
              .sort(
                (a, b) =>
                  new Date(a.scheduledAt as string).getTime() -
                  new Date(b.scheduledAt as string).getTime()
              );

            // Filter and sort historical events
            const history = events
              .filter(
                (e) =>
                  !!e.completedAt ||
                  (!!e.scheduledAt && new Date(e.scheduledAt) <= now) ||
                  !e.scheduledAt
              )
              .sort((a, b) => {
                const aDate = new Date(
                  (a.completedAt || a.scheduledAt || a.createdAt) as string
                ).getTime();
                const bDate = new Date(
                  (b.completedAt || b.scheduledAt || b.createdAt) as string
                ).getTime();
                return bDate - aDate;
              });

            return (
              <>
                {upcoming.length > 0 && (
                  <div className="events-subsection">
                    <h5 className="events-subheader">Upcoming</h5>
                    {upcoming.map((event) => (
                      <div
                        key={event.id}
                        className={`event-item ${getEventStatus(event)}`}
                      >
                        <div className="event-header">
                          <span className="event-type">
                            {EVENT_TYPE_LABELS[event.type] || event.type}
                          </span>
                          <span
                            className={`event-status ${getEventStatus(event)}`}
                          >
                            {getEventStatus(event)}
                          </span>
                        </div>
                        <h5 className="event-title">{event.title}</h5>
                        {event.description && (
                          <p className="event-description">
                            {event.description}
                          </p>
                        )}
                        {event.scheduledAt && (
                          <p className="event-scheduled">
                            📅 {formatDate(event.scheduledAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {history.length > 0 && (
                  <div className="events-subsection">
                    <h5 className="events-subheader">History</h5>
                    {history.map((event) => (
                      <div
                        key={event.id}
                        className={`event-item ${getEventStatus(event)}`}
                      >
                        <div className="event-header">
                          <span className="event-type">
                            {EVENT_TYPE_LABELS[event.type] || event.type}
                          </span>
                          <span
                            className={`event-status ${getEventStatus(event)}`}
                          >
                            {getEventStatus(event)}
                          </span>
                        </div>
                        <h5 className="event-title">{event.title}</h5>
                        {event.description && (
                          <p className="event-description">
                            {event.description}
                          </p>
                        )}
                        {event.scheduledAt && (
                          <p className="event-scheduled">
                            📅 {formatDate(event.scheduledAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ApplicationEvents;
