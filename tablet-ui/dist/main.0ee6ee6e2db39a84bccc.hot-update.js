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
  text-decoration: underline;
  cursor: pointer;
}

.admin-link:hover {
  color: #343a40;
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
`, "",{"version":3,"sources":["webpack://./src/components/Home.css"],"names":[],"mappings":"AAAA,kCAAkC;AAClC;EACE,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,uBAAuB;EACvB,iBAAiB;EACjB,aAAa;EACb,yBAAyB;AAC3B;;AAEA;EACE,mBAAmB;EACnB,cAAc;EACd,kBAAkB;EAClB,iBAAiB;AACnB;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,WAAW;EACX,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,eAAe;EACf,iBAAiB;EACjB,YAAY;EACZ,mBAAmB;EACnB,eAAe;EACf,iBAAiB;EACjB,2CAA2C;AAC7C;;AAEA;EACE,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA;EACE,yBAAyB;EACzB,YAAY;AACd;;AAEA;EACE,yBAAyB;EACzB,YAAY;AACd;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,cAAc;EACd,0BAA0B;EAC1B,eAAe;AACjB;;AAEA;EACE,cAAc;AAChB;;AAEA,2BAA2B;AAC3B;EACE;IACE,eAAe;EACjB;;EAEA;IACE,eAAe;IACf,eAAe;EACjB;AACF;;AAEA;EACE;IACE,aAAa;EACf;;EAEA;IACE,iBAAiB;IACjB,mBAAmB;EACrB;;EAEA;IACE,gBAAgB;EAClB;AACF","sourcesContent":["/* Styles pour la page d'accueil */\r\n.home-container {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 100vh;\r\n  padding: 2rem;\r\n  background-color: #f8f9fa;\r\n}\r\n\r\n.home-container h1 {\r\n  margin-bottom: 3rem;\r\n  color: #343a40;\r\n  text-align: center;\r\n  font-size: 2.5rem;\r\n}\r\n\r\n.buttons-container {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.5rem;\r\n  width: 100%;\r\n  max-width: 400px;\r\n}\r\n\r\n.main-button {\r\n  padding: 1.5rem;\r\n  font-size: 1.2rem;\r\n  border: none;\r\n  border-radius: 10px;\r\n  cursor: pointer;\r\n  font-weight: bold;\r\n  transition: transform 0.2s, box-shadow 0.2s;\r\n}\r\n\r\n.main-button:hover {\r\n  transform: translateY(-5px);\r\n  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);\r\n}\r\n\r\n.member-button {\r\n  background-color: #4CAF50;\r\n  color: white;\r\n}\r\n\r\n.non-member-button {\r\n  background-color: #2196F3;\r\n  color: white;\r\n}\r\n\r\n.admin-link-container {\r\n  margin-top: 3rem;\r\n}\r\n\r\n.admin-link {\r\n  color: #6c757d;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n}\r\n\r\n.admin-link:hover {\r\n  color: #343a40;\r\n}\r\n\r\n/* Responsive adjustments */\r\n@media (max-width: 768px) {\r\n  .home-container h1 {\r\n    font-size: 2rem;\r\n  }\r\n  \r\n  .main-button {\r\n    padding: 1.2rem;\r\n    font-size: 1rem;\r\n  }\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .home-container {\r\n    padding: 1rem;\r\n  }\r\n  \r\n  .home-container h1 {\r\n    font-size: 1.8rem;\r\n    margin-bottom: 2rem;\r\n  }\r\n  \r\n  .buttons-container {\r\n    max-width: 300px;\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("6956bb8f2ca13eee6a8a")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.0ee6ee6e2db39a84bccc.hot-update.js.map