import { 
  users, 
  type User, 
  type InsertUser,
  appointments,
  type Appointment,
  type InsertAppointment,
  webhookLogs,
  type WebhookLog,
  type InsertWebhookLog,
  type AppointmentFilters
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc } from "drizzle-orm";

// Interface for all storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointment methods
  getAppointments(filters?: AppointmentFilters): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // Webhook methods
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  updateWebhookLog(id: number, data: Partial<InsertWebhookLog>): Promise<WebhookLog | undefined>;
  getWebhookLogsByAppointmentId(appointmentId: string): Promise<WebhookLog[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Appointment methods
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let query = db.select().from(appointments).orderBy(desc(appointments.createdAt));
    
    // Apply filters if provided
    if (filters?.phoneNumber) {
      query = query.where(ilike(appointments.clientPhone, `%${filters.phoneNumber}%`));
    }
    
    return await query;
  }
  
  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment;
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const now = new Date();
    const appointmentWithTimestamps = {
      ...appointment,
      createdAt: now,
      updatedAt: now
    };
    
    const [createdAppointment] = await db
      .insert(appointments)
      .values(appointmentWithTimestamps)
      .returning();
      
    return createdAppointment;
  }
  
  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const now = new Date();
    const dataWithTimestamp = {
      ...appointmentData,
      updatedAt: now
    };
    
    const [updatedAppointment] = await db
      .update(appointments)
      .set(dataWithTimestamp)
      .where(eq(appointments.id, id))
      .returning();
      
    return updatedAppointment;
  }
  
  // Webhook methods
  async createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog> {
    const [createdLog] = await db
      .insert(webhookLogs)
      .values(log)
      .returning();
      
    return createdLog;
  }
  
  async updateWebhookLog(id: number, data: Partial<InsertWebhookLog>): Promise<WebhookLog | undefined> {
    const [updatedLog] = await db
      .update(webhookLogs)
      .set(data)
      .where(eq(webhookLogs.id, id))
      .returning();
      
    return updatedLog;
  }
  
  async getWebhookLogsByAppointmentId(appointmentId: string): Promise<WebhookLog[]> {
    return await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.appointmentId, appointmentId))
      .orderBy(desc(webhookLogs.createdAt));
  }
}

// Export a single instance of DatabaseStorage to be used throughout the app
export const storage = new DatabaseStorage();
