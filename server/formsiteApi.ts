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
    
    // For debugging, log the IDs of all items
    if (result.items && Array.isArray(result.items)) {
      console.log("Available item IDs:", result.items.map((item: any) => `${item.id}: ${item.label || 'no label'}`).join(", "));
    }
    
    // Using the complete pipe references provided:
    // Set By = [pipe:0?]
    // Provider = [pipe:1?]
    // Marketing Chanel = [pipe:2?]
    // Client Name = [pipe:4?]
    // Phone Number = [pipe:5?]
    // Client Uses Email = [pipe:7?]
    // Client E-mail = [pipe:24?]
    // In or Out Call = [pipe:17?]
    // Street Address = [pipe:10?]
    // Address Line 2 = [pipe:11?]
    // City = [pipe:12?]
    // State = [pipe:13?]
    // Zip Code = [pipe:14?]
    // Outcall Details = [pipe:21?]
    // Appointment Start Date = [pipe:25?]
    // Appointment Start Time = [pipe:26?]
    // Appointment End Date = [pipe:27?]
    // Appointment End Time = [pipe:28?]
    // Call Duration = [pipe:29?]
    // Gross Revenue = [pipe:32?]
    // Travel = [pipe:34?]
    // Hosting Expense = [pipe:36?]
    // IN/OUT Goes to = [pipe:37?]
    // Total Expenses Calculated = [pipe:38?]
    // Deposit Amount = [pipe:39?]
    // Deposit Amount Calculated = [pipe:40?]
    // Deposit Recieved By: = [pipe:41?]
    // Payment Process Used = [pipe:42]
    // Due To Provider Upon Arrival = [pipe:43?]
    // Leave Notes On This Client = [pipe:44]
    // Client Notes = [pipe:45?]
    // Disposition Status = [pipe:49?]
    // Total Collected In Cash = [pipe:51?]
    // Total Collected Digitally = [pipe:52?]
    // Total Collected = [pipe:53?]
    // Payment Processor = [pipe:55?]
    // Upload Photos/Screenshots of Payments = [pipe:54?]
    // Notes on Payments = [pipe:56?]
    // Would you be open to seeing this client again? = [pipe:57]
    // Please contribute a few notes about how your call went to help you remember the next time you see... = [pipe:58?]
    // Updated Appointment Start Date = [pipe:61?]
    // Updated Appointment Start Time = [pipe:62?]
    // Updated Appointment End Date = [pipe:63?]
    // Updated Appointment End Time = [pipe:64?]
    // Who Canceled = [pipe:67?]
    // Cancelation Details = [pipe:68?]
    // App-ID = [pipe:59?]
    // Reference # = [pipe:reference_#]
    // Repetition # = [pipe:repetition_#]
    // Scoring Total = [pipe:total_score]
    // Scoring Max = [pipe:max_score]
    // Order Total = [pipe:order_total]
    // Save & Return Username = [pipe:save_return_user]
    // Save & Return Email = [pipe:save_return_email]
    
    // Parse numeric values correctly
    const grossRevenue = parseFloat(findItemById("32") || "0");
    const depositAmount = parseFloat(findItemById("39") || "0");
    const dueToProvider = parseFloat(findItemById("43") || "0");
    const duration = parseFloat(findItemById("29") || "0");
    const totalExpenses = parseFloat(findItemById("38") || "0");
    const totalCollected = parseFloat(findItemById("53") || "0");
    
    // Create a complete appointment object with all available data
    return {
      id: result.id ? result.id.toString() : "",
      // Basic client info
      setBy: findItemById("0"),
      provider: findItemById("1"),
      marketingChannel: findItemById("2"),
      clientName: findItemById("4"),
      clientPhone: findItemById("5"),
      clientUsesEmail: findItemById("7") === "Yes",
      clientEmail: findItemById("24"),
      
      // Location info
      callType: findItemById("17"),
      streetAddress: findItemById("10"),
      addressLine2: findItemById("11"),
      city: findItemById("12"),
      state: findItemById("13"),
      zipCode: findItemById("14"),
      outcallDetails: findItemById("21"),
      
      // Appointment time info
      startDate: findItemById("25"),
      startTime: findItemById("26"),
      endDate: findItemById("27"),
      endTime: findItemById("28"),
      duration: duration,
      
      // Financial info
      grossRevenue: grossRevenue,
      travel: findItemById("34"),
      hostingExpense: findItemById("36"),
      inOutGoesTo: findItemById("37"),
      totalExpenses: totalExpenses,
      depositAmount: depositAmount,
      depositCalculated: findItemById("40"),
      depositReceivedBy: findItemById("41"),
      paymentProcess: findItemById("42"),
      dueToProvider: dueToProvider,
      
      // Notes and status
      leaveNotes: findItemById("44"),
      clientNotes: findItemById("45"),
      dispositionStatus: (() => {
        const status = findItemById("49");
        // Standardize disposition status
        if (status === '1' || status === 'Complete') {
          return 'Complete';
        } else if (status === '3' || status === 'Cancel' || status === 'Canceled') {
          return 'Canceled';
        } else if (status === '2' || status === 'Reschedule' || status === 'Rescheduled') {
          return 'Rescheduled';
        } else {
          return status; // return original if it doesn't match any known value
        }
      })(),
      
      // Payment details
      totalCollectedCash: findItemById("51"),
      totalCollectedDigital: findItemById("52"),
      totalCollected: totalCollected,
      paymentProcessor: findItemById("55"),
      paymentPhotos: findItemById("54"),
      paymentNotes: findItemById("56"),
      
      // Client relationship
      seeAgain: findItemById("57"),
      callNotes: findItemById("58"),
      
      // Updates and cancellations
      updatedStartDate: findItemById("61"),
      updatedStartTime: findItemById("62"),
      updatedEndDate: findItemById("63"),
      updatedEndTime: findItemById("64"),
      whoCanceled: findItemById("67"),
      cancellationDetails: findItemById("68"),
      
      // Internal IDs
      appId: findItemById("59"),
      referenceNumber: result.reference_number || "",
      repetitionNumber: result.repetition_number || "",
      
      // Meta fields
      scoringTotal: result.total_score || "",
      scoringMax: result.max_score || "",
      orderTotal: result.order_total || "",
      saveReturnUsername: result.save_return_user || "",
      saveReturnEmail: result.save_return_email || "",
      
      // System timestamps
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
      limit: "100", // Maximum allowed by API
      nocache: Date.now().toString() // Prevent caching by adding a timestamp
    };
    
    // Add filter-specific search parameters if provided
    // Note: We now only support phone number filtering, which is done client-side after data retrieval
    
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
      if (filters.phoneNumber && filters.phoneNumber.trim() !== "") {
        const phoneNumber = filters.phoneNumber.trim().replace(/\D/g, ""); // Remove non-digit characters
        filteredAppointments = filteredAppointments.filter(app => 
          app.clientPhone && app.clientPhone.replace(/\D/g, "").includes(phoneNumber)
        );
      }
    }
    
    console.log(`Retrieved ${filteredAppointments.length} appointments`);
    
    // DEBUG: Log disposition statuses to see what's coming from the API
    console.log("DISPOSITION STATUSES:", filteredAppointments.map(app => ({
      id: app.id,
      clientName: app.clientName,
      status: app.dispositionStatus
    })));
    
    return filteredAppointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

// Fetch a single appointment by ID
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    // First try to get the appointment from the results list
    // This is a workaround for the API limitation where direct ID lookup may not work
    const allAppointments = await getAppointments();
    const appointment = allAppointments.find(app => app.id === id);
    
    if (appointment) {
      console.log(`Found appointment ${id} in cached results`);
      return appointment;
    }
    
    // If we couldn't find it in the list, try direct API call as fallback
    try {
      // According to Formsite API docs, we need to call:
      // GET https://{server}.formsite.com/api/v2/{user_dir}/forms/{form_dir}/results/{result_id}
      const endpoint = `/{user_dir}/forms/{form_dir}/results/${id}`;
      
      // Include nocache parameter to prevent caching
      const params = {
        nocache: Date.now().toString()
      };
      
      const result = await formsiteRequest(endpoint, "GET", params);
      console.log(`Retrieved appointment data for ID: ${id} via direct API call`);
      
      if (!result) {
        return null;
      }
      
      return mapFormsiteDataToAppointment(result);
    } catch (directError) {
      console.error(`Error in direct fetch for appointment ${id}:`, directError);
      return null; // Return null instead of throwing to allow fallback
    }
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
}
