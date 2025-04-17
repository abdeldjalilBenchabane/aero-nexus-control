
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { flights, gates } from "@/lib/db";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const [flightData, setFlightData] = useState([]);
  const [gatesData, setGatesData] = useState([]);

  useEffect(() => {
    // Prepare flight data for the bar chart
    const statusCounts = flights.reduce((acc, flight) => {
      acc[flight.status] = (acc[flight.status] || 0) + 1;
      return acc;
    }, {});

    const flightData = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status],
    }));
    setFlightData(flightData);

    // Prepare gates data for the pie chart
    const gatesData = gates.map(gate => ({
      name: gate.name || gate.gate_number,
      scheduledFlights: typeof gate.scheduledFlights === 'number' ? gate.scheduledFlights : 0,
    }));
    setGatesData(gatesData);
  }, []);

  return (
    <PageLayout title="Reports and Statistics">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Status Overview</CardTitle>
            <CardDescription>Distribution of flight statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gate Utilization Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gate Utilization</CardTitle>
            <CardDescription>Scheduled flights per gate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="scheduledFlights"
                  isAnimationActive={false}
                  data={gatesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {gatesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;
