// Quick test for forgot password
const axios = require('axios');

async function testForgotPassword() {
  try {
    console.log('Testing forgot password...');
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'binziyap03@gmail.com'
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testForgotPassword();
