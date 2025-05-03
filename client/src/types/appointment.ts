export interface Appointment {
  id: string;
  clientName?: string;
  clientPhone?: string;
  clientUsesEmail?: boolean;
  clientEmail?: string;
  callType?: string;
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  duration?: number;
  grossRevenue?: number;
  depositAmount?: number;
  depositReceivedBy?: string;
  paymentProcess?: string;
  dueToProvider?: number;
  setBy?: string;
  provider?: string;
  marketingChannel?: string;
  clientNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentFilters {
  setBy?: string;
  provider?: string;
  marketingChannel?: string;
}
