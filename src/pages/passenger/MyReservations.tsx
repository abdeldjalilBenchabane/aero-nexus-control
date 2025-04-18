
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reservationApi } from "@/lib/api";
import { Reservation, Flight } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { PlaneIcon, CalendarIcon, ClockIcon, MapPinIcon, X } from "lucide-react";
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

const MyReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationApi.getForUser(user!.id);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        title: "Error",
        description: "Failed to load your reservations",
        variant: "destructive"
      });
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

  return (
    <PageLayout title="My Reservations">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading your reservations...</p>
          </div>
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
            {reservations.map(reservation => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Flight {reservation.flight_number}</CardTitle>
                      <CardDescription>
                        Seat {reservation.seat_number} · Booked on {new Date(reservation.created_at || '').toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) : "Unknown"}
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
                          <p className="font-medium">{reservation.flight_id}</p>
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
                          <p className="font-medium">{reservation.destination}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Departure Date</p>
                          <p className="font-medium">
                            {reservation.departure_time 
                              ? new Date(reservation.departure_time).toLocaleDateString() 
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Departure Time</p>
                          <p className="font-medium">
                            {reservation.departure_time 
                              ? new Date(reservation.departure_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                }) 
                              : "N/A"}
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
            ))}
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
