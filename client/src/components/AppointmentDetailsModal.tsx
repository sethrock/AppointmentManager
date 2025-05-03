import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";

interface AppointmentDetailsModalProps {
  appointmentId: string;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ 
  appointmentId, 
  onClose 
}: AppointmentDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  
  const { 
    data: appointment, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleEditAppointment = () => {
    // Close the modal first
    onClose();
    // Navigate to the details page
    navigate(`/appointments/${appointmentId}`);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[hsl(var(--surface))] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-[hsl(var(--surface))] z-10">
          <h3 className="text-lg font-medium">Appointment Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="p-6 space-y-6">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>

            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-[hsl(var(--error))] mb-2">
              Error loading appointment details
            </p>
            <p className="text-muted-foreground mb-4">
              Please try again later or contact support.
            </p>
          </div>
        ) : appointment ? (
          <div className="p-6">
            {/* Client Information Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                  <p className="font-medium">{appointment.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-mono">{appointment.clientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Status</p>
                  <p className="flex items-center">
                    {appointment.clientUsesEmail ? (
                      <>
                        <span className="w-4 h-4 rounded-full bg-[hsl(var(--success))] inline-block mr-1.5" />
                        Uses Email
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-muted inline-block mr-1.5" />
                        Does Not Use Email
                      </>
                    )}
                  </p>
                </div>
                {appointment.clientUsesEmail && appointment.clientEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                    <p className="font-mono">{appointment.clientEmail}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Appointment Location Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                Appointment Location
              </h4>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Call Type</p>
                <p className="font-medium">{appointment.callType}</p>
              </div>
              {appointment.streetAddress && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p>{appointment.streetAddress}</p>
                  {appointment.addressLine2 && <p>{appointment.addressLine2}</p>}
                  <p>
                    <span>{appointment.city}</span>,{" "}
                    <span>{appointment.state}</span>{" "}
                    <span className="font-mono">{appointment.zipCode}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Appointment Date & Time Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                Appointment Date & Time
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date & Time</p>
                  <p>{appointment.startDate} {appointment.startTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date & Time</p>
                  <p>{appointment.endDate} {appointment.endTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p>{appointment.duration} hours</p>
                </div>
              </div>
            </div>
            
            {/* Financial Details Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                Financial Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gross Revenue</p>
                  <p className="font-mono text-[hsl(var(--secondary))] font-medium">
                    {formatCurrency(appointment.grossRevenue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deposit Amount</p>
                  <p className="font-mono">
                    {formatCurrency(appointment.depositAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deposit Received By</p>
                  <p>{appointment.depositReceivedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Process</p>
                  <p>{appointment.paymentProcess}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due To Provider</p>
                  <p className="font-mono text-[hsl(var(--secondary))] font-medium">
                    {formatCurrency(appointment.dueToProvider || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            {appointment.clientNotes && (
              <div>
                <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                  Client Notes
                </h4>
                <p className="text-sm whitespace-pre-line">
                  {appointment.clientNotes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Appointment not found.
            </p>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button 
            variant="default"
            className="mr-3"
            onClick={handleEditAppointment}
            disabled={isLoading || isError || !appointment}
          >
            <Edit className="mr-2 h-4 w-4" /> View Full Details
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-[hsl(var(--surface2))] hover:bg-[hsl(var(--surface))]"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
