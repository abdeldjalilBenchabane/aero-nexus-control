
import { useState } from "react";
import { Flight } from "@/lib/db";
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
  emptyMessage = "No flights available"
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
      default:
        return "bg-gray-500";
    }
  };

  // Filter flights based on search and status filter
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = search
      ? flight.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
        flight.origin.toLowerCase().includes(search.toLowerCase()) ||
        flight.destination.toLowerCase().includes(search.toLowerCase())
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
                  <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                  <TableCell>{flight.origin}</TableCell>
                  <TableCell>{flight.destination}</TableCell>
                  <TableCell>{formatDate(flight.departureTime)}</TableCell>
                  <TableCell>{formatDate(flight.arrivalTime)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(flight.status)}>
                      {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{flight.gate || "—"}</TableCell>
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
