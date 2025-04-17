
// API utilities for AJAX requests
import { Flight, User, Notification, Gate, Runway, Reservation } from "./types";

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
  getAvailable: () => apiFetch<Gate[]>("/gates/available"),
  assign: (flightId: string, gateId: string) => 
    apiFetch<Flight>(`/flights/${flightId}/gate`, "PUT", { gateId }),
};

// Runway API
export const runwayApi = {
  getAll: () => apiFetch<Runway[]>("/runways"),
  getAvailable: () => apiFetch<Runway[]>("/runways/available"),
  assign: (flightId: string, runwayId: string) => 
    apiFetch<Flight>(`/flights/${flightId}/runway`, "PUT", { runwayId }),
};

// Notification API
export const notificationApi = {
  getAll: () => apiFetch<Notification[]>("/notifications"),
  getForUser: (userId: string) => apiFetch<Notification[]>(`/notifications/user/${userId}`),
  create: (notification: { title: string, message: string, target_role: string, flight_id?: string }) => 
    apiFetch<Notification>("/notifications", "POST", notification),
};

// Reservation API
export const reservationApi = {
  getAll: () => apiFetch<Reservation[]>("/reservations"),
  getForUser: (userId: string) => apiFetch<Reservation[]>(`/reservations/user/${userId}`),
  getForFlight: (flightId: string) => apiFetch<Reservation[]>(`/reservations/flight/${flightId}`),
  create: (reservation: { flight_id: string, user_id: string, seat_number: string }) => 
    apiFetch<{ success: boolean, reservation: Reservation }>("/reservations", "POST", reservation),
};
