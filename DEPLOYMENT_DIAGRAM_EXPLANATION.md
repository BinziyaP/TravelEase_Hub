# TravelEase System - Deployment Diagram Explanation

## Overview
This Deployment Diagram illustrates the deployment architecture of the TravelEase System, showing how various software components are deployed across different environments and how they interact with each other.

## Deployment Nodes

### 1. User Device
Represents the client-side environment where users interact with the TravelEase platform.

#### React Frontend
- **Technology:** React with Vite
- **Functionality:** Provides user interface for browsing packages, making bookings, and managing profile
- **Communication:** Communicates with Application Server via HTTP/HTTPS

### 2. Application Server
Represents the backend server environment that hosts the core application logic.

#### Express.js App
- **Technology:** Node.js with Express.js
- **Functionality:** Handles HTTP requests, processes business logic, manages API endpoints
- **Communication:** Connects to Supabase Services, Google APIs, and Payment Gateway

#### Authentication Handler
- **Purpose:** Manages user authentication and authorization
- **Functionality:** Handles login, registration, OTP verification, session management
- **Communication:** Connects to Supabase Auth

### 3. Supabase Services
Represents the cloud-based backend services provided by Supabase.

#### Supabase Auth
- **Purpose:** User authentication service
- **Functionality:** Manages user accounts, authentication, and security

#### Supabase DB
- **Technology:** PostgreSQL database
- **Purpose:** Central data storage for the system
- **Functionality:** Stores user data, packages, bookings, and payments

#### Supabase Storage
- **Purpose:** Cloud storage for media files
- **Functionality:** Stores package images and user documents

### 4. Google APIs
Represents external Google services integrated into the system.

#### Google Maps API
- **Purpose:** Provides mapping and location services
- **Functionality:** Displays maps, provides geocoding, generates route maps

#### Gmail API
- **Purpose:** Handles email-based OTP verification
- **Functionality:** Sends OTP emails for user verification

### 5. Payment Gateway
Represents external payment processing services.

#### Razorpay/Stripe
- **Purpose:** Handles payment processing for bookings
- **Functionality:** Processes payments, manages transactions and refunds

## Data Flow

### User Registration Flow
1. User interacts with React Frontend
2. React Frontend sends request to Express.js App
3. Express.js App routes to Authentication Handler
4. Authentication Handler connects to Supabase Auth
5. Express.js App sends OTP request to Gmail API
6. User verifies OTP and receives authentication token

### Package Booking Flow
1. User browses packages on React Frontend
2. React Frontend sends request to Express.js App
3. Express.js App queries Supabase DB for package data
4. Express.js App requests location data from Google Maps API
5. User creates booking and payment is processed through Payment Gateway
6. Booking data is stored in Supabase DB
