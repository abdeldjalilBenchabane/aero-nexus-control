
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
import { gateApi } from "@/lib/api";
import { Gate } from "@/lib/types";

const ManageGates = () => {
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    terminal: ""
  });
  const { toast } = useToast();

  // Fetch gates on component mount
  useEffect(() => {
    fetchGates();
  }, []);

  const fetchGates = async () => {
    try {
      setLoading(true);
      const gatesData = await gateApi.getAll();
      setGates(gatesData);
    } catch (error) {
      console.error("Error fetching gates:", error);
      toast({
        title: "Error",
        description: "Failed to load gates",
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
    setFormData({ name: "", terminal: "" });
    setIsEditMode(false);
    setSelectedGate(null);
  };

  const handleAddGate = async () => {
    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Gate name is required",
          variant: "destructive"
        });
        return;
      }

      await gateApi.create({
        gate_number: formData.name,
        name: formData.name,
        terminal: formData.terminal
      });

      toast({
        title: "Success",
        description: "Gate added successfully"
      });

      // Refresh gates list
      fetchGates();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding gate:", error);
      toast({
        title: "Error",
        description: "Failed to add gate",
        variant: "destructive"
      });
    }
  };

  const handleEditGate = (gate: Gate) => {
    setIsEditMode(true);
    setSelectedGate(gate);
    setFormData({
      name: gate.gate_number || gate.name || "",
      terminal: gate.terminal || ""
    });
    setIsDialogOpen(true);
  };

  const handleUpdateGate = async () => {
    if (!selectedGate) return;

    try {
      // Validate form
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Gate name is required",
          variant: "destructive"
        });
        return;
      }

      await gateApi.update(selectedGate.id, {
        gate_number: formData.name,
        name: formData.name,
        terminal: formData.terminal
      });

      toast({
        title: "Success",
        description: "Gate updated successfully"
      });

      // Refresh gates list
      fetchGates();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating gate:", error);
      toast({
        title: "Error",
        description: "Failed to update gate",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGate = async (gate: Gate) => {
    if (!window.confirm(`Are you sure you want to delete gate ${gate.gate_number || gate.name}?`)) {
      return;
    }

    try {
      await gateApi.delete(gate.id);
      
      toast({
        title: "Success",
        description: "Gate deleted successfully"
      });

      // Refresh gates list
      fetchGates();
    } catch (error) {
      console.error("Error deleting gate:", error);
      toast({
        title: "Error",
        description: "Failed to delete gate. It may be in use by flights.",
        variant: "destructive"
      });
    }
  };

  return (
    <PageLayout title="Manage Gates">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gates</h2>
          
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
                <span>Add Gate</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Gate" : "Add New Gate"}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? "Update gate details in the system" 
                    : "Create a new gate record"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Gate Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    className="col-span-3" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="A1"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="terminal" className="text-right">Terminal</Label>
                  <Input 
                    id="terminal" 
                    name="terminal"
                    className="col-span-3" 
                    value={formData.terminal}
                    onChange={handleInputChange}
                    placeholder="Terminal 1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={isEditMode ? handleUpdateGate : handleAddGate}>
                  {isEditMode ? "Update Gate" : "Add Gate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Gates Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Gate Name</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Created At</TableHead>
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
              ) : gates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No gates found.
                  </TableCell>
                </TableRow>
              ) : (
                gates.map(gate => (
                  <TableRow key={gate.id}>
                    <TableCell>{gate.id}</TableCell>
                    <TableCell>{gate.gate_number || gate.name}</TableCell>
                    <TableCell>{gate.terminal}</TableCell>
                    <TableCell>{new Date(gate.created_at || '').toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditGate(gate)}>
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteGate(gate)}
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

export default ManageGates;
