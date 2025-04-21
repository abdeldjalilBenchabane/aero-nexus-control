
import { useState, useEffect } from "react";
import { flightApi, airlineApi } from "@/lib/api";
import { Flight, FlightStatus } from "@/lib/types";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const statusProgressionMap: Record<FlightStatus, FlightStatus> = {
  scheduled: "boarding",
  boarding: "departed",
  departed: "in_air",
  in_air: "landed",
  landed: "arrived",
  arrived: "completed",
  delayed: "boarding",
  cancelled: "cancelled",
  completed: "completed"
};

const statusLabels: Record<FlightStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  departed: "Departed",
  in_air: "In Air",
  landed: "Landed",
  arrived: "Arrived",
  delayed: "Delayed",
  cancelled: "Cancelled",
  completed: "Completed"
};

const RealTimeFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingFlights, setUpdatingFlights] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchFlights();
    
    // Set up polling to refresh flight data every 60 seconds
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await flightApi.getAll();
      
      // Sort flights by departure time
      const sortedFlights = [...data].sort((a, b) => {
        const dateA = new Date(a.departure_time || a.departureTime || "");
        const dateB = new Date(b.departure_time || b.departureTime || "");
        return dateA.getTime() - dateB.getTime();
      });
      
      setFlights(sortedFlights);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFlightStatus = async (flight: Flight, newStatus?: FlightStatus) => {
    // Set this specific flight as updating
    setUpdatingFlights(prev => ({ ...prev, [flight.id]: true }));
    
    try {
      const currentStatus = flight.status;
      // Use the provided status or default to the next status
      const nextStatus = newStatus || statusProgressionMap[currentStatus];
      
      // Skip if the flight is already at a terminal status
      if (currentStatus === "completed" || currentStatus === "cancelled") {
        toast({
          title: "Status Unchanged",
          description: `Flight ${flight.flight_number || flight.flightNumber} is already ${currentStatus}.`
        });
        return;
      }
      
      console.log(`Updating flight ${flight.id} status to:`, nextStatus);
      
      // Update the flight status using dedicated endpoint
      await flightApi.updateStatus(flight.id, nextStatus);
      
      toast({
        title: "Status Updated",
        description: `Flight ${flight.flight_number || flight.flightNumber} status changed from ${currentStatus} to ${nextStatus}`
      });
      
      // Refresh flight list
      fetchFlights();
      
    } catch (error) {
      console.error(`Error updating flight ${flight.id} status:`, error);
      toast({
        title: "Update Failed",
        description: "Could not update flight status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingFlights(prev => ({ ...prev, [flight.id]: false }));
    }
  };

  const getFilteredFlights = () => {
    if (statusFilter === "all") {
      return flights;
    }
    return flights.filter(flight => flight.status === statusFilter);
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getGateDisplay = (flight: Flight) => {
    // Check all possible properties where gate information might be stored
    if (flight.gate_number) return flight.gate_number;
    if (flight.gate_id) return flight.gate_id;
    if (typeof flight.gate === 'string') return flight.gate;
    // Check if gate is an object with a name property
    if (flight.gate && typeof flight.gate === 'object' && 'name' in (flight.gate as any)) {
      return (flight.gate as any).name;
    }
    return "—";
  };

  return (
    <PageLayout title="Real-Time Flights">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight Operations Dashboard</CardTitle>
            <CardDescription>
              Monitor and update flight statuses in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:w-64">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
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
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={fetchFlights} variant="outline" className="sm:ml-auto">
                Refresh Data
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight</TableHead>
                    <TableHead>Airline</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Loading flight data...
                      </TableCell>
                    </TableRow>
                  ) : getFilteredFlights().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No flights found with the selected status
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredFlights().map((flight) => (
                      <TableRow key={flight.id}>
                        <TableCell className="font-medium">
                          {flight.flight_number || flight.flightNumber}
                        </TableCell>
                        <TableCell>
                          {flight.airline_name || flight.airlineName}
                        </TableCell>
                        <TableCell>{flight.origin}</TableCell>
                        <TableCell>{flight.destination}</TableCell>
                        <TableCell>
                          {formatDateTime(flight.departure_time || flight.departureTime || "")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              flight.status === "scheduled" ? "bg-blue-500" :
                              flight.status === "boarding" ? "bg-yellow-500" :
                              flight.status === "departed" ? "bg-purple-500" :
                              flight.status === "in_air" ? "bg-indigo-500" :
                              flight.status === "landed" ? "bg-green-700" :
                              flight.status === "arrived" ? "bg-green-500" :
                              flight.status === "completed" ? "bg-green-900" :
                              flight.status === "delayed" ? "bg-orange-500" :
                              flight.status === "cancelled" ? "bg-red-500" :
                              "bg-gray-500"
                            }
                          >
                            {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{getGateDisplay(flight)}</TableCell>
                        <TableCell>
                          {(flight.status !== "cancelled" && flight.status !== "completed") ? (
                            <div className="flex flex-col gap-2">
                              <Select 
                                onValueChange={(value) => updateFlightStatus(flight, value as FlightStatus)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                onClick={() => updateFlightStatus(flight)}
                                variant="outline"
                                size="sm"
                                disabled={updatingFlights[flight.id]}
                              >
                                {updatingFlights[flight.id] ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>Next Status ({statusLabels[statusProgressionMap[flight.status]]})</>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No actions available
                            </span>
                          )}
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
    </PageLayout>
  );
};

export default RealTimeFlights;
