import { useState, useEffect } from "react";
import { Flight, Notification } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { flights, addNotification } from "@/lib/db";
import { notificationApi } from "@/lib/api";

interface NotificationFormProps {
  allowTargetRole?: boolean;
  allowedTargets?: string[];
  flightFilter?: (flight: Flight) => boolean;
  onSendNotification?: (data: any) => Promise<any>;
  onSuccess?: () => void;
}

const NotificationForm = ({ 
  allowTargetRole = false, 
  onSuccess,
  allowedTargets,
  flightFilter,
  onSendNotification
}: NotificationFormProps) => {
  const { user } = useAuth();
  const [targetType, setTargetType] = useState<"all" | "role" | "flight">("all");
  const [targetId, setTargetId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Filter flights based on user role
    if (user?.role === "airline" && (user.airline_id || user.airlineId)) {
      // Airline users can only see their flights
      const airlineFlights = flights.filter(f => 
        (f.airline_id && f.airline_id === (user.airline_id || user.airlineId)) || 
        (f.airline && f.airline === (user.airline_id || user.airlineId))
      );
      
      // Map to the Flight type from types.ts with required properties
      const mappedFlights = airlineFlights.map(f => ({
        id: f.id,
        flight_number: f.flight_number || f.flightNumber || "",
        flightNumber: f.flight_number || f.flightNumber || "",
        airline_id: f.airline_id || f.airline || "",
        airline: f.airline_id || f.airline || "",
        destination: f.destination,
        departure_time: f.departure_time || f.departureTime || "",
        departureTime: f.departure_time || f.departureTime || "",
        arrival_time: f.arrival_time || f.arrivalTime || "",
        arrivalTime: f.arrival_time || f.arrivalTime || "",
        status: f.status as any,
        price: f.price || 0, // Default value since it's required
        origin: f.origin
      }));
      
      setAvailableFlights(mappedFlights as Flight[]);
    } else {
      // Admin and staff can see all flights
      if (flightFilter) {
        const filteredFlights = flights.filter(f => {
          // Map to Flight type for the filter function
          const mappedFlight = {
            id: f.id,
            flight_number: f.flight_number || f.flightNumber || "",
            flightNumber: f.flight_number || f.flightNumber || "",
            airline_id: f.airline_id || f.airline || "",
            airline: f.airline_id || f.airline || "",
            destination: f.destination,
            departure_time: f.departure_time || f.departureTime || "",
            departureTime: f.departure_time || f.departureTime || "",
            arrival_time: f.arrival_time || f.arrivalTime || "",
            arrivalTime: f.arrival_time || f.arrivalTime || "",
            status: f.status as any,
            price: f.price || 0,
            origin: f.origin
          };
          return flightFilter(mappedFlight as Flight);
        });
        
        // Map filtered flights to Flight type
        const mappedFlights = filteredFlights.map(f => ({
          id: f.id,
          flight_number: f.flight_number || f.flightNumber || "",
          flightNumber: f.flight_number || f.flightNumber || "",
          airline_id: f.airline_id || f.airline || "",
          airline: f.airline_id || f.airline || "",
          destination: f.destination,
          departure_time: f.departure_time || f.departureTime || "",
          departureTime: f.departure_time || f.departureTime || "",
          arrival_time: f.arrival_time || f.arrivalTime || "",
          arrivalTime: f.arrival_time || f.arrivalTime || "",
          status: f.status as any,
          price: f.price || 0,
          origin: f.origin
        }));
        
        setAvailableFlights(mappedFlights as Flight[]);
      } else {
        // Map all flights to Flight type
        const mappedFlights = flights.map(f => ({
          id: f.id,
          flight_number: f.flight_number || f.flightNumber || "",
          flightNumber: f.flight_number || f.flightNumber || "",
          airline_id: f.airline_id || f.airline || "",
          airline: f.airline_id || f.airline || "",
          destination: f.destination,
          departure_time: f.departure_time || f.departureTime || "",
          departureTime: f.departure_time || f.departureTime || "",
          arrival_time: f.arrival_time || f.arrivalTime || "",
          arrivalTime: f.arrival_time || f.arrivalTime || "",
          status: f.status as any,
          price: f.price || 0,
          origin: f.origin
        }));
        
        setAvailableFlights(mappedFlights as Flight[]);
      }
    }
  }, [user, flightFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!message.trim()) {
        throw new Error("Message is required");
      }
      
      if (targetType !== "all" && !targetId) {
        throw new Error(`Please select a ${targetType === "role" ? "role" : "flight"}`);
      }
      
      if (!user) {
        throw new Error("You must be logged in to send notifications");
      }
      
      const notificationData = {
        title: `Notification from ${user.role}`,
        message,
        target_role: targetType === "role" ? targetId as "admin" | "staff" | "passenger" | "airline" | "all" : "all",
        flight_id: targetType === "flight" ? targetId : undefined,
      };

      // If there's a custom send handler, use it
      if (onSendNotification) {
        onSendNotification({
          ...notificationData,
          timestamp: new Date().toISOString(),
          sender: {
            id: user.id,
            role: user.role as "admin" | "staff" | "airline",
          },
          targetType,
          targetId: targetType !== "all" ? targetId : undefined,
        }).then(() => {
          setSuccess(true);
          setMessage("");
          setTargetType("all");
          setTargetId("");
          
          if (onSuccess) onSuccess();
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        }).catch(err => {
          setError(err instanceof Error ? err.message : "An error occurred");
        }).finally(() => {
          setLoading(false);
        });
        return;
      }
      
      // Otherwise, use the API directly
      notificationApi.create(notificationData)
        .then(() => {
          setSuccess(true);
          setMessage("");
          setTargetType("all");
          setTargetId("");
          
          if (onSuccess) onSuccess();
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : "An error occurred");
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  // If the user is not authorized to send notifications, don't render the form
  if (user?.role === "passenger") {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your notification message"
          required
          className="min-h-[120px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Send to</Label>
        <RadioGroup 
          value={targetType} 
          onValueChange={(value) => {
            setTargetType(value as "all" | "role" | "flight");
            setTargetId("");
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer">Everyone</Label>
          </div>
          
          {allowTargetRole && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="role" id="role" />
              <Label htmlFor="role" className="cursor-pointer">Specific Role</Label>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flight" id="flight" />
            <Label htmlFor="flight" className="cursor-pointer">Specific Flight</Label>
          </div>
        </RadioGroup>
      </div>
      
      {targetType === "role" && allowTargetRole && (
        <div className="space-y-2">
          <Label htmlFor="roleSelect">Select Role</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger id="roleSelect">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="staff">Airport Staff</SelectItem>
              <SelectItem value="airline">Airline</SelectItem>
              <SelectItem value="passenger">Passenger</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {targetType === "flight" && (
        <div className="space-y-2">
          <Label htmlFor="flightSelect">Select Flight</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger id="flightSelect">
              <SelectValue placeholder="Select a flight" />
            </SelectTrigger>
            <SelectContent>
              {availableFlights.map((flight) => (
                <SelectItem key={flight.id} value={flight.id}>
                  {flight.flight_number || ""} - {flight.origin || "-"} to {flight.destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Send Notification"}
      </Button>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {success && (
        <p className="text-sm text-green-600">Notification sent successfully!</p>
      )}
    </form>
  );
};

export default NotificationForm;
