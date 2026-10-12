-- ============================================================================
-- SkillBridge — Database Schema & Row Level Security (RLS) Policies
-- Migration: 20261011_skillbridge_schema.sql
-- Target: Supabase PostgreSQL
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Synced with Firebase Authentication UID
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    active_role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (active_role IN ('buyer', 'seller')),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SELLER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    college_name VARCHAR(200) NOT NULL,
    graduation_year INT NOT NULL CHECK (graduation_year >= 2020 AND graduation_year <= 2035),
    major VARCHAR(150) NOT NULL,
    bio TEXT NOT NULL CHECK (LENGTH(bio) >= 30),
    skills TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate INT NOT NULL DEFAULT 500 CHECK (hourly_rate >= 100),
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    is_onboarded BOOLEAN NOT NULL DEFAULT TRUE,
    is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    total_orders_completed INT NOT NULL DEFAULT 0,
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50)
);

-- Seed Default Categories
INSERT INTO public.categories (id, name, description, icon_name)
VALUES
    ('web-dev', 'Web & Mobile Dev', 'Fullstack apps, React, Next.js, Flutter, backend APIs', 'Code'),
    ('ai-data', 'AI & Data Science', 'Machine learning, Python scripts, data visualization, fine-tuning', 'Brain'),
    ('design', 'UI/UX & Graphics', 'Figma prototypes, mobile mockups, brand assets, posters', 'Palette'),
    ('tutoring', 'Tutoring & Academic', 'CS course tutoring, algorithms, math, code review, mentorship', 'BookOpen'),
    ('content', 'Content & Writing', 'Technical documentation, blogs, SOP reviews, resume polishing', 'FileText'),
    ('video', 'Video & Animation', 'Shorts, campus video editing, 3D renders, reels', 'Video')
ON CONFLICT (id) DO NOTHING;

-- 4. GIGS / SERVICES
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id VARCHAR(128) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL REFERENCES public.categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL CHECK (price >= 100), -- Base price in INR (₹)
    delivery_days INT NOT NULL CHECK (delivery_days >= 1 AND delivery_days <= 90),
    revisions_included INT NOT NULL DEFAULT 2 CHECK (revisions_included >= 0),
    tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_promoted BOOLEAN NOT NULL DEFAULT FALSE, -- Inherited or boosted by premium seller subscription
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROJECTS / TASK POSTINGS (Buyer requests & bidding)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id VARCHAR(128) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES public.categories(id),
    budget INT NOT NULL CHECK (budget >= 100), -- Budget in INR (₹)
    deadline_days INT NOT NULL CHECK (deadline_days >= 1),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROPOSALS / BIDS (Student bids on projects)
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    seller_id VARCHAR(128) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bid_amount INT NOT NULL CHECK (bid_amount >= 50),
    delivery_days INT NOT NULL CHECK (delivery_days >= 1),
    cover_letter TEXT NOT NULL,
    is_promoted_seller BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, seller_id) -- Only 1 proposal per seller per project
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(32) NOT NULL UNIQUE,
    gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    buyer_id VARCHAR(128) NOT NULL REFERENCES public.users(id),
    seller_id VARCHAR(128) NOT NULL REFERENCES public.users(id),
    title VARCHAR(250) NOT NULL,
    amount INT NOT NULL CHECK (amount >= 50), -- Amount in INR
    requirements TEXT,
    delivery_days INT NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'delivered', 'completed', 'disputed', 'cancelled')),
    delivery_note TEXT,
    delivery_attachment_url TEXT,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REVIEWS & RATINGS (Restricted to completed orders only!)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id VARCHAR(128) NOT NULL REFERENCES public.users(id),
    seller_id VARCHAR(128) NOT NULL REFERENCES public.users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL, -- in INR
    billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
    listing_limit INT NOT NULL,
    promoted_badge BOOLEAN NOT NULL DEFAULT FALSE,
    search_boost_multiplier NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
    priority_bidding BOOLEAN NOT NULL DEFAULT FALSE,
    advanced_analytics BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO public.subscription_plans (id, name, price, billing_period, listing_limit, promoted_badge, search_boost_multiplier, priority_bidding, advanced_analytics)
VALUES
    ('free_student', 'Free Student', 0, 'monthly', 3, FALSE, 1.0, FALSE, FALSE),
    ('premium_monthly', 'PRO Campus Star (Monthly)', 499, 'monthly', 10, TRUE, 3.0, TRUE, TRUE),
    ('premium_yearly', 'PRO Campus Star (Yearly)', 3999, 'yearly', 25, TRUE, 3.5, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. SELLER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.seller_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id VARCHAR(128) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
    razorpay_subscription_id VARCHAR(100),
    razorpay_customer_id VARCHAR(100),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAYMENTS AUDIT RECORD
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL REFERENCES public.users(id),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.seller_subscriptions(id) ON DELETE SET NULL,
    amount INT NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'captured', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    error_code VARCHAR(100),
    error_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. WEBHOOK EVENTS (Idempotency storage)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id VARCHAR(150) PRIMARY KEY, -- razorpay event_id
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUTOMATION OUTBOX (Reliable n8n workflow triggers)
CREATE TABLE IF NOT EXISTS public.automation_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    response_code INT,
    response_body TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security Audit Check 8: Apply least-privilege DB access and RLS
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Public users are viewable by everyone" 
    ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can only update their own profile" 
    ON public.users FOR UPDATE USING (auth.uid() = id);

-- SELLER PROFILES POLICIES
CREATE POLICY "Seller profiles are viewable by everyone" 
    ON public.seller_profiles FOR SELECT USING (true);

CREATE POLICY "Sellers can only insert/update their own profile" 
    ON public.seller_profiles FOR ALL USING (auth.uid() = user_id);

-- GIGS POLICIES
CREATE POLICY "Published gigs are viewable by everyone" 
    ON public.gigs FOR SELECT USING (is_published = true OR auth.uid() = seller_id);

CREATE POLICY "Sellers can only manage their own gigs" 
    ON public.gigs FOR ALL USING (auth.uid() = seller_id);

-- ORDERS POLICIES (Strict isolation: only buyer or seller of the order)
CREATE POLICY "Orders visible only to buyer and seller" 
    ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" 
    ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update their respective order actions" 
    ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- REVIEWS POLICIES
CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Reviews can only be added by the verified buyer of completed order" 
    ON public.reviews FOR INSERT WITH CHECK (
        auth.uid() = buyer_id AND 
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = reviews.order_id 
              AND orders.buyer_id = auth.uid() 
              AND orders.status = 'completed'
        )
    );

-- SUBSCRIPTIONS & PAYMENTS POLICIES
CREATE POLICY "Users can only view their own subscriptions" 
    ON public.seller_subscriptions FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can only view their own payments" 
    ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_gigs_seller ON public.gigs(seller_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON public.gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_promoted ON public.gigs(is_promoted);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_proposals_project ON public.proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON public.reviews(seller_id);
