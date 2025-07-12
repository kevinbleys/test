import axios from 'axios';

/**
 * Vérifie l'adhésion d'un membre auprès du backend
 * @param {string} nom - Nom de famille du membre
 * @param {string} prenom - Prénom du membre
 * @returns {Promise<object>} - Informations sur le membre et son statut d'adhésion
 */
export const checkMembership = async (nom, prenom) => {
  try {
    // Appel à notre backend (qui synchronise avec PEPsup)
    const response = await axios.get('http://localhost:4000/members', {
      params: { nom, prenom }
    });
    
    return response.data;
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.response) {
      if (error.response.status === 404) {
        return { 
          success: false, 
          isPaid: false, 
          message: "Aucun membre trouvé avec ce nom et prénom."
        };
      }
      throw new Error(error.response.data?.message || "Erreur de serveur");
    } else if (error.request) {
      throw new Error("Pas de réponse du serveur - Vérifiez votre connexion");
    } else {
      throw new Error("Erreur lors de la configuration de la requête");
    }
  }
};
