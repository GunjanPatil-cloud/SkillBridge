const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oqrhrwlrvvvzkeontgpj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcmhyd2xydnZ2emtlb250Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzU3MzYsImV4cCI6MjEwNTcxMTczNn0.QBe_D2zFKWe2sv5SGTlIp6WdC-2tH3HXxbxLzwnLZ5E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      // Public access - return published gigs only
      userId = null;
    }

    let query = supabase.from('gigs').select('*').eq('is_published', true);

    const { search, category, minPrice, maxPrice, deliveryDays, sort } = JSON.parse(event.body || '{}');

    if (search) {
      const q = search.toLowerCase();
      // Note: Full text search would require PostgreSQL full-text search
      // For now, apply other filters and let frontend handle search filtering
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    if (minPrice !== undefined) {
      const min = parseInt(minPrice, 10);
      if (!isNaN(min)) {
        query = query.gte('price', min);
      }
    }

    if (maxPrice !== undefined) {
      const max = parseInt(maxPrice, 10);
      if (!isNaN(max)) {
        query = query.lte('price', max);
      }
    }

    if (deliveryDays) {
      const days = parseInt(deliveryDays, 10);
      if (!isNaN(days)) {
        query = query.lte('delivery_days', days);
      }
    }

    // Sorting
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('average_rating', { ascending: false, minCount: 1 });
    } else {
      // Default: by promoted then rating
      query = query.order('is_promoted', { ascending: false });
      query = query.order('average_rating', { ascending: false });
    }

    const { data: gigs, error } = await query;

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    // If user is authenticated, also fetch their unpublished gigs
    let allGigs = gigs;
    if (userId) {
      const { data: userGigs, error: userGigsError } = await supabase
        .from('gigs')
        .select('*')
        .eq('seller_id', userId);
      
      if (!userGigsError && userGigs) {
        allGigs = [...gigs, ...userGigs].map(g => {
          // Dedup by id
          const existing = allGigs.find(x => x.id === g.id);
          return existing ? existing : g;
        }).filter(g => g);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ gigs: allGigs }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    };
  } catch (err) {
    console.error('Error in gigs-list:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};