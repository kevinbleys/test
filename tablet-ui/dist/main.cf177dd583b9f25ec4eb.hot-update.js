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
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* harmony import */ var _utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/soundUtils */ "./src/utils/soundUtils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
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
  const [benevoleCalled, setBenevoleCalled] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useNavigate)();

  // Pré-charger les sons au chargement du composant
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.preloadSounds)();
  }, []);
  const handleVerification = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setBenevoleCalled(false);
    try {
      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios__WEBPACK_IMPORTED_MODULE_4__["default"].get('http://localhost:4000/members/check', {
        params: {
          nom,
          prenom
        }
      });
      if (checkResponse.data.success) {
        // Membre valide et payé
        setMessage(checkResponse.data.message);

        // Jouer le son de succès (optionnel)
        (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.playSuccessSound)();

        // Étape 2: Enregistrement de la présence SANS tarif pour les adhérents valides
        const presenceResponse = await axios__WEBPACK_IMPORTED_MODULE_4__["default"].post('http://localhost:4000/presences', {
          type: 'adherent',
          nom,
          prenom
          // BELANGRIJK: Geen tarif parameter voor adherents!
        });
        if (presenceResponse.data.success) {
          // Redirection après succès
          setTimeout(() => {
            navigate('/confirmation');
          }, 2000);
        } else {
          setError("Erreur lors de l'enregistrement de la présence");
          (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.playBuzzerSound)();
        }
      } else {
        // Membre non valide ou non payé - JOUER LE BUZZER
        const errorMessage = checkResponse.data.error || "Adhésion non valide";
        setError(errorMessage);

        // Jouer le son buzzer pour les erreurs
        (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.playBuzzerSound)();
      }
    } catch (error) {
      console.error('Erreur:', error);
      let errorMessage = "Erreur de connexion";
      if (error.response?.status === 404) {
        errorMessage = "Aucun membre trouvé avec ce nom et prénom";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);

      // Jouer le son buzzer pour toutes les erreurs
      (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.playBuzzerSound)();
    } finally {
      setLoading(false);
    }
  };
  const handleAppelerBenevole = () => {
    // Jouer le son de cloche
    (0,_utils_soundUtils__WEBPACK_IMPORTED_MODULE_1__.playBellSound)();

    // Marquer que le bénévole a été appelé
    setBenevoleCalled(true);

    // Afficher un message de confirmation
    setMessage("Un bénévole va arriver pour vous aider !");

    // Effacer le message après 5 secondes
    setTimeout(() => {
      if (benevoleCalled) {
        setMessage('');
        setBenevoleCalled(false);
      }
    }, 5000);
  };
  const handleRetourAccueil = () => {
    // Effacer les champs et messages avant de revenir à l'accueil
    setNom('');
    setPrenom('');
    setError('');
    setMessage('');
    setLoading(false);
    setBenevoleCalled(false);

    // Naviguer vers la page d'accueil
    navigate('/');
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: "member-check",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      className: "header-section",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h2", {
        children: "V\xE9rification d'adh\xE9sion"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "header-buttons",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          type: "button",
          className: "btn-appeler-benevole",
          onClick: handleAppelerBenevole,
          disabled: loading,
          children: "\uD83D\uDD14 Appeler un b\xE9n\xE9vole"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          type: "button",
          className: "btn-retour-accueil",
          onClick: handleRetourAccueil,
          disabled: loading,
          children: "\u2190 Retour \xE0 l'accueil"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("form", {
      onSubmit: handleVerification,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("label", {
          children: "Nom"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          type: "text",
          value: nom,
          onChange: e => setNom(e.target.value),
          required: true,
          disabled: loading
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("label", {
          children: "Pr\xE9nom"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          type: "text",
          value: prenom,
          onChange: e => setPrenom(e.target.value),
          required: true,
          disabled: loading
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
        type: "submit",
        disabled: loading,
        className: "btn-verify",
        children: loading ? 'Vérification...' : 'Vérifier'
      })]
    }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      className: "error-message",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "error-icon",
        children: "\u26A0\uFE0F"
      }), error]
    }), message && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      className: benevoleCalled ? "benevole-message" : "success-message",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "success-icon",
        children: benevoleCalled ? "🔔" : "✅"
      }), message]
    })]
  });
}
_s(MemberCheck, "9HY2u+c5dZvXcM//b17Eu9VXtPs=", false, function () {
  return [react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useNavigate];
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
/******/ 	__webpack_require__.h = () => ("ea34d649ba3393566ca2")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.cf177dd583b9f25ec4eb.hot-update.js.map