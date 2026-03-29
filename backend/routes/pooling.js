const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');
// Middleware to verify Supabase JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error parsing token' });
  }
};

// Normalize a value between 0 and 1
const normalize = (val, min, max) => (val - min) / (max - min);

// Calculate Compatibility Index using K-Means/Distance conceptually
const calculateCompatibility = (u1, u2) => {
  // Normalize budget (assuming 5000 to 100000 range)
  const b1 = normalize(u1.budget_limit || 20000, 5000, 100000);
  const b2 = normalize(u2.budget_limit || 20000, 5000, 100000);
  
  // Extract preferences (scale 1 to 10)
  const p1 = u1.preferences || { adventure: 5, luxury: 5, culture: 5 };
  const p2 = u2.preferences || { adventure: 5, luxury: 5, culture: 5 };
  
  const adv1 = normalize(p1.adventure, 1, 10);
  const adv2 = normalize(p2.adventure, 1, 10);
  
  const lux1 = normalize(p1.luxury, 1, 10);
  const lux2 = normalize(p2.luxury, 1, 10);
  
  const cul1 = normalize(p1.culture, 1, 10);
  const cul2 = normalize(p2.culture, 1, 10);

  // Euclidean Distance (w=0.25 for each of 4 features)
  const dist = Math.sqrt(
    0.25 * Math.pow(b1 - b2, 2) +
    0.25 * Math.pow(adv1 - adv2, 2) +
    0.25 * Math.pow(lux1 - lux2, 2) +
    0.25 * Math.pow(cul1 - cul2, 2)
  );
  
  // Return Compatibility Index (1 - Distance)
  return 1 - dist;
};

// 1. Get current pooling status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Check if user is in any group_members
    const { data: membership, error } = await supabase
      .from('group_members')
      .select('*, travel_groups(*)')
      .eq('user_id', req.user.id)
      .limit(1)
      .single();

    if (!membership || error) {
      return res.json({ status: 'none', message: 'Not in a group' });
    }

    res.json({ status: 'active', membership });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error check pooling status' });
  }
});

// 2. Find matches / Join Pool
router.post('/find-match', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { budget, preferences } = req.body; // e.g., { adventure: 8, luxury: 3, culture: 7 }
    const userId = req.user.id; // Corrected: user_id is the UID string
    
    // Check if already in system, else insert
    let { data: existing } = await supabase.from('group_members').select('*').eq('user_id', userId).single();
    
    if (existing) {
      await supabase.from('group_members').update({
        budget_limit: budget,
        preferences,
        status: 'pending' // Searching state
      }).eq('user_id', userId);
    } else {
      await supabase.from('group_members').insert({
        user_id: userId,
        budget_limit: budget,
        preferences,
        status: 'pending'
      });
    }

    // Now, fetch all OTHER pending solo travelers to find a match
    const { data: poolers, error: fetchErr } = await supabase
      .from('group_members')
      .select('*') 
      .eq('status', 'pending')
      .neq('user_id', userId);
      
    if (fetchErr) console.error('Error fetching poolers:', fetchErr);

    if (!poolers || poolers.length === 0) {
      return res.json({ 
        success: true, 
        matched: false, 
        message: 'You are added to the pool. Waiting for compatible travelers...' 
      });
    }

    // Find the best match
    let bestMatch = null;
    let highestScore = 0;
    
    const currentUser = { budget_limit: budget, preferences };

    for (const traveler of poolers) {
      const score = calculateCompatibility(currentUser, traveler);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = traveler;
      }
    }

    // Threshold logic from Paper (e.g. 75% compatibility)
    if (highestScore >= 0.70) {
      // Create a new travel group
      const { data: newGroup, error: groupErr } = await supabase.from('travel_groups').insert({
        name: `AI Nomads ${Math.floor(Math.random() * 1000)}`,
        status: 'forming',
        estimated_budget: (budget + bestMatch.budget_limit) / 2
      }).select().single();

      if (!groupErr && newGroup) {
        // Add both to the group
        await supabase.from('group_members').update({ group_id: newGroup.id, status: 'joined', compatibility_score: highestScore * 100 }).eq('user_id', userId);
        await supabase.from('group_members').update({ group_id: newGroup.id, status: 'joined', compatibility_score: highestScore * 100 }).eq('user_id', bestMatch.user_id);
        
        return res.json({
          success: true,
          matched: true,
          score: (highestScore * 100).toFixed(1),
          group: newGroup,
          partner: bestMatch
        });
      }
    }

    res.json({ 
      success: true, 
      matched: false, 
      message: 'Scanned poolers but no high match found (>70%). You remain in the pool.' 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed finding match' });
  }
});

// 3. Leave pool or group
router.post('/leave', authenticateToken, async (req, res) => {
  const supabase = getSupabase();
  await supabase.from('group_members').delete().eq('user_id', req.user.id);
  res.json({ success: true });
});

module.exports = router;
