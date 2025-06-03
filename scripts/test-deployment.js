const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing AQ-PAY API...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };

    const healthResponse = await makeRequest(healthOptions);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data, null, 2)}\n`);

    if (healthResponse.status !== 200) {
      throw new Error('Health check failed');
    }

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await makeRequest(registerOptions, testUser);
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response: ${JSON.stringify(registerResponse.data, null, 2)}\n`);

    if (registerResponse.status !== 201) {
      throw new Error('User registration failed');
    }

    const token = registerResponse.data.data.token;

    // Test 3: User Login
    console.log('3. Testing User Login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}\n`);

    if (loginResponse.status !== 200) {
      throw new Error('User login failed');
    }

    // Test 4: Get Profile (Protected Route)
    console.log('4. Testing Get Profile (Protected Route)...');
    const profileOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const profileResponse = await makeRequest(profileOptions);
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Response: ${JSON.stringify(profileResponse.data, null, 2)}\n`);

    if (profileResponse.status !== 200) {
      throw new Error('Get profile failed');
    }

    // Test 5: 404 Route
    console.log('5. Testing 404 Route...');
    const notFoundOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/nonexistent',
      method: 'GET'
    };

    const notFoundResponse = await makeRequest(notFoundOptions);
    console.log(`   Status: ${notFoundResponse.status}`);
    console.log(`   Response: ${JSON.stringify(notFoundResponse.data, null, 2)}\n`);

    if (notFoundResponse.status !== 404) {
      throw new Error('404 handling failed');
    }

    console.log('✅ All tests passed! API is ready for deployment.\n');
    console.log('🚀 You can now deploy to Vercel with confidence!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testAPI(); 