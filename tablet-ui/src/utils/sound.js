export const playBellSound = () => {
  const audio = new Audio('/assets/bell.mp3'); // Chemin correct du fichier
  audio.play();
};
