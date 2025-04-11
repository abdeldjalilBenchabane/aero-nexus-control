
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flight } from "@/lib/db";

interface SeatMapProps {
  flight?: Flight;
  onSelectSeat?: (seatId: string) => void;
  onSeatSelect?: (seatId: string) => void;
  selectedSeat?: string;
  className?: string;
  reservedSeats?: string[];
}

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLUMNS = [1, 2, 3];

const SeatMap = ({ 
  flight, 
  onSelectSeat, 
  onSeatSelect,
  selectedSeat,
  className,
  reservedSeats = []
}: SeatMapProps) => {
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  
  useEffect(() => {
    if (flight) {
      setAvailableSeats(flight.availableSeats);
      setBookedSeats(flight.bookedSeats.map(seat => seat.seatId));
    } else if (reservedSeats.length > 0) {
      // If no flight is provided but reservedSeats are, use those
      setBookedSeats(reservedSeats);
      
      // Create a list of all possible seats
      const allSeats: string[] = [];
      ROWS.forEach(row => {
        COLUMNS.forEach(col => {
          allSeats.push(`${row}${col}`);
        });
      });
      
      // Available seats are those not in reservedSeats
      setAvailableSeats(allSeats.filter(seat => !reservedSeats.includes(seat)));
    }
  }, [flight, reservedSeats]);

  const isSeatAvailable = (seatId: string) => {
    return availableSeats.includes(seatId);
  };

  const isSeatBooked = (seatId: string) => {
    return bookedSeats.includes(seatId);
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeat === seatId;
  };

  const getSeatStatus = (seatId: string) => {
    if (isSeatSelected(seatId)) return "selected";
    if (isSeatBooked(seatId)) return "booked";
    if (isSeatAvailable(seatId)) return "available";
    return "unavailable";
  };

  const handleSeatClick = (seatId: string) => {
    if (onSelectSeat) {
      onSelectSeat(seatId);
    }
    if (onSeatSelect) {
      onSeatSelect(seatId);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-sm border border-gray-300 bg-white"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-sm bg-gray-300"></div>
            <span className="text-sm">Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-sm bg-primary"></div>
            <span className="text-sm">Selected</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-6 p-4 border rounded-md bg-muted/20">
          {ROWS.map(row => (
            <div key={row} className="flex flex-col items-center space-y-4">
              {COLUMNS.map(col => {
                const seatId = `${row}${col}`;
                const status = getSeatStatus(seatId);
                
                return (
                  <Button
                    key={seatId}
                    className={cn(
                      "w-12 h-12 rounded-md",
                      status === "available" && "bg-white text-foreground hover:bg-primary/20 border border-gray-300",
                      status === "booked" && "bg-gray-300 cursor-not-allowed",
                      status === "selected" && "bg-primary text-primary-foreground",
                      status === "unavailable" && "bg-gray-200 cursor-not-allowed"
                    )}
                    disabled={status === "booked" || status === "unavailable"}
                    onClick={() => handleSeatClick(seatId)}
                    variant="ghost"
                  >
                    {seatId}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
