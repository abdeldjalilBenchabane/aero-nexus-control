
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "staff" | "passenger" | "airline";
  created_at?: string;
  airline_id?: string;
  // For backward compatibility
  airlineId?: string;
}

export interface Airline {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Airplane {
  id: string;
  name: string;
  airline_id: string;
  capacity: number;
  created_at?: string;
  // For backward compatibility
  airlineId?: string;
}

export interface Gate {
  id: string;
  gate_number: string;
  name?: string;
  terminal?: string;
  isAvailable?: boolean;
  created_at?: string;
  // For backward compatibility
  scheduledFlights?: number;
}

export interface Runway {
  id: string;
  runway_number: string;
  name?: string;
  isAvailable?: boolean;
  created_at?: string;
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

export type FlightStatus = "scheduled" | "boarding" | "departed" | "arrived" | "delayed" | "cancelled" | "landed" | "in_air";

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
  created_at?: string;
  // For backward compatibility
  flightNumber?: string;
  airline?: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  runway?: string;
  availableSeats?: string[];
  bookedSeats?: { seatId: string }[];
}

export interface Reservation {
  id: string;
  user_id: string;
  flight_id: string;
  seat_number: string;
  status?: "confirmed" | "cancelled" | "checked-in";
  reservation_time?: string;
  created_at?: string;
  // Joined fields
  flight_number?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  // For backward compatibility
  userId?: string;
  flightId?: string;
  seat?: string;
  seatId?: string;
  seat_id?: string;
  timestamp?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id?: string;
  user_role?: "admin" | "staff" | "airline";
  target_role?: "admin" | "staff" | "passenger" | "airline" | "all";
  flight_id?: string;
  created_at: string;
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
