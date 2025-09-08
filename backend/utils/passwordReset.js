const crypto = require('crypto');
const { getSupabase } = require('../config/supabase');

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create password reset token in database
const createPasswordResetToken = async (userId) => {
  try {
    const supabase = getSupabase();
    const token = generateResetToken();
    const expiresAt = new Date();
    // Token expires in 30 minutes
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Delete any existing tokens for this user
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', userId);

    // Create new token
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating reset token:', error);
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error in createPasswordResetToken:', error);
    return null;
  }
};

// Verify password reset token
const verifyResetToken = async (token) => {
  try {
    const supabase = getSupabase();

    // Filter at DB level to avoid timezone parsing issues
    const nowIso = new Date().toISOString();

    // Find a valid, un-used token that hasn't expired
    const { data: tokenRows, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', nowIso)
      .limit(1);

    if (tokenError) {
      console.error('Error verifying reset token:', tokenError);
      return { success: false, error: 'Database error' };
    }

    if (!tokenRows || tokenRows.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const tokenData = tokenRows[0];

    // Fetch user separately to avoid join issues
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !userRow) {
      console.error('Error fetching user for reset token:', userError);
      return { success: false, error: 'User not found for this token' };
    }

    return {
      success: true,
      userId: tokenData.user_id,
      user: userRow,
      tokenId: tokenData.id
    };

  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    return { success: false, error: 'Internal server error' };
  }
};

// Mark token as used
const markTokenAsUsed = async (tokenId) => {
  try {
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenId);

    return !error;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
};

// Clean up expired tokens (utility function)
const cleanupExpiredTokens = async () => {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
    } else {
      console.log('Expired password reset tokens cleaned up');
    }
  } catch (error) {
    console.error('Error in cleanupExpiredTokens:', error);
  }
};

// Get reset token info (for testing/debugging)
const getResetTokenInfo = async (email) => {
  try {
    const supabase = getSupabase();
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (userError) {
      console.error('Error finding user for password reset:', userError);
      return { success: false, error: 'Database error' };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = users[0];

    const { data: tokens, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('token, expires_at, used, created_at')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (tokenError) {
      return { success: false, error: 'Error fetching tokens' };
    }

    return { 
      success: true, 
      tokens: tokens || [],
      userId: user.id
    };

  } catch (error) {
    console.error('Error in getResetTokenInfo:', error);
    return { success: false, error: 'Internal server error' };
  }
};

module.exports = {
  generateResetToken,
  createPasswordResetToken,
  verifyResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
  getResetTokenInfo
};
