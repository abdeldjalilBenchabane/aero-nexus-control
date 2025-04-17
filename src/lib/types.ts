
export interface Flight {
  id: string;
  flight_number: string;
  airline_id?: string;  // Make this optional to maintain backward compatibility
  airline?: string; // For backward compatibility
  airline_name?: string; // Joined field
  gate_id?: string;
  gate_number?: string; // Joined field
  runway_id?: string;
  runway_number?: string; // Joined field
  departure_time: string;
  arrival_time: string;
  origin?: string; // Add this field to support components using it
  destination: string;
  status: "scheduled" | "delayed" | "cancelled" | "landed" | "in_air";
  price: number;
  flightNumber?: string; // For backward compatibility
}
