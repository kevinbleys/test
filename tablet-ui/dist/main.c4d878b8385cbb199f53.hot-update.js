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


const API_URL = '/api/members/check'; // Proxy activé
const API_HEADERS = {
  'HFAPIKEY': '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U',
  'APISECRET': 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo'
};
const checkMembership = async (nom, prenom) => {
  try {
    const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(API_URL, {
      headers: API_HEADERS,
      params: {
        nom,
        prenom
      },
      timeout: 10000 // 10 secondes avant timeout
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Réponse API invalide');
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error("Délai d'attente dépassé");
    } else if (error.response) {
      throw new Error(`Erreur PEPsup [${error.response.status}]`);
    } else {
      throw new Error("Connexion au serveur impossible");
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
/******/ 	__webpack_require__.h = () => ("df99d8c47bb3bf1a0e1d")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.c4d878b8385cbb199f53.hot-update.js.map