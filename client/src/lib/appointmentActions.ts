
import { Appointment } from "../types/appointment";

/**
 * Builds a pre-filled URL for the Formsite reschedule form with appointment data
 */
export function buildRescheduleUrl(appointment: Appointment): string {
  // Base URL for the reschedule form
  const baseUrl = "https://fs16.formsite.com/Qi21et/appointment-reschedule/fill";
  
  // Map appointment data to form fields
  const params = new URLSearchParams();
  
  // Pre-fill all the appointment data
  if (appointment.setBy) params.append("id0", appointment.setBy);
  if (appointment.provider) params.append("id1", appointment.provider);
  if (appointment.marketingChannel) params.append("id2", appointment.marketingChannel);
  if (appointment.clientName) params.append("id4", appointment.clientName);
  if (appointment.clientPhone) params.append("id5", appointment.clientPhone);
  params.append("id7", appointment.clientUsesEmail ? "1" : "0");
  if (appointment.clientEmail) params.append("id24", appointment.clientEmail);
  if (appointment.callType) params.append("id17", appointment.callType);
  if (appointment.streetAddress) params.append("id10", appointment.streetAddress);
  if (appointment.addressLine2) params.append("id11", appointment.addressLine2);
  if (appointment.city) params.append("id12", appointment.city);
  if (appointment.state) params.append("id13", appointment.state);
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
  if (appointment.inOutGoesTo) params.append("id37", appointment.inOutGoesTo);
  if (appointment.totalExpenses) params.append("id38", appointment.totalExpenses.toString());
  if (appointment.depositAmount) params.append("id39", appointment.depositAmount.toString());
  if (appointment.depositCalculated) params.append("id40", appointment.depositCalculated);
  if (appointment.depositReceivedBy) params.append("id41", appointment.depositReceivedBy);
  if (appointment.paymentProcess) params.append("id42", appointment.paymentProcess);
  if (appointment.dueToProvider) params.append("id43", appointment.dueToProvider.toString());
  if (appointment.leaveNotes) params.append("id44", appointment.leaveNotes);
  if (appointment.clientNotes) params.append("id45", appointment.clientNotes);
  if (appointment.dispositionStatus) params.append("id49", appointment.dispositionStatus);
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
  
  // The crucial part - using the reference number from the original appointment
  if (appointment.referenceNumber) params.append("id59", appointment.referenceNumber);
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Opens the Formsite reschedule form in a new tab/window
 */
export function rescheduleAppointment(appointment: Appointment): void {
  const url = buildRescheduleUrl(appointment);
  window.open(url, '_blank');
}

/**
 * Placeholder for cancel appointment action
 */
export function cancelAppointment(appointment: Appointment): void {
  console.log("Cancel appointment", appointment.id);
  // Implementation will go here
}

/**
 * Placeholder for complete appointment action
 */
export function completeAppointment(appointment: Appointment): void {
  console.log("Complete appointment", appointment.id);
  // Implementation will go here
}
