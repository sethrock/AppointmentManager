
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppointmentAction } from "@/lib/appointmentActions";
import { useToast } from "@/hooks/use-toast";

interface CompleteDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CompleteDialog({
  appointmentId,
  open,
  onOpenChange,
  onSuccess,
}: CompleteDialogProps) {
  const { toast } = useToast();
  const { completeAppointment } = useAppointmentAction();
  
  const handleComplete = async () => {
    try {
      await completeAppointment.mutateAsync(appointmentId);
      
      toast({
        title: "Appointment Completed",
        description: "The appointment has been marked as completed.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Failed to Complete",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this appointment as completed?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            onClick={handleComplete}
            disabled={completeAppointment.isPending}
          >
            {completeAppointment.isPending ? "Processing..." : "Mark as Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
