import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flights, Flight } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import FlightTable from "@/components/FlightTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Clock, Send, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DelayManager = () => {
  const { user } = useAuth();
  const airlineCompany = user?.airline_id || user?.id || "Unknown Airline";
  
  const airlineFlights = flights.filter(flight => flight.airline_id === airlineCompany);
  
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isDelayDialogOpen, setIsDelayDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [delayDuration, setDelayDuration] = useState("60");
  const [cancelReason, setCancelReason] = useState("");
  const [notifyPassengers, setNotifyPassengers] = useState(true);
  
  const activeFlights = airlineFlights.filter(flight => 
    flight.status !== "arrived" && flight.status !== "cancelled"
  );
  
  const handleDelaySubmit = () => {
    if (!selectedFlight) return;
    
    console.log('Delaying flight:', {
      flight: selectedFlight.flightNumber,
      reason: delayReason,
      duration: delayDuration,
      notifyPassengers
    });
    
    setIsDelayDialogOpen(false);
    setDelayReason("");
    setDelayDuration("60");
    setNotifyPassengers(true);
  };
  
  const handleCancelSubmit = () => {
    if (!selectedFlight) return;
    
    console.log('Cancelling flight:', {
      flight: selectedFlight.flightNumber,
      reason: cancelReason,
      notifyPassengers
    });
    
    setIsCancelDialogOpen(false);
    setCancelReason("");
    setNotifyPassengers(true);
  };

  return (
    <PageLayout title="Delay Manager">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Flight Delays & Cancellations</CardTitle>
            <CardDescription>
              Update flight status and notify passengers of changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Delayed or cancelled flights require passenger notification. These notifications will be 
                automatically sent to all affected passengers.
              </AlertDescription>
            </Alert>
            
            <FlightTable 
              flights={activeFlights}
              searchable={true}
              filterable={true}
              emptyMessage="No active flights found"
              actions={[
                {
                  label: "Delay",
                  onClick: (flight) => {
                    setSelectedFlight(flight);
                    setIsDelayDialogOpen(true);
                  },
                  variant: "outline"
                },
                {
                  label: "Cancel",
                  onClick: (flight) => {
                    setSelectedFlight(flight);
                    setIsCancelDialogOpen(true);
                  },
                  variant: "destructive"
                }
              ]}
            />
          </CardContent>
        </Card>
        
        <Dialog open={isDelayDialogOpen} onOpenChange={setIsDelayDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Delay Flight {selectedFlight?.flightNumber}</DialogTitle>
              <DialogDescription>
                Set delay duration and provide information for passengers
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delayDuration">Delay Duration (minutes)</Label>
                <Input
                  id="delayDuration"
                  type="number"
                  min="10"
                  value={delayDuration}
                  onChange={(e) => setDelayDuration(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delayReason">Reason for Delay</Label>
                <Select defaultValue="weather" onValueChange={(value) => {
                  const reasons: Record<string, string> = {
                    weather: "Adverse weather conditions",
                    technical: "Technical issues requiring maintenance",
                    operational: "Operational constraints",
                    airTraffic: "Air traffic congestion",
                    custom: ""
                  };
                  setDelayReason(reasons[value] || "");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weather">Weather Conditions</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="operational">Operational Constraints</SelectItem>
                    <SelectItem value="airTraffic">Air Traffic Congestion</SelectItem>
                    <SelectItem value="custom">Custom Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delayMessage">Message for Passengers</Label>
                <Textarea
                  id="delayMessage"
                  placeholder="Provide details about the delay..."
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDelayDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDelaySubmit} className="gap-2">
                <Clock className="h-4 w-4" />
                <span>Confirm Delay</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancel Flight {selectedFlight?.flightNumber}</DialogTitle>
              <DialogDescription>
                This will cancel the flight and notify all passengers
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason for Cancellation</Label>
                <Select defaultValue="weather" onValueChange={(value) => {
                  const reasons: Record<string, string> = {
                    weather: "Flight cancelled due to severe weather conditions",
                    technical: "Flight cancelled due to technical issues with the aircraft",
                    operational: "Flight cancelled due to operational constraints",
                    lowBooking: "Flight cancelled due to insufficient bookings",
                    custom: ""
                  };
                  setCancelReason(reasons[value] || "");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weather">Weather Conditions</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="operational">Operational Constraints</SelectItem>
                    <SelectItem value="lowBooking">Low Booking</SelectItem>
                    <SelectItem value="custom">Custom Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancelMessage">Message for Passengers</Label>
                <Textarea
                  id="cancelMessage"
                  placeholder="Provide details about the cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCancelSubmit} className="gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Confirm Cancellation</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default DelayManager;
