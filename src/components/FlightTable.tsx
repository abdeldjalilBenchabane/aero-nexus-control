
import { useState } from "react";
import { Flight } from "@/lib/types";
import { flights } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, MapPin } from "lucide-react";

interface FlightTableProps {
  flights: Flight[];
  actions?: {
    label: string;
    onClick: (flight: Flight) => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }[];
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  showActions?: boolean;
  onSelect?: (flight: Flight) => void;
  onEdit?: (flight: Flight) => void;
  onDelete?: (flight: Flight) => void;
  emptyMessage?: string;
  loading?: boolean; // Add the loading prop
}

const FlightTable = ({
  flights,
  actions = [],
  searchable = false,
  filterable = false,
  selectable = false,
  showActions = false,
  onSelect,
  onEdit,
  onDelete,
  emptyMessage = "No flights available",
  loading = false // Add default value
}: FlightTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: Flight["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "boarding":
        return "bg-yellow-500";
      case "departed":
        return "bg-purple-500";
      case "arrived":
        return "bg-green-500";
      case "delayed":
        return "bg-orange-500";
      case "cancelled":
        return "bg-red-500";
      case "landed":
        return "bg-green-700";
      case "in_air":
        return "bg-indigo-500";
      case "completed":
        return "bg-green-900";
      default:
        return "bg-gray-500";
    }
  };

  // Helper function to get gate display value
  const getGateDisplay = (flight: Flight) => {
    // Check all possible properties where gate information might be stored
    if (flight.gate_number) return flight.gate_number;
    if (flight.gate_id) return flight.gate_id;
    if (flight.gate) return flight.gate;
    if (typeof flight.gate === 'object' && flight.gate && 'name' in flight.gate) return flight.gate.name;
    return "—";
  };

  const filteredFlights = flights.filter(flight => {
    const flightNum = flight.flight_number || flight.flightNumber || "";
    
    const matchesSearch = search
      ? (flightNum.toLowerCase().includes(search.toLowerCase()) ||
        flight.origin.toLowerCase().includes(search.toLowerCase()) ||
        flight.destination.toLowerCase().includes(search.toLowerCase()))
      : true;
    
    const matchesFilter = statusFilter === "all" || flight.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1">
              <Input
                placeholder="Search flights..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {filterable && (
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="boarding">Boarding</SelectItem>
                  <SelectItem value="departed">Departed</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="landed">Landed</SelectItem>
                  <SelectItem value="in_air">In Air</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flight</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gate</TableHead>
              {(actions.length > 0 || showActions || selectable) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFlights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={actions.length > 0 || showActions ? 8 : 7} className="text-center h-24 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredFlights.map((flight) => (
                <TableRow key={flight.id} className={selectable ? "cursor-pointer hover:bg-muted/50" : ""} 
                  onClick={selectable ? () => onSelect?.(flight) : undefined}>
                  <TableCell className="font-medium">{flight.flight_number || flight.flightNumber}</TableCell>
                  <TableCell>{flight.origin}</TableCell>
                  <TableCell>{flight.destination}</TableCell>
                  <TableCell>{formatDate(flight.departure_time || flight.departureTime || "")}</TableCell>
                  <TableCell>{formatDate(flight.arrival_time || flight.arrivalTime || "")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(flight.status)}>
                      {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{getGateDisplay(flight)}</TableCell>
                  {(actions.length > 0 || showActions || selectable) && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {actions.length > 0 && actions.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant || "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(flight);
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                        
                        {showActions && !actions.length && (
                          <>
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(flight);
                                }}
                              >
                                <Pencil size={16} />
                              </Button>
                            )}
                            
                            {onDelete && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(flight);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </>
                        )}
                        
                        {selectable && !actions.length && !showActions && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect?.(flight);
                            }}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FlightTable;
