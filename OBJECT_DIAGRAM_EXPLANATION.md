# TravelEase System - Object Diagram Explanation

## Overview
This Object Diagram illustrates the runtime state of the TravelEase system by showing specific object instances and their relationships. Unlike the Class Diagram which shows the structure, this diagram demonstrates actual objects with real attribute values, providing a snapshot of how the system looks at a particular moment in time. This visualization helps understand real-time relationships and data flow within the system, demonstrating how user objects interact with various other system entities like bookings, packages, and wishlists.

## Objects and Their Attributes

### 1. User1 Object
- **Class:** `User`
- **Attributes:**
  - `user_id = "550e8400-e29b-41d4-a716-446655440000"`
  - `email = "john.doe@example.com"`
  - `password_hash = "$2a$12$..."`
  - `full_name = "John Doe"`
  - `user_type = "user"`
  - `created_at = "2024-01-15 10:30:00"`
- **Description:** Represents a regular user account in the system. This user has registered and created an account on the platform.
- **Relationships:** Connected to `RegularUser1` and `TravelAgency1`.

### 2. RegularUser1 Object
- **Class:** `RegularUser`
- **Attributes:**
  - `user_id = "550e8400-e29b-41d4-a716-446655440000"`
  - `phone = "+91 9876543210"`
  - `date_of_birth = "1990-05-15"`
- **Description:** Represents the traveler profile associated with User1. This object contains additional information specific to regular users who book travel packages.
- **Relationships:**
  - Connected from `User1`
  - Connected to `Booking1`
  - Connected to `Wishlist1`

### 3. TravelAgency1 Object
- **Class:** `TravelAgency`
- **Attributes:**
  - `agency_id = "660e8400-e29b-41d4-a716-446655440001"`
  - `user_id = "770e8400-e29b-41d4-a716-446655440002"`
  - `agency_name = "Paradise Travels"`
  - `contact_person = "Rajesh Kumar"`
  - `phone = "+91 9876543211"`
  - `business_license_number = "BL2024001234"`
  - `status = "approved"`
  - `city = "Mumbai"`
  - `state = "Maharashtra"`
- **Description:** Represents a travel agency that has been approved by an administrator. This agency can create and manage travel packages on the platform.
- **Relationships:**
  - Connected from `User1`
  - Connected to `Package1`

### 4. Package1 Object
- **Class:** `Package`
- **Attributes:**
  - `package_id = "880e8400-e29b-41d4-a716-446655440003"`
  - `agency_id = "660e8400-e29b-41d4-a716-446655440001"`
  - `package_name = "Kerala Backwaters Tour"`
  - `destination = "Kerala"`
  - `duration_days = 5`
  - `price = 25000.00`
  - `max_travelers = 10`
  - `description = "5-day tour of Kerala backwaters"`
  - `status = "approved"`
- **Description:** Represents a travel package created by TravelAgency1. This package has been approved by an administrator and is available for booking by regular users.
- **Relationships:**
  - Connected from `TravelAgency1`
  - Connected to `Booking1`
  - Connected to `Wishlist1`

### 5. Booking1 Object
- **Class:** `Booking`
- **Attributes:**
  - `booking_id = "990e8400-e29b-41d4-a716-446655440004"`
  - `package_id = "880e8400-e29b-41d4-a716-446655440003"`
  - `user_id = "550e8400-e29b-41d4-a716-446655440000"`
  - `customer_name = "John Doe"`
  - `customer_email = "john.doe@example.com"`
  - `customer_phone = "+91 9876543210"`
  - `travel_date = "2024-08-15"`
  - `number_of_travelers = 2`
  - `total_price = 50000.00`
  - `booking_status = "confirmed"`
  - `payment_status = "completed"`
  - `booking_reference = "BK-20240815-0001"`
- **Description:** Represents a confirmed booking made by RegularUser1 for Package1. The booking is for 2 travelers on August 15, 2024, with a total price of ₹50,000. The payment has been completed and the booking is confirmed.
- **Relationships:**
  - Connected from `RegularUser1`
  - Connected from `Package1`
  - Connected to `Payment1`

### 6. Payment1 Object
- **Class:** `Payment`
- **Attributes:**
  - `payment_id = "aa0e8400-e29b-41d4-a716-446655440005"`
  - `booking_id = "990e8400-e29b-41d4-a716-446655440004"`
  - `user_id = "550e8400-e29b-41d4-a716-446655440000"`
  - `amount = 50000.00`
  - `payment_status = "completed"`
  - `payment_method = "razorpay"`
  - `payment_date = "2024-07-20 14:30:00"`
  - `payment_receipt = "receipt_20240720_001.pdf"`
- **Description:** Represents the payment transaction for Booking1. The payment of ₹50,000 was completed successfully using Razorpay payment gateway on July 20, 2024. A payment receipt has been generated.
- **Relationships:**
  - Connected from `Booking1`

### 7. Wishlist1 Object
- **Class:** `Wishlist`
- **Attributes:**
  - `wishlist_id = "bb0e8400-e29b-41d4-a716-446655440006"`
  - `user_id = "550e8400-e29b-41d4-a716-446655440000"`
  - `package_id = "880e8400-e29b-41d4-a716-446655440003"`
  - `created_at = "2024-07-10 09:15:00"`
- **Description:** Represents a package saved to the wishlist by RegularUser1. The user added Package1 to their wishlist on July 10, 2024, before making the booking.
- **Relationships:**
  - Connected from `RegularUser1`
  - Connected from `Package1`

## Relationships Between Objects

### 1. User1 to RegularUser1
- **Relationship Type:** One-to-One
- **Description:** User1 owns RegularUser1. The user_id in RegularUser1 matches the user_id in User1, establishing the ownership relationship.

### 2. User1 to TravelAgency1
- **Relationship Type:** One-to-One
- **Description:** User1 manages TravelAgency1. The travel agency account is linked to a user account, though in this example they have different user_ids to show they are separate accounts.

### 3. RegularUser1 to Booking1
- **Relationship Type:** One-to-Many
- **Description:** RegularUser1 made Booking1. The user_id in Booking1 matches the user_id in RegularUser1, showing that this booking belongs to this user.

### 4. Package1 to Booking1
- **Relationship Type:** One-to-Many
- **Description:** Package1 is included in Booking1. The package_id in Booking1 matches the package_id in Package1, indicating which package was booked.

### 5. Booking1 to Payment1
- **Relationship Type:** One-to-One
- **Description:** Booking1 has Payment1. The booking_id in Payment1 matches the booking_id in Booking1, showing that this payment is associated with this specific booking.

### 6. RegularUser1 to Wishlist1
- **Relationship Type:** One-to-Many
- **Description:** RegularUser1 maintains Wishlist1. The user_id in Wishlist1 matches the user_id in RegularUser1, indicating which user saved this package.

### 7. Package1 to Wishlist1
- **Relationship Type:** One-to-Many
- **Description:** Package1 is included in Wishlist1. The package_id in Wishlist1 matches the package_id in Package1, showing which package was saved.

### 8. TravelAgency1 to Package1
- **Relationship Type:** One-to-Many
- **Description:** TravelAgency1 created Package1. The agency_id in Package1 matches the agency_id in TravelAgency1, establishing the ownership of the package by the agency.

## System Flow Demonstrated

This object diagram demonstrates a complete booking flow:

1. **User Registration:** User1 creates an account and becomes RegularUser1
2. **Agency Setup:** TravelAgency1 (Paradise Travels) is approved and creates Package1
3. **Package Discovery:** RegularUser1 adds Package1 to their Wishlist1
4. **Booking Creation:** RegularUser1 creates Booking1 for Package1
5. **Payment Processing:** Payment1 is processed for Booking1
6. **Booking Confirmation:** Booking1 status changes to "confirmed" after successful payment

This snapshot shows the system state after a successful booking transaction, demonstrating how all the objects interact and relate to each other in a real-world scenario.






