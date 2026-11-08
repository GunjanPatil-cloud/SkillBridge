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

    // Fetch user's active role from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('active_role')
      .eq('id', userId)
      .single();

    if (userError) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ activeRole: user.activeRole }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    };
  } catch (err) {
    console.error('Error in auth-switch-role:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};