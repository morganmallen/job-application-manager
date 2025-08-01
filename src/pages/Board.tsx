import React, { useState, useEffect } from 'react';
import './Board.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ApplicationCard from '../components/ApplicationCard';
import AddApplicationModal from '../components/AddApplicationModal';
import EditApplicationModal from '../components/EditApplicationModal';

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
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [draggedItem, setDraggedItem] = useState<JobApplication | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Define column configuration based on application status
  const columns = [
    { id: 'Applied', title: 'Applied' },
    { id: 'In progress', title: 'In Progress' },
    { id: 'Job Offered', title: 'Job Offered' },
    { id: 'Accepted', title: 'Accepted' },
    { id: 'Rejected', title: 'Rejected' },
    { id: 'Withdraw', title: 'Withdraw' }
  ];

  // Group applications by status
  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  // Fetch applications from the database
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Create a new application
  const handleCreateApplication = async (applicationData: {
    position: string;
    companyName: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
  }) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, create the company
      const companyResponse = await fetch(`${import.meta.env.VITE_API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: applicationData.companyName,
          location: applicationData.location,
        }),
      });

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.message || 'Failed to create company');
      }

      const newCompany = await companyResponse.json();

      // Then, create the application
      const applicationResponse = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: applicationData.position,
          companyId: newCompany.id,
          salary: applicationData.salary,
          location: applicationData.location,
          notes: applicationData.notes,
          remote: applicationData.remote,
          status: 'Applied',
          appliedAt: new Date().toISOString(),
        }),
      });

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.message || 'Failed to create application');
      }

      const newApplication = await applicationResponse.json();
      setApplications(prev => [...prev, newApplication]);
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create application');
    }
  };

  // Update application status (drag and drop)
  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const updatedApplication = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApplication : app)
      );
    } catch (err: unknown) {
      console.error('Failed to update application status:', err);
      // Revert the UI state on error
      fetchApplications();
    }
  };

  // Delete application
  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (err: unknown) {
      console.error('Failed to delete application:', err);
    }
  };

  // Edit application
  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setIsEditModalOpen(true);
  };

  // Handle edit application submission
  const handleEditApplicationSubmit = async (applicationId: string, applicationData: {
    position: string;
    companyName: string;
    salary?: string;
    location?: string;
    notes?: string;
    remote?: boolean;
    status: string;
  }) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, update the company if the name changed
      const currentApplication = applications.find(app => app.id === applicationId);
      if (!currentApplication) {
        throw new Error('Application not found');
      }

      let companyId = currentApplication.company.id;
      
      // If company name changed, check if company exists or create new one
      if (applicationData.companyName !== currentApplication.company.name) {
        // First, try to find existing company with the same name (case-insensitive)
        const encodedCompanyName = encodeURIComponent(applicationData.companyName);
        
        const existingCompanyResponse = await fetch(`${import.meta.env.VITE_API_URL}/companies/search/${encodedCompanyName}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (existingCompanyResponse.ok) {
          const existingCompany = await existingCompanyResponse.json();
          // Use existing company
          companyId = existingCompany.id;
        } else if (existingCompanyResponse.status === 404) {
          // Create new company
          const companyResponse = await fetch(`${import.meta.env.VITE_API_URL}/companies`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: applicationData.companyName,
              location: applicationData.location,
            }),
          });

          if (!companyResponse.ok) {
            const errorData = await companyResponse.json();
            throw new Error(errorData.message || 'Failed to create company');
          }

          const newCompany = await companyResponse.json();
          companyId = newCompany.id;
        } else {
          throw new Error('Failed to search for existing company');
        }
      }
      
      // Update the application
      const updatePayload = {
        position: applicationData.position,
        companyId: companyId,
        salary: applicationData.salary,
        location: applicationData.location,
        notes: applicationData.notes,
        remote: applicationData.remote,
        status: applicationData.status,
      };
      
      const applicationResponse = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.json();
        throw new Error(errorData.message || 'Failed to update application');
      }

      const updatedApplication = await applicationResponse.json();
      
      setApplications(prev => {
        return prev.map(app => {
          if (app.id === applicationId) {
            return updatedApplication;
          }
          return app;
        });
      });
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  // Load applications on component mount
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
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedItem || !draggedFromColumn) return;

    if (draggedFromColumn === targetColumnId) {
      setDraggedItem(null);
      setDraggedFromColumn(null);
      return;
    }

    // Update the application status in the database
    handleUpdateApplicationStatus(draggedItem.id, targetColumnId);

    setDraggedItem(null);
    setDraggedFromColumn(null);
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
        
        <div className="board-container">
          {columns.map(column => {
            const columnApplications = getApplicationsByStatus(column.id);
            return (
              <div 
                key={column.id}
                className={`board-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="column-header">
                  <h3>{column.title}</h3>
                  <span className="application-count">{columnApplications.length}</span>
                </div>
                
                <div className="column-content">
                  {columnApplications.map(application => (
                    <ApplicationCard
                      key={`${application.id}-${application.company?.name}-${application.updatedAt}`}
                      application={application} // Pass the application directly
                      onDragStart={() => handleDragStart(application, column.id)}
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
      
      <Footer />
    </div>
  );
};

export default Board;