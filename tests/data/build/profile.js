(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["profile"],{

/***/ "./assets/js/_dropzone.js":
/*!********************************!*\
  !*** ./assets/js/_dropzone.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.description */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.filter */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.object.define-properties */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.object.define-property */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.keys */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _scss_components_dropzone_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../scss/components/_dropzone.scss */ "./assets/scss/components/_dropzone.scss");
/* harmony import */ var _scss_components_dropzone_scss__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_scss_components_dropzone_scss__WEBPACK_IMPORTED_MODULE_10__);











function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// import 'dropzone/dist/dropzone.css';
// import 'dropzone/dist/basic.css';

var fileUploadIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-upload" class="svg-inline--fa fa-file-upload fa-w-12 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"></path></svg>'; // Overrides the original previewTemplate:

var previewTemplate = "<div class=\"alert alert-light dz-preview dz-file-preview\">\n  <button type=\"button\" class=\"close mr-1\" data-dismiss=\"alert\" aria-label=\"Close\">\n      <span aria-hidden=\"true\"><i class=\"fa fa-trash-alt fa-xs\"></i></span>\n  </button>\n  <div class=\"thumbnail\">\n    <div class=\"dz-image\"><img data-dz-thumbnail class=\"rounded\" alt=\"Preview\"/></div>\n  </div>\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\">\n        <span data-dz-name></span>\n        <span data-dz-size></span>\n    </div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress/></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage/></div>\n</div>";

var DropzoneConfiguration = /*#__PURE__*/function () {
  function DropzoneConfiguration() {
    _classCallCheck(this, DropzoneConfiguration);

    this.description = null;
  }

  _createClass(DropzoneConfiguration, [{
    key: "setDescription",
    value: function setDescription(description) {
      this.description = description;
    }
  }, {
    key: "get",
    value: function get() {
      var config = {
        maxFilesize: 2,
        // MiB
        previewTemplate: previewTemplate
      }; // Set the description message if there is one

      if (this.description !== null) {
        config = _objectSpread({}, config, {
          dictDefaultMessage: "".concat(fileUploadIcon, " ").concat(this.description)
        });
      }

      return config;
    }
  }]);

  return DropzoneConfiguration;
}();

/* harmony default export */ __webpack_exports__["default"] = (new DropzoneConfiguration());

/***/ }),

/***/ "./assets/js/pages/account/profile.js":
/*!********************************************!*\
  !*** ./assets/js/pages/account/profile.js ***!
  \********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol */ "./node_modules/core-js/modules/es.symbol.js");
/* harmony import */ var core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.symbol.description */ "./node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.array.filter */ "./node_modules/core-js/modules/es.array.filter.js");
/* harmony import */ var core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_filter__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.array.for-each */ "./node_modules/core-js/modules/es.array.for-each.js");
/* harmony import */ var core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_for_each__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.object.define-properties */ "./node_modules/core-js/modules/es.object.define-properties.js");
/* harmony import */ var core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_properties__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es.object.define-property */ "./node_modules/core-js/modules/es.object.define-property.js");
/* harmony import */ var core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_define_property__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptor */ "./node_modules/core-js/modules/es.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es.object.get-own-property-descriptors */ "./node_modules/core-js/modules/es.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es.object.keys */ "./node_modules/core-js/modules/es.object.keys.js");
/* harmony import */ var core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_keys__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es.object.to-string */ "./node_modules/core-js/modules/es.object.to-string.js");
/* harmony import */ var core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");
/* harmony import */ var core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_promise__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es.regexp.exec */ "./node_modules/core-js/modules/es.regexp.exec.js");
/* harmony import */ var core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es.string.replace */ "./node_modules/core-js/modules/es.string.replace.js");
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/web.dom-collections.for-each */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/* harmony import */ var core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! regenerator-runtime/runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var _scss_pages_account_profile_scss__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../scss/pages/account/profile.scss */ "./assets/scss/pages/account/profile.scss");
/* harmony import */ var _scss_pages_account_profile_scss__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_scss_pages_account_profile_scss__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var dropzone__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! dropzone */ "./node_modules/dropzone/dist/dropzone.js");
/* harmony import */ var dropzone__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(dropzone__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var _modules_flasher__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../modules/flasher */ "./assets/js/modules/flasher.js");
/* harmony import */ var _modules_validator__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../modules/validator */ "./assets/js/modules/validator.js");
/* harmony import */ var _dropzone__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../_dropzone */ "./assets/js/_dropzone.js");
/* harmony import */ var _modules_client__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../modules/client */ "./assets/js/modules/client.js");
















function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }







var addAddressButton = document.querySelector('.js-add-address');
addAddressButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var addressFormHtml, response;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _modules_client__WEBPACK_IMPORTED_MODULE_20__["default"].get('/de/address/new');

        case 3:
          response = _context.sent;
          addressFormHtml = response.payload.content;
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);

          /* eslint-disable no-console */
          console.error('Could not load address form', _context.t0);
          return _context.abrupt("return");

        case 11:
          _context.next = 13;
          return _modules_flasher__WEBPACK_IMPORTED_MODULE_17__["default"].formModal('form[name="address"]', addressFormHtml, function (response) {
            var addressCard = response.payload.address_card.content;
            var template = document.querySelector('.js-address-template');
            var div = template.cloneNode(true);
            var innerHTML = div.innerHTML;
            innerHTML = innerHTML.replace('__address_card__', addressCard);
            div.innerHTML = innerHTML;
            div.classList.remove('d-none');
            div.classList.remove('js-address-template');
            template.parentElement.appendChild(div);
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[0, 7]]);
}))); //
//
// function addTagForm($collectionHolder, $newLinkLi) {
//   // Get the data-prototype explained earlier
//   var prototype = $collectionHolder.data('prototype');
//
//   // get the new index
//   var index = $collectionHolder.data('index');
//
//   var newForm = prototype;
//   // You need this only if you didn't set 'label' => false in your tags field in TaskType
//   // Replace '__name__label__' in the prototype's HTML to
//   // instead be a number based on how many items we have
//   // newForm = newForm.replace(/__name__label__/g, index);
//
//   // Replace '__name__' in the prototype's HTML to
//   // instead be a number based on how many items we have
//   newForm = newForm.replace(/__name__/g, index);
//
//   // increase the index with one for the next item
//   $collectionHolder.data('index', index + 1);
//
//   // Display the form in the page in an li, before the "Add a tag" link li
//   var $newFormLi = $('<div class="col-md-6"></div>').append(newForm);
//   $newLinkLi.before($newFormLi);
// }
//
//
//
// var $collectionHolder;
//
// // setup an "add a tag" link
// var $addTagButton = $('.add_tag_link');
// var $newLinkLi = $('<div class="col-md-6"></div>');
//
// $(document).ready(function() {
//   // Get the ul that holds the collection of tags
//   $collectionHolder = $('.js-addresses');
//
//   // add the "add a tag" anchor and li to the tags ul
//   $collectionHolder.append($newLinkLi);
//
//   // count the current form inputs we have (e.g. 2), use that as the new
//   // index when inserting a new item (e.g. 2)
//   $collectionHolder.data('index', $collectionHolder.find('input').length);
//
//   $addTagButton.on('click', function(e) {
//     // add a new tag form (see next code block)
//     addTagForm($collectionHolder, $newLinkLi);
//   });
// });
//

/**
 * Form validation
 */

_modules_validator__WEBPACK_IMPORTED_MODULE_18__["default"].validateForm('form[name="profile"]');
/**
 * Dropzone for avatar
 */

dropzone__WEBPACK_IMPORTED_MODULE_16___default.a.autoDiscover = false;
var el = document.querySelector('.avatar');
_dropzone__WEBPACK_IMPORTED_MODULE_19__["default"].setDescription(el.dataset.description);
/* eslint-disable no-new */

new dropzone__WEBPACK_IMPORTED_MODULE_16___default.a(el, _objectSpread({}, _dropzone__WEBPACK_IMPORTED_MODULE_19__["default"].get(), {
  init: function init() {
    var _this = this;

    this.on('error', function (file, data) {
      if (data.detail) {
        _this.emit('error', file, data.detail);
      }

      _modules_flasher__WEBPACK_IMPORTED_MODULE_17__["default"].error(el.dataset.error);
    });
    this.on('success', /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file, data) {
        var url;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                url = data.url;
                document.getElementById('js-avatar').style.dislay = 'block';
                document.getElementById('js-avatar').src = url;
                _modules_flasher__WEBPACK_IMPORTED_MODULE_17__["default"].success(el.dataset.success);

                _this.removeFile(file);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }());
  }
}));
/**
 * Switch between profile types "Person" and "Organization"
 */

document.querySelector('.js-profile-type-switch .js-left-label').addEventListener('click', function () {
  document.querySelector('.js-profile-type-switch .custom-control-input').click();
});
var switcher = document.querySelector('.js-profile-type-switch');
switcher.addEventListener('click', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(event) {
    var form, inputs, input, message, _ref4, value, type, typeInput, firstNameInput, lastNameInput, nameInput;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(event.target.nodeName !== 'INPUT')) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return");

          case 2:
            form = document.querySelector('form[name="profile"]');
            inputs = form.querySelectorAll('input');

            if (!(form.querySelector(':invalid') !== null)) {
              _context3.next = 11;
              break;
            }

            event.preventDefault();
            event.stopPropagation();
            inputs.forEach(function (input) {
              input.focus();
              input.blur();
            });
            switcher.querySelector('.invalid-feedback').style.display = 'block';
            _context3.next = 30;
            break;

          case 11:
            input = switcher.querySelector('input');
            message = input.parentElement.parentElement.parentElement.dataset.message;

            if (!message) {
              /* eslint-disable no-console */
              console.error('No message found in element: ', document.getElementById('is-organization').parentElement.parentElement.parentElement);
            }

            _context3.next = 16;
            return _modules_flasher__WEBPACK_IMPORTED_MODULE_17__["default"].confirm(message);

          case 16:
            _ref4 = _context3.sent;
            value = _ref4.value;

            if (!(value !== true)) {
              _context3.next = 20;
              break;
            }

            return _context3.abrupt("return");

          case 20:
            type = input.checked ? 'ORGANIZATION' : 'PERSON';
            typeInput = document.querySelector('input[name="profile[type]"]');
            typeInput.value = type;
            firstNameInput = document.querySelector('input[name="profile[person][firstName]"]');

            if (firstNameInput !== null) {
              firstNameInput.value = '-';
            }

            lastNameInput = document.querySelector('input[name="profile[person][lastName]"]');

            if (lastNameInput !== null) {
              lastNameInput.value = '-';
            }

            nameInput = document.querySelector('input[name="profile[organization][name]"]');

            if (nameInput !== null) {
              nameInput.value = '-';
            }

            form.submit();

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}());

/***/ }),

/***/ "./assets/scss/components/_dropzone.scss":
/*!***********************************************!*\
  !*** ./assets/scss/components/_dropzone.scss ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./assets/scss/pages/account/profile.scss":
/*!************************************************!*\
  !*** ./assets/scss/pages/account/profile.scss ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ })

},[["./assets/js/pages/account/profile.js","runtime","vendors~admin~app~profile","vendors~app~profile","vendors~profile","app~profile"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hc3NldHMvanMvX2Ryb3B6b25lLmpzIiwid2VicGFjazovLy8uL2Fzc2V0cy9qcy9wYWdlcy9hY2NvdW50L3Byb2ZpbGUuanMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3Njc3MvY29tcG9uZW50cy9fZHJvcHpvbmUuc2NzcyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc2Nzcy9wYWdlcy9hY2NvdW50L3Byb2ZpbGUuc2NzcyJdLCJuYW1lcyI6WyJmaWxlVXBsb2FkSWNvbiIsInByZXZpZXdUZW1wbGF0ZSIsIkRyb3B6b25lQ29uZmlndXJhdGlvbiIsImRlc2NyaXB0aW9uIiwiY29uZmlnIiwibWF4RmlsZXNpemUiLCJkaWN0RGVmYXVsdE1lc3NhZ2UiLCJhZGRBZGRyZXNzQnV0dG9uIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImNsaWVudCIsImdldCIsInJlc3BvbnNlIiwiYWRkcmVzc0Zvcm1IdG1sIiwicGF5bG9hZCIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJmbGFzaGVyIiwiZm9ybU1vZGFsIiwiYWRkcmVzc0NhcmQiLCJhZGRyZXNzX2NhcmQiLCJ0ZW1wbGF0ZSIsImRpdiIsImNsb25lTm9kZSIsImlubmVySFRNTCIsInJlcGxhY2UiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJwYXJlbnRFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJ2YWxpZGF0b3IiLCJ2YWxpZGF0ZUZvcm0iLCJEcm9wem9uZSIsImF1dG9EaXNjb3ZlciIsImVsIiwiZHJvcHpvbmVDb25maWd1cmF0aW9uIiwic2V0RGVzY3JpcHRpb24iLCJkYXRhc2V0IiwiaW5pdCIsIm9uIiwiZmlsZSIsImRhdGEiLCJkZXRhaWwiLCJlbWl0IiwidXJsIiwiZ2V0RWxlbWVudEJ5SWQiLCJzdHlsZSIsImRpc2xheSIsInNyYyIsInN1Y2Nlc3MiLCJyZW1vdmVGaWxlIiwiY2xpY2siLCJzd2l0Y2hlciIsImV2ZW50IiwidGFyZ2V0Iiwibm9kZU5hbWUiLCJmb3JtIiwiaW5wdXRzIiwicXVlcnlTZWxlY3RvckFsbCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZm9yRWFjaCIsImlucHV0IiwiZm9jdXMiLCJibHVyIiwiZGlzcGxheSIsIm1lc3NhZ2UiLCJjb25maXJtIiwidmFsdWUiLCJ0eXBlIiwiY2hlY2tlZCIsInR5cGVJbnB1dCIsImZpcnN0TmFtZUlucHV0IiwibGFzdE5hbWVJbnB1dCIsIm5hbWVJbnB1dCIsInN1Ym1pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxjQUFjLEdBQUcsd25CQUF2QixDLENBRUE7O0FBQ0EsSUFBTUMsZUFBZSxtc0JBQXJCOztJQW1CTUMscUI7QUFDSixtQ0FBYztBQUFBOztBQUNaLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDRDs7OzttQ0FFY0EsVyxFQUFhO0FBQzFCLFdBQUtBLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0Q7OzswQkFFSztBQUNKLFVBQUlDLE1BQU0sR0FBRztBQUNYQyxtQkFBVyxFQUFFLENBREY7QUFDSztBQUNoQkosdUJBQWUsRUFBZkE7QUFGVyxPQUFiLENBREksQ0FNSjs7QUFDQSxVQUFJLEtBQUtFLFdBQUwsS0FBcUIsSUFBekIsRUFBK0I7QUFDN0JDLGNBQU0scUJBQ0RBLE1BREM7QUFFSkUsNEJBQWtCLFlBQUtOLGNBQUwsY0FBdUIsS0FBS0csV0FBNUI7QUFGZCxVQUFOO0FBSUQ7O0FBRUQsYUFBT0MsTUFBUDtBQUNEOzs7Ozs7QUFHWSxtRUFBSUYscUJBQUosRUFBZixFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNSyxnQkFBZ0IsR0FBR0MsUUFBUSxD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LGFBQVQsQ0FBdUIsMENBQXZCLENBckNROztBQXNDL0IsZ0JBQUlpRSxjQUFjLEtBQUssSUFBdkIsRUFBNkI7QUFDM0JBLDRCQUFjLENBQUNKLEtBQWYsR0FBdUIsR0FBdkI7QUFDRDs7QUFDS0sseUJBekN5QixHQXlDVG5FLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1Qix5Q0FBdkIsQ0F6Q1M7O0FBMEMvQixnQkFBSWtFLGFBQWEsS0FBSyxJQUF0QixFQUE0QjtBQUMxQkEsMkJBQWEsQ0FBQ0wsS0FBZCxHQUFzQixHQUF0QjtBQUNEOztBQUNLTSxxQkE3Q3lCLEdBNkNicEUsUUFBUSxDQUFDQyxhQUFULENBQXVCLDJDQUF2QixDQTdDYTs7QUE4Qy9CLGdCQUFJbUUsU0FBUyxLQUFLLElBQWxCLEVBQXdCO0FBQ3RCQSx1QkFBUyxDQUFDTixLQUFWLEdBQWtCLEdBQWxCO0FBQ0Q7O0FBRURaLGdCQUFJLENBQUNtQixNQUFMOztBQWxEK0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBbkM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsSzs7Ozs7Ozs7Ozs7QUM5SEEsdUM7Ozs7Ozs7Ozs7O0FDQUEsdUMiLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCAnZHJvcHpvbmUvZGlzdC9kcm9wem9uZS5jc3MnO1xuLy8gaW1wb3J0ICdkcm9wem9uZS9kaXN0L2Jhc2ljLmNzcyc7XG5pbXBvcnQgJy4uL3Njc3MvY29tcG9uZW50cy9fZHJvcHpvbmUuc2Nzcyc7XG5cbmNvbnN0IGZpbGVVcGxvYWRJY29uID0gJzxzdmcgYXJpYS1oaWRkZW49XCJ0cnVlXCIgZm9jdXNhYmxlPVwiZmFsc2VcIiBkYXRhLXByZWZpeD1cImZhc1wiIGRhdGEtaWNvbj1cImZpbGUtdXBsb2FkXCIgY2xhc3M9XCJzdmctaW5saW5lLS1mYSBmYS1maWxlLXVwbG9hZCBmYS13LTEyIFwiIHJvbGU9XCJpbWdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAzODQgNTEyXCI+PHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMjI0IDEzNlYwSDI0QzEwLjcgMCAwIDEwLjcgMCAyNHY0NjRjMCAxMy4zIDEwLjcgMjQgMjQgMjRoMzM2YzEzLjMgMCAyNC0xMC43IDI0LTI0VjE2MEgyNDhjLTEzLjIgMC0yNC0xMC44LTI0LTI0em02NS4xOCAyMTYuMDFIMjI0djgwYzAgOC44NC03LjE2IDE2LTE2IDE2aC0zMmMtOC44NCAwLTE2LTcuMTYtMTYtMTZ2LTgwSDk0LjgyYy0xNC4yOCAwLTIxLjQxLTE3LjI5LTExLjI3LTI3LjM2bDk2LjQyLTk1LjdjNi42NS02LjYxIDE3LjM5LTYuNjEgMjQuMDQgMGw5Ni40MiA5NS43YzEwLjE1IDEwLjA3IDMuMDMgMjcuMzYtMTEuMjUgMjcuMzZ6TTM3NyAxMDVMMjc5LjEgN2MtNC41LTQuNS0xMC42LTctMTctN0gyNTZ2MTI4aDEyOHYtNi4xYzAtNi4zLTIuNS0xMi40LTctMTYuOXpcIj48L3BhdGg+PC9zdmc+JztcblxuLy8gT3ZlcnJpZGVzIHRoZSBvcmlnaW5hbCBwcmV2aWV3VGVtcGxhdGU6XG5jb25zdCBwcmV2aWV3VGVtcGxhdGUgPSBgXFxcbjxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1saWdodCBkei1wcmV2aWV3IGR6LWZpbGUtcHJldmlld1wiPlxuICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlIG1yLTFcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPlxuICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+PGkgY2xhc3M9XCJmYSBmYS10cmFzaC1hbHQgZmEteHNcIj48L2k+PC9zcGFuPlxuICA8L2J1dHRvbj5cbiAgPGRpdiBjbGFzcz1cInRodW1ibmFpbFwiPlxuICAgIDxkaXYgY2xhc3M9XCJkei1pbWFnZVwiPjxpbWcgZGF0YS1kei10aHVtYm5haWwgY2xhc3M9XCJyb3VuZGVkXCIgYWx0PVwiUHJldmlld1wiLz48L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJkei1kZXRhaWxzXCI+XG4gICAgPGRpdiBjbGFzcz1cImR6LWZpbGVuYW1lXCI+XG4gICAgICAgIDxzcGFuIGRhdGEtZHotbmFtZT48L3NwYW4+XG4gICAgICAgIDxzcGFuIGRhdGEtZHotc2l6ZT48L3NwYW4+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZHotcHJvZ3Jlc3NcIj48c3BhbiBjbGFzcz1cImR6LXVwbG9hZFwiIGRhdGEtZHotdXBsb2FkcHJvZ3Jlc3MvPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZHotZXJyb3ItbWVzc2FnZVwiPjxzcGFuIGRhdGEtZHotZXJyb3JtZXNzYWdlLz48L2Rpdj5cbjwvZGl2PlxcXG5gO1xuXG5jbGFzcyBEcm9wem9uZUNvbmZpZ3VyYXRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIGxldCBjb25maWcgPSB7XG4gICAgICBtYXhGaWxlc2l6ZTogMiwgLy8gTWlCXG4gICAgICBwcmV2aWV3VGVtcGxhdGUsXG4gICAgfTtcblxuICAgIC8vIFNldCB0aGUgZGVzY3JpcHRpb24gbWVzc2FnZSBpZiB0aGVyZSBpcyBvbmVcbiAgICBpZiAodGhpcy5kZXNjcmlwdGlvbiAhPT0gbnVsbCkge1xuICAgICAgY29uZmlnID0ge1xuICAgICAgICAuLi5jb25maWcsXG4gICAgICAgIGRpY3REZWZhdWx0TWVzc2FnZTogYCR7ZmlsZVVwbG9hZEljb259ICR7dGhpcy5kZXNjcmlwdGlvbn1gLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBEcm9wem9uZUNvbmZpZ3VyYXRpb24oKTtcbiIsImltcG9ydCAnLi4vLi4vLi4vc2Nzcy9wYWdlcy9hY2NvdW50L3Byb2ZpbGUuc2Nzcyc7XG5pbXBvcnQgRHJvcHpvbmUgZnJvbSAnZHJvcHpvbmUnO1xuaW1wb3J0IGZsYXNoZXIgZnJvbSAnLi4vLi4vbW9kdWxlcy9mbGFzaGVyJztcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAnLi4vLi4vbW9kdWxlcy92YWxpZGF0b3InO1xuaW1wb3J0IGRyb3B6b25lQ29uZmlndXJhdGlvbiBmcm9tICcuLi8uLi9fZHJvcHpvbmUnO1xuaW1wb3J0IGNsaWVudCBmcm9tICcuLi8uLi9tb2R1bGVzL2NsaWVudCc7XG5cbmNvbnN0IGFkZEFkZHJlc3NCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtYWRkLWFkZHJlc3MnKTtcbmFkZEFkZHJlc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gIGxldCBhZGRyZXNzRm9ybUh0bWw7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuZ2V0KCcvZGUvYWRkcmVzcy9uZXcnKTtcbiAgICBhZGRyZXNzRm9ybUh0bWwgPSByZXNwb25zZS5wYXlsb2FkLmNvbnRlbnQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGxvYWQgYWRkcmVzcyBmb3JtJywgZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXdhaXQgZmxhc2hlci5mb3JtTW9kYWwoJ2Zvcm1bbmFtZT1cImFkZHJlc3NcIl0nLCBhZGRyZXNzRm9ybUh0bWwsIChyZXNwb25zZSkgPT4ge1xuICAgIGNvbnN0IHsgY29udGVudDogYWRkcmVzc0NhcmQgfSA9IHJlc3BvbnNlLnBheWxvYWQuYWRkcmVzc19jYXJkO1xuXG4gICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtYWRkcmVzcy10ZW1wbGF0ZScpO1xuICAgIGNvbnN0IGRpdiA9IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcblxuICAgIGxldCB7IGlubmVySFRNTCB9ID0gZGl2O1xuXG4gICAgaW5uZXJIVE1MID0gaW5uZXJIVE1MLnJlcGxhY2UoJ19fYWRkcmVzc19jYXJkX18nLCBhZGRyZXNzQ2FyZCk7XG4gICAgZGl2LmlubmVySFRNTCA9IGlubmVySFRNTDtcblxuICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZSgnanMtYWRkcmVzcy10ZW1wbGF0ZScpO1xuXG4gICAgdGVtcGxhdGUucGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChkaXYpO1xuICB9KTtcbn0pO1xuLy9cbi8vXG4vLyBmdW5jdGlvbiBhZGRUYWdGb3JtKCRjb2xsZWN0aW9uSG9sZGVyLCAkbmV3TGlua0xpKSB7XG4vLyAgIC8vIEdldCB0aGUgZGF0YS1wcm90b3R5cGUgZXhwbGFpbmVkIGVhcmxpZXJcbi8vICAgdmFyIHByb3RvdHlwZSA9ICRjb2xsZWN0aW9uSG9sZGVyLmRhdGEoJ3Byb3RvdHlwZScpO1xuLy9cbi8vICAgLy8gZ2V0IHRoZSBuZXcgaW5kZXhcbi8vICAgdmFyIGluZGV4ID0gJGNvbGxlY3Rpb25Ib2xkZXIuZGF0YSgnaW5kZXgnKTtcbi8vXG4vLyAgIHZhciBuZXdGb3JtID0gcHJvdG90eXBlO1xuLy8gICAvLyBZb3UgbmVlZCB0aGlzIG9ubHkgaWYgeW91IGRpZG4ndCBzZXQgJ2xhYmVsJyA9PiBmYWxzZSBpbiB5b3VyIHRhZ3MgZmllbGQgaW4gVGFza1R5cGVcbi8vICAgLy8gUmVwbGFjZSAnX19uYW1lX19sYWJlbF9fJyBpbiB0aGUgcHJvdG90eXBlJ3MgSFRNTCB0b1xuLy8gICAvLyBpbnN0ZWFkIGJlIGEgbnVtYmVyIGJhc2VkIG9uIGhvdyBtYW55IGl0ZW1zIHdlIGhhdmVcbi8vICAgLy8gbmV3Rm9ybSA9IG5ld0Zvcm0ucmVwbGFjZSgvX19uYW1lX19sYWJlbF9fL2csIGluZGV4KTtcbi8vXG4vLyAgIC8vIFJlcGxhY2UgJ19fbmFtZV9fJyBpbiB0aGUgcHJvdG90eXBlJ3MgSFRNTCB0b1xuLy8gICAvLyBpbnN0ZWFkIGJlIGEgbnVtYmVyIGJhc2VkIG9uIGhvdyBtYW55IGl0ZW1zIHdlIGhhdmVcbi8vICAgbmV3Rm9ybSA9IG5ld0Zvcm0ucmVwbGFjZSgvX19uYW1lX18vZywgaW5kZXgpO1xuLy9cbi8vICAgLy8gaW5jcmVhc2UgdGhlIGluZGV4IHdpdGggb25lIGZvciB0aGUgbmV4dCBpdGVtXG4vLyAgICRjb2xsZWN0aW9uSG9sZGVyLmRhdGEoJ2luZGV4JywgaW5kZXggKyAxKTtcbi8vXG4vLyAgIC8vIERpc3BsYXkgdGhlIGZvcm0gaW4gdGhlIHBhZ2UgaW4gYW4gbGksIGJlZm9yZSB0aGUgXCJBZGQgYSB0YWdcIiBsaW5rIGxpXG4vLyAgIHZhciAkbmV3Rm9ybUxpID0gJCgnPGRpdiBjbGFzcz1cImNvbC1tZC02XCI+PC9kaXY+JykuYXBwZW5kKG5ld0Zvcm0pO1xuLy8gICAkbmV3TGlua0xpLmJlZm9yZSgkbmV3Rm9ybUxpKTtcbi8vIH1cbi8vXG4vL1xuLy9cbi8vIHZhciAkY29sbGVjdGlvbkhvbGRlcjtcbi8vXG4vLyAvLyBzZXR1cCBhbiBcImFkZCBhIHRhZ1wiIGxpbmtcbi8vIHZhciAkYWRkVGFnQnV0dG9uID0gJCgnLmFkZF90YWdfbGluaycpO1xuLy8gdmFyICRuZXdMaW5rTGkgPSAkKCc8ZGl2IGNsYXNzPVwiY29sLW1kLTZcIj48L2Rpdj4nKTtcbi8vXG4vLyAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbi8vICAgLy8gR2V0IHRoZSB1bCB0aGF0IGhvbGRzIHRoZSBjb2xsZWN0aW9uIG9mIHRhZ3Ncbi8vICAgJGNvbGxlY3Rpb25Ib2xkZXIgPSAkKCcuanMtYWRkcmVzc2VzJyk7XG4vL1xuLy8gICAvLyBhZGQgdGhlIFwiYWRkIGEgdGFnXCIgYW5jaG9yIGFuZCBsaSB0byB0aGUgdGFncyB1bFxuLy8gICAkY29sbGVjdGlvbkhvbGRlci5hcHBlbmQoJG5ld0xpbmtMaSk7XG4vL1xuLy8gICAvLyBjb3VudCB0aGUgY3VycmVudCBmb3JtIGlucHV0cyB3ZSBoYXZlIChlLmcuIDIpLCB1c2UgdGhhdCBhcyB0aGUgbmV3XG4vLyAgIC8vIGluZGV4IHdoZW4gaW5zZXJ0aW5nIGEgbmV3IGl0ZW0gKGUuZy4gMilcbi8vICAgJGNvbGxlY3Rpb25Ib2xkZXIuZGF0YSgnaW5kZXgnLCAkY29sbGVjdGlvbkhvbGRlci5maW5kKCdpbnB1dCcpLmxlbmd0aCk7XG4vL1xuLy8gICAkYWRkVGFnQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbi8vICAgICAvLyBhZGQgYSBuZXcgdGFnIGZvcm0gKHNlZSBuZXh0IGNvZGUgYmxvY2spXG4vLyAgICAgYWRkVGFnRm9ybSgkY29sbGVjdGlvbkhvbGRlciwgJG5ld0xpbmtMaSk7XG4vLyAgIH0pO1xuLy8gfSk7XG4vL1xuLyoqXG4gKiBGb3JtIHZhbGlkYXRpb25cbiAqL1xudmFsaWRhdG9yLnZhbGlkYXRlRm9ybSgnZm9ybVtuYW1lPVwicHJvZmlsZVwiXScpO1xuXG4vKipcbiAqIERyb3B6b25lIGZvciBhdmF0YXJcbiAqL1xuRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gZmFsc2U7XG5jb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdmF0YXInKTtcbmRyb3B6b25lQ29uZmlndXJhdGlvbi5zZXREZXNjcmlwdGlvbihlbC5kYXRhc2V0LmRlc2NyaXB0aW9uKTtcbi8qIGVzbGludC1kaXNhYmxlIG5vLW5ldyAqL1xubmV3IERyb3B6b25lKGVsLCB7XG4gIC4uLmRyb3B6b25lQ29uZmlndXJhdGlvbi5nZXQoKSxcbiAgaW5pdCgpIHtcbiAgICB0aGlzLm9uKCdlcnJvcicsIChmaWxlLCBkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5kZXRhaWwpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGZpbGUsIGRhdGEuZGV0YWlsKTtcbiAgICAgIH1cbiAgICAgIGZsYXNoZXIuZXJyb3IoZWwuZGF0YXNldC5lcnJvcik7XG4gICAgfSk7XG4gICAgdGhpcy5vbignc3VjY2VzcycsIGFzeW5jIChmaWxlLCBkYXRhKSA9PiB7XG4gICAgICBjb25zdCB7IHVybCB9ID0gZGF0YTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcy1hdmF0YXInKS5zdHlsZS5kaXNsYXkgPSAnYmxvY2snO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pzLWF2YXRhcicpLnNyYyA9IHVybDtcbiAgICAgIGZsYXNoZXIuc3VjY2VzcyhlbC5kYXRhc2V0LnN1Y2Nlc3MpO1xuICAgICAgdGhpcy5yZW1vdmVGaWxlKGZpbGUpO1xuICAgIH0pO1xuICB9LFxufSk7XG5cbi8qKlxuICogU3dpdGNoIGJldHdlZW4gcHJvZmlsZSB0eXBlcyBcIlBlcnNvblwiIGFuZCBcIk9yZ2FuaXphdGlvblwiXG4gKi9cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9maWxlLXR5cGUtc3dpdGNoIC5qcy1sZWZ0LWxhYmVsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9maWxlLXR5cGUtc3dpdGNoIC5jdXN0b20tY29udHJvbC1pbnB1dCcpLmNsaWNrKCk7XG59KTtcbmNvbnN0IHN3aXRjaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXByb2ZpbGUtdHlwZS1zd2l0Y2gnKTtcbnN3aXRjaGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gIGlmIChldmVudC50YXJnZXQubm9kZU5hbWUgIT09ICdJTlBVVCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybVtuYW1lPVwicHJvZmlsZVwiXScpO1xuICBjb25zdCBpbnB1dHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Jyk7XG5cbiAgaWYgKGZvcm0ucXVlcnlTZWxlY3RvcignOmludmFsaWQnKSAhPT0gbnVsbCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICBpbnB1dC5ibHVyKCk7XG4gICAgfSk7XG5cbiAgICBzd2l0Y2hlci5xdWVyeVNlbGVjdG9yKCcuaW52YWxpZC1mZWVkYmFjaycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGlucHV0ID0gc3dpdGNoZXIucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICBjb25zdCB7IG1lc3NhZ2UgfSA9IGlucHV0LnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmRhdGFzZXQ7XG5cbiAgICBpZiAoIW1lc3NhZ2UpIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIG1lc3NhZ2UgZm91bmQgaW4gZWxlbWVudDogJywgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lzLW9yZ2FuaXphdGlvbicpLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHZhbHVlIH0gPSBhd2FpdCBmbGFzaGVyLmNvbmZpcm0obWVzc2FnZSk7XG4gICAgaWYgKHZhbHVlICE9PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9IGlucHV0LmNoZWNrZWQgPyAnT1JHQU5JWkFUSU9OJyA6ICdQRVJTT04nO1xuXG4gICAgY29uc3QgdHlwZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInByb2ZpbGVbdHlwZV1cIl0nKTtcbiAgICB0eXBlSW5wdXQudmFsdWUgPSB0eXBlO1xuXG4gICAgY29uc3QgZmlyc3ROYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicHJvZmlsZVtwZXJzb25dW2ZpcnN0TmFtZV1cIl0nKTtcbiAgICBpZiAoZmlyc3ROYW1lSW5wdXQgIT09IG51bGwpIHtcbiAgICAgIGZpcnN0TmFtZUlucHV0LnZhbHVlID0gJy0nO1xuICAgIH1cbiAgICBjb25zdCBsYXN0TmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInByb2ZpbGVbcGVyc29uXVtsYXN0TmFtZV1cIl0nKTtcbiAgICBpZiAobGFzdE5hbWVJbnB1dCAhPT0gbnVsbCkge1xuICAgICAgbGFzdE5hbWVJbnB1dC52YWx1ZSA9ICctJztcbiAgICB9XG4gICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInByb2ZpbGVbb3JnYW5pemF0aW9uXVtuYW1lXVwiXScpO1xuICAgIGlmIChuYW1lSW5wdXQgIT09IG51bGwpIHtcbiAgICAgIG5hbWVJbnB1dC52YWx1ZSA9ICctJztcbiAgICB9XG5cbiAgICBmb3JtLnN1Ym1pdCgpO1xuICB9XG59KTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpbiJdLCJzb3VyY2VSb290IjoiIn0=