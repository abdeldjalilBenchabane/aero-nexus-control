import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { flights, notifications, Flight } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatisticsCard from "@/components/StatisticsCard";
import FlightTable from "@/components/FlightTable";
import { Plane, Users, Clock, AlertTriangle, CheckCircle, Bell } from "lucide-react";

const AirlineDashboard = () => {
  const { user } = useAuth();
  const airlineCompany = user?.airlineId || user?.id || "Unknown Airline";
  
  const airlineFlights = flights.filter(flight => flight.airline === airlineCompany);
  
  const totalFlights = airlineFlights.length;
  const activeFlights = airlineFlights.filter(flight => 
    ["scheduled", "boarding", "departed"].includes(flight.status)
  ).length;
  const delayedFlights = airlineFlights.filter(flight => flight.status === "delayed").length;
  const completedFlights = airlineFlights.filter(flight => flight.status === "arrived").length;
  
  const flightIds = airlineFlights.map(flight => flight.id);
  const relevantNotifications = notifications.filter(
    notification => notification.flightId && flightIds.includes(notification.flightId)
  ).slice(0, 5);
  
  const today = new Date();
  const todayFlights = airlineFlights.filter(flight => {
    const flightDate = new Date(flight.departureTime);
    return (
      flightDate.getDate() === today.getDate() &&
      flightDate.getMonth() === today.getMonth() &&
      flightDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <PageLayout title={`${airlineCompany} Dashboard`}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard 
            title="Total Flights"
            value={totalFlights.toString()}
            icon={<Plane className="h-4 w-4" />}
            description="All flights managed by your airline"
          />
          <StatisticsCard 
            title="Active Flights"
            value={activeFlights.toString()}
            icon={<Clock className="h-4 w-4" />}
            description="Flights in progress or scheduled today"
          />
          <StatisticsCard 
            title="Delayed Flights"
            value={delayedFlights.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            description="Flights currently experiencing delays"
            trending={delayedFlights > 2 ? "negative" : "neutral"}
          />
          <StatisticsCard 
            title="Completed Flights"
            value={completedFlights.toString()}
            icon={<CheckCircle className="h-4 w-4" />}
            description="Successfully arrived flights"
            trending="positive"
          />
        </div>
        
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Today's Flights</TabsTrigger>
            <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Flight Schedule</CardTitle>
                <CardDescription>
                  {todayFlights.length} flights scheduled for {today.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlightTable 
                  flights={todayFlights}
                  emptyMessage="No flights scheduled for today"
                  searchable={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Recent messages about your flights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relevantNotifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent notifications for your flights
                  </p>
                ) : (
                  relevantNotifications.map((notification, index) => {
                    const relatedFlight = flights.find(f => f.id === notification.flightId);
                    
                    return (
                      <Alert key={index}>
                        <Bell className="h-4 w-4" />
                        <AlertTitle className="flex justify-between">
                          <span>
                            {relatedFlight ? relatedFlight.flightNumber : "General Notice"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </AlertTitle>
                        <AlertDescription>
                          {notification.message}
                        </AlertDescription>
                      </Alert>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AirlineDashboard;
