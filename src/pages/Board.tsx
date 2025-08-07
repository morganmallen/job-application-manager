import React, { useState, useEffect } from "react";
import "./Board.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ApplicationCard from "../components/ApplicationCard";
import AddApplicationModal from "../components/AddApplicationModal";
import EditApplicationModal from "../components/EditApplicationModal";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { activeCardsAtom } from "../store/dashboardAtoms";
import MoveConfirmationModal from "../components/MoveConfirmationModal";


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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);
  const [draggedItem, setDraggedItem] = useState<JobApplication | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(
    null
  );
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [isMoveConfirmModalOpen, setIsMoveConfirmModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    application: JobApplication;
    fromStatus: string;
    toStatus: string;
  } | null>(null);

  const columns = [
    { id: "Applied", title: "Applied" },
    { id: "In progress", title: "In Progress" },
    { id: "Job Offered", title: "Job Offered" },
    { id: "Accepted", title: "Accepted" },
    { id: "Rejected", title: "Rejected" },
    { id: "Withdraw", title: "Withdraw" },
  ];

  const workflowRules: Record<string, string[]> = {
    Applied: ["In progress", "Rejected", "Withdraw"],
    "In progress": ["Job Offered", "Rejected", "Withdraw"],
    "Job Offered": ["Accepted", "Rejected", "Withdraw"],
    Accepted: ["Rejected", "Withdraw"],
    Rejected: [],
    Withdraw: [],
  };

  const isMoveAllowed = (fromStatus: string, toStatus: string): boolean => {
    const allowedMoves = workflowRules[fromStatus];
    return allowedMoves ? allowedMoves.includes(toStatus) : false;
  };

  const getColumnDropZoneClass = (columnId: string): string => {
    if (!draggedItem || !draggedFromColumn) return "";

    const isAllowed = isMoveAllowed(draggedFromColumn, columnId);
    return isAllowed ? "valid-drop-zone" : "invalid-drop-zone";
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const navigate = useNavigate();
  // Fetch applications from the database
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch applications"
      );
    } finally {
      setLoading(false);
    }
  };

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
            appliedAt: new Date().toISOString(),
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

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      const updatedApplication = await response.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? updatedApplication : app))
      );
    } catch (err: unknown) {
      console.error("Failed to update application status:", err);
      fetchApplications();
    }
  };

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

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setIsEditModalOpen(true);
  };

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
      if (applicationData.companyName !== currentApplication.company.name) {
        const encodedCompanyName = encodeURIComponent(
          applicationData.companyName
        );

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
          companyId = newCompany.id;
        } else {
          throw new Error("Failed to search for existing company");
        }
      } else {
        const websiteChanged =
          applicationData.website !== currentApplication.company.website;
        const locationChanged =
          applicationData.location !== currentApplication.company.location;

        if (websiteChanged || locationChanged) {
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
              body: JSON.stringify({
                website: applicationData.website,
                location: applicationData.location,
              }),
            }
          );

          if (!companyUpdateResponse.ok) {
            const errorData = await companyUpdateResponse.json();
            throw new Error(errorData.message || "Failed to update company");
          }
        }
      }
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
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update application"
      );
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDragStart = (application: JobApplication, columnId: string) => {
    setDraggedItem(application);
    setDraggedFromColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);

    setWorkflowError(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    setWorkflowError(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || !draggedFromColumn) return;

    if (draggedFromColumn === targetColumnId) {
      setDraggedItem(null);
      setDraggedFromColumn(null);
      setWorkflowError(null);
      return;
    }

    if (!isMoveAllowed(draggedFromColumn, targetColumnId)) {
      setWorkflowError(
        `Cannot move from "${draggedFromColumn}" to "${targetColumnId}". Please follow the workflow progression.`
      );
      setDraggedItem(null);
      setDraggedFromColumn(null);
      return;
    }

    setWorkflowError(null);

    setPendingMove({
      application: draggedItem,
      fromStatus: draggedFromColumn,
      toStatus: targetColumnId,
    });
    setIsMoveConfirmModalOpen(true);

    setDraggedItem(null);
    setDraggedFromColumn(null);
  };
  const setActiveCards = useSetAtom(activeCardsAtom);

  useEffect(() => {
    // Count cards per column (category)
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

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    try {
      await handleUpdateApplicationStatus(
        pendingMove.application.id,
        pendingMove.toStatus
      );
      setIsMoveConfirmModalOpen(false);
      setPendingMove(null);
    } catch (error) {
      console.error("Failed to move application:", error);
      setIsMoveConfirmModalOpen(false);
      setPendingMove(null);
    }
  };

  const handleCancelMove = () => {
    setIsMoveConfirmModalOpen(false);
    setPendingMove(null);
  };

  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <main className="board-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading applications...</p>
          </div>
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
                      onEdit={handleEditApplication}
                      onDelete={handleDeleteApplication}
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

      <EditApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingApplication(null);
        }}
        onSubmit={handleEditApplicationSubmit}
        application={editingApplication}
      />
      <MoveConfirmationModal
        isOpen={isMoveConfirmModalOpen}
        onClose={handleCancelMove}
        onConfirm={handleConfirmMove}
        pendingMove={pendingMove}
      />

      <Footer />
    </div>
  );
};

export default Board;
