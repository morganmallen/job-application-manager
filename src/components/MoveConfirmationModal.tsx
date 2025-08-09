import React from "react";
import "./Modal.css";

interface JobApplication {
  id: string;
  position: string;
  status: string;
  appliedAt: string;
  salary?: string;
  notes?: string;
  location?: string;
  remote: boolean;
  company: {
    id: string;
    name: string;
    website?: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MoveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingMove: {
    application: JobApplication;
    fromStatus: string;
    toStatus: string;
  } | null;
}

const MoveConfirmationModal: React.FC<MoveConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingMove,
}) => {
  if (!isOpen || !pendingMove) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="move-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Status Change</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="move-details">
            <p>
              Are you sure you want to move{" "}
              <strong>{pendingMove.application.position}</strong> at{" "}
              <strong>{pendingMove.application.company.name}</strong> from{" "}
              <strong>"{pendingMove.fromStatus}"</strong> to{" "}
              <strong>"{pendingMove.toStatus}"</strong>?
            </p>

            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <p>
                This action cannot be undone. The application will be moved to
                the new status immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Move Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveConfirmationModal;
