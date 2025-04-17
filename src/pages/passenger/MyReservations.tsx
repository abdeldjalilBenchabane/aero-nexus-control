
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { flights, reservations } from "@/lib/db";
import type { Flight, Reservation } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BadgeAlert, Calendar, Info, Plane, Printer, Share2, Tag, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define a concrete type to handle the flight fallback scenario
interface ReservationWithFlight extends Reservation {
  flight: Flight;
}

const MyReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for modals
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithFlight | null>(null);
  
  // Get user's reservations
  const userId = user?.id || "";
  const userReservations = reservations.filter(res => res.userId === userId || res.user_id === userId);
  
  // Get flight details for each reservation
  const reservationsWithFlights: ReservationWithFlight[] = userReservations.map(reservation => {
    const flight = flights.find(flight => flight.id === reservation.flightId || flight.id === reservation.flight_id);
    
    // If we found a real flight, use it - otherwise create a compatible fallback object
    const flightData: Flight = flight || {
      id: "",
      flight_number: "Unknown",
      flightNumber: "Unknown",
      airline: "Unknown",
      origin: "Unknown",
      destination: "Unknown",
      departure_time: new Date().toISOString(),
      departureTime: new Date().toISOString(),
      arrival_time: new Date().toISOString(),
      arrivalTime: new Date().toISOString(),
      status: "scheduled",
      price: 0,
      gate: "Unknown",
      runway: "Unknown"
    };
    
    return {
      ...reservation,
      flight: flightData
    };
  });
  
  // Split reservations by upcoming/past
  const now = new Date();
  const upcomingReservations = reservationsWithFlights.filter(res => 
    new Date(res.flight.departureTime || res.flight.departure_time) > now
  );
  const pastReservations = reservationsWithFlights.filter(res => 
    new Date(res.flight.departureTime || res.flight.departure_time) <= now
  );
  
  // Handle reservation cancellation
  const handleCancelReservation = () => {
    if (!selectedReservation) return;
    
    // In a real app, this would make an API call
    console.log('Cancelling reservation:', selectedReservation.id);
    
    // Close dialog
    setIsCancelDialogOpen(false);
    setSelectedReservation(null);
  };

  return (
    <PageLayout title="My Reservations">
      <div className="space-y-6">
        {upcomingReservations.length === 0 && pastReservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Reservations Found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                You don't have any flight reservations yet. Start by searching for flights
                and booking your seats.
              </p>
              <Button onClick={() => navigate('/passenger/search-flights')}>
                Search for Flights
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingReservations.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastReservations.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <ReservationCard 
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={() => {
                    setSelectedReservation(reservation);
                    setIsCancelDialogOpen(true);
                  }}
                  onViewDetails={() => navigate(`/passenger/flight-details/${reservation.flight.id}`)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {pastReservations.map((reservation) => (
                <ReservationCard 
                  key={reservation.id}
                  reservation={reservation}
                  isPast={true}
                  onViewDetails={() => navigate(`/passenger/flight-details/${reservation.flight.id}`)}
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Cancel Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Reservation</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your reservation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedReservation && (
              <div className="py-4">
                <Alert>
                  <BadgeAlert className="h-4 w-4" />
                  <AlertTitle>Reservation Details</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Flight: {selectedReservation.flight.flightNumber || selectedReservation.flight.flight_number}</p>
                    <p>From: {selectedReservation.flight.origin} to {selectedReservation.flight.destination}</p>
                    <p>Departure: {new Date(selectedReservation.flight.departureTime || selectedReservation.flight.departure_time).toLocaleString()}</p>
                    <p>Seat: {selectedReservation.seat || selectedReservation.seat_number}</p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Keep Reservation
              </Button>
              <Button variant="destructive" onClick={handleCancelReservation}>
                Cancel Reservation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

// Reservation Card Component
interface ReservationCardProps {
  reservation: ReservationWithFlight;
  isPast?: boolean;
  onCancel?: () => void;
  onViewDetails: () => void;
}

const ReservationCard = ({ reservation, isPast = false, onCancel, onViewDetails }: ReservationCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {reservation.flight.airline} - {reservation.flight.flightNumber || reservation.flight.flight_number}
              </h3>
              <Badge className={getStatusBadgeClass(reservation.flight.status)}>
                {reservation.flight.status.charAt(0).toUpperCase() + reservation.flight.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <span>{reservation.flight.origin}</span>
              <span className="mx-2">→</span>
              <span>{reservation.flight.destination}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(reservation.flight.departureTime || reservation.flight.departure_time).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-1" />
                <span>Seat {reservation.seat || reservation.seat_number}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-1" />
                <span>Passenger ID: {(reservation.userId || reservation.user_id).slice(0, 8)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewDetails}
              >
                View Details
              </Button>
              
              {!isPast && onCancel && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={onCancel}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span>Cancel</span>
                </Button>
              )}
            </div>
            
            {!isPast && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Printer className="h-4 w-4 mr-1" />
                  <span>Print</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>Share</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function
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

export default MyReservations;
