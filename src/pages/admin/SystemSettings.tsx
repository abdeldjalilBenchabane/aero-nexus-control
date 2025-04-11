
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Save, Shield, Database, Server, Bell, RefreshCw } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const SystemSettings = () => {
  // General Settings state
  const [systemName, setSystemName] = useState("AeroNexus Control");
  const [timeZone, setTimeZone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Security Settings state
  const [passwordPolicy, setPasswordPolicy] = useState("medium");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(false);
  
  // Notification Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationDelay, setNotificationDelay] = useState("0");
  
  // Backup Settings state
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [backupRetention, setBackupRetention] = useState("30");
  
  const saveSettings = (settingType: string) => {
    console.log(`Saving ${settingType} settings...`);
    // In a real app, this would save the settings to the database
  };

  const runBackup = () => {
    console.log("Running manual backup...");
    // In a real app, this would initiate a backup
  };

  return (
    <PageLayout title="System Settings">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Default Time Zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timeZone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                      <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only administrators can access the system
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("general")} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                    <SelectTrigger id="passwordPolicy">
                      <SelectValue placeholder="Select password policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (minimum 6 characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case, numbers)</SelectItem>
                      <SelectItem value="high">High (10+ chars, special chars, numbers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="1440"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all admin accounts
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipRestriction">IP Restriction</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit access to predefined IP addresses
                    </p>
                  </div>
                  <Switch
                    id="ipRestriction"
                    checked={ipRestriction}
                    onCheckedChange={setIpRestriction}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("security")} className="ml-auto">
                  <Shield className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how notifications are delivered throughout the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS (text message)
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via browser/app push
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="notificationDelay">
                    Notification Delay (minutes, 0 for immediate)
                  </Label>
                  <Input
                    id="notificationDelay"
                    type="number"
                    min="0"
                    max="60"
                    value={notificationDelay}
                    onChange={(e) => setNotificationDelay(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Delay between event and notification delivery
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("notifications")} className="ml-auto">
                  <Bell className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>
                  Configure system backup and data recovery options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoBackup">Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup system data
                    </p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                
                {autoBackup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger id="backupFrequency">
                          <SelectValue placeholder="Select backup frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backupRetention">
                        Backup Retention (days)
                      </Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        min="1"
                        max="365"
                        value={backupRetention}
                        onChange={(e) => setBackupRetention(e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">Manual Backup</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a backup of the current system data
                      </p>
                    </div>
                    <Button onClick={runBackup} variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Run Backup Now
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">System Restore</h4>
                      <p className="text-sm text-muted-foreground">
                        Restore system from a previous backup
                      </p>
                    </div>
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restore System
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center p-4 rounded-md bg-yellow-50 border border-yellow-200">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Important:</p>
                    <p>Always test backups regularly. System restores will replace all current data.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings("backup")} className="ml-auto">
                  <Server className="mr-2 h-4 w-4" />
                  Save Backup Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SystemSettings;
