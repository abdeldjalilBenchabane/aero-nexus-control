
import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightTable from "@/components/FlightTable";
import FlightForm from "@/components/FlightForm";
import { flightApi } from "@/lib/api";
import type { Flight } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

const ManageFlights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [isAddFlightOpen, setIsAddFlightOpen] = useState(false);
  const [isEditFlightOpen, setIsEditFlightOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await flightApi.getAll();
      setFlights(data);
      setFilteredFlights(data);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast({
        title: "Error",
        description: "Failed to load flights. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredFlights(flights);
    } else {
      const filtered = flights.filter(flight => 
        (flight.flight_number?.toLowerCase().includes(term) || false) ||
        (flight.airline_name?.toLowerCase().includes(term) || false) ||
        (flight.origin?.toLowerCase().includes(term) || false) ||
        flight.destination.toLowerCase().includes(term) ||
        flight.status.toLowerCase().includes(term)
      );
      setFilteredFlights(filtered);
    }
  };

  const handleDeleteFlight = async (flight: Flight) => {
    if (!window.confirm(`Are you sure you want to delete flight ${flight.flight_number}?`)) {
      return;
    }

    try {
      await flightApi.delete(flight.id);
      
      toast({
        title: "Success",
        description: "Flight deleted successfully"
      });
      
      // Refresh flights list
      fetchFlights();
    } catch (error) {
      console.error("Error deleting flight:", error);
      toast({
        title: "Error",
        description: "Failed to delete flight. It may have reservations.",
        variant: "destructive"
      });
    }
  };

  const handleEditFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsEditFlightOpen(true);
  };

  const handleFlightCreated = (flight: Flight) => {
    setIsAddFlightOpen(false);
    fetchFlights();
  };

  const handleFlightUpdated = (flight: Flight) => {
    setIsEditFlightOpen(false);
    setSelectedFlight(null);
    fetchFlights();
  };

  return (
    <PageLayout title="Flight Management">
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="manage">Manage Flights</TabsTrigger>
          <TabsTrigger value="add">Add New Flight</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flights..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 max-w-sm"
              />
            </div>
            
            <Dialog open={isAddFlightOpen} onOpenChange={setIsAddFlightOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Add Flight</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Add New Flight</DialogTitle>
                  <DialogDescription>
                    Create a new flight in the system. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                
                <FlightForm onSuccess={handleFlightCreated} />
              </DialogContent>
            </Dialog>
          </div>
          
          <FlightTable 
            flights={filteredFlights} 
            loading={loading}
            showActions={true}
            actions={[
              {
                label: "Edit",
                onClick: handleEditFlight,
                variant: "outline"
              },
              {
                label: "Delete",
                onClick: handleDeleteFlight,
                variant: "destructive"
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="add">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Flight</h2>
            <FlightForm onSuccess={handleFlightCreated} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Flight Dialog */}
      <Dialog open={isEditFlightOpen} onOpenChange={setIsEditFlightOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Update flight details in the system
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlight && (
            <FlightForm 
              initialData={selectedFlight} 
              editMode={true}
              onSuccess={handleFlightUpdated} 
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ManageFlights;
