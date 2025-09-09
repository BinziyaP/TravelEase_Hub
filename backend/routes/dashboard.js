const express = require('express');
const { getSupabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Middleware to verify Supabase JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const supabase = getSupabase();
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    // Get user profile to check user type
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create a default one or handle gracefully
    let userType = 'user'; // Default user type
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      
      // If it's a "not found" error, try to create a default profile
      if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows found')) {
        console.log('Creating default profile for user:', user.id);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            user_type: 'user'
          })
          .select('user_type')
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          // Continue with default user type
        } else {
          userType = newProfile?.user_type || 'user';
        }
      } else {
        // For other errors, just use default user type
        console.error('Profile fetch failed, using default user type');
      }
    } else {
      userType = profile?.user_type || 'user';
    }

    // Attach user with profile info to request
    req.user = {
      id: user.id,
      email: user.email,
      userType: userType
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Token verification failed' });
  }
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
      .from('profiles')
      .update({
        full_name: name,
        email,
        phone,
        date_of_birth: dateOfBirth,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, full_name, email, phone, date_of_birth, user_type')
      .single();

    if (error) {
      console.error('Profile update error:', error);
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
    
    // Get users from profiles table (which is the correct table structure)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        user_type,
        phone,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }

    // Transform the data to match the expected format
    const users = profiles.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      user_type: profile.user_type,
      email_verified: true, // Assuming verified since they're in profiles
      phone: profile.phone || 'N/A',
      created_at: profile.created_at,
      last_sign_in: profile.updated_at,
      banned: false // Default value, can be enhanced later
    }));

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get various statistics using correct table names
    const [profilesResult, bookingsResult, packagesResult, agenciesResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('packages').select('id', { count: 'exact' }),
      supabase.from('agencies').select('id', { count: 'exact' })
    ]);

    const stats = {
      totalUsers: profilesResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalPackages: packagesResult.count || 0,
      totalAgencies: agenciesResult.count || 0
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
        updateData = { user_type: 'suspended' };
        break;
      case 'activate':
        updateData = { user_type: 'user' };
        break;
      case 'ban':
        updateData = { user_type: 'banned' };
        break;
      case 'unban':
        updateData = { user_type: 'user' };
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }

    res.json({ success: true, message: `User ${action}d successfully` });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Agency Management Routes
router.get('/admin/agencies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: agencies, error } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch agencies' });
    }

    res.json({ success: true, agencies });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve agency
router.post('/admin/agencies/:agencyId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { notes } = req.body;
    const supabase = getSupabase();

    // First, check if agency exists
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      console.error('Agency not found:', agencyError);
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    if (agency.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Agency is already approved' });
    }

    // Update agency status to approved
    const { error: updateError } = await supabase
      .from('agencies')
      .update({
        status: 'approved',
        admin_notes: notes || 'Approved by admin',
        admin_id: req.user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      console.error('Error updating agency:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update agency status' });
    }

    // Insert approval history record
    const { error: historyError } = await supabase
      .from('agency_approval_history')
      .insert({
        agency_id: agencyId,
        action: 'approved',
        admin_id: req.user.id,
        notes: notes || 'Approved by admin'
      });

    if (historyError) {
      console.error('Error inserting approval history:', historyError);
      // Don't fail the request if history insertion fails, just log it
    }

    // TODO: Send email notification to agency
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: 'Agency approved successfully',
      emailSent: false // TODO: Implement email notification
    });
  } catch (error) {
    console.error('Error approving agency:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject agency
router.post('/admin/agencies/:agencyId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { notes } = req.body;
    const supabase = getSupabase();

    // First, check if agency exists
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      console.error('Agency not found:', agencyError);
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    if (agency.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Agency is already rejected' });
    }

    // Update agency status to rejected
    const { error: updateError } = await supabase
      .from('agencies')
      .update({
        status: 'rejected',
        admin_notes: notes || 'Rejected by admin',
        admin_id: req.user.id,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      console.error('Error updating agency:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update agency status' });
    }

    // Insert rejection history record
    const { error: historyError } = await supabase
      .from('agency_approval_history')
      .insert({
        agency_id: agencyId,
        action: 'rejected',
        admin_id: req.user.id,
        notes: notes || 'Rejected by admin'
      });

    if (historyError) {
      console.error('Error inserting rejection history:', historyError);
      // Don't fail the request if history insertion fails, just log it
    }

    // TODO: Send email notification to agency
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: 'Agency rejected successfully',
      emailSent: false // TODO: Implement email notification
    });
  } catch (error) {
    console.error('Error rejecting agency:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Public endpoint to fetch approved packages (no authentication required)
router.get('/public/packages', async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get approved packages with agency information
    const { data: packages, error } = await supabase
      .from('packages')
      .select(`
        id,
        name,
        destination,
        duration_days,
        price,
        max_travelers,
        created_at,
        agencies (
          agency_name,
          contact_person,
          city,
          state
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(12); // Limit to 12 packages for performance

    if (error) {
      console.error('Error fetching public packages:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch packages',
        packages: [] 
      });
    }

    // Transform the data to match frontend expectations
    const transformedPackages = packages.map(pkg => ({
      id: pkg.id,
      package_name: pkg.name,
      destination: pkg.destination,
      duration_days: pkg.duration_days,
      price: pkg.price,
      max_travelers: pkg.max_travelers,
      created_at: pkg.created_at,
      agency_name: pkg.agencies?.agency_name || 'Unknown Agency',
      contact_person: pkg.agencies?.contact_person || 'Unknown',
      city: pkg.agencies?.city || 'Unknown',
      state: pkg.agencies?.state || 'Unknown',
      // Add some default values for frontend compatibility
      image: '/src/assets/beach.png', // Default image
      category: 'TRAVEL PACKAGE',
      rating: 4.5,
      description: `Explore ${pkg.destination} with this amazing ${pkg.duration_days}-day travel package. Perfect for up to ${pkg.max_travelers} travelers.`
    }));

    res.json({ 
      success: true, 
      packages: transformedPackages,
      count: transformedPackages.length
    });
  } catch (error) {
    console.error('Error in public packages endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      packages: [] 
    });
  }
});

module.exports = router;
