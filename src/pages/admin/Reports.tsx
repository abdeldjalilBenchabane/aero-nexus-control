
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, LineChart, PieChart } from "lucide-react";
import { flights, gates, runways } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  Line
} from "recharts";

const Reports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "week" | "month" | "year">("month");

  // Calculate statistics for flights
  const flightStatsByStatus = [
    { name: "Scheduled", value: flights.filter(f => f.status === "scheduled").length },
    { name: "Boarding", value: flights.filter(f => f.status === "boarding").length },
    { name: "Departed", value: flights.filter(f => f.status === "departed").length },
    { name: "Arrived", value: flights.filter(f => f.status === "arrived").length },
    { name: "Delayed", value: flights.filter(f => f.status === "delayed").length },
    { name: "Cancelled", value: flights.filter(f => f.status === "cancelled").length }
  ];

  // Calculate gate utilization
  const gateUtilization = gates.map(gate => ({
    name: gate.name,
    value: gate.scheduledFlights.length
  }));

  // Generate mock data for passengers over time
  const generatePassengerData = () => {
    // In a real app, this would come from the database
    const data = [];
    const daysInPeriod = selectedTimeframe === "day" ? 24 : 
                        selectedTimeframe === "week" ? 7 : 
                        selectedTimeframe === "month" ? 30 : 12;
    
    const periodLabel = selectedTimeframe === "day" ? "Hour" : 
                       selectedTimeframe === "week" ? "Day" : 
                       selectedTimeframe === "month" ? "Day" : "Month";
    
    for (let i = 1; i <= daysInPeriod; i++) {
      data.push({
        name: `${periodLabel} ${i}`,
        passengers: Math.floor(Math.random() * 500) + 100,
        flights: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return data;
  };

  const passengerData = generatePassengerData();

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#d88489'];

  const exportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`);
    // In a real app, this would generate and download a report
  };

  return (
    <PageLayout title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs 
            value={selectedTimeframe} 
            onValueChange={(value) => setSelectedTimeframe(value as any)}
            className="w-full"
          >
            <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:grid-cols-4">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flight Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Flight Status Distribution</CardTitle>
              <CardDescription>Breakdown of flights by current status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={flightStatsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {flightStatsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gate Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Gate Utilization</CardTitle>
              <CardDescription>Number of flights assigned to each gate</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gateUtilization}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Flights" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Passenger Traffic Over Time */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Passenger Traffic</CardTitle>
                <CardDescription>
                  Number of passengers and flights over {selectedTimeframe}
                </CardDescription>
              </div>
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => exportReport("passenger-traffic")}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart
                  data={passengerData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="passengers"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="flights" stroke="#82ca9d" />
                </RLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Generate and download detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => exportReport("flight-summary")}
              >
                <BarChart2 className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Flight Summary</div>
                  <div className="text-xs text-muted-foreground">Comprehensive flight statistics</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => exportReport("passenger-analytics")}
              >
                <LineChart className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Passenger Analytics</div>
                  <div className="text-xs text-muted-foreground">Passenger trends and patterns</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => exportReport("resource-usage")}
              >
                <PieChart className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Resource Usage</div>
                  <div className="text-xs text-muted-foreground">Gate and runway utilization</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;
