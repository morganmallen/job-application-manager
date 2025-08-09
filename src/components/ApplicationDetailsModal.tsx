import React, { useEffect, useState, useCallback } from "react";
import "./Modal.css";

interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
}

interface Event {
  id: string;
  type: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface JobApplication {
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

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onUpdate?: (applicationId: string, data: {
    position: string;
    companyName: string;
    website?: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
    status: string;
  }) => Promise<void>;
  onDelete?: (applicationId: string) => Promise<void>;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  TECHNICAL_INTERVIEW: "Technical Interview",
  BEHAVIORAL_INTERVIEW: "Behavioral Interview",
  CODING_CHALLENGE: "Coding Challenge",
  TAKE_HOME_ASSIGNMENT: "Take Home Assignment",
  ONSITE_INTERVIEW: "Onsite Interview",
  REFERENCE_CHECK: "Reference Check",
  NEGOTIATION: "Negotiation",
  OTHER: "Other",
};

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdate,
  onDelete,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: "",
    title: "",
    description: "",
    scheduledAt: "",
  });
  const [editForm, setEditForm] = useState({
    position: "",
    companyName: "",
    website: "",
    salary: "",
    location: "",
    notes: "",
    remote: false,
    status: "",
  });

  const formatSalary = (value: string): string => {
    if (value.includes('-') || value.toLowerCase().includes('to')) {
      const rangeMatch = value.match(/(\d+(?:,\d+)*)\s*[-to]\s*(\d+(?:,\d+)*)/i);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1].replace(/,/g, ''), 10);
        const max = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
        return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
      }
    }

    const cleanValue = value.replace(/[^\d]/g, "");

    if (cleanValue === "") {
      return "";
    }

    const number = parseInt(cleanValue, 10);
    return `$${number.toLocaleString()}`;
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditForm((prev) => ({ ...prev, salary: value }));
  };

  const handleSalaryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      const formatted = formatSalary(value);
      setEditForm((prev) => ({ ...prev, salary: formatted }));
    }
  };

  const handleSalaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value;
      if (value.trim()) {
        const formatted = formatSalary(value);
        setEditForm((prev) => ({ ...prev, salary: formatted }));
      }
      const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const fetchEvents = useCallback(async () => {
    if (!application) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events?applicationId=${application.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [application]);

  useEffect(() => {
    if (isOpen && application) {
      fetchEvents();
      setEditForm({
        position: application.position,
        companyName: application.company.name,
        website: application.company.website || "",
        salary: application.salary || "",
        location: application.location || "",
        notes: application.notes || "",
        remote: application.remote,
        status: application.status,
      });
    }
  }, [isOpen, application, fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application || !newEvent.type || !newEvent.title) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newEvent,
            applicationId: application.id,
          }),
        }
      );

      if (response.ok) {
        setNewEvent({ type: "", title: "", description: "", scheduledAt: "" });
        setShowAddEventForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (event: Event) => {
    if (event.completedAt) return "completed";
    if (event.scheduledAt && new Date(event.scheduledAt) < new Date()) return "history";
    if (event.scheduledAt) return "scheduled";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "#3b82f6";
      case "In progress": return "#f59e0b";
      case "Job Offered": return "#10b981";
      case "Accepted": return "#059669";
      case "Rejected": return "#ef4444";
      case "Withdraw": return "#6b7280";
      default: return "#94a3b8";
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application || !onUpdate) return;

    setIsSubmitting(true);
    try {
      await onUpdate(application.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (application) {
      setEditForm({
        position: application.position,
        companyName: application.company.name,
        website: application.company.website || "",
        salary: application.salary || "",
        location: application.location || "",
        notes: application.notes || "",
        remote: application.remote,
        status: application.status,
      });
    }
  };

  const openDeleteConfirm = () => setConfirmDeleteOpen(true);
  const closeDeleteConfirm = () => setConfirmDeleteOpen(false);
  const handleConfirmDelete = async () => {
    if (!application || !onDelete) return;
    try {
      await onDelete(application.id);
      setConfirmDeleteOpen(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  if (!isOpen || !application) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="application-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Application Details</h3>
          <div className="modal-header-actions">
            {onUpdate && (
              <button 
                className="edit-toggle-btn" 
                onClick={handleEditToggle}
                title={isEditing ? "Cancel editing" : "Edit application"}
              >
                {isEditing ? "✕" : "✏️"}
              </button>
            )}
            {onDelete && (
              <button 
                className="edit-toggle-btn" 
                onClick={openDeleteConfirm}
                title="Delete application"
              >
                🗑️
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="details-modal-content">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-position">Position *</label>
                <input
                  id="edit-position"
                  type="text"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-company">Company *</label>
                <input
                  id="edit-company"
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  placeholder="e.g., Google, Microsoft, Apple"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-website">Website</label>
                <input
                  id="edit-website"
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="e.g., netflix.com or https://company.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-salary">Salary</label>
                  <input
                    id="edit-salary"
                    type="text"
                    value={editForm.salary}
                    onChange={handleSalaryChange}
                    onBlur={handleSalaryBlur}
                    onKeyDown={handleSalaryKeyDown}
                    placeholder="e.g., $80,000 or $50,000-$100,000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Applied">Applied</option>
                  <option value="In progress">In Progress</option>
                  <option value="Job Offered">Job Offered</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdraw">Withdraw</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-notes">Notes</label>
                <textarea
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Any additional notes about this application..."
                  rows={3}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.remote}
                    onChange={(e) => setEditForm({ ...editForm, remote: e.target.checked })}
                  />
                  Remote position
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleEditCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="application-info-section">
                <div className="app-header">
                  <div className="app-title">
                    <h2>{application.position}</h2>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {application.status}
                    </span>
                  </div>
                  <h3 className="company-name">{application.company.name}</h3>
                </div>

                <div className="app-details-grid">
                  <div className="detail-item">
                    <label>Applied Date</label>
                    <span>{formatDate(application.appliedAt)}</span>
                  </div>
                  
                  {application.salary && (
                    <div className="detail-item">
                      <label>Salary</label>
                      <span>{application.salary}</span>
                    </div>
                  )}
                  
                  {application.location && (
                    <div className="detail-item">
                      <label>Location</label>
                      <span>{application.location}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <label>Remote</label>
                    <span>{application.remote ? "Yes" : "No"}</span>
                  </div>
                  
                  {application.company.website && (
                    <div className="detail-item">
                      <label>Website</label>
                      <a 
                        href={application.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {application.notes && (
                  <div className="notes-section">
                    <label>Notes</label>
                    <p className="notes-content">{application.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="events-section">
            <div className="events-header">
              <h4>Interview Events ({events.length})</h4>
              {application.status === "In progress" && (
                <button
                  className="add-event-btn"
                  onClick={() => setShowAddEventForm(!showAddEventForm)}
                >
                  {showAddEventForm ? "Cancel" : "+ Add Event"}
                </button>
              )}
            </div>

            {showAddEventForm && (
              <form onSubmit={handleAddEvent} className="add-event-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
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
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Technical Interview"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.scheduledAt}
                    onChange={(e) => setNewEvent({ ...newEvent, scheduledAt: e.target.value })}
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
                <p>No events yet. {application.status === "In progress" ? "Add your first interview event!" : "Events will appear here when the application moves to 'In Progress'."}</p>
              </div>
            ) : (
              <div className="events-list">
                {(() => {
                  const now = new Date();

                  const upcoming = events
                    .filter((e) => e.scheduledAt && !e.completedAt && new Date(e.scheduledAt) > now)
                    .sort((a, b) => new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime());

                  const history = events
                    .filter((e) =>
                      (e.completedAt) ||
                      (e.scheduledAt && new Date(e.scheduledAt) <= now) ||
                      (!e.scheduledAt)
                    )
                    .sort((a, b) => {
                      const aDate = new Date((a.completedAt || a.scheduledAt || a.createdAt) as string).getTime();
                      const bDate = new Date((b.completedAt || b.scheduledAt || b.createdAt) as string).getTime();
                      return bDate - aDate; 
                    });

                  return (
                    <>
                      {upcoming.length > 0 && (
                        <div className="events-subsection">
                          <h5 className="events-subheader">Upcoming</h5>
                          {upcoming.map((event) => (
                            <div key={event.id} className={`event-item ${getEventStatus(event)}`}>
                              <div className="event-header">
                                <span className="event-type">{EVENT_TYPE_LABELS[event.type] || event.type}</span>
                                <span className={`event-status ${getEventStatus(event)}`}>
                                  {getEventStatus(event)}
                                </span>
                              </div>
                              <h5 className="event-title">{event.title}</h5>
                              {event.description && (
                                <p className="event-description">{event.description}</p>
                              )}
                              {event.scheduledAt && (
                                <p className="event-scheduled">📅 {formatDate(event.scheduledAt)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {history.length > 0 && (
                        <div className="events-subsection">
                          <h5 className="events-subheader">History</h5>
                          {history.map((event) => (
                            <div key={event.id} className={`event-item ${getEventStatus(event)}`}>
                              <div className="event-header">
                                <span className="event-type">{EVENT_TYPE_LABELS[event.type] || event.type}</span>
                                <span className={`event-status ${getEventStatus(event)}`}>
                                  {getEventStatus(event)}
                                </span>
                              </div>
                              <h5 className="event-title">{event.title}</h5>
                              {event.description && (
                                <p className="event-description">{event.description}</p>
                              )}
                              {event.scheduledAt && (
                                <p className="event-scheduled">📅 {formatDate(event.scheduledAt)}</p>
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
        </div>
      </div>

      {confirmDeleteOpen && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="move-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Application</h3>
              <button className="modal-close" onClick={closeDeleteConfirm}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="move-details">
                <p>
                  Are you sure you want to delete <strong>{application.position}</strong> at <strong>{application.company.name}</strong>?
                </p>
                <div className="warning-message">
                  <span className="warning-icon">⚠️</span>
                  <p>This action cannot be undone. The application will be deleted permanently.</p>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeDeleteConfirm}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsModal;
