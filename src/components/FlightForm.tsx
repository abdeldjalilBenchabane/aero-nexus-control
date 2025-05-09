import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Flight, Airline, Airplane, Gate, Runway, FlightStatus } from "@/lib/types";
import { flightApi, airlineApi, airplaneApi, gateApi, runwayApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FlightFormProps {
  onSuccess?: (flight: Flight) => void;
  initialData?: Partial<Flight>;
  editMode?: boolean;
}

type FlightFormValues = {
  flight_number: string;
  airline_id: string;
  airplane_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  status: FlightStatus;
  gate_id: string;
  runway_id: string;
  price: number;
};

const FlightForm = ({ onSuccess, initialData, editMode = false }: FlightFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<FlightFormValues>({
    defaultValues: {
      flight_number: initialData?.flight_number || "",
      airline_id: initialData?.airline_id || (user?.role === "airline" ? user.airline_id || user.id : ""),
      airplane_id: initialData?.airplane_id || "",
      origin: initialData?.origin || "",
      destination: initialData?.destination || "",
      departure_time: initialData?.departure_time ? new Date(initialData.departure_time).toISOString().slice(0, 16) : "",
      arrival_time: initialData?.arrival_time ? new Date(initialData.arrival_time).toISOString().slice(0, 16) : "",
      status: initialData?.status || "scheduled",
      gate_id: initialData?.gate_id || "",
      runway_id: initialData?.runway_id || "",
      price: initialData?.price || 0,
    }
  });

  console.log("Initial form values:", form.getValues());
  console.log("Initial data received:", initialData);

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [runways, setRunways] = useState<Runway[]>([]);
  const [loading, setLoading] = useState(false);
  
  const watchAirlineId = form.watch("airline_id");
  const watchDepartureTime = form.watch("departure_time");
  const watchArrivalTime = form.watch("arrival_time");
  
  // Fetch airlines on component mount
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const data = await airlineApi.getAll();
        setAirlines(data);
        
        // If we're in edit mode and there's an airline_id but no airlines loaded yet
        if (editMode && initialData?.airline_id && data.length > 0) {
          // Make sure we have the correct airline set
          form.setValue("airline_id", initialData.airline_id);
        }
      } catch (error) {
        console.error("Error fetching airlines:", error);
        toast({
          title: "Error",
          description: "Failed to load airlines",
          variant: "destructive"
        });
      }
    };
    
    fetchAirlines();
  }, [toast, form, editMode, initialData]);
  
  // Fetch airplanes when airline is selected
  useEffect(() => {
    const fetchAirplanes = async () => {
      if (!watchAirlineId) {
        console.log("No airline ID, skipping airplane fetch");
        return;
      }
      
      try {
        let data: Airplane[] = [];
        
        // If both times are set, try to fetch available airplanes
        if (watchDepartureTime && watchArrivalTime) {
          try {
            console.log("Fetching available airplanes with params:", {
              airline_id: watchAirlineId,
              departure_time: watchDepartureTime,
              arrival_time: watchArrivalTime
            });
            
            data = await airplaneApi.getAvailable(
              watchAirlineId, 
              watchDepartureTime, 
              watchArrivalTime
            );
            console.log("Available airplanes:", data);
          } catch (error) {
            console.error("Error fetching available airplanes, falling back to all airline's airplanes:", error);
            // Fallback: if the available endpoint fails, fetch all airplanes for this airline
            data = await airplaneApi.getByAirline(watchAirlineId);
            console.log("All airline airplanes:", data);
          }
        } else {
          // Otherwise, fetch all airplanes for this airline
          console.log("Fetching all airplanes for airline:", watchAirlineId);
          data = await airplaneApi.getByAirline(watchAirlineId);
          console.log("All airline airplanes:", data);
        }
        
        setAirplanes(data);
        
        // If we're in edit mode and there's an airplane_id but no airplanes loaded yet
        if (editMode && initialData?.airplane_id && data.length > 0) {
          // Make sure we have the correct airplane set
          console.log("Setting airplane_id in edit mode:", initialData.airplane_id);
          form.setValue("airplane_id", initialData.airplane_id);
        }
      } catch (error) {
        console.error("Error fetching airplanes:", error);
        toast({
          title: "Error",
          description: "Failed to load airplanes",
          variant: "destructive"
        });
      }
    };
    
    fetchAirplanes();
  }, [watchAirlineId, watchDepartureTime, watchArrivalTime, toast, form, editMode, initialData]);

  // Fetch all gates and runways initially
  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        // Fetch all gates and runways as a fallback
        const [allGates, allRunways] = await Promise.all([
          gateApi.getAll(),
          runwayApi.getAll()
        ]);
        
        setGates(allGates);
        setRunways(allRunways);
        
        // If we're in edit mode, make sure the correct values are set
        if (editMode) {
          if (initialData?.gate_id) {
            console.log("Setting gate_id in edit mode:", initialData.gate_id);
            form.setValue("gate_id", initialData.gate_id);
          }
          
          if (initialData?.runway_id) {
            console.log("Setting runway_id in edit mode:", initialData.runway_id);
            form.setValue("runway_id", initialData.runway_id);
          }
        }
      } catch (error) {
        console.error("Error fetching gates/runways:", error);
        toast({
          title: "Error",
          description: "Failed to load gates and runways",
          variant: "destructive"
        });
      }
    };
    
    fetchAllResources();
  }, [toast, form, editMode, initialData]);

  // Fetch available gates and runways when times are set
  useEffect(() => {
    const fetchAvailableResources = async () => {
      if (!watchDepartureTime || !watchArrivalTime) {
        console.log("Missing times, skipping available resources fetch");
        return;
      }
      
      try {
        // Try to fetch available gates first
        let gatesData: Gate[] = [];
        let runwaysData: Runway[] = [];
        
        try {
          console.log("Fetching available gates with times:", watchDepartureTime, watchArrivalTime);
          gatesData = await gateApi.getAvailable(watchDepartureTime, watchArrivalTime);
          console.log("Available gates:", gatesData);
        } catch (error) {
          console.error("Error fetching available gates, falling back to all gates:", error);
          // Fallback: if the available endpoint fails, fetch all gates
          gatesData = await gateApi.getAll();
          console.log("All gates:", gatesData);
        }
        
        try {
          console.log("Fetching available runways with times:", watchDepartureTime, watchArrivalTime);
          runwaysData = await runwayApi.getAvailable(watchDepartureTime, watchArrivalTime);
          console.log("Available runways:", runwaysData);
        } catch (error) {
          console.error("Error fetching available runways, falling back to all runways:", error);
          // Fallback: if the available endpoint fails, fetch all runways
          runwaysData = await runwayApi.getAll();
          console.log("All runways:", runwaysData);
        }
        
        setGates(gatesData);
        setRunways(runwaysData);
        
        // If we're in edit mode, make sure the correct values are set
        if (editMode) {
          if (initialData?.gate_id && !form.getValues("gate_id")) {
            console.log("Setting gate_id in edit mode:", initialData.gate_id);
            form.setValue("gate_id", initialData.gate_id);
          }
          
          if (initialData?.runway_id && !form.getValues("runway_id")) {
            console.log("Setting runway_id in edit mode:", initialData.runway_id);
            form.setValue("runway_id", initialData.runway_id);
          }
        }
      } catch (error) {
        console.error("Error fetching gates/runways:", error);
        toast({
          title: "Error",
          description: "Failed to load available gates and runways",
          variant: "destructive"
        });
      }
    };
    
    fetchAvailableResources();
  }, [watchDepartureTime, watchArrivalTime, toast, form, editMode, initialData]);

  const onSubmit = async (data: FlightFormValues) => {
    // Improved validation for departure and arrival times
    const departureDate = new Date(data.departure_time);
    const arrivalDate = new Date(data.arrival_time);
    
    // Check if the dates are valid
    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      toast({
        title: "Validation Error",
        description: "Please enter valid dates for departure and arrival",
        variant: "destructive"
      });
      return;
    }
    
    // Compare dates considering same-day flights (comparing timestamps)
    if (departureDate.getTime() >= arrivalDate.getTime()) {
      toast({
        title: "Validation Error",
        description: "Arrival time must be after departure time",
        variant: "destructive"
      });
      return;
    }

    console.log("Submitting flight data:", data);
    setLoading(true);
    
    try {
      let result: Flight;
      
      if (editMode && initialData?.id) {
        // Update existing flight
        console.log("Updating flight:", initialData.id, data);
        result = await flightApi.update(initialData.id, data as Partial<Flight>);
        toast({
          title: "Success",
          description: "Flight updated successfully"
        });
      } else {
        // Create new flight
        console.log("Creating new flight:", data);
        result = await flightApi.create(data as Omit<Flight, "id">);
        form.reset();
        toast({
          title: "Success",
          description: "Flight created successfully"
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Error saving flight:", error);
      toast({
        title: "Error",
        description: "Failed to save flight data. Please check all fields and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Updated function to check if times are valid considering same-day flights
  const areTimesValid = () => {
    const departure = form.getValues("departure_time");
    const arrival = form.getValues("arrival_time");
    
    if (!departure || !arrival) return false;
    
    const departureDate = new Date(departure);
    const arrivalDate = new Date(arrival);
    
    // Check if the dates are valid
    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      return false;
    }
    
    // Return true if departure time is before arrival time (timestamp comparison)
    return departureDate.getTime() < arrivalDate.getTime();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flight Number */}
              <FormField
                control={form.control}
                name="flight_number"
                rules={{ required: "Flight number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FL123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Airline */}
              <FormField
                control={form.control}
                name="airline_id"
                rules={{ required: "Airline is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={user?.role === "airline"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select airline" />
                        </SelectTrigger>
                        <SelectContent>
                          {airlines.map(airline => (
                            <SelectItem key={airline.id} value={airline.id}>
                              {airline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Origin */}
              <FormField
                control={form.control}
                name="origin"
                rules={{ required: "Origin is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Destination */}
              <FormField
                control={form.control}
                name="destination"
                rules={{ required: "Destination is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Departure Time */}
              <FormField
                control={form.control}
                name="departure_time"
                rules={{ required: "Departure time is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Arrival Time */}
              <FormField
                control={form.control}
                name="arrival_time"
                rules={{ required: "Arrival time is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    {watchDepartureTime && watchArrivalTime && !areTimesValid() && (
                      <p className="text-sm text-destructive">Arrival time must be after departure time</p>
                    )}
                  </FormItem>
                )}
              />
              
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={(value: FlightStatus) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="boarding">Boarding</SelectItem>
                          <SelectItem value="departed">Departed</SelectItem>
                          <SelectItem value="in_air">In Air</SelectItem>
                          <SelectItem value="landed">Landed</SelectItem>
                          <SelectItem value="arrived">Arrived</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                rules={{ 
                  required: "Price is required",
                  min: { value: 0, message: "Price cannot be negative" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Airplane */}
              <FormField
                control={form.control}
                name="airplane_id"
                rules={{ required: "Airplane is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airplane</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!watchAirlineId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!watchAirlineId ? "Select airline first" : "Select airplane"} />
                        </SelectTrigger>
                        <SelectContent>
                          {airplanes.map(airplane => (
                            <SelectItem key={airplane.id} value={airplane.id}>
                              {airplane.name} ({airplane.capacity} seats)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {!watchAirlineId 
                        ? "Select an airline first" 
                        : airplanes.length === 0 
                        ? "No available airplanes for this airline" 
                        : ""}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Gate */}
              <FormField
                control={form.control}
                name="gate_id"
                rules={{ required: "Gate is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gate" />
                        </SelectTrigger>
                        <SelectContent>
                          {gates.map(gate => (
                            <SelectItem key={gate.id} value={gate.id}>
                              {gate.name || gate.gate_number} {gate.terminal ? `(Terminal ${gate.terminal})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {gates.length === 0 
                        ? "No gates available. Enter departure/arrival times to see available gates." 
                        : `${gates.length} gates available`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Runway */}
              <FormField
                control={form.control}
                name="runway_id"
                rules={{ required: "Runway is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runway</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select runway" />
                        </SelectTrigger>
                        <SelectContent>
                          {runways.map(runway => (
                            <SelectItem key={runway.id} value={runway.id}>
                              {runway.name || runway.runway_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {runways.length === 0 
                        ? "No runways available. Enter departure/arrival times to see available runways." 
                        : `${runways.length} runways available`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : editMode ? "Update Flight" : "Add Flight"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FlightForm;
