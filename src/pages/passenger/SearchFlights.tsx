
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { MapPin, Calendar, Search } from "lucide-react";
import { flightApi } from "@/lib/api";
import { Flight } from "@/lib/types";
import PageLayout from "@/components/PageLayout";
import FlightTable from "@/components/FlightTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type SearchFormValues = {
  origin: string;
  destination: string;
  date: Date | null;
};

const SearchFlights = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      origin: "",
      destination: "",
      date: null,
    },
  });

  const handleSearch = async (data: SearchFormValues) => {
    setLoading(true);
    setHasSearched(true);

    try {
      // Format the date properly for the search API
      const searchParams: {
        origin?: string;
        destination?: string;
        date?: string;
      } = {};

      if (data.origin.trim()) {
        searchParams.origin = data.origin.trim();
      }

      if (data.destination.trim()) {
        searchParams.destination = data.destination.trim();
      }

      if (data.date) {
        searchParams.date = format(data.date, "yyyy-MM-dd");
      }

      console.log("Searching flights with params:", searchParams);

      // Only search if at least one parameter is provided
      if (Object.keys(searchParams).length > 0) {
        try {
          // First try the search API
          const results = await flightApi.search(searchParams);
          setFlights(results);
        } catch (error) {
          console.error("Search API failed, falling back to getAll:", error);
          // If search API fails, fall back to getAll and filter client-side
          const allFlights = await flightApi.getAll();
          
          // Client-side filtering
          const filteredFlights = allFlights.filter(flight => {
            let matches = true;
            
            if (searchParams.origin) {
              matches = matches && flight.origin.toLowerCase().includes(searchParams.origin.toLowerCase());
            }
            
            if (searchParams.destination) {
              matches = matches && flight.destination.toLowerCase().includes(searchParams.destination.toLowerCase());
            }
            
            if (searchParams.date) {
              const flightDate = new Date(flight.departure_time || flight.departureTime || "").toISOString().split('T')[0];
              matches = matches && flightDate === searchParams.date;
            }
            
            return matches;
          });
          
          setFlights(filteredFlights);
        }
      } else {
        // If no search parameters, get all flights
        const results = await flightApi.getAll();
        setFlights(results);
      }
    } catch (error) {
      console.error("Error searching flights:", error);
      toast({
        title: "Search Failed",
        description: "There was an error searching for flights. Please try again.",
        variant: "destructive",
      });
      
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight: Flight) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a flight",
        variant: "destructive",
      });
      return;
    }
    
    if (user.role !== "passenger") {
      toast({
        title: "Access Denied",
        description: "Only passengers can book flights",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to flight details page
    window.location.href = `/passenger/flight/${flight.id}`;
  };

  return (
    <PageLayout title="Search Flights">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Your Next Journey</CardTitle>
          <CardDescription>
            Search for flights by origin, destination, and date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Origin */}
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="From where?"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination */}
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="To where?"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Searching..." : 
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Flights
                    </>
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {hasSearched && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {flights.length > 0
                ? `${flights.length} ${flights.length === 1 ? "Flight" : "Flights"} Found`
                : "No Flights Found"}
            </h2>
            
            {flights.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Showing all results
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          <FlightTable
            flights={flights}
            loading={loading}
            selectable={true}
            searchable={true}
            filterable={true}
            onSelect={handleSelectFlight}
            emptyMessage="No flights match your search criteria. Please try different parameters."
          />
        </>
      )}
    </PageLayout>
  );
};

export default SearchFlights;
