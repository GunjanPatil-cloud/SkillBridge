const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oqrhrwlrvvvzkeontgpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcmhyd2xydnZ2emtlb250Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU3MzYsImV4cCI6MjEwNTcxMTczNn0.QBe_D2zFKWe2sv5SGTlIp6WdC-2tH3HXxbxLzwnLZ5E';

const isRealKey = (k) => typeof k === 'string' && k.length > 20 && !k.includes('placeholder') && !k.includes('***');
const activeKey = isRealKey(SUPABASE_SERVICE_ROLE_KEY) ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, activeKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

exports.handler = async (event) => {
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    let userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const customToken = authHeader.substring(7);
      if (customToken.startsWith('skillbridge_')) {
        userId = customToken.replace('skillbridge_', '');
      } else {
        userId = customToken;
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Missing token' }),
      };
    }

    const body = JSON.parse(event.body);
    const {
      collegeName,
      graduationYear,
      major,
      bio,
      skills,
      hourlyRate,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    } = body;

    // Validation
    if (!collegeName || typeof collegeName !== 'string' || collegeName.trim().length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid college name is required' }),
      };
    }
    const gradYear = parseInt(graduationYear, 10);
    if (isNaN(gradYear) || gradYear < 2020 || gradYear > 2035) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Graduation year must be between 2020 and 2035' }),
      };
    }
    if (!bio || typeof bio !== 'string' || bio.trim().length < 25) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bio must be at least 25 characters' }),
      };
    }
    const cleanSkills = Array.isArray(skills)
      ? skills.map(s => s.replace(/<script[^>]*>.*?<\/script>/gi, '').trim()).filter(Boolean)
      : [];
    if (cleanSkills.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'At least one skill is required' }),
      };
    }
    const rate = parseInt(hourlyRate, 10) || 500;
    if (rate < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Hourly rate must be at least ₹100' }),
      };
    }

    const uid = userId;
    const now = new Date().toISOString();

    const newProfile = {
      user_id: uid,
      college_name: collegeName.trim(),
      graduation_year: gradYear,
      major: major.trim(),
      bio: bio.trim(),
      skills: cleanSkills,
      hourly_rate: rate,
      portfolio_url: portfolioUrl ? portfolioUrl.trim() : null,
      github_url: githubUrl ? githubUrl.trim() : null,
      linkedin_url: linkedinUrl ? linkedinUrl.trim() : null,
      is_onboarded: true,
      is_promoted: false,
      subscription_tier: 'free',
      total_orders_completed: 0,
      average_rating: 5.0,
      rating_count: 0,
      created_at: now,
      updated_at: now,
    };

    const { error: profileError } = await supabase
      .from('seller_profiles')
      .insert(newProfile);

    if (profileError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: profileError.message }),
      };
    }

    // Update user active_role to seller
    await supabase
      .from('users')
      .update({ active_role: 'seller' })
      .eq('id', uid);

    // Create free subscription if not already exists
    const periodEnd = new Date(Date.now() + 365 * 86400000).toISOString();

    const newSubscription = {
      seller_id: uid,
      plan_id: 'free_student',
      status: 'active',
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      razorpay_subscription_id: null,
      razorpay_customer_id: null,
      created_at: now,
      updated_at: now,
    };

    const { error: subError } = await supabase
      .from('seller_subscriptions')
      .insert(newSubscription);

    if (subError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: subError.message }),
      };
    }

    const result = {
      success: true,
      message: 'Seller onboarding completed successfully!',
      sellerProfile: newProfile,
    };

    return {
      statusCode: 201,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    };
  } catch (err) {
    console.error('Error in sellers-onboard:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};