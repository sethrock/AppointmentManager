
import { Appointment } from "../types/appointment";

/**
 * Builds a pre-filled URL for the Formsite reschedule form with appointment data
 */
export function buildRescheduleUrl(appointment: Appointment, action: 'Reschedule' | 'Complete' | 'Cancel' = 'Reschedule'): string {
  // Base URL for the reschedule form
  const baseUrl = "https://fs16.formsite.com/Qi21et/appointment-reschedule/fill";
  
  // Map appointment data to form fields
  const params = new URLSearchParams();
  
  // Helper function to map dropdown/radio values to position numbers
  const mapDropdownValue = (value: string | undefined, valueMap: Record<string, string>): string => {
    if (!value) return "";
    return valueMap[value] || "1"; // Default to first position if not found
  };
  
  // Define mappings for dropdown fields (value to position)
  // These are sample mappings - you'll need to adjust based on the actual options in your form
  const setByMap: Record<string, string> = {
    "Seth": "1",
    "John": "2",
    "Alice": "3",
    // Add other setBy options and their positions
  };
  
  const providerMap: Record<string, string> = {
    "Sera": "1",
    "Alex": "2",
    "Michael": "3",
    // Add other provider options and their positions
  };
  
  const marketingChannelMap: Record<string, string> = {
    "Private Delights": "1",
    "Referral": "2",
    "Social Media": "3",
    // Add other marketing channel options and their positions
  };
  
  const callTypeMap: Record<string, string> = {
    "In-Call": "1",
    "Out-Call": "2",
    // Add other call type options and their positions
  };
  
  const stateMap: Record<string, string> = {
    "Alabama": "1",
    "Alaska": "2",
    "Arizona": "3",
    // Add more states as needed
  };
  
  const inOutGoesToMap: Record<string, string> = {
    "Option1": "1",
    "Option2": "2",
    "Option3": "3",
    // Add appropriate options for inOutGoesTo
  };
  
  const depositReceivedByMap: Record<string, string> = {
    "Cash": "1",
    "Card": "2",
    "Digital": "3",
    // Add appropriate options
  };
  
  const paymentProcessMap: Record<string, string> = {
    "Cash": "1",
    "Card": "2", 
    "Digital": "3",
    // Add appropriate options
  };
  
  const dispositionStatusMap: Record<string, string> = {
    "Complete": "1",    
    "Reschedule": "2",
    "Cancel": "3",
    // Specific positions for our action buttons
  };
  
  // Pre-fill all the appointment data
  // For dropdowns and radio buttons, use position numbers
  if (appointment.setBy) params.append("id0", mapDropdownValue(appointment.setBy, setByMap));
  if (appointment.provider) params.append("id1", mapDropdownValue(appointment.provider, providerMap));
  if (appointment.marketingChannel) params.append("id2", mapDropdownValue(appointment.marketingChannel, marketingChannelMap));
  
  // Text fields (use the actual values)
  if (appointment.clientName) params.append("id4", appointment.clientName);
  if (appointment.clientPhone) params.append("id5", appointment.clientPhone);
  
  // Boolean/checkbox fields (1 = selected, 0 = not selected)
  params.append("id7", appointment.clientUsesEmail ? "1" : "0");
  
  if (appointment.clientEmail) params.append("id24", appointment.clientEmail);
  
  // Dropdown for call type
  if (appointment.callType) params.append("id17", mapDropdownValue(appointment.callType, callTypeMap));
  
  // More text fields
  if (appointment.streetAddress) params.append("id10", appointment.streetAddress);
  if (appointment.addressLine2) params.append("id11", appointment.addressLine2);
  if (appointment.city) params.append("id12", appointment.city);
  
  // Dropdown for state
  if (appointment.state) params.append("id13", mapDropdownValue(appointment.state, stateMap));
  
  if (appointment.zipCode) params.append("id14", appointment.zipCode);
  if (appointment.outcallDetails) params.append("id21", appointment.outcallDetails);
  if (appointment.startDate) params.append("id25", appointment.startDate);
  if (appointment.startTime) params.append("id26", appointment.startTime);
  if (appointment.endDate) params.append("id27", appointment.endDate);
  if (appointment.endTime) params.append("id28", appointment.endTime);
  if (appointment.duration) params.append("id29", appointment.duration.toString());
  if (appointment.grossRevenue) params.append("id32", appointment.grossRevenue.toString());
  if (appointment.travel) params.append("id34", appointment.travel);
  if (appointment.hostingExpense) params.append("id36", appointment.hostingExpense);
  
  // Dropdown for inOutGoesTo
  if (appointment.inOutGoesTo) params.append("id37", mapDropdownValue(appointment.inOutGoesTo, inOutGoesToMap));
  
  if (appointment.totalExpenses) params.append("id38", appointment.totalExpenses.toString());
  if (appointment.depositAmount) params.append("id39", appointment.depositAmount.toString());
  if (appointment.depositCalculated) params.append("id40", appointment.depositCalculated);
  
  // Dropdown for depositReceivedBy
  if (appointment.depositReceivedBy) params.append("id41", mapDropdownValue(appointment.depositReceivedBy, depositReceivedByMap));
  
  // Dropdown for paymentProcess
  if (appointment.paymentProcess) params.append("id42", mapDropdownValue(appointment.paymentProcess, paymentProcessMap));
  
  if (appointment.dueToProvider) params.append("id43", appointment.dueToProvider.toString());
  if (appointment.leaveNotes) params.append("id44", appointment.leaveNotes);
  if (appointment.clientNotes) params.append("id45", appointment.clientNotes);
  
  // Set the Disposition Status based on the action button clicked
  // Use the correct position number for the dropdown from the mapping
  params.append("id49", mapDropdownValue(action, dispositionStatusMap));
  
  if (appointment.totalCollectedCash) params.append("id51", appointment.totalCollectedCash);
  if (appointment.totalCollectedDigital) params.append("id52", appointment.totalCollectedDigital);
  if (appointment.totalCollected) params.append("id53", appointment.totalCollected.toString());
  if (appointment.paymentProcessor) params.append("id55", appointment.paymentProcessor);
  if (appointment.paymentNotes) params.append("id56", appointment.paymentNotes);
  if (appointment.seeAgain) params.append("id57", appointment.seeAgain);
  if (appointment.callNotes) params.append("id58", appointment.callNotes);
  if (appointment.updatedStartDate) params.append("id61", appointment.updatedStartDate);
  if (appointment.updatedStartTime) params.append("id62", appointment.updatedStartTime);
  if (appointment.updatedEndDate) params.append("id63", appointment.updatedEndDate);
  if (appointment.updatedEndTime) params.append("id64", appointment.updatedEndTime);
  if (appointment.whoCanceled) params.append("id67", appointment.whoCanceled);
  if (appointment.cancellationDetails) params.append("id68", appointment.cancellationDetails);
  
  // The crucial part - using the appointment ID as the reference number
  // This ensures we're passing the unique identifier (19947904, etc.) to field [pipe:59?]
  params.append("id59", appointment.id);
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Opens the Formsite reschedule form in a new tab/window with "Reschedule" disposition
 */
export function rescheduleAppointment(appointment: Appointment): void {
  const url = buildRescheduleUrl(appointment, 'Reschedule');
  window.open(url, '_blank');
}

/**
 * Opens the Formsite form in a new tab/window with "Cancel" disposition
 */
export function cancelAppointment(appointment: Appointment): void {
  const url = buildRescheduleUrl(appointment, 'Cancel');
  window.open(url, '_blank');
}

/**
 * Opens the Formsite form in a new tab/window with "Complete" disposition
 */
export function completeAppointment(appointment: Appointment): void {
  const url = buildRescheduleUrl(appointment, 'Complete');
  window.open(url, '_blank');
}
