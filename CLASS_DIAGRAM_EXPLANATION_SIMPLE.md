# TravelEase System - Class Diagram Explanation

## Overview
This document explains the core components and their connections within the TravelEase system, as depicted in the Class Diagram. It outlines the main data structures (classes), their characteristics (attributes), and how they relate to each other to form the system's foundation.

## Classes and Their Attributes

### 1. User
Represents a general user account in the system. This is the base for all user types.
- `user_id` (UUID): Unique ID for the user
- `email` (string): User's email for login
- `password_hash` (string): Securely stored password
- `full_name` (string): User's full name
- `user_type` (string): Role (e.g., 'user', 'agency', 'admin')
- `created_at` (timestamp): Account creation date/time

### 2. RegularUser
Represents a traveler who books packages.
- `user_id` (UUID): Links to the base User account
- `phone` (string): Contact phone number
- `date_of_birth` (date): User's birth date

### 3. TravelAgency
Represents a business that offers travel packages.
- `agency_id` (UUID): Unique ID for the agency
- `user_id` (UUID): Links to the base User account
- `agency_name` (string): Name of the agency
- `contact_person` (string): Main contact
- `phone` (string): Agency contact number
- `business_license_number` (string): License for verification
- `status` (string): Approval status ('pending', 'approved')
- `city` (string): Agency's city
- `state` (string): Agency's state

### 4. Administrator
Represents a system admin who manages the platform.
- `admin_id` (UUID): Unique ID for the admin role
- `user_id` (UUID): Links to the base User account

### 5. Package
Represents a travel package offered by an agency.
- `package_id` (UUID): Unique ID for the package
- `agency_id` (UUID): Links to the creating TravelAgency
- `package_name` (string): Name of the package
- `destination` (string): Travel destination
- `duration_days` (int): Trip duration in days
- `price` (decimal): Price per person
- `max_travelers` (int): Max number of travelers
- `description` (string): Detailed package description
- `status` (string): Package status ('pending', 'approved')
- `itinerary` (jsonb): Day-by-day plan
- `accommodation_details` (jsonb): Hotel info
- `transportation_included` (array): List of transport options

### 6. Booking
Represents a confirmed reservation of a travel package.
- `booking_id` (UUID): Unique ID for the booking
- `package_id` (UUID): Links to the booked Package
- `user_id` (UUID): Links to the RegularUser who booked
- `customer_name` (string): Booker's name
- `customer_email` (string): Booker's email
- `customer_phone` (string): Booker's phone
- `travel_date` (date): Date of travel
- `number_of_travelers` (int): Number of people
- `total_price` (decimal): Total booking cost
- `booking_status` (string): Status ('confirmed', 'cancelled')
- `payment_status` (string): Payment status ('completed', 'pending')
- `booking_reference` (string): Unique reference number

### 7. Payment
Represents a payment transaction for a booking.
- `payment_id` (UUID): Unique ID for the payment
- `booking_id` (UUID): Links to the associated Booking
- `user_id` (UUID): Links to the RegularUser who paid
- `amount` (decimal): Payment amount
- `payment_status` (string): Status ('completed', 'failed')
- `payment_method` (string): Method (e.g., 'razorpay')
- `payment_date` (timestamp): Date and time of payment
- `payment_receipt` (string): Receipt URL or reference

### 8. Wishlist
Represents packages saved by users for later.
- `wishlist_id` (UUID): Unique ID for the wishlist item
- `user_id` (UUID): Links to the RegularUser
- `package_id` (UUID): Links to the saved Package
- `created_at` (timestamp): When added to wishlist

## Relationships Between Classes

### 1. User to RegularUser (owns)
- **Type:** One-to-One (1 to 1)
- **Description:** A `User` account can have one `RegularUser` profile.

### 2. User to TravelAgency (manages)
- **Type:** One-to-Zero or One (1 to 0..1)
- **Description:** A `User` account can optionally be linked to one `TravelAgency` profile.

### 3. User to Administrator (has)
- **Type:** One-to-Zero or One (1 to 0..1)
- **Description:** A `User` account can optionally have one `Administrator` role.

### 4. TravelAgency to Package (creates)
- **Type:** One-to-Many (1 to 0..*)
- **Description:** A `TravelAgency` can create multiple `Package`s.

### 5. RegularUser to Booking (makes) and Package to Booking (includes)
- **Type:** Many-to-Many (resolved through `Booking` class)
- **Description:** A `RegularUser` can make many `Booking`s, and a `Package` can be part of many `Booking`s. The `Booking` class records the specific details of a user booking a package.

### 6. Booking to Payment (has)
- **Type:** One-to-One (1 to 1)
- **Description:** Each `Booking` has exactly one `Payment` record.

### 7. RegularUser to Wishlist (maintains) and Package to Wishlist (included_in)
- **Type:** Many-to-Many (resolved through `Wishlist` class)
- **Description:** A `RegularUser` can save many `Package`s to their `Wishlist`, and a `Package` can be in many users' `Wishlist`s. The `Wishlist` class records which user saved which package.

### 8. Administrator to TravelAgency (approves)
- **Type:** One-to-Many (1 to 0..*)
- **Description:** An `Administrator` can approve multiple `TravelAgency` registrations.

### 9. Administrator to Package (approves)
- **Type:** One-to-Many (1 to 0..*)
- **Description:** An `Administrator` can approve multiple `Package`s created by agencies.






