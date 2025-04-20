export interface User {
  id: string;
  name: string; // Required now
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  password?: string;
  role: "admin" | "staff" | "passenger" | "airline";
  created_at?: string; // Make optional for creating new records
  airline_id?: string;
  // For backward compatibility
  airlineId?: string;
}

export interface Airline {
  id: string;
  name: string;
  email: string;
  created_at?: string; // Make optional for creating new records
}

export interface Airplane {
  id: string;
  name: string;
  airline_id: string;
  capacity: number;
  created_at?: string; // Make optional for creating new records
  // For backward compatibility
  airlineId?: string;
  airlineName?: string;
}

export interface Gate {
  id: string;
  name: string;
  terminal?: string;
  created_at?: string; // Make optional for creating new records
  // For backward compatibility
  gate_number?: string;
  isAvailable?: boolean;
  scheduledFlights?: number | any[];
}

export interface Runway {
  id: string;
  name: string;
  created_at?: string; // Make optional for creating new records
  // For backward compatibility
  runway_number?: string;
  isAvailable?: boolean;
  scheduledUse?: any[];
}

export interface Seat {
  id: string;
  flight_id?: string;
  airplane_id?: string;
  seat_number: string;
  is_reserved?: boolean;
  is_available?: boolean;
  // For backward compatibility
  flightId?: string;
  airplaneId?: string;
  seatNumber?: string;
  isReserved?: boolean;
  isAvailable?: boolean;
}

export type FlightStatus = "scheduled" | "boarding" | "departed" | "arrived" | "delayed" | "cancelled" | "landed" | "in_air" | "completed";

export interface Flight {
  id: string;
  flight_number: string;
  airline_id: string;
  airline_name?: string;
  airplane_id?: string;
  gate_id?: string;
  gate_number?: string;
  runway_id?: string;
  runway_number?: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  status: FlightStatus;
  price: number;
  created_at?: string; // Make optional for creating new records
  // For backward compatibility
  flightNumber?: string;
  airline?: string;
  airlineName?: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  runway?: string;
  availableSeats?: string[];
  bookedSeats?: { seatId: string; passengerId?: string }[] | string[];
}

export interface Reservation {
  id: string;
  user_id: string;
  flight_id: string;
  seat_number: string;
  seat_id?: string;
  status?: "confirmed" | "cancelled" | "checked-in";
  reservation_time?: string;
  created_at?: string; // Make optional for creating new records
  // Joined fields
  flight_number?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  origin?: string;
  // For backward compatibility
  userId?: string;
  flightId?: string;
  seat?: string;
  seatId?: string;
  timestamp?: string;
  flightStatus?: string;
  passengerName?: string;
  passengerEmail?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id?: string;
  user_role?: "admin" | "staff" | "airline";
  target_role?: "admin" | "staff" | "passenger" | "airline" | "all";
  flight_id?: string;
  created_at?: string; // Make optional for creating new records
  // For backward compatibility
  sender?: { 
    id: string;
    role: "admin" | "staff" | "airline";
  };
  senderRole?: string;
  targetType?: "all" | "role" | "flight";
  targetId?: string;
  timestamp?: string;
  flightId?: string;
  flightNumber?: string;
  isRead?: boolean;
}

// Auth response types
export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}
