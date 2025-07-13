"use strict";
self["webpackHotUpdatetablet_ui"]("main",{

/***/ "./src/utils/soundUtils.js":
/*!*********************************!*\
  !*** ./src/utils/soundUtils.js ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   playBellSound: () => (/* binding */ playBellSound),
/* harmony export */   playBuzzerSound: () => (/* binding */ playBuzzerSound),
/* harmony export */   playSound: () => (/* binding */ playSound),
/* harmony export */   playSuccessSound: () => (/* binding */ playSuccessSound),
/* harmony export */   preloadSounds: () => (/* binding */ preloadSounds)
/* harmony export */ });
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
/* provided dependency */ var __react_refresh_error_overlay__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");

/**
 * Utilitaire pour jouer des sons dans l'application
 */

// Fonction pour jouer un son
const playSound = soundPath => {
  try {
    // Créer un nouvel objet Audio
    const audio = new Audio(soundPath);

    // Définir le volume (0.0 à 1.0)
    audio.volume = 0.8;

    // Jouer le son
    audio.play().then(() => {
      console.log('Son joué avec succès:', soundPath);
    }).catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'objet Audio:', error);
  }
};

// Fonction spécifique pour le son buzzer
const playBuzzerSound = () => {
  // Chemin vers le fichier MP3 buzzer dans le dossier public/assets
  const buzzerPath = '/assets/buzzer.mp3';
  playSound(buzzerPath);
};

// Fonction spécifique pour le son de cloche (bell)
const playBellSound = () => {
  // Chemin vers le fichier MP3 bell dans le dossier public/assets
  const bellPath = '/assets/bell.mp3';
  playSound(bellPath);
};

// Fonction pour jouer un son de succès (optionnel)
const playSuccessSound = () => {
  // Vous pouvez ajouter un son de succès si disponible
  const successPath = '/assets/success.mp3';
  playSound(successPath);
};

// Fonction pour pré-charger les sons (optionnel mais recommandé)
const preloadSounds = () => {
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

const $ReactRefreshModuleId$ = __webpack_require__.$Refresh$.moduleId;
const $ReactRefreshCurrentExports$ = __react_refresh_utils__.getModuleExports(
	$ReactRefreshModuleId$
);

function $ReactRefreshModuleRuntime$(exports) {
	if (true) {
		let errorOverlay;
		if (typeof __react_refresh_error_overlay__ !== 'undefined') {
			errorOverlay = __react_refresh_error_overlay__;
		}
		let testMode;
		if (typeof __react_refresh_test__ !== 'undefined') {
			testMode = __react_refresh_test__;
		}
		return __react_refresh_utils__.executeRuntime(
			exports,
			$ReactRefreshModuleId$,
			module.hot,
			errorOverlay,
			testMode
		);
	}
}

if (typeof Promise !== 'undefined' && $ReactRefreshCurrentExports$ instanceof Promise) {
	$ReactRefreshCurrentExports$.then($ReactRefreshModuleRuntime$);
} else {
	$ReactRefreshModuleRuntime$($ReactRefreshCurrentExports$);
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("64d48800da707659200f")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.74daeaa4fc4e5f22dc57.hot-update.js.map