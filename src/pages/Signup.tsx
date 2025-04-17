
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaneTakeoff, AlertCircle } from "lucide-react";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["passenger", "airline"]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type UserFormData = z.infer<typeof userSchema>;

const Signup = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "passenger"
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      userSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            newErrors[error.path[0] as keyof UserFormData] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as "passenger" | "airline" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }
      
      // Registration successful
      navigate("/login?registered=true");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-aviation-blue-light to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-aviation-navy-dark/70">Airport Flight Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Register as</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger">Passenger</SelectItem>
                    <SelectItem value="airline">Airline</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Note: Admin and Staff accounts can only be created by system administrators.
                </p>
              </div>
              
              {submitError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
