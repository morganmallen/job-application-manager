import React from 'react';
import './ApplicationCard.css';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  salary?: string;
  notes?: string;
}

interface ApplicationCardProps {
  application: JobApplication;
  onDragStart: (application: JobApplication) => void;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (applicationId: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDragStart,
  onEdit,
  onDelete
}) => {
  const handleDragStart = () => {
    onDragStart(application);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(application);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(application.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="application-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="card-actions">
        {onEdit && (
          <button 
            className="card-action-btn edit-btn" 
            onClick={handleEdit}
            title="Edit application"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button 
            className="card-action-btn delete-btn" 
            onClick={handleDelete}
            title="Delete application"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="card-header">
        <h4 className="company-name">{application.company}</h4>
        <span className="date">{formatDate(application.dateApplied)}</span>
      </div>
      
      <p className="position">{application.position}</p>
      
      {application.salary && (
        <p className="salary">{application.salary}</p>
      )}
      
      {application.notes && (
        <p className="notes">{application.notes}</p>
      )}
      
      <div className="card-footer">
        <span className="application-id">#{application.id}</span>
      </div>
    </div>
  );
};

export default ApplicationCard;