# TravelEase Hub - Normalized Database Design

## Database Schema Overview

The database is designed following **3rd Normal Form (3NF)** principles to ensure data integrity and reduce redundancy. The system uses **PostgreSQL** (via Supabase).

### 1. User Management Module

#### 1.1 `Tbl_Users`
Stores authentication and core user details.
* **Primary Key:** `user_id`
* **Attributes:**
    * `email` (Unique, Not Null)
    * `password_hash` (Not Null)
    * `user_type` (Enum: 'traveler', 'agency', 'admin')
    * `created_at`
    * `last_login`

#### 1.2 `Tbl_Traveler_Profiles`
Detailed profile for travelers.
* **Primary Key:** `profile_id`
* **Foreign Key:** `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `full_name`
    * `phone_number`
    * `date_of_birth`
    * `gender`
    * `avatar_url`
    * `bio`
    * `city`
    * `country`

#### 1.3 `Tbl_Agencies`
Profile and verification details for travel agencies.
* **Primary Key:** `agency_id`
* **Foreign Key:** `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `agency_name`
    * `contact_person`
    * `business_email`
    * `phone_number`
    * `website_url`
    * `business_license_number` (Unique)
    * `address`
    * `verification_status` (Enum: 'pending', 'verified', 'rejected')
    * `rating_avg`
    * `created_at`

---

### 2. Package Management Module

#### 2.1 `Tbl_Packages`
Core travel packages listed by agencies.
* **Primary Key:** `package_id`
* **Foreign Key:** `agency_id` (References `Tbl_Agencies`)
* **Attributes:**
    * `title`
    * `description`
    * `destination`
    * `duration_days`
    * `price_per_person`
    * `max_travelers`
    * `start_date`
    * `end_date` (Optional, for fixed departure)
    * `category` (e.g., Adventure, Honeymoon, Family)
    * `status` (Enum: 'active', 'inactive', 'draft')
    * `created_at`

#### 2.2 `Tbl_Package_Images` (1NF)
Stores multiple images for a package.
* **Primary Key:** `image_id`
* **Foreign Key:** `package_id` (References `Tbl_Packages`)
* **Attributes:**
    * `image_url`
    * `display_order`

#### 2.3 `Tbl_Package_Inclusions` (1NF)
Specific items included in the package (Meals, Transport types).
* **Primary Key:** `inclusion_id`
* **Foreign Key:** `package_id` (References `Tbl_Packages`)
* **Attributes:**
    * `item_name` (e.g., "Breakfast", "Airport Transfer")
    * `type` (Enum: 'Meal', 'Transport', 'Activity', 'Other')

#### 2.4 `Tbl_Itineraries`
Day-wise breakdown of the package.
* **Primary Key:** `itinerary_id`
* **Foreign Key:** `package_id` (References `Tbl_Packages`)
* **Attributes:**
    * `day_number`
    * `title`
    * `description`
    * `accommodation_details` (e.g., "Hotel XYZ")

---

### 3. Booking & Transactions Module

#### 3.1 `Tbl_Bookings`
Records user bookings for packages.
* **Primary Key:** `booking_id`
* **Foreign Keys:**
    * `user_id` (References `Tbl_Users`)
    * `package_id` (References `Tbl_Packages`)
* **Attributes:**
    * `booking_date`
    * `travel_date`
    * `total_travelers`
    * `base_price`
    * `total_amount`
    * `booking_status` (Enum: 'confirmed', 'pending', 'cancelled', 'completed')
    * `payment_status` (Enum: 'paid', 'unpaid', 'refunded')

#### 3.2 `Tbl_Booking_Travelers`
Details of each traveler in a booking (for group bookings).
* **Primary Key:** `traveler_id`
* **Foreign Key:** `booking_id` (References `Tbl_Bookings`)
* **Attributes:**
    * `name`
    * `age`
    * `gender`
    * `id_proof_type` (Optional)
    * `id_proof_number` (Optional)

#### 3.3 `Tbl_Payments`
Transaction records associated with bookings.
* **Primary Key:** `payment_id`
* **Foreign Key:** `booking_id` (References `Tbl_Bookings`)
* **Attributes:**
    * `transaction_ref_id` (e.g., Stripe/Razorpay ID)
    * `amount`
    * `payment_method`
    * `payment_date`
    * `status` (Enum: 'success', 'failed')

#### 3.4 `Tbl_Reviews`
User reviews for packages.
* **Primary Key:** `review_id`
* **Foreign Keys:**
    * `user_id` (References `Tbl_Users`)
    * `package_id` (References `Tbl_Packages`)
* **Attributes:**
    * `rating` (1-5)
    * `comment`
    * `created_at`

---

### 4. User Pooling & Collaboration Module (New Features)

#### 4.1 `Tbl_Pooling_Groups`
Groups created by users to find fellow travelers.
* **Primary Key:** `pool_id`
* **Foreign Key:** `created_by_user_id` (References `Tbl_Users`)
* **Attributes:**
    * `destination`
    * `trip_start_date`
    * `trip_end_date`
    * `estimated_budget`
    * `group_size_limit`
    * `description`
    * `status` (Enum: 'open', 'full', 'closed', 'completed')
    * `created_at`

#### 4.2 `Tbl_Pooling_Members`
Tracks members who have joined or requested to join a pool.
* **Primary Key:** `member_id`
* **Foreign Keys:**
    * `pool_id` (References `Tbl_Pooling_Groups`)
    * `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `join_status` (Enum: 'requested', 'accepted', 'rejected', 'left')
    * `joined_at`

#### 4.3 `Tbl_Group_Chat`
Messages exchanged within a polling group.
* **Primary Key:** `message_id`
* **Foreign Keys:**
    * `pool_id` (References `Tbl_Pooling_Groups`)
    * `sender_id` (References `Tbl_Users`)
* **Attributes:**
    * `content`
    * `sent_at`

---

### 5. Smart Expense Splitting Module (New Features)

#### 5.1 `Tbl_Expenses`
Records expenses incurred during a group trip.
* **Primary Key:** `expense_id`
* **Foreign Keys:**
    * `pool_id` (References `Tbl_Pooling_Groups`)
    * `paid_by_user_id` (References `Tbl_Users`)
* **Attributes:**
    * `amount`
    * `description` (e.g., "Dinner at X")
    * `category` (Enum: 'Food', 'Transport', 'Accommodation', 'Other')
    * `expense_date`
    * `created_at`

#### 5.2 `Tbl_Expense_Splits`
Tracks how much each member owes for a specific expense.
* **Primary Key:** `split_id`
* **Foreign Keys:**
    * `expense_id` (References `Tbl_Expenses`)
    * `owed_by_user_id` (References `Tbl_Users`)
* **Attributes:**
    * `amount_owed`
    * `settlement_status` (Enum: 'pending', 'settled')

---

### 6. Social Feed & Engagement Module (New Features)

#### 6.1 `Tbl_Posts`
Social updates shared by users (photos, vlogs, experiences).
* **Primary Key:** `post_id`
* **Foreign Key:** `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `caption`
    * `location_tag`
    * `media_url` (Video/Image link)
    * `media_type` (Enum: 'image', 'video')
    * `privacy` (Enum: 'public', 'followers', 'private')
    * `created_at`

#### 6.2 `Tbl_Likes`
Likes on user posts.
* **Primary Key:** `like_id`
* **Foreign Keys:**
    * `post_id` (References `Tbl_Posts`)
    * `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `created_at`

#### 6.3 `Tbl_Comments`
Comments on user posts.
* **Primary Key:** `comment_id`
* **Foreign Keys:**
    * `post_id` (References `Tbl_Posts`)
    * `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `comment_text`
    * `created_at`

---

### 7. AI & Promotions (Agency/Admin)

#### 7.1 `Tbl_Agency_Promotions`
Promotional offers created by agencies.
* **Primary Key:** `promotion_id`
* **Foreign Key:** `agency_id` (References `Tbl_Agencies`)
* **Attributes:**
    * `promo_code`
    * `discount_percentage`
    * `max_discount_amount`
    * `valid_from`
    * `valid_until`
    * `usage_limit`
    * `status` (Enum: 'active', 'expired')

#### 7.2 `Tbl_AI_Itineraries`
Saved AI-generated travel plans for users.
* **Primary Key:** `ai_plan_id`
* **Foreign Key:** `user_id` (References `Tbl_Users`)
* **Attributes:**
    * `destination`
    * `budget_preference`
    * `interests`
    * `generated_content` (JSONB - Storing the complex plan structure)
    * `created_at`
