const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getSupabase } = require('./supabase');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return done(error, null);
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const supabase = getSupabase();
    
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', profile.id)
      .single();

    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists with same email
    const { data: emailUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.emails[0].value)
      .single();

    if (emailUser) {
      // Update existing user with Google ID
      const updateData = { google_id: profile.id };

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', emailUser.id)
        .select()
        .single();

      if (updateError) {
        return done(updateError, null);
      }

      return done(null, updatedUser);
    }

    // Create new user
    const newUserData = {
      google_id: profile.id,
      email: profile.emails[0].value,
      full_name: profile.displayName || 'Google User',
      password_hash: null, // Google OAuth users don't have passwords
      email_verified: true,
      user_type: 'user',
      created_at: new Date().toISOString()
    };

    const { data: newUsers, error: createError } = await supabase
      .from('users')
      .insert(newUserData)
      .select();

    if (createError) {
      console.error('Error creating new Google user:', createError);
      console.error('User data attempted:', newUserData);
      return done(createError, null);
    }

    if (newUsers && newUsers.length > 0) {
      console.log('✅ Google user created successfully:', newUsers[0].email);

      // Send registration success email for new Google user (don't wait for it)
      try {
        const { sendRegistrationSuccessEmail } = require('../utils/emailService');
        sendRegistrationSuccessEmail(newUsers[0].email, newUsers[0].full_name);
        console.log('✅ Registration success email sent to:', newUsers[0].email);
      } catch (emailError) {
        console.log('⚠️ Email service not available:', emailError.message);
      }

      return done(null, newUsers[0]);
    }

    return done(new Error('Failed to create user'), null);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;
