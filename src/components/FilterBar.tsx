import React, { useState } from "react";
import "./FilterBar.css";

export interface FilterOptions {
  title: string;
  eventDate: string;
  interviewStage: string;
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFiltersChange, isOpen }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    title: "",
    eventDate: "",
    interviewStage: "",
  });

  const interviewStages = [
    "No Interview",
    "Phone Screen",
    "Technical Interview",
    "Onsite Interview",
    "Final Interview",
    "Interview Completed",
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      title: "",
      eventDate: "",
      interviewStage: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="filter-bar">
      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="title-filter">Position Title</label>
              <input
                id="title-filter"
                type="text"
                placeholder="Search by position..."
                value={filters.title}
                onChange={(e) => handleFilterChange("title", e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="event-date-filter">Upcoming Events</label>
              <select
                id="event-date-filter"
                value={filters.eventDate}
                onChange={(e) => handleFilterChange("eventDate", e.target.value)}
                className="filter-select"
              >
                <option value="">All Events</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="this-month">This Month</option>
                <option value="overdue">Overdue</option>
                <option value="no-events">No Events</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="interview-filter">Interview Stage</label>
              <select
                id="interview-filter"
                value={filters.interviewStage}
                onChange={(e) => handleFilterChange("interviewStage", e.target.value)}
                className="filter-select"
              >
                <option value="">All Stages</option>
                {interviewStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
                title="Clear all filters"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
