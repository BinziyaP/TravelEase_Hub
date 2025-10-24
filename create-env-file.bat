@echo off
echo Creating backend .env file with your configuration...
echo.

echo # Server Configuration > backend\.env
echo PORT=5000 >> backend\.env
echo NODE_ENV=development >> backend\.env
echo FRONTEND_URL=http://localhost:5175 >> backend\.env
echo. >> backend\.env
echo # JWT Configuration >> backend\.env
echo JWT_SECRET="c7bb4fd6dfeaedb2cf1916b29f61d1445b9a3127536b8954f82c7b78ad8e7fb9" >> backend\.env
echo SESSION_SECRET="7a0d47f540879afd4922323cd7675d1bfeaed19ed8ff40ead4ccf7881f424b3f" >> backend\.env
echo. >> backend\.env
echo # Google OAuth Configuration >> backend\.env
echo GOOGLE_CLIENT_ID="747015984427-3ico4ti24ibm02dtdokna48ioitnnbnq.apps.googleusercontent.com" >> backend\.env
echo GOOGLE_CLIENT_SECRET="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" >> backend\.env
echo. >> backend\.env
echo # Supabase Configuration >> backend\.env
echo SUPABASE_URL="https://lffwizkuulsdcnjolvqr.supabase.co" >> backend\.env
echo SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig" >> backend\.env
echo. >> backend\.env
echo # Email Configuration (Gmail SMTP) >> backend\.env
echo EMAIL_HOST=smtp.gmail.com >> backend\.env
echo EMAIL_PORT=587 >> backend\.env
echo EMAIL_SECURE=false >> backend\.env
echo EMAIL_USER=travelease029@gmail.com >> backend\.env
echo EMAIL_PASS=lughjwieitczokme >> backend\.env
echo EMAIL_FROM_NAME=TravelEase >> backend\.env
echo EMAIL_FROM_ADDRESS=travelease029@gmail.com >> backend\.env
echo. >> backend\.env
echo # OTP Configuration >> backend\.env
echo OTP_EXPIRY_MINUTES=5 >> backend\.env
echo OTP_MAX_ATTEMPTS=5 >> backend\.env
echo OTP_LOCKOUT_DURATION_MINUTES=15 >> backend\.env
echo BCRYPT_ROUNDS=12 >> backend\.env
echo. >> backend\.env
echo # Service Role Key for Supabase (for backend operations) >> backend\.env
echo # Get this from: Supabase Dashboard ^> Settings ^> API ^> service_role secret >> backend\.env
echo SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzMDU4OSwiZXhwIjoyMDY5OTA2NTg5fQ.dwUKF4ZU9F7mYTAwbBsa9bHAC5SrZYMYVWTnAot95t8" >> backend\.env
echo. >> backend\.env
echo GOOGLE_PLACES_API_KEY=AIzaSyBRqVu5DrQncKK2GE4Qb7YDo4v4noTEvGY >> backend\.env
echo. >> backend\.env
echo # Razorpay Configuration (Add your Razorpay credentials here) >> backend\.env
echo RAZORPAY_KEY_ID=rzp_test_RWBuWQat4AFCo6 >> backend\.env
echo RAZORPAY_KEY_SECRET=9cpJcOakPJKd9D7Ijr0knOhj >> backend\.env

echo.
echo ✅ Backend .env file created successfully with your configuration!
echo.
echo 📝 Next steps:
echo 1. Start the backend server: cd backend && node server.js
echo 2. The server will run on http://localhost:5000
echo 3. Your Destinations.jsx should now be able to fetch package data
echo.
pause