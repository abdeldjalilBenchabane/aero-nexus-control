
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { flights, Flight, gates, runways, reservations } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Plane, Calendar, ArrowRight, Info, AlertTriangle, LuggageIcon, Clock10 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const FlightDetails = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [userHasReservation, setUserHasReservation] = useState(false);
  const [reservedSeatCount, setReservedSeatCount] = useState(0);
  const [gate, setGate] = useState<any>(null);
  const [runway, setRunway] = useState<any>(null);
  
  // Fetch flight data
  useEffect(() => {
    // Simulate API call
    const foundFlight = flights.find(f => f.id === flightId);
    if (foundFlight) {
      setFlight(foundFlight);
      
      // Check if user has reservation
      if (user) {
        const hasReservation = reservations.some(
          res => res.flightId === flightId && res.userId === user.id
        );
        setUserHasReservation(hasReservation);
      }
      
      // Get reserved seat count
      const reservedSeats = reservations.filter(res => res.flightId === flightId);
      setReservedSeatCount(reservedSeats.length);
      
      // Get gate and runway info
      if (foundFlight.gate) {
        const flightGate = gates.find(g => g.id === foundFlight.gate);
        setGate(flightGate);
      }
      
      if (foundFlight.runway) {
        const flightRunway = runways.find(r => r.id === foundFlight.runway);
        setRunway(flightRunway);
      }
    }
  }, [flightId, user]);
  
  if (!flight) {
    return (
      <PageLayout title="Flight Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Flight not found</p>
        </div>
      </PageLayout>
    );
  }
  
  const isDeparted = ["departed", "arrived"].includes(flight.status);
  const isDelayed = flight.status === "delayed";
  const isCancelled = flight.status === "cancelled";
  
  // Calculate flight progress percentage
  const getFlightProgressPercentage = (): number => {
    const now = new Date();
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    
    // Flight hasn't departed yet
    if (now < departure) return 0;
    
    // Flight has arrived
    if (now > arrival) return 100;
    
    // Flight in progress
    const totalDuration = arrival.getTime() - departure.getTime();
    const elapsed = now.getTime() - departure.getTime();
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  // Get the flight stage
  const getFlightStage = (): string => {
    if (flight.status === "cancelled") return "Cancelled";
    if (flight.status === "scheduled") return "Scheduled";
    if (flight.status === "boarding") return "Boarding";
    if (flight.status === "delayed") return "Delayed";
    
    const progress = getFlightProgressPercentage();
    if (progress === 0) return "Pre-Departure";
    if (progress === 100) return "Arrived";
    if (progress < 20) return "Take-off";
    if (progress > 80) return "Landing Approach";
    return "In Flight";
  };

  return (
    <PageLayout title="Flight Details">
      <div className="space-y-6">
        {/* Flight Header */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Plane className="h-6 w-6" />
                <span>{flight.flightNumber}</span>
              </CardTitle>
              <Badge className={getStatusBadgeClass(flight.status)}>
                {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              {flight.airline}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4 md:mb-0">
                <div>
                  <div className="text-2xl font-semibold">{flight.origin}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(flight.departureTime)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(flight.departureTime)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-muted-foreground text-xs">
                    {getFlightDuration(flight)}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground my-1" />
                  <div className="text-muted-foreground text-xs">
                    {getFlightDistance(flight)} km
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-semibold">{flight.destination}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(flight.arrivalTime)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(flight.arrivalTime)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                {!userHasReservation && !isDeparted && !isCancelled ? (
                  <Button onClick={() => navigate(`/passenger/reserve-seat?flightId=${flight.id}`)}>
                    Book This Flight
                  </Button>
                ) : userHasReservation ? (
                  <Badge variant="outline" className="text-primary p-2">
                    You have a reservation
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Alert for delayed or cancelled flights */}
        {(isDelayed || isCancelled) && (
          <Alert variant={isCancelled ? "destructive" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isCancelled ? "Flight Cancelled" : "Flight Delayed"}
            </AlertTitle>
            <AlertDescription>
              {isCancelled
                ? "This flight has been cancelled. Please contact the airline for rebooking options."
                : "This flight is experiencing delays. Please check back for updates."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Flight Details Tabs */}
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Flight Status</TabsTrigger>
            <TabsTrigger value="info">Flight Info</TabsTrigger>
            <TabsTrigger value="airport">Airport Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Flight Status</CardTitle>
                <CardDescription>
                  Current status and tracking information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isCancelled && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{flight.origin}</span>
                      <span>{getFlightStage()}</span>
                      <span>{flight.destination}</span>
                    </div>
                    <Progress value={getFlightProgressPercentage()} className="h-2" />
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Departure</div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <div>{flight.origin}</div>
                        <div className="text-sm text-muted-foreground">
                          {gate ? `Terminal ${gate.terminal}, Gate ${gate.name}` : 'Gate not assigned yet'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(flight.departureTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Arrival</div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <div>{flight.destination}</div>
                        <div className="text-sm text-muted-foreground">
                          Estimated arrival time
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(flight.arrivalTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Flight Status: {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}</AlertTitle>
                  <AlertDescription>
                    {getStatusMessage(flight.status)}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Flight Information</CardTitle>
                <CardDescription>
                  Details about this flight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start">
                    <Plane className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Airline</div>
                      <div>{flight.airline}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <LuggageIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Capacity</div>
                      <div>150 seats ({reservedSeatCount} reserved)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock10 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Flight Duration</div>
                      <div>{getFlightDuration(flight)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Distance</div>
                      <div>{getFlightDistance(flight)} km</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Flight Schedule</div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Departure</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(flight.departureTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Arrival</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(flight.arrivalTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              {!userHasReservation && !isDeparted && !isCancelled && (
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/passenger/reserve-seat?flightId=${flight.id}`)}
                  >
                    Reserve a Seat on This Flight
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="airport">
            <Card>
              <CardHeader>
                <CardTitle>Airport Information</CardTitle>
                <CardDescription>
                  Details about departure and arrival airports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="text-lg font-medium">Departure: {flight.origin}</div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Gate Information</div>
                      {gate ? (
                        <div className="bg-muted p-3 rounded-md">
                          <div className="font-medium">Gate {gate.name}</div>
                          <div className="text-sm">Terminal {gate.terminal}</div>
                          <div className="text-sm text-muted-foreground">
                            {gate.status === "active" ? "Gate Open" : "Gate Closed"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Gate has not been assigned yet
                        </div>
                      )}
                    </div>
                    
                    {runway && flight.status !== "scheduled" && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Runway Information</div>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="font-medium">Runway {runway.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {runway.length}m × {runway.width}m
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Airport Guidelines</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Arrive at least 2 hours before departure</li>
                        <li>Have your ID and boarding pass ready</li>
                        <li>Follow security screening guidelines</li>
                        <li>Check prohibited items before packing</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-lg font-medium">Arrival: {flight.destination}</div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Airport Facilities</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Currency exchange services available</li>
                        <li>Free WiFi throughout the terminal</li>
                        <li>Multiple dining and shopping options</li>
                        <li>Ground transportation information at arrivals</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Baggage Claim</div>
                      <div className="text-sm text-muted-foreground">
                        Baggage claim areas are located on the ground floor of the arrival terminal.
                        Follow the signs after passing through customs and immigration.
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Transportation</div>
                      <div className="text-sm text-muted-foreground">
                        Taxis, ride-sharing services, car rentals, and public transportation
                        options are available at the airport.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

// Helper functions
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
}

function getFlightDuration(flight: Flight): string {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function getFlightDistance(flight: Flight): number {
  // This would normally be calculated based on coordinates
  // Returning a mock value for now
  const mockDistances: Record<string, number> = {
    "JFK-LAX": 3983,
    "LAX-JFK": 3983,
    "LHR-CDG": 344,
    "CDG-LHR": 344,
    "DXB-SIN": 5841,
    "SIN-DXB": 5841,
    "ORD-MIA": 1920,
    "MIA-ORD": 1920,
  };
  
  const key = `${flight.origin}-${flight.destination}`;
  return mockDistances[key] || 1500; // Default fallback
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-500";
    case "boarding":
      return "bg-yellow-500";
    case "departed":
      return "bg-purple-500";
    case "arrived":
      return "bg-green-500";
    case "delayed":
      return "bg-orange-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "scheduled":
      return "Your flight is scheduled to depart as planned. Please check in on time.";
    case "boarding":
      return "Boarding is in progress. Please proceed to your gate.";
    case "departed":
      return "Your flight has departed and is en route to the destination.";
    case "arrived":
      return "Your flight has arrived at the destination.";
    case "delayed":
      return "Your flight is delayed. Please check with the airline for updated departure time.";
    case "cancelled":
      return "Unfortunately, your flight has been cancelled. Please contact the airline for rebooking options.";
    default:
      return "Status information unavailable.";
  }
}

export default FlightDetails;
