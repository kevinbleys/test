"use strict";
self["webpackHotUpdatetablet_ui"]("main",{

/***/ "./src/services/api.js":
/*!*****************************!*\
  !*** ./src/services/api.js ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkMembership: () => (/* binding */ checkMembership)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
/* provided dependency */ var __react_refresh_error_overlay__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");


const API_URL = 'https://api.pepsup.com/'; // Utilise le proxy
const API_KEY = '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U'; // Clé API valide

const checkMembership = async (nom, prenom) => {
  try {
    const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(API_URL, {
      params: {
        firstName: prenom,
        lastName: nom
      },
      headers: {
        'api-key': API_KEY,
        // Header correct pour PEPsup
        'Accept': 'application/json'
      }
    });

    // Vérifier la structure de réponse
    if (response.data?.scanResult?.status === 'Clear') {
      return {
        isPaid: true,
        isValid: true
      };
    } else {
      throw new Error("Adhésion non valide ou problème de paiement");
    }
  } catch (error) {
    // Gestion des erreurs détaillée
    if (error.response) {
      throw new Error(`Erreur PEPsup [${error.response.status}]: ${error.response.data?.message}`);
    } else if (error.request) {
      throw new Error("Pas de réponse du serveur - Vérifiez votre connexion");
    } else {
      throw new Error("Erreur de configuration de la requête");
    }
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
/******/ 	__webpack_require__.h = () => ("0afa36cf7d519ca9abed")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.36028de3837c3f7c9acb.hot-update.js.map