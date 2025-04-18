
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { notificationApi, flightApi } from "@/lib/api";
import { Notification, Flight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellRing, Megaphone, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AirlineNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    flight_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch notifications for the current airline
      const notificationData = await notificationApi.getForUser(user!.id);
      setNotifications(notificationData);

      // Fetch flights for this airline
      const flightData = await flightApi.getByAirline(user!.id);
      setFlights(flightData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFlightChange = (value: string) => {
    setFormData(prev => ({ ...prev, flight_id: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const notification = {
        title: formData.title,
        message: formData.message,
        target_role: "passenger",
        flight_id: formData.flight_id || undefined
      };

      await notificationApi.create(notification);
      
      toast({
        title: "Success",
        description: "Notification sent successfully"
      });
      
      // Reset form and refresh data
      setFormData({
        title: "",
        message: "",
        flight_id: "",
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  return (
    <PageLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Airline Notifications</h2>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            {showForm ? "Cancel" : (
              <>
                <Plus size={16} />
                <span>New Notification</span>
              </>
            )}
          </Button>
        </div>

        {/* Notification Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
              <CardDescription>
                Send a notification to passengers
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Flight Update"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message to passengers..."
                    required
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flight_id">Flight (Optional)</Label>
                  <Select value={formData.flight_id} onValueChange={handleFlightChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flight (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General notification (no flight)</SelectItem>
                      {flights.map(flight => (
                        <SelectItem key={flight.id} value={flight.id}>
                          {flight.flight_number} - {flight.origin} to {flight.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Send Notification</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Notifications</h3>
          
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 border rounded-md bg-gray-50">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new notification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.map(notification => {
                const relatedFlight = flights.find(f => f.id === notification.flight_id);
                
                return (
                  <Card key={notification.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <BellRing className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>
                        Sent: {formatDate(notification.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notification.message}</p>
                      
                      {relatedFlight && (
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <p>Flight: {relatedFlight.flight_number}</p>
                          <p>Route: {relatedFlight.origin} → {relatedFlight.destination}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AirlineNotifications;
