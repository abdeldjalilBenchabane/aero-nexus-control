
// Type definitions based on the SQL schema

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;  // Usually not returned in responses
  role: "admin" | "staff" | "passenger" | "airline";
  created_at?: string;
}

export interface AirlineProfile {
  id: string;
  user_id: string;
  company_name: string;
}

export interface Gate {
  id: string;
  gate_number: string;
}

export interface Runway {
  id: string;
  runway_number: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline_id: string;
  airline_name?: string; // Joined field
  gate_id?: string;
  gate_number?: string; // Joined field
  runway_id?: string;
  runway_number?: string; // Joined field
  departure_time: string;
  arrival_time: string;
  destination: string;
  status: "scheduled" | "delayed" | "cancelled" | "landed" | "in_air";
  price: number;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  is_reserved: boolean;
}

export interface Reservation {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  seat_number?: string; // Joined field
  flight_number?: string; // Joined field
  destination?: string; // Joined field
  departure_time?: string; // Joined field
  arrival_time?: string; // Joined field
  reservation_time: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target_role: "admin" | "staff" | "passenger" | "airline" | "all";
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
