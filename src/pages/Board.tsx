import React, { useState } from 'react';
import './Board.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ApplicationCard from '../components/ApplicationCard';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  salary?: string;
  notes?: string;
}

interface Column {
  id: string;
  title: string;
  applications: JobApplication[];
}

const Board = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'applied',
      title: 'Applied',
      applications: [
        {
          id: '1',
          company: 'TechCorp',
          position: 'Software Engineer',
          dateApplied: '2024-01-15',
          salary: '$75,000',
          notes: 'Applied through company website'
        },
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Frontend Developer',
          dateApplied: '2024-01-18',
          salary: '$65,000'
        }
      ]
    },
    {
      id: 'phone-screen',
      title: 'Phone Screen',
      applications: [
        {
          id: '3',
          company: 'DataInc',
          position: 'Data Analyst',
          dateApplied: '2024-01-12',
          salary: '$70,000',
          notes: 'Phone screen scheduled for next week'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      applications: [
        {
          id: '4',
          company: 'CloudSolutions',
          position: 'DevOps Engineer',
          dateApplied: '2024-01-10',
          salary: '$80,000'
        }
      ]
    },
    {
      id: 'final',
      title: 'Final Interview',
      applications: []
    },
    {
      id: 'offer',
      title: 'Offer',
      applications: []
    },
    {
      id: 'rejected',
      title: 'Rejected',
      applications: [
        {
          id: '5',
          company: 'BigTech',
          position: 'Senior Developer',
          dateApplied: '2024-01-05',
          salary: '$95,000',
          notes: 'Not a good fit for the role'
        }
      ]
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<JobApplication | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);

  const handleDragStart = (application: JobApplication, columnId: string) => {
    setDraggedItem(application);
    setDraggedFromColumn(columnId);
  };

  const handleEditApplication = (application: JobApplication) => {
    // TODO: Implement edit functionality
    console.log('Edit application:', application);
  };

  const handleDeleteApplication = (applicationId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete application:', applicationId);
    setColumns(prevColumns => 
      prevColumns.map(column => ({
        ...column,
        applications: column.applications.filter(app => app.id !== applicationId)
      }))
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedItem || !draggedFromColumn) return;

    if (draggedFromColumn === targetColumnId) {
      setDraggedItem(null);
      setDraggedFromColumn(null);
      return;
    }

    setColumns(prevColumns => {
      const newColumns = prevColumns.map(column => {
        if (column.id === draggedFromColumn) {
          return {
            ...column,
            applications: column.applications.filter(app => app.id !== draggedItem.id)
          };
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            applications: [...column.applications, draggedItem]
          };
        }
        return column;
      });
      return newColumns;
    });

    setDraggedItem(null);
    setDraggedFromColumn(null);
  };

  return (
    <div className="app page-root">
      <Header />
      <main className="board-main">
        <div className="board-header">
          <h1>Job Application Board</h1>
          <button className="add-application-btn">+ Add Application</button>
        </div>
        
        <div className="board-container">
          {columns.map(column => (
            <div 
              key={column.id}
              className="board-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="application-count">{column.applications.length}</span>
              </div>
              
              <div className="column-content">
                {column.applications.map(application => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onDragStart={(app) => handleDragStart(app, column.id)}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Board;