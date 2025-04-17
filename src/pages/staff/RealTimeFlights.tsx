import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FlightTable from "@/components/FlightTable";
import { flights } from "@/lib/db";
import { Flight } from "@/lib/types";
import { Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RealTimeFlights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
  const [sortField, setSortField] = useState<keyof Flight>("departureTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    let result = [...flights];
    
    if (statusFilter !== "all") {
      result = result.filter(flight => flight.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        flight =>
          flight.flightNumber.toLowerCase().includes(term) ||
          flight.airline.toLowerCase().includes(term) ||
          flight.origin.toLowerCase().includes(term) ||
          flight.destination.toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      let valueA: any = a[sortField as keyof Flight];
      let valueB: any = b[sortField as keyof Flight];
      
      if (typeof valueA === "string" && (sortField === "departureTime" || sortField === "arrivalTime")) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredFlights(result);
  }, [searchTerm, statusFilter, sortField, sortDirection, lastUpdated]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSort = (field: keyof Flight) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  const updateFlightStatus = (flight: Flight, newStatus: Flight["status"]) => {
    console.log(`Updating flight ${flight.flightNumber} status to ${newStatus}`);
    refreshData();
  };

  return (
    <PageLayout title="Real-Time Flight Tracking">
      <div className="space-y-6">
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm font-normal">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshData}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  {filteredFlights.length} flights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <Card className="w-full md:w-64">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Flight, airline, location..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="boarding">Boarding</SelectItem>
                    <SelectItem value="departed">Departed</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select 
                  value={`${sortField}-${sortDirection}`} 
                  onValueChange={(val) => {
                    const [field, direction] = val.split('-');
                    setSortField(field as keyof Flight);
                    setSortDirection(direction as "asc" | "desc");
                  }}
                >
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort flights" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departureTime-asc">Departure Time (Earliest)</SelectItem>
                    <SelectItem value="departureTime-desc">Departure Time (Latest)</SelectItem>
                    <SelectItem value="arrivalTime-asc">Arrival Time (Earliest)</SelectItem>
                    <SelectItem value="arrivalTime-desc">Arrival Time (Latest)</SelectItem>
                    <SelectItem value="flightNumber-asc">Flight Number (A-Z)</SelectItem>
                    <SelectItem value="flightNumber-desc">Flight Number (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 w-full">
            <FlightTable 
              flights={filteredFlights}
              searchable={false}
              filterable={false}
              actions={[
                {
                  label: "Update",
                  onClick: (flight) => {
                    const nextStatus: Record<Flight["status"], Flight["status"]> = {
                      scheduled: "boarding",
                      boarding: "departed",
                      departed: "arrived",
                      arrived: "arrived",
                      delayed: "scheduled",
                      cancelled: "scheduled"
                    };
                    updateFlightStatus(flight, nextStatus[flight.status]);
                  },
                  variant: "outline"
                }
              ]}
              emptyMessage="No flights match your search criteria"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RealTimeFlights;
