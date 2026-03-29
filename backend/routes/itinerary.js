const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');

// Middleware 
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 1. Get Group Itinerary Votes
router.get('/votes', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    const { data: membership } = await supabase.from('group_members').select('group_id').eq('user_id', userId).eq('status', 'joined').single();
    if (!membership) return res.json({ success: false, items: [] });

    const { data: votes, error: voteErr } = await supabase
      .from('group_itinerary_votes')
      .select('*')
      .eq('group_id', membership.group_id)
      .order('created_at', { ascending: true });

    if (voteErr) console.error('Fetch Votes Error:', voteErr);
    console.log(`Retrieved ${votes?.length || 0} votes for group ${membership.group_id}`);

    res.json({ success: true, votes: votes || [] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 2. Cast/Update Vote (GACS Logic)
router.post('/vote', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { activityName, voteType } = req.body; // voteType: 'approve', 'reject'

    const { data: membership, error: memErr } = await supabase.from('group_members').select('group_id').eq('user_id', userId).eq('status', 'joined').single();
    if (memErr || !membership) {
       console.error('Itinerary Membership Error:', memErr);
       return res.status(400).json({ success: false, message: 'You must be in a joined group to vote.' });
    }

    const groupId = membership.group_id;
    console.log(`User ${userId} voting '${voteType}' on '${activityName}' in group ${groupId}`);

    // Check existing vote
    const { data: existing, error: findErr } = await supabase
      .from('group_itinerary_votes')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('activity_name', activityName)
      .maybeSingle(); // maybeSingle avoids 406 if not found

    if (existing) {
      console.log('Updating existing vote...');
      await supabase.from('group_itinerary_votes').update({ vote_type: voteType }).eq('id', existing.id);
    } else {
      console.log('Inserting new vote...');
      const { error: insErr } = await supabase.from('group_itinerary_votes').insert({
        group_id: groupId,
        user_id: userId,
        activity_name: activityName,
        vote_type: voteType
      });
      if (insErr) console.error('Insert Vote Error:', insErr);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
