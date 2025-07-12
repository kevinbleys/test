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


const API_URL = 'https://api.pepsup.com/api/v1/contacts';
const API_HEADERS = {
  'HFAPIKEY': '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U',
  'APISECRET': 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo'
};

/**
 * Récupère tous les contacts de l'association et filtre sur le nom/prénom.
 * @param {string} nom - Nom de famille à chercher.
 * @param {string} prenom - Prénom à chercher.
 * @returns {Promise<object|null>} - Le membre trouvé ou null si absent.
 */
const checkMembership = async (nom, prenom) => {
  try {
    const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(API_URL, {
      headers: API_HEADERS
    });
    if (response.status === 200 && Array.isArray(response.data)) {
      // Filtrage côté client sur nom et prénom (insensible à la casse)
      const membre = response.data.find(m => m.lastname?.toLowerCase() === nom.toLowerCase() && m.firstname?.toLowerCase() === prenom.toLowerCase());
      return membre || null;
    } else {
      throw new Error("Réponse inattendue de l'API Pep's Up.");
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || `Erreur API Pep's Up [${error.response.status}]`);
    } else if (error.request) {
      throw new Error("Pas de réponse du serveur - Vérifiez votre connexion");
    } else {
      throw new Error("Erreur lors de la configuration de la requête");
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
/******/ 	__webpack_require__.h = () => ("66736095c4af7a1fd16b")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.df99d8c47bb3bf1a0e1d.hot-update.js.map