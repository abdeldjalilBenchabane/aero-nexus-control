
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { flightApi } from "@/lib/api";
import { Flight } from "@/lib/types";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plane, Calendar, Clock, ArrowRight } from "lucide-react";

const PassengerFlightDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFlightDetails(id);
    }
  }, [id]);

  const fetchFlightDetails = async (flightId: string) => {
    try {
      setLoading(true);
      const flightData = await flightApi.getById(flightId);
      setFlight(flightData);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      toast({
        title: "Error",
        description: "Could not load flight details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSeat = () => {
    if (flight) {
      navigate(`/passenger/reserve-seat?flightId=${flight.id}`);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "boarding": return "bg-yellow-500";
      case "departed": return "bg-purple-500";
      case "in_air": return "bg-indigo-500";
      case "landed": return "bg-green-700";
      case "arrived": return "bg-green-500";
      case "completed": return "bg-green-900";
      case "delayed": return "bg-orange-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <PageLayout title="Flight Details">
        <div className="flex items-center justify-center h-64">
          <p>Loading flight details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!flight) {
    return (
      <PageLayout title="Flight Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Flight not found</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Flight Details">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Plane className="h-6 w-6" />
                <span>{flight.flight_number || flight.flightNumber}</span>
              </CardTitle>
              <Badge className={getStatusBadgeClass(flight.status)}>
                {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace("_", " ")}
              </Badge>
            </div>
            <CardDescription>
              {flight.airline_name || flight.airlineName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4 md:mb-0">
                <div>
                  <div className="text-2xl font-semibold">{flight.origin}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateTime(flight.departure_time || flight.departureTime || "")}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground my-1" />
                </div>
                
                <div>
                  <div className="text-2xl font-semibold">{flight.destination}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(flight.arrival_time || flight.arrivalTime || "")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleReserveSeat}
              disabled={flight.status === "cancelled" || flight.status === "completed" || flight.status === "departed" || flight.status === "in_air" || flight.status === "landed" || flight.status === "arrived"}
              className="w-full"
            >
              Reserve a Seat
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flight Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Airline</p>
                <p>{flight.airline_name || flight.airlineName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flight Number</p>
                <p>{flight.flight_number || flight.flightNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusBadgeClass(flight.status)}>
                  {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gate</p>
                <p>{flight.gate_number || flight.gate_id || flight.gate || "Not assigned yet"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PassengerFlightDetails;
