4.4 DATABASE DESIGN 



4.4.1 Relational Database Management System (RDBMS) 

The software system known as a Database Management System (DBMS) provides functionality 

for database administration. The system empowers users to both save data into databases along 

with making changes and performing queries for retrieving information. A DBMS delivers 

standard guidelines to organize data while maintaining data consistency across company 

operations. 

Supabase provides customers with a comprehensive platform which enables users to create highly 

scalable web applications with its PostgreSQL-based relational database infrastructure. There are two 

fundamental features in the Supabase platform which include the managed PostgreSQL Relational Database Management System (RDBMS) and a real-time synchronization layer that operates instantly across devices. Applications 

that require real-time updates and complex relational data should use Supabase since this platform 

delivers a solution suited for them. Supabase provides developers with all necessary services from 

user authentication to cloud storage and hosting with analytics functions that enable backend 

infrastructure elimination for modern application development. The platform offers Row Level 

Security (RLS) policies for fine-grained access control, automatic API generation from database 

schema, and built-in real-time subscriptions that make it ideal for the TravelEase application's 

multi-user architecture involving regular users, travel agencies, and administrators. By leveraging PostgreSQL, TravelEase benefits from strict relational integrity, SQL querying capabilities, and advanced features such as Row Level Security that distinguish an RDBMS from more general NoSQL database offerings. 

4.4.2 Normalization 

The normalization technique minimizes database dependencies and redundancy through its 

method of organizing information relationships and fields. This methodology splits large tables 

into separate tables to define their relations between them thus enabling both performance 

optimization and anomaly prevention. 

In the TravelEase application, normalization is implemented across multiple tables to ensure data 

integrity and eliminate redundancy. The database schema separates user authentication data 

(auth.users) from user profile information (public.profiles), allowing for efficient user 

management. Travel agencies are stored in a separate agencies table linked to user accounts, 

enabling multiple user types within a single authentication system. Packages are normalized to 

reference agencies through foreign keys, while bookings maintain separate tables for booking 

details, payment transactions, and traveler information. This normalized structure prevents data 

duplication, ensures referential integrity through foreign key constraints, and enables efficient 

querying across related entities. The separation of concerns between authentication, profiles, 

agencies, packages, bookings, and payments allows for independent updates and maintains 

data consistency throughout the application lifecycle. 

4.4.3 Sanitization 

Systems require sanitization as an input data cleaning technique to block unwanted malicious 

code and unexpected value entry points. The process of sanitization becomes essential for 

security in web applications particularly TravelEase since it prevents three main 

vulnerabilities: 

• SQL Injection 

• Cross-site Scripting (XSS) 

• NoSQL Injection (though using PostgreSQL, parameterized queries prevent injection) 

Sanitization involves: 

• The system checks inputs by validating that numbers stay numbers, emails remain 

valid, and dates conform to expected formats. 

• Potentially dangerous text should either be escaped or completely removed from the 

system. 

• Database functions should utilize parameterized queries and ORM-safe operations in 

order to prevent code execution. 

The project performs frontend and backend sanitization on package details, booking information, 

agency registration data, and user profile content before they are processed or stored. Supabase 

client libraries automatically handle parameterized queries, preventing SQL injection attacks. 

Input validation is implemented at both the frontend level using React form validation and at the 

backend level through Supabase database constraints and triggers. Email addresses are validated 

using regex patterns, phone numbers are sanitized to remove special characters, and text fields 

undergo HTML escaping to prevent XSS attacks. The Row Level Security (RLS) policies ensure 

that users can only access and modify data they are authorized to view, adding an additional 

layer of protection against unauthorized data manipulation. 

4.4.4 Indexing 

The database implementation of Indexing provides faster access to stored information. The 

database engine uses indexes to navigate rows effectively by bypassing the need to check every 

table entry. In TravelEase application implements indexing on several key areas: 

• User IDs in the profiles and agencies tables for efficient user-based queries 

• Package IDs for package queries and bookings 

• Agency IDs for agency-specific package and booking retrieval 

• Booking reference numbers for quick booking status lookups 

• Status fields (package status, booking status, payment status) for filtering operations 

• Created timestamps to filter records by date efficiently 

• Business license numbers in agencies table for unique identification 

• City and state combinations in agencies table for location-based searches 

• JSONB columns using GIN indexes for flexible queries on package attractions, selected 

places, and route coordinates 

The performance and user experience of the platform improves through proper indexing since 

it enables faster dashboard loading, package search result retrieval, booking history 

generation, and real-time status updates. The combination of B-tree indexes for standard 

queries and GIN indexes for JSONB columns ensures optimal performance for both structured 

data retrieval and flexible document-based queries within the PostgreSQL database.

