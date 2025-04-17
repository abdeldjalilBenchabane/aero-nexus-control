// Mock database for the airport flight management system
export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "staff" | "airline" | "passenger";
  firstName: string;
  lastName: string;
  email: string;
  airlineId?: string; // Only for airline users
  flightIds?: string[]; // For passengers - flights they are booked on
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: "scheduled" | "boarding" | "departed" | "arrived" | "delayed" | "cancelled";
  gate?: string;
  runway?: string;
  availableSeats: string[]; // Array of seat identifiers (e.g., "A1", "B2")
  bookedSeats: {
    seatId: string;
    passengerId: string;
  }[];
}

export interface Gate {
  id: string;
  name: string;
  terminal: string;
  isAvailable: boolean;
  scheduledFlights: {
    flightId: string;
    from: string; // ISO date string
    to: string; // ISO date string
  }[];
}

export interface Runway {
  id: string;
  name: string;
  isAvailable: boolean;
  scheduledUse: {
    flightId: string;
    from: string; // ISO date string
    to: string; // ISO date string
  }[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  sender: {
    id: string;
    role: "admin" | "staff" | "airline";
  };
  targetType: "all" | "role" | "flight";
  targetId?: string; // Role name or flight ID
  flightId?: string; // Related flight ID for notifications about flights
  senderRole?: string; // Role of the sender for display purposes
}

// Mock data
export const users: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@airport.com"
  },
  {
    id: "2",
    username: "staff1",
    password: "staff123",
    role: "staff",
    firstName: "Staff",
    lastName: "Member",
    email: "staff@airport.com"
  },
  {
    id: "3",
    username: "airline1",
    password: "airline123",
    role: "airline",
    firstName: "Airline",
    lastName: "Rep",
    email: "airline@skyways.com",
    airlineId: "skyways"
  },
  {
    id: "4",
    username: "passenger1",
    password: "passenger123",
    role: "passenger",
    firstName: "John",
    lastName: "Traveler",
    email: "john@example.com",
    flightIds: ["flight1", "flight3"]
  },
  {
    id: "5",
    username: "passenger2",
    password: "passenger123",
    role: "passenger",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    flightIds: ["flight2"]
  }
];

export const flights: Flight[] = [
  {
    id: "flight1",
    flightNumber: "SK101",
    airline: "skyways",
    origin: "New York (JFK)",
    destination: "London (LHR)",
    departureTime: "2023-06-15T08:00:00Z",
    arrivalTime: "2023-06-15T20:00:00Z",
    status: "scheduled",
    gate: "A1",
    runway: "R1",
    availableSeats: ["A2", "A3", "B1", "B2", "C1", "C2"],
    bookedSeats: [
      {
        seatId: "A1",
        passengerId: "4"
      }
    ]
  },
  {
    id: "flight2",
    flightNumber: "SK202",
    airline: "skyways",
    origin: "London (LHR)",
    destination: "Paris (CDG)",
    departureTime: "2023-06-16T10:00:00Z",
    arrivalTime: "2023-06-16T12:00:00Z",
    status: "scheduled",
    gate: "B3",
    runway: "R2",
    availableSeats: ["A1", "A3", "B1", "B3", "C1", "C3"],
    bookedSeats: [
      {
        seatId: "A2",
        passengerId: "5"
      },
      {
        seatId: "B2",
        passengerId: "5"
      }
    ]
  },
  {
    id: "flight3",
    flightNumber: "SK303",
    airline: "skyways",
    origin: "Paris (CDG)",
    destination: "Tokyo (HND)",
    departureTime: "2023-06-17T14:00:00Z",
    arrivalTime: "2023-06-18T10:00:00Z",
    status: "scheduled",
    gate: "C2",
    runway: "R3",
    availableSeats: ["A2", "A3", "B2", "B3", "C2", "C3"],
    bookedSeats: [
      {
        seatId: "A1",
        passengerId: "4"
      },
      {
        seatId: "B1",
        passengerId: "4"
      },
      {
        seatId: "C1",
        passengerId: "4"
      }
    ]
  }
];

export const gates: Gate[] = [
  {
    id: "gate1",
    name: "A1",
    terminal: "Terminal 1",
    isAvailable: false,
    scheduledFlights: [
      {
        flightId: "flight1",
        from: "2023-06-15T07:00:00Z",
        to: "2023-06-15T09:00:00Z"
      }
    ]
  },
  {
    id: "gate2",
    name: "B3",
    terminal: "Terminal 2",
    isAvailable: false,
    scheduledFlights: [
      {
        flightId: "flight2",
        from: "2023-06-16T09:00:00Z",
        to: "2023-06-16T11:00:00Z"
      }
    ]
  },
  {
    id: "gate3",
    name: "C2",
    terminal: "Terminal 3",
    isAvailable: false,
    scheduledFlights: [
      {
        flightId: "flight3",
        from: "2023-06-17T13:00:00Z",
        to: "2023-06-17T15:00:00Z"
      }
    ]
  },
  {
    id: "gate4",
    name: "A2",
    terminal: "Terminal 1",
    isAvailable: true,
    scheduledFlights: []
  },
  {
    id: "gate5",
    name: "B2",
    terminal: "Terminal 2",
    isAvailable: true,
    scheduledFlights: []
  }
];

export const runways: Runway[] = [
  {
    id: "runway1",
    name: "R1",
    isAvailable: false,
    scheduledUse: [
      {
        flightId: "flight1",
        from: "2023-06-15T08:00:00Z",
        to: "2023-06-15T08:30:00Z"
      }
    ]
  },
  {
    id: "runway2",
    name: "R2",
    isAvailable: false,
    scheduledUse: [
      {
        flightId: "flight2",
        from: "2023-06-16T10:00:00Z",
        to: "2023-06-16T10:30:00Z"
      }
    ]
  },
  {
    id: "runway3",
    name: "R3",
    isAvailable: false,
    scheduledUse: [
      {
        flightId: "flight3",
        from: "2023-06-17T14:00:00Z",
        to: "2023-06-17T14:30:00Z"
      }
    ]
  },
  {
    id: "runway4",
    name: "R4",
    isAvailable: true,
    scheduledUse: []
  }
];

export const notifications: Notification[] = [
  {
    id: "notif1",
    message: "All flights are operating as scheduled today",
    timestamp: "2023-06-14T10:00:00Z",
    sender: {
      id: "1",
      role: "admin"
    },
    targetType: "all"
  },
  {
    id: "notif2",
    message: "Flight SK101 is now boarding at Gate A1",
    timestamp: "2023-06-15T07:30:00Z",
    sender: {
      id: "2",
      role: "staff"
    },
    targetType: "flight",
    targetId: "flight1"
  },
  {
    id: "notif3",
    message: "Flight SK202 is delayed by 30 minutes",
    timestamp: "2023-06-16T09:00:00Z",
    sender: {
      id: "3",
      role: "airline"
    },
    targetType: "flight",
    targetId: "flight2"
  },
  {
    id: "notif4",
    message: "System maintenance scheduled for tonight",
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
export const getUser = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username && u.password === password);
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
  return flights.filter(f => f.airline === airlineId);
};

export const getPassengerFlights = (passengerId: string): Flight[] => {
  const user = users.find(u => u.id === passengerId && u.role === "passenger");
  if (!user || !user.flightIds) return [];
  
  return flights.filter(f => user.flightIds?.includes(f.id));
};

export const getNotificationsForUser = (userId: string): Notification[] => {
  const user = getUserById(userId);
  if (!user) return [];

  return notifications.filter(notif => {
    // All notifications
    if (notif.targetType === "all") return true;
    
    // Role-specific notifications
    if (notif.targetType === "role" && notif.targetId === user.role) return true;
    
    // Flight-specific notifications
    if (notif.targetType === "flight" && user.role === "passenger") {
      return user.flightIds?.includes(notif.targetId || "");
    }
    
    // Airline users can see their flight notifications
    if (notif.targetType === "flight" && user.role === "airline") {
      const flight = getFlightById(notif.targetId || "");
      return flight?.airline === user.airlineId;
    }
    
    // Admin and staff can see all notifications
    return user.role === "admin" || user.role === "staff";
  });
};

export const getAvailableGates = (startTime: string, endTime: string): Gate[] => {
  return gates.filter(gate => {
    if (gate.isAvailable) return true;
    
    // Check if there are any overlapping bookings
    const hasOverlap = gate.scheduledFlights.some(booking => {
      return (
        (booking.from <= startTime && booking.to > startTime) ||
        (booking.from < endTime && booking.to >= endTime) ||
        (startTime <= booking.from && endTime >= booking.to)
      );
    });
    
    return !hasOverlap;
  });
};

export const getAvailableRunways = (startTime: string, endTime: string): Runway[] => {
  return runways.filter(runway => {
    if (runway.isAvailable) return true;
    
    // Check if there are any overlapping bookings
    const hasOverlap = runway.scheduledUse.some(booking => {
      return (
        (booking.from <= startTime && booking.to > startTime) ||
        (booking.from < endTime && booking.to >= endTime) ||
        (startTime <= booking.from && endTime >= booking.to)
      );
    });
    
    return !hasOverlap;
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

// Reservation interface
export interface Reservation {
  id: string;
  flightId: string;
  passengerId: string;
  seatId: string;
  timestamp: string;
  status: "confirmed" | "cancelled" | "checked-in";
  userId?: string; // Legacy field for compatibility
  seat?: string;   // Legacy field for compatibility
}

// Mock reservations data
export const reservations: Reservation[] = [
  {
    id: "res1",
    flightId: "flight1",
    passengerId: "4",
    seatId: "A1",
    timestamp: "2023-06-10T12:00:00Z",
    status: "confirmed"
  },
  {
    id: "res2",
    flightId: "flight2",
    passengerId: "5",
    seatId: "A2",
    timestamp: "2023-06-11T14:30:00Z",
    status: "confirmed"
  },
  {
    id: "res3",
    flightId: "flight2",
    passengerId: "5",
    seatId: "B2",
    timestamp: "2023-06-11T14:35:00Z",
    status: "confirmed"
  },
  {
    id: "res4",
    flightId: "flight3",
    passengerId: "4",
    seatId: "A1",
    timestamp: "2023-06-12T09:15:00Z",
    status: "confirmed"
  },
  {
    id: "res5",
    flightId: "flight3",
    passengerId: "4",
    seatId: "B1",
    timestamp: "2023-06-12T09:20:00Z",
    status: "confirmed"
  },
  {
    id: "res6",
    flightId: "flight3",
    passengerId: "4",
    seatId: "C1",
    timestamp: "2023-06-12T09:25:00Z",
    status: "confirmed"
  }
];

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
  
  // Check if seat is available
  if (!flight.availableSeats.includes(seatId)) {
    return { success: false, message: "Seat is not available" };
  }
  
  // Remove from available seats
  flight.availableSeats = flight.availableSeats.filter(s => s !== seatId);
  
  // Add to booked seats
  flight.bookedSeats.push({
    seatId,
    passengerId
  });
  
  // Add flight to user's flights
  const passenger = users.find(u => u.id === passengerId);
  if (passenger) {
    if (!passenger.flightIds) {
      passenger.flightIds = [];
    }
    if (!passenger.flightIds.includes(flightId)) {
      passenger.flightIds.push(flightId);
    }
  }
  
  return { success: true, message: "Seat booked successfully" };
};
