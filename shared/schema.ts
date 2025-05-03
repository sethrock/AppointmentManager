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
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientUsesEmail: boolean("client_uses_email"),
  clientEmail: text("client_email"),
  callType: text("call_type"),
  streetAddress: text("street_address"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  startDate: text("start_date"),
  startTime: text("start_time"),
  endDate: text("end_date"),
  endTime: text("end_time"),
  duration: numeric("duration"),
  grossRevenue: numeric("gross_revenue"),
  depositAmount: numeric("deposit_amount"),
  depositReceivedBy: text("deposit_received_by"),
  paymentProcess: text("payment_process"),
  dueToProvider: numeric("due_to_provider"),
  setBy: text("set_by"),
  provider: text("provider"),
  marketingChannel: text("marketing_channel"),
  clientNotes: text("client_notes"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const appointmentSchema = z.object({
  id: z.string(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientUsesEmail: z.boolean().optional(),
  clientEmail: z.string().optional(),
  callType: z.string().optional(),
  streetAddress: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  grossRevenue: z.number().optional(),
  depositAmount: z.number().optional(),
  depositReceivedBy: z.string().optional(),
  paymentProcess: z.string().optional(),
  dueToProvider: z.number().optional(),
  setBy: z.string().optional(),
  provider: z.string().optional(),
  marketingChannel: z.string().optional(),
  clientNotes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments);

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

// Define filters for appointment data
export const appointmentFiltersSchema = z.object({
  setBy: z.string().optional(),
  provider: z.string().optional(),
  marketingChannel: z.string().optional(),
});

export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>;
