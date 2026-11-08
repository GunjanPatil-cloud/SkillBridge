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
        body: JSON.stringify({ error: 'Unauthorized: Authentication required' }),
      };
    }

    const body = JSON.parse(event.body);

    const { title, description, categoryId, price, deliveryDays, tags, coverImage } = body;

    // Validation
    if (!title || title.trim().length < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title must be at least 10 characters' }),
      };
    }
    if (!description || description.trim().length < 30) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Description must be at least 30 characters' }),
      };
    }
    const gigPrice = parseInt(price, 10);
    if (isNaN(gigPrice) || gigPrice < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Price must be at least ₹100' }),
      };
    }

    const newGig = {
      seller_id: userId,
      category_id: categoryId || 'web-dev',
      title: title.trim(),
      description: description.trim(),
      price: gigPrice,
      delivery_days: Math.max(1, parseInt(deliveryDays, 10) || 3),
      revisions_included: 2,
      tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean) : ['StudentService'],
      cover_image: coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      is_promoted: false,
      impressions: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('gigs')
      .insert(newGig)
      .select()
      .single();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, gig: data }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    };
  } catch (err) {
    console.error('Error in gigs-create:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};