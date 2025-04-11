
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flights, gates, runways } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

const AssignGateRunway = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedFlight, setSelectedFlight] = useState("");
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedRunway, setSelectedRunway] = useState("");

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

  // Filter available gates and runways
  const availableGates = gates.filter(gate => !assignedGates.includes(gate.id));
  const availableRunways = runways.filter(runway => !assignedRunways.includes(runway.id));

  const handleAssign = () => {
    if (selectedFlight && (selectedGate || selectedRunway)) {
      console.log('Assigning:', {
        flight: selectedFlight,
        gate: selectedGate || 'Not assigned',
        runway: selectedRunway || 'Not assigned'
      });
      // In a real app, this would make an API call to update the assignment
    }
  };

  return (
    <PageLayout title="Assign Gates & Runways">
      <div className="space-y-6">
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
      </div>
    </PageLayout>
  );
};

export default AssignGateRunway;
