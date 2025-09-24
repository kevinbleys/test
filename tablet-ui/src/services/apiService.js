// API Service voor consistent API management
// ✅ GECORRIGEERDE BASE URL - localhost:3001

const API_BASE_URL = 'http://localhost:3001';

// Helper function voor API calls
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    console.log(`API Call: ${config.method || 'GET'} ${url}`);
    if (config.body) {
        console.log('Request body:', JSON.parse(config.body));
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        console.log(`API Response [${response.status}]:`, data);

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error for ${url}:`, error);
        throw error;
    }
};

// Member services
export const memberService = {
    // Check member status
    checkMember: async (nom, prenom) => {
        return apiCall(`/members/check?nom=${encodeURIComponent(nom)}&prenom=${encodeURIComponent(prenom)}`);
    },

    // Get all members
    getAllMembers: async () => {
        return apiCall('/members/all');
    }
};

// Presence services
export const presenceService = {
    // Add new presence
    addPresence: async (presenceData) => {
        return apiCall('/presences', {
            method: 'POST',
            body: JSON.stringify(presenceData)
        });
    },

    // Get all presences
    getPresences: async () => {
        return apiCall('/presences');
    },

    // Delete presence
    deletePresence: async (id) => {
        return apiCall(`/presences/${id}`, {
            method: 'DELETE'
        });
    }
};

// Non-member services
export const nonMemberService = {
    // Add non-member
    addNonMember: async (nonMemberData) => {
        return apiCall('/non-members', {
            method: 'POST',
            body: JSON.stringify(nonMemberData)
        });
    },

    // Get all non-members
    getNonMembers: async () => {
        return apiCall('/non-members');
    }
};

// Stats services
export const statsService = {
    // Get today's stats
    getTodayStats: async () => {
        return apiCall('/api/stats/today');
    },

    // Get general stats
    getGeneralStats: async () => {
        return apiCall('/api/stats');
    }
};

// Health check
export const healthService = {
    // Check API health
    checkHealth: async () => {
        return apiCall('/api/health');
    },

    // Check API status
    checkStatus: async () => {
        return apiCall('/api/status');
    }
};

// Combined workflow services
export const workflowService = {
    // Complete member check-in workflow
    memberCheckIn: async (nom, prenom) => {
        try {
            // Step 1: Check member status
            const memberCheck = await memberService.checkMember(nom, prenom);

            if (!memberCheck.success) {
                return memberCheck;
            }

            // Step 2: Register presence
            const presenceData = {
                type: 'adherent',
                nom: nom.trim(),
                prenom: prenom.trim()
            };

            const presenceResult = await presenceService.addPresence(presenceData);

            return {
                success: true,
                member: memberCheck.membre,
                presence: presenceResult.presence,
                message: 'Check-in réussi pour le membre'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Erreur lors du check-in membre'
            };
        }
    },

    // Complete non-member registration workflow
    nonMemberRegistration: async (formData, niveau, assuranceAccepted, paymentData) => {
        try {
            // Calculate complete presence data
            const presenceData = {
                type: 'non-adherent',
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                email: formData.email,
                telephone: formData.telephone,
                dateNaissance: formData.dateNaissance,
                niveau: niveau,
                tarif: paymentData.tarif,
                methodePaiement: paymentData.methodePaiement,
                status: paymentData.status,
                assuranceAccepted: assuranceAccepted,
                dateValidation: new Date().toISOString()
            };

            // Register presence
            const presenceResult = await presenceService.addPresence(presenceData);

            // Also save to non-members for tracking
            const nonMemberData = {
                ...formData,
                niveau,
                tarif: paymentData.tarif,
                status: 'registered',
                dateRegistered: new Date().toISOString()
            };

            await nonMemberService.addNonMember(nonMemberData);

            return {
                success: true,
                presence: presenceResult.presence,
                message: 'Inscription non-membre réussie'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Erreur lors de l'inscription non-membre'
            };
        }
    }
};

export default {
    memberService,
    presenceService,
    nonMemberService,
    statsService,
    healthService,
    workflowService
};
