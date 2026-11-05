const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - use environment variables or defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oqrhrwlrvvvzkeontgpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcmhyd2xydnZ2emtlb250Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU3MzYsImV4cCI6MjEwNTcxMTczNn0.QBe_D2zFKWe2sv5SGTlIp6WdC-2tH3HXxbxLzwnLZ5E';

// Use service role key if available (bypasses RLS), otherwise use anon key
const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Firebase Admin SDK for JWT verification
let admin = null;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || '',
    };
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      }),
    });
  }
} catch (e) {
  // Firebase Admin not available - will use custom token system
  admin = null;
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    const body = event.body ? JSON.parse(event.body) : {};

    // CASE 1: Sign up - no auth header, POST with signup data
    if (!authHeader && body.email) {
      return await handleSignUp(body);
    }

    // CASE 2: Login with email - no auth header, POST with email
    if (!authHeader && body.email && !body.personaId) {
      return await handleLoginWithEmail(body);
    }

    // CASE 3: Login with personaId - no auth header, POST with personaId
    if (!authHeader && body.personaId) {
      return await handleLoginWithPersona(body.personaId);
    }

    // CASE 4: Verify custom token skillbridge_<uid>
    if (authHeader && authHeader.startsWith('skillbridge_')) {
      const userId = authHeader.replace('skillbridge_', '');
      return await getUserByCustomToken(userId);
    }

    // CASE 5: Verify Firebase JWT Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.substring(7);
      return await verifyFirebaseAndGetUser(idToken);
    }

    // CASE 6: No auth - return public data (for initial load before login)
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: null,
        sellerProfile: null,
        subscription: null,
        availableRoles: ['buyer'],
      }),
    };
  } catch (err) {
    console.error('Error in auth-login:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Handle sign up: no auth header, POST with signup data
 * Creates user in Supabase if not exists, returns token
 */
async function handleSignUp(body) {
  const { email, fullName, avatarUrl } = body;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  // Check if user already exists by email
  const { data: existingUser, error: existingError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: existingError.message }),
    };
  }

  let userId;
  let userData;

  if (existingUser) {
    // User exists, use their ID
    userId = existingUser.id;
    userData = {
      ...existingUser,
      full_name: fullName || existingUser.full_name,
      avatar_url: avatarUrl || existingUser.avatar_url,
    };
  } else {
    // Create new user
    const safeEmail = email.toLowerCase().replace(/[.]/g, '-');
    const defaultAvatar = avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: `user_${Date.now()}`,
        email: safeEmail,
        full_name: fullName || `Student ${Date.now()}`,
        avatar_url: defaultAvatar,
        active_role: 'buyer',
      })
      .select()
      .single();

    if (createError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: createError.message }),
      };
    }

    userId = newUser.id;
    userData = newUser;
  }

  // Update user profile with provided data
  await supabase
    .from('users')
    .update({
      full_name: fullName || userData.full_name,
      avatar_url: avatarUrl || userData.avatar_url,
    })
    .eq('id', userId);

  // Create free subscription
  const subId = `sub_free_${Date.now()}`;
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 365 * 86400000).toISOString();

  await supabase
    .from('seller_subscriptions')
    .insert({
      id: subId,
      seller_id: userId,
      plan_id: 'free_student',
      plan_name: 'Free Student',
      status: 'active',
      billing_period: 'monthly',
      price: 0,
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      razorpay_subscription_id: null,
      razorpay_customer_id: null,
    });

  // Determine available roles
  const availableRoles = ['buyer'];

  const token = `skillbridge_${userId}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        avatarUrl: userData.avatar_url,
        activeRole: userData.active_role,
      },
      sellerProfile: null,
      subscription: null,
      availableRoles,
      token,
    }),
  };
}

/**
 * Handle login with email - no auth header
 */
async function handleLoginWithEmail(body) {
  const { email } = body;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (userError || !user) {
    // Create user if doesn't exist (similar to sign up)
    return await handleSignUp({ email, fullName: email.split('@')[0] });
  }

  const token = `skillbridge_${user.id}`;

  // Fetch seller profile
  const { data: sellerProfile, error: profileError } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: profileError.message }),
    };
  }

  const availableRoles = ['buyer'];
  if (sellerProfile && sellerProfile.is_onboarded) {
    availableRoles.push('seller');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        activeRole: user.active_role,
      },
      sellerProfile: sellerProfile || null,
      subscription: null,
      availableRoles,
      token,
    }),
  };
}

/**
 * Handle login with personaId (demo users)
 */
async function handleLoginWithPersona(personaId) {
  // Map of demo persona IDs to user data
  const personas = {
    'user-student-1': {
      name: 'Arjun Sharma',
      email: 'arjun@iitbombay.edu',
      role: 'seller',
    },
    'user-student-2': {
      name: 'Priya Patel',
      email: 'priya@bits-pilani.edu',
      role: 'seller',
    },
    'user-buyer-1': {
      name: 'Rohan Mehta',
      email: 'rohan@startup-foundr.edu',
      role: 'buyer',
    },
  };

  const persona = personas[personaId];
  if (!persona) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid persona ID' }),
    };
  }

  // Check if user exists in Supabase
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', persona.email)
    .single();

  let userId;
  if (userError || !user) {
    // Create user for this persona
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: `persona_${personaId}`,
        email: persona.email,
        full_name: persona.name,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        active_role: persona.role,
      })
      .select()
      .single();

    if (createError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: createError.message }),
      };
    }

    userId = newUser.id;
  } else {
    userId = user.id;
  }

  // Fetch seller profile
  const { data: sellerProfile, error: profileError } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const availableRoles = ['buyer'];
  if (sellerProfile && sellerProfile.is_onboarded) {
    availableRoles.push('seller');
  }

  const token = `skillbridge_${userId}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      user: {
        id: userId,
        email: persona.email,
        fullName: persona.name,
        avatarUrl: sellerProfile?.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        activeRole: persona.role,
      },
      sellerProfile: sellerProfile || { user_id: userId, is_onboarded: false },
      subscription: null,
      availableRoles,
      token,
    }),
  };
}

/**
 * Verify custom skillbridge token and get user data
 */
async function getUserByCustomToken(userId) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'User not found' }),
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

  const availableRoles = ['buyer'];
  if (sellerProfile && sellerProfile.is_onboarded) {
    availableRoles.push('seller');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      user,
      sellerProfile: sellerProfile || null,
      subscription: subscription || null,
      availableRoles,
    }),
  };
}

/**
 * Verify Firebase JWT and get user data
 */
async function verifyFirebaseAndGetUser(idToken) {
  try {
    // Use Firebase Admin SDK if available, otherwise verify manually
    let decodedToken;

    if (admin && admin.auth) {
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (err) {
        // Fallback to custom token verification if Firebase fails
        console.warn('Firebase verification failed, trying custom token:', err.message);
        // Try as custom token
        if (idToken.startsWith('skillbridge_')) {
          return await getUserByCustomToken(idToken.replace('skillbridge_', ''));
        }
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid Firebase token' }),
        };
      }
    } else {
      // Fallback: check if it's a custom token
      if (idToken.startsWith('skillbridge_')) {
        return await getUserByCustomToken(idToken.replace('skillbridge_', ''));
      }
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Firebase Admin not configured, use custom token' }),
      };
    }

    if (!decodedToken || !decodedToken.uid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token payload' }),
      };
    }

    return await getUserByCustomToken(decodedToken.uid);
  } catch (err) {
    console.error('Error verifying Firebase token:', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Token verification failed' }),
    };
  }
}
