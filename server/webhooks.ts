import { Request, Response } from "express";
import { storage } from "./storage";
import { InsertAppointment, InsertWebhookLog } from "@shared/schema";

// Type for different webhook sources
type WebhookSource = 'appointment' | 'appointment-reschedule' | 'appointment-com-can';

/**
 * Process a webhook from the main appointment form (new appointment)
 */
async function processAppointmentWebhook(payload: any): Promise<string> {
  try {
    // Extract appointment ID from the payload
    const appointmentId = payload.id || payload.result_id;
    
    if (!appointmentId) {
      throw new Error('No appointment ID found in webhook payload');
    }
    
    // Map the payload to our appointment schema
    const appointmentData: InsertAppointment = mapPayloadToAppointment(payload);
    
    // Check if the appointment already exists
    const existingAppointment = await storage.getAppointmentById(appointmentId);
    
    if (existingAppointment) {
      // Update the existing appointment
      await storage.updateAppointment(appointmentId, appointmentData);
      return `Updated appointment ${appointmentId}`;
    } else {
      // Create a new appointment
      await storage.createAppointment(appointmentData);
      return `Created new appointment ${appointmentId}`;
    }
  } catch (error) {
    console.error('Error processing appointment webhook:', error);
    throw error;
  }
}

/**
 * Process a webhook from the reschedule form
 */
async function processRescheduleWebhook(payload: any): Promise<string> {
  try {
    // For reschedule forms, we need to extract the original appointment ID
    // This should be in a specific field that was pre-populated when the form opened
    const appointmentId = payload.id59 || payload.reference_number;
    
    if (!appointmentId) {
      throw new Error('No appointment ID found in reschedule webhook payload');
    }
    
    // Get the existing appointment
    const existingAppointment = await storage.getAppointmentById(appointmentId);
    
    if (!existingAppointment) {
      throw new Error(`Appointment ${appointmentId} not found for reschedule`);
    }
    
    // Update only the updated date/time fields and disposition status
    const updateData: Partial<InsertAppointment> = {
      dispositionStatus: 'Reschedule',
      updatedStartDate: payload.id61 || payload.updated_start_date,
      updatedStartTime: payload.id62 || payload.updated_start_time,
      updatedEndDate: payload.id63 || payload.updated_end_date,
      updatedEndTime: payload.id64 || payload.updated_end_time,
    };
    
    // Update the appointment
    await storage.updateAppointment(appointmentId, updateData);
    return `Rescheduled appointment ${appointmentId}`;
  } catch (error) {
    console.error('Error processing reschedule webhook:', error);
    throw error;
  }
}

/**
 * Process a webhook from the complete/cancel form
 */
async function processCompleteOrCancelWebhook(payload: any): Promise<string> {
  try {
    // Extract the appointment ID from the reference number field
    const appointmentId = payload.id59 || payload.reference_number;
    
    if (!appointmentId) {
      throw new Error('No appointment ID found in complete/cancel webhook payload');
    }
    
    // Get the existing appointment
    const existingAppointment = await storage.getAppointmentById(appointmentId);
    
    if (!existingAppointment) {
      throw new Error(`Appointment ${appointmentId} not found for complete/cancel`);
    }
    
    // Determine the action based on disposition status field (id49)
    const dispositionStatus = payload.id49 || payload.disposition_status;
    let action = 'unknown';
    
    if (dispositionStatus === '1' || dispositionStatus === 'Complete') {
      action = 'Complete';
    } else if (dispositionStatus === '3' || dispositionStatus === 'Cancel' || dispositionStatus === 'Canceled') {
      action = 'Canceled';
    }
    
    // Build update data
    const updateData: Partial<InsertAppointment> = {
      dispositionStatus: action,
    };
    
    // For cancellations, add cancellation details
    if (action === 'Canceled') {
      updateData.whoCanceled = payload.id67 || payload.who_canceled;
      updateData.cancellationDetails = payload.id68 || payload.cancellation_details;
    }
    
    // For completions, add payment and feedback details
    if (action === 'Complete') {
      updateData.totalCollectedCash = payload.id51 || payload.total_collected_cash;
      updateData.totalCollectedDigital = payload.id52 || payload.total_collected_digital;
      // For DB storage we need to cast the numeric fields to their string representation
      updateData.totalCollected = payload.id53 ? String(parseFloat(payload.id53)) : undefined;
      updateData.paymentProcessor = payload.id55 || payload.payment_processor;
      updateData.paymentNotes = payload.id56 || payload.payment_notes;
      updateData.seeAgain = payload.id57 || payload.see_again;
      updateData.callNotes = payload.id58 || payload.call_notes;
    }
    
    // Update the appointment
    await storage.updateAppointment(appointmentId, updateData);
    return `Updated appointment ${appointmentId} with action: ${action}`;
  } catch (error) {
    console.error('Error processing complete/cancel webhook:', error);
    throw error;
  }
}

/**
 * Maps a webhook payload to our appointment schema
 */
function mapPayloadToAppointment(payload: any): InsertAppointment {
  // Helper function to get a field value, trying multiple possible keys
  const getField = (
    idField: string, 
    snakeCaseField: string, 
    transform?: (value: any) => any
  ): any => {
    const value = payload[idField] !== undefined 
      ? payload[idField] 
      : payload[snakeCaseField];
    
    return transform && value !== undefined ? transform(value) : value;
  };
  
  // Convert strings to boolean
  const stringToBoolean = (value: string | number): boolean => {
    if (typeof value === 'number') return value === 1;
    return value === '1' || value === 'true';
  };
  
  // Convert strings to numbers
  const stringToNumber = (value: string): string | undefined => {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : String(num);
  };
  
  // Map the payload to our appointment schema
  return {
    id: getField('id', 'id') || getField('result_id', 'result_id'),
    
    // Basic info
    setBy: getField('id0', 'set_by'),
    provider: getField('id1', 'provider'),
    marketingChannel: getField('id2', 'marketing_channel'),
    clientName: getField('id4', 'client_name'),
    clientPhone: getField('id5', 'client_phone'),
    clientUsesEmail: getField('id7', 'client_uses_email', stringToBoolean),
    clientEmail: getField('id24', 'client_email'),
    
    // Location info
    callType: getField('id17', 'call_type'),
    streetAddress: getField('id10', 'street_address'),
    addressLine2: getField('id11', 'address_line_2'),
    city: getField('id12', 'city'),
    state: getField('id13', 'state'),
    zipCode: getField('id14', 'zip_code'),
    outcallDetails: getField('id21', 'outcall_details'),
    
    // Appointment time
    startDate: getField('id25', 'start_date'),
    startTime: getField('id26', 'start_time'),
    endDate: getField('id27', 'end_date'),
    endTime: getField('id28', 'end_time'),
    duration: getField('id29', 'duration', stringToNumber),
    
    // Financial info
    grossRevenue: getField('id32', 'gross_revenue', stringToNumber),
    travel: getField('id34', 'travel'),
    hostingExpense: getField('id36', 'hosting_expense'),
    inOutGoesTo: getField('id37', 'in_out_goes_to'),
    totalExpenses: getField('id38', 'total_expenses', stringToNumber),
    depositAmount: getField('id39', 'deposit_amount', stringToNumber),
    depositCalculated: getField('id40', 'deposit_calculated'),
    depositReceivedBy: getField('id41', 'deposit_received_by'),
    paymentProcess: getField('id42', 'payment_process'),
    dueToProvider: getField('id43', 'due_to_provider', stringToNumber),
    
    // Notes
    leaveNotes: getField('id44', 'leave_notes'),
    clientNotes: getField('id45', 'client_notes'),
    
    // Disposition
    dispositionStatus: getField('id49', 'disposition_status'),
    
    // Additional details
    totalCollectedCash: getField('id51', 'total_collected_cash'),
    totalCollectedDigital: getField('id52', 'total_collected_digital'),
    totalCollected: getField('id53', 'total_collected', stringToNumber),
    paymentProcessor: getField('id55', 'payment_processor'),
    paymentNotes: getField('id56', 'payment_notes'),
    seeAgain: getField('id57', 'see_again'),
    callNotes: getField('id58', 'call_notes'),
    
    // Reference numbers
    referenceNumber: getField('id59', 'reference_number'),
    
    // Updates
    updatedStartDate: getField('id61', 'updated_start_date'),
    updatedStartTime: getField('id62', 'updated_start_time'),
    updatedEndDate: getField('id63', 'updated_end_date'),
    updatedEndTime: getField('id64', 'updated_end_time'),
    
    // Cancellation
    whoCanceled: getField('id67', 'who_canceled'),
    cancellationDetails: getField('id68', 'cancellation_details'),
    
    // System fields (set in the database storage)
    createdAt: undefined,
    updatedAt: undefined
  };
}

// Main webhook handler
export async function handleFormSiteWebhook(req: Request, res: Response) {
  // Get the source from the custom property or from URL path
  const source = ((req as any).webhookSource || req.path.split('/').pop()) as WebhookSource;
  const payload = req.body;
  
  console.log(`Received webhook from ${source}`);
  
  // Create a log entry for this webhook
  let logId: number | undefined;
  
  try {
    const webhookLog: InsertWebhookLog = {
      source,
      appointmentId: payload.id || payload.result_id || payload.id59 || payload.reference_number,
      rawData: payload,
      action: 'pending', // Will be updated later
      status: 'processing',
      errorMessage: null,
    };
    
    try {
      // Initial log entry
      const log = await storage.createWebhookLog(webhookLog);
      logId = log.id;
    } catch (error) {
      console.error('Error creating webhook log:', error);
      // Continue processing even if logging fails
    }
    
    // Process the webhook based on source
    let result: string;
    let action: string;
    
    switch (source) {
      case 'appointment':
        result = await processAppointmentWebhook(payload);
        action = 'create';
        break;
      case 'appointment-reschedule':
        result = await processRescheduleWebhook(payload);
        action = 'reschedule';
        break;
      case 'appointment-com-can':
        result = await processCompleteOrCancelWebhook(payload);
        // Action will depend on the form submission - determined inside the function
        action = payload.id49 === '1' || payload.disposition_status === 'Complete' 
          ? 'complete' 
          : 'cancel';
        break;
      default:
        throw new Error(`Unknown webhook source: ${source}`);
    }
    
    // Update log with success
    if (logId) {
      try {
        await storage.updateWebhookLog(logId, {
          status: 'success',
          action,
        });
      } catch (error) {
        console.error('Error updating webhook log:', error);
        // Continue processing even if logging fails
      }
    }
    
    res.status(200).json({ success: true, message: result });
  } catch (err) {
    const error = err as Error;
    console.error(`Error processing ${source} webhook:`, error);
    
    // Update log with error if we have a log ID
    if (logId) {
      try {
        await storage.updateWebhookLog(logId, {
          status: 'error',
          errorMessage: error.message,
        });
      } catch (logError) {
        console.error('Error updating webhook log with error:', logError);
      }
    }
    
    // Return error response (but still 200 to acknowledge receipt)
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}