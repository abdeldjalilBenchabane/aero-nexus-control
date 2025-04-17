import { useState } from "react";
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
  LucideProps,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Ticket,
  Building2,
  Plane,
  GanttChartSquare,
  LandmarkIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const NavItem = ({ icon, label, onClick, isActive }: NavItemProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start gap-2 mb-1 transition-colors",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90" 
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
    onClick={onClick}
  >
    {icon}
    <span className="truncate">{label}</span>
  </Button>
);

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
  collapsed: boolean;
}

const SidebarGroup = ({ title, children, collapsed }: SidebarGroupProps) => (
  <div className="mb-6">
    {!collapsed && (
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-sidebar-foreground/70 px-3">
        {title}
      </p>
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface NavigationSidebarProps {
  activePath: string;
}

const NavigationSidebar = ({ activePath }: NavigationSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => setCollapsed(!collapsed);

  const adminNav = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/users", label: "Users", icon: <Users size={18} /> },
    { path: "/admin/send-notification", label: "Notifications", icon: <Bell size={18} /> },
    { path: "/admin/gates", label: "Gates", icon: <Building2 size={18} /> },
    { path: "/admin/runways", label: "Runways", icon: <LandmarkIcon size={18} /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart size={18} /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const staffNav = [
    { path: "/staff/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/staff/flights", label: "Manage Flights", icon: <PlaneTakeoff size={18} /> },
    { path: "/staff/assign-gate-runway", label: "Gates & Runways", icon: <MapPin size={18} /> },
    { path: "/staff/notifications", label: "Send Notification", icon: <Bell size={18} /> },
    { path: "/staff/real-time-flights", label: "Live Flights", icon: <Compass size={18} /> },
  ];

  const airlineNav = [
    { path: "/airline/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/airline/flights", label: "My Flights", icon: <PlaneTakeoff size={18} /> },
    { path: "/airline/airplanes", label: "My Airplanes", icon: <Plane size={18} /> },
    { path: "/airline/notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  const passengerNav = [
    { path: "/passenger/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/passenger/search-flights", label: "Search Flights", icon: <Search size={18} /> },
    { path: "/passenger/reservations", label: "My Reservations", icon: <Ticket size={18} /> },
    { path: "/passenger/notifications", label: "Notifications", icon: <Bell size={18} /> },
    { path: "/passenger/flight-status", label: "Flight Status", icon: <GanttChartSquare size={18} /> },
  ];

  let navItems: { path: string; label: string; icon: React.ReactNode }[] = [];
  
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

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "User";
  };

  if (isMobile && !collapsed) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
        
        <div className="fixed h-screen w-64 bg-sidebar z-50 flex flex-col shadow-xl animate-in slide-in-from-left">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Logo />
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
              <ChevronLeft size={18} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarGroup title="Main Menu" collapsed={collapsed}>
              {navItems.map((item) => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setCollapsed(true);
                  }}
                  isActive={activePath === item.path}
                />
              ))}
            </SidebarGroup>
          </div>
          
          <div className="p-3 border-t border-sidebar-border">
            {user && (
              <div className="mb-3 px-3 py-2">
                <p className="text-sm font-medium text-sidebar-foreground">{getUserDisplayName()}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/50" 
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-4 left-4 z-30 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-none"
          onClick={toggleSidebar}
        >
          <ChevronRight size={18} />
        </Button>
      </>
    );
  }

  return (
    <div className={cn(
      "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && <Logo />}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarGroup title="Main Menu" collapsed={collapsed}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              onClick={() => navigate(item.path)}
              isActive={activePath === item.path}
            />
          ))}
        </SidebarGroup>
      </div>
      
      <div className={cn("p-3 border-t border-sidebar-border", collapsed ? "items-center justify-center" : "")}>
        {user && !collapsed && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground">{getUserDisplayName()}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
          </div>
        )}
        <Button 
          variant="outline" 
          className={cn(
            "flex items-center gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/50",
            collapsed ? "w-10 h-10 p-0 justify-center" : "w-full"
          )}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
