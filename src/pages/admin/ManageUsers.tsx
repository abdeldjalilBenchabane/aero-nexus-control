
import { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Shield, 
  UserCog, 
  UserPlus, 
  Search
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
import { users as mockUsers, User } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "", // Only used for new users
    firstName: "",
    lastName: "",
    email: "",
    role: "passenger"
  });
  const { toast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    // In a real app, this would fetch from API
    fetch("http://localhost:3001/api/users")
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        // Fallback to mock data
        setUsers(mockUsers as User[]);
        setFilteredUsers(mockUsers as User[]);
      });
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
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
    setNewUser(prev => ({ ...prev, role: value as User["role"] }));
  };

  // Add new user
  const handleAddUser = () => {
    // Validate input
    if (!newUser.username || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // In a real application, this would make an API call
    fetch("http://localhost:3001/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then(response => response.json())
      .then(data => {
        // Add the new user to the state
        const updatedUsers = [...users, data];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: "User created successfully",
        });
        
        setIsAddUserOpen(false);
        setNewUser({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
          role: "passenger"
        });
      })
      .catch(error => {
        console.error("Error adding user:", error);
        
        // Fallback if API fails - just add to local state
        const newUserData = {
          ...newUser,
          id: `user${Date.now()}`,
          role: newUser.role as "admin" | "staff" | "airline" | "passenger"
        };
        
        const updatedUsers = [...users, newUserData as User];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: "User created successfully",
        });
        
        setIsAddUserOpen(false);
        setNewUser({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
          role: "passenger"
        });
      });
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      password: "", // We don't show or edit existing passwords
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
    setIsAddUserOpen(true);
  };

  // Update user
  const handleUpdateUser = () => {
    if (!selectedUser) return;

    // Validate input
    if (!newUser.username || !newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

    // In a real application, this would make an API call
    fetch(`http://localhost:3001/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then(response => response.json())
      .then(data => {
        // Update the user in the state
        const updatedUsers = users.map(u => 
          u.id === selectedUser.id ? { ...u, ...data } : u
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
      })
      .catch(error => {
        console.error("Error updating user:", error);
        
        // Fallback if API fails - just update local state
        const updatedUsers = users.map(u => 
          u.id === selectedUser.id ? { ...u, ...updateData } : u
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
      });
  };

  // Delete user
  const handleDeleteUser = (user: User) => {
    // In a real application, this would make an API call
    fetch(`http://localhost:3001/api/users/${user.id}`, {
      method: "DELETE",
    })
      .then(() => {
        // Remove the user from the state
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      })
      .catch(error => {
        console.error("Error deleting user:", error);
        
        // Fallback if API fails - just remove from local state
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      });
  };

  return (
    <PageLayout title="Manage Users">
      <div className="space-y-6">
        {/* Search and Add User */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 max-w-sm"
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
                  username: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: "passenger"
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
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
                  <Label htmlFor="username" className="text-right">Username</Label>
                  <Input 
                    id="username" 
                    name="username"
                    className="col-span-3" 
                    value={newUser.username}
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
                  <Label htmlFor="firstName" className="text-right">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    className="col-span-3" 
                    value={newUser.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    className="col-span-3" 
                    value={newUser.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                
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
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && <Shield size={16} className="text-red-500" />}
                        {user.role === "staff" && <UserCog size={16} className="text-blue-500" />}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
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
