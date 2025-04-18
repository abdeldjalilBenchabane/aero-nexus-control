
import { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Shield, 
  UserCog 
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { userApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "admin" | "staff" | "airline" | "passenger";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger" as UserRole
  });
  const { toast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  };

  // Handle new user input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value as UserRole }));
  };

  // Add new user
  const handleAddUser = async () => {
    // Validate input
    if (!newUser.name || !newUser.password || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const created = await userApi.create(newUser);
      const updatedUsers = [...users, created];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      setIsAddUserOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "passenger" as UserRole
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Email may already be in use.",
        variant: "destructive"
      });
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: "", // We don't show or edit existing passwords
      role: user.role
    });
    setIsAddUserOpen(true);
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validate input
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Prepare update data (omit password if empty)
    const updateData = {
      ...newUser,
    };
    
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const updated = await userApi.update(selectedUser.id, updateData);
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, ...updated } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      setIsAddUserOpen(false);
      setIsEditMode(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      return;
    }

    try {
      await userApi.delete(user.id);
      
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  return (
    <PageLayout title="Manage Users">
      <div className="space-y-6">
        {/* Search and Add User */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
          
          <Dialog 
            open={isAddUserOpen} 
            onOpenChange={(open) => {
              setIsAddUserOpen(open);
              if (!open) {
                setIsEditMode(false);
                setSelectedUser(null);
                setNewUser({
                  name: "",
                  email: "",
                  password: "",
                  role: "passenger" as UserRole
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? "Update user details in the system" 
                    : "Create a new user account"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    className="col-span-3" 
                    value={newUser.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                {!isEditMode && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input 
                      id="password" 
                      name="password"
                      type="password"
                      className="col-span-3" 
                      value={newUser.password}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    className="col-span-3" 
                    value={newUser.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select value={newUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="airline">Airline</SelectItem>
                      <SelectItem value="passenger">Passenger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button onClick={isEditMode ? handleUpdateUser : handleAddUser}>
                  {isEditMode ? "Update User" : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Users Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && <Shield size={16} className="text-red-500" />}
                        {user.role === "staff" && <UserCog size={16} className="text-blue-500" />}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.created_at || '').toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.role === "admin"} // Prevent deleting admin users
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

export default ManageUsers;
