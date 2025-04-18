
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flightApi } from "@/lib/api";
import type { Flight, FlightStatus } from "@/lib/types";
import { Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const RealTimeFlights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [sortField, setSortField] = useState<keyof Flight>("departure_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlights();
    
    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchFlights, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...allFlights];
    
    if (statusFilter !== "all") {
      result = result.filter(flight => flight.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        flight =>
          (flight.flight_number?.toLowerCase().includes(term) || false) ||
          (flight.airline_name?.toLowerCase().includes(term) || false) ||
          (flight.origin?.toLowerCase().includes(term) || false) ||
          flight.destination.toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      let valueA: any = a[sortField as keyof Flight];
      let valueB: any = b[sortField as keyof Flight];
      
      if (typeof valueA === "string" && (sortField === "departure_time" || sortField === "arrival_time")) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredFlights(result);
  }, [searchTerm, statusFilter, sortField, sortDirection, allFlights, lastUpdated]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await flightApi.getAll();
      setAllFlights(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast({
        title: "Error",
        description: "Failed to fetch flight data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    fetchFlights();
  };

  const updateFlightStatus = async (flight: Flight, newStatus: FlightStatus) => {
    try {
      await flightApi.update(flight.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Flight ${flight.flight_number} status changed to ${newStatus}`
      });
      refreshData();
    } catch (error) {
      console.error(`Error updating flight ${flight.flight_number} status:`, error);
      toast({
        title: "Update Failed",
        description: "Could not update flight status",
        variant: "destructive"
      });
    }
  };

  const getNextStatus = (currentStatus: FlightStatus): FlightStatus => {
    const statusFlow: Record<FlightStatus, FlightStatus> = {
      "scheduled": "boarding",
      "boarding": "departed",
      "departed": "in_air",
      "in_air": "landed",
      "landed": "arrived",
      "arrived": "arrived",
      "delayed": "scheduled",
      "cancelled": "scheduled"
    };
    
    return statusFlow[currentStatus] || "scheduled";
  };

  const getStatusBadgeVariant = (status: FlightStatus) => {
    switch (status) {
      case "scheduled": return "outline";
      case "boarding": return "secondary";
      case "departed": return "default";
      case "in_air": return "default";
      case "landed": return "default";
      case "arrived": return "success";
      case "delayed": return "destructive"; // Changed from "warning" to "destructive"
      case "cancelled": return "destructive";
      default: return "outline";
    }
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
                    <SelectItem value="in_air">In Air</SelectItem>
                    <SelectItem value="landed">Landed</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select 
                  value={`${String(sortField)}-${sortDirection}`} 
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
                    <SelectItem value="departure_time-asc">Departure Time (Earliest)</SelectItem>
                    <SelectItem value="departure_time-desc">Departure Time (Latest)</SelectItem>
                    <SelectItem value="arrival_time-asc">Arrival Time (Earliest)</SelectItem>
                    <SelectItem value="arrival_time-desc">Arrival Time (Latest)</SelectItem>
                    <SelectItem value="flight_number-asc">Flight Number (A-Z)</SelectItem>
                    <SelectItem value="flight_number-desc">Flight Number (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 w-full">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center space-x-1">
                            <span>Flight</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleSort("flight_number")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>Airline</TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                            <span>Origin</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleSort("origin")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                            <span>Destination</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleSort("destination")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                            <span>Departure</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleSort("departure_time")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>Gate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Loading flight data...
                          </TableCell>
                        </TableRow>
                      ) : filteredFlights.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No flights match your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFlights.map((flight) => (
                          <TableRow key={flight.id}>
                            <TableCell className="font-medium">{flight.flight_number}</TableCell>
                            <TableCell>{flight.airline_name}</TableCell>
                            <TableCell>{flight.origin}</TableCell>
                            <TableCell>{flight.destination}</TableCell>
                            <TableCell>
                              {new Date(flight.departure_time).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>{flight.gate_number || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(flight.status)} className="capitalize">
                                {flight.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateFlightStatus(flight, getNextStatus(flight.status))}
                                disabled={flight.status === "arrived" || flight.status === "cancelled"}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RealTimeFlights;
