import React from 'react';
import './ApplicationCard.css';

interface ApplicationCardData {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  salary?: string;
  notes?: string;
}

interface ApplicationCardProps {
  application: ApplicationCardData;
  onDragStart: (application: ApplicationCardData) => void;
  onEdit?: (application: ApplicationCardData) => void;
  onDelete?: (applicationId: string) => void;
  isDragging?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDragStart,
  onEdit,
  onDelete,
  isDragging = false
}) => {
  const handleDragStart = () => {
    onDragStart(application);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on action buttons or if dragging
    if (e.target instanceof Element) {
      const target = e.target as Element;
      if (target.closest('.card-actions') || target.closest('.card-action-btn')) {
        return;
      }
    }
    
    if (onEdit) {
      onEdit(application);
    }
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
      className={`application-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
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
      
    </div>
  );
};

export default ApplicationCard;