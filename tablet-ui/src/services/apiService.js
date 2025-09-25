// apiService.js - Dynamic API URL configuration
const getApiBaseUrl = () => {
  // Check if we're running on localhost (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // For network access (tablet), use the same host as the frontend but port 3001
  return `http://${window.location.hostname}:3001`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

export default API_BASE_URL;
export { getApiBaseUrl };