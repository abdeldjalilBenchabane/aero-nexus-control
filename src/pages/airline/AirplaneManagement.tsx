
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { airplaneApi } from "@/lib/api";
import { Airplane } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plane, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AirplaneManagement = () => {
  const { user } = useAuth();
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 50
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAirplanes();
    }
  }, [user]);

  const fetchAirplanes = async () => {
    try {
      setLoading(true);
      // Fetch airplanes for the current airline
      const airlineId = user?.airline_id || user?.id;
      const data = await airplaneApi.getByAirline(airlineId!);
      setAirplanes(data);
    } catch (error) {
      console.error("Error fetching airplanes:", error);
      toast({
        title: "Error",
        description: "Failed to load airplanes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "capacity" ? parseInt(value) || 0 : value 
    }));
  };

  const handleAddAirplane = async () => {
    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Airplane name is required",
          variant: "destructive"
        });
        return;
      }

      if (formData.capacity < 1) {
        toast({
          title: "Error",
          description: "Capacity must be at least 1",
          variant: "destructive"
        });
        return;
      }

      const airlineId = user?.airline_id || user?.id;
      
      await airplaneApi.create({
        name: formData.name,
        airline_id: airlineId!,
        capacity: formData.capacity
      });

      toast({
        title: "Success",
        description: "Airplane added successfully. Seats have been generated automatically."
      });

      // Refresh airplanes list
      fetchAirplanes();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        capacity: 50
      });
    } catch (error) {
      console.error("Error adding airplane:", error);
      toast({
        title: "Error",
        description: "Failed to add airplane",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAirplane = async (airplane: Airplane) => {
    if (!window.confirm(`Are you sure you want to delete ${airplane.name}? This will also delete all associated seats.`)) {
      return;
    }

    try {
      await airplaneApi.delete(airplane.id);
      
      toast({
        title: "Success",
        description: "Airplane deleted successfully"
      });

      // Refresh airplanes list
      fetchAirplanes();
    } catch (error) {
      console.error("Error deleting airplane:", error);
      toast({
        title: "Error",
        description: "Failed to delete airplane. It may be in use by flights.",
        variant: "destructive"
      });
    }
  };

  return (
    <PageLayout title="Airplane Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Airplanes</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Airplane</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Airplane</DialogTitle>
                <DialogDescription>
                  Add a new airplane to your fleet. Seats will be automatically generated.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Airplane Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    className="col-span-3" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Boeing-737"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">Capacity (Seats)</Label>
                  <Input 
                    id="capacity" 
                    name="capacity"
                    type="number"
                    min="1"
                    max="500"
                    className="col-span-3" 
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAirplane}>Add Airplane</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Airplanes Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : airplanes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Plane className="h-8 w-8 text-gray-400 mb-2" />
                      <p>No airplanes found. Add your first airplane.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                airplanes.map(airplane => (
                  <TableRow key={airplane.id}>
                    <TableCell>{airplane.id}</TableCell>
                    <TableCell>{airplane.name}</TableCell>
                    <TableCell>{airplane.capacity} seats</TableCell>
                    <TableCell>
                      {airplane.created_at ? new Date(airplane.created_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteAirplane(airplane)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default AirplaneManagement;
