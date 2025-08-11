import React, { useState, useEffect } from "react";
import "./Board.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ApplicationCard from "../components/ApplicationCard";
import AddApplicationModal from "../components/AddApplicationModal";
import { Loading } from "../components/loading";
import { useSetAtom } from "jotai";
import { activeCardsAtom } from "../store/dashboardAtoms";
import MoveConfirmationModal from "../components/MoveConfirmationModal";
import EventCreationModal from "../components/EventCreationModal";
import { createEvent } from "../utils/events";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import { getCurrentLocalDateTime, api } from "../utils";

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

const Board = () => {
  // Core application state and UI controls
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Drag and drop state management
  const [draggedItem, setDraggedItem] = useState<JobApplication | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  
  // Modal state management
  const [isMoveConfirmModalOpen, setIsMoveConfirmModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    application: JobApplication;
    fromStatus: string;
    toStatus: string;
  } | null>(null);
  const [isEventCreationModalOpen, setIsEventCreationModalOpen] = useState(false);
  const [pendingEventCreation, setPendingEventCreation] = useState<{
    application: JobApplication;
    fromStatus: string;
    toStatus: string;
  } | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  // Board column definitions for application statuses
  const columns = [
    { id: "Applied", title: "Applied" },
    { id: "In progress", title: "In Progress" },
    { id: "Job Offered", title: "Job Offered" },
    { id: "Accepted", title: "Accepted" },
    { id: "Rejected", title: "Rejected" },
    { id: "Withdraw", title: "Withdraw" },
  ];

  // Workflow rules defining allowed status transitions
  const workflowRules: Record<string, string[]> = {
    Applied: ["In progress", "Rejected", "Withdraw"],
    "In progress": ["Job Offered", "Rejected", "Withdraw"],
    "Job Offered": ["Accepted", "Rejected", "Withdraw"],
    Accepted: ["Rejected", "Withdraw"],
    Rejected: [],
    Withdraw: [],
  };

  // Check if a status move is allowed according to workflow rules
  const isMoveAllowed = (fromStatus: string, toStatus: string): boolean => {
    const allowedMoves = workflowRules[fromStatus];
    return allowedMoves ? allowedMoves.includes(toStatus) : false;
  };

  // Get CSS class for column drop zone based on drag validity
  const getColumnDropZoneClass = (columnId: string): string => {
    if (!draggedItem || !draggedFromColumn) return "";

    const isAllowed = isMoveAllowed(draggedFromColumn, columnId);
    return isAllowed ? "valid-drop-zone" : "invalid-drop-zone";
  };

  // Filter applications by status for column display
  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  // Fetch applications from the database
  const fetchApplications = async () => {
    try {
      const data = await api.applications.getAll();
      setApplications(data);
      setError(""); // Clear any previous errors
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch applications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle creation of new job application with company
  const handleCreateApplication = async (applicationData: {
    position: string;
    companyName: string;
    website?: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
  }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Create or find existing company
      const companyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/companies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: applicationData.companyName,
            website: applicationData.website,
            location: applicationData.location,
          }),
        }
      );

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.message || "Failed to create company");
      }

      const newCompany = await companyResponse.json();
      
      // Create new application
      const applicationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            position: applicationData.position,
            companyId: newCompany.id,
            salary: applicationData.salary,
            location: applicationData.location,
            notes: applicationData.notes,
            remote: applicationData.remote,
            status: "Applied",
            appliedAt: getCurrentLocalDateTime(),
          }),
        }
      );

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.message || "Failed to create application");
      }

      const newApplication = await applicationResponse.json();
      setApplications((prev) => [...prev, newApplication]);
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create application"
      );
    }
  };

  // Update application status via API
  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const updatedApplication = await api.applications.update(applicationId, {
        status: newStatus,
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? updatedApplication : app))
      );
    } catch (err: unknown) {
      console.error("Failed to update application status:", err);
      fetchApplications();
    }
  };

  // Delete application via API
  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (err: unknown) {
      console.error("Failed to delete application:", err);
    }
  };

  // Handle application editing with company management
  const handleEditApplicationSubmit = async (
    applicationId: string,
    applicationData: {
      position: string;
      companyName: string;
      website?: string;
      salary?: string;
      location?: string;
      notes?: string;
      remote?: boolean;
      status: string;
    }
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const currentApplication = applications.find(
        (app) => app.id === applicationId
      );
      if (!currentApplication) {
        throw new Error("Application not found");
      }

      let companyId = currentApplication.company.id;
      
      // Handle company name changes
      if (applicationData.companyName !== currentApplication.company.name) {
        const encodedCompanyName = encodeURIComponent(
          applicationData.companyName
        );

        // Search for existing company
        const existingCompanyResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/companies/search/${encodedCompanyName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (existingCompanyResponse.ok) {
          const existingCompany = await existingCompanyResponse.json();
          companyId = existingCompany.id;
        } else if (existingCompanyResponse.status === 404) {
          // Create new company if not found
          const companyPayload: any = {
            name: applicationData.companyName,
          };

          if (applicationData.location && applicationData.location.trim()) {
            companyPayload.location = applicationData.location;
          }

          if (applicationData.website && applicationData.website.trim()) {
            companyPayload.website = applicationData.website;
          }

          const companyResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/companies`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(companyPayload),
            }
          );

          if (!companyResponse.ok) {
            const errorData = await companyResponse.json();
            throw new Error(errorData.message || "Failed to create company");
          }

          const newCompany = await companyResponse.json();
          companyId = newCompany.id;
        } else {
          throw new Error("Failed to search for existing company");
        }
      } else {
        // Update existing company if website or location changed
        const websiteChanged =
          applicationData.website !== currentApplication.company.website;
        const locationChanged =
          applicationData.location !== currentApplication.company.location;

        if (websiteChanged || locationChanged) {
          const updatePayload: any = {};

          if (locationChanged) {
            updatePayload.location = applicationData.location;
          }

          if (websiteChanged) {
            if (applicationData.website && applicationData.website.trim()) {
              updatePayload.website = applicationData.website;
            } else {
              updatePayload.website = null;
            }
          }

          const companyUpdateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/companies/${
              currentApplication.company.id
            }`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatePayload),
            }
          );

          if (!companyUpdateResponse.ok) {
            const errorData = await companyUpdateResponse.json();
            throw new Error(errorData.message || "Failed to update company");
          }
        }
      }
      
      // Update application with new data
      const updatePayload = {
        position: applicationData.position,
        companyId: companyId,
        salary: applicationData.salary,
        location: applicationData.location,
        notes: applicationData.notes,
        remote: applicationData.remote,
        status: applicationData.status,
      };

      const applicationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.message || "Failed to update application");
      }

      const updatedApplication = await applicationResponse.json();

      setApplications((prev) => {
        return prev.map((app) => {
          if (app.id === applicationId) {
            return updatedApplication;
          }
          return app;
        });
      });

      setSelectedApplication(updatedApplication);
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update application"
      );
    }
  };

  // Load applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle drag start for application cards
  const handleDragStart = (application: JobApplication, columnId: string) => {
    setDraggedItem(application);
    setDraggedFromColumn(columnId);
  };

  // Handle drag over with auto-scroll functionality
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
    setWorkflowError(null);

    const container = document.querySelector(".board-container");
    if (!container) return;

    // Auto-scroll when dragging near edges
    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 100;
    const maxScrollSpeed = 15;

    const distanceFromLeft = e.clientX - containerRect.left;
    const distanceFromRight = containerRect.right - e.clientX;

    if (distanceFromLeft < scrollThreshold) {
      const speed = Math.min(
        maxScrollSpeed,
        (scrollThreshold - distanceFromLeft) / 3
      );
      container.scrollLeft -= speed;
    } else if (distanceFromRight < scrollThreshold) {
      const speed = Math.min(
        maxScrollSpeed,
        (scrollThreshold - distanceFromRight) / 3
      );
      container.scrollLeft += speed;
    }
  };

  // Handle drag leave events
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    setWorkflowError(null);
  };

  // Handle drop events with workflow validation
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || !draggedFromColumn) return;

    // No change if dropping in same column
    if (draggedFromColumn === targetColumnId) {
      setDraggedItem(null);
      setDraggedFromColumn(null);
      setWorkflowError(null);
      return;
    }

    // Validate workflow rules
    if (!isMoveAllowed(draggedFromColumn, targetColumnId)) {
      setWorkflowError(
        `Cannot move from "${draggedFromColumn}" to "${targetColumnId}". Please follow the workflow progression.`
      );
      setDraggedItem(null);
      setDraggedFromColumn(null);
      return;
    }

    setWorkflowError(null);

    // Set up move confirmation
    if (targetColumnId === "In progress") {
      setPendingMove({
        application: draggedItem,
        fromStatus: draggedFromColumn,
        toStatus: targetColumnId,
      });
      setIsMoveConfirmModalOpen(true);
    } else {
      setPendingMove({
        application: draggedItem,
        fromStatus: draggedFromColumn,
        toStatus: targetColumnId,
      });
      setIsMoveConfirmModalOpen(true);
    }

    setDraggedItem(null);
    setDraggedFromColumn(null);
  };
  
  const setActiveCards = useSetAtom(activeCardsAtom);

  // Update dashboard atom with card counts per column
  useEffect(() => {
    const cardCountsByCategory: Record<string, number> = {};

    columns.forEach((column) => {
      // Count all cards for each column
      const cardsInColumn = applications.filter(
        (app) => app.status === column.id
      );
      cardCountsByCategory[column.id] = cardsInColumn.length;
    });

    setActiveCards(cardCountsByCategory);
  }, [applications, columns, setActiveCards]);

  // Handle move confirmation and trigger event creation if needed
  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    try {
      await handleUpdateApplicationStatus(
        pendingMove.application.id,
        pendingMove.toStatus
      );
      
      // Trigger event creation for "In progress" status
      if (pendingMove.toStatus === "In progress") {
        setPendingEventCreation({
          application: pendingMove.application,
          fromStatus: pendingMove.fromStatus,
          toStatus: pendingMove.toStatus,
        });
        setIsEventCreationModalOpen(true);
      }
      setIsMoveConfirmModalOpen(false);
      setPendingMove(null);
    } catch (error) {
      console.error("Failed to move application:", error);
      setIsMoveConfirmModalOpen(false);
      setPendingMove(null);
    }
  };

  // Cancel move operation
  const handleCancelMove = () => {
    setIsMoveConfirmModalOpen(false);
    setPendingMove(null);
  };

  // Handle event creation and application status update
  const handleCreateEvent = async (eventData: {
    type: string;
    title: string;
    description?: string;
    scheduledAt?: string;
  }) => {
    if (!pendingEventCreation) return;

    try {
      const token = localStorage.getItem("access_token");
      
      // Create the event
      await createEvent(token || "", {
        ...eventData,
        applicationId: pendingEventCreation.application.id,
      });

      // Update application status
      await handleUpdateApplicationStatus(
        pendingEventCreation.application.id,
        pendingEventCreation.toStatus
      );

      setIsEventCreationModalOpen(false);
      setPendingEventCreation(null);
    } catch (error) {
      console.error("Failed to create event and move application:", error);
      setIsEventCreationModalOpen(false);
      setPendingEventCreation(null);
    }
  };

  // Cancel event creation
  const handleCancelEventCreation = () => {
    setIsEventCreationModalOpen(false);
    setPendingEventCreation(null);
  };

  // Open application details modal
  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  // Close application details modal
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedApplication(null);
  };

  // Handle event addition and update application timestamp
  const handleEventAdded = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, updatedAt: new Date().toISOString() }
          : app
      )
    );
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Loading state display
  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <main className="board-main">
          <Loading message="Loading applications..." fullScreen={false} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app page-root">
      <Header />
      <main className="board-main">
        <div className="board-header">
          <h1>Job Application Board</h1>
          <button
            className="add-application-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Application
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchApplications}>Retry</button>
          </div>
        )}

        {workflowError && (
          <div className="workflow-error-message">
            <span className="error-icon">⚠️</span>
            {workflowError}
            <button
              onClick={() => setWorkflowError(null)}
              className="error-close-btn"
            >
              ×
            </button>
          </div>
        )}

        <div className="board-container">
          {columns.map((column) => {
            const columnApplications = getApplicationsByStatus(column.id);
            const dropZoneClass = getColumnDropZoneClass(column.id);
            return (
              <div
                key={column.id}
                className={`board-column ${
                  dragOverColumn === column.id ? "drag-over" : ""
                } ${dropZoneClass}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="column-header">
                  <h3>{column.title}</h3>
                  <span className="application-count">
                    {columnApplications.length}
                  </span>
                </div>

                <div className="column-content">
                  {columnApplications.map((application) => (
                    <ApplicationCard
                      key={`${application.id}-${application.company?.name}-${application.updatedAt}`}
                      application={application}
                      onDragStart={() =>
                        handleDragStart(application, column.id)
                      }
                      onViewDetails={handleViewDetails}
                      isDragging={draggedItem?.id === application.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateApplication}
      />

      <MoveConfirmationModal
        isOpen={isMoveConfirmModalOpen}
        onClose={handleCancelMove}
        onConfirm={handleConfirmMove}
        pendingMove={pendingMove}
      />
      <EventCreationModal
        isOpen={isEventCreationModalOpen}
        onClose={handleCancelEventCreation}
        onConfirm={handleCreateEvent}
        application={pendingEventCreation?.application || null}
      />

      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        application={selectedApplication}
        onUpdate={handleEditApplicationSubmit}
        onDelete={handleDeleteApplication}
        onEventAdded={handleEventAdded}
      />

      <Footer />
    </div>
  );
};

export default Board;
