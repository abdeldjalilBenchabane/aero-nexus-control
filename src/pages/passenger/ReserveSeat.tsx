
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { flights, Flight, reservations } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import SeatMap from "@/components/SeatMap";
import { Info, ArrowRight, CreditCard } from "lucide-react";

const ReserveSeat = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  
  // Fetch flight and seat data
  useEffect(() => {
    // Simulate API call to get flight details
    const foundFlight = flights.find(f => f.id === flightId);
    if (foundFlight) {
      setFlight(foundFlight);
    }
    
    // Simulate API call to get reserved seats
    const flightReservations = reservations.filter(r => r.flightId === flightId);
    const reserved = flightReservations.map(r => r.seat);
    setReservedSeats(reserved);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoadingSeats(false);
    }, 1000);
  }, [flightId]);
  
  // Handle seat selection
  const handleSeatSelect = (seatId: string) => {
    if (reservedSeats.includes(seatId)) {
      return; // Seat is already reserved
    }
    setSelectedSeat(seatId);
  };
  
  // Handle reservation submission
  const handleReservation = () => {
    if (!flight || !selectedSeat || !user) return;
    
    // Simulate API call to create reservation
    console.log('Creating reservation:', {
      userId: user.id,
      flightId: flight.id,
      seat: selectedSeat,
      timestamp: new Date().toISOString()
    });
    
    // Navigate to confirmation page
    navigate('/passenger/my-reservations');
  };
  
  if (!flight) {
    return (
      <PageLayout title="Reserve Seat">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Flight not found</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reserve Your Seat">
      <div className="space-y-6">
        {/* Flight Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Flight Details</span>
              <Badge className={getStatusBadgeClass(flight.status)}>
                {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription>
              {flight.airline} - {flight.flightNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold">{flight.origin}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(flight.departureTime).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <ArrowRight className="mx-auto h-5 w-5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mt-1">
                  {getFlightDuration(flight)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">{flight.destination}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(flight.arrivalTime).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Seat Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Seat</CardTitle>
            <CardDescription>
              Available seats are shown in the seat map below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>How to select a seat</AlertTitle>
              <AlertDescription>
                Click on an available seat to select it. Gray seats are already reserved.
              </AlertDescription>
            </Alert>
            
            {isLoadingSeats ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading seat map...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <SeatMap 
                  reservedSeats={reservedSeats}
                  selectedSeat={selectedSeat}
                  onSeatSelect={handleSeatSelect}
                />
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-primary rounded-sm mr-2"></div>
                      <span className="text-sm">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm mr-2"></div>
                      <span className="text-sm">Reserved</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                      <span className="text-sm">Selected</span>
                    </div>
                  </div>
                  
                  {selectedSeat && (
                    <div>
                      <Badge variant="outline" className="text-base font-semibold">
                        Selected: {selectedSeat}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate(`/passenger/flight-details/${flight.id}`)}
            >
              Back to Flight Details
            </Button>
            <Button 
              onClick={handleReservation}
              disabled={!selectedSeat}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Payment</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

// Helper functions
function getFlightDuration(flight: Flight): string {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
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

export default ReserveSeat;
