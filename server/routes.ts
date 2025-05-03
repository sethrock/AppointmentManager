import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAppointments, getAppointmentById } from "./formsiteApi";
import { appointmentFiltersSchema, Appointment } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Mock data function for development purposes
function getMockAppointments(): Appointment[] {
  return [
    {
      id: "1001",
      clientName: "John Smith",
      clientPhone: "555-123-4567",
      clientUsesEmail: true,
      clientEmail: "john.smith@example.com",
      callType: "In Call",
      streetAddress: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      startDate: "2023-05-15",
      startTime: "14:00",
      endDate: "2023-05-15", 
      endTime: "16:00",
      duration: 2,
      grossRevenue: 500,
      depositAmount: 150,
      depositReceivedBy: "Venmo",
      paymentProcess: "Cash",
      dueToProvider: 350,
      setBy: "Seth",
      provider: "Sera",
      marketingChannel: "Private Delights",
      clientNotes: "First time client, prefers afternoon appointments."
    },
    {
      id: "1002",
      clientName: "Emily Johnson",
      clientPhone: "555-987-6543",
      clientUsesEmail: true,
      clientEmail: "emily.j@example.com",
      callType: "Out Call",
      streetAddress: "456 Pine Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      startDate: "2023-05-18",
      startTime: "19:00",
      endDate: "2023-05-18",
      endTime: "22:00",
      duration: 3,
      grossRevenue: 750,
      depositAmount: 250,
      depositReceivedBy: "Cash App",
      paymentProcess: "Credit Card",
      dueToProvider: 500,
      setBy: "Sera",
      provider: "Chloe",
      marketingChannel: "Eros",
      clientNotes: "Regular client, prefers evening appointments."
    },
    {
      id: "1003",
      clientName: "Robert Williams",
      clientPhone: "555-222-3333",
      clientUsesEmail: false,
      callType: "In Call",
      streetAddress: "789 Oak Dr",
      city: "Bellevue",
      state: "WA",
      zipCode: "98004",
      startDate: "2023-05-20",
      startTime: "11:00",
      endDate: "2023-05-20",
      endTime: "13:00",
      duration: 2,
      grossRevenue: 450,
      depositAmount: 100,
      depositReceivedBy: "Zelle",
      paymentProcess: "Cash",
      dueToProvider: 350,
      setBy: "Seth",
      provider: "Alexa",
      marketingChannel: "Tryst",
      clientNotes: ""
    },
    {
      id: "1004",
      clientName: "Jessica Brown",
      clientPhone: "555-444-5555",
      clientUsesEmail: true,
      clientEmail: "jess.brown@example.com",
      callType: "Out Call",
      streetAddress: "101 Elm St",
      city: "Seattle",
      state: "WA",
      zipCode: "98109",
      startDate: "2023-05-22",
      startTime: "16:00",
      endDate: "2023-05-22",
      endTime: "18:00",
      duration: 2,
      grossRevenue: 600,
      depositAmount: 200,
      depositReceivedBy: "PayPal",
      paymentProcess: "Credit Card",
      dueToProvider: 400,
      setBy: "Sera",
      provider: "Sera",
      marketingChannel: "P411",
      clientNotes: "Referred by another client."
    },
    {
      id: "1005",
      clientName: "David Miller",
      clientPhone: "555-777-8888",
      clientUsesEmail: true,
      clientEmail: "david.m@example.com",
      callType: "In Call",
      streetAddress: "222 Cedar Blvd",
      city: "Kirkland",
      state: "WA",
      zipCode: "98033",
      startDate: "2023-05-25",
      startTime: "20:00",
      endDate: "2023-05-25",
      endTime: "23:00",
      duration: 3,
      grossRevenue: 800,
      depositAmount: 300,
      depositReceivedBy: "Venmo",
      paymentProcess: "Cash",
      dueToProvider: 500,
      setBy: "Seth",
      provider: "Frenchie",
      marketingChannel: "Referral",
      clientNotes: "New client, prefers late evening appointments."
    }
  ];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get filtered appointments
  app.get("/api/appointments", async (req, res, next) => {
    try {
      // Parse and validate filters
      const result = appointmentFiltersSchema.safeParse(req.query);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const filters = result.data;
      try {
        const appointments = await getAppointments(filters);
        res.json(appointments);
      } catch (apiError) {
        console.error("Error fetching appointments:", apiError);
        // For development, provide mock data instead of failing
        // This helps UI development continue while API issues are being resolved
        const mockAppointments = getMockAppointments();
        console.log("Using mock appointments data for development");
        
        // Apply filters to mock data
        let filteredAppointments = [...mockAppointments];
        if (filters.setBy && filters.setBy !== "all") {
          filteredAppointments = filteredAppointments.filter(app => app.setBy === filters.setBy);
        }
        if (filters.provider && filters.provider !== "all") {
          filteredAppointments = filteredAppointments.filter(app => app.provider === filters.provider);
        }
        if (filters.marketingChannel && filters.marketingChannel !== "all") {
          filteredAppointments = filteredAppointments.filter(app => app.marketingChannel === filters.marketingChannel);
        }
        
        res.json(filteredAppointments);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get appointment by ID
  app.get("/api/appointments/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      
      try {
        const appointment = await getAppointmentById(id);
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        res.json(appointment);
      } catch (apiError) {
        console.error(`Error fetching appointment ${id}:`, apiError);
        // For development, try to get mock appointment with the same ID
        const mockAppointments = getMockAppointments();
        const mockAppointment = mockAppointments.find(a => a.id === id);
        
        if (!mockAppointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        console.log(`Using mock data for appointment ${id}`);
        res.json(mockAppointment);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get filter options (set by, provider, marketing channel)
  app.get("/api/filters", async (req, res, next) => {
    try {
      // We'll extract these from the Formsite API in a real implementation
      // For now, return static data based on our content MD file
      const filters = {
        setBy: ["Seth", "Sera"],
        provider: ["Sera", "Courtesan Couple", "Chloe", "Alexa", "Frenchie"],
        marketingChannel: ["Private Delights", "Eros", "Tryst", "P411", "Slixa", "Instagram", "X", "Referral"]
      };
      
      res.json(filters);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
