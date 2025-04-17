
// Mock database for the airport flight management system
import { User, Flight, Gate, Runway, Notification, Reservation } from './types';

// Mock data
export const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@airport.com",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    created_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Staff Member",
    email: "staff@airport.com",
    password: "staff123",
    role: "staff",
    created_at: "2023-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Airline Rep",
    email: "airline@skyways.com",
    password: "airline123",
    role: "airline",
    created_at: "2023-01-03T00:00:00Z",
    airlineId: "skyways"
  },
  {
    id: "4",
    name: "John Traveler",
    email: "john@example.com",
    password: "passenger123",
    role: "passenger",
    created_at: "2023-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "passenger123",
    role: "passenger",
    created_at: "2023-01-05T00:00:00Z"
  }
];

export const flights: Flight[] = [
  {
    id: "flight1",
    flight_number: "SK101",
    airline_id: "skyways",
    airline: "skyways", // For backward compatibility
    origin: "New York (JFK)",
    destination: "London (LHR)",
    departure_time: "2023-06-15T08:00:00Z",
    arrival_time: "2023-06-15T20:00:00Z",
    status: "scheduled",
    gate_id: "gate1",
    gate_number: "A1",
    runway_id: "runway1",
    runway_number: "R1",
    price: 350,
    // Legacy fields for compatibility
    flightNumber: "SK101",
    departureTime: "2023-06-15T08:00:00Z",
    arrivalTime: "2023-06-15T20:00:00Z"
  },
  {
    id: "flight2",
    flight_number: "SK202",
    airline_id: "skyways",
    airline: "skyways", // For backward compatibility
    origin: "London (LHR)",
    destination: "Paris (CDG)",
    departure_time: "2023-06-16T10:00:00Z",
    arrival_time: "2023-06-16T12:00:00Z",
    status: "scheduled",
    gate_id: "gate2",
    gate_number: "B3",
    runway_id: "runway2",
    runway_number: "R2",
    price: 120,
    // Legacy fields for compatibility
    flightNumber: "SK202",
    departureTime: "2023-06-16T10:00:00Z",
    arrivalTime: "2023-06-16T12:00:00Z"
  },
  {
    id: "flight3",
    flight_number: "SK303",
    airline_id: "skyways",
    airline: "skyways", // For backward compatibility
    origin: "Paris (CDG)",
    destination: "Tokyo (HND)",
    departure_time: "2023-06-17T14:00:00Z",
    arrival_time: "2023-06-18T10:00:00Z",
    status: "scheduled",
    gate_id: "gate3",
    gate_number: "C2",
    runway_id: "runway3",
    runway_number: "R3",
    price: 850,
    // Legacy fields for compatibility
    flightNumber: "SK303",
    departureTime: "2023-06-17T14:00:00Z",
    arrivalTime: "2023-06-18T10:00:00Z"
  }
];

export const gates: Gate[] = [
  {
    id: "gate1",
    gate_number: "A1"
  },
  {
    id: "gate2",
    gate_number: "B3"
  },
  {
    id: "gate3",
    gate_number: "C2"
  }
];

export const runways: Runway[] = [
  {
    id: "runway1",
    runway_number: "R1"
  },
  {
    id: "runway2",
    runway_number: "R2"
  },
  {
    id: "runway3",
    runway_number: "R3"
  }
];

export const seats: { id: string; flight_id: string; seat_number: string; is_reserved: boolean }[] = [
  { id: "seat1", flight_id: "flight1", seat_number: "A1", is_reserved: true },
  { id: "seat2", flight_id: "flight1", seat_number: "A2", is_reserved: false },
  { id: "seat3", flight_id: "flight1", seat_number: "A3", is_reserved: false },
  { id: "seat4", flight_id: "flight1", seat_number: "B1", is_reserved: false },
  { id: "seat5", flight_id: "flight1", seat_number: "B2", is_reserved: false },
  { id: "seat6", flight_id: "flight1", seat_number: "C1", is_reserved: false },
  { id: "seat7", flight_id: "flight1", seat_number: "C2", is_reserved: false },
  
  { id: "seat8", flight_id: "flight2", seat_number: "A1", is_reserved: false },
  { id: "seat9", flight_id: "flight2", seat_number: "A2", is_reserved: true },
  { id: "seat10", flight_id: "flight2", seat_number: "A3", is_reserved: false },
  { id: "seat11", flight_id: "flight2", seat_number: "B1", is_reserved: false },
  { id: "seat12", flight_id: "flight2", seat_number: "B2", is_reserved: true },
  { id: "seat13", flight_id: "flight2", seat_number: "B3", is_reserved: false },
  { id: "seat14", flight_id: "flight2", seat_number: "C1", is_reserved: false },
  { id: "seat15", flight_id: "flight2", seat_number: "C3", is_reserved: false },
  
  { id: "seat16", flight_id: "flight3", seat_number: "A1", is_reserved: true },
  { id: "seat17", flight_id: "flight3", seat_number: "A2", is_reserved: false },
  { id: "seat18", flight_id: "flight3", seat_number: "A3", is_reserved: false },
  { id: "seat19", flight_id: "flight3", seat_number: "B1", is_reserved: true },
  { id: "seat20", flight_id: "flight3", seat_number: "B2", is_reserved: false },
  { id: "seat21", flight_id: "flight3", seat_number: "B3", is_reserved: false },
  { id: "seat22", flight_id: "flight3", seat_number: "C1", is_reserved: true },
  { id: "seat23", flight_id: "flight3", seat_number: "C2", is_reserved: false },
  { id: "seat24", flight_id: "flight3", seat_number: "C3", is_reserved: false }
];

export const reservations: Reservation[] = [
  {
    id: "res1",
    flight_id: "flight1",
    user_id: "4",
    seat_id: "seat1",
    seat_number: "A1",
    flight_number: "SK101",
    destination: "London (LHR)",
    departure_time: "2023-06-15T08:00:00Z",
    arrival_time: "2023-06-15T20:00:00Z",
    reservation_time: "2023-06-10T12:00:00Z",
    // Legacy fields
    userId: "4",
    flightId: "flight1",
    timestamp: "2023-06-10T12:00:00Z",
    seat: "A1"
  },
  {
    id: "res2",
    flight_id: "flight2",
    user_id: "5",
    seat_id: "seat9",
    seat_number: "A2",
    flight_number: "SK202",
    destination: "Paris (CDG)",
    departure_time: "2023-06-16T10:00:00Z",
    arrival_time: "2023-06-16T12:00:00Z",
    reservation_time: "2023-06-11T14:30:00Z",
    // Legacy fields
    userId: "5", 
    flightId: "flight2",
    timestamp: "2023-06-11T14:30:00Z",
    seat: "A2"
  },
  {
    id: "res3",
    flight_id: "flight2",
    user_id: "5",
    seat_id: "seat12",
    seat_number: "B2",
    flight_number: "SK202",
    destination: "Paris (CDG)",
    departure_time: "2023-06-16T10:00:00Z",
    arrival_time: "2023-06-16T12:00:00Z",
    reservation_time: "2023-06-11T14:35:00Z",
    // Legacy fields
    userId: "5",
    flightId: "flight2",
    timestamp: "2023-06-11T14:35:00Z",
    seat: "B2"
  },
  {
    id: "res4",
    flight_id: "flight3",
    user_id: "4",
    seat_id: "seat16",
    seat_number: "A1",
    flight_number: "SK303",
    destination: "Tokyo (HND)",
    departure_time: "2023-06-17T14:00:00Z",
    arrival_time: "2023-06-18T10:00:00Z",
    reservation_time: "2023-06-12T09:15:00Z",
    // Legacy fields
    userId: "4",
    flightId: "flight3",
    timestamp: "2023-06-12T09:15:00Z",
    seat: "A1"
  },
  {
    id: "res5",
    flight_id: "flight3",
    user_id: "4",
    seat_id: "seat19",
    seat_number: "B1",
    flight_number: "SK303",
    destination: "Tokyo (HND)",
    departure_time: "2023-06-17T14:00:00Z",
    arrival_time: "2023-06-18T10:00:00Z",
    reservation_time: "2023-06-12T09:20:00Z",
    // Legacy fields
    userId: "4",
    flightId: "flight3",
    timestamp: "2023-06-12T09:20:00Z",
    seat: "B1"
  },
  {
    id: "res6",
    flight_id: "flight3",
    user_id: "4",
    seat_id: "seat22",
    seat_number: "C1",
    flight_number: "SK303",
    destination: "Tokyo (HND)",
    departure_time: "2023-06-17T14:00:00Z",
    arrival_time: "2023-06-18T10:00:00Z",
    reservation_time: "2023-06-12T09:25:00Z",
    // Legacy fields
    userId: "4",
    flightId: "flight3",
    timestamp: "2023-06-12T09:25:00Z",
    seat: "C1"
  }
];

export const notifications: Notification[] = [
  {
    id: "notif1",
    title: "System Notification",
    message: "All flights are operating as scheduled today",
    target_role: "all",
    created_at: "2023-06-14T10:00:00Z",
    // Legacy fields
    timestamp: "2023-06-14T10:00:00Z",
    sender: {
      id: "1",
      role: "admin"
    },
    targetType: "all"
  },
  {
    id: "notif2",
    title: "Flight Update",
    message: "Flight SK101 is now boarding at Gate A1",
    target_role: "passenger",
    flight_id: "flight1",
    created_at: "2023-06-15T07:30:00Z",
    // Legacy fields
    timestamp: "2023-06-15T07:30:00Z",
    sender: {
      id: "2",
      role: "staff"
    },
    targetType: "flight",
    targetId: "flight1",
    flightId: "flight1"
  },
  {
    id: "notif3",
    title: "Flight Delay",
    message: "Flight SK202 is delayed by 30 minutes",
    target_role: "passenger",
    flight_id: "flight2",
    created_at: "2023-06-16T09:00:00Z",
    // Legacy fields
    timestamp: "2023-06-16T09:00:00Z",
    sender: {
      id: "3",
      role: "airline"
    },
    targetType: "flight",
    targetId: "flight2",
    flightId: "flight2"
  },
  {
    id: "notif4",
    title: "System Maintenance",
    message: "System maintenance scheduled for tonight",
    target_role: "staff",
    created_at: "2023-06-16T15:00:00Z",
    // Legacy fields
    timestamp: "2023-06-16T15:00:00Z",
    sender: {
      id: "1",
      role: "admin"
    },
    targetType: "role",
    targetId: "staff"
  }
];

// Mock functions to simulate database operations
export const getUser = (email: string, password: string): User | null => {
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
};

export const getUserById = (id: string): User | null => {
  const user = users.find(u => u.id === id);
  return user || null;
};

export const getAllFlights = (): Flight[] => {
  return [...flights];
};

export const getFlightById = (id: string): Flight | null => {
  const flight = flights.find(f => f.id === id);
  return flight ? { ...flight } : null;
};

export const getFlightsByAirline = (airlineId: string): Flight[] => {
  return flights.filter(f => f.airline_id === airlineId || f.airline === airlineId);
};

export const getPassengerFlights = (passengerId: string): Flight[] => {
  const userReservations = reservations.filter(r => r.user_id === passengerId);
  const flightIds = userReservations.map(r => r.flight_id);
  return flights.filter(f => flightIds.includes(f.id));
};

export const getNotificationsForUser = (userId: string): Notification[] => {
  const user = getUserById(userId);
  if (!user) return [];

  return notifications.filter(notif => {
    // All notifications
    if (notif.target_role === "all") return true;
    
    // Role-specific notifications
    if (notif.target_role === user.role) return true;
    
    // Flight-specific notifications
    if (notif.flight_id && user.role === "passenger") {
      const userFlights = getPassengerFlights(userId).map(f => f.id);
      return userFlights.includes(notif.flight_id);
    }
    
    // Airline users can see their flight notifications
    if (notif.flight_id && user.role === "airline" && user.airlineId) {
      const flight = getFlightById(notif.flight_id);
      return flight?.airline_id === user.airlineId || flight?.airline === user.airlineId;
    }
    
    // Admin and staff can see all notifications
    return user.role === "admin" || user.role === "staff";
  });
};

// Ensure addNotification is properly exported
export const addNotification = (notification: Omit<Notification, "id">): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: `notif${notifications.length + 1}`
  };
  
  notifications.push(newNotification);
  return newNotification;
};

// Book a seat on a flight
export const bookSeat = (
  flightId: string,
  seatId: string,
  passengerId: string
): { success: boolean; message: string } => {
  const flight = flights.find(f => f.id === flightId);
  if (!flight) {
    return { success: false, message: "Flight not found" };
  }
  
  const seat = seats.find(s => s.id === seatId);
  if (!seat) {
    return { success: false, message: "Seat not found" };
  }
  
  if (seat.is_reserved) {
    return { success: false, message: "Seat is already reserved" };
  }
  
  // Mark seat as reserved
  seat.is_reserved = true;
  
  // Create reservation
  const newReservation: Reservation = {
    id: `res${reservations.length + 1}`,
    flight_id: flightId,
    user_id: passengerId,
    seat_id: seatId,
    seat_number: seat.seat_number,
    flight_number: flight.flight_number,
    destination: flight.destination,
    departure_time: flight.departure_time,
    arrival_time: flight.arrival_time,
    reservation_time: new Date().toISOString(),
    // Legacy fields
    userId: passengerId,
    flightId: flightId,
    timestamp: new Date().toISOString(),
    seat: seat.seat_number
  };
  
  reservations.push(newReservation);
  
  return { success: true, message: "Seat booked successfully" };
};
