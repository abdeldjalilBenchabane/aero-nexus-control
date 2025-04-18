
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Flight, Seat } from "@/lib/types";
import { flightApi, reservationApi, seatApi } from "@/lib/api";
import { Search, Plane, CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SeatMap from "@/components/SeatMap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SearchFlights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    date: null as Date | null
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearchPerformed(true);
      
      const formattedDate = searchParams.date ? format(searchParams.date, 'yyyy-MM-dd') : undefined;
      
      const results = await flightApi.search({
        origin: searchParams.origin || undefined,
        destination: searchParams.destination || undefined,
        date: formattedDate
      });
      
      setFlights(results);
    } catch (error) {
      console.error("Error searching flights:", error);
      toast({
        title: "Error",
        description: "Failed to search for flights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectFlight = async (flight: Flight) => {
    setSelectedFlight(flight);
    
    try {
      const seats = await seatApi.getAvailable(flight.id);
      setAvailableSeats(seats);
      setIsReservationOpen(true);
    } catch (error) {
      console.error("Error fetching available seats:", error);
      toast({
        title: "Error",
        description: "Failed to load available seats",
        variant: "destructive"
      });
    }
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
  };

  const handleReservation = async () => {
    if (!user || !selectedFlight || !selectedSeat) {
      toast({
        title: "Error",
        description: "Please select a seat to make a reservation",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setReservationLoading(true);
      
      // First, get the seat ID by its number
      const seat = await seatApi.getBySeatNumber(selectedFlight.id, selectedSeat);
      
      if (!seat) {
        throw new Error("Selected seat not found");
      }
      
      // Create reservation
      const result = await reservationApi.create({
        user_id: user.id,
        flight_id: selectedFlight.id,
        seat_id: seat.id
      });
      
      toast({
        title: "Success",
        description: `Reservation confirmed for flight ${selectedFlight.flight_number}, seat ${selectedSeat}`
      });
      
      setIsReservationOpen(false);
      setSelectedFlight(null);
      setSelectedSeat("");
    } catch (error) {
      console.error("Error making reservation:", error);
      toast({
        title: "Error",
        description: "Failed to make reservation. The seat may no longer be available.",
        variant: "destructive"
      });
    } finally {
      setReservationLoading(false);
    }
  };

  // Helper function to format date or return placeholder
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "—";
    }
  };

  return (
    <PageLayout title="Search Flights">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Find Your Flight</CardTitle>
            <CardDescription>
              Search for flights by origin, destination, and date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input 
                  id="origin" 
                  name="origin"
                  placeholder="City or airport"
                  value={searchParams.origin}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input 
                  id="destination" 
                  name="destination"
                  placeholder="City or airport"
                  value={searchParams.destination}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchParams.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchParams.date ? format(searchParams.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchParams.date || undefined}
                      onSelect={(date) => setSearchParams(prev => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search Flights"}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {searchPerformed && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {flights.length} {flights.length === 1 ? "flight" : "flights"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flights.length === 0 ? (
                <div className="text-center py-8">
                  <Plane className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No flights found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map(flight => (
                    <Card key={flight.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold">{flight.airline_name || "Airline"}</h3>
                              <p className="text-sm text-muted-foreground">Flight {flight.flight_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${flight.price?.toFixed(2) || "—"}</p>
                              <p className="text-xs text-muted-foreground">per person</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{flight.origin || "—"}</p>
                              <p className="text-sm text-muted-foreground">
                                {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : "—"}
                              </p>
                            </div>
                            
                            <div className="flex-1 mx-4">
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                  <Plane className="bg-background px-2 text-primary" size={20} />
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium">{flight.destination || "—"}</p>
                              <p className="text-sm text-muted-foreground">
                                {flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : "—"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Gate:</span> {flight.gate_number || "TBA"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Status:</span> <span className="capitalize">{flight.status}</span>
                              </p>
                            </div>
                            
                            <Button onClick={() => handleSelectFlight(flight)}>
                              Select Flight
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Your Seat</DialogTitle>
            <DialogDescription>
              {selectedFlight && (
                <div className="mt-2">
                  <p>Flight: {selectedFlight.flight_number}</p>
                  <p>{selectedFlight.origin || "—"} to {selectedFlight.destination || "—"}</p>
                  <p>
                    {selectedFlight.departure_time ? new Date(selectedFlight.departure_time).toLocaleDateString() : "—"} at {' '}
                    {selectedFlight.departure_time ? new Date(selectedFlight.departure_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "—"}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <SeatMap 
              flight={selectedFlight || undefined}
              onSeatSelect={handleSeatSelect}
              selectedSeat={selectedSeat}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReservation}
              disabled={!selectedSeat || reservationLoading}
            >
              {reservationLoading ? "Processing..." : "Confirm Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SearchFlights;
