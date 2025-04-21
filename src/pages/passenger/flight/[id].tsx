
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { flightApi, seatApi, reservationApi } from "@/lib/api";
import { Flight, Seat } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Plane, 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  ArrowLeft,
  DollarSign,
  Ticket
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FlightDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFlightDetails();
    }
  }, [id]);

  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      const flightData = await flightApi.getById(id!);
      setFlight(flightData);

      // Fetch available seats
      const seats = await seatApi.getAvailable(id!);
      setAvailableSeats(seats);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      toast({
        title: "Error",
        description: "Failed to load flight details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a flight",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSeat) {
      toast({
        title: "Seat Required",
        description: "Please select a seat to continue",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmBooking = async () => {
    try {
      setBookingInProgress(true);
      
      const reservation = {
        flight_id: id!,
        user_id: user!.id,
        seat_id: selectedSeat
      };
      
      const result = await reservationApi.create(reservation);
      
      if (result.success) {
        toast({
          title: "Booking Successful",
          description: "Your flight has been booked successfully!",
        });
        
        setTimeout(() => {
          window.location.href = "/passenger/my-reservations";
        }, 2000);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      console.error("Error booking flight:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your flight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingInProgress(false);
      setShowConfirmDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "boarding":
        return "bg-yellow-500";
      case "departed":
        return "bg-purple-500";
      case "in_air":
        return "bg-indigo-500";
      case "landed":
        return "bg-green-700";
      case "arrived":
        return "bg-green-500";
      case "completed":
        return "bg-green-900";
      case "delayed":
        return "bg-orange-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm");
    } catch (error) {
      return "Invalid time";
    }
  };

  // Calculate random-ish flight price based on flight ID
  const calculatePrice = () => {
    if (!flight) return 0;
    const basePrice = 150;
    const idFactor = parseInt(flight.id) * 11.5;
    return Math.floor(basePrice + idFactor);
  };

  if (loading) {
    return (
      <PageLayout title="Flight Details">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading flight details...</span>
        </div>
      </PageLayout>
    );
  }

  if (!flight) {
    return (
      <PageLayout title="Flight Not Found">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">Flight Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              The flight you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/passenger/search-flights">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Flight Search
              </a>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Flight Details">
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-6">
          <a href="/passenger/search-flights">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flight Search
          </a>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-2xl">
                  Flight {flight.flight_number || flight.flightNumber}
                </CardTitle>
                <CardDescription>
                  {flight.airline_name || flight.airlineName || "Airline"}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(flight.status)}>
                {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Origin</p>
                    <p className="font-medium">{flight.origin}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure Date</p>
                    <p className="font-medium">
                      {formatDate(flight.departure_time || flight.departureTime || "")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure Time</p>
                    <p className="font-medium">
                      {formatTime(flight.departure_time || flight.departureTime || "")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{flight.destination}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Arrival Date</p>
                    <p className="font-medium">
                      {formatDate(flight.arrival_time || flight.arrivalTime || "")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Arrival Time</p>
                    <p className="font-medium">
                      {formatTime(flight.arrival_time || flight.arrivalTime || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Price & Booking</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">Ticket Price</span>
                    </div>
                    <span className="text-xl font-bold">${calculatePrice()}</span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ticket className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">Available Seats</span>
                    </div>
                    <span className="text-xl font-bold">{availableSeats.length}</span>
                  </div>
                </div>
              </div>
              
              {availableSeats.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Seat
                      </label>
                      <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a seat" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSeats.map((seat) => (
                            <SelectItem key={seat.id} value={seat.id}>
                              {seat.seat_number} - {seat.class} Class
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={handleBookSeat}
                        disabled={flight.status === "completed" || flight.status === "cancelled"}
                      >
                        <Plane className="mr-2 h-4 w-4" />
                        Book This Flight
                      </Button>
                    </div>
                  </div>
                  
                  {(flight.status === "completed" || flight.status === "cancelled") && (
                    <p className="text-red-500 text-sm">
                      This flight cannot be booked as it is {flight.status}.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700">
                    No seats available for this flight.
                  </p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Additional Information</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Gate</TableCell>
                    <TableCell>
                      {flight.gate_number || 
                       flight.gate_id || 
                       (typeof flight.gate === 'string' ? flight.gate : 
                        (flight.gate && typeof flight.gate === 'object' && 'name' in (flight.gate as any) ? 
                         (flight.gate as any).name : 'TBD'))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aircraft</TableCell>
                    <TableCell>
                      {flight.airplane_name || flight.airplaneName || 'Standard Aircraft'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flight Duration</TableCell>
                    <TableCell>
                      {flight.duration || 'Approximately 2 hours'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to book this flight? This will charge your account ${calculatePrice()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBooking}
              disabled={bookingInProgress}
              className="bg-primary"
            >
              {bookingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default FlightDetailPage;
