
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flight, Gate, Runway } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const AssignGateRunway = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedFlight, setSelectedFlight] = useState("");
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedRunway, setSelectedRunway] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [runways, setRunways] = useState<Runway[]>([]);
  const [availableGates, setAvailableGates] = useState<Gate[]>([]);
  const [availableRunways, setAvailableRunways] = useState<Runway[]>([]);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch flights, gates, and runways on component mount
  useEffect(() => {
    // In a real app, this would fetch from the API
    fetch("http://localhost:3001/api/flights")
      .then(response => response.json())
      .then(data => {
        setFlights(data);
      })
      .catch(error => {
        console.error("Error fetching flights:", error);
        // Fallback to mock data
        import("@/lib/db").then(({ flights }) => {
          setFlights(flights);
        });
      });

    fetch("http://localhost:3001/api/gates")
      .then(response => response.json())
      .then(data => {
        setGates(data);
      })
      .catch(error => {
        console.error("Error fetching gates:", error);
        // Fallback to mock data
        import("@/lib/db").then(({ gates }) => {
          setGates(gates);
        });
      });

    fetch("http://localhost:3001/api/runways")
      .then(response => response.json())
      .then(data => {
        setRunways(data);
      })
      .catch(error => {
        console.error("Error fetching runways:", error);
        // Fallback to mock data
        import("@/lib/db").then(({ runways }) => {
          setRunways(runways);
        });
      });
  }, []);

  // Filter flights for the selected date
  const availableFlights = flights.filter(flight => {
    if (!selectedDate) return false;
    const flightDate = new Date(flight.departureTime);
    return (
      flightDate.getDate() === selectedDate.getDate() &&
      flightDate.getMonth() === selectedDate.getMonth() &&
      flightDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Get already assigned gates and runways for the selected date
  const assignedGates = availableFlights
    .filter(flight => flight.gate)
    .map(flight => flight.gate);

  const assignedRunways = availableFlights
    .filter(flight => flight.runway)
    .map(flight => flight.runway);

  // Update available gates and runways when date or flight changes
  useEffect(() => {
    // In a real app, this would make an API call with the date
    setAvailableGates(gates.filter(gate => !assignedGates.includes(gate.name)));
    setAvailableRunways(runways.filter(runway => !assignedRunways.includes(runway.name)));
  }, [selectedDate, selectedFlight, gates, runways, assignedGates, assignedRunways]);

  const handleAssign = () => {
    if (selectedFlight && (selectedGate || selectedRunway)) {
      const promises = [];
      
      if (selectedGate) {
        promises.push(
          fetch(`http://localhost:3001/api/flights/${selectedFlight}/gate`, {
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
          fetch(`http://localhost:3001/api/flights/${selectedFlight}/runway`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ runwayId: selectedRunway }),
          })
        );
      }

      // Execute all promises
      Promise.all(promises)
        .then(() => {
          toast({
            title: "Resources assigned",
            description: "Gate and runway assigned successfully",
          });
          
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          
          // Reset selections
          setSelectedGate("");
          setSelectedRunway("");
        })
        .catch(error => {
          console.error("Error assigning resources:", error);
          toast({
            title: "Assignment failed",
            description: "There was an error assigning resources",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <PageLayout title="Assign Gates & Runways">
      <div className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Gate and runway have been assigned successfully.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view available flights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Gate and Runway</CardTitle>
            <CardDescription>Select a flight and assign available gate and runway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flight">Flight</Label>
                <Select value={selectedFlight} onValueChange={setSelectedFlight}>
                  <SelectTrigger id="flight">
                    <SelectValue placeholder="Select a flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFlights.length === 0 ? (
                      <SelectItem value="none" disabled>No flights for selected date</SelectItem>
                    ) : (
                      availableFlights.map((flight) => (
                        <SelectItem key={flight.id} value={flight.id}>
                          {flight.flightNumber} - {flight.airline} ({flight.origin} → {flight.destination})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate">Gate</Label>
                <Select value={selectedGate} onValueChange={setSelectedGate}>
                  <SelectTrigger id="gate">
                    <SelectValue placeholder="Select a gate" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGates.length === 0 ? (
                      <SelectItem value="none" disabled>No gates available</SelectItem>
                    ) : (
                      availableGates.map((gate) => (
                        <SelectItem key={gate.id} value={gate.id}>
                          {gate.name} - Terminal {gate.terminal}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="runway">Runway</Label>
                <Select value={selectedRunway} onValueChange={setSelectedRunway}>
                  <SelectTrigger id="runway">
                    <SelectValue placeholder="Select a runway" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRunways.length === 0 ? (
                      <SelectItem value="none" disabled>No runways available</SelectItem>
                    ) : (
                      availableRunways.map((runway) => (
                        <SelectItem key={runway.id} value={runway.id}>
                          {runway.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAssign}
                disabled={!selectedFlight || (!selectedGate && !selectedRunway)}
                className="w-full"
              >
                Assign
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Assigned Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>Flights with assigned gates and runways for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Flight</th>
                    <th className="text-left p-2">Route</th>
                    <th className="text-left p-2">Departure</th>
                    <th className="text-left p-2">Gate</th>
                    <th className="text-left p-2">Runway</th>
                  </tr>
                </thead>
                <tbody>
                  {availableFlights.filter(flight => flight.gate || flight.runway).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted-foreground">
                        No assignments for the selected date
                      </td>
                    </tr>
                  ) : (
                    availableFlights
                      .filter(flight => flight.gate || flight.runway)
                      .map(flight => (
                        <tr key={flight.id} className="border-b">
                          <td className="p-2 font-medium">{flight.flightNumber}</td>
                          <td className="p-2">{flight.origin} → {flight.destination}</td>
                          <td className="p-2">{new Date(flight.departureTime).toLocaleTimeString()}</td>
                          <td className="p-2">{flight.gate || "—"}</td>
                          <td className="p-2">{flight.runway || "—"}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AssignGateRunway;
