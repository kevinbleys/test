"use strict";
self["webpackHotUpdatetablet_ui"]("main",{

/***/ "./node_modules/css-loader/dist/cjs.js!./src/components/Home.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/components/Home.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Styles pour la page d'accueil */
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.home-container h1 {
  margin-bottom: 3rem;
  color: #343a40;
  text-align: center;
  font-size: 2.5rem;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.main-button {
  padding: 1.5rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
}

.main-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.member-button {
  background-color: #4CAF50;
  color: white;
}

.non-member-button {
  background-color: #2196F3;
  color: white;
}

.admin-link-container {
  margin-top: 3rem;
}

.admin-link {
  color: #6c757d;
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}

.admin-link:hover {
  color: #343a40;
}

/* Modal d'authentification admin */
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.admin-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.admin-modal h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #343a40;
  text-align: center;
}

.admin-modal p {
  margin-bottom: 1.5rem;
  color: #6c757d;
  text-align: center;
}

.admin-modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.password-error {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 14px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.modal-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.modal-buttons button:first-child {
  background-color: #f1f1f1;
  color: #333;
}

.modal-buttons button:last-child {
  background-color: #2196F3;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .home-container h1 {
    font-size: 2rem;
  }
  
  .main-button {
    padding: 1.2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 1rem;
  }
  
  .home-container h1 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
  
  .buttons-container {
    max-width: 300px;
  }
}
`, "",{"version":3,"sources":["webpack://./src/components/Home.css"],"names":[],"mappings":"AAAA,kCAAkC;AAClC;EACE,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,uBAAuB;EACvB,iBAAiB;EACjB,aAAa;EACb,yBAAyB;AAC3B;;AAEA;EACE,mBAAmB;EACnB,cAAc;EACd,kBAAkB;EAClB,iBAAiB;AACnB;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,WAAW;EACX,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,eAAe;EACf,iBAAiB;EACjB,YAAY;EACZ,mBAAmB;EACnB,eAAe;EACf,iBAAiB;EACjB,2CAA2C;AAC7C;;AAEA;EACE,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA;EACE,yBAAyB;EACzB,YAAY;AACd;;AAEA;EACE,yBAAyB;EACzB,YAAY;AACd;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,cAAc;EACd,gBAAgB;EAChB,YAAY;EACZ,0BAA0B;EAC1B,eAAe;EACf,eAAe;AACjB;;AAEA;EACE,cAAc;AAChB;;AAEA,mCAAmC;AACnC;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,WAAW;EACX,YAAY;EACZ,oCAAoC;EACpC,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,aAAa;AACf;;AAEA;EACE,uBAAuB;EACvB,aAAa;EACb,mBAAmB;EACnB,UAAU;EACV,gBAAgB;EAChB,yCAAyC;AAC3C;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,cAAc;EACd,kBAAkB;AACpB;;AAEA;EACE,qBAAqB;EACrB,cAAc;EACd,kBAAkB;AACpB;;AAEA;EACE,WAAW;EACX,aAAa;EACb,qBAAqB;EACrB,sBAAsB;EACtB,kBAAkB;EAClB,eAAe;AACjB;;AAEA;EACE,cAAc;EACd,mBAAmB;EACnB,eAAe;EACf,kBAAkB;AACpB;;AAEA;EACE,aAAa;EACb,8BAA8B;EAC9B,SAAS;AACX;;AAEA;EACE,OAAO;EACP,aAAa;EACb,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,iBAAiB;AACnB;;AAEA;EACE,yBAAyB;EACzB,WAAW;AACb;;AAEA;EACE,yBAAyB;EACzB,YAAY;AACd;;AAEA,2BAA2B;AAC3B;EACE;IACE,eAAe;EACjB;;EAEA;IACE,eAAe;IACf,eAAe;EACjB;AACF;;AAEA;EACE;IACE,aAAa;EACf;;EAEA;IACE,iBAAiB;IACjB,mBAAmB;EACrB;;EAEA;IACE,gBAAgB;EAClB;AACF","sourcesContent":["/* Styles pour la page d'accueil */\r\n.home-container {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 100vh;\r\n  padding: 2rem;\r\n  background-color: #f8f9fa;\r\n}\r\n\r\n.home-container h1 {\r\n  margin-bottom: 3rem;\r\n  color: #343a40;\r\n  text-align: center;\r\n  font-size: 2.5rem;\r\n}\r\n\r\n.buttons-container {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.5rem;\r\n  width: 100%;\r\n  max-width: 400px;\r\n}\r\n\r\n.main-button {\r\n  padding: 1.5rem;\r\n  font-size: 1.2rem;\r\n  border: none;\r\n  border-radius: 10px;\r\n  cursor: pointer;\r\n  font-weight: bold;\r\n  transition: transform 0.2s, box-shadow 0.2s;\r\n}\r\n\r\n.main-button:hover {\r\n  transform: translateY(-5px);\r\n  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);\r\n}\r\n\r\n.member-button {\r\n  background-color: #4CAF50;\r\n  color: white;\r\n}\r\n\r\n.non-member-button {\r\n  background-color: #2196F3;\r\n  color: white;\r\n}\r\n\r\n.admin-link-container {\r\n  margin-top: 3rem;\r\n}\r\n\r\n.admin-link {\r\n  color: #6c757d;\r\n  background: none;\r\n  border: none;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n  font-size: 14px;\r\n}\r\n\r\n.admin-link:hover {\r\n  color: #343a40;\r\n}\r\n\r\n/* Modal d'authentification admin */\r\n.admin-modal-overlay {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  background-color: rgba(0, 0, 0, 0.5);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  z-index: 1000;\r\n}\r\n\r\n.admin-modal {\r\n  background-color: white;\r\n  padding: 2rem;\r\n  border-radius: 10px;\r\n  width: 90%;\r\n  max-width: 400px;\r\n  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.admin-modal h2 {\r\n  margin-top: 0;\r\n  margin-bottom: 1rem;\r\n  color: #343a40;\r\n  text-align: center;\r\n}\r\n\r\n.admin-modal p {\r\n  margin-bottom: 1.5rem;\r\n  color: #6c757d;\r\n  text-align: center;\r\n}\r\n\r\n.admin-modal input {\r\n  width: 100%;\r\n  padding: 10px;\r\n  margin-bottom: 1.5rem;\r\n  border: 1px solid #ddd;\r\n  border-radius: 5px;\r\n  font-size: 16px;\r\n}\r\n\r\n.password-error {\r\n  color: #d32f2f;\r\n  margin-bottom: 1rem;\r\n  font-size: 14px;\r\n  text-align: center;\r\n}\r\n\r\n.modal-buttons {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n}\r\n\r\n.modal-buttons button {\r\n  flex: 1;\r\n  padding: 10px;\r\n  border: none;\r\n  border-radius: 5px;\r\n  cursor: pointer;\r\n  font-weight: bold;\r\n}\r\n\r\n.modal-buttons button:first-child {\r\n  background-color: #f1f1f1;\r\n  color: #333;\r\n}\r\n\r\n.modal-buttons button:last-child {\r\n  background-color: #2196F3;\r\n  color: white;\r\n}\r\n\r\n/* Responsive adjustments */\r\n@media (max-width: 768px) {\r\n  .home-container h1 {\r\n    font-size: 2rem;\r\n  }\r\n  \r\n  .main-button {\r\n    padding: 1.2rem;\r\n    font-size: 1rem;\r\n  }\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .home-container {\r\n    padding: 1rem;\r\n  }\r\n  \r\n  .home-container h1 {\r\n    font-size: 1.8rem;\r\n    margin-bottom: 2rem;\r\n  }\r\n  \r\n  .buttons-container {\r\n    max-width: 300px;\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("39366e6d4dad2652e2c3")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.b5aa28a77e02be261f50.hot-update.js.map