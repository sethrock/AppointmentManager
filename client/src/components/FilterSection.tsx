import { useState, useEffect } from "react";
import { 
  Card,
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentFilters } from "@/types/appointment";

interface FilterSectionProps {
  onFilterChange: (filters: AppointmentFilters) => void;
  filters: AppointmentFilters;
  isLoading?: boolean;
}

export default function FilterSection({ 
  onFilterChange, 
  filters, 
  isLoading = false
}: FilterSectionProps) {
  const [localFilters, setLocalFilters] = useState<AppointmentFilters>({
    phoneNumber: filters.phoneNumber || ""
  });
  
  useEffect(() => {
    setLocalFilters({
      phoneNumber: filters.phoneNumber || ""
    });
  }, [filters]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({
      ...prev,
      phoneNumber: e.target.value
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      phoneNumber: ""
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-[hsl(var(--surface))]">
        <CardContent className="p-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-[hsl(var(--surface))]">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Phone Number Filter */}
          <div className="flex-grow">
            <label htmlFor="phoneNumberFilter" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <Input
              id="phoneNumberFilter"
              type="text"
              placeholder="Enter phone number to search"
              value={localFilters.phoneNumber}
              onChange={handlePhoneNumberChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-[hsl(var(--surface2))] border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="bg-[hsl(var(--surface2))] border-border hover:bg-[hsl(var(--surface))]"
            >
              Clear
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="bg-[hsl(var(--accent))] hover:bg-opacity-90"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
