export interface InterviewEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export const EVENT_TYPES: Array<{ value: string; label: string }> = [
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "TECHNICAL_INTERVIEW", label: "Technical Interview" },
  { value: "BEHAVIORAL_INTERVIEW", label: "Behavioral Interview" },
  { value: "CODING_CHALLENGE", label: "Coding Challenge" },
  { value: "TAKE_HOME_ASSIGNMENT", label: "Take Home Assignment" },
  { value: "ONSITE_INTERVIEW", label: "Onsite Interview" },
  { value: "REFERENCE_CHECK", label: "Reference Check" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "OTHER", label: "Other" },
];

export const EVENT_TYPE_LABELS: Record<string, string> = EVENT_TYPES.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<string, string>
);

export async function fetchEventsForApplication(
  token: string,
  applicationId: string
): Promise<InterviewEvent[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/events?applicationId=${applicationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export async function createEvent(
  token: string,
  data: {
    type: string;
    title: string;
    description?: string;
    scheduledAt?: string;
    applicationId: string;
  }
): Promise<InterviewEvent> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create event");
  }
  return response.json();
}


