
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "staff" | "passenger" | "airline";
  created_at?: string;
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
