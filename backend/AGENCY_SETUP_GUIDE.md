# 🏢 Agency Registration System Setup Guide

## Overview
This guide will help you set up the agency registration and approval system for TravelEase using Supabase.

## Prerequisites
- Supabase project created
- Supabase URL and anon key configured in your frontend

## Step 1: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire content of `backend/database/agency-system-setup.sql`
4. Click "Run" to execute the SQL

This will create:
- `agencies` table for agency registrations
- `agency_approval_history` table for tracking approvals/rejections
- Required indexes and RLS policies
- Functions for agency approval/rejection

## Step 2: Test the Setup

After running the SQL, you should see:
```
Agency system setup completed successfully!
```

## Step 3: Frontend Integration

The frontend components are already updated to work with Supabase:

1. **AgencyRegistrationCard**: Handles agency registration
2. **AgencyManagement**: Admin interface for managing agencies
3. **AdminDashboard**: Main admin dashboard with agency management

## Step 4: Test Agency Registration

1. Open your application
2. Navigate to agency registration
3. Fill out the form and submit
4. Check your Supabase `agencies` table for the new entry

## Step 5: Test Admin Approval

1. Login as an admin user
2. Navigate to Agency Management
3. View pending agencies
4. Approve or reject agencies

## Database Schema

### Agencies Table
- `id`: Unique identifier
- `user_id`: Links to Supabase auth user
- `agency_name`: Name of the agency
- `contact_person`: Primary contact
- `phone`: Contact phone number
- `city` & `state`: Location
- `business_license_number`: Unique license number
- `status`: pending/approved/rejected
- `admin_notes`: Notes from admin actions
- `created_at` & `updated_at`: Timestamps

### Agency Approval History Table
- `id`: Unique identifier
- `agency_id`: Reference to agency
- `action`: approved/rejected/pending
- `admin_id`: Admin who performed the action
- `notes`: Additional notes
- `created_at`: When the action was performed

## Security Features

- Row Level Security (RLS) enabled
- Agencies can only see their own data
- Admins can see and manage all agencies
- Business license numbers are unique
- Approval history is tracked

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Make sure you ran the SQL in the correct Supabase project
   - Check that the SQL executed successfully

2. **Permission denied errors**
   - Verify RLS policies are created correctly
   - Check that your user is authenticated

3. **Functions not found**
   - Ensure all SQL was executed completely
   - Check the Functions section in Supabase dashboard

### Verification Commands

Run these in SQL Editor to verify setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'agency%';

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%agency%';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename LIKE 'agency%';
```

## Next Steps

Once the basic system is working:

1. Add email notifications for approvals/rejections
2. Implement agency dashboard for approved agencies
3. Add travel package creation functionality
4. Implement booking system

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Check RLS policies in Supabase dashboard
4. Ensure all SQL was executed successfully
