export interface ParticipantData {
  name: string;
  phone: string;
  district: string;
  class: string;
  team: string;
}

export async function submitParticipant(
  data: ParticipantData
): Promise<void> {
  const url = import.meta.env.PUBLIC_GOOGLE_SCRIPT_URL;

  if (!url) {
    throw new Error(
      "Google Script URL not configured."
    );
  }

  // Use no-cors or simple POST for Google Apps Script if needed, but per user snippet:
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Submission failed: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Submission failed."
    );
  }
}
