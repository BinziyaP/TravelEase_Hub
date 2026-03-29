const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');

// Middleware to verify Supabase JWT token
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
    res.status(500).json({ success: false, message: 'Server error parsing token' });
  }
};

// SHAPLEY VALUE CALCULATION SIMULATION
// Calculates the fair share based on marginal contribution (utility weight)
const calculateShapleySplit = (totalAmount, members) => {
  // members is array of { user_id, weight } 
  // e.g., weight 1 = standard use, weight 0 = did not participate, weight 2 = heavy use (e.g. 2 rooms)
  const totalWeight = members.reduce((sum, m) => sum + m.weight, 0);
  
  if (totalWeight === 0) return members.map(m => ({ ...m, amount: 0 }));

  return members.map(m => ({
    user_id: m.user_id,
    amount: (m.weight / totalWeight) * totalAmount
  }));
};

// 1. Get Group Dashboard Data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    // Find the user's current group
    const { data: membership } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .eq('status', 'joined')
      .single();

    if (!membership) {
      return res.json({ success: false, message: 'Not in an active group.' });
    }

    const groupId = membership.group_id;

    // Fetch group details
    const { data: group } = await supabase.from('travel_groups').select('*').eq('id', groupId).single();
    
    // Fetch all members in the group
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, role') 
      .eq('group_id', groupId)
      .eq('status', 'joined');

    // Fetch all group expenses
    const { data: expenses } = await supabase
      .from('group_expenses')
      .select('*, expense_splits(*)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    res.json({ success: true, group, members, expenses });
  } catch (err) {
    console.error('Error fetching group dashboard:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
});

// 2. Add an Expense via Shapley Splitter
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { amount, description, category, participants } = req.body; 
    // participants is array: [{ user_id: '123', weight: 1 }, { user_id: '456', weight: 0.5 }]

    // Check membership
    const { data: membership } = await supabase.from('group_members').select('group_id').eq('user_id', userId).eq('status', 'joined').single();
    if (!membership) return res.status(400).json({ success: false, message: 'Not in a group' });

    const groupId = membership.group_id;

    // 1. Insert the massive Group Expense record
    const { data: expense, error: expErr } = await supabase.from('group_expenses').insert({
      group_id: groupId,
      paid_by_user_id: userId,
      amount: Number(amount),
      description,
      category,
      split_type: 'shapley'
    }).select().single();

    if (expErr) throw expErr;

    // 2. Algorithmically split using Game Theory Shapley Calculation
    const splits = calculateShapleySplit(Number(amount), participants);

    // 3. Insert specific exact split amounts owed to the dynamic expense_splits table
    const splitInserts = splits.map(s => ({
      expense_id: expense.id,
      user_id: s.user_id,
      amount_owed: s.amount,
      status: s.user_id === userId ? 'paid' : 'pending' // Person who paid directly owes 0 / is cleared
    }));

    const { error: splitErr } = await supabase.from('expense_splits').insert(splitInserts);
    if (splitErr) throw splitErr;

    res.json({ success: true, message: 'Expense intelligently split using Shapley Value.', splits });
  } catch (err) {
    console.error('Game Theory Splitter Error:', err);
    res.status(500).json({ success: false, error: 'Calculation engine failed.' });
  }
});

module.exports = router;
