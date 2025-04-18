
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { runwayApi } from "@/lib/api";
import { Runway } from "@/lib/types";

const ManageRunways = () => {
  const [runways, setRunways] = useState<Runway[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRunway, setSelectedRunway] = useState<Runway | null>(null);
  const [formData, setFormData] = useState({
    name: ""
  });
  const { toast } = useToast();

  // Fetch runways on component mount
  useEffect(() => {
    fetchRunways();
  }, []);

  const fetchRunways = async () => {
    try {
      setLoading(true);
      const runwaysData = await runwayApi.getAll();
      setRunways(runwaysData);
    } catch (error) {
      console.error("Error fetching runways:", error);
      toast({
        title: "Error",
        description: "Failed to load runways",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setIsEditMode(false);
    setSelectedRunway(null);
  };

  const handleAddRunway = async () => {
    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Runway name is required",
          variant: "destructive"
        });
        return;
      }

      await runwayApi.create({
        runway_number: formData.name,
        name: formData.name
      });

      toast({
        title: "Success",
        description: "Runway added successfully"
      });

      // Refresh runways list
      fetchRunways();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding runway:", error);
      toast({
        title: "Error",
        description: "Failed to add runway",
        variant: "destructive"
      });
    }
  };

  const handleEditRunway = (runway: Runway) => {
    setIsEditMode(true);
    setSelectedRunway(runway);
    setFormData({
      name: runway.runway_number || runway.name || ""
    });
    setIsDialogOpen(true);
  };

  const handleUpdateRunway = async () => {
    if (!selectedRunway) return;

    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Runway name is required",
          variant: "destructive"
        });
        return;
      }

      await runwayApi.update(selectedRunway.id, {
        runway_number: formData.name,
        name: formData.name
      });

      toast({
        title: "Success",
        description: "Runway updated successfully"
      });

      // Refresh runways list
      fetchRunways();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating runway:", error);
      toast({
        title: "Error",
        description: "Failed to update runway",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRunway = async (runway: Runway) => {
    if (!window.confirm(`Are you sure you want to delete runway ${runway.runway_number || runway.name}?`)) {
      return;
    }

    try {
      await runwayApi.delete(runway.id);
      
      toast({
        title: "Success",
        description: "Runway deleted successfully"
      });

      // Refresh runways list
      fetchRunways();
    } catch (error) {
      console.error("Error deleting runway:", error);
      toast({
        title: "Error",
        description: "Failed to delete runway. It may be in use by flights.",
        variant: "destructive"
      });
    }
  };

  return (
    <PageLayout title="Manage Runways">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Runways</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Runway</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Runway" : "Add New Runway"}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? "Update runway details in the system" 
                    : "Create a new runway record"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Runway Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    className="col-span-3" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="R1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={isEditMode ? handleUpdateRunway : handleAddRunway}>
                  {isEditMode ? "Update Runway" : "Add Runway"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Runways Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Runway Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : runways.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No runways found.
                  </TableCell>
                </TableRow>
              ) : (
                runways.map(runway => (
                  <TableRow key={runway.id}>
                    <TableCell>{runway.id}</TableCell>
                    <TableCell>{runway.runway_number || runway.name}</TableCell>
                    <TableCell>{new Date(runway.created_at || '').toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditRunway(runway)}>
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteRunway(runway)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
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

export default ManageRunways;
