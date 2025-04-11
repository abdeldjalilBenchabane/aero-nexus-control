
import { useState } from "react";
import { PlusCircle, Pencil, Trash2, Search, Calendar, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import FlightTable from "@/components/FlightTable";
import { flights, Flight } from "@/lib/db";

const ManageFlights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
  const [isAddFlightOpen, setIsAddFlightOpen] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    airline: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    status: "scheduled"
  });

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredFlights(flights);
    } else {
      const filtered = flights.filter(flight => 
        flight.flightNumber.toLowerCase().includes(term) ||
        flight.airline.toLowerCase().includes(term) ||
        flight.origin.toLowerCase().includes(term) ||
        flight.destination.toLowerCase().includes(term) ||
        flight.status.toLowerCase().includes(term)
      );
      setFilteredFlights(filtered);
    }
  };

  // Handle new flight input changes
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
    // In a real application, this would make an API call
    console.log('New flight submitted:', newFlight);
    setIsAddFlightOpen(false);
    setNewFlight({
      flightNumber: "",
      airline: "",
      origin: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      status: "scheduled"
    });
  };

  return (
    <PageLayout title="Manage Flights">
      <div className="space-y-6">
        {/* Search and Add Flight */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flights..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 max-w-sm"
            />
          </div>
          
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
                <DialogDescription>Create a new flight in the system</DialogDescription>
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
                    <Label htmlFor="airline">Airline</Label>
                    <Input 
                      id="airline" 
                      name="airline"
                      value={newFlight.airline}
                      onChange={handleInputChange}
                    />
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
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFlightOpen(false)}>Cancel</Button>
                <Button onClick={handleAddFlight}>Add Flight</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Flights Table */}
        <FlightTable 
          flights={filteredFlights} 
          showActions={true}
          onEdit={(flight) => console.log('Edit flight:', flight)}
          onDelete={(flight) => console.log('Delete flight:', flight)}
        />
      </div>
    </PageLayout>
  );
};

export default ManageFlights;
