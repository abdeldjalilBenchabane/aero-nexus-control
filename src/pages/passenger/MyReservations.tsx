
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reservationApi, flightApi } from "@/lib/api";
import { Reservation, Flight } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { PlaneIcon, CalendarIcon, ClockIcon, MapPinIcon, X, Loader2 } from "lucide-react";
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

type ReservationWithFlight = Reservation & {
  flightDetails?: Flight;
};

const MyReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<ReservationWithFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get reservation data
      const data = await reservationApi.getForUser(user.id);
      console.log("Fetched reservations:", data);
      
      // If we have reservations, try to fetch the associated flight details
      if (data && data.length > 0) {
        const reservationsWithFlights = await Promise.all(data.map(async (reservation) => {
          try {
            if (reservation.flight_id) {
              const flightDetails = await flightApi.getById(reservation.flight_id);
              return { ...reservation, flightDetails };
            }
          } catch (error) {
            console.error(`Error fetching flight details for reservation ${reservation.id}:`, error);
          }
          return reservation;
        }));
        
        setReservations(reservationsWithFlights);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("Failed to load your reservations. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load your reservations",
        variant: "destructive"
      });
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelReservationId) return;
    
    try {
      setCancelLoading(true);
      await reservationApi.cancel(cancelReservationId);
      
      toast({
        title: "Success",
        description: "Reservation cancelled successfully"
      });
      
      // Update local state to reflect the cancellation
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === cancelReservationId 
            ? { ...res, status: "cancelled" } 
            : res
        )
      );
      
      setCancelReservationId(null);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive"
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateTime?: string) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateTime?: string) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  return (
    <PageLayout title="My Reservations">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <p>Loading your reservations...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <X className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Reservations</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {error}
              </p>
              <Button onClick={fetchReservations}>Try Again</Button>
            </CardContent>
          </Card>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PlaneIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Reservations Found</h2>
              <p className="text-muted-foreground text-center max-w-md">
                You don't have any flight reservations yet. Search for flights to make your first booking!
              </p>
              <Button className="mt-6" variant="default" asChild>
                <a href="/passenger/search-flights">Search Flights</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reservations.map(reservation => {
              const flight = reservation.flightDetails;
              
              return (
                <Card key={reservation.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/40 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Flight {reservation.flight_number || (flight?.flight_number || flight?.flightNumber) || reservation.flight_id}</CardTitle>
                        <CardDescription>
                          Seat {reservation.seat_number} · Booked on {formatDate(reservation.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-medium">{flight?.origin || reservation.origin || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="hidden md:block">
                          <div className="w-24 h-0.5 bg-gray-200 relative">
                            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">To</p>
                            <p className="font-medium">{flight?.destination || reservation.destination || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Departure Date</p>
                            <p className="font-medium">
                              {formatDate(flight?.departure_time || flight?.departureTime || reservation.departure_time)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Departure Time</p>
                            <p className="font-medium">
                              {formatTime(flight?.departure_time || flight?.departureTime || reservation.departure_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {reservation.status !== "cancelled" && (
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive" 
                            onClick={() => setCancelReservationId(reservation.id)}
                            className="flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Cancel Reservation
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <AlertDialog open={!!cancelReservationId} onOpenChange={(open) => !open && setCancelReservationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Reservation</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelReservation}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel Reservation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default MyReservations;
