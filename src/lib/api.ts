
// API utilities for AJAX requests
import { Flight, User, Notification, Gate, Runway, Reservation, Airplane, Seat, Airline } from "./types";

const API_BASE_URL = "http://localhost:3001/api";

// Generic fetch wrapper
const apiFetch = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Flight API
export const flightApi = {
  getAll: () => apiFetch<Flight[]>("/flights"),
  getById: (id: string) => apiFetch<Flight>(`/flights/${id}`),
  create: (flight: Omit<Flight, "id">) => 
    apiFetch<Flight>("/flights", "POST", flight),
  update: (id: string, flight: Partial<Flight>) => apiFetch<Flight>(`/flights/${id}`, "PUT", flight),
  delete: (id: string) => apiFetch<void>(`/flights/${id}`, "DELETE"),
  getByAirline: (airlineId: string) => apiFetch<Flight[]>(`/flights/airline/${airlineId}`),
  search: (params: { origin?: string, destination?: string, date?: string }) => 
    apiFetch<Flight[]>("/flights/search", "POST", params),
  getAvailableSeats: (flightId: string) => apiFetch<Seat[]>(`/flights/${flightId}/available-seats`),
};

// User API
export const userApi = {
  getAll: () => apiFetch<User[]>("/users"),
  getById: (id: string) => apiFetch<User>(`/users/${id}`),
  create: (user: Omit<User, "id">) => apiFetch<User>("/users", "POST", user),
  update: (id: string, user: Partial<User>) => apiFetch<User>(`/users/${id}`, "PUT", user),
  delete: (id: string) => apiFetch<void>(`/users/${id}`, "DELETE"),
  login: (email: string, password: string) => 
    apiFetch<{ user: User, token: string }>("/auth/login", "POST", { email, password }),
  register: (userData: { name: string, email: string, password: string, role: string }) =>
    apiFetch<{ user: User, token: string }>("/auth/register", "POST", userData),
};

// Gate API
export const gateApi = {
  getAll: () => apiFetch<Gate[]>("/gates"),
  getById: (id: string) => apiFetch<Gate>(`/gates/${id}`),
  getAvailable: (departureTime: string, arrivalTime: string) => 
    apiFetch<Gate[]>("/gates/available", "POST", { departure_time: departureTime, arrival_time: arrivalTime }),
  create: (gate: Omit<Gate, "id">) => apiFetch<Gate>("/gates", "POST", gate),
  update: (id: string, gate: Partial<Gate>) => apiFetch<Gate>(`/gates/${id}`, "PUT", gate),
  delete: (id: string) => apiFetch<void>(`/gates/${id}`, "DELETE"),
  assign: (flightId: string, gateId: string) => 
    apiFetch<Flight>(`/flights/${flightId}/gate`, "PUT", { gateId }),
};

// Runway API
export const runwayApi = {
  getAll: () => apiFetch<Runway[]>("/runways"),
  getById: (id: string) => apiFetch<Runway>(`/runways/${id}`),
  getAvailable: (departureTime: string, arrivalTime: string) => 
    apiFetch<Runway[]>("/runways/available", "POST", { departure_time: departureTime, arrival_time: arrivalTime }),
  create: (runway: Omit<Runway, "id">) => apiFetch<Runway>("/runways", "POST", runway),
  update: (id: string, runway: Partial<Runway>) => apiFetch<Runway>(`/runways/${id}`, "PUT", runway),
  delete: (id: string) => apiFetch<void>(`/runways/${id}`, "DELETE"),
  assign: (flightId: string, runwayId: string) => 
    apiFetch<Flight>(`/flights/${flightId}/runway`, "PUT", { runwayId }),
};

// Notification API
export const notificationApi = {
  getAll: () => apiFetch<Notification[]>("/notifications"),
  getForUser: (userId: string) => apiFetch<Notification[]>(`/notifications/user/${userId}`),
  create: (notification: { title: string, message: string, target_role: string, flight_id?: string }) => 
    apiFetch<Notification>("/notifications", "POST", notification),
  delete: (id: string) => apiFetch<void>(`/notifications/${id}`, "DELETE"),
};

// Reservation API
export const reservationApi = {
  getAll: () => apiFetch<Reservation[]>("/reservations"),
  getById: (id: string) => apiFetch<Reservation>(`/reservations/${id}`),
  getForUser: (userId: string) => apiFetch<Reservation[]>(`/reservations/user/${userId}`),
  getForFlight: (flightId: string) => apiFetch<Reservation[]>(`/reservations/flight/${flightId}`),
  create: (reservation: { flight_id: string, user_id: string, seat_number: string }) => 
    apiFetch<{ success: boolean, reservation: Reservation }>("/reservations", "POST", reservation),
  cancel: (id: string) => apiFetch<Reservation>(`/reservations/${id}/cancel`, "PUT"),
};

// Airlines API
export const airlineApi = {
  getAll: () => apiFetch<Airline[]>("/airlines"),
  getById: (id: string) => apiFetch<Airline>(`/airlines/${id}`),
};

// Airplanes API
export const airplaneApi = {
  getAll: () => apiFetch<Airplane[]>("/airplanes"),
  getByAirline: (airlineId: string) => apiFetch<Airplane[]>(`/airplanes/airline/${airlineId}`),
  getAvailable: (airlineId: string, departureTime: string, arrivalTime: string) => 
    apiFetch<Airplane[]>("/airplanes/available", "POST", { 
      airline_id: airlineId, 
      departure_time: departureTime, 
      arrival_time: arrivalTime 
    }),
  create: (airplane: { name: string, airline_id: string, capacity: number }) => 
    apiFetch<Airplane>("/airplanes", "POST", airplane),
  delete: (id: string) => apiFetch<void>(`/airplanes/${id}`, "DELETE"),
};

// Seats API
export const seatApi = {
  getByFlight: (flightId: string) => apiFetch<Seat[]>(`/flights/${flightId}/seats`),
  getAvailable: (flightId: string) => apiFetch<Seat[]>(`/flights/${flightId}/seats/available`),
};
