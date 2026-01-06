4.5 TABLE DESIGN

1. Tbl_users_login  
Primary key: `id`  
Foreign keys: Referenced by `Tbl_profiles`, `Tbl_agencies`, `Tbl_bookings`, `Tbl_wishlist`, and other tables that store `user_id`.

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique identifier for each authenticated account; referenced across the schema.
2 | `email` | `varchar(320)` | Not Null, Unique | Login email; constrained to one account per email address.
3 | `encrypted_password` | `text` | Not Null | Password hash managed by Supabase authentication.
4 | `phone` | `text` | Nullable | Optional contact number captured during signup.
5 | `user_type` | `text` | Not Null, Default `'user'`, Check (`'user'`, `'agency'`, `'admin'`) | Application role that drives authorization logic.
6 | `created_at` | `timestamptz` | Not Null, Default `now()` | Timestamp when the account was created.
7 | `last_sign_in_at` | `timestamptz` | Nullable | Records the most recent successful sign-in event.

2. Tbl_profiles  
Primary key: `id`  
Foreign key: `id` references `Tbl_users_login(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, FK to `Tbl_users_login` | Mirrors the auth user id to extend profile details.
2 | `email` | `text` | Not Null, Unique | Stored copy of email for profile lookups.
3 | `full_name` | `text` | Nullable | Traveler’s display name.
4 | `avatar_url` | `text` | Nullable | Optional profile picture URL.
5 | `phone` | `text` | Nullable | Contact number for notifications.
6 | `date_of_birth` | `date` | Nullable | Used for personalization and age validation.
7 | `user_type` | `text` | Not Null, Default `'user'`, Check (`'user'`, `'agency'`, `'admin'`) | Mirrors the role used in the UI.
8 | `created_at` | `timestamptz` | Not Null, Default `now()` | Profile creation timestamp.
9 | `updated_at` | `timestamptz` | Not Null, Default `now()` | Auto-updated via trigger on profile edits.

3. Tbl_agencies  
Primary key: `id`  
Foreign key: `user_id` references `Tbl_users_login(id)`  

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique identifier for each travel agency.
2 | `user_id` | `uuid` | Not Null, Unique, FK to `Tbl_users_login` | Links the agency record to the owner’s login account.
3 | `agency_name` | `text` | Not Null | Official agency name shown to users.
4 | `contact_person` | `text` | Not Null | Primary contact for the agency.
5 | `phone` | `text` | Not Null | Contact phone number.
6 | `email` | `text` | Nullable | Optional email for agency correspondence.
7 | `city` | `text` | Not Null | City where the agency operates.
8 | `state` | `text` | Not Null | State/region information.
9 | `address` | `text` | Nullable | Street address for verification.
10 | `business_license_number` | `text` | Not Null, Unique | Government-issued license identifier.
11 | `description` | `text` | Nullable | Short agency bio.
12 | `status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'approved'`,`'rejected'`) | Approval state managed by admins.
13 | `admin_notes` | `text` | Nullable | Remarks added during review.
14 | `admin_id` | `uuid` | Nullable, FK to `Tbl_users_login` | Admin who processed the latest decision.
15 | `approved_at` | `timestamptz` | Nullable | Timestamp when the agency was approved.
16 | `rejected_at` | `timestamptz` | Nullable | Timestamp when the agency was rejected.
17 | `license_verified` | `boolean` | Not Null, Default `false` | Flag indicating license verification status.
18 | `license_verification_status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'verified'`,`'failed'`,`'error'`) | Workflow step for automated verification.
19 | `license_verification_details` | `jsonb` | Nullable | Additional metadata returned during checks.
20 | `license_verified_at` | `timestamptz` | Nullable | When the license was successfully verified.
21 | `license_verification_error` | `text` | Nullable | Captures failure reasons.
22 | `created_at` | `timestamptz` | Not Null, Default `now()` | Record creation timestamp.
23 | `updated_at` | `timestamptz` | Not Null, Default `now()` | Auto-maintained timestamp via trigger.

4. Tbl_packages  
Primary key: `id`  
Foreign keys: `agency_id` references `Tbl_agencies(id)`; admin fields reference `Tbl_users_login(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique identifier for each travel package.
2 | `agency_id` | `uuid` | Not Null, FK to `Tbl_agencies` | Agency that created the package.
3 | `name` | `text` | Not Null | Package title shown in listings.
4 | `destination` | `text` | Not Null | Primary destination location.
5 | `duration_days` | `integer` | Not Null, Check `> 0` | Total trip duration.
6 | `price` | `numeric(10,2)` | Not Null, Check `> 0` | Base price per traveler.
7 | `max_travelers` | `integer` | Not Null, Check `> 0` | Maximum travelers allowed per booking.
8 | `description` | `text` | Nullable | Overview of the package.
9 | `status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'approved'`,`'rejected'`,`'archived'`) | Moderation status.
10 | `accommodation_type` | `text` | Nullable, Check list | Type of lodging (hotel, resort, etc.).
11 | `accommodation_name` | `text` | Nullable | Selected accommodation.
12 | `accommodation_rating` | `integer` | Nullable, Check between 1–5 | Quality rating.
13 | `accommodation_location` | `text` | Nullable | Address/location details.
14 | `accommodation_price_range` | `text` | Nullable | Indicative pricing bracket.
15 | `accommodation_coordinates_lat` | `numeric(10,8)` | Nullable | Latitude for map placement.
16 | `accommodation_coordinates_lng` | `numeric(11,8)` | Nullable | Longitude for map placement.
17 | `accommodation_coordinates` | `jsonb` | Nullable | Rich accommodation metadata.
18 | `meals_included` | `text[]` | Not Null, Default `'{}'` | Meals bundled with the trip.
19 | `transportation_included` | `text[]` | Not Null, Default `'{}'` | Modes of transport bundled.
20 | `selected_attractions` | `jsonb` | Not Null, Default `'[]'` | Attraction objects chosen during package creation.
21 | `selected_places` | `jsonb` | Not Null, Default `'[]'` | Places of interest tied to the package.
22 | `selected_hotels` | `jsonb` | Not Null, Default `'[]'` | Additional hotel options.
23 | `selected_accommodations` | `jsonb` | Not Null, Default `'[]'` | Enhanced accommodation selections.
24 | `selected_restaurants` | `jsonb` | Not Null, Default `'[]'` | Curated dining options.
25 | `transportation_details` | `jsonb` | Not Null, Default `'{}'` | Additional transport metadata (fares, notes).
26 | `transportation_prices` | `jsonb` | Nullable | Calculated transport cost breakdown (from pricing service).
27 | `daily_itinerary` | `jsonb` | Not Null, Default `'[]'` | Day-wise plan (morning/afternoon/evening).
28 | `itinerary` | `jsonb` | Not Null, Default `'[]'` | Legacy itinerary structure used in earlier releases.
29 | `included_features` | `text[]` | Not Null, Default `'{}'` | Amenities covered in the package.
30 | `excluded_features` | `text[]` | Not Null, Default `'{}'` | Items not covered.
31 | `cancellation_policy` | `text` | Nullable | Terms for cancellations.
32 | `special_requirements` | `text` | Nullable | Custom traveler requests.
33 | `package_images` | `text[]` | Not Null, Default `'{}'` | URLs for promotional images.
34 | `map_center_lat` | `numeric(10,8)` | Nullable | Map center latitude for display.
35 | `map_center_lng` | `numeric(11,8)` | Nullable | Map center longitude.
36 | `map_zoom` | `integer` | Not Null, Default `10`, Check between 1–20 | Zoom level used on maps.
37 | `map_center` | `text` | Nullable | Backward-compatible JSON string for map center.
38 | `pricing_breakdown` | `jsonb` | Not Null, Default `'{}'` | Detailed pricing components (accommodation, transport, etc.).
39 | `base_costs` | `jsonb` | Not Null, Default `'{}'` | Cost inputs before margins/fees.
40 | `total_costs` | `jsonb` | Not Null, Default `'{}'` | Summed costs per category used in analytics.
41 | `fees_and_margins` | `jsonb` | Not Null, Default `'{}'` | Service fees, taxes, and margins applied.
42 | `pricing_factors` | `jsonb` | Not Null, Default `'{}'` | Factors influencing dynamic pricing (seasonality, travelers).
43 | `route_info` | `jsonb` | Not Null, Default `'{}'` | Summary of route stats (distance, travel time).
44 | `group_discount_applied` | `boolean` | Not Null, Default `false` | Indicates if group discount is active.
45 | `group_discount_percentage` | `numeric(5,2)` | Not Null, Default `0` | Discount percentage applied.
46 | `route_coordinates` | `jsonb` | Not Null, Default `'[]'` | Ordered coordinates for map visualization.
47 | `total_distance_km` | `numeric(10,2)` | Nullable | Estimated travel distance.
48 | `estimated_travel_time_hours` | `numeric(5,2)` | Nullable | Estimated total travel time.
49 | `admin_notes` | `text` | Nullable | Internal notes from reviewers.
50 | `approved_at` | `timestamptz` | Nullable | Timestamp when approved.
51 | `approved_by` | `uuid` | Nullable, FK to `Tbl_users_login` | Admin who approved the package.
52 | `rejected_at` | `timestamptz` | Nullable | Timestamp when rejected.
53 | `rejected_by` | `uuid` | Nullable, FK to `Tbl_users_login` | Admin who rejected the package.
54 | `created_at` | `timestamptz` | Not Null, Default `now()` | Record creation timestamp.
55 | `updated_at` | `timestamptz` | Not Null, Default `now()` | Auto-maintained timestamp on updates.

5. Tbl_bookings  
Primary key: `id`  
Foreign keys: `package_id` references `Tbl_packages(id)`; `user_id` references `Tbl_users_login(id)`; `agency_id` references `Tbl_agencies(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique booking identifier.
2 | `package_id` | `uuid` | Not Null, FK to `Tbl_packages` | Package being booked.
3 | `user_id` | `uuid` | Nullable, FK to `Tbl_users_login` | Customer completing the booking; set null if account deleted.
4 | `agency_id` | `uuid` | Nullable, FK to `Tbl_agencies` | Agency responsible for fulfillment.
5 | `customer_name` | `text` | Not Null | Lead traveler’s full name.
6 | `customer_email` | `text` | Not Null | Contact email for booking updates.
7 | `customer_phone` | `text` | Not Null | Contact phone for notifications.
8 | `travel_date` | `date` | Not Null | Departure date.
9 | `return_date` | `date` | Nullable | Optional return date.
10 | `number_of_travelers` | `integer` | Not Null, Check `> 0` | Party size.
11 | `special_requirements` | `text` | Nullable | Dietary needs, accessibility requests, etc.
12 | `base_price` | `numeric(10,2)` | Not Null | Package price per traveler at booking time.
13 | `total_price` | `numeric(10,2)` | Not Null | Calculated total before discounts.
14 | `discount_amount` | `numeric(10,2)` | Not Null, Default `0` | Absolute discount applied.
15 | `final_amount` | `numeric(10,2)` | Not Null | Amount payable after discounts.
16 | `payment_status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'completed'`,`'failed'`,`'refunded'`) | Payment lifecycle state.
17 | `payment_method` | `text` | Nullable | Razorpay, card, net banking, etc.
18 | `payment_id` | `text` | Nullable | External payment identifier.
19 | `payment_receipt` | `text` | Nullable | URL/path to receipt.
20 | `booking_status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'confirmed'`,`'cancelled'`,`'completed'`) | Fulfillment status.
21 | `booking_reference` | `text` | Nullable, Unique | Human-readable booking code auto-generated by trigger.
22 | `agency_commission` | `numeric(10,2)` | Not Null, Default `0` | Commission payable to the agency.
23 | `confirmed_at` | `timestamptz` | Nullable | When the booking was confirmed.
24 | `cancelled_at` | `timestamptz` | Nullable | When it was cancelled.
25 | `completed_at` | `timestamptz` | Nullable | When the trip completed.
26 | `created_at` | `timestamptz` | Not Null, Default `now()` | Record creation timestamp.
27 | `updated_at` | `timestamptz` | Not Null, Default `now()` | Auto-maintained on updates.

6. Tbl_payment_transactions  
Primary key: `id`  
Foreign key: `booking_id` references `Tbl_bookings(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique identifier per transaction.
2 | `booking_id` | `uuid` | Not Null, FK to `Tbl_bookings` | Booking associated with the payment event.
3 | `razorpay_payment_id` | `text` | Nullable, Unique | Payment identifier returned by Razorpay.
4 | `razorpay_order_id` | `text` | Nullable | Order identifier used during payment initiation.
5 | `razorpay_signature` | `text` | Nullable | Signature used to verify payment authenticity.
6 | `amount` | `numeric(10,2)` | Not Null | Amount processed in the transaction.
7 | `currency` | `text` | Not Null, Default `'INR'` | Transaction currency.
8 | `status` | `text` | Not Null, Default `'pending'`, Check (`'pending'`,`'completed'`,`'failed'`,`'refunded'`) | Transaction state.
9 | `failure_reason` | `text` | Nullable | Captures provider error messages.
10 | `paid_at` | `timestamptz` | Nullable | Timestamp of successful capture.
11 | `refunded_at` | `timestamptz` | Nullable | When refund was processed.
12 | `refund_amount` | `numeric(10,2)` | Not Null, Default `0` | Amount refunded if any.
13 | `created_at` | `timestamptz` | Not Null, Default `now()` | Audit timestamp.

7. Tbl_booking_travelers  
Primary key: `id`  
Foreign key: `booking_id` references `Tbl_bookings(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique traveler record identifier.
2 | `booking_id` | `uuid` | Not Null, FK to `Tbl_bookings` | Booking to which the traveler belongs.
3 | `traveler_name` | `text` | Not Null | Traveler full name.
4 | `traveler_age` | `integer` | Nullable | Age information for special pricing.
5 | `traveler_gender` | `text` | Nullable | Optional gender field.
6 | `traveler_phone` | `text` | Nullable | Contact number for the traveler.
7 | `traveler_email` | `text` | Nullable | Email for individual notices.
8 | `traveler_documents` | `jsonb` | Nullable | Identity proof details (passport, ID).
9 | `created_at` | `timestamptz` | Not Null, Default `now()` | Audit timestamp for record creation.

8. Tbl_booking_notifications  
Primary key: `id`  
Foreign key: `booking_id` references `Tbl_bookings(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique identifier per notification.
2 | `booking_id` | `uuid` | Not Null, FK to `Tbl_bookings` | Booking tied to the notification event.
3 | `notification_type` | `text` | Not Null, Check (`'booking_confirmed'`,`'payment_received'`,`'booking_cancelled'`,`'reminder'`) | Categorizes the notification.
4 | `title` | `text` | Not Null | Notification title displayed to users.
5 | `message` | `text` | Not Null | Detailed message content.
6 | `sent_to_email` | `text` | Nullable | Email recipient address.
7 | `sent_to_phone` | `text` | Nullable | SMS/phone recipient.
8 | `sent_at` | `timestamptz` | Nullable | Timestamp when notification was dispatched.
9 | `created_at` | `timestamptz` | Not Null, Default `now()` | Record creation timestamp.

9. Tbl_wishlist  
Primary key: `id`  
Foreign keys: `user_id` references `Tbl_users_login(id)`; `package_id` references `Tbl_packages(id)`

No | Field name | Datatype (Size) | Key Constraints | Description of the field
-- | -- | -- | -- | --
1 | `id` | `uuid` | Primary Key, Not Null, Default `gen_random_uuid()` | Unique wishlist entry.
2 | `user_id` | `uuid` | Not Null, FK to `Tbl_users_login` | Traveler who added the package to their wishlist.
3 | `package_id` | `uuid` | Not Null, FK to `Tbl_packages` | Package favorited by the traveler.
4 | `created_at` | `timestamptz` | Not Null, Default `now()` | When the wishlist entry was created.
5 | `updated_at` | `timestamptz` | Not Null, Default `now()` | Auto-updated when the entry changes.
6 | `(user_id, package_id)` | — | Unique Constraint | Prevents duplicate wishlist entries for the same user and package.

These tables collectively underpin the TravelEase relational database design, aligning the report’s 4.5 Table Design section with the implemented Supabase PostgreSQL schema.

