-- Intelligent Group Travel Management Database Schema
-- Based on: "Intelligent Group Travel Management Using AI"

-- 1. TRAVEL POOLS (GROUPS)
CREATE TABLE IF NOT EXISTS public.travel_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    package_id UUID REFERENCES public.packages(id),
    destination TEXT,
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(10,2),
    status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'locked', 'active', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GROUP MEMBERS (TRAVELER POOLING COMPATIBILITY)
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'declined', 'removed')),
    -- Features for Clustering / K-Means++
    budget_limit DECIMAL(10,2),
    preferences JSONB DEFAULT '{}', -- E.g. {"adventure": 8, "luxury": 2, "cultural": 5}
    compatibility_score DECIMAL(5,2), -- Calculated via AI Pooling
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 3. GROUP EXPENSES (FOR SMART SPLITTING)
CREATE TABLE IF NOT EXISTS public.group_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
    paid_by_user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('accommodation', 'transport', 'food', 'activities', 'other')),
    split_type TEXT DEFAULT 'shapley' CHECK (split_type IN ('equal', 'custom', 'shapley')),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EXPENSE SPLITS (SHAPLEY VALUE DISTRIBUTION RESULTS)
CREATE TABLE IF NOT EXISTS public.expense_splits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES public.group_expenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    amount_owed DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(expense_id, user_id)
);

-- 5. ITINERARY NEGOTIATION (GACS Consensus Module)
CREATE TABLE IF NOT EXISTS public.group_itinerary_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
    itinerary_day INTEGER NOT NULL,
    proposed_activity JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    vote TEXT CHECK (vote IN ('accept', 'reject', 'modify')),
    proposed_modification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_groups_pkg ON public.travel_groups(package_id);
CREATE INDEX IF NOT EXISTS idx_travel_groups_status ON public.travel_groups(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_expenses_group ON public.group_expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON public.expense_splits(user_id);

-- Success Output
SELECT 'Intelligent Group Travel tables created successfully' AS status;
