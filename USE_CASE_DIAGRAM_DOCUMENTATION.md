# TravelEase System - Use Case Diagram Documentation

## Overview
This document provides the Use Case UML diagram for the TravelEase travel booking platform. The system supports three main actors: Regular Users, Travel Agencies, and Administrators.

## Actors

### 1. Regular User
A person who browses and books travel packages through the platform.

### 2. Travel Agency
A business entity that creates and manages travel packages on the platform. Agencies must be approved by administrators before they can create packages.

### 3. Administrator
A system administrator who manages the platform, approves/rejects agencies and packages, and monitors system operations.

## Use Cases by Category

### Authentication Use Cases
All actors interact with authentication features:
- **Register Account**: Create a new account in the system
- **Login**: Authenticate and access the system
- **Logout**: End the current session
- **Reset Password**: Recover account access
- **Email Verification**: Verify email address (required during registration)

### User Features (Regular User)
- **Browse Travel Packages**: View all available travel packages
- **Search Packages**: Search packages by keywords
- **Filter Packages**: Filter by price, duration, destination, number of travelers
- **View Package Details**: View comprehensive package information
- **View Package Itinerary**: View day-by-day travel itinerary (extends View Package Details)
- **View Route Map**: View interactive route map (extends View Package Details)
- **Book Travel Package**: Complete a booking for a travel package
- **Make Payment**: Process payment for booking (included in Book Travel Package)
- **View Booking History**: View all past and current bookings
- **Cancel Booking**: Cancel an existing booking
- **Add to Wishlist**: Save packages for later viewing
- **View Wishlist**: View saved packages
- **Remove from Wishlist**: Remove packages from wishlist
- **Manage Profile**: Update personal information
- **View Booking Confirmation**: View booking confirmation details (extends Book Travel Package)
- **Download Booking PDF**: Download booking confirmation as PDF (extends View Booking Confirmation)

### Agency Features (Travel Agency)
- **Register as Agency**: Register as a travel agency (requires admin approval)
- **Create Travel Package**: Create a new travel package with all details
- **Edit Package**: Modify existing package information
- **Delete Package**: Remove a package from the system
- **View Own Packages**: View all packages created by the agency
- **Set Package Pricing**: Define pricing structure (included in Create Travel Package)
- **Add Accommodations**: Add hotels and accommodations (included in Create Travel Package)
- **Add Restaurants**: Add restaurant recommendations (included in Create Travel Package)
- **Add Transportation**: Add transportation options (included in Create Travel Package)
- **Create Itinerary**: Create day-by-day itinerary plan (included in Create Travel Package)
- **View Package Bookings**: View bookings received for agency packages
- **Manage Agency Profile**: Update agency information
- **Upload License Documents**: Upload business license and verification documents

### Admin Features (Administrator)
- **Approve Agency Registration**: Approve agency registration requests
- **Reject Agency Registration**: Reject agency registration requests
- **View All Agencies**: View all registered agencies in the system
- **Approve Travel Package**: Approve packages created by agencies
- **Reject Travel Package**: Reject packages created by agencies
- **View All Packages**: View all packages in the system (pending, approved, rejected)
- **Manage Users**: Manage user accounts and permissions
- **View System Statistics**: View platform statistics and analytics
- **Manage Agency Status**: Change agency approval status
- **View Booking Reports**: View booking reports and analytics

## Relationships

### Include Relationships
- **Register Account** includes **Email Verification**
- **Book Travel Package** includes **Make Payment**
- **Create Travel Package** includes:
  - Set Package Pricing
  - Add Accommodations
  - Add Restaurants
  - Add Transportation
  - Create Itinerary

### Extend Relationships
- **View Package Itinerary** extends **View Package Details**
- **View Route Map** extends **View Package Details**
- **View Booking Confirmation** extends **Book Travel Package**
- **Download Booking PDF** extends **View Booking Confirmation**

## How to Use the Diagrams

### PlantUML Format
1. Install PlantUML plugin in your IDE (VS Code, IntelliJ, etc.)
2. Open `USE_CASE_DIAGRAM.puml`
3. The diagram will render automatically
4. Export as PNG, SVG, or PDF for your report

### Online PlantUML Editor
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the contents of `USE_CASE_DIAGRAM.puml`
3. Paste into the editor
4. Download the rendered diagram

### Mermaid Format
1. Use Mermaid Live Editor: https://mermaid.live/
2. Copy the Mermaid code from `USE_CASE_DIAGRAM_MERMAID.md`
3. Paste and render
4. Export as PNG or SVG

## Diagram Tools

### Recommended Tools:
1. **PlantUML** - Best for UML diagrams, supports all UML notations
2. **Draw.io (diagrams.net)** - Free, web-based, supports UML
3. **Lucidchart** - Professional diagramming tool
4. **Visual Paradigm** - Enterprise UML tool
5. **StarUML** - Desktop UML modeling tool

### For Academic Reports:
- Use PlantUML for accurate UML notation
- Export as high-resolution PNG or PDF
- Include in your project report document

## Notes for Project Report

When including this diagram in your project report:
1. Add a figure caption: "Figure X.X: Use Case Diagram for TravelEase System"
2. Explain the three main actors and their roles
3. Describe key use cases for each actor
4. Mention the include and extend relationships
5. Reference the diagram when discussing system functionality






