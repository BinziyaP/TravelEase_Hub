const express = require('express');
const { getSupabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is agency
const requireAgency = (req, res, next) => {
  if (req.user.userType !== 'agency') {
    return res.status(403).json({ success: false, message: 'Agency access required' });
  }
  next();
};

// User Dashboard Routes
router.get('/user/bookings', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth } = req.body;
    const supabase = getSupabase();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: name,
        email,
        phone,
        date_of_birth: dateOfBirth,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, full_name, email, phone, date_of_birth')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Agency Dashboard Routes
router.get('/agency/packages', authenticateToken, requireAgency, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: packages, error } = await supabase
      .from('travel_packages')
      .select('*')
      .eq('agency_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch packages' });
    }

    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching agency packages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/agency/packages', authenticateToken, requireAgency, async (req, res) => {
  try {
    const { name, description, destination, duration_days, price, max_travelers, features } = req.body;
    const supabase = getSupabase();

    const { data: newPackage, error } = await supabase
      .from('travel_packages')
      .insert({
        agency_id: req.user.id,
        name,
        description,
        destination,
        duration_days: parseInt(duration_days),
        price: parseFloat(price),
        max_travelers: parseInt(max_travelers),
        available_slots: parseInt(max_travelers),
        features: Array.isArray(features) ? features : [],
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to create package' });
    }

    res.status(201).json({ success: true, package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/agency/bookings', authenticateToken, requireAgency, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get bookings for packages owned by this agency
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        travel_packages!inner(agency_id)
      `)
      .eq('travel_packages.agency_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching agency bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Dashboard Routes
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, user_type, email_verified, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get various statistics
    const [usersResult, bookingsResult, packagesResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('travel_packages').select('id', { count: 'exact' })
    ]);

    const stats = {
      totalUsers: usersResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalPackages: packagesResult.count || 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/admin/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: packages, error } = await supabase
      .from('travel_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch packages' });
    }

    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching all packages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint to verify API is working
router.get('/public/test', (req, res) => {
  res.json({ success: true, message: 'Public API is working!' });
});

// Test endpoint to check database connection and tables
router.get('/public/db-test', async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Test packages table
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('count')
      .limit(1);
    
    // Test agencies table
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('count')
      .limit(1);
    
    res.json({
      success: true,
      message: 'Database connection test',
      packages: {
        exists: !packagesError,
        error: packagesError?.message || null
      },
      agencies: {
        exists: !agenciesError,
        error: agenciesError?.message || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Public endpoint to fetch approved packages for destinations page
router.get('/public/packages', async (req, res) => {
  try {
    const supabase = getSupabase();
    
    console.log('🔍 Fetching packages from database...');
    
    // First, let's try to get packages without agency data to see if the basic query works
    const { data: packages, error } = await supabase
      .from('packages')
      .select(`
        id,
        name,
        destination,
        duration_days,
        price,
        max_travelers,
        status,
        created_at,
        agency_id
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch packages',
        error: error.message 
      });
    }

    console.log('✅ Packages fetched:', packages?.length || 0);

    // Now let's get agency data separately to avoid join issues
    let agencyData = {};
    if (packages && packages.length > 0) {
      const agencyIds = [...new Set(packages.map(pkg => pkg.agency_id))];
      console.log('🔍 Fetching agency data for IDs:', agencyIds);
      
      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select(`
          id,
          agency_name,
          contact_person,
          phone,
          email
        `)
        .in('id', agencyIds);

      if (agencyError) {
        console.error('⚠️ Error fetching agencies:', agencyError);
        // Continue without agency data
      } else {
        console.log('✅ Agencies fetched:', agencies?.length || 0);
        // Create a lookup map
        agencies?.forEach(agency => {
          agencyData[agency.id] = {
            agency_name: agency.agency_name || agency.name || 'Unknown Agency',
            contact_person: agency.contact_person || 'Contact Person',
            contact_email: agency.email || 'contact@agency.com',
            contact_phone: agency.phone || 'N/A'
          };
        });
      }
    }

    // Transform the data to match frontend expectations
    const transformedPackages = packages?.map(pkg => {
      const agency = agencyData[pkg.agency_id] || {
        agency_name: 'Travel Agency',
        contact_person: 'Contact Person',
        contact_email: 'contact@agency.com',
        contact_phone: 'N/A'
      };

      return {
        id: pkg.id,
        package_name: pkg.name,
        destination: pkg.destination,
        duration: pkg.duration_days,
        price: pkg.price,
        max_travelers: pkg.max_travelers,
        status: pkg.status,
        created_at: pkg.created_at,
        description: `Explore ${pkg.destination} with this amazing ${pkg.duration_days}-day travel package. Perfect for up to ${pkg.max_travelers} travelers.`,
        category: 'TRAVEL PACKAGE',
        rating: 4.5, // Default rating since it's not in the schema
        agencies: agency
      };
    }) || [];

    console.log('✅ Transformed packages:', transformedPackages.length);

    res.json({ success: true, packages: transformedPackages });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

router.put('/admin/users/:userId/:action', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, action } = req.params;
    const supabase = getSupabase();

    let updateData = {};
    
    switch (action) {
      case 'suspend':
        updateData = { status: 'suspended' };
        break;
      case 'activate':
        updateData = { status: 'active' };
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }

    res.json({ success: true, message: `User ${action}d successfully` });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
