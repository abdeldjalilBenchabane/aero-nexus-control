
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, PlaneTakeoff, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import StatisticsCard from "@/components/StatisticsCard";
import NotificationList from "@/components/NotificationList";
import FlightTable from "@/components/FlightTable";
import { flights, gates, runways, Flight } from "@/lib/db";

const StaffDashboard = () => {
  const [todayFlights, setTodayFlights] = useState<Flight[]>([]);
  
  useEffect(() => {
    // Get today's flights
    const today = new Date();
    const filteredFlights = flights.filter(flight => {
      const departureDate = new Date(flight.departureTime);
      return departureDate.getDate() === today.getDate() &&
             departureDate.getMonth() === today.getMonth() &&
             departureDate.getFullYear() === today.getFullYear();
    });
    
    setTodayFlights(filteredFlights);
  }, []);

  // Calculate statistics
  const scheduledFlights = flights.filter(f => f.status === "scheduled").length;
  const delayedFlights = flights.filter(f => f.status === "delayed").length;
  const availableGates = gates.filter(g => g.isAvailable).length;
  const availableRunways = runways.filter(r => r.isAvailable).length;

  return (
    <PageLayout title="Staff Dashboard">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Scheduled Flights"
            value={scheduledFlights}
            icon={<PlaneTakeoff className="h-6 w-6 text-primary" />}
          />
          <StatisticsCard
            title="Delayed Flights"
            value={delayedFlights}
            icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
            trend={delayedFlights > 0 ? "up" : "neutral"}
            trendValue={delayedFlights > 0 ? `${delayedFlights} flights affected` : "No delays"}
          />
          <StatisticsCard
            title="Available Gates"
            value={availableGates}
            icon={<MapPin className="h-6 w-6 text-green-500" />}
            trend="neutral"
            trendValue={`${gates.length - availableGates} in use`}
          />
          <StatisticsCard
            title="Available Runways"
            value={availableRunways}
            icon={<Clock className="h-6 w-6 text-blue-500" />}
            trend="neutral"
            trendValue={`${runways.length - availableRunways} in use`}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Flights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Flights</CardTitle>
              <CardDescription>
                All flights scheduled for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlightTable 
                flights={todayFlights} 
                searchable={true}
                filterable={true}
                actions={[
                  {
                    label: "Details",
                    onClick: (flight) => console.log("View details for flight", flight.id),
                    variant: "outline"
                  },
                  {
                    label: "Manage",
                    onClick: (flight) => console.log("Manage flight", flight.id),
                    variant: "default"
                  }
                ]}
                emptyMessage="No flights scheduled for today" 
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Stay up to date with the latest alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList limit={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default StaffDashboard;
