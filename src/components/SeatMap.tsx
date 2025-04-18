
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flight, Seat } from "@/lib/types";
import { seatApi } from "@/lib/api";

interface SeatMapProps {
  flight?: Flight;
  onSelectSeat?: (seatId: string) => void;
  onSeatSelect?: (seatNumber: string) => void;
  selectedSeat?: string;
  className?: string;
  reservedSeats?: string[];
}

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLUMNS = [1, 2, 3, 4, 5, 6];

const SeatMap = ({ 
  flight, 
  onSelectSeat, 
  onSeatSelect,
  selectedSeat,
  className,
  reservedSeats = []
}: SeatMapProps) => {
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (flight?.id) {
      fetchSeats(flight.id);
    }
  }, [flight]);

  const fetchSeats = async (flightId: string) => {
    try {
      setLoading(true);
      setError(null);
      const seats = await seatApi.getByFlight(flightId);
      setAvailableSeats(seats);
    } catch (err) {
      console.error("Error fetching seats:", err);
      setError("Failed to load seats for this flight");
      
      // Fallback for demo if API fails
      if (flight?.availableSeats || reservedSeats.length > 0) {
        const allSeatNumbers: string[] = [];
        ROWS.forEach(row => {
          COLUMNS.forEach(col => {
            allSeatNumbers.push(`${row}${col}`);
          });
        });
        
        const mockSeats: Seat[] = allSeatNumbers.map(seatNumber => ({
          id: `seat-${seatNumber}`,
          seat_number: seatNumber,
          is_available: !reservedSeats.includes(seatNumber),
          is_reserved: reservedSeats.includes(seatNumber)
        }));
        
        setAvailableSeats(mockSeats);
      }
    } finally {
      setLoading(false);
    }
  };

  const isSeatAvailable = (seatNumber: string) => {
    const seat = availableSeats.find(s => s.seat_number === seatNumber);
    return seat && !seat.is_reserved;
  };

  const isSeatBooked = (seatNumber: string) => {
    const seat = availableSeats.find(s => s.seat_number === seatNumber);
    return seat?.is_reserved || reservedSeats.includes(seatNumber);
  };

  const isSeatSelected = (seatNumber: string) => {
    return selectedSeat === seatNumber;
  };

  const getSeatStatus = (seatNumber: string) => {
    if (isSeatSelected(seatNumber)) return "selected";
    if (isSeatBooked(seatNumber)) return "booked";
    if (isSeatAvailable(seatNumber)) return "available";
    return "unavailable";
  };

  const handleSeatClick = (seatNumber: string) => {
    if (isSeatBooked(seatNumber)) return;
    
    const seat = availableSeats.find(s => s.seat_number === seatNumber);
    
    if (onSelectSeat && seat) {
      onSelectSeat(seat.id);
    }
    
    if (onSeatSelect) {
      onSeatSelect(seatNumber);
    }
  };
  
  // Create a grid of rows and columns for the seats
  const renderSeats = () => {
    const seats: JSX.Element[] = [];
    
    ROWS.forEach(row => {
      COLUMNS.forEach(col => {
        const seatNumber = `${row}${col}`;
        const status = getSeatStatus(seatNumber);
        
        seats.push(
          <Button
            key={seatNumber}
            className={cn(
              "w-12 h-12 rounded-md",
              status === "available" && "bg-white text-foreground hover:bg-primary/20 border border-gray-300",
              status === "booked" && "bg-gray-300 cursor-not-allowed",
              status === "selected" && "bg-primary text-primary-foreground",
              status === "unavailable" && "bg-gray-200 cursor-not-allowed"
            )}
            disabled={status === "booked" || status === "unavailable"}
            onClick={() => handleSeatClick(seatNumber)}
            variant="ghost"
          >
            {seatNumber}
          </Button>
        );
      });
    });
    
    return seats;
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

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading seats...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-6 gap-3 p-4 border rounded-md bg-muted/20">
            {renderSeats()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
