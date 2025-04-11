
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flights } from "@/lib/db";
import NotificationForm from "@/components/NotificationForm";

const SendNotification = () => {
  const [selectedFlight, setSelectedFlight] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendNotification = () => {
    if (!selectedFlight || !message.trim()) return;
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Sending notification:", {
        flightId: selectedFlight,
        message,
        senderRole: "staff",
        timestamp: new Date().toISOString()
      });
      
      setIsSending(false);
      setSentSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setMessage("");
        setSentSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <PageLayout title="Send Passenger Notifications">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Notify Passengers</CardTitle>
            <CardDescription>
              Send notifications to passengers of a specific flight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <NotificationForm 
                allowedTargets={["flight"]}
                onSendNotification={(data) => {
                  console.log("Sending staff notification:", data);
                  return new Promise((resolve) => {
                    // Simulate API call
                    setTimeout(() => {
                      resolve({ success: true });
                    }, 1500);
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SendNotification;
