// apiService.js - Dynamic API URL configuration voor volledige netwerkondersteuning
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;

  console.log('🌐 Detecting API URL...');
  console.log('Current hostname:', hostname);
  console.log('Current port:', port);

  // Check if we're running on localhost (development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('✅ Detected localhost - using http://localhost:3001');
    return 'http://localhost:3001';
  }

  // For network access, use the same host as the frontend but port 3001
  const apiUrl = `http://${hostname}:3001`;
  console.log('✅ Detected network access - using', apiUrl);

  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🚀 API Service initialized with URL:', API_BASE_URL);

// Test connectivity function
const testConnection = async () => {
  try {
    console.log('🔄 Testing API connection to', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful:', data);
      return true;
    } else {
      console.error('❌ API connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error.message);
    return false;
  }
};

// Auto-test connection on load
setTimeout(testConnection, 1000);

export default API_BASE_URL;
export { getApiBaseUrl, testConnection };