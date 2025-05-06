import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAppointments, getAppointmentById, getFormItems } from "./formsiteApi";
import { appointmentFiltersSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { handleFormSiteWebhook } from "./webhooks";

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to get raw data from Formsite
  app.get("/api/debug/appointments", async (req, res) => {
    try {
      const endpoint = "/{user_dir}/forms/{form_dir}/results";
      const params = {
        nocache: Date.now().toString()
      };
      const response = await fetch(`https://fs16.formsite.com/api/v2/Qi21et/forms/appointment/results?nocache=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${process.env.FORMSITE_API_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      // Return raw data for debugging
      res.json({
        rawData: data,
        formattedData: data.results.map((result: any) => {
          // Find the ID 49 field (disposition status)
          let status = "Unknown";
          if (result.items && Array.isArray(result.items)) {
            const statusItem = result.items.find((item: any) => item.id === "49");
            status = statusItem ? statusItem.value : "Not found";
          }
          
          return {
            id: result.id,
            status: status,
            resultStatus: result.result_status,
            dateUpdate: result.date_update
          };
        })
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
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
      const id = req.params.id;
      
      try {
        const appointment = await getAppointmentById(id);
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        res.json(appointment);
      } catch (apiError) {
        console.error(`Error fetching appointment ${id}:`, apiError);
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

  // Get webhook logs for an appointment
  app.get("/api/appointments/:id/webhook-logs", async (req, res, next) => {
    try {
      const { id } = req.params;
      const logs = await storage.getWebhookLogsByAppointmentId(id);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });
  
  // Analytics endpoints
  app.get("/api/analytics", async (req, res, next) => {
    try {
      const { timeframe = 'month', start, end } = req.query;
      
      // Get all appointments for analysis
      const appointments = await getAppointments();
      
      // Filter appointments based on date range if provided
      const filteredAppointments = start && end
        ? appointments.filter(appt => {
            const apptDate = appt.startDate ? new Date(appt.startDate) : null;
            if (!apptDate) return false;
            
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            
            return apptDate >= startDate && apptDate <= endDate;
          })
        : appointments;

      // Calculate basic metrics
      const totalAppointments = filteredAppointments.length;
      const completedAppointments = filteredAppointments.filter(appt => 
        appt.dispositionStatus === 'Complete').length;
      const canceledAppointments = filteredAppointments.filter(appt => 
        appt.dispositionStatus === 'Canceled').length;
        
      // Financial metrics
      const totalRevenue = filteredAppointments.reduce((sum, appt) => 
        sum + (appt.grossRevenue || 0), 0);
      const averageRevenue = totalAppointments > 0 
        ? totalRevenue / totalAppointments 
        : 0;
        
      // Time-based analytics based on the selected timeframe
      let timeframeData: Array<{label: string, appointments: number, revenue: number}> = [];
      
      // Group appointments by time period
      if (timeframe === 'week') {
        // For week view, group by day
        const dayMap = new Map<string, {appointments: number, revenue: number}>();
        
        // Initialize past 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dayMap.set(dateStr, { appointments: 0, revenue: 0 });
        }
        
        // Fill in data
        filteredAppointments.forEach(appt => {
          if (!appt.startDate) return;
          const dateStr = new Date(appt.startDate).toISOString().split('T')[0];
          if (dayMap.has(dateStr)) {
            const dayData = dayMap.get(dateStr)!;
            dayData.appointments += 1;
            dayData.revenue += (appt.grossRevenue || 0);
          }
        });
        
        // Convert to array
        timeframeData = Array.from(dayMap.entries()).map(([date, data]) => ({
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          appointments: data.appointments,
          revenue: data.revenue
        }));
      } else if (timeframe === 'month') {
        // For month view, group by week
        const weekMap = new Map<number, {appointments: number, revenue: number}>();
        
        // Initialize weeks
        for (let i = 0; i < 5; i++) {
          weekMap.set(i, { appointments: 0, revenue: 0 });
        }
        
        // Fill in data - assign to weeks based on day of month
        filteredAppointments.forEach(appt => {
          if (!appt.startDate) return;
          const date = new Date(appt.startDate);
          const weekOfMonth = Math.floor(date.getDate() / 7);
          if (weekMap.has(weekOfMonth)) {
            const weekData = weekMap.get(weekOfMonth)!;
            weekData.appointments += 1;
            weekData.revenue += (appt.grossRevenue || 0);
          }
        });
        
        // Convert to array
        timeframeData = Array.from(weekMap.entries()).map(([week, data]) => ({
          label: `Week ${week + 1}`,
          appointments: data.appointments,
          revenue: data.revenue
        }));
      } else if (timeframe === 'year') {
        // For year view, group by month
        const monthMap = new Map<number, {appointments: number, revenue: number}>();
        
        // Initialize months
        for (let i = 0; i < 12; i++) {
          monthMap.set(i, { appointments: 0, revenue: 0 });
        }
        
        // Fill in data
        filteredAppointments.forEach(appt => {
          if (!appt.startDate) return;
          const date = new Date(appt.startDate);
          const month = date.getMonth();
          if (monthMap.has(month)) {
            const monthData = monthMap.get(month)!;
            monthData.appointments += 1;
            monthData.revenue += (appt.grossRevenue || 0);
          }
        });
        
        // Convert to array
        timeframeData = Array.from(monthMap.entries()).map(([month, data]) => ({
          label: new Date(2023, month, 1).toLocaleDateString('en-US', { month: 'short' }),
          appointments: data.appointments,
          revenue: data.revenue
        }));
      }
      
      // Provider performance data
      const providerMap = new Map();
      filteredAppointments.forEach(appt => {
        if (!appt.provider) return;
        
        if (!providerMap.has(appt.provider)) {
          providerMap.set(appt.provider, {
            provider: appt.provider,
            appointments: 0,
            revenue: 0,
            canceledAppointments: 0
          });
        }
        
        const providerStats = providerMap.get(appt.provider);
        providerStats.appointments += 1;
        providerStats.revenue += (appt.grossRevenue || 0);
        
        if (appt.dispositionStatus === 'Canceled') {
          providerStats.canceledAppointments += 1;
        }
      });
      
      const providerPerformance = Array.from(providerMap.values()).map(stats => ({
        ...stats,
        cancellationRate: stats.appointments > 0 
          ? stats.canceledAppointments / stats.appointments 
          : 0
      }));
      
      // Marketing channel analytics
      const channelMap = new Map();
      filteredAppointments.forEach(appt => {
        if (!appt.marketingChannel) return;
        
        if (!channelMap.has(appt.marketingChannel)) {
          channelMap.set(appt.marketingChannel, {
            channel: appt.marketingChannel,
            appointments: 0,
            revenue: 0
          });
        }
        
        const channelStats = channelMap.get(appt.marketingChannel);
        channelStats.appointments += 1;
        channelStats.revenue += (appt.grossRevenue || 0);
      });
      
      const marketingChannels = Array.from(channelMap.values());
      const totalChannelAppointments = marketingChannels.reduce((sum, ch) => 
        sum + ch.appointments, 0);
      
      // Add percentage to each channel
      marketingChannels.forEach(channel => {
        channel.percentage = totalChannelAppointments > 0 
          ? (channel.appointments / totalChannelAppointments) * 100 
          : 0;
      });

      // Prepare and send response
      res.json({
        summary: {
          totalAppointments,
          completedAppointments,
          canceledAppointments,
          totalRevenue,
          averageRevenue
        },
        timeframeData,
        providerPerformance,
        marketingChannels
      });
    } catch (error) {
      console.error("Error in analytics endpoint:", error);
      next(error);
    }
  });

  // Webhook endpoints for Formsite form submissions
  // Main appointment form webhook
  app.post("/api/webhooks/appointment", async (req, res, next) => {
    try {
      (req as any).webhookSource = "appointment";
      await handleFormSiteWebhook(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Appointment reschedule form webhook
  app.post("/api/webhooks/appointment-reschedule", async (req, res, next) => {
    try {
      (req as any).webhookSource = "appointment-reschedule";
      await handleFormSiteWebhook(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Appointment complete/cancel form webhook
  app.post("/api/webhooks/appointment-com-can", async (req, res, next) => {
    try {
      (req as any).webhookSource = "appointment-com-can";
      await handleFormSiteWebhook(req, res);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
