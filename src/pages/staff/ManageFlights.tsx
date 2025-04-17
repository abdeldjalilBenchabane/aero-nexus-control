import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, Search, MapPin, LayoutGrid } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightTable from "@/components/FlightTable";
import { flights, gates, runways } from "@/lib/db";
import type { Flight, Gate, Runway } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

type FlightStatus = Flight["status"];

const ManageFlights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [isAddFlightOpen, setIsAddFlightOpen] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    flight_number: "",
    airline: "",
    origin: "",
    destination: "",
    departureTime: "",
    departure_time: "",
    arrivalTime: "",
    arrival_time: "",
    status: "scheduled" as FlightStatus,
    price: 0
  });
  const [isAssignGateOpen, setIsAssignGateOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedRunway, setSelectedRunway] = useState("");
  const [availableGates, setAvailableGates] = useState<Gate[]>([]);
  const [availableRunways, setAvailableRunways] = useState<Runway[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/flights")
      .then(response => response.json())
      .then(data => {
        const typedFlights = data.map((flight: any) => ({
          ...flight,
          status: flight.status as FlightStatus
        }));
        setFlights(typedFlights);
        setFilteredFlights(typedFlights);
      })
      .catch(error => {
        console.error("Error fetching flights:", error);
        import("@/lib/db").then(({ flights }) => {
          setFlights(flights);
          setFilteredFlights(flights);
        });
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredFlights(flights);
    } else {
      const filtered = flights.filter(flight => 
        (flight.flightNumber?.toLowerCase().includes(term) || 
         flight.flight_number?.toLowerCase().includes(term) || false) ||
        (flight.airline?.toLowerCase().includes(term) || false) ||
        (flight.origin?.toLowerCase().includes(term) || false) ||
        flight.destination.toLowerCase().includes(term) ||
        flight.status.toLowerCase().includes(term)
      );
      setFilteredFlights(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFlight(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setNewFlight(prev => ({ 
      ...prev, 
      status: value as FlightStatus 
    }));
  };

  const handleAddFlight = () => {
    const flightData: Flight = {
      id: `flight${Date.now()}`,
      flight_number: newFlight.flightNumber,
      flightNumber: newFlight.flightNumber,
      airline: newFlight.airline,
      origin: newFlight.origin,
      destination: newFlight.destination,
      departure_time: newFlight.departureTime,
      departureTime: newFlight.departureTime,
      arrival_time: newFlight.arrivalTime,
      arrivalTime: newFlight.arrivalTime,
      status: newFlight.status,
      price: newFlight.price || 0
    };

    fetch("http://localhost:3001/api/flights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flightData),
    })
      .then(response => response.json())
      .then(data => {
        const typedFlight = {
          ...data,
          status: data.status as FlightStatus
        };
        const updatedFlights = [...flights, typedFlight];
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAddFlightOpen(false);
        
        setNewFlight({
          flightNumber: "",
          flight_number: "",
          airline: "",
          origin: "",
          destination: "",
          departureTime: "",
          departure_time: "",
          arrivalTime: "",
          arrival_time: "",
          status: "scheduled" as FlightStatus,
          price: 0
        });
      })
      .catch(error => {
        console.error("Error adding flight:", error);
        const updatedFlights = [...flights, flightData];
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAddFlightOpen(false);
      });
  };

  const handleEditFlight = (flight: Flight) => {
    setIsEditMode(true);
    setNewFlight({
      flightNumber: flight.flightNumber || flight.flight_number,
      flight_number: flight.flight_number || flight.flightNumber || "",
      airline: flight.airline || "",
      origin: flight.origin || "",
      destination: flight.destination,
      departureTime: flight.departureTime || flight.departure_time,
      departure_time: flight.departure_time || flight.departureTime || "",
      arrivalTime: flight.arrivalTime || flight.arrival_time,
      arrival_time: flight.arrival_time || flight.arrivalTime || "",
      status: flight.status,
      price: flight.price
    });
    setSelectedFlight(flight);
    setIsAddFlightOpen(true);
  };

  const handleUpdateFlight = () => {
    if (!selectedFlight) return;

    const updatedFlight: Flight = {
      ...selectedFlight,
      flight_number: newFlight.flightNumber,
      flightNumber: newFlight.flightNumber,
      airline: newFlight.airline,
      origin: newFlight.origin,
      destination: newFlight.destination,
      departure_time: newFlight.departureTime,
      departureTime: newFlight.departureTime,
      arrival_time: newFlight.arrivalTime,
      arrivalTime: newFlight.arrivalTime,
      status: newFlight.status,
      price: newFlight.price
    };

    fetch(`http://localhost:3001/api/flights/${selectedFlight.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFlight),
    })
      .then(response => response.json())
      .then(data => {
        const typedFlight = {
          ...data,
          status: data.status as FlightStatus
        };
        const updatedFlights = flights.map(f => 
          f.id === selectedFlight.id ? typedFlight : f
        );
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAddFlightOpen(false);
        setIsEditMode(false);
        setSelectedFlight(null);
      })
      .catch(error => {
        console.error("Error updating flight:", error);
        const updatedFlights = flights.map(f => 
          f.id === selectedFlight.id ? updatedFlight : f
        );
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAddFlightOpen(false);
        setIsEditMode(false);
        setSelectedFlight(null);
      });
  };

  const handleDeleteFlight = (flight: Flight) => {
    fetch(`http://localhost:3001/api/flights/${flight.id}`, {
      method: "DELETE",
    })
      .then(() => {
        const updatedFlights = flights.filter(f => f.id !== flight.id);
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
      })
      .catch(error => {
        console.error("Error deleting flight:", error);
        const updatedFlights = flights.filter(f => f.id !== flight.id);
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
      });
  };

  const handleOpenAssignDialog = (flight: Flight) => {
    setSelectedFlight(flight);
    
    import("@/lib/db").then(({ gates, runways }) => {
      setAvailableGates(gates.filter(g => g.isAvailable !== false));
      setAvailableRunways(runways.filter(r => r.isAvailable !== false));
      setIsAssignGateOpen(true);
    });
  };

  const handleAssignGateRunway = () => {
    if (!selectedFlight) return;

    const updatedFlight = {
      ...selectedFlight,
      gate: selectedGate || selectedFlight.gate,
      gate_id: selectedGate || selectedFlight.gate_id,
      runway: selectedRunway || selectedFlight.runway,
      runway_id: selectedRunway || selectedFlight.runway_id
    };

    const promises = [];
    
    if (selectedGate) {
      promises.push(
        fetch(`http://localhost:3001/api/flights/${selectedFlight.id}/gate`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gateId: selectedGate }),
        })
      );
    }
    
    if (selectedRunway) {
      promises.push(
        fetch(`http://localhost:3001/api/flights/${selectedFlight.id}/runway`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ runwayId: selectedRunway }),
        })
      );
    }

    Promise.all(promises)
      .then(() => {
        const updatedFlights = flights.map(f => 
          f.id === selectedFlight.id ? updatedFlight : f
        );
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAssignGateOpen(false);
        setSelectedFlight(null);
        setSelectedGate("");
        setSelectedRunway("");
      })
      .catch(error => {
        console.error("Error assigning gate/runway:", error);
        const updatedFlights = flights.map(f => 
          f.id === selectedFlight.id ? updatedFlight : f
        );
        setFlights(updatedFlights);
        setFilteredFlights(updatedFlights);
        setIsAssignGateOpen(false);
        setSelectedFlight(null);
      });
  };

  return (
    <PageLayout title="Manage Flights">
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <LayoutGrid size={16} />
            <span>Manage Flights</span>
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Assign Gates & Runways</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
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
            
            <Dialog open={isAddFlightOpen} onOpenChange={(open) => {
              setIsAddFlightOpen(open);
              if (!open) {
                setIsEditMode(false);
                setSelectedFlight(null);
                setNewFlight({
                  flightNumber: "",
                  flight_number: "",
                  airline: "",
                  origin: "",
                  destination: "",
                  departureTime: "",
                  departure_time: "",
                  arrivalTime: "",
                  arrival_time: "",
                  status: "scheduled" as FlightStatus,
                  price: 0
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Add Flight</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Flight" : "Add New Flight"}</DialogTitle>
                  <DialogDescription>
                    {isEditMode 
                      ? "Update flight details in the system" 
                      : "Create a new flight in the system"}
                  </DialogDescription>
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

                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="landed">Landed</SelectItem>
                          <SelectItem value="in_air">In Air</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input 
                        id="price" 
                        name="price"
                        type="number"
                        value={newFlight.price.toString()}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFlightOpen(false)}>Cancel</Button>
                  <Button onClick={isEditMode ? handleUpdateFlight : handleAddFlight}>
                    {isEditMode ? "Update Flight" : "Add Flight"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <FlightTable 
            flights={filteredFlights} 
            showActions={true}
            actions={[
              {
                label: "Edit",
                onClick: handleEditFlight,
                variant: "outline"
              },
              {
                label: "Delete",
                onClick: handleDeleteFlight,
                variant: "destructive"
              },
              {
                label: "Assign Gate/Runway",
                onClick: handleOpenAssignDialog,
                variant: "secondary"
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flightSelect">Select Flight</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a flight" />
                    </SelectTrigger>
                    <SelectContent>
                      {flights.map(flight => (
                        <SelectItem key={flight.id} value={flight.id}>
                          {flight.flightNumber || flight.flight_number} - {flight.origin} to {flight.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gateSelect">Assign Gate</Label>
                    <Select>
                      <SelectTrigger id="gateSelect">
                        <SelectValue placeholder="Select gate" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGates.map(gate => (
                          <SelectItem key={gate.id} value={gate.id}>
                            {gate.name || gate.gate_number} {gate.terminal ? `(Terminal ${gate.terminal})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runwaySelect">Assign Runway</Label>
                    <Select>
                      <SelectTrigger id="runwaySelect">
                        <SelectValue placeholder="Select runway" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRunways.map(runway => (
                          <SelectItem key={runway.id} value={runway.id}>
                            {runway.name || runway.runway_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full">Assign Resources</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Assignments</h3>
            <FlightTable 
              flights={flights.filter(f => f.gate || f.runway || f.gate_id || f.runway_id)}
              searchable={true}
              filterable={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAssignGateOpen} onOpenChange={setIsAssignGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Gate & Runway</DialogTitle>
            <DialogDescription>
              {selectedFlight && (
                <span>Flight {selectedFlight.flightNumber || selectedFlight.flight_number} ({selectedFlight.origin} → {selectedFlight.destination})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gateSelect">Gate</Label>
              <Select value={selectedGate} onValueChange={setSelectedGate}>
                <SelectTrigger id="gateSelect">
                  <SelectValue placeholder={(selectedFlight?.gate || selectedFlight?.gate_id) || "Select gate"} />
                </SelectTrigger>
                <SelectContent>
                  {availableGates.map(gate => (
                    <SelectItem key={gate.id} value={gate.id}>
                      {gate.name || gate.gate_number} {gate.terminal ? `(Terminal ${gate.terminal})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="runwaySelect">Runway</Label>
              <Select value={selectedRunway} onValueChange={setSelectedRunway}>
                <SelectTrigger id="runwaySelect">
                  <SelectValue placeholder={(selectedFlight?.runway || selectedFlight?.runway_id) || "Select runway"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRunways.map(runway => (
                    <SelectItem key={runway.id} value={runway.id}>
                      {runway.name || runway.runway_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignGateOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignGateRunway}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ManageFlights;
