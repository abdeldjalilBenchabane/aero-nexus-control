
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import NotificationForm from "@/components/NotificationForm";
import NotificationList from "@/components/NotificationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SendNotification = () => {
  return (
    <PageLayout title="Send Notifications">
      <div className="space-y-6">
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Send New Notification</CardTitle>
                  <CardDescription>
                    Compose and send a notification to users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationForm allowTargetRole={true} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recipients Overview</CardTitle>
                  <CardDescription>
                    Information about notification recipients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Target "Everyone"</h3>
                    <p className="text-sm text-muted-foreground">
                      Notification will be sent to all users in the system, regardless of their role.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Target "Specific Role"</h3>
                    <p className="text-sm text-muted-foreground">
                      Notification will only be sent to users with the selected role (e.g., all staff members).
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Target "Specific Flight"</h3>
                    <p className="text-sm text-muted-foreground">
                      Notification will only be sent to passengers booked on the selected flight.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>
                  Previously sent notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SendNotification;
