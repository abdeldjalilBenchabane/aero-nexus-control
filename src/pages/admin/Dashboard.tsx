
import { BarChart, Clock, PlaneTakeoff, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import StatisticsCard from "@/components/StatisticsCard";
import NotificationList from "@/components/NotificationList";
import { flights, notifications, users } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightTable from "@/components/FlightTable";

const AdminDashboard = () => {
  // Calculate statistics
  const totalFlights = flights.length;
  const activeFlights = flights.filter(f => 
    f.status === "scheduled" || f.status === "boarding" || f.status === "departed"
  ).length;
  const totalUsers = users.length;
  const totalNotifications = notifications.length;

  // Get scheduled flights for today
  const today = new Date();
  const todaysFlights = flights.filter(flight => {
    const departureDate = new Date(flight.departureTime);
    return departureDate.getDate() === today.getDate() &&
           departureDate.getMonth() === today.getMonth() &&
           departureDate.getFullYear() === today.getFullYear();
  });

  return (
    <PageLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Total Flights"
            value={totalFlights}
            icon={<PlaneTakeoff className="h-6 w-6 text-primary" />}
            trend="up"
            trendValue="12% from last month"
          />
          <StatisticsCard
            title="Active Flights"
            value={activeFlights}
            icon={<Clock className="h-6 w-6 text-primary" />}
            trend="neutral"
            trendValue="Same as yesterday"
          />
          <StatisticsCard
            title="Registered Users"
            value={totalUsers}
            icon={<Users className="h-6 w-6 text-primary" />}
            trend="up"
            trendValue="5% from last week"
          />
          <StatisticsCard
            title="Notifications Sent"
            value={totalNotifications}
            icon={<BarChart className="h-6 w-6 text-primary" />}
            trend="up"
            trendValue="23% from last month"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Flights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Flights</CardTitle>
              <CardDescription>
                Overview of all flights scheduled for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="boarding">Boarding</TabsTrigger>
                  <TabsTrigger value="delayed">Delayed</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <FlightTable 
                    flights={todaysFlights} 
                    emptyMessage="No flights scheduled for today" 
                  />
                </TabsContent>
                <TabsContent value="scheduled">
                  <FlightTable 
                    flights={todaysFlights.filter(f => f.status === "scheduled")} 
                    emptyMessage="No scheduled flights for today" 
                  />
                </TabsContent>
                <TabsContent value="boarding">
                  <FlightTable 
                    flights={todaysFlights.filter(f => f.status === "boarding")} 
                    emptyMessage="No flights currently boarding" 
                  />
                </TabsContent>
                <TabsContent value="delayed">
                  <FlightTable 
                    flights={todaysFlights.filter(f => f.status === "delayed")} 
                    emptyMessage="No delayed flights today" 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest updates and announcements
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

export default AdminDashboard;
