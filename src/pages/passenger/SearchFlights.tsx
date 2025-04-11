
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { flights, Flight } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Search, Map, Filter, ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchParams {
  origin: string;
  destination: string;
  departureDate: Date | undefined;
  flightType: "oneWay" | "roundTrip";
}

const SearchFlights = () => {
  const navigate = useNavigate();
  
  // Search params
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: "",
    destination: "",
    departureDate: undefined,
    flightType: "oneWay"
  });
  
  // Filter and sorting
  const [priceRange, setPriceRange] = useState<string>("all");
  const [airline, setAirline] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("departureTime");
  
  // Search results
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  
  // Available airlines (for filter)
  const availableAirlines = Array.from(new Set(flights.map(flight => flight.airline)));
  
  // Handle search
  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      return;
    }
    
    // Mock search - in a real app this would be an API call
    const searchDate = searchParams.departureDate;
    
    let results = flights.filter(flight => {
      // Match origin and destination
      const matchesRoute = 
        flight.origin.toLowerCase().includes(searchParams.origin.toLowerCase()) &&
        flight.destination.toLowerCase().includes(searchParams.destination.toLowerCase());
      
      // Match date (just the day, not time)
      const flightDate = new Date(flight.departureTime);
      const matchesDate = 
        flightDate.getDate() === searchDate.getDate() &&
        flightDate.getMonth() === searchDate.getMonth() &&
        flightDate.getFullYear() === searchDate.getFullYear();
      
      // Only show scheduled or delayed flights (not departed, arrived, or cancelled)
      const validStatus = ["scheduled", "delayed"].includes(flight.status);
      
      return matchesRoute && matchesDate && validStatus;
    });
    
    // Apply airline filter
    if (airline !== "all") {
      results = results.filter(flight => flight.airline === airline);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === "departureTime") {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      } else if (sortBy === "price") {
        // In a real app, we would sort by price here
        return 0;
      } else if (sortBy === "duration") {
        const durationA = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const durationB = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return durationA - durationB;
      }
      return 0;
    });
    
    setSearchResults(results);
    setHasSearched(true);
  };
  
  // Swap origin and destination
  const swapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <PageLayout title="Search Flights">
      <div className="space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Find Your Flight</CardTitle>
            <CardDescription>Search for available flights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant={searchParams.flightType === "oneWay" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSearchParams(prev => ({ ...prev, flightType: "oneWay" }))}
                >
                  One Way
                </Button>
                <Button 
                  variant={searchParams.flightType === "roundTrip" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSearchParams(prev => ({ ...prev, flightType: "roundTrip" }))}
                  disabled={true} // Disabled for simplicity
                >
                  Round Trip
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor="origin">From</Label>
                  <div className="relative">
                    <Map className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="origin"
                      placeholder="Origin city or airport"
                      className="pl-8"
                      value={searchParams.origin}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 flex items-end justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={swapLocations}
                    className="h-10 w-10"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor="destination">To</Label>
                  <div className="relative">
                    <Map className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Destination city or airport"
                      className="pl-8"
                      value={searchParams.destination}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="departureDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !searchParams.departureDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {searchParams.departureDate ? (
                        format(searchParams.departureDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={searchParams.departureDate}
                      onSelect={(date) => setSearchParams(prev => ({ ...prev, departureDate: date }))}
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
              disabled={!searchParams.origin || !searchParams.destination || !searchParams.departureDate}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search Flights</span>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Search Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResults.length} flights found for {searchParams.origin} to {searchParams.destination} on {
                  searchParams.departureDate ? format(searchParams.departureDate, "PPP") : ""
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Select value={airline} onValueChange={setAirline}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Airline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Airlines</SelectItem>
                    {availableAirlines.map((airlineName, index) => (
                      <SelectItem key={index} value={airlineName}>
                        {airlineName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departureTime">Departure Time</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="ml-auto" onClick={handleSearch}>
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Apply Filters</span>
                </Button>
              </div>
              
              {/* Results List */}
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No flights found matching your criteria</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search parameters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((flight) => (
                    <Card key={flight.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="bg-primary/10 p-4 flex flex-col justify-center items-center sm:w-1/4">
                          <div className="text-2xl font-bold">{flight.flightNumber}</div>
                          <div className="text-sm text-muted-foreground">{flight.airline}</div>
                          <Badge 
                            className={getStatusBadgeClass(flight.status)}
                            variant="secondary"
                          >
                            {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between mb-2">
                            <div>
                              <div className="font-semibold">{flight.origin}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(flight.departureTime).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-center">
                              <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                              <div className="text-xs text-muted-foreground mt-1">
                                {getFlightDuration(flight)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{flight.destination}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(flight.arrivalTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Estimated Price</div>
                              <div className="font-semibold">$299.99</div>
                            </div>
                            <Button 
                              onClick={() => navigate(`/passenger/flight-details/${flight.id}`)}
                            >
                              View Details
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

export default SearchFlights;
