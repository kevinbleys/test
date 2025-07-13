/**
 * Utilitaire pour jouer des sons dans l'application
 */

// Fonction pour jouer un son
export const playSound = (soundPath) => {
  try {
    // Créer un nouvel objet Audio
    const audio = new Audio(soundPath);
    
    // Définir le volume (0.0 à 1.0)
    audio.volume = 0.8;
    
    // Jouer le son
    audio.play()
      .then(() => {
        console.log('Son joué avec succès:', soundPath);
      })
      .catch(error => {
        console.error('Erreur lors de la lecture du son:', error);
      });
  } catch (error) {
    console.error('Erreur lors de la création de l\'objet Audio:', error);
  }
};

// Fonction spécifique pour le son buzzer
export const playBuzzerSound = () => {
  // Chemin vers le fichier MP3 buzzer dans le dossier public/assets
  const buzzerPath = '/assets/buzzer.mp3';
  playSound(buzzerPath);
};

// Fonction spécifique pour le son de cloche (bell)
export const playBellSound = () => {
  // Chemin vers le fichier MP3 bell dans le dossier public/assets
  const bellPath = '/assets/bell.mp3';
  playSound(bellPath);
};

// Fonction pour jouer un son de succès (optionnel)
export const playSuccessSound = () => {
  // Vous pouvez ajouter un son de succès si disponible
  const successPath = '/assets/success.mp3';
  playSound(successPath);
};

// Fonction pour pré-charger les sons (optionnel mais recommandé)
export const preloadSounds = () => {
  try {
    // Pré-charger le son buzzer
    const buzzerAudio = new Audio('/assets/buzzer.mp3');
    buzzerAudio.preload = 'auto';
    
    // Pré-charger le son bell
    const bellAudio = new Audio('/assets/bell.mp3');
    bellAudio.preload = 'auto';
    
    console.log('Sons pré-chargés');
  } catch (error) {
    console.error('Erreur lors du pré-chargement des sons:', error);
  }
};
