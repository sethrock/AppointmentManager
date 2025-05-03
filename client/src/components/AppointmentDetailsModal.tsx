import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  
  // Helper function to display data field with label
  const DataField = ({ label, value, className = "" }: { label: string; value?: string | number | null; className?: string }) => {
    if (value === undefined || value === null || value === "") return null;
    
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    );
  };

  // Helper function to display currency values
  const CurrencyField = ({ label, value, highlight = false }: { label: string; value?: number | null; highlight?: boolean }) => {
    if (value === undefined || value === null) return null;
    
    const textClass = highlight ? "font-mono text-[hsl(var(--secondary))] font-medium" : "font-mono";
    
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={textClass}>
          {formatCurrency(value)}
        </p>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[hsl(var(--surface))] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-[hsl(var(--surface))] z-10">
          <h3 className="text-lg font-medium">
            Appointment Details
            {appointment?.clientName && ` - ${appointment.clientName}`}
          </h3>
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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="meta">Meta</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6">
                {/* Booking Info */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataField label="Set By" value={appointment.setBy} />
                    <DataField label="Provider" value={appointment.provider} />
                    <DataField label="Marketing Channel" value={appointment.marketingChannel} />
                  </div>
                </div>
                
                {/* Client Information */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField label="Client Name" value={appointment.clientName} />
                    <DataField label="Phone Number" value={appointment.clientPhone} />
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
                      <DataField label="Email Address" value={appointment.clientEmail} />
                    )}
                  </div>
                </div>
                
                {/* Location Information */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Location Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField label="Call Type" value={appointment.callType} />
                    <DataField label="Outcall Details" value={appointment.outcallDetails} />
                  </div>
                  
                  {appointment.streetAddress && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p>{appointment.streetAddress}</p>
                      {appointment.addressLine2 && <p>{appointment.addressLine2}</p>}
                      <p>
                        {appointment.city && <span>{appointment.city}</span>}
                        {appointment.state && <span>, {appointment.state}</span>}
                        {appointment.zipCode && <span> <span className="font-mono">{appointment.zipCode}</span></span>}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Date & Time Information */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Appointment Time
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
                    <DataField label="Duration" value={appointment.duration ? `${appointment.duration} hours` : undefined} />
                  </div>
                </div>
              </TabsContent>
              
              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                {/* Main Financial Information */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Revenue
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CurrencyField label="Gross Revenue" value={appointment.grossRevenue} highlight={true} />
                    <CurrencyField label="Deposit Amount" value={appointment.depositAmount} />
                    <CurrencyField label="Due To Provider" value={appointment.dueToProvider} highlight={true} />
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Payment Methods
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataField label="Deposit Received By" value={appointment.depositReceivedBy} />
                    <DataField label="Payment Process" value={appointment.paymentProcess} />
                    <DataField label="Payment Processor" value={appointment.paymentProcessor} />
                  </div>
                </div>
                
                {/* Collection Details */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Expense Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataField label="Travel" value={appointment.travel} />
                    <DataField label="Hosting Expense" value={appointment.hostingExpense} />
                    <DataField label="IN/OUT Goes To" value={appointment.inOutGoesTo} />
                    <CurrencyField label="Total Expenses" value={appointment.totalExpenses} />
                  </div>
                </div>
              </TabsContent>
              
              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6">
                {/* Client Notes */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Client Notes
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <DataField 
                      label="Client Notes" 
                      value={appointment.clientNotes} 
                      className="whitespace-pre-line"
                    />
                  </div>
                </div>
                
                {/* Call Notes */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Call Experience
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <DataField label="Would you be open to seeing this client again?" value={appointment.seeAgain} />
                    <DataField 
                      label="Notes about how your call went"
                      value={appointment.callNotes}
                      className="whitespace-pre-line"
                    />
                  </div>
                </div>
                
                {/* Status Info */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Disposition Status
                  </h4>
                  <DataField label="Status" value={appointment.dispositionStatus} />
                </div>
              </TabsContent>
              
              {/* Updates Tab */}
              <TabsContent value="updates" className="space-y-6">
                {/* Updated Times */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Updated Appointment Time
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Updated Start</p>
                      <p>{appointment.updatedStartDate} {appointment.updatedStartTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Updated End</p>
                      <p>{appointment.updatedEndDate} {appointment.updatedEndTime}</p>
                    </div>
                  </div>
                </div>
                
                {/* Cancellation Info */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    Cancellation Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField label="Who Canceled" value={appointment.whoCanceled} />
                    <DataField label="Cancelation Details" value={appointment.cancellationDetails} />
                  </div>
                </div>
              </TabsContent>
              
              {/* Meta Tab */}
              <TabsContent value="meta" className="space-y-6">
                {/* Meta Information */}
                <div>
                  <h4 className="text-md font-medium text-[hsl(var(--primary))] mb-3 border-b border-border pb-2">
                    System Fields
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField label="Reference Number" value={appointment.referenceNumber} />
                    <DataField label="App ID" value={appointment.appId} />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created At</p>
                      <p>{appointment.createdAt && new Date(appointment.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Updated At</p>
                      <p>{appointment.updatedAt && new Date(appointment.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Appointment not found.
            </p>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-border sticky bottom-0 bg-[hsl(var(--surface))] flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="mr-2"
          >
            Close
          </Button>
          {appointment && (
            <Button 
              variant="default" 
              onClick={handleEditAppointment}
              className="gap-2 flex items-center"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
