import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, DollarSign, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { 
    data: appointment, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: [`/api/appointments/${id}`],
  });

  const handleGoBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-[hsl(var(--error))] mb-2">
              Error loading appointment details
            </p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <Button onClick={handleGoBack}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="font-semibold mb-2">Appointment Not Found</p>
            <p className="text-muted-foreground mb-4">
              The appointment you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleGoBack}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Header Card */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Appointment #{appointment.id}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-[hsl(var(--surface2))]">
                  {appointment.setBy}
                </Badge>
                <Badge variant="outline" className="bg-[hsl(var(--surface2))]">
                  {appointment.provider}
                </Badge>
                <Badge variant="outline" className="bg-[hsl(var(--surface2))]">
                  {appointment.marketingChannel}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Due To Provider</div>
              <div className="text-xl font-semibold text-[hsl(var(--secondary))]">
                {formatCurrency(appointment.dueToProvider || 0)}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Client Information */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center pb-2">
            <User className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Client Name</div>
                <div className="font-medium">{appointment.clientName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone Number</div>
                <div className="font-mono">{appointment.clientPhone}</div>
              </div>
              {appointment.clientUsesEmail && (
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-mono">{appointment.clientEmail}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Location Information */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center pb-2">
            <MapPin className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Call Type</div>
                <div className="font-medium">{appointment.callType}</div>
              </div>
              {appointment.streetAddress && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div>{appointment.streetAddress}</div>
                    {appointment.addressLine2 && <div>{appointment.addressLine2}</div>}
                    <div>
                      {appointment.city}, {appointment.state} {appointment.zipCode}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Date and Time */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center pb-2">
            <Calendar className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg">Date & Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Start</div>
                <div className="font-medium">
                  {appointment.startDate} {appointment.startTime}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">End</div>
                <div className="font-medium">
                  {appointment.endDate} {appointment.endTime}
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <div className="font-medium">{appointment.duration} hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Financial Details */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center pb-2">
            <DollarSign className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg">Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Gross Revenue</div>
                <div className="font-mono text-[hsl(var(--secondary))] font-medium">
                  {formatCurrency(appointment.grossRevenue || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Deposit</div>
                <div className="font-mono">
                  {formatCurrency(appointment.depositAmount || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due To Provider</div>
                <div className="font-mono text-[hsl(var(--secondary))] font-medium">
                  {formatCurrency(appointment.dueToProvider || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Received By</div>
                <div>{appointment.depositReceivedBy}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Payment Process</div>
                <div>{appointment.paymentProcess}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Client Notes */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center pb-2">
            <FileText className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
            <CardTitle className="text-lg">Client Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.clientNotes ? (
              <div className="whitespace-pre-line text-sm">
                {appointment.clientNotes}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No notes available for this client.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
