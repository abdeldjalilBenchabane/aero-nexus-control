
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, Check, Filter, Plane, Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NotificationList from "@/components/NotificationList";

const MyNotifications = () => {
  const { user } = useAuth();
  
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
            <NotificationList 
              showIcon={true}
              showControls={true}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MyNotifications;
