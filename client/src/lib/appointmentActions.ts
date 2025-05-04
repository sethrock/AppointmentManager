
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define action types
export type AppointmentAction = "reschedule" | "complete" | "cancel";

// Define interface for reschedule data
export interface RescheduleData {
  appointmentId: string;
  updatedStartDate: string;
  updatedStartTime: string;
  updatedEndDate: string;
  updatedEndTime: string;
}

// Define interface for cancellation data
export interface CancellationData {
  appointmentId: string;
  whoCanceled: "Client" | "Provider";
  cancellationDetails?: string;
}

// Action functions
export const useAppointmentAction = () => {
  const queryClient = useQueryClient();

  // Reschedule appointment mutation
  const rescheduleAppointment = useMutation({
    mutationFn: async (data: RescheduleData) => {
      const response = await fetch(`/api/appointments/${data.appointmentId}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reschedule appointment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  // Complete appointment mutation
  const completeAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete appointment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  // Cancel appointment mutation
  const cancelAppointment = useMutation({
    mutationFn: async (data: CancellationData) => {
      const response = await fetch(`/api/appointments/${data.appointmentId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whoCanceled: data.whoCanceled,
          cancellationDetails: data.cancellationDetails,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
  });

  return {
    rescheduleAppointment,
    completeAppointment,
    cancelAppointment,
  };
};
