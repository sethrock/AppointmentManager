import { AppointmentFilters, Appointment } from "@shared/schema";
import { parse } from "date-fns";

// Formsite API v2 endpoints based on documentation
// Reference: https://support.formsite.com/hc/en-us/articles/360000288594-API
const SERVER = "fs16";  // Server prefix (fs16, fs1, etc.)
const USER_DIR = "Qi21et"; // User directory
const FORM_DIR = "appointment"; // Form directory
const API_TOKEN = process.env.FORMSITE_API_TOKEN;

// Helper function to make authenticated requests to Formsite API
async function formsiteRequest(endpoint: string, method = "GET", params: Record<string, string> = {}, data?: any) {
  // Build the base URL according to Formsite API format
  let url = `https://${SERVER}.formsite.com/api/v2`;
  
  // Add user_dir and form_dir if needed
  if (endpoint.includes("{user_dir}")) {
    endpoint = endpoint.replace("{user_dir}", USER_DIR);
  }
  
  if (endpoint.includes("{form_dir}")) {
    endpoint = endpoint.replace("{form_dir}", FORM_DIR);
  }
  
  // Complete URL
  url = `${url}${endpoint}`;
  
  // Add query parameters if any
  if (Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    url = `${url}?${queryParams.toString()}`;
  }
  
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `bearer ${API_TOKEN}`, // Note: lowercase 'bearer' as per docs
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined
  };

  try {
    console.log(`Making Formsite API request to: ${url}`);
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

// Get form items to understand the structure
export async function getFormItems() {
  try {
    // According to Formsite API docs, we need to call:
    // GET https://{server}.formsite.com/api/v2/{user_dir}/forms/{form_dir}/items
    const endpoint = "/{user_dir}/forms/{form_dir}/items";
    
    const response = await formsiteRequest(endpoint);
    console.log("Retrieved form structure");
    
    return response;
  } catch (error) {
    console.error("Error fetching form items:", error);
    throw error;
  }
}

// Map Formsite form data to our Appointment schema using pipe references provided
function mapFormsiteDataToAppointment(result: any): Appointment {
  try {
    console.log("Mapping result to appointment:", JSON.stringify(result).substring(0, 200) + "...");
    
    // Find an item by its ID in the items array
    const findItemById = (itemId: string) => {
      if (!result.items || !Array.isArray(result.items)) {
        return undefined;
      }
      
      const item = result.items.find((item: any) => {
        return item.id === itemId;
      });
      
      if (!item) return undefined;
      
      // Handle different response formats from API
      if (item.value !== undefined) return item.value;
      if (item.values && item.values.length > 0) {
        // For multi-choice items
        return item.values.map((v: any) => v.value).join(", ");
      }
      
      return undefined;
    };
    
    // Using the pipe references provided:
    // ID = [pipe:reference_#]
    // Client Name = [pipe:4?]
    // Phone Number = [pipe:5?]
    // Appointment Start Date = [pipe:25?]
    // Appointment Start Time = [pipe:26?]
    // Duration = [pipe:29?]
    // Gross Revenue = [pipe:32?]
    // Deposit Amount = [pipe:39?]
    // DTP = [pipe:43?]
    
    // For debugging, log the IDs of all items
    if (result.items && Array.isArray(result.items)) {
      console.log("Available item IDs:", result.items.map((item: any) => `${item.id}: ${item.label || 'no label'}`).join(", "));
    }
    
    // Parse numeric values correctly
    const grossRevenue = parseFloat(findItemById("32") || "0");
    const depositAmount = parseFloat(findItemById("39") || "0");
    const dueToProvider = parseFloat(findItemById("43") || "0");
    
    return {
      id: result.id ? result.id.toString() : "",
      clientName: findItemById("4"),
      clientPhone: findItemById("5"),
      clientUsesEmail: false, // Default if not available
      clientEmail: findItemById("6"), // Assuming email might be item 6
      callType: findItemById("15"), // Assuming call type might be nearby
      streetAddress: findItemById("7"), // Estimating field IDs
      addressLine2: findItemById("8"),
      city: findItemById("9"),
      state: findItemById("10"),
      zipCode: findItemById("11"),
      startDate: findItemById("25"),
      startTime: findItemById("26"),
      endDate: findItemById("27"), // Assuming end date is next
      endTime: findItemById("28"), // Assuming end time is next
      duration: parseFloat(findItemById("29") || "0"),
      grossRevenue: grossRevenue,
      depositAmount: depositAmount,
      depositReceivedBy: findItemById("40"), // Assuming this is nearby deposit amount
      paymentProcess: findItemById("41"), // Assuming this is nearby
      dueToProvider: dueToProvider, // Use the actual DTP field
      setBy: findItemById("20"), // Estimating
      provider: findItemById("21"), // Estimating
      marketingChannel: findItemById("22"), // Estimating
      clientNotes: findItemById("50"), // Estimating client notes at a high number
      createdAt: result.date_start ? new Date(result.date_start) : undefined,
      updatedAt: result.date_update ? new Date(result.date_update) : undefined,
    };
  } catch (error) {
    console.error("Error mapping Formsite data to Appointment:", error);
    throw new Error("Failed to process appointment data");
  }
}

// Fetch appointments with optional filters
export async function getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  try {
    // According to Formsite API docs, we need to call:
    // GET https://{server}.formsite.com/api/v2/{user_dir}/forms/{form_dir}/results
    const endpoint = "/{user_dir}/forms/{form_dir}/results";
    
    // Set up parameters for pagination and filter data
    const params: Record<string, string> = {
      limit: "100" // Maximum allowed by API
    };
    
    // Add filter-specific search parameters if provided
    if (filters) {
      if (filters.setBy && filters.setBy !== "all") {
        // We need to determine the item ID for "Set By" field
        // This would typically come from "Get Form Items" API call
        // For now, we'll use server-side filtering after retrieval
      }
      if (filters.provider && filters.provider !== "all") {
        // Same approach for provider
      }
      if (filters.marketingChannel && filters.marketingChannel !== "all") {
        // Same approach for marketing channel
      }
    }
    
    const response = await formsiteRequest(endpoint, "GET", params);
    console.log("Received Formsite API response for appointments");
    
    if (!response?.results) {
      console.error("Invalid response format:", response);
      throw new Error("Invalid response from Formsite API: missing results array");
    }
    
    // Map the results to our Appointment schema
    const appointments = response.results.map((result: any) => {
      return mapFormsiteDataToAppointment(result);
    });
    
    // Apply filters if provided (on the client side if we couldn't do it in the API)
    let filteredAppointments = [...appointments];
    if (filters) {
      if (filters.setBy && filters.setBy !== "all") {
        filteredAppointments = filteredAppointments.filter(app => app.setBy === filters.setBy);
      }
      if (filters.provider && filters.provider !== "all") {
        filteredAppointments = filteredAppointments.filter(app => app.provider === filters.provider);
      }
      if (filters.marketingChannel && filters.marketingChannel !== "all") {
        filteredAppointments = filteredAppointments.filter(app => app.marketingChannel === filters.marketingChannel);
      }
    }
    
    console.log(`Retrieved ${filteredAppointments.length} appointments`);
    return filteredAppointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

// Fetch a single appointment by ID
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    // According to Formsite API docs, we need to call:
    // GET https://{server}.formsite.com/api/v2/{user_dir}/forms/{form_dir}/results/{result_id}
    const endpoint = `/{user_dir}/forms/{form_dir}/results/${id}`;
    
    const result = await formsiteRequest(endpoint);
    console.log(`Retrieved appointment data for ID: ${id}`);
    
    if (!result) {
      return null;
    }
    
    return mapFormsiteDataToAppointment(result);
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
}
