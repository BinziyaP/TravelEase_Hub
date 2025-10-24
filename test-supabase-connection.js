// Test Supabase connection with proper headers
const supabaseUrl = 'https://lffwizkuulsdcnjolvqr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig';

console.log('🧪 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('API Key:', supabaseAnonKey.substring(0, 20) + '...');

// Test the connection
fetch(`${supabaseUrl}/rest/v1/`, {
  method: 'HEAD',
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
})
.then(response => {
  console.log('✅ Response status:', response.status);
  console.log('✅ Response headers:', response.headers);
  if (response.status === 200 || response.status === 204) {
    console.log('✅ Supabase connection successful!');
  } else {
    console.log('❌ Supabase connection failed with status:', response.status);
  }
})
.catch(error => {
  console.log('❌ Connection error:', error);
});







