import { ClosingRecord } from "../types";

/**
 * Sends the closing record to a Google Apps Script Web App.
 * Uses no-cors mode to avoid CORS errors with Google redirects.
 */
export const syncToSheet = async (record: ClosingRecord, scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl) return false;

  try {
    // We transform the complex object into a flat structure that fits a spreadsheet row better
    // if the backend expects specific fields, or just send the whole JSON.
    // Here we send JSON and let the Google Script parse it.
    
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors", // Crucial for Google Apps Script Web Apps to work from client-side
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    // Since 'no-cors' returns an opaque response, we can't read the result.
    // We assume success if no network exception was thrown.
    return true;
  } catch (error) {
    console.error("Error syncing to sheet:", error);
    return false;
  }
};