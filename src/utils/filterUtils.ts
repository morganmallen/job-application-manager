import type { FilterOptions } from "../components/FilterBar";

export interface JobApplication {
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
  events?: Array<{
    id: string;
    type: string;
    title: string;
    scheduledAt?: string;
    completedAt?: string;
  }>;
}

export const filterApplications = (
  applications: JobApplication[],
  filters: FilterOptions
): JobApplication[] => {
  return applications.filter((app) => {
    // Filter by title (case-insensitive)
    if (filters.title && !app.position.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }

    // Filter by upcoming events
    if (filters.eventDate) {
      const hasUpcomingEvents = hasUpcomingEventsInRange(app, filters.eventDate);
      if (!hasUpcomingEvents) {
        return false;
      }
    }

    // Filter by interview stage
    if (filters.interviewStage) {
      const interviewStage = getInterviewStage(app);
      if (interviewStage !== filters.interviewStage) {
        return false;
      }
    }

    return true;
  });
};

export const getInterviewStage = (application: JobApplication): string => {
  if (!application.events || application.events.length === 0) {
    return "No Interview";
  }

  // Sort events by scheduled date
  const sortedEvents = application.events
    .filter(event => event.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  if (sortedEvents.length === 0) {
    return "No Interview";
  }

  const latestEvent = sortedEvents[sortedEvents.length - 1];
  
  // Check if all events are completed
  const allCompleted = application.events.every(event => event.completedAt);
  if (allCompleted) {
    return "Interview Completed";
  }

  // Determine stage based on event type
  const eventType = latestEvent.type.toLowerCase();
  
  if (eventType.includes("phone") || eventType.includes("screen")) {
    return "Phone Screen";
  } else if (eventType.includes("technical") || eventType.includes("coding")) {
    return "Technical Interview";
  } else if (eventType.includes("onsite") || eventType.includes("on-site")) {
    return "Onsite Interview";
  } else if (eventType.includes("final")) {
    return "Final Interview";
  } else {
    return "Interview Scheduled";
  }
};

export const getApplicationsByStatus = (
  applications: JobApplication[],
  status: string
): JobApplication[] => {
  return applications.filter((app) => app.status === status);
};

// Check if application has upcoming events in the specified time range
export const hasUpcomingEventsInRange = (
  application: JobApplication,
  timeRange: string
): boolean => {
  if (!application.events || application.events.length === 0) {
    return timeRange === "no-events";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7 - endOfWeek.getDay());
  
  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
  
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get upcoming scheduled events (not completed)
  const upcomingEvents = application.events.filter(event => 
    event.scheduledAt && 
    !event.completedAt && 
    new Date(event.scheduledAt) >= now
  );

  if (upcomingEvents.length === 0) {
    return timeRange === "no-events";
  }

  // Check if any upcoming event falls within the specified range
  return upcomingEvents.some(event => {
    const eventDate = new Date(event.scheduledAt!);
    
    switch (timeRange) {
      case "today":
        return eventDate >= today && eventDate < tomorrow;
      case "this-week":
        return eventDate >= today && eventDate <= endOfWeek;
      case "next-week":
        return eventDate > endOfWeek && eventDate <= endOfNextWeek;
      case "this-month":
        return eventDate >= today && eventDate <= endOfMonth;
      case "overdue":
        return eventDate < today;
      default:
        return true;
    }
  });
};
