(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["app~profile"],{

/***/ "./assets/js/modules/client.js":
/*!*************************************!*\
  !*** ./assets/js/modules/client.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.description */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_symbol_iterator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.symbol.iterator */ "./node_modules/core-js/modules/es.symbol.iterator.js");
/* harmony import */ var core_js_modules_es_symbol_iterator__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_iterator__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.filter */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.array.index-of */ "./node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_array_iterator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");
/* harmony import */ var core_js_modules_es_array_iterator__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_iterator__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_date_to_string__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.date.to-string */ "./node_modules/core-js/modules/es.date.to-string.js");
/* harmony import */ var core_js_modules_es_date_to_string__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_date_to_string__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_function_bind__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.function.bind */ "./node_modules/core-js/modules/es.function.bind.js");
/* harmony import */ var core_js_modules_es_function_bind__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_bind__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_function_name__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.function.name */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_map__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.map */ "./node_modules/core-js/modules/es.map.js");
/* harmony import */ var core_js_modules_es_map__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_map__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_object_create__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.object.create */ "./node_modules/core-js/modules/es.object.create.js");
/* harmony import */ var core_js_modules_es_object_create__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_create__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.object.define-properties */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es.object.define-property */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es.object.get-prototype-of */ "./node_modules/core-js/modules/es.object.get-prototype-of.js");
/* harmony import */ var core_js_modules_es_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es.object.keys */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es.object.set-prototype-of */ "./node_modules/core-js/modules/es.object.set-prototype-of.js");
/* harmony import */ var core_js_modules_es_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es.object.to-string */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es_reflect_construct__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es.reflect.construct */ "./node_modules/core-js/modules/es.reflect.construct.js");
/* harmony import */ var core_js_modules_es_reflect_construct__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_reflect_construct__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es.regexp.to-string */ "./node_modules/core-js/modules/es.regexp.to-string.js");
/* harmony import */ var core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es_string_iterator__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es.string.iterator */ "./node_modules/core-js/modules/es.string.iterator.js");
/* harmony import */ var core_js_modules_es_string_iterator__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_iterator__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/web.url */ "./node_modules/core-js/modules/web.url.js");
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! regenerator-runtime/runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_27__);





























function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
   Usage:

     try {
          const { payload } = await client.patch(url, values);
          updateUser(payload);
          flash.success(t('success__updated'));
        } catch (e) {
          actions.setSubmitting(false);
          flash.error(t('errors__unknown'));
        }

 */

/* eslint-disable max-classes-per-file */
var BadRequestError = /*#__PURE__*/function (_Error) {
  _inherits(BadRequestError, _Error);

  function BadRequestError(message) {
    var _this;

    _classCallCheck(this, BadRequestError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BadRequestError).call(this, message));
    _this.name = 'BadRequestError';
    return _this;
  }

  return BadRequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/* eslint-disable max-classes-per-file */


var UnauthorizedError = /*#__PURE__*/function (_Error2) {
  _inherits(UnauthorizedError, _Error2);

  function UnauthorizedError(message) {
    var _this2;

    _classCallCheck(this, UnauthorizedError);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(UnauthorizedError).call(this, message));
    _this2.name = 'UnauthorizedError';
    return _this2;
  }

  return UnauthorizedError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var Client = /*#__PURE__*/function () {
  function Client() {
    _classCallCheck(this, Client);

    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    };
  }

  _createClass(Client, [{
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var response, payload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return fetch(url, _objectSpread({}, this.defaultOptions, {
                  method: 'GET'
                }));

              case 3:
                response = _context.sent;
                _context.next = 6;
                return response.json();

              case 6:
                payload = _context.sent;
                _context.next = 13;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);

                /* eslint-disable no-console */
                console.error(_context.t0);
                throw _context.t0;

              case 13:
                this.throwHttpErrors(response, payload);
                return _context.abrupt("return", {
                  response: response,
                  payload: payload
                });

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      function get(_x) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "patch",
    value: function () {
      var _patch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, data) {
        var response, payload;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return fetch(url, _objectSpread({}, this.defaultOptions, {
                  method: 'PATCH',
                  body: JSON.stringify(data)
                }));

              case 3:
                response = _context2.sent;
                _context2.next = 6;
                return response.json();

              case 6:
                payload = _context2.sent;
                _context2.next = 13;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);

                /* eslint-disable no-console */
                console.error(_context2.t0);
                throw _context2.t0;

              case 13:
                this.throwHttpErrors(response, payload);
                return _context2.abrupt("return", {
                  response: response,
                  payload: payload
                });

              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      function patch(_x2, _x3) {
        return _patch.apply(this, arguments);
      }

      return patch;
    }()
  }, {
    key: "post",
    value: function () {
      var _post = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url, data) {
        var response, payload;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return fetch(url, _objectSpread({
                  method: 'POST'
                }, this.defaultOptions, {
                  body: JSON.stringify(data)
                }));

              case 3:
                response = _context3.sent;
                _context3.next = 6;
                return response.json();

              case 6:
                payload = _context3.sent;
                _context3.next = 13;
                break;

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3["catch"](0);

                /* eslint-disable no-console */
                console.error(_context3.t0);
                throw _context3.t0;

              case 13:
                this.throwHttpErrors(response, payload);
                return _context3.abrupt("return", {
                  response: response,
                  payload: payload
                });

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 9]]);
      }));

      function post(_x4, _x5) {
        return _post.apply(this, arguments);
      }

      return post;
    }()
  }, {
    key: "postForm",
    value: function () {
      var _postForm = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(url, formData) {
        var response, payload, data;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (formData instanceof FormData) {
                  _context4.next = 2;
                  break;
                }

                throw Error('Parameter two for Client.postForm() must be of type "FormData".');

              case 2:
                data = new URLSearchParams(formData);
                _context4.prev = 3;
                _context4.next = 6;
                return fetch(url, {
                  method: 'POST',
                  body: data
                });

              case 6:
                response = _context4.sent;
                _context4.next = 9;
                return response.json();

              case 9:
                payload = _context4.sent;
                _context4.next = 16;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](3);

                /* eslint-disable no-console */
                console.error(_context4.t0);
                throw _context4.t0;

              case 16:
                this.throwHttpErrors(response, payload);
                return _context4.abrupt("return", {
                  response: response,
                  payload: payload
                });

              case 18:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[3, 12]]);
      }));

      function postForm(_x6, _x7) {
        return _postForm.apply(this, arguments);
      }

      return postForm;
    }()
    /* eslint-disable class-methods-use-this */

  }, {
    key: "throwHttpErrors",
    value: function throwHttpErrors(response, payload) {
      // Should be a private method
      if (!response.ok) {
        /* eslint-disable no-console */
        console.error(response, payload);

        switch (response.status) {
          case 400:
            throw new BadRequestError('Status code is 400.');

          case 401:
            throw new UnauthorizedError('Status code is 401.');

          default:
            throw new Error('Status code does not match 2xx.');
        }
      }
    }
  }]);

  return Client;
}();

/* harmony default export */ __webpack_exports__["default"] = (new Client());

/***/ }),

/***/ "./assets/js/modules/flasher.js":
/*!**************************************!*\
  !*** ./assets/js/modules/flasher.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_reduce__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.reduce */ "./node_modules/core-js/modules/es.array.reduce.js");
/* harmony import */ var core_js_modules_es_array_reduce__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_reduce__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.define-property */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.object.to-string */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! regenerator-runtime/runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _scss_components_flash_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../scss/components/_flash.scss */ "./assets/scss/components/_flash.scss");
/* harmony import */ var _scss_components_flash_scss__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_scss_components_flash_scss__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _validator__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./validator */ "./assets/js/modules/validator.js");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./client */ "./assets/js/modules/client.js");








function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var Flasher = /*#__PURE__*/function () {
  function Flasher() {
    _classCallCheck(this, Flasher);

    this.swalMixin = sweetalert2__WEBPACK_IMPORTED_MODULE_8___default.a.mixin({
      customClass: {
        confirmButton: 'btn btn-primary mr-2',
        cancelButton: 'btn btn-light'
      },
      buttonsStyling: false
    });
  }

  _createClass(Flasher, [{
    key: "success",
    value: function success(html) {
      return this.swalMixin.fire({
        title: '<i class="fa fa-check-circle text-success"/>',
        html: html,
        showConfirmButton: false,
        timer: 1000
      });
    }
  }, {
    key: "error",
    value: function error(html) {
      return this.swalMixin.fire({
        title: '<i class="fa fa-times-circle text-danger"/>',
        html: html
      });
    }
  }, {
    key: "confirm",
    value: function confirm(html) {
      return this.swalMixin.fire({
        title: '<i class="fa fa-info-circle text-info"/>',
        html: html,
        // icon: 'warning',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: document.documentElement.lang === 'de' ? 'Weiter' : 'Continue',
        cancelButtonText: document.documentElement.lang === 'de' ? 'Abbruch' : 'Abort'
      });
    }
  }, {
    key: "formModal",
    value: function formModal(selector, html, callback) {
      return this.swalMixin.fire({
        // title: '<i class="fa fa-info-circle text-info"/>',
        html: "<div class=\"form-modal\">".concat(html, "</div>"),
        // icon: 'warning',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        allowOutsideClick: false,
        preConfirm: function preConfirm() {
          _validator__WEBPACK_IMPORTED_MODULE_9__["default"].validateForm(selector);
          var form = document.querySelector(selector);
          var inputs = form.querySelectorAll('input');

          if (form.querySelector(':invalid') !== null) {
            inputs.forEach(function (input) {
              input.focus();
              input.blur();
            });
            return false; // return Swal.showValidationMessage(
            //  `Request failed`
            // );
          }

          return new FormData(form);
        },
        confirmButtonText: document.documentElement.lang === 'de' ? 'Speichern' : 'Save',
        cancelButtonText: document.documentElement.lang === 'de' ? 'Abbruch' : 'Cancel'
      }).then( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
          var formData, response;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  formData = data.value;
                  _context.prev = 1;
                  _context.next = 4;
                  return _client__WEBPACK_IMPORTED_MODULE_10__["default"].postForm('/de/address/new', formData);

                case 4:
                  response = _context.sent;
                  _context.next = 11;
                  break;

                case 7:
                  _context.prev = 7;
                  _context.t0 = _context["catch"](1);

                  /* eslint-disable no-console */
                  console.error("Could not submit form \"".concat(selector, "\""));
                  return _context.abrupt("return");

                case 11:
                  callback(response);

                case 12:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[1, 7]]);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "batch",
    value: function batch(flashes) {
      var _this = this;

      var initialResolvedPromise = Promise.resolve();
      return flashes.reduce( /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(previous, flash) {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return previous;

                case 2:
                  _context2.t0 = flash.type;
                  _context2.next = _context2.t0 === 'success' ? 5 : _context2.t0 === 'error' ? 6 : 7;
                  break;

                case 5:
                  return _context2.abrupt("return", _this.success(flash.html));

                case 6:
                  return _context2.abrupt("return", _this.error(flash.html));

                case 7:
                  throw new Error("Unknown profile type \"".concat(flash.type, "\"."));

                case 8:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function (_x2, _x3) {
          return _ref2.apply(this, arguments);
        };
      }(), initialResolvedPromise);
    }
  }]);

  return Flasher;
}();

/* harmony default export */ __webpack_exports__["default"] = (new Flasher());

/***/ }),

/***/ "./assets/js/modules/validator.js":
/*!****************************************!*\
  !*** ./assets/js/modules/validator.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.concat */ "./node_modules/core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.object.define-property */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_3__);





function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Validator = /*#__PURE__*/function () {
  function Validator() {
    _classCallCheck(this, Validator);
  }

  _createClass(Validator, [{
    key: "validateField",

    /* eslint-disable class-methods-use-this */
    value: function validateField(element) {
      element.setCustomValidity('');
      element.checkValidity();
      element.parentElement.classList.add('was-validated');
    }
    /* eslint-disable class-methods-use-this */

  }, {
    key: "validateForm",
    value: function validateForm(formSelector) {
      var _this = this;

      var form = document.querySelector(formSelector);
      var inputs = form.querySelectorAll('input');
      inputs.forEach(function (input) {
        if (input.type === 'hidden') {
          return;
        }

        if (input.parentElement.querySelectorAll('input').length !== 1) {
          throw Error('Parent of an input is not allowed to contain other inputs.');
        }

        var errorMessageContainer = document.createElement('div');
        errorMessageContainer.classList.add('invalid-feedback');
        input.parentElement.appendChild(errorMessageContainer);
        input.addEventListener('blur', function () {
          _this.validateField(input);
        });
        input.addEventListener('input', function () {
          if (input.validity.valid && input.parentElement.classList.contains('was-validated')) {
            _this.validateField(input);
          } else if (!input.validity.valid && input.parentElement.classList.contains('was-validated')) {
            _this.validateField(input);
          }

          if (input.parentElement.querySelector(':invalid') === null) {
            /* eslint-disable no-param-reassign */
            input.parentElement.querySelector('.invalid-feedback').style.display = 'none'; // // For checkboxes we do not want the valid feedback styles
            // if (input.type === 'checkbox') {
            //   input.parentElement.classList.remove('was-validated');
            // }
          }
        });
        input.addEventListener('invalid', function () {
          var message;

          switch (true) {
            case input.validity.badInput:
              message = 'This field has a bad input.';

              if (input.dataset.badinput !== undefined) {
                message = input.dataset.badinput;
              }

              break;

            case input.validity.patternMismatch:
              message = "This field must match ".concat(input.pattern, ".");

              if (input.dataset.patternmismatch !== undefined) {
                message = input.dataset.patternmismatch;
              }

              break;

            case input.validity.rangeOverflow:
              message = "This field must be less than or equal to ".concat(input.max, ".");

              if (input.dataset.rangeoverflow !== undefined) {
                message = input.dataset.rangeoverflow;
              }

              break;

            case input.validity.rangeUnderflow:
              message = "This field must be greater than or equal to ".concat(input.min, ".");

              if (input.dataset.rangeunderflow !== undefined) {
                message = input.dataset.rangeunderflow;
              }

              break;

            case input.validity.stepMismatch:
              message = "This field must be ".concat(input.min, " plus an integral multiple of ").concat(input.step, ".");

              if (input.dataset.stepmismatch !== undefined) {
                message = input.dataset.stepmismatch;
              }

              break;

            case input.validity.tooLong:
              message = "This field cannot have more than ".concat(input.maxLength, " characters.");

              if (input.dataset.toolong !== undefined) {
                message = input.dataset.toolong;
              }

              break;

            case input.validity.tooShort:
              message = "At least ".concat(input.minLength, " characters are required.");

              if (input.dataset.tooshort !== undefined) {
                message = input.dataset.tooshort;
              }

              break;

            case input.validity.typeMismatch:
              switch (input.type) {
                case 'email':
                  message = 'Has to be an email.';
                  break;

                case 'number':
                  message = 'Has to be a number.';
                  break;

                case 'text':
                  message = 'Has to be a text.';
                  break;

                default:
                  message = "This field has to be of type ".concat(input.type, ".");
              }

              if (input.dataset.typemismatch !== undefined) {
                message = input.dataset.typemismatch;
              }

              break;

            case input.validity.valueMissing:
              message = 'This field cannot be empty.';

              if (input.dataset.valuemissing !== undefined) {
                message = input.dataset.valuemissing;
              }

              break;

            case input.validity.customError:
              message = 'This field has a custom error.';

              if (input.dataset.customerror !== undefined) {
                message = input.dataset.customerror;
              }

              break;

            default:
              message = 'Invalid value.';
          }

          input.setCustomValidity(message);
          input.parentElement.querySelector('.invalid-feedback').innerHTML = message;
          input.parentElement.querySelector('.invalid-feedback').style.display = 'block';
        });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (form.querySelector(':invalid') !== null) {
          inputs.forEach(function (input) {
            input.focus();
            input.blur();
          });
        } else {
          form.submit();
        }
      });
    }
  }]);

  return Validator;
}();

/* harmony default export */ __webpack_exports__["default"] = (new Validator());
/*
Example usage

<form noValidate>
    <div>
        <label htmlFor="name">Enter username (upper and lowercase letters): </label>
        <input
            type="text"
            name="name"
            className="form-control"
            id="name"
            required
            pattern="[A-Za-z]+"
            data-patternMismatch="Enter username (upper and lowercase letters)"
        >
        <div className="invalid-feedback"></div>
    </div>
    <div>
        <label htmlFor="number">number: </label>
        <input type="number" name="number" className="form-control" id="number" required>
        <div className="invalid-feedback"></div>
    </div>
    <button>Submit</button>
</form>

import validator from '../../modules/validator';
validator.validateForm('form[name="profile"]');
 */

/***/ }),

/***/ "./assets/scss/components/_flash.scss":
/*!********************************************!*\
  !*** ./assets/scss/components/_flash.scss ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hc3NldHMvanMvbW9kdWxlcy9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2pzL21vZHVsZXMvZmxhc2hlci5qcyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvanMvbW9kdWxlcy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3Njc3MvY29tcG9uZW50cy9fZmxhc2guc2NzcyJdLCJuYW1lcyI6WyJCYWRSZXF1ZXN0RXJyb3IiLCJtZXNzYWdlIiwibmFtZSIsIkVycm9yIiwiVW5hdXRob3JpemVkRXJyb3IiLCJDbGllbnQiLCJkZWZhdWx0T3B0aW9ucyIsImhlYWRlcnMiLCJjcmVkZW50aWFscyIsInVybCIsImZldGNoIiwibWV0aG9kIiwicmVzcG9uc2UiLCJqc29uIiwicGF5bG9hZCIsImNvbnNvbGUiLCJlcnJvciIsInRocm93SHR0cEVycm9ycyIsImRhdGEiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJVUkxTZWFyY2hQYXJhbXMiLCJvayIsInN0YXR1cyIsIkZsYXNoZXIiLCJzd2FsTWl4aW4iLCJTd2FsIiwibWl4aW4iLCJjdXN0b21DbGFzcyIsImNvbmZpcm1CdXR0b24iLCJjYW5jZWxCdXR0b24iLCJidXR0b25zU3R5bGluZyIsImh0bWwiLCJmaXJlIiwidGl0bGUiLCJzaG93Q29uZmlybUJ1dHRvbiIsInRpbWVyIiwic2hvd0NhbmNlbEJ1dHRvbiIsImNvbmZpcm1CdXR0b25UZXh0IiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJsYW5nIiwiY2FuY2VsQnV0dG9uVGV4dCIsInNlbGVjdG9yIiwiY2FsbGJhY2siLCJhbGxvd091dHNpZGVDbGljayIsInByZUNvbmZpcm0iLCJ2YWxpZGF0b3IiLCJ2YWxpZGF0ZUZvcm0iLCJmb3JtIiwicXVlcnlTZWxlY3RvciIsImlucHV0cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiaW5wdXQiLCJmb2N1cyIsImJsdXIiLCJ0aGVuIiwidmFsdWUiLCJjbGllbnQiLCJwb3N0Rm9ybSIsImZsYXNoZXMiLCJpbml0aWFsUmVzb2x2ZWRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWR1Y2UiLCJwcmV2aW91cyIsImZsYXNoIiwidHlwZSIsInN1Y2Nlc3MiLCJWYWxpZGF0b3IiLCJlbGVtZW50Iiwic2V0Q3VzdG9tVmFsaWRpdHkiLCJjaGVja1ZhbGlkaXR5IiwicGFyZW50RWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImZvcm1TZWxlY3RvciIsImxlbmd0aCIsImVycm9yTWVzc2FnZUNvbnRhaW5lciIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ2YWxpZGF0ZUZpZWxkIiwidmFsaWRpdHkiLCJ2YWxpZCIsImNvbnRhaW5zIiwic3R5bGUiLCJkaXNwbGF5IiwiYmFkSW5wdXQiLCJkYXRhc2V0IiwiYmFkaW5wdXQiLCJ1bmRlZmluZWQiLCJwYXR0ZXJuTWlzbWF0Y2giLCJwYXR0ZXJuIiwicGF0dGVybm1pc21hdGNoIiwicmFuZ2VPdmVyZmxvdyIsIm1heCIsInJhbmdlb3ZlcmZsb3ciLCJyYW5nZVVuZGVyZmxvdyIsIm1pbiIsInJhbmdldW5kZXJmbG93Iiwic3RlcE1pc21hdGNoIiwic3RlcCIsInN0ZXBtaXNtYXRjaCIsInRvb0xvbmciLCJtYXhMZW5ndGgiLCJ0b29sb25nIiwidG9vU2hvcnQiLCJtaW5MZW5ndGgiLCJ0b29zaG9ydCIsInR5cGVNaXNtYXRjaCIsInR5cGVtaXNtYXRjaCIsInZhbHVlTWlzc2luZyIsInZhbHVlbWlzc2luZyIsImN1c3RvbUVycm9yIiwiY3VzdG9tZXJyb3IiLCJpbm5lckhUTUwiLCJlIiwicHJldmVudERlZmF1bHQiLCJzdWJtaXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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TUFLTztBQUNMUCxjQUFJLENBQUN1RSxNQUFMO0FBQ0Q7QUFDRixPQVhEO0FBWUQ7Ozs7OztBQUdZLG1FQUFJbEQsU0FBSixFQUFmO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkpBLHVDIiwiZmlsZSI6ImFwcH5wcm9maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gICBVc2FnZTpcblxuICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gYXdhaXQgY2xpZW50LnBhdGNoKHVybCwgdmFsdWVzKTtcbiAgICAgICAgICB1cGRhdGVVc2VyKHBheWxvYWQpO1xuICAgICAgICAgIGZsYXNoLnN1Y2Nlc3ModCgnc3VjY2Vzc19fdXBkYXRlZCcpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGFjdGlvbnMuc2V0U3VibWl0dGluZyhmYWxzZSk7XG4gICAgICAgICAgZmxhc2guZXJyb3IodCgnZXJyb3JzX191bmtub3duJykpO1xuICAgICAgICB9XG5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbWF4LWNsYXNzZXMtcGVyLWZpbGUgKi9cbmNsYXNzIEJhZFJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdCYWRSZXF1ZXN0RXJyb3InO1xuICB9XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5jbGFzcyBVbmF1dGhvcml6ZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdVbmF1dGhvcml6ZWRFcnJvcic7XG4gIH1cbn1cblxuY2xhc3MgQ2xpZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBnZXQodXJsKSB7XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIGxldCBwYXlsb2FkO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIC4uLnRoaXMuZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB9KTtcbiAgICAgIHBheWxvYWQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdGhpcy50aHJvd0h0dHBFcnJvcnMocmVzcG9uc2UsIHBheWxvYWQpO1xuXG4gICAgcmV0dXJuIHsgcmVzcG9uc2UsIHBheWxvYWQgfTtcbiAgfVxuXG4gIGFzeW5jIHBhdGNoKHVybCwgZGF0YSkge1xuICAgIGxldCByZXNwb25zZTtcbiAgICBsZXQgcGF5bG9hZDtcblxuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAuLi50aGlzLmRlZmF1bHRPcHRpb25zLFxuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgfSk7XG4gICAgICBwYXlsb2FkID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRoaXMudGhyb3dIdHRwRXJyb3JzKHJlc3BvbnNlLCBwYXlsb2FkKTtcblxuICAgIHJldHVybiB7IHJlc3BvbnNlLCBwYXlsb2FkIH07XG4gIH1cblxuICBhc3luYyBwb3N0KHVybCwgZGF0YSkge1xuICAgIGxldCByZXNwb25zZTtcbiAgICBsZXQgcGF5bG9hZDtcblxuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgLi4udGhpcy5kZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICB9KTtcbiAgICAgIHBheWxvYWQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdGhpcy50aHJvd0h0dHBFcnJvcnMocmVzcG9uc2UsIHBheWxvYWQpO1xuXG4gICAgcmV0dXJuIHsgcmVzcG9uc2UsIHBheWxvYWQgfTtcbiAgfVxuXG4gIGFzeW5jIHBvc3RGb3JtKHVybCwgZm9ybURhdGEpIHtcbiAgICBpZiAoIShmb3JtRGF0YSBpbnN0YW5jZW9mIEZvcm1EYXRhKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1BhcmFtZXRlciB0d28gZm9yIENsaWVudC5wb3N0Rm9ybSgpIG11c3QgYmUgb2YgdHlwZSBcIkZvcm1EYXRhXCIuJyk7XG4gICAgfVxuXG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIGxldCBwYXlsb2FkO1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKTtcblxuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZGF0YSxcbiAgICAgIH0pO1xuICAgICAgcGF5bG9hZCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB0aGlzLnRocm93SHR0cEVycm9ycyhyZXNwb25zZSwgcGF5bG9hZCk7XG5cbiAgICByZXR1cm4geyByZXNwb25zZSwgcGF5bG9hZCB9O1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY2xhc3MtbWV0aG9kcy11c2UtdGhpcyAqL1xuICB0aHJvd0h0dHBFcnJvcnMocmVzcG9uc2UsIHBheWxvYWQpIHsgLy8gU2hvdWxkIGJlIGEgcHJpdmF0ZSBtZXRob2RcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlLCBwYXlsb2FkKTtcblxuICAgICAgc3dpdGNoIChyZXNwb25zZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSA0MDA6XG4gICAgICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFcnJvcignU3RhdHVzIGNvZGUgaXMgNDAwLicpO1xuICAgICAgICBjYXNlIDQwMTpcbiAgICAgICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXJyb3IoJ1N0YXR1cyBjb2RlIGlzIDQwMS4nKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0YXR1cyBjb2RlIGRvZXMgbm90IG1hdGNoIDJ4eC4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IENsaWVudCgpO1xuIiwiaW1wb3J0ICcuLi8uLi9zY3NzL2NvbXBvbmVudHMvX2ZsYXNoLnNjc3MnO1xuaW1wb3J0IFN3YWwgZnJvbSAnc3dlZXRhbGVydDInO1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICcuL3ZhbGlkYXRvcic7XG5pbXBvcnQgY2xpZW50IGZyb20gJy4vY2xpZW50JztcblxuY2xhc3MgRmxhc2hlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3dhbE1peGluID0gU3dhbC5taXhpbih7XG4gICAgICBjdXN0b21DbGFzczoge1xuICAgICAgICBjb25maXJtQnV0dG9uOiAnYnRuIGJ0bi1wcmltYXJ5IG1yLTInLFxuICAgICAgICBjYW5jZWxCdXR0b246ICdidG4gYnRuLWxpZ2h0JyxcbiAgICAgIH0sXG4gICAgICBidXR0b25zU3R5bGluZzogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBzdWNjZXNzKGh0bWwpIHtcbiAgICByZXR1cm4gdGhpcy5zd2FsTWl4aW4uZmlyZSh7XG4gICAgICB0aXRsZTogJzxpIGNsYXNzPVwiZmEgZmEtY2hlY2stY2lyY2xlIHRleHQtc3VjY2Vzc1wiLz4nLFxuICAgICAgaHRtbCxcbiAgICAgIHNob3dDb25maXJtQnV0dG9uOiBmYWxzZSxcbiAgICAgIHRpbWVyOiAxMDAwLFxuICAgIH0pO1xuICB9XG5cbiAgZXJyb3IoaHRtbCkge1xuICAgIHJldHVybiB0aGlzLnN3YWxNaXhpbi5maXJlKHtcbiAgICAgIHRpdGxlOiAnPGkgY2xhc3M9XCJmYSBmYS10aW1lcy1jaXJjbGUgdGV4dC1kYW5nZXJcIi8+JyxcbiAgICAgIGh0bWwsXG4gICAgfSk7XG4gIH1cblxuICBjb25maXJtKGh0bWwpIHtcbiAgICByZXR1cm4gdGhpcy5zd2FsTWl4aW4uZmlyZSh7XG4gICAgICB0aXRsZTogJzxpIGNsYXNzPVwiZmEgZmEtaW5mby1jaXJjbGUgdGV4dC1pbmZvXCIvPicsXG4gICAgICBodG1sLFxuICAgICAgLy8gaWNvbjogJ3dhcm5pbmcnLFxuICAgICAgc2hvd0NhbmNlbEJ1dHRvbjogdHJ1ZSxcbiAgICAgIC8vIGNvbmZpcm1CdXR0b25Db2xvcjogJyMzMDg1ZDYnLFxuICAgICAgLy8gY2FuY2VsQnV0dG9uQ29sb3I6ICcjZDMzJyxcbiAgICAgIGNvbmZpcm1CdXR0b25UZXh0OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZyA9PT0gJ2RlJyA/ICdXZWl0ZXInIDogJ0NvbnRpbnVlJyxcbiAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nID09PSAnZGUnID8gJ0FiYnJ1Y2gnIDogJ0Fib3J0JyxcbiAgICB9KTtcbiAgfVxuXG4gIGZvcm1Nb2RhbChzZWxlY3RvciwgaHRtbCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5zd2FsTWl4aW4uZmlyZSh7XG4gICAgICAvLyB0aXRsZTogJzxpIGNsYXNzPVwiZmEgZmEtaW5mby1jaXJjbGUgdGV4dC1pbmZvXCIvPicsXG4gICAgICBodG1sOiBgPGRpdiBjbGFzcz1cImZvcm0tbW9kYWxcIj4ke2h0bWx9PC9kaXY+YCxcbiAgICAgIC8vIGljb246ICd3YXJuaW5nJyxcbiAgICAgIHNob3dDYW5jZWxCdXR0b246IHRydWUsXG4gICAgICAvLyBjb25maXJtQnV0dG9uQ29sb3I6ICcjMzA4NWQ2JyxcbiAgICAgIC8vIGNhbmNlbEJ1dHRvbkNvbG9yOiAnI2QzMycsXG4gICAgICBhbGxvd091dHNpZGVDbGljazogZmFsc2UsXG4gICAgICBwcmVDb25maXJtOiAoKSA9PiB7XG4gICAgICAgIHZhbGlkYXRvci52YWxpZGF0ZUZvcm0oc2VsZWN0b3IpO1xuXG4gICAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgY29uc3QgaW5wdXRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpO1xuXG4gICAgICAgIGlmIChmb3JtLnF1ZXJ5U2VsZWN0b3IoJzppbnZhbGlkJykgIT09IG51bGwpIHtcbiAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICBpbnB1dC5ibHVyKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIC8vIHJldHVybiBTd2FsLnNob3dWYWxpZGF0aW9uTWVzc2FnZShcbiAgICAgICAgICAvLyAgYFJlcXVlc3QgZmFpbGVkYFxuICAgICAgICAgIC8vICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEZvcm1EYXRhKGZvcm0pO1xuICAgICAgfSxcbiAgICAgIGNvbmZpcm1CdXR0b25UZXh0OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZyA9PT0gJ2RlJyA/ICdTcGVpY2hlcm4nIDogJ1NhdmUnLFxuICAgICAgY2FuY2VsQnV0dG9uVGV4dDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPT09ICdkZScgPyAnQWJicnVjaCcgOiAnQ2FuY2VsJyxcbiAgICB9KS50aGVuKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgICBjb25zdCB7IHZhbHVlOiBmb3JtRGF0YSB9ID0gZGF0YTtcblxuICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQucG9zdEZvcm0oJy9kZS9hZGRyZXNzL25ldycsIGZvcm1EYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3Qgc3VibWl0IGZvcm0gXCIke3NlbGVjdG9yfVwiYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgYmF0Y2goZmxhc2hlcykge1xuICAgIGNvbnN0IGluaXRpYWxSZXNvbHZlZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIHJldHVybiBmbGFzaGVzLnJlZHVjZShhc3luYyAocHJldmlvdXMsIGZsYXNoKSA9PiB7XG4gICAgICBhd2FpdCBwcmV2aW91cztcblxuICAgICAgc3dpdGNoIChmbGFzaC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICAgIHJldHVybiB0aGlzLnN1Y2Nlc3MoZmxhc2guaHRtbCk7XG4gICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihmbGFzaC5odG1sKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvZmlsZSB0eXBlIFwiJHtmbGFzaC50eXBlfVwiLmApO1xuICAgICAgfVxuICAgIH0sIGluaXRpYWxSZXNvbHZlZFByb21pc2UpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBGbGFzaGVyKCk7XG4iLCJjbGFzcyBWYWxpZGF0b3Ige1xuICAvKiBlc2xpbnQtZGlzYWJsZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzICovXG4gIHZhbGlkYXRlRmllbGQoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuc2V0Q3VzdG9tVmFsaWRpdHkoJycpO1xuICAgIGVsZW1lbnQuY2hlY2tWYWxpZGl0eSgpO1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCd3YXMtdmFsaWRhdGVkJyk7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzICovXG4gIHZhbGlkYXRlRm9ybShmb3JtU2VsZWN0b3IpIHtcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihmb3JtU2VsZWN0b3IpO1xuICAgIGNvbnN0IGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKTtcblxuICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgaWYgKGlucHV0LnR5cGUgPT09ICdoaWRkZW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlucHV0LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKS5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1BhcmVudCBvZiBhbiBpbnB1dCBpcyBub3QgYWxsb3dlZCB0byBjb250YWluIG90aGVyIGlucHV0cy4nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBlcnJvck1lc3NhZ2VDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaW52YWxpZC1mZWVkYmFjaycpO1xuICAgICAgaW5wdXQucGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChlcnJvck1lc3NhZ2VDb250YWluZXIpO1xuXG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnZhbGlkYXRlRmllbGQoaW5wdXQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBpZiAoaW5wdXQudmFsaWRpdHkudmFsaWQgJiYgaW5wdXQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3dhcy12YWxpZGF0ZWQnKSkge1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVGaWVsZChpbnB1dCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlucHV0LnZhbGlkaXR5LnZhbGlkICYmIGlucHV0LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd3YXMtdmFsaWRhdGVkJykpIHtcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlRmllbGQoaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlucHV0LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignOmludmFsaWQnKSA9PT0gbnVsbCkge1xuICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXBhcmFtLXJlYXNzaWduICovXG4gICAgICAgICAgaW5wdXQucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuaW52YWxpZC1mZWVkYmFjaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgICAgICAvLyAvLyBGb3IgY2hlY2tib3hlcyB3ZSBkbyBub3Qgd2FudCB0aGUgdmFsaWQgZmVlZGJhY2sgc3R5bGVzXG4gICAgICAgICAgLy8gaWYgKGlucHV0LnR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgICAgICAvLyAgIGlucHV0LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnd2FzLXZhbGlkYXRlZCcpO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2ludmFsaWQnLCAoKSA9PiB7XG4gICAgICAgIGxldCBtZXNzYWdlO1xuXG4gICAgICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICAgIGNhc2UgaW5wdXQudmFsaWRpdHkuYmFkSW5wdXQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1RoaXMgZmllbGQgaGFzIGEgYmFkIGlucHV0Lic7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5iYWRpbnB1dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBpbnB1dC5kYXRhc2V0LmJhZGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBpbnB1dC52YWxpZGl0eS5wYXR0ZXJuTWlzbWF0Y2g6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFRoaXMgZmllbGQgbXVzdCBtYXRjaCAke2lucHV0LnBhdHRlcm59LmA7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5wYXR0ZXJubWlzbWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gaW5wdXQuZGF0YXNldC5wYXR0ZXJubWlzbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlucHV0LnZhbGlkaXR5LnJhbmdlT3ZlcmZsb3c6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFRoaXMgZmllbGQgbXVzdCBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gJHtpbnB1dC5tYXh9LmA7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5yYW5nZW92ZXJmbG93ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IGlucHV0LmRhdGFzZXQucmFuZ2VvdmVyZmxvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaW5wdXQudmFsaWRpdHkucmFuZ2VVbmRlcmZsb3c6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFRoaXMgZmllbGQgbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gJHtpbnB1dC5taW59LmA7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5yYW5nZXVuZGVyZmxvdyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBpbnB1dC5kYXRhc2V0LnJhbmdldW5kZXJmbG93O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBpbnB1dC52YWxpZGl0eS5zdGVwTWlzbWF0Y2g6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFRoaXMgZmllbGQgbXVzdCBiZSAke2lucHV0Lm1pbn0gcGx1cyBhbiBpbnRlZ3JhbCBtdWx0aXBsZSBvZiAke2lucHV0LnN0ZXB9LmA7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5zdGVwbWlzbWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gaW5wdXQuZGF0YXNldC5zdGVwbWlzbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlucHV0LnZhbGlkaXR5LnRvb0xvbmc6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFRoaXMgZmllbGQgY2Fubm90IGhhdmUgbW9yZSB0aGFuICR7aW5wdXQubWF4TGVuZ3RofSBjaGFyYWN0ZXJzLmA7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC50b29sb25nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IGlucHV0LmRhdGFzZXQudG9vbG9uZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaW5wdXQudmFsaWRpdHkudG9vU2hvcnQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEF0IGxlYXN0ICR7aW5wdXQubWluTGVuZ3RofSBjaGFyYWN0ZXJzIGFyZSByZXF1aXJlZC5gO1xuICAgICAgICAgICAgaWYgKGlucHV0LmRhdGFzZXQudG9vc2hvcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gaW5wdXQuZGF0YXNldC50b29zaG9ydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaW5wdXQudmFsaWRpdHkudHlwZU1pc21hdGNoOlxuICAgICAgICAgICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJ0hhcyB0byBiZSBhbiBlbWFpbC4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnSGFzIHRvIGJlIGEgbnVtYmVyLic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnSGFzIHRvIGJlIGEgdGV4dC4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgVGhpcyBmaWVsZCBoYXMgdG8gYmUgb2YgdHlwZSAke2lucHV0LnR5cGV9LmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC50eXBlbWlzbWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gaW5wdXQuZGF0YXNldC50eXBlbWlzbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlucHV0LnZhbGlkaXR5LnZhbHVlTWlzc2luZzpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnVGhpcyBmaWVsZCBjYW5ub3QgYmUgZW1wdHkuJztcbiAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhc2V0LnZhbHVlbWlzc2luZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBpbnB1dC5kYXRhc2V0LnZhbHVlbWlzc2luZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaW5wdXQudmFsaWRpdHkuY3VzdG9tRXJyb3I6XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1RoaXMgZmllbGQgaGFzIGEgY3VzdG9tIGVycm9yLic7XG4gICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC5jdXN0b21lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBpbnB1dC5kYXRhc2V0LmN1c3RvbWVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnSW52YWxpZCB2YWx1ZS4nO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXQuc2V0Q3VzdG9tVmFsaWRpdHkobWVzc2FnZSk7XG4gICAgICAgIGlucHV0LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmludmFsaWQtZmVlZGJhY2snKS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuICAgICAgICBpbnB1dC5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnZhbGlkLWZlZWRiYWNrJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKGZvcm0ucXVlcnlTZWxlY3RvcignOmludmFsaWQnKSAhPT0gbnVsbCkge1xuICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgICAgIGlucHV0LmJsdXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JtLnN1Ym1pdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBWYWxpZGF0b3IoKTtcblxuLypcbkV4YW1wbGUgdXNhZ2VcblxuPGZvcm0gbm9WYWxpZGF0ZT5cbiAgICA8ZGl2PlxuICAgICAgICA8bGFiZWwgaHRtbEZvcj1cIm5hbWVcIj5FbnRlciB1c2VybmFtZSAodXBwZXIgYW5kIGxvd2VyY2FzZSBsZXR0ZXJzKTogPC9sYWJlbD5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBuYW1lPVwibmFtZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIlxuICAgICAgICAgICAgaWQ9XCJuYW1lXCJcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICBwYXR0ZXJuPVwiW0EtWmEtel0rXCJcbiAgICAgICAgICAgIGRhdGEtcGF0dGVybk1pc21hdGNoPVwiRW50ZXIgdXNlcm5hbWUgKHVwcGVyIGFuZCBsb3dlcmNhc2UgbGV0dGVycylcIlxuICAgICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW52YWxpZC1mZWVkYmFja1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxsYWJlbCBodG1sRm9yPVwibnVtYmVyXCI+bnVtYmVyOiA8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJudW1iZXJcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBpZD1cIm51bWJlclwiIHJlcXVpcmVkPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImludmFsaWQtZmVlZGJhY2tcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8YnV0dG9uPlN1Ym1pdDwvYnV0dG9uPlxuPC9mb3JtPlxuXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJy4uLy4uL21vZHVsZXMvdmFsaWRhdG9yJztcbnZhbGlkYXRvci52YWxpZGF0ZUZvcm0oJ2Zvcm1bbmFtZT1cInByb2ZpbGVcIl0nKTtcbiAqL1xuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luIl0sInNvdXJjZVJvb3QiOiIifQ==