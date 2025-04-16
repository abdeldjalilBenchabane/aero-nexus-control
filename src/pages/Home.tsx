
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlaneTakeoff, Ticket, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Button onClick={() => navigate("/login")}>Get Started</Button>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
        <img 
          src="/images/airport-terminal.jpg"
          alt="Airport Terminal" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to Airport Management System
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Your comprehensive solution for flight management, booking, and real-time updates
            </p>
            <Button size="lg" onClick={() => navigate("/login")}>
              Get Started
            </Button>
          </div>
        </div>
      </section>
      
      {/* Flight search section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-4xl mx-auto -mt-20 z-30 relative shadow-lg">
            <CardContent className="p-6">
              <Tabs defaultValue="flights">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="flights">
                    <PlaneTakeoff className="mr-2 h-4 w-4" />
                    <span>Find Flights</span>
                  </TabsTrigger>
                  <TabsTrigger value="status">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Flight Status</span>
                  </TabsTrigger>
                  <TabsTrigger value="booking">
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>Manage Booking</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="flights">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">From</label>
                        <Input placeholder="Origin Airport" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">To</label>
                        <Input placeholder="Destination Airport" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Departure Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Passengers</label>
                        <Select defaultValue="1">
                          <SelectTrigger>
                            <SelectValue placeholder="Select passengers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Passenger</SelectItem>
                            <SelectItem value="2">2 Passengers</SelectItem>
                            <SelectItem value="3">3 Passengers</SelectItem>
                            <SelectItem value="4">4 Passengers</SelectItem>
                            <SelectItem value="5">5+ Passengers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Class</label>
                        <Select defaultValue="economy">
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="premium">Premium Economy</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="first">First Class</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="lg" onClick={() => navigate("/login")}>
                      Search Flights
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="status">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Flight Number</label>
                      <Input placeholder="Enter flight number" />
                    </div>
                    
                    <Button className="w-full" onClick={() => navigate("/login")}>
                      Check Status
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="booking">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Booking Reference</label>
                      <Input placeholder="Enter booking reference" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Last Name</label>
                      <Input placeholder="Enter last name" />
                    </div>
                    
                    <Button className="w-full" onClick={() => navigate("/login")}>
                      Find Booking
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-primary">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlaneTakeoff className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Flight Management</h3>
                <p className="text-gray-600">
                  Comprehensive flight scheduling, gate management, and runway allocation
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-primary">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reservation System</h3>
                <p className="text-gray-600">
                  Easy booking and management of flight reservations with real-time seat availability
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-primary">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">
                  Instant notifications for flight changes, delays, and important announcements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Image section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Modern Airport Experience</h2>
              <p className="text-gray-600 mb-6">
                Our airport management system provides a seamless experience for both passengers and staff.
                With state-of-the-art technology, we ensure efficient operations and exceptional service.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Efficient check-in and boarding processes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Real-time flight tracking and updates</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Optimized gate and runway management</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Comprehensive reservation and rebooking services</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img 
                src="/images/runway.jpg"
                alt="Airport Runway" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our airport management system today and experience the benefits of our comprehensive solution.
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => navigate("/login")}
          >
            Sign Up Now
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Airport Management</h3>
              <p className="mb-4">
                Your comprehensive solution for airport and flight management.
              </p>
            </div>
            
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Flight Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Booking Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Contact</h4>
              <address className="not-italic">
                <p>123 Airport Road</p>
                <p>Cityville, State 12345</p>
                <p className="mt-2">Email: info@airport.com</p>
                <p>Phone: (123) 456-7890</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Airport Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
