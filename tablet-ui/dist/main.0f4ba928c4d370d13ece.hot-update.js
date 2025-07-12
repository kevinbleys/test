"use strict";
self["webpackHotUpdatetablet_ui"]("main",{

/***/ "./src/components/NonMemberForm.jsx":
/*!******************************************!*\
  !*** ./src/components/NonMemberForm.jsx ***!
  \******************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ NonMemberForm)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/index.js");
/* harmony import */ var _NonMemberForm_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NonMemberForm.css */ "./src/components/NonMemberForm.css");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
/* provided dependency */ var __react_refresh_error_overlay__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");

var _s = __webpack_require__.$Refresh$.signature();




function NonMemberForm() {
  _s();
  const [nom, setNom] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [prenom, setPrenom] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [dateNaissance, setDateNaissance] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [age, setAge] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [tarif, setTarif] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useNavigate)();

  // Calcul de l'âge et du tarif en fonction de la date de naissance
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (dateNaissance) {
      const today = new Date();
      const birthDate = new Date(dateNaissance);
      const ageCalc = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Ajustement si l'anniversaire n'est pas encore passé cette année
      const adjustedAge = monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate() ? ageCalc - 1 : ageCalc;
      setAge(adjustedAge);
      if (adjustedAge < 6) {
        setTarif(0); // Gratuit pour moins de 6 ans
      } else if (adjustedAge < 18) {
        setTarif(8); // 8€ pour 6-18 ans
      } else {
        setTarif(10); // 10€ pour adultes
      }
    } else {
      setAge(null);
      setTarif(null);
    }
  }, [dateNaissance]);
  const handleSubmit = e => {
    e.preventDefault();

    // Validation des champs requis
    if (!nom || !prenom || !dateNaissance) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    // Redirection vers la page de sélection de paiement avec les données
    navigate('/payment-selection', {
      state: {
        nom,
        prenom,
        dateNaissance,
        age,
        tarif
      }
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: "non-member-form",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h2", {
      children: "Formulaire pour Non-Adh\xE9rents"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("form", {
      onSubmit: handleSubmit,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("label", {
          htmlFor: "nom",
          children: "Nom*"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          id: "nom",
          type: "text",
          value: nom,
          onChange: e => setNom(e.target.value),
          required: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("label", {
          htmlFor: "prenom",
          children: "Pr\xE9nom*"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          id: "prenom",
          type: "text",
          value: prenom,
          onChange: e => setPrenom(e.target.value),
          required: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "form-group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("label", {
          htmlFor: "dateNaissance",
          children: "Date de naissance*"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          id: "dateNaissance",
          type: "date",
          value: dateNaissance,
          onChange: e => setDateNaissance(e.target.value),
          required: true
        })]
      }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "error-message",
        children: error
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "buttons-container",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          type: "button",
          className: "back-button",
          onClick: () => navigate('/'),
          children: "Retour \xE0 l'accueil"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          type: "submit",
          className: "submit-button",
          children: "Continuer"
        })]
      })]
    })]
  });
}
_s(NonMemberForm, "LTAHxsahD52W/5RTpLLvhHOxSo4=", false, function () {
  return [react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useNavigate];
});
_c = NonMemberForm;
var _c;
__webpack_require__.$Refresh$.register(_c, "NonMemberForm");

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
/******/ 	__webpack_require__.h = () => ("b5aa28a77e02be261f50")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.0f4ba928c4d370d13ece.hot-update.js.map