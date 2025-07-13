"use strict";
self["webpackHotUpdatetablet_ui"]("main",{

/***/ "./src/components/MemberCheck.jsx":
/*!****************************************!*\
  !*** ./src/components/MemberCheck.jsx ***!
  \****************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MemberCheck)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
/* provided dependency */ var __react_refresh_error_overlay__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");

var _s = __webpack_require__.$Refresh$.signature();




function MemberCheck() {
  _s();
  const [nom, setNom] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [prenom, setPrenom] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [message, setMessage] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_2__.useNavigate)();
  const handleVerification = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios__WEBPACK_IMPORTED_MODULE_3__["default"].get('http://localhost:4000/members/check', {
        params: {
          nom,
          prenom
        }
      });
      if (checkResponse.data.success) {
        // Membre valide et payé
        setMessage(checkResponse.data.message);

        // Étape 2: Enregistrement de la présence
        const presenceResponse = await axios__WEBPACK_IMPORTED_MODULE_3__["default"].post('http://localhost:4000/presences', {
          type: 'adherent',
          nom,
          prenom
        });
        if (presenceResponse.data.success) {
          // Redirection après succès
          setTimeout(() => {
            navigate('/confirmation');
          }, 2000);
        } else {
          setError("Erreur lors de l'enregistrement de la présence");
        }
      } else {
        // Membre non valide ou non payé
        setError(checkResponse.data.error || "Adhésion non valide");
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 404) {
        setError("Aucun membre trouvé avec ce nom et prénom");
      } else {
        setError(error.response?.data?.error || error.message || "Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
    className: "member-check",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("h2", {
      children: "V\xE9rification d'adh\xE9sion"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("form", {
      onSubmit: handleVerification,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("label", {
          children: "Nom"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("input", {
          type: "text",
          value: nom,
          onChange: e => setNom(e.target.value),
          required: true,
          disabled: loading
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("label", {
          children: "Pr\xE9nom"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("input", {
          type: "text",
          value: prenom,
          onChange: e => setPrenom(e.target.value),
          required: true,
          disabled: loading
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("button", {
        type: "submit",
        disabled: loading,
        children: loading ? 'Vérification...' : 'Vérifier'
      })]
    }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
      className: "error-message",
      children: error
    }), message && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
      className: "success-message",
      children: message
    })]
  });
}
_s(MemberCheck, "TA3mvLIMvxXu7o2tNROkjXifLW4=", false, function () {
  return [react_router_dom__WEBPACK_IMPORTED_MODULE_2__.useNavigate];
});
_c = MemberCheck;
var _c;
__webpack_require__.$Refresh$.register(_c, "MemberCheck");

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
/******/ 	__webpack_require__.h = () => ("7d5c0a27ff9c3c0a68b0")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.716a1fa89cb2f4017ad6.hot-update.js.map