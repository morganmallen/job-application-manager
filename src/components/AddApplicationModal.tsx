import React, { useState } from "react";
import "./Modal.css";
import { getCurrentLocalDateTime } from "../utils";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: {
    position: string;
    companyName: string;
    website?: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
    appliedAt?: string;
  }) => void;
}

const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //Format salary input
  const formatSalary = (value: string): string => {
    // Handle salary ranges (e.g., "50000-100000" or "50000 to 100000")
    if (value.includes("-") || value.toLowerCase().includes("to")) {
      const rangeMatch = value.match(
        /(\d+(?:,\d+)*)\s*[-to]\s*(\d+(?:,\d+)*)/i
      );
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1].replace(/,/g, ""), 10);
        const max = parseInt(rangeMatch[2].replace(/,/g, ""), 10);
        return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
      }
    }

    // Handle single salary values
    const cleanValue = value.replace(/[^\d]/g, "");

    if (cleanValue === "") {
      return "";
    }

    const number = parseInt(cleanValue, 10);
    return `$${number.toLocaleString()}`;
  };

  /**
   * Handles salary input changes in real-time
   * Allows users to type freely without immediate formatting
   */
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSalary(value);
  };

  /**
   * Formats salary when user leaves the salary input field
   * Triggers automatic formatting on blur event
   */
  const handleSalaryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      const formatted = formatSalary(value);
      setSalary(formatted);
    }
  };

  /**
   * Handles keyboard navigation and salary formatting on Enter key
   * - Formats salary if Enter is pressed
   * - Moves focus to the next input field for better UX
   */
  const handleSalaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value;
      if (value.trim()) {
        const formatted = formatSalary(value);
        setSalary(formatted);
      }
      // Move focus to next input field for better keyboard navigation
      const nextInput =
        e.currentTarget.parentElement?.nextElementSibling?.querySelector(
          "input"
        );
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

 //Format website input
  const formatWebsite = (url: string): string => {
    if (!url.trim()) return url;

    let formattedUrl = url.trim();

    formattedUrl = formattedUrl.trim();

    // Add https:// protocol if missing
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    return formattedUrl;
  };

 //Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!position.trim() || !companyName.trim()) {
      setError("Position and company are required");
      return;
    }

    setLoading(true);
    setError("");

    // Create date in local timezone (Peru time)
    const appliedAt = getCurrentLocalDateTime();
    console.log("appliedAt (local time):", appliedAt);
    try {
      // Submit application data with formatted values
      await onSubmit({
        position: position.trim(),
        companyName: companyName.trim(),
        website: website.trim() ? formatWebsite(website) : undefined,
        salary: salary.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        remote,
        appliedAt,
      });

      // Reset form
      setPosition("");
      setCompanyName("");
      setWebsite("");
      setSalary("");
      setLocation("");
      setNotes("");
      setRemote(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Application</h2>
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
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g., netflix.com or https://company.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                id="salary"
                type="text"
                value={salary}
                onChange={handleSalaryChange}
                onBlur={handleSalaryBlur}
                onKeyDown={handleSalaryKeyDown}
                placeholder="e.g., $80,000 or $50,000-$100,000"
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
              {loading ? "Adding..." : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationModal;
