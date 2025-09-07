// ✅ ONLY CHANGE: Dynamic API URL detection
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

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

export { API_BASE_URL };