import { useState, useEffect } from "react";
import { 
  Card,
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentFilters } from "@/types/appointment";

interface FilterSectionProps {
  onFilterChange: (filters: AppointmentFilters) => void;
  filters: AppointmentFilters;
  filterOptions?: {
    setBy: string[];
    provider: string[];
    marketingChannel: string[];
  };
  isLoading?: boolean;
}

export default function FilterSection({ 
  onFilterChange, 
  filters, 
  filterOptions,
  isLoading = false
}: FilterSectionProps) {
  const [localFilters, setLocalFilters] = useState<AppointmentFilters>({
    setBy: filters.setBy || "all",
    provider: filters.provider || "all",
    marketingChannel: filters.marketingChannel || "all"
  });
  
  useEffect(() => {
    setLocalFilters({
      setBy: filters.setBy || "all",
      provider: filters.provider || "all",
      marketingChannel: filters.marketingChannel || "all"
    });
  }, [filters]);

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      setBy: "all",
      provider: "all",
      marketingChannel: "all"
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-[hsl(var(--surface))]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Set By Filter */}
          <div>
            <label htmlFor="setByFilter" className="block text-sm font-medium mb-1">
              Set By
            </label>
            <Select
              value={localFilters.setBy}
              onValueChange={(value) => handleFilterChange("setBy", value)}
            >
              <SelectTrigger 
                id="setByFilter"
                className="w-full bg-[hsl(var(--surface2))] border-border"
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--surface2))] border-border">
                <SelectItem value="all">All</SelectItem>
                {filterOptions?.setBy?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Provider Filter */}
          <div>
            <label htmlFor="providerFilter" className="block text-sm font-medium mb-1">
              Provider
            </label>
            <Select
              value={localFilters.provider}
              onValueChange={(value) => handleFilterChange("provider", value)}
            >
              <SelectTrigger 
                id="providerFilter"
                className="w-full bg-[hsl(var(--surface2))] border-border"
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--surface2))] border-border">
                <SelectItem value="all">All</SelectItem>
                {filterOptions?.provider?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Marketing Channel Filter */}
          <div>
            <label htmlFor="marketingFilter" className="block text-sm font-medium mb-1">
              Marketing Channel
            </label>
            <Select
              value={localFilters.marketingChannel}
              onValueChange={(value) => handleFilterChange("marketingChannel", value)}
            >
              <SelectTrigger 
                id="marketingFilter"
                className="w-full bg-[hsl(var(--surface2))] border-border"
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--surface2))] border-border">
                <SelectItem value="all">All</SelectItem>
                {filterOptions?.marketingChannel?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
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
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
