
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "staff" | "passenger" | "airline";
  created_at?: string;
  airline_id?: string; // Adding for backward compatibility
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
}

export interface Gate {
  id: string;
  gate_number: string;
  name?: string;
  terminal?: string;
  isAvailable?: boolean;
  created_at?: string;
  scheduledFlights?: number; // For backward compatibility
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
}

export type FlightStatus = "scheduled" | "boarding" | "departed" | "arrived" | "delayed" | "cancelled";

export interface Flight {
  id: string;
  flight_number: string;
  flightNumber?: string; // For backward compatibility
  airline_id: string;
  airline?: string; // For backward compatibility
  airline_name?: string;
  airplane_id?: string;
  gate_id?: string;
  gate_number?: string;
  gate?: string; // For backward compatibility
  runway_id?: string;
  runway_number?: string;
  runway?: string; // For backward compatibility
  origin: string;
  destination: string;
  departure_time: string;
  departureTime?: string; // For backward compatibility
  arrival_time: string;
  arrivalTime?: string; // For backward compatibility
  status: FlightStatus;
  price: number;
  created_at?: string;
  availableSeats?: string[]; // For backward compatibility
  bookedSeats?: { seatId: string }[]; // For backward compatibility
}

export interface Reservation {
  id: string;
  user_id: string;
  flight_id: string;
  seat_number: string;
  seat_id?: string; // For backward compatibility
  status?: "confirmed" | "cancelled" | "checked-in";
  reservation_time?: string;
  created_at?: string;
  // Joined fields
  flight_number?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  // Legacy fields
  userId?: string;
  flightId?: string;
  timestamp?: string;
  seat?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id?: string;
  user_role?: "admin" | "staff" | "airline";
  target_role?: "admin" | "staff" | "passenger" | "airline" | "all";
  flight_id?: string;
  flightId?: string; // For backward compatibility
  created_at: string;
  timestamp?: string; // For backward compatibility
  targetType?: "all" | "role" | "flight"; // For backward compatibility
  targetId?: string; // For backward compatibility
  sender?: { // For backward compatibility
    id: string;
    role: "admin" | "staff" | "airline";
  };
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
