export interface Appointment {
  id: string;
  
  // Client Information
  clientName?: string;
  clientPhone?: string;
  clientUsesEmail?: boolean;
  clientEmail?: string;
  
  // Location Information
  callType?: string;
  outcallDetails?: string;
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Date and Time
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  duration?: number;
  
  // Updated Dates
  updatedStartDate?: string;
  updatedStartTime?: string;
  updatedEndDate?: string;
  updatedEndTime?: string;
  
  // Financial Information
  grossRevenue?: number;
  depositAmount?: number;
  depositReceivedBy?: string;
  paymentProcess?: string;
  paymentProcessor?: string;
  depositCalculated?: string;
  dueToProvider?: number;
  
  // Collection Details
  totalCollectedCash?: string;
  totalCollectedDigital?: string;
  totalCollected?: number;
  
  // Expense Details
  travel?: string;
  hostingExpense?: string;
  inOutGoesTo?: string;
  totalExpenses?: number;
  
  // Payment Documentation
  paymentNotes?: string;
  paymentPhotos?: string;
  
  // Booking Information
  setBy?: string;
  provider?: string;
  marketingChannel?: string;
  
  // Notes
  clientNotes?: string;
  callNotes?: string;
  leaveNotes?: string;
  
  // Disposition
  seeAgain?: string;
  dispositionStatus?: string;
  
  // Cancellation
  whoCanceled?: string;
  cancellationDetails?: string;
  
  // Meta Information
  referenceNumber?: string;
  repetitionNumber?: string;
  appId?: string;
  orderTotal?: string;
  scoringTotal?: string;
  scoringMax?: string;
  saveReturnUsername?: string;
  saveReturnEmail?: string;
  
  // System Fields
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentFilters {
  setBy?: string;
  provider?: string;
  marketingChannel?: string;
}
