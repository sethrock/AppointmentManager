
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentAction, CancellationData } from "@/lib/appointmentActions";
import { useToast } from "@/hooks/use-toast";

interface CancelDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CancelDialog({
  appointmentId,
  open,
  onOpenChange,
  onSuccess,
}: CancelDialogProps) {
  const { toast } = useToast();
  const { cancelAppointment } = useAppointmentAction();
  
  const [whoCanceled, setWhoCanceled] = useState<"Client" | "Provider">("Client");
  const [cancellationDetails, setCancellationDetails] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: CancellationData = {
      appointmentId,
      whoCanceled,
      cancellationDetails,
    };
    
    try {
      await cancelAppointment.mutateAsync(data);
      
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Failed to Cancel",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide details about this cancellation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Who Canceled?</Label>
            <RadioGroup 
              value={whoCanceled} 
              onValueChange={(value) => setWhoCanceled(value as "Client" | "Provider")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Client" id="client" />
                <Label htmlFor="client">Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Provider" id="provider" />
                <Label htmlFor="provider">Provider</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cancellationDetails">Cancellation Details</Label>
            <Textarea
              id="cancellationDetails"
              placeholder="Please provide any additional details about the cancellation"
              value={cancellationDetails}
              onChange={(e) => setCancellationDetails(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
