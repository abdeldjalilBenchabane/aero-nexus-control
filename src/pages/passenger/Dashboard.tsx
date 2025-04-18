import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { flights, Flight, notifications, reservations } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, LuggageIcon, AlertTriangle, Bell, Calendar, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PassengerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userId = user?.id || "";
  
  const userReservations = reservations.filter(res => res.userId === userId);
  
  const userFlightIds = userReservations.map(res => res.flightId);
  const userFlights = flights.filter(flight => userFlightIds.includes(flight.id));
  
  const now = new Date();
  const upcomingFlights = userFlights.filter(flight => new Date(flight.departureTime) > now);
  const pastFlights = userFlights.filter(flight => new Date(flight.departureTime) <= now);
  
  const userNotifications = notifications.filter(
    notification => notification.flight_id && userFlightIds.includes(notification.flight_id)
  ).slice(0, 5);
  
  const hasDelayedFlights = userFlights.some(flight => flight.status === 'delayed' || flight.status === 'cancelled');

  return (
    <PageLayout title="Passenger Dashboard">
      <div className="space-y-6">
        {hasDelayedFlights && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Flight Status Alert</AlertTitle>
            <AlertDescription>
              You have delayed or cancelled flights. Please check your flight status.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5" />
                <span>Your Upcoming Flights</span>
              </CardTitle>
              <CardDescription>
                {upcomingFlights.length} upcoming flights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingFlights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any upcoming flights</p>
                  <Button onClick={() => navigate('/passenger/search-flights')}>
                    Search for Flights
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingFlights.map((flight) => (
                    <Card key={flight.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="bg-primary/10 p-4 flex flex-col justify-center items-center sm:w-1/4">
                          <div className="text-2xl font-bold">{flight.flightNumber}</div>
                          <div className="text-sm text-muted-foreground">{flight.airline}</div>
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
                            <Badge 
                              className={getStatusBadgeClass(flight.status)}
                            >
                              {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
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
            {upcomingFlights.length > 0 && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/passenger/my-reservations')}
                >
                  View All Reservations
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Recent Notifications</span>
              </CardTitle>
              <CardDescription>
                Updates about your flights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userNotifications.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No recent notifications
                </p>
              ) : (
                <div className="space-y-4">
                  {userNotifications.map((notification, index) => {
                    const relatedFlight = flights.find(f => f.id === notification.flight_id);
                    
                    return (
                      <Alert key={index} className="bg-muted">
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <AlertTitle className="flex items-center gap-2">
                              {relatedFlight && (
                                <Badge variant="outline" className="font-normal">
                                  {relatedFlight.flight_number}
                                </Badge>
                              )}
                              <span>
                                {notification.user_role ? (notification.user_role.charAt(0).toUpperCase() + notification.user_role.slice(1)) : 'System'} Message
                              </span>
                            </AlertTitle>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at || notification.timestamp || '').toLocaleString()}
                            </span>
                          </div>
                          <AlertDescription>
                            {notification.message}
                          </AlertDescription>
                        </div>
                      </Alert>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/passenger/my-notifications')}
              >
                View All Notifications
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Common tasks for passengers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/passenger/search-flights')}
                >
                  <PlaneTakeoff className="mr-2 h-4 w-4" />
                  <span>Search for Flights</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/passenger/my-reservations')}
                >
                  <LuggageIcon className="mr-2 h-4 w-4" />
                  <span>Manage My Reservations</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/passenger/my-notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>View All Notifications</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

function getFlightDuration(flight: Flight): string {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function getStatusBadgeClass(status: Flight["status"]): string {
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

export default PassengerDashboard;
