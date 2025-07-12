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


const API_URL = 'http://localhost:4000';
const checkMembership = async (nom, prenom) => {
  try {
    const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(`${API_URL}/members`, {
      params: {
        nom,
        prenom
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      if (error.response.status === 404) {
        return {
          success: false,
          isPaid: false,
          message: "Aucun membre trouvé avec ce nom et prénom."
        };
      }
      throw new Error(error.response.data?.message || "Erreur du serveur");
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      throw new Error("Pas de réponse du serveur - Vérifiez votre connexion");
    } else {
      // Erreur lors de la configuration de la requête
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
/******/ 	__webpack_require__.h = () => ("74113d633a55b4fec7ee")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.d47b7592d5b531e27836.hot-update.js.map