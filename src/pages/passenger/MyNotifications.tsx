
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifications, flights, reservations } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Check, Filter, Plane, Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MyNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id || "";
  
  // Get user's flight IDs from reservations
  const userReservations = reservations.filter(res => res.userId === userId);
  const userFlightIds = userReservations.map(res => res.flightId);
  
  // Get notifications relevant to user's flights
  const userNotifications = notifications.filter(
    notification => !notification.flightId || userFlightIds.includes(notification.flightId)
  );
  
  // Notification filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Mark as read functionality
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  
  // Apply filters and sorting
  const filteredNotifications = userNotifications.filter(notification => {
    // Apply search
    const matchesSearch = searchTerm
      ? notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Apply filter
    let matchesFilter = true;
    if (filterBy !== "all") {
      matchesFilter = notification.senderRole === filterBy;
    }
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Apply sorting
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications([...readNotifications, id]);
    }
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setReadNotifications([...new Set([...readNotifications, ...allIds])]);
  };
  
  // Get flight details for a notification
  const getFlightForNotification = (notification: typeof notifications[0]) => {
    if (!notification.flightId) return null;
    return flights.find(flight => flight.id === notification.flightId);
  };

  return (
    <PageLayout title="My Notifications">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight Notifications</CardTitle>
            <CardDescription>
              Stay updated with all communications about your flights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Airport Staff</SelectItem>
                    <SelectItem value="airline">Airline</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={sortOrder} 
                  onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={markAllAsRead}
                  className="whitespace-nowrap"
                >
                  <Check className="h-4 w-4 mr-2" />
                  <span>Mark All Read</span>
                </Button>
              </div>
            </div>
            
            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterBy !== "all"
                    ? "No notifications match your search criteria"
                    : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const flight = getFlightForNotification(notification);
                  const isRead = readNotifications.includes(notification.id);
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`overflow-hidden relative ${isRead ? 'bg-muted/50' : 'bg-card'}`}
                    >
                      {!isRead && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full m-2"></div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                              {notification.senderRole.charAt(0).toUpperCase() + notification.senderRole.slice(1)}
                            </Badge>
                            
                            {flight && (
                              <Badge variant="secondary" className="font-normal flex items-center gap-1">
                                <Plane className="h-3 w-3" />
                                <span>{flight.flightNumber}</span>
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          <p className="text-base">{notification.message}</p>
                        </div>
                        
                        {flight && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Flight: {flight.origin} → {flight.destination} | Departure: {new Date(flight.departureTime).toLocaleString()}
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Delete</span>
                          </Button>
                          
                          {!isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              <span>Mark as Read</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MyNotifications;
