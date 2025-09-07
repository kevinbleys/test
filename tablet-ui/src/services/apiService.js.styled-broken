// ✅ FIXED: Dynamic API URL detection voor service layer
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  console.log('🌐 apiService.js hostname detection:', hostname);

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const apiUrl = `${protocol}//${hostname}:3001`;
    console.log('📱 apiService TABLET MODE - API URL:', apiUrl);
    return apiUrl;
  }

  const localUrl = 'http://localhost:3001';
  console.log('💻 apiService LOCALHOST MODE - API URL:', localUrl);
  return localUrl;
};

// ✅ FIXED: Dynamic API_BASE_URL instead of hardcoded
const API_BASE_URL = getApiBaseUrl();

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 apiService making request to:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    console.error('Failed URL:', `${API_BASE_URL}${endpoint}`);
    throw error;
  }
};

export const getMembers = async () => {
  return apiRequest('/members');
};

export const checkMember = async (nom, prenom) => {
  return apiRequest(`/members/check?nom=${encodeURIComponent(nom)}&prenom=${encodeURIComponent(prenom)}`);
};

export const createPresence = async (presenceData) => {
  return apiRequest('/presences', {
    method: 'POST',
    body: JSON.stringify(presenceData),
  });
};

export const validatePresence = async (presenceId, paymentData) => {
  return apiRequest(`/presences/${presenceId}/valider`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

export const createNonMember = async (nonMemberData) => {
  return apiRequest('/non-members', {
    method: 'POST',
    body: JSON.stringify(nonMemberData),
  });
};

export const getPresences = async () => {
  return apiRequest('/presences');
};

export const getNonMembers = async () => {
  return apiRequest('/non-members');
};

// Export API_BASE_URL for components that need it
export { API_BASE_URL };

// Debug function to check current API URL
export const getDebugInfo = () => {
  return {
    apiBaseUrl: API_BASE_URL,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    fullUrl: window.location.href,
    isTabletMode: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  };
};

console.log('🔧 apiService.js loaded with dynamic API URL:', API_BASE_URL);