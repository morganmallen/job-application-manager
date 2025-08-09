import React, { useState } from "react";
import "./Modal.css";
import { EVENT_TYPES } from "../utils/events";

interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
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

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (eventData: {
    type: string;
    title: string;
    description?: string;
    scheduledAt?: string;
  }) => void;
  application: JobApplication | null;
}


const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  application,
}) => {
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !application) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventType || !title) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm({
        type: eventType,
        title,
        description: description || undefined,
        scheduledAt: scheduledAt || undefined,
      });
      
      setEventType("");
      setTitle("");
      setDescription("");
      setScheduledAt("");
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEventType("");
      setTitle("");
      setDescription("");
      setScheduledAt("");
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="event-creation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Interview Event</h3>
          <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="event-modal-content">
          <div className="application-info">
            <p>
              <strong>{application.position}</strong> at{" "}
              <strong>{application.company.name}</strong>
            </p>
            <p className="application-subtitle">
              Moving to "In Progress" - Add your first interview event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="eventType">Event Type *</label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Technical Interview with Engineering Team"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 1-hour coding challenge followed by system design discussion"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="scheduledAt">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                id="scheduledAt"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isSubmitting}
              />
              <small>Leave empty if not scheduled yet</small>
            </div>
          </form>
        </div>

        <div className="modal-actions">
          <button 
            className="cancel-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleSubmit}
            disabled={!eventType || !title || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event & Move"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreationModal;
