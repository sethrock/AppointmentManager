import { AppointmentFilters, Appointment } from "@shared/schema";
import { parse } from "date-fns";

const API_BASE_URL = "https://fs16.formsite.com/api/v2/Qi21et/forms/appointment";
const API_TOKEN = process.env.FORMSITE_API_TOKEN || "e6X1ZphNxP2rinyLFmaNNHQIcBw4mjGZ";

// Helper function to make authenticated requests to Formsite API
async function formsiteRequest(endpoint: string, method = "GET", data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Formsite API error (${response.status}): ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Formsite API request failed:", error);
    throw error;
  }
}

// Map Formsite form data to our Appointment schema
function mapFormsiteDataToAppointment(result: any): Appointment {
  try {
    const grossRevenue = parseFloat(result.items?.find((item: any) => item.label === "Gross Revenue")?.value || "0");
    const depositAmount = parseFloat(result.items?.find((item: any) => item.label === "Deposit Amount")?.value || "0");
    
    return {
      id: result.id.toString(),
      clientName: result.items?.find((item: any) => item.label === "Client Name")?.value,
      clientPhone: result.items?.find((item: any) => item.label === "Phone Number")?.value,
      clientUsesEmail: result.items?.find((item: any) => item.label === "Client Uses Email")?.value === "Yes",
      clientEmail: result.items?.find((item: any) => item.label === "Client E-mail")?.value,
      callType: result.items?.find((item: any) => item.label === "In or Out Call")?.value,
      streetAddress: result.items?.find((item: any) => item.label === "Street Address")?.value,
      addressLine2: result.items?.find((item: any) => item.label === "Address Line 2")?.value,
      city: result.items?.find((item: any) => item.label === "City")?.value,
      state: result.items?.find((item: any) => item.label === "State")?.value,
      zipCode: result.items?.find((item: any) => item.label === "Zip Code")?.value,
      startDate: result.items?.find((item: any) => item.label === "Appointment Start Date")?.value,
      startTime: result.items?.find((item: any) => item.label === "Appointment Start Time")?.value,
      endDate: result.items?.find((item: any) => item.label === "Appointment End Date")?.value,
      endTime: result.items?.find((item: any) => item.label === "Appointment End Time")?.value,
      duration: parseFloat(result.items?.find((item: any) => item.label === "Call Duration")?.value || "0"),
      grossRevenue: grossRevenue,
      depositAmount: depositAmount,
      depositReceivedBy: result.items?.find((item: any) => item.label === "Deposit Recieved By")?.value,
      paymentProcess: result.items?.find((item: any) => item.label === "Payment Process Used")?.value,
      dueToProvider: grossRevenue - depositAmount,
      setBy: result.items?.find((item: any) => item.label === "Set By")?.value,
      provider: result.items?.find((item: any) => item.label === "Provider")?.value,
      marketingChannel: result.items?.find((item: any) => item.label === "Marketing Chanel")?.value,
      clientNotes: result.items?.find((item: any) => item.label === "Client Notes")?.value,
      createdAt: result.date_created ? new Date(result.date_created) : undefined,
      updatedAt: result.date_updated ? new Date(result.date_updated) : undefined,
    };
  } catch (error) {
    console.error("Error mapping Formsite data to Appointment:", error);
    throw new Error("Failed to process appointment data");
  }
}

// Fetch appointments with optional filters
export async function getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  try {
    // Fetch results from the Formsite API
    const response = await formsiteRequest("/results");
    
    if (!response?.results) {
      throw new Error("Invalid response from Formsite API");
    }
    
    // Map the results to our Appointment schema
    let appointments = await Promise.all(
      response.results.map(async (result: any) => {
        // For each result, we need to fetch the detailed data
        const detailedResult = await formsiteRequest(`/results/${result.id}`);
        return mapFormsiteDataToAppointment(detailedResult);
      })
    );
    
    // Apply filters if provided
    if (filters) {
      if (filters.setBy && filters.setBy !== "all") {
        appointments = appointments.filter(app => app.setBy === filters.setBy);
      }
      if (filters.provider && filters.provider !== "all") {
        appointments = appointments.filter(app => app.provider === filters.provider);
      }
      if (filters.marketingChannel && filters.marketingChannel !== "all") {
        appointments = appointments.filter(app => app.marketingChannel === filters.marketingChannel);
      }
    }
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

// Fetch a single appointment by ID
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const result = await formsiteRequest(`/results/${id}`);
    
    if (!result) {
      return null;
    }
    
    return mapFormsiteDataToAppointment(result);
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
}
