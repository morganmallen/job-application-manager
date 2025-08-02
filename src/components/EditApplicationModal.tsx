import React, { useState, useEffect } from "react";
import "./Modal.css";

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

interface EditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    applicationId: string,
    applicationData: {
      position: string;
      companyName: string;
      salary?: string;
      location?: string;
      notes?: string;
      remote?: boolean;
      status: string;
    }
  ) => void;
  application: JobApplication | null;
}

const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  application,
}) => {
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [remote, setRemote] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatSalary = (value: string): string => {
    const cleanValue = value.replace(/[^\d]/g, "");

    if (cleanValue === "") {
      return "";
    }

    const number = parseInt(cleanValue, 10);
    return `$${number.toLocaleString()}`;
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatSalary(value);
    setSalary(formatted);
  };

  useEffect(() => {
    if (application) {
      setPosition(application.position);
      setCompanyName(application.company.name);
      setSalary(application.salary || "");
      setLocation(application.location || "");
      setNotes(application.notes || "");
      setRemote(application.remote);
      setStatus(application.status);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!application || !position.trim() || !companyName.trim()) {
      setError("Position and company are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(application.id, {
        position: position.trim(),
        companyName: companyName.trim(),
        salary: salary.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        remote,
        status,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Application</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Microsoft, Apple"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Applied">Applied</option>
              <option value="In progress">In Progress</option>
              <option value="Job Offered">Job Offered</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdraw">Withdraw</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                id="salary"
                type="text"
                value={salary}
                onChange={handleSalaryChange}
                placeholder="e.g., $80,000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this application..."
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
              />
              Remote position
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplicationModal;
