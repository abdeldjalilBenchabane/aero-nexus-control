
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { flights } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import NotificationForm from "@/components/NotificationForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const PassengerNotify = () => {
  const { user } = useAuth();
  // Use fallback for airlineId
  const airlineCompany = user?.airlineId || user?.id || "Unknown Airline";
  
  // Filter flights that belong to this airline
  const airlineFlights = flights.filter(flight => flight.airline_id === airlineCompany || flight.airline === airlineCompany);

  return (
    <PageLayout title="Notify Passengers">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Send Notifications to Passengers</CardTitle>
            <CardDescription>
              Notify passengers on your flights about important updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Notification Policy</AlertTitle>
              <AlertDescription>
                Notifications will only be sent to passengers booked on the selected flight.
                Please ensure all communication is clear and relevant to the flight.
              </AlertDescription>
            </Alert>
            
            <NotificationForm 
              allowedTargets={["flight"]}
              flightFilter={(flight) => flight.airline_id === airlineCompany || flight.airline === airlineCompany}
              onSendNotification={(data) => {
                console.log("Sending airline notification:", data);
                return new Promise((resolve) => {
                  // Simulate API call
                  setTimeout(() => {
                    resolve({ success: true });
                  }, 1500);
                });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PassengerNotify;
