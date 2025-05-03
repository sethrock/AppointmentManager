import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAppointments, getAppointmentById, getFormItems } from "./formsiteApi";
import { appointmentFiltersSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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
        // Return the actual error for debugging the API connection
        return res.status(500).json({ 
          message: apiError instanceof Error ? apiError.message : "Unknown error occurred",
          error: "formsite_api_error"
        });
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
        // Return the actual error for debugging the API connection
        return res.status(500).json({ 
          message: apiError instanceof Error ? apiError.message : "Unknown error occurred",
          error: "formsite_api_error"
        });
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

  // Get Formsite form structure (for debugging)
  app.get("/api/form-items", async (req, res, next) => {
    try {
      try {
        const formItems = await getFormItems();
        res.json(formItems);
      } catch (apiError) {
        console.error("Error fetching form items:", apiError);
        return res.status(500).json({ 
          message: apiError instanceof Error ? apiError.message : "Unknown error occurred",
          error: "formsite_api_error"
        });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
