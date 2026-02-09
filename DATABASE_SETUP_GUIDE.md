# Database Setup Guide - ISP Billing System

## Problem Summary

You're seeing this error during login:
```
Login failed after retries: Database error querying schema
```

This happens because the required database tables haven't been created in your Supabase project yet.

## Root Cause

When a user logs in, the system tries to:
1. Authenticate the user with Supabase Auth (this works)
2. Fetch user profile and role data from the `profiles`, `user_roles`, and `tenant_members` tables (this fails)

Since these tables don't exist in your Supabase database, the login fails after several retry attempts.

## Solution: Initialize Your Database

### Step 1: Access Your Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Sign in with your account
3. Select your project (Project ID: `sbqvrxrhtbqktoyrhtre`)

### Step 2: Open the SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Copy the Migration SQL

You have two options:

#### Option A: Use the Application's Database Setup Page (Recommended)

1. In the application, navigate to `/setup` (the Database Setup page)
2. Click the **"SQL Code"** tab
3. Click **"Copy Full SQL to Clipboard"**
4. Go back to Supabase SQL Editor
5. Paste the copied SQL into the query editor
6. Click **"Run"** button

#### Option B: Copy Manually from the Migration File

1. Open the file: `supabase/migrations/20260206_000004_complete_schema.sql`
2. Copy all the SQL content
3. Go to Supabase SQL Editor
4. Paste into the query editor
5. Click **"Run"** button

### Step 4: Wait for Execution

The migration will create approximately 21 tables including:

**Authentication & Multi-tenant Tables:**
- `tenants` - ISP organizations
- `profiles` - User profiles
- `user_roles` - User global roles
- `tenant_members` - User access to tenants

**Core Business Tables:**
- `subscribers` - Customer subscribers
- `packages` - Service packages
- `service_plans` - Billing plans
- `invoices` - Invoice records
- `payments` - Payment records
- `tickets` - Support tickets
- `activity_logs` - Audit logs
- And more...

### Step 5: Verify the Setup

1. Once the SQL execution completes successfully, return to the application
2. Go to the Database Setup page (`/setup`)
3. Click **"Check Database Status"** button
4. You should see all tables listed as verified with green checkmarks
5. You'll see the message: "Database Initialized Successfully"

### Step 6: Try Logging In Again

1. Click **"Go to Login"** button on the success page
2. Or navigate to `/auth`
3. Log in with your credentials
4. The login should now succeed

## Alternative: Quick Setup from Application

If you prefer a guided experience:

1. Start the application
2. Try to log in - you'll see the database error
3. Click **"Set Up Database"** button in the error message
4. This takes you to the `/setup` page with step-by-step instructions
5. Follow the on-screen guide

## What the Migration Creates

The migration SQL file creates:

### Core Tables for Authentication
```
tenants
├── profiles (user data)
├── user_roles (global admin roles)
└── tenant_members (user-tenant associations)
```

### Business Logic Tables
- Subscribers management
- Service plans & packages
- Billing & invoicing
- Payment tracking
- Support ticketing
- Activity logging & auditing

### Indexes
Multiple indexes are created for performance optimization on:
- tenant relationships
- subscriber status
- billing records
- user associations

## Troubleshooting

### If the SQL execution fails:

1. **Check for errors** - Look at the error message in Supabase SQL Editor
2. **Verify prerequisites** - Make sure you're in the correct Supabase project
3. **Check RLS policies** - Some tables might be protected by Row Level Security
4. **Try step by step** - Run migrations one by one if needed

### Common Issues:

| Issue | Solution |
|-------|----------|
| "User cannot execute" error | Your Supabase role might not have permission. Use the service role from Project Settings → Database → Connection Pooling |
| "Table already exists" error | Tables were partially created. You can safely ignore or drop and recreate. |
| Query times out | The migration is large. Be patient or split it into smaller parts. |

## After Setup

Once the database is initialized:

1. Users can log in successfully
2. User profiles are automatically created from Supabase Auth data
3. New users are assigned the `viewer` role by default
4. Super admins can manage tenants and user roles through the admin dashboard

## Database Architecture

The system uses a multi-tenant architecture:

```
Organization (Tenant)
└── Tenant Members (Users)
    ├── User Roles (Global permissions)
    ├── Subscribers (Customers)
    ├── Service Plans
    ├── Invoices & Payments
    ├── Tickets (Support)
    └── Activity Logs
```

## Quick Reference

- **Application Setup Page**: Navigate to `/setup` in your running application
- **Supabase URL**: https://app.supabase.com/
- **Migration File**: `supabase/migrations/20260206_000004_complete_schema.sql`
- **Project ID**: `sbqvrxrhtbqktoyrhtre`

## Need Help?

If you encounter any issues:

1. Check the Supabase documentation: https://supabase.com/docs/guides/database/postgres/guide-create-tables
2. Review the SQL error messages in Supabase SQL Editor
3. Verify your Supabase project settings and permissions
4. Check that the migration SQL is complete and valid

## Next Steps

After successfully setting up the database:

1. Log in to the application
2. Complete the onboarding process if needed
3. Set up your tenant (organization)
4. Invite team members
5. Configure service plans and manage subscribers
