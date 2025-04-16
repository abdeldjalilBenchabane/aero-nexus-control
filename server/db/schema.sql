
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `airport_db`;
USE `airport_db`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'staff', 'airline', 'passenger') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airlines table
CREATE TABLE IF NOT EXISTS `airlines` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airplanes table
CREATE TABLE IF NOT EXISTS `airplanes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `airline_id` INT NOT NULL,
  `capacity` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`id`) ON DELETE CASCADE
);

-- Seats table
CREATE TABLE IF NOT EXISTS `seats` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `airplane_id` INT NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `airplane_seat` (`airplane_id`, `seat_number`),
  FOREIGN KEY (`airplane_id`) REFERENCES `airplanes` (`id`) ON DELETE CASCADE
);

-- Gates table
CREATE TABLE IF NOT EXISTS `gates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(10) NOT NULL UNIQUE,
  `terminal` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Runways table
CREATE TABLE IF NOT EXISTS `runways` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(10) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flights table
CREATE TABLE IF NOT EXISTS `flights` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `flight_number` VARCHAR(20) NOT NULL UNIQUE,
  `airline_id` INT NOT NULL,
  `airplane_id` INT,
  `origin` VARCHAR(100) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `departure_time` DATETIME NOT NULL,
  `arrival_time` DATETIME NOT NULL,
  `status` ENUM('scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `gate_id` INT,
  `runway_id` INT,
  `price` DECIMAL(10,2),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`airline_id`) REFERENCES `airlines` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`airplane_id`) REFERENCES `airplanes` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`gate_id`) REFERENCES `gates` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`runway_id`) REFERENCES `runways` (`id`) ON DELETE SET NULL
);

-- Reservations table
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `flight_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  `status` ENUM('confirmed', 'cancelled', 'checked-in') NOT NULL DEFAULT 'confirmed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `flight_seat` (`flight_id`, `seat_number`, `status`),
  FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `user_id` INT,
  `user_role` ENUM('admin', 'staff', 'airline'),
  `target_role` ENUM('admin', 'staff', 'airline', 'passenger'),
  `flight_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE SET NULL
);

-- User Notifications table (for tracking which users received which notifications)
CREATE TABLE IF NOT EXISTS `user_notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `notification_id` INT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_notification` (`user_id`, `notification_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
);

-- Sample data for initial setup

-- Admin user
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin User', 'admin@airport.com', 'admin123', 'admin');

-- Staff users
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Staff Member', 'staff@airport.com', 'staff123', 'staff');

-- Airlines
INSERT INTO `airlines` (`name`, `email`, `password`) VALUES
('SkyAir', 'airline@skyair.com', 'airline123'),
('EagleWings', 'airline@eaglewings.com', 'eagle123'),
('GlobeTraveler', 'airline@globetraveler.com', 'globe123');

-- Create airline users
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('SkyAir Operator', 'airline@skyair.com', 'airline123', 'airline'),
('EagleWings Operator', 'airline@eaglewings.com', 'eagle123', 'airline'),
('GlobeTraveler Operator', 'airline@globetraveler.com', 'globe123', 'airline');

-- Passengers
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('John Traveler', 'john@example.com', 'passenger123', 'passenger'),
('Jane Doe', 'jane@example.com', 'passenger123', 'passenger'),
('Bob Smith', 'bob@example.com', 'passenger123', 'passenger');

-- Airplanes
INSERT INTO `airplanes` (`name`, `airline_id`, `capacity`) VALUES
('Sky-A380', 1, 120),
('Sky-B747', 1, 180),
('Eagle-A320', 2, 80),
('Eagle-B737', 2, 100),
('Globe-A350', 3, 150);

-- Add sample seats for each airplane
-- For Sky-A380 (airplane_id = 1)
INSERT INTO `seats` (`airplane_id`, `seat_number`, `is_available`) VALUES
(1, 'A1', TRUE), (1, 'A2', TRUE), (1, 'A3', TRUE), (1, 'A4', TRUE),
(1, 'B1', TRUE), (1, 'B2', TRUE), (1, 'B3', TRUE), (1, 'B4', TRUE),
(1, 'C1', TRUE), (1, 'C2', TRUE), (1, 'C3', TRUE), (1, 'C4', TRUE);

-- For Sky-B747 (airplane_id = 2)
INSERT INTO `seats` (`airplane_id`, `seat_number`, `is_available`) VALUES
(2, 'A1', TRUE), (2, 'A2', TRUE), (2, 'A3', TRUE), (2, 'A4', TRUE),
(2, 'B1', TRUE), (2, 'B2', TRUE), (2, 'B3', TRUE), (2, 'B4', TRUE),
(2, 'C1', TRUE), (2, 'C2', TRUE), (2, 'C3', TRUE), (2, 'C4', TRUE);

-- For Eagle-A320 (airplane_id = 3)
INSERT INTO `seats` (`airplane_id`, `seat_number`, `is_available`) VALUES
(3, 'A1', TRUE), (3, 'A2', TRUE), (3, 'A3', TRUE), (3, 'A4', TRUE),
(3, 'B1', TRUE), (3, 'B2', TRUE), (3, 'B3', TRUE), (3, 'B4', TRUE),
(3, 'C1', TRUE), (3, 'C2', TRUE), (3, 'C3', TRUE), (3, 'C4', TRUE);

-- Gates
INSERT INTO `gates` (`name`, `terminal`) VALUES
('A1', 'Terminal 1'),
('A2', 'Terminal 1'),
('B1', 'Terminal 2'),
('B2', 'Terminal 2'),
('C1', 'Terminal 3');

-- Runways
INSERT INTO `runways` (`name`) VALUES
('R1'), ('R2'), ('R3');

-- Flights
INSERT INTO `flights` (`flight_number`, `airline_id`, `airplane_id`, `origin`, `destination`, `departure_time`, `arrival_time`, `status`, `gate_id`, `runway_id`, `price`) VALUES
('SK101', 1, 1, 'New York (JFK)', 'London (LHR)', '2025-06-15 08:00:00', '2025-06-15 20:00:00', 'scheduled', 1, 1, 350.00),
('SK202', 1, 2, 'London (LHR)', 'Paris (CDG)', '2025-06-16 10:00:00', '2025-06-16 12:00:00', 'scheduled', 2, 2, 120.00),
('EW101', 2, 3, 'Paris (CDG)', 'Berlin (BER)', '2025-06-17 14:00:00', '2025-06-17 16:00:00', 'scheduled', 3, 3, 180.00),
('GT505', 3, 5, 'Tokyo (HND)', 'New York (JFK)', '2025-06-18 23:00:00', '2025-06-19 12:00:00', 'scheduled', 4, 1, 850.00);

-- Sample reservations
INSERT INTO `reservations` (`flight_id`, `user_id`, `seat_number`, `status`) VALUES
(1, 4, 'A1', 'confirmed'),
(2, 5, 'B2', 'confirmed'),
(3, 6, 'C3', 'confirmed');

-- Sample notifications
INSERT INTO `notifications` (`title`, `message`, `user_id`, `user_role`, `target_role`, `flight_id`) VALUES
('System Notification', 'All flights are operating as scheduled today', 1, 'admin', NULL, NULL),
('Flight Update', 'Flight SK101 is now boarding at Gate A1', 2, 'staff', NULL, 1),
('Delay Alert', 'Flight GT505 will be delayed by 30 minutes', 3, 'airline', NULL, 4);

-- Assign notifications to users
INSERT INTO `user_notifications` (`user_id`, `notification_id`) VALUES
(4, 2), -- John gets notified about Flight SK101
(5, 3), -- Jane gets notified about Flight GT505
(6, 1); -- Bob gets the general system notification
