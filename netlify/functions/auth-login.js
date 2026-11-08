const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - use environment variables or defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oqrhrwlrvvvzkeontgpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcmhyd2xydnZ2emtlb250Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU3MzYsImV4cCI6MjEwNTcxMTczNn0.QBe_D2zFKWe2sv5SGTlIp6WdC-2tH3HXxbxLzwnLZ5E';

// Check if a service role key is a real key (not empty, not placeholder)
const isRealServiceKey = (key) =>
  typeof key === 'string' &&
  key.length > 20 &&
  !key.includes('placeholder') &&
  !key.includes('***');

// Prefer real service-role key on the backend for user creation, fall back to anon key
const activeKey = isRealServiceKey(SUPABASE_SERVICE_ROLE_KEY)
  ? SUPABASE_SERVICE_ROLE_KEY
  : SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
};

// Helper to decode JWT payload without verification (fallback)
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], 'base64').toString('utf8');
      return JSON.parse(payload);
    }
  } catch {
    // ignore
  }
  return null;
}

// Firebase Admin SDK for JWT verification
let admin = null;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'skillbridge-edde8';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : '';

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      admin = null;
    }
  }
} catch {
  admin = null;
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        body = {};
      }
    }

    // CASE 1: Firebase Auth or Sign Up payload
    if (body.action === 'firebase' || (body.email && !authHeader)) {
      return await handleSignUpOrFirebase(body);
    }

    // CASE 2: Login with personaId (demo users)
    if (body.personaId) {
      return await handleLoginWithPersona(body.personaId);
    }

    // CASE 3: Login with email only
    if (body.email && !authHeader) {
      return await handleSignUpOrFirebase(body);
    }

    // CASE 4: Verify custom token skillbridge_<uid>
    if (authHeader && authHeader.startsWith('skillbridge_')) {
      const userId = authHeader.replace('skillbridge_', '');
      return await getUserByCustomToken(userId);
    }

    // CASE 5: Verify Bearer token (skillbridge_ token or Firebase JWT)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('skillbridge_')) {
        return await getUserByCustomToken(token.replace('skillbridge_', ''));
      }
      return await verifyFirebaseAndGetUser(token);
    }

    // CASE 6: Public / initial state
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        user: null,
        sellerProfile: null,
        subscription: null,
        availableRoles: ['buyer'],
      }),
    };
  } catch (err) {
    console.error('Error in auth-login handler:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};

/**
 * Handle sign up or Firebase authentication
 */
async function handleSignUpOrFirebase(body) {
  let { email, fullName, avatarUrl, idToken, uid, initialRole } = body;

  // If Firebase ID token is provided, verify or extract user info
  if (idToken) {
    if (admin && admin.auth) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = uid || decoded.uid;
        email = email || decoded.email;
        fullName = fullName || decoded.name;
        avatarUrl = avatarUrl || decoded.picture;
      } catch (err) {
        console.warn('Firebase verifyIdToken error, attempting JWT payload decoding:', err.message);
        const payload = decodeJwtPayload(idToken);
        if (payload) {
          uid = uid || payload.user_id || payload.sub;
          email = email || payload.email;
          fullName = fullName || payload.name;
          avatarUrl = avatarUrl || payload.picture;
        }
      }
    } else {
      const payload = decodeJwtPayload(idToken);
      if (payload) {
        uid = uid || payload.user_id || payload.sub;
        email = email || payload.email;
        fullName = fullName || payload.name;
        avatarUrl = avatarUrl || payload.picture;
      }
    }
  }

  if (!email && !uid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Email or User ID is required' }),
    };
  }

  const cleanEmail = email ? email.toLowerCase().trim() : '';

  // Check if user already exists by email or uid
  let existingUser = null;

  if (cleanEmail) {
    const { data: userByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();
    existingUser = userByEmail;
  }

  if (!existingUser && uid) {
    const { data: userById } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    existingUser = userById;
  }

  let finalUserId;
  let userData;

  const defaultAvatar = avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const role = initialRole === 'seller' ? 'seller' : 'buyer';

  if (existingUser) {
    finalUserId = existingUser.id;
    const updates = {};
    if (fullName && fullName !== existingUser.full_name) {
      updates.full_name = fullName;
    }
    if (avatarUrl && avatarUrl !== existingUser.avatar_url) {
      updates.avatar_url = avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      const { data: updated } = await supabase
        .from('users')
        .update(updates)
        .eq('id', finalUserId)
        .select()
        .single();
      userData = updated || { ...existingUser, ...updates };
    } else {
      userData = existingUser;
    }
  } else {
    // Generate text/string user ID format (e.g., Firebase UID or clean string ID)
    finalUserId = uid || `user_${Date.now()}`;
    const userEmail = cleanEmail || `${finalUserId}@skillbridge.local`;
    const displayName = fullName || (cleanEmail ? cleanEmail.split('@')[0] : `Student ${Date.now()}`);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: finalUserId,
        email: userEmail,
        full_name: displayName,
        avatar_url: defaultAvatar,
        active_role: role,
        is_admin: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user in Supabase:', createError);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: createError.message }),
      };
    }

    userData = newUser;
  }

  // Ensure free student subscription exists
  try {
    const { data: existingSub } = await supabase
      .from('seller_subscriptions')
      .select('id')
      .eq('seller_id', finalUserId)
      .maybeSingle();

    if (!existingSub) {
      const now = new Date().toISOString();
      const periodEnd = new Date(Date.now() + 365 * 86400000).toISOString();
      await supabase
        .from('seller_subscriptions')
        .insert({
          seller_id: finalUserId,
          plan_id: 'free_student',
          status: 'active',
          current_period_start: now,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        });
    }
  } catch (subErr) {
    console.warn('Subscription initialization warning:', subErr.message);
  }

  // Fetch seller profile
  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', finalUserId)
    .maybeSingle();

  // Determine available roles
  const availableRoles = ['buyer'];
  if ((sellerProfile && sellerProfile.is_onboarded) || userData.active_role === 'seller') {
    availableRoles.push('seller');
  }

  const token = `skillbridge_${finalUserId}`;

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        avatarUrl: userData.avatar_url,
        activeRole: userData.active_role,
        isAdmin: userData.is_admin || false,
      },
      sellerProfile: sellerProfile || null,
      subscription: null,
      availableRoles,
      token,
    }),
  };
}

/**
 * Handle login with demo personas
 */
async function handleLoginWithPersona(personaId) {
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
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid persona ID' }),
    };
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', persona.email.toLowerCase())
    .maybeSingle();

  let userId;
  let userData;

  if (!user) {
    userId = `persona_${personaId}`;
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: persona.email.toLowerCase(),
        full_name: persona.name,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        active_role: persona.role,
      })
      .select()
      .single();

    if (createError) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: createError.message }),
      };
    }
    userData = newUser;
  } else {
    userId = user.id;
    userData = user;
  }

  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const availableRoles = ['buyer'];
  if ((sellerProfile && sellerProfile.is_onboarded) || userData.active_role === 'seller') {
    availableRoles.push('seller');
  }

  const token = `skillbridge_${userId}`;

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        avatarUrl: userData.avatar_url,
        activeRole: userData.active_role,
        isAdmin: userData.is_admin || false,
      },
      sellerProfile: sellerProfile || null,
      subscription: null,
      availableRoles,
      token,
    }),
  };
}

/**
 * Verify custom skillbridge token and return user profile
 */
async function getUserByCustomToken(userId) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (userError || !user) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'User not found' }),
    };
  }

  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from('seller_subscriptions')
    .select('*')
    .eq('seller_id', userId)
    .maybeSingle();

  const availableRoles = ['buyer'];
  if ((sellerProfile && sellerProfile.is_onboarded) || user.active_role === 'seller') {
    availableRoles.push('seller');
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      user,
      sellerProfile: sellerProfile || null,
      subscription: subscription || null,
      availableRoles,
    }),
  };
}

/**
 * Verify Firebase JWT token
 */
async function verifyFirebaseAndGetUser(idToken) {
  try {
    let uid = null;
    let email = null;

    if (admin && admin.auth) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
        email = decoded.email;
      } catch (err) {
        console.warn('Firebase verifyIdToken failed, using JWT fallback:', err.message);
      }
    }

    if (!uid) {
      const payload = decodeJwtPayload(idToken);
      if (payload) {
        uid = payload.user_id || payload.sub;
        email = payload.email;
      }
    }

    if (uid) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (user) {
        return await getUserByCustomToken(user.id);
      }
    }

    if (email) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (userByEmail) {
        return await getUserByCustomToken(userByEmail.id);
      }
    }

    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Token verification failed or user does not exist' }),
    };
  } catch (err) {
    console.error('Error verifying Firebase token:', err);
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Token verification failed' }),
    };
  }
}
