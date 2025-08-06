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

      // Only add avatar_url if the column exists
      try {
        if (profile.photos && profile.photos[0]) {
          updateData.avatar_url = profile.photos[0].value;
        }
      } catch (e) {
        console.log('Avatar URL not supported, skipping...');
      }

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
      email_verified: true,
      user_type: 'user',
      created_at: new Date().toISOString()
    };

    // Only add avatar_url if supported
    try {
      if (profile.photos && profile.photos[0]) {
        newUserData.avatar_url = profile.photos[0].value;
      }
    } catch (e) {
      console.log('Avatar URL not supported, skipping...');
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(newUserData)
      .select()
      .single();

    if (createError) {
      return done(createError, null);
    }

    done(null, newUser);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;
