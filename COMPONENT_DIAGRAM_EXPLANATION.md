# TravelEase System - Component Diagram Explanation

## Overview
This Component Diagram illustrates the architecture of the TravelEase System, showing how different software components interact with each other and with external services. The diagram demonstrates the system's modular structure, where each component has a specific responsibility and communicates with other components through well-defined interfaces.

## External Actors

### 1. Regular User
An individual who uses the platform to browse and book travel packages.

### 2. Travel Agency
A business entity that creates and manages travel packages on the platform.

### 3. Administrator
A system administrator who manages the platform and approves agencies and packages.

## Components within TravelEase System

### User-Facing Components

#### User Interface
- **Purpose:** The entry point for Regular Users to interact with the system
- **Connections:** Receives input from Regular User, sends requests to User Controller

#### User Controller
- **Purpose:** Orchestrates user-related functionalities
- **Connections:** Connects to Authentication Service, Package Browser, Booking Manager

#### Package Browser
- **Purpose:** Manages package browsing and searching functionality
- **Connections:** Connects to Supabase DB to retrieve package data

#### Booking Manager
- **Purpose:** Manages travel package booking operations
- **Connections:** Connects to Payment Manager and Supabase DB

#### Payment Manager
- **Purpose:** Handles payment processing for bookings
- **Connections:** Connects to Payment Gateway (external) and Supabase DB

### Agency-Facing Components

#### Agency Interface
- **Purpose:** The entry point for Travel Agencies to interact with the system
- **Connections:** Receives input from Travel Agency, sends requests to Agency Controller

#### Agency Controller
- **Purpose:** Orchestrates agency-related functionalities
- **Connections:** Connects to Package Manager

#### Package Manager
- **Purpose:** Manages travel package creation and management
- **Connections:** Connects to Google Maps API (external) and Supabase DB

### Admin-Facing Components

#### Admin Interface
- **Purpose:** The entry point for Administrators to interact with the system
- **Connections:** Receives input from Administrator, sends requests to Admin Controller

#### Admin Controller
- **Purpose:** Orchestrates admin-related functionalities
- **Connections:** Connects to Approval Manager

#### Approval Manager
- **Purpose:** Manages agency and package approval workflow
- **Connections:** Connects to Email Service and Supabase DB

### Core Services

#### Authentication Service
- **Purpose:** Handles user authentication and authorization
- **Connections:** Connects to Supabase DB

#### Email Service
- **Purpose:** Handles email notifications
- **Connections:** Connects to Supabase DB

### Database Component

#### Supabase DB
- **Purpose:** Central database for the system
- **Connections:** Receives connections from all major components

## Component Interactions

### User Booking Flow
1. User interacts with User Interface
2. User Controller routes to Package Browser for package selection
3. Package Browser retrieves data from Supabase DB
4. User Controller routes to Booking Manager for booking creation
5. Booking Manager routes to Payment Manager for payment
6. Payment Manager processes payment and stores data in Supabase DB

### Agency Package Creation Flow
1. Agency interacts with Agency Interface
2. Agency Controller routes to Package Manager
3. Package Manager stores package data in Supabase DB

### Admin Approval Flow
1. Admin interacts with Admin Interface
2. Admin Controller routes to Approval Manager
3. Approval Manager updates status in Supabase DB
4. Approval Manager uses Email Service to send notifications
