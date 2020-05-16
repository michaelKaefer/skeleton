(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["admin"],{

/***/ "./assets/js/admin.js":
/*!****************************!*\
  !*** ./assets/js/admin.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _scss_admin_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scss/admin.scss */ "./assets/scss/admin.scss");
/* harmony import */ var _scss_admin_scss__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_scss_admin_scss__WEBPACK_IMPORTED_MODULE_2__);



document.querySelectorAll('input[value="ROLE_ADMIN"]').forEach(function (input) {
  input.addEventListener('click', function (event) {
    // eslint-disable-next-line no-restricted-globals,no-alert
    if (input.checked && !confirm('Are you sure to make this user an admin?')) {
      event.preventDefault();
    }
  });
});
var tables = document.querySelectorAll('.table');
tables.forEach(function (table) {
  table.classList.add('table-striped');
});

/***/ }),

/***/ "./assets/scss/admin.scss":
/*!********************************!*\
  !*** ./assets/scss/admin.scss ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ })

},[["./assets/js/admin.js","runtime","vendors~admin~app~profile"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hc3NldHMvanMvYWRtaW4uanMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3Njc3MvYWRtaW4uc2NzcyJdLCJuYW1lcyI6WyJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiaW5wdXQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJjaGVja2VkIiwiY29uZmlybSIsInByZXZlbnREZWZhdWx0IiwidGFibGVzIiwidGFibGUiLCJjbGFzc0xpc3QiLCJhZGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUVBQSxRQUFRLENBQUNDLGdCQUFULENBQTBCLDJCQUExQixFQUF1REMsT0FBdkQsQ0FBK0QsVUFBQ0MsS0FBRCxFQUFXO0FBQ3hFQSxPQUFLLENBQUNDLGdCQUFOLENBQXVCLE9BQXZCLEVBQWdDLFVBQUNDLEtBQUQsRUFBVztBQUN6QztBQUNBLFFBQUlGLEtBQUssQ0FBQ0csT0FBTixJQUFpQixDQUFDQyxPQUFPLENBQUMsMENBQUQsQ0FBN0IsRUFBMkU7QUFDekVGLFdBQUssQ0FBQ0csY0FBTjtBQUNEO0FBQ0YsR0FMRDtBQU1ELENBUEQ7QUFTQSxJQUFNQyxNQUFNLEdBQUdULFFBQVEsQ0FBQ0MsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZjtBQUNBUSxNQUFNLENBQUNQLE9BQVAsQ0FBZSxVQUFDUSxLQUFELEVBQVc7QUFDeEJBLE9BQUssQ0FBQ0MsU0FBTixDQUFnQkMsR0FBaEIsQ0FBb0IsZUFBcEI7QUFDRCxDQUZELEU7Ozs7Ozs7Ozs7O0FDWkEsdUMiLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4uL3Njc3MvYWRtaW4uc2Nzcyc7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3ZhbHVlPVwiUk9MRV9BRE1JTlwiXScpLmZvckVhY2goKGlucHV0KSA9PiB7XG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtZ2xvYmFscyxuby1hbGVydFxuICAgIGlmIChpbnB1dC5jaGVja2VkICYmICFjb25maXJtKCdBcmUgeW91IHN1cmUgdG8gbWFrZSB0aGlzIHVzZXIgYW4gYWRtaW4/JykpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG5jb25zdCB0YWJsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudGFibGUnKTtcbnRhYmxlcy5mb3JFYWNoKCh0YWJsZSkgPT4ge1xuICB0YWJsZS5jbGFzc0xpc3QuYWRkKCd0YWJsZS1zdHJpcGVkJyk7XG59KTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpbiJdLCJzb3VyY2VSb290IjoiIn0=