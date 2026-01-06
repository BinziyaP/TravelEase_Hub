# TravelEase System - Collaboration Diagram Explanation

## Overview
This Collaboration Diagram illustrates how objects in the TravelEase System interact and collaborate to accomplish specific tasks. The diagram shows the structural relationships between objects and how they work together to achieve system functionality.

## Objects in the System

### User
- **Purpose:** Represents the end user interacting with the system
- **Collaborations:** Interacts with UserController to browse packages and make bookings

### UserController
- **Purpose:** Orchestrates user-related operations
- **Collaborations:** Queries SupabaseDB, coordinates with BookingManager

### BookingManager
- **Purpose:** Manages booking operations
- **Collaborations:** Stores booking data in SupabaseDB

### AgencyController
- **Purpose:** Orchestrates agency-related operations
- **Collaborations:** Coordinates with PackageManager

### PackageManager
- **Purpose:** Manages package creation and management
- **Collaborations:** Stores package data in SupabaseDB

### AdminController
- **Purpose:** Orchestrates admin-related operations
- **Collaborations:** Updates status in SupabaseDB

### SupabaseDB
- **Purpose:** Central database for data storage
- **Collaborations:** Stores and retrieves data for all system operations

## Collaboration Scenarios

### Scenario 1: User Booking Flow

**Objective:** User browses packages and creates a booking

**Steps:**
1. User requests to browse packages
2. UserController queries SupabaseDB for package data
3. SupabaseDB returns package information
4. User selects a package and initiates booking
5. UserController routes to BookingManager
6. BookingManager stores booking in SupabaseDB

### Scenario 2: Agency Package Creation Flow

**Objective:** Agency creates a new travel package

**Steps:**
1. AgencyController routes to PackageManager
2. PackageManager stores package data in SupabaseDB

### Scenario 3: Admin Approval Flow

**Objective:** Admin approves pending packages

**Steps:**
1. AdminController updates status in SupabaseDB
2. Package/agency is approved

## Key Relationships

### Controller Objects
- UserController, AgencyController, and AdminController act as coordinators
- They query and update SupabaseDB for data operations

### Manager Objects
- BookingManager and PackageManager handle business logic
- They interact directly with SupabaseDB for data operations

### Database Object
- SupabaseDB is the central data repository
- All controllers and managers interact with SupabaseDB

