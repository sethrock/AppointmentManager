import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing user schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define appointment schema
export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(), // Formsite ID
  
  // Basic client info
  setBy: text("set_by"),
  provider: text("provider"),
  marketingChannel: text("marketing_channel"),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientUsesEmail: boolean("client_uses_email"),
  clientEmail: text("client_email"),
  
  // Location info
  callType: text("call_type"),
  streetAddress: text("street_address"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  outcallDetails: text("outcall_details"),
  
  // Appointment time info
  startDate: text("start_date"),
  startTime: text("start_time"),
  endDate: text("end_date"),
  endTime: text("end_time"),
  duration: numeric("duration"),
  
  // Financial info
  grossRevenue: numeric("gross_revenue"),
  travel: text("travel"),
  hostingExpense: text("hosting_expense"),
  inOutGoesTo: text("in_out_goes_to"),
  totalExpenses: numeric("total_expenses"),
  depositAmount: numeric("deposit_amount"),
  depositCalculated: text("deposit_calculated"),
  depositReceivedBy: text("deposit_received_by"),
  paymentProcess: text("payment_process"),
  dueToProvider: numeric("due_to_provider"),
  
  // Notes and status
  leaveNotes: text("leave_notes"),
  clientNotes: text("client_notes"),
  dispositionStatus: text("disposition_status"),
  
  // Payment details
  totalCollectedCash: text("total_collected_cash"),
  totalCollectedDigital: text("total_collected_digital"),
  totalCollected: numeric("total_collected"),
  paymentProcessor: text("payment_processor"),
  paymentPhotos: text("payment_photos"),
  paymentNotes: text("payment_notes"),
  
  // Client relationship
  seeAgain: text("see_again"),
  callNotes: text("call_notes"),
  
  // Updates and cancellations
  updatedStartDate: text("updated_start_date"),
  updatedStartTime: text("updated_start_time"),
  updatedEndDate: text("updated_end_date"),
  updatedEndTime: text("updated_end_time"),
  whoCanceled: text("who_canceled"),
  cancellationDetails: text("cancellation_details"),
  
  // Internal IDs
  appId: text("app_id"),
  referenceNumber: text("reference_number"),
  repetitionNumber: text("repetition_number"),
  
  // Meta fields
  scoringTotal: text("scoring_total"),
  scoringMax: text("scoring_max"),
  orderTotal: text("order_total"),
  saveReturnUsername: text("save_return_username"),
  saveReturnEmail: text("save_return_email"),
  
  // System timestamps
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const appointmentSchema = z.object({
  id: z.string(),
  
  // Basic client info
  setBy: z.string().optional(),
  provider: z.string().optional(),
  marketingChannel: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientUsesEmail: z.boolean().optional(),
  clientEmail: z.string().optional(),
  
  // Location info
  callType: z.string().optional(),
  streetAddress: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  outcallDetails: z.string().optional(),
  
  // Appointment time info
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  
  // Financial info
  grossRevenue: z.number().optional(),
  travel: z.string().optional(),
  hostingExpense: z.string().optional(),
  inOutGoesTo: z.string().optional(),
  totalExpenses: z.number().optional(),
  depositAmount: z.number().optional(),
  depositCalculated: z.string().optional(),
  depositReceivedBy: z.string().optional(),
  paymentProcess: z.string().optional(),
  dueToProvider: z.number().optional(),
  
  // Notes and status
  leaveNotes: z.string().optional(),
  clientNotes: z.string().optional(),
  dispositionStatus: z.string().optional(),
  
  // Payment details
  totalCollectedCash: z.string().optional(),
  totalCollectedDigital: z.string().optional(),
  totalCollected: z.number().optional(),
  paymentProcessor: z.string().optional(),
  paymentPhotos: z.string().optional(),
  paymentNotes: z.string().optional(),
  
  // Client relationship
  seeAgain: z.string().optional(),
  callNotes: z.string().optional(),
  
  // Updates and cancellations
  updatedStartDate: z.string().optional(),
  updatedStartTime: z.string().optional(),
  updatedEndDate: z.string().optional(),
  updatedEndTime: z.string().optional(),
  whoCanceled: z.string().optional(),
  cancellationDetails: z.string().optional(),
  
  // Internal IDs
  appId: z.string().optional(),
  referenceNumber: z.string().optional(),
  repetitionNumber: z.string().optional(),
  
  // Meta fields
  scoringTotal: z.string().optional(),
  scoringMax: z.string().optional(),
  orderTotal: z.string().optional(),
  saveReturnUsername: z.string().optional(),
  saveReturnEmail: z.string().optional(),
  
  // System timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments);

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

// Define filters for appointment data
export const appointmentFiltersSchema = z.object({
  phoneNumber: z.string().optional(),
});

export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>;
