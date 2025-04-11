
// Mock database for the airport flight management system
const fs = require('fs');
const path = require('path');

// DB file paths
const usersFilePath = path.join(__dirname, 'users.json');
const flightsFilePath = path.join(__dirname, 'flights.json');
const gatesFilePath = path.join(__dirname, 'gates.json');
const runwaysFilePath = path.join(__dirname, 'runways.json');
const notificationsFilePath = path.join(__dirname, 'notifications.json');
const reservationsFilePath = path.join(__dirname, 'reservations.json');

// Helper functions to read and write DB files
const readDbFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

const writeDbFile = (filePath, data) => {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Initialize DB with default data if needed
const initializeDb = () => {
  // Default users
  if (!fs.existsSync(usersFilePath)) {
    const defaultUsers = [
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
    writeDbFile(usersFilePath, defaultUsers);
  }

  // Default flights
  if (!fs.existsSync(flightsFilePath)) {
    const defaultFlights = [
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
    writeDbFile(flightsFilePath, defaultFlights);
  }

  // Default gates
  if (!fs.existsSync(gatesFilePath)) {
    const defaultGates = [
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
    writeDbFile(gatesFilePath, defaultGates);
  }

  // Default runways
  if (!fs.existsSync(runwaysFilePath)) {
    const defaultRunways = [
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
    writeDbFile(runwaysFilePath, defaultRunways);
  }

  // Default notifications
  if (!fs.existsSync(notificationsFilePath)) {
    const defaultNotifications = [
      {
        id: "notif1",
        message: "All flights are operating as scheduled today",
        timestamp: "2023-06-14T10:00:00Z",
        sender: {
          id: "1",
          role: "admin"
        },
        targetType: "all",
        senderRole: "admin"
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
        targetId: "flight1",
        flightId: "flight1",
        senderRole: "staff"
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
        targetId: "flight2",
        flightId: "flight2",
        senderRole: "airline"
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
        targetId: "staff",
        senderRole: "admin"
      }
    ];
    writeDbFile(notificationsFilePath, defaultNotifications);
  }

  // Default reservations
  if (!fs.existsSync(reservationsFilePath)) {
    const defaultReservations = [
      {
        id: "res1",
        flightId: "flight1",
        passengerId: "4",
        userId: "4", // Legacy field for compatibility
        seatId: "A1",
        seat: "A1", // Legacy field for compatibility
        timestamp: "2023-06-10T12:00:00Z",
        status: "confirmed"
      },
      {
        id: "res2",
        flightId: "flight2",
        passengerId: "5",
        userId: "5",
        seatId: "A2",
        seat: "A2",
        timestamp: "2023-06-11T14:30:00Z",
        status: "confirmed"
      },
      {
        id: "res3",
        flightId: "flight2",
        passengerId: "5",
        userId: "5",
        seatId: "B2",
        seat: "B2",
        timestamp: "2023-06-11T14:35:00Z",
        status: "confirmed"
      },
      {
        id: "res4",
        flightId: "flight3",
        passengerId: "4",
        userId: "4",
        seatId: "A1",
        seat: "A1",
        timestamp: "2023-06-12T09:15:00Z",
        status: "confirmed"
      },
      {
        id: "res5",
        flightId: "flight3",
        passengerId: "4",
        userId: "4",
        seatId: "B1",
        seat: "B1",
        timestamp: "2023-06-12T09:20:00Z",
        status: "confirmed"
      },
      {
        id: "res6",
        flightId: "flight3",
        passengerId: "4",
        userId: "4",
        seatId: "C1",
        seat: "C1",
        timestamp: "2023-06-12T09:25:00Z",
        status: "confirmed"
      }
    ];
    writeDbFile(reservationsFilePath, defaultReservations);
  }
};

// Initialize the database on startup
initializeDb();

// Export database operations
module.exports = {
  // Users
  getUsers: () => readDbFile(usersFilePath),
  getUserById: (id) => {
    const users = readDbFile(usersFilePath);
    return users.find(user => user.id === id) || null;
  },
  getUserByCredentials: (username, password) => {
    const users = readDbFile(usersFilePath);
    return users.find(user => user.username === username && user.password === password) || null;
  },
  addUser: (user) => {
    const users = readDbFile(usersFilePath);
    const newUser = {
      ...user,
      id: `user${users.length + 1}`
    };
    users.push(newUser);
    writeDbFile(usersFilePath, users);
    return newUser;
  },
  updateUser: (id, userData) => {
    const users = readDbFile(usersFilePath);
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = { ...users[index], ...userData };
    users[index] = updatedUser;
    writeDbFile(usersFilePath, users);
    return updatedUser;
  },
  deleteUser: (id) => {
    const users = readDbFile(usersFilePath);
    const filtered = users.filter(user => user.id !== id);
    if (filtered.length === users.length) return false;
    
    writeDbFile(usersFilePath, filtered);
    return true;
  },
  
  // Flights
  getFlights: () => readDbFile(flightsFilePath),
  getFlightById: (id) => {
    const flights = readDbFile(flightsFilePath);
    return flights.find(flight => flight.id === id) || null;
  },
  getFlightsByAirline: (airlineId) => {
    const flights = readDbFile(flightsFilePath);
    return flights.filter(flight => flight.airline === airlineId);
  },
  addFlight: (flight) => {
    const flights = readDbFile(flightsFilePath);
    const newFlight = {
      ...flight,
      id: `flight${flights.length + 1}`,
      availableSeats: flight.availableSeats || [],
      bookedSeats: flight.bookedSeats || []
    };
    flights.push(newFlight);
    writeDbFile(flightsFilePath, flights);
    return newFlight;
  },
  updateFlight: (id, flightData) => {
    const flights = readDbFile(flightsFilePath);
    const index = flights.findIndex(flight => flight.id === id);
    if (index === -1) return null;
    
    const updatedFlight = { ...flights[index], ...flightData };
    flights[index] = updatedFlight;
    writeDbFile(flightsFilePath, flights);
    return updatedFlight;
  },
  deleteFlight: (id) => {
    const flights = readDbFile(flightsFilePath);
    const filtered = flights.filter(flight => flight.id !== id);
    if (filtered.length === flights.length) return false;
    
    writeDbFile(flightsFilePath, filtered);
    return true;
  },
  
  // Gates
  getGates: () => readDbFile(gatesFilePath),
  getGateById: (id) => {
    const gates = readDbFile(gatesFilePath);
    return gates.find(gate => gate.id === id) || null;
  },
  getAvailableGates: (startTime, endTime) => {
    const gates = readDbFile(gatesFilePath);
    return gates.filter(gate => {
      if (gate.isAvailable) return true;
      
      const hasOverlap = gate.scheduledFlights.some(booking => {
        return (
          (booking.from <= startTime && booking.to > startTime) ||
          (booking.from < endTime && booking.to >= endTime) ||
          (startTime <= booking.from && endTime >= booking.to)
        );
      });
      
      return !hasOverlap;
    });
  },
  assignGate: (flightId, gateId, from, to) => {
    const flights = readDbFile(flightsFilePath);
    const gates = readDbFile(gatesFilePath);
    
    const flightIndex = flights.findIndex(flight => flight.id === flightId);
    const gateIndex = gates.findIndex(gate => gate.id === gateId);
    
    if (flightIndex === -1 || gateIndex === -1) return null;
    
    // Update flight with gate
    flights[flightIndex].gate = gates[gateIndex].name;
    
    // Update gate schedule
    gates[gateIndex].isAvailable = false;
    gates[gateIndex].scheduledFlights.push({
      flightId,
      from,
      to
    });
    
    writeDbFile(flightsFilePath, flights);
    writeDbFile(gatesFilePath, gates);
    
    return flights[flightIndex];
  },
  
  // Runways
  getRunways: () => readDbFile(runwaysFilePath),
  getRunwayById: (id) => {
    const runways = readDbFile(runwaysFilePath);
    return runways.find(runway => runway.id === id) || null;
  },
  getAvailableRunways: (startTime, endTime) => {
    const runways = readDbFile(runwaysFilePath);
    return runways.filter(runway => {
      if (runway.isAvailable) return true;
      
      const hasOverlap = runway.scheduledUse.some(booking => {
        return (
          (booking.from <= startTime && booking.to > startTime) ||
          (booking.from < endTime && booking.to >= endTime) ||
          (startTime <= booking.from && endTime >= booking.to)
        );
      });
      
      return !hasOverlap;
    });
  },
  assignRunway: (flightId, runwayId, from, to) => {
    const flights = readDbFile(flightsFilePath);
    const runways = readDbFile(runwaysFilePath);
    
    const flightIndex = flights.findIndex(flight => flight.id === flightId);
    const runwayIndex = runways.findIndex(runway => runway.id === runwayId);
    
    if (flightIndex === -1 || runwayIndex === -1) return null;
    
    // Update flight with runway
    flights[flightIndex].runway = runways[runwayIndex].name;
    
    // Update runway schedule
    runways[runwayIndex].isAvailable = false;
    runways[runwayIndex].scheduledUse.push({
      flightId,
      from,
      to
    });
    
    writeDbFile(flightsFilePath, flights);
    writeDbFile(runwaysFilePath, runways);
    
    return flights[flightIndex];
  },
  
  // Notifications
  getNotifications: () => readDbFile(notificationsFilePath),
  getNotificationById: (id) => {
    const notifications = readDbFile(notificationsFilePath);
    return notifications.find(notification => notification.id === id) || null;
  },
  getNotificationsForUser: (userId) => {
    const notifications = readDbFile(notificationsFilePath);
    const user = module.exports.getUserById(userId);
    if (!user) return [];
  
    return notifications.filter(notif => {
      // All notifications
      if (notif.targetType === "all") return true;
      
      // Role-specific notifications
      if (notif.targetType === "role" && notif.targetId === user.role) return true;
      
      // Flight-specific notifications for passengers
      if (notif.targetType === "flight" && user.role === "passenger") {
        return user.flightIds?.includes(notif.targetId || "");
      }
      
      // Airline users can see their flight notifications
      if (notif.targetType === "flight" && user.role === "airline") {
        const flight = module.exports.getFlightById(notif.targetId || "");
        return flight?.airline === user.airlineId;
      }
      
      // Admin and staff can see all notifications
      return user.role === "admin" || user.role === "staff";
    });
  },
  addNotification: (notification) => {
    const notifications = readDbFile(notificationsFilePath);
    const newNotification = {
      ...notification,
      id: `notif${notifications.length + 1}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      senderRole: notification.sender.role
    };
    
    // Add flightId field for consistency if targetType is flight
    if (notification.targetType === "flight" && notification.targetId) {
      newNotification.flightId = notification.targetId;
    }
    
    notifications.push(newNotification);
    writeDbFile(notificationsFilePath, notifications);
    return newNotification;
  },
  
  // Reservations
  getReservations: () => readDbFile(reservationsFilePath),
  getReservationById: (id) => {
    const reservations = readDbFile(reservationsFilePath);
    return reservations.find(reservation => reservation.id === id) || null;
  },
  getReservationsByUser: (userId) => {
    const reservations = readDbFile(reservationsFilePath);
    return reservations.filter(reservation => reservation.passengerId === userId || reservation.userId === userId);
  },
  getReservationsByFlight: (flightId) => {
    const reservations = readDbFile(reservationsFilePath);
    return reservations.filter(reservation => reservation.flightId === flightId);
  },
  addReservation: (reservation) => {
    const reservations = readDbFile(reservationsFilePath);
    const flights = readDbFile(flightsFilePath);
    
    // Find the flight
    const flightIndex = flights.findIndex(flight => flight.id === reservation.flightId);
    if (flightIndex === -1) return { success: false, message: "Flight not found" };
    
    const flight = flights[flightIndex];
    
    // Check if seat is available
    if (!flight.availableSeats.includes(reservation.seatId)) {
      return { success: false, message: "Seat is not available" };
    }
    
    // Add reservation
    const newReservation = {
      ...reservation,
      id: `res${reservations.length + 1}`,
      timestamp: new Date().toISOString(),
      status: "confirmed",
      // Add legacy fields for compatibility
      userId: reservation.passengerId,
      seat: reservation.seatId
    };
    
    reservations.push(newReservation);
    writeDbFile(reservationsFilePath, reservations);
    
    // Update flight
    flight.availableSeats = flight.availableSeats.filter(s => s !== reservation.seatId);
    flight.bookedSeats.push({
      seatId: reservation.seatId,
      passengerId: reservation.passengerId
    });
    
    // Update user's flightIds
    const users = readDbFile(usersFilePath);
    const userIndex = users.findIndex(user => user.id === reservation.passengerId);
    if (userIndex !== -1) {
      if (!users[userIndex].flightIds) {
        users[userIndex].flightIds = [];
      }
      if (!users[userIndex].flightIds.includes(reservation.flightId)) {
        users[userIndex].flightIds.push(reservation.flightId);
      }
      writeDbFile(usersFilePath, users);
    }
    
    writeDbFile(flightsFilePath, flights);
    
    return { success: true, reservation: newReservation };
  },
  updateReservationStatus: (id, status) => {
    const reservations = readDbFile(reservationsFilePath);
    const index = reservations.findIndex(reservation => reservation.id === id);
    if (index === -1) return null;
    
    reservations[index].status = status;
    writeDbFile(reservationsFilePath, reservations);
    return reservations[index];
  }
};
