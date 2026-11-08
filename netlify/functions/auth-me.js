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
    // Accept custom token format: 'skillbridge_userId' or Firebase JWT 'Bearer <token>'
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    let userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Try to extract userId from custom token format
      const customToken = authHeader.substring(7);
      if (customToken.startsWith('skillbridge_')) {
        userId = customToken.replace('skillbridge_', '');
      } else {
        // It's a Firebase JWT - verify it and get uid
        // For now, treat the full token as userId (fallback)
        userId = customToken;
      }
    } else {
      // No auth header - return unauthenticated response but allow public data
      // This enables login flow where token is stored in localStorage
      return {
        statusCode: 200,
        body: JSON.stringify({
          user: null,
          sellerProfile: null,
          subscription: null,
          availableRoles: ['buyer'],
        }),
      };
    }

    // Fetch user from Supabase using explicit UID filter (not relying on RLS)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      // User doesn't exist yet; return default response
      return {
        statusCode: 200,
        body: JSON.stringify({
          user: null,
          sellerProfile: null,
          subscription: null,
          availableRoles: ['buyer'],
        }),
      };
    }

    // Fetch seller profile
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: profileError.message }),
      };
    }

    // Fetch seller subscription
    const { data: subscription, error: subError } = await supabase
      .from('seller_subscriptions')
      .eq('seller_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: subError.message }),
      };
    }

    // Determine available roles
    const availableRoles = ['buyer'];
    if (sellerProfile && sellerProfile.is_onboarded) {
      availableRoles.push('seller');
    }

    const result = {
      user: user,
      sellerProfile: sellerProfile || null,
      subscription: subscription || null,
      availableRoles: availableRoles,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    };
  } catch (err) {
    console.error('Error in auth-me:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};