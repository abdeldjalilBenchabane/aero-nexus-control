
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  BarChart,
  Settings,
  Bell,
  PlaneTakeoff,
  Compass,
  CalendarCheck,
  ClipboardList,
  MapPin,
  Send,
  GanttChart,
  Clock,
  Search,
  Ticket,
  BookOpen,
  LogOut
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const NavItem = ({ icon, label, onClick, isActive }: NavItemProps) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    className={cn(
      "w-full justify-start gap-2 mb-1",
      isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

interface NavigationSidebarProps {
  activePath: string;
}

const NavigationSidebar = ({ activePath }: NavigationSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminNav = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/manage-users", label: "Manage Users", icon: <Users size={18} /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart size={18} /> },
    { path: "/admin/system-settings", label: "System Settings", icon: <Settings size={18} /> },
    { path: "/admin/send-notification", label: "Send Notification", icon: <Bell size={18} /> },
  ];

  const staffNav = [
    { path: "/staff/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/staff/manage-flights", label: "Manage Flights", icon: <PlaneTakeoff size={18} /> },
    { path: "/staff/assign-gate-runway", label: "Assign Gate/Runway", icon: <MapPin size={18} /> },
    { path: "/staff/real-time-flights", label: "Real-Time Flights", icon: <Compass size={18} /> },
    { path: "/staff/send-notification", label: "Send Notification", icon: <Bell size={18} /> },
  ];

  const airlineNav = [
    { path: "/airline/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/airline/my-flights", label: "My Flights", icon: <PlaneTakeoff size={18} /> },
    { path: "/airline/delay-manager", label: "Delay Manager", icon: <Clock size={18} /> },
    { path: "/airline/passenger-notify", label: "Passenger Notify", icon: <Bell size={18} /> },
  ];

  const passengerNav = [
    { path: "/passenger/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/passenger/search-flights", label: "Search Flights", icon: <Search size={18} /> },
    { path: "/passenger/reserve-seat", label: "Reserve Seat", icon: <CalendarCheck size={18} /> },
    { path: "/passenger/my-reservations", label: "My Reservations", icon: <Ticket size={18} /> },
    { path: "/passenger/my-notifications", label: "My Notifications", icon: <Bell size={18} /> },
  ];

  let navItems: { path: string; label: string; icon: React.ReactNode }[] = [];

  // Select the appropriate navigation items based on the user's role
  switch (user?.role) {
    case "admin":
      navItems = adminNav;
      break;
    case "staff":
      navItems = staffNav;
      break;
    case "airline":
      navItems = airlineNav;
      break;
    case "passenger":
      navItems = passengerNav;
      break;
    default:
      navItems = [];
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-sidebar flex flex-col border-r">
      <div className="p-4 border-b">
        <Logo />
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-sidebar-foreground/70">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.path)}
              isActive={activePath === item.path}
            />
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        {user && (
          <div className="mb-4">
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
          </div>
        )}
        <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
