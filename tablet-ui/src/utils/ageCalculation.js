// Utility functions voor leeftijd en tarief berekening

/**
 * Berekent de leeftijd op basis van geboortedatum
 * @param {string} dateNaissance - Geboortedatum in YYYY-MM-DD formaat
 * @returns {number} - Leeftijd in jaren
 */
export const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Als de verjaardag dit jaar nog niet geweest is, trek 1 jaar af
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age); // Geen negatieve leeftijden
};

/**
 * Berekent het tarief op basis van leeftijd
 * @param {number} age - Leeftijd in jaren
 * @returns {object} - Object met tarief en beschrijving
 */
export const calculateTarif = (age) => {
  if (age < 8) {
    return {
      tarif: 0,
      description: 'Gratuit pour les enfants de moins de 8 ans',
      category: 'enfant'
    };
  } else if (age >= 8 && age < 18) {
    return {
      tarif: 8,
      description: 'Tarif réduit pour les mineurs (8-17 ans)',
      category: 'mineur'
    };
  } else {
    return {
      tarif: 10,
      description: 'Tarif normal pour les adultes (18 ans et plus)',
      category: 'adulte'
    };
  }
};

/**
 * Berekent leeftijd EN tarief in één keer
 * @param {string} dateNaissance - Geboortedatum in YYYY-MM-DD formaat
 * @returns {object} - Object met age, tarief en beschrijving
 */
export const calculateAgeAndTarif = (dateNaissance) => {
  const age = calculateAge(dateNaissance);
  const tarifInfo = calculateTarif(age);
  
  return {
    age,
    ...tarifInfo
  };
};
