
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { flights, Flight } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Search, Calendar, Filter } from "lucide-react";
import FlightTable from "@/components/FlightTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyFlights = () => {
  const { user } = useAuth();
  const airlineCompany = user?.airline || "Unknown Airline"; // In a real app, this would come from the user's profile
  
  // Filter flights that belong to this airline
  const airlineFlights = flights.filter(flight => flight.airline === airlineCompany);
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddFlightOpen, setIsAddFlightOpen] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    status: "scheduled",
  });
  
  // Filter flights based on search and status
  const filteredFlights = airlineFlights.filter(flight => {
    const matchesSearch = searchTerm
      ? flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter === "all" || flight.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Group flights by status
  const activeFlights = filteredFlights.filter(flight => 
    ["scheduled", "boarding", "departed"].includes(flight.status)
  );
  const completedFlights = filteredFlights.filter(flight => 
    flight.status === "arrived"
  );
  const delayedCancelledFlights = filteredFlights.filter(flight => 
    ["delayed", "cancelled"].includes(flight.status)
  );
  
  // Handle input changes for new flight
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFlight(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle status selection
  const handleStatusChange = (value: string) => {
    setNewFlight(prev => ({ ...prev, status: value }));
  };
  
  // Add new flight
  const handleAddFlight = () => {
    // In a real app, this would make an API call
    console.log('New flight to be added by airline:', {
      ...newFlight,
      airline: airlineCompany
    });
    setIsAddFlightOpen(false);
    // Reset form
    setNewFlight({
      flightNumber: "",
      origin: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      status: "scheduled",
    });
  };

  return (
    <PageLayout title="My Flights">
      <div className="space-y-6">
        {/* Search and Add Flight */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
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
            
            <Dialog open={isAddFlightOpen} onOpenChange={setIsAddFlightOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Add Flight</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Add New Flight</DialogTitle>
                  <DialogDescription>Create a new flight for {airlineCompany}</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flightNumber">Flight Number</Label>
                      <Input 
                        id="flightNumber" 
                        name="flightNumber"
                        value={newFlight.flightNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newFlight.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="boarding">Boarding</SelectItem>
                          <SelectItem value="departed">Departed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin</Label>
                      <Input 
                        id="origin" 
                        name="origin"
                        value={newFlight.origin}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input 
                        id="destination" 
                        name="destination"
                        value={newFlight.destination}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="departureTime">Departure Time</Label>
                      <Input 
                        id="departureTime" 
                        name="departureTime"
                        type="datetime-local"
                        value={newFlight.departureTime}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="arrivalTime">Arrival Time</Label>
                      <Input 
                        id="arrivalTime" 
                        name="arrivalTime"
                        type="datetime-local"
                        value={newFlight.arrivalTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFlightOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddFlight}>Add Flight</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Flights Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Flights</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="delayed">Delayed & Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Flights</CardTitle>
              </CardHeader>
              <CardContent>
                <FlightTable 
                  flights={activeFlights}
                  emptyMessage="No active flights found"
                  actions={[
                    {
                      label: "Edit",
                      onClick: (flight) => console.log('Edit flight:', flight),
                      variant: "outline"
                    },
                    {
                      label: "Delay",
                      onClick: (flight) => console.log('Delay flight:', flight),
                      variant: "outline"
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Flights</CardTitle>
              </CardHeader>
              <CardContent>
                <FlightTable 
                  flights={completedFlights}
                  emptyMessage="No completed flights found"
                  actions={[
                    {
                      label: "View",
                      onClick: (flight) => console.log('View flight details:', flight),
                      variant: "outline"
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delayed">
            <Card>
              <CardHeader>
                <CardTitle>Delayed & Cancelled Flights</CardTitle>
              </CardHeader>
              <CardContent>
                <FlightTable 
                  flights={delayedCancelledFlights}
                  emptyMessage="No delayed or cancelled flights found"
                  actions={[
                    {
                      label: "Update",
                      onClick: (flight) => console.log('Update flight status:', flight),
                      variant: "outline"
                    },
                    {
                      label: "Notify",
                      onClick: (flight) => console.log('Notify passengers:', flight),
                      variant: "secondary"
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MyFlights;
