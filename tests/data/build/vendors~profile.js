(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendors~profile"],{

/***/ "./node_modules/core-js/internals/advance-string-index.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/advance-string-index.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(/*! ../internals/string-multibyte */ "./node_modules/core-js/internals/string-multibyte.js").charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(/*! ../modules/es.regexp.exec */ "./node_modules/core-js/modules/es.regexp.exec.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var regexpExec = __webpack_require__(/*! ../internals/regexp-exec */ "./node_modules/core-js/internals/regexp-exec.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
};


/***/ }),

/***/ "./node_modules/core-js/internals/regexp-exec-abstract.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-exec-abstract.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ./classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var regexpExec = __webpack_require__(/*! ./regexp-exec */ "./node_modules/core-js/internals/regexp-exec.js");

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};



/***/ }),

/***/ "./node_modules/core-js/internals/regexp-exec.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-exec.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpFlags = __webpack_require__(/*! ./regexp-flags */ "./node_modules/core-js/internals/regexp-flags.js");
var stickyHelpers = __webpack_require__(/*! ./regexp-sticky-helpers */ "./node_modules/core-js/internals/regexp-sticky-helpers.js");

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ "./node_modules/core-js/internals/regexp-sticky-helpers.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-sticky-helpers.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fails = __webpack_require__(/*! ./fails */ "./node_modules/core-js/internals/fails.js");

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

exports.UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

exports.BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.regexp.exec.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/es.regexp.exec.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var exec = __webpack_require__(/*! ../internals/regexp-exec */ "./node_modules/core-js/internals/regexp-exec.js");

$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.string.replace.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/modules/es.string.replace.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(/*! ../internals/fix-regexp-well-known-symbol-logic */ "./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");
var advanceStringIndex = __webpack_require__(/*! ../internals/advance-string-index */ "./node_modules/core-js/internals/advance-string-index.js");
var regExpExec = __webpack_require__(/*! ../internals/regexp-exec-abstract */ "./node_modules/core-js/internals/regexp-exec-abstract.js");

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (
        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
      ) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});


/***/ }),

/***/ "./node_modules/dropzone/dist/dropzone.js":
/*!************************************************!*\
  !*** ./node_modules/dropzone/dist/dropzone.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 *
 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
 *
 * Copyright (c) 2012, Matias Meno
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
// The Emitter class provides the ability to call `.on()` on Dropzone to listen
// to events.
// It is strongly based on component's emitter class, and I removed the
// functionality because of the dependency hell with different frameworks.
var Emitter =
/*#__PURE__*/
function () {
  function Emitter() {
    _classCallCheck(this, Emitter);
  }

  _createClass(Emitter, [{
    key: "on",
    // Add an event listener for given event
    value: function on(event, fn) {
      this._callbacks = this._callbacks || {}; // Create namespace for this event

      if (!this._callbacks[event]) {
        this._callbacks[event] = [];
      }

      this._callbacks[event].push(fn);

      return this;
    }
  }, {
    key: "emit",
    value: function emit(event) {
      this._callbacks = this._callbacks || {};
      var callbacks = this._callbacks[event];

      if (callbacks) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var callback = _step.value;
            callback.apply(this, args);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      return this;
    } // Remove event listener for given event. If fn is not provided, all event
    // listeners for that event will be removed. If neither is provided, all
    // event listeners will be removed.

  }, {
    key: "off",
    value: function off(event, fn) {
      if (!this._callbacks || arguments.length === 0) {
        this._callbacks = {};
        return this;
      } // specific event


      var callbacks = this._callbacks[event];

      if (!callbacks) {
        return this;
      } // remove all handlers


      if (arguments.length === 1) {
        delete this._callbacks[event];
        return this;
      } // remove specific handler


      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];

        if (callback === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      return this;
    }
  }]);

  return Emitter;
}();

var Dropzone =
/*#__PURE__*/
function (_Emitter) {
  _inherits(Dropzone, _Emitter);

  _createClass(Dropzone, null, [{
    key: "initClass",
    value: function initClass() {
      // Exposing the emitter class, mainly for tests
      this.prototype.Emitter = Emitter;
      /*
       This is a list of all available events you can register on a dropzone object.
        You can register an event handler like this:
        dropzone.on("dragEnter", function() { });
        */

      this.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"];
      this.prototype.defaultOptions = {
        /**
         * Has to be specified on elements other than form (or when the form
         * doesn't have an `action` attribute). You can also
         * provide a function that will be called with `files` and
         * must return the url (since `v3.12.0`)
         */
        url: null,

        /**
         * Can be changed to `"put"` if necessary. You can also provide a function
         * that will be called with `files` and must return the method (since `v3.12.0`).
         */
        method: "post",

        /**
         * Will be set on the XHRequest.
         */
        withCredentials: false,

        /**
         * The timeout for the XHR requests in milliseconds (since `v4.4.0`).
         */
        timeout: 30000,

        /**
         * How many file uploads to process in parallel (See the
         * Enqueuing file uploads documentation section for more info)
         */
        parallelUploads: 2,

        /**
         * Whether to send multiple files in one request. If
         * this it set to true, then the fallback file input element will
         * have the `multiple` attribute as well. This option will
         * also trigger additional events (like `processingmultiple`). See the events
         * documentation section for more information.
         */
        uploadMultiple: false,

        /**
         * Whether you want files to be uploaded in chunks to your server. This can't be
         * used in combination with `uploadMultiple`.
         *
         * See [chunksUploaded](#config-chunksUploaded) for the callback to finalise an upload.
         */
        chunking: false,

        /**
         * If `chunking` is enabled, this defines whether **every** file should be chunked,
         * even if the file size is below chunkSize. This means, that the additional chunk
         * form data will be submitted and the `chunksUploaded` callback will be invoked.
         */
        forceChunking: false,

        /**
         * If `chunking` is `true`, then this defines the chunk size in bytes.
         */
        chunkSize: 2000000,

        /**
         * If `true`, the individual chunks of a file are being uploaded simultaneously.
         */
        parallelChunkUploads: false,

        /**
         * Whether a chunk should be retried if it fails.
         */
        retryChunks: false,

        /**
         * If `retryChunks` is true, how many times should it be retried.
         */
        retryChunksLimit: 3,

        /**
         * If not `null` defines how many files this Dropzone handles. If it exceeds,
         * the event `maxfilesexceeded` will be called. The dropzone element gets the
         * class `dz-max-files-reached` accordingly so you can provide visual feedback.
         */
        maxFilesize: 256,

        /**
         * The name of the file param that gets transferred.
         * **NOTE**: If you have the option  `uploadMultiple` set to `true`, then
         * Dropzone will append `[]` to the name.
         */
        paramName: "file",

        /**
         * Whether thumbnails for images should be generated
         */
        createImageThumbnails: true,

        /**
         * In MB. When the filename exceeds this limit, the thumbnail will not be generated.
         */
        maxThumbnailFilesize: 10,

        /**
         * If `null`, the ratio of the image will be used to calculate it.
         */
        thumbnailWidth: 120,

        /**
         * The same as `thumbnailWidth`. If both are null, images will not be resized.
         */
        thumbnailHeight: 120,

        /**
         * How the images should be scaled down in case both, `thumbnailWidth` and `thumbnailHeight` are provided.
         * Can be either `contain` or `crop`.
         */
        thumbnailMethod: 'crop',

        /**
         * If set, images will be resized to these dimensions before being **uploaded**.
         * If only one, `resizeWidth` **or** `resizeHeight` is provided, the original aspect
         * ratio of the file will be preserved.
         *
         * The `options.transformFile` function uses these options, so if the `transformFile` function
         * is overridden, these options don't do anything.
         */
        resizeWidth: null,

        /**
         * See `resizeWidth`.
         */
        resizeHeight: null,

        /**
         * The mime type of the resized image (before it gets uploaded to the server).
         * If `null` the original mime type will be used. To force jpeg, for example, use `image/jpeg`.
         * See `resizeWidth` for more information.
         */
        resizeMimeType: null,

        /**
         * The quality of the resized images. See `resizeWidth`.
         */
        resizeQuality: 0.8,

        /**
         * How the images should be scaled down in case both, `resizeWidth` and `resizeHeight` are provided.
         * Can be either `contain` or `crop`.
         */
        resizeMethod: 'contain',

        /**
         * The base that is used to calculate the filesize. You can change this to
         * 1024 if you would rather display kibibytes, mebibytes, etc...
         * 1024 is technically incorrect, because `1024 bytes` are `1 kibibyte` not `1 kilobyte`.
         * You can change this to `1024` if you don't care about validity.
         */
        filesizeBase: 1000,

        /**
         * Can be used to limit the maximum number of files that will be handled by this Dropzone
         */
        maxFiles: null,

        /**
         * An optional object to send additional headers to the server. Eg:
         * `{ "My-Awesome-Header": "header value" }`
         */
        headers: null,

        /**
         * If `true`, the dropzone element itself will be clickable, if `false`
         * nothing will be clickable.
         *
         * You can also pass an HTML element, a CSS selector (for multiple elements)
         * or an array of those. In that case, all of those elements will trigger an
         * upload when clicked.
         */
        clickable: true,

        /**
         * Whether hidden files in directories should be ignored.
         */
        ignoreHiddenFiles: true,

        /**
         * The default implementation of `accept` checks the file's mime type or
         * extension against this list. This is a comma separated list of mime
         * types or file extensions.
         *
         * Eg.: `image/*,application/pdf,.psd`
         *
         * If the Dropzone is `clickable` this option will also be used as
         * [`accept`](https://developer.mozilla.org/en-US/docs/HTML/Element/input#attr-accept)
         * parameter on the hidden file input as well.
         */
        acceptedFiles: null,

        /**
         * **Deprecated!**
         * Use acceptedFiles instead.
         */
        acceptedMimeTypes: null,

        /**
         * If false, files will be added to the queue but the queue will not be
         * processed automatically.
         * This can be useful if you need some additional user input before sending
         * files (or if you want want all files sent at once).
         * If you're ready to send the file simply call `myDropzone.processQueue()`.
         *
         * See the [enqueuing file uploads](#enqueuing-file-uploads) documentation
         * section for more information.
         */
        autoProcessQueue: true,

        /**
         * If false, files added to the dropzone will not be queued by default.
         * You'll have to call `enqueueFile(file)` manually.
         */
        autoQueue: true,

        /**
         * If `true`, this will add a link to every file preview to remove or cancel (if
         * already uploading) the file. The `dictCancelUpload`, `dictCancelUploadConfirmation`
         * and `dictRemoveFile` options are used for the wording.
         */
        addRemoveLinks: false,

        /**
         * Defines where to display the file previews – if `null` the
         * Dropzone element itself is used. Can be a plain `HTMLElement` or a CSS
         * selector. The element should have the `dropzone-previews` class so
         * the previews are displayed properly.
         */
        previewsContainer: null,

        /**
         * This is the element the hidden input field (which is used when clicking on the
         * dropzone to trigger file selection) will be appended to. This might
         * be important in case you use frameworks to switch the content of your page.
         *
         * Can be a selector string, or an element directly.
         */
        hiddenInputContainer: "body",

        /**
         * If null, no capture type will be specified
         * If camera, mobile devices will skip the file selection and choose camera
         * If microphone, mobile devices will skip the file selection and choose the microphone
         * If camcorder, mobile devices will skip the file selection and choose the camera in video mode
         * On apple devices multiple must be set to false.  AcceptedFiles may need to
         * be set to an appropriate mime type (e.g. "image/*", "audio/*", or "video/*").
         */
        capture: null,

        /**
         * **Deprecated**. Use `renameFile` instead.
         */
        renameFilename: null,

        /**
         * A function that is invoked before the file is uploaded to the server and renames the file.
         * This function gets the `File` as argument and can use the `file.name`. The actual name of the
         * file that gets used during the upload can be accessed through `file.upload.filename`.
         */
        renameFile: null,

        /**
         * If `true` the fallback will be forced. This is very useful to test your server
         * implementations first and make sure that everything works as
         * expected without dropzone if you experience problems, and to test
         * how your fallbacks will look.
         */
        forceFallback: false,

        /**
         * The text used before any files are dropped.
         */
        dictDefaultMessage: "Drop files here to upload",

        /**
         * The text that replaces the default message text it the browser is not supported.
         */
        dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",

        /**
         * The text that will be added before the fallback form.
         * If you provide a  fallback element yourself, or if this option is `null` this will
         * be ignored.
         */
        dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",

        /**
         * If the filesize is too big.
         * `{{filesize}}` and `{{maxFilesize}}` will be replaced with the respective configuration values.
         */
        dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",

        /**
         * If the file doesn't match the file type.
         */
        dictInvalidFileType: "You can't upload files of this type.",

        /**
         * If the server response was invalid.
         * `{{statusCode}}` will be replaced with the servers status code.
         */
        dictResponseError: "Server responded with {{statusCode}} code.",

        /**
         * If `addRemoveLinks` is true, the text to be used for the cancel upload link.
         */
        dictCancelUpload: "Cancel upload",

        /**
         * The text that is displayed if an upload was manually canceled
         */
        dictUploadCanceled: "Upload canceled.",

        /**
         * If `addRemoveLinks` is true, the text to be used for confirmation when cancelling upload.
         */
        dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",

        /**
         * If `addRemoveLinks` is true, the text to be used to remove a file.
         */
        dictRemoveFile: "Remove file",

        /**
         * If this is not null, then the user will be prompted before removing a file.
         */
        dictRemoveFileConfirmation: null,

        /**
         * Displayed if `maxFiles` is st and exceeded.
         * The string `{{maxFiles}}` will be replaced by the configuration value.
         */
        dictMaxFilesExceeded: "You can not upload any more files.",

        /**
         * Allows you to translate the different units. Starting with `tb` for terabytes and going down to
         * `b` for bytes.
         */
        dictFileSizeUnits: {
          tb: "TB",
          gb: "GB",
          mb: "MB",
          kb: "KB",
          b: "b"
        },

        /**
         * Called when dropzone initialized
         * You can add event listeners here
         */
        init: function init() {},

        /**
         * Can be an **object** of additional parameters to transfer to the server, **or** a `Function`
         * that gets invoked with the `files`, `xhr` and, if it's a chunked upload, `chunk` arguments. In case
         * of a function, this needs to return a map.
         *
         * The default implementation does nothing for normal uploads, but adds relevant information for
         * chunked uploads.
         *
         * This is the same as adding hidden input fields in the form element.
         */
        params: function params(files, xhr, chunk) {
          if (chunk) {
            return {
              dzuuid: chunk.file.upload.uuid,
              dzchunkindex: chunk.index,
              dztotalfilesize: chunk.file.size,
              dzchunksize: this.options.chunkSize,
              dztotalchunkcount: chunk.file.upload.totalChunkCount,
              dzchunkbyteoffset: chunk.index * this.options.chunkSize
            };
          }
        },

        /**
         * A function that gets a [file](https://developer.mozilla.org/en-US/docs/DOM/File)
         * and a `done` function as parameters.
         *
         * If the done function is invoked without arguments, the file is "accepted" and will
         * be processed. If you pass an error message, the file is rejected, and the error
         * message will be displayed.
         * This function will not be called if the file is too big or doesn't match the mime types.
         */
        accept: function accept(file, done) {
          return done();
        },

        /**
         * The callback that will be invoked when all chunks have been uploaded for a file.
         * It gets the file for which the chunks have been uploaded as the first parameter,
         * and the `done` function as second. `done()` needs to be invoked when everything
         * needed to finish the upload process is done.
         */
        chunksUploaded: function chunksUploaded(file, done) {
          done();
        },

        /**
         * Gets called when the browser is not supported.
         * The default implementation shows the fallback input field and adds
         * a text.
         */
        fallback: function fallback() {
          // This code should pass in IE7... :(
          var messageElement;
          this.element.className = "".concat(this.element.className, " dz-browser-not-supported");
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.element.getElementsByTagName("div")[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var child = _step2.value;

              if (/(^| )dz-message($| )/.test(child.className)) {
                messageElement = child;
                child.className = "dz-message"; // Removes the 'dz-default' class

                break;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          if (!messageElement) {
            messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
            this.element.appendChild(messageElement);
          }

          var span = messageElement.getElementsByTagName("span")[0];

          if (span) {
            if (span.textContent != null) {
              span.textContent = this.options.dictFallbackMessage;
            } else if (span.innerText != null) {
              span.innerText = this.options.dictFallbackMessage;
            }
          }

          return this.element.appendChild(this.getFallbackForm());
        },

        /**
         * Gets called to calculate the thumbnail dimensions.
         *
         * It gets `file`, `width` and `height` (both may be `null`) as parameters and must return an object containing:
         *
         *  - `srcWidth` & `srcHeight` (required)
         *  - `trgWidth` & `trgHeight` (required)
         *  - `srcX` & `srcY` (optional, default `0`)
         *  - `trgX` & `trgY` (optional, default `0`)
         *
         * Those values are going to be used by `ctx.drawImage()`.
         */
        resize: function resize(file, width, height, resizeMethod) {
          var info = {
            srcX: 0,
            srcY: 0,
            srcWidth: file.width,
            srcHeight: file.height
          };
          var srcRatio = file.width / file.height; // Automatically calculate dimensions if not specified

          if (width == null && height == null) {
            width = info.srcWidth;
            height = info.srcHeight;
          } else if (width == null) {
            width = height * srcRatio;
          } else if (height == null) {
            height = width / srcRatio;
          } // Make sure images aren't upscaled


          width = Math.min(width, info.srcWidth);
          height = Math.min(height, info.srcHeight);
          var trgRatio = width / height;

          if (info.srcWidth > width || info.srcHeight > height) {
            // Image is bigger and needs rescaling
            if (resizeMethod === 'crop') {
              if (srcRatio > trgRatio) {
                info.srcHeight = file.height;
                info.srcWidth = info.srcHeight * trgRatio;
              } else {
                info.srcWidth = file.width;
                info.srcHeight = info.srcWidth / trgRatio;
              }
            } else if (resizeMethod === 'contain') {
              // Method 'contain'
              if (srcRatio > trgRatio) {
                height = width / srcRatio;
              } else {
                width = height * srcRatio;
              }
            } else {
              throw new Error("Unknown resizeMethod '".concat(resizeMethod, "'"));
            }
          }

          info.srcX = (file.width - info.srcWidth) / 2;
          info.srcY = (file.height - info.srcHeight) / 2;
          info.trgWidth = width;
          info.trgHeight = height;
          return info;
        },

        /**
         * Can be used to transform the file (for example, resize an image if necessary).
         *
         * The default implementation uses `resizeWidth` and `resizeHeight` (if provided) and resizes
         * images according to those dimensions.
         *
         * Gets the `file` as the first parameter, and a `done()` function as the second, that needs
         * to be invoked with the file when the transformation is done.
         */
        transformFile: function transformFile(file, done) {
          if ((this.options.resizeWidth || this.options.resizeHeight) && file.type.match(/image.*/)) {
            return this.resizeImage(file, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, done);
          } else {
            return done(file);
          }
        },

        /**
         * A string that contains the template used for each dropped
         * file. Change it to fulfill your needs but make sure to properly
         * provide all elements.
         *
         * If you want to use an actual HTML element instead of providing a String
         * as a config option, you could create a div with the id `tpl`,
         * put the template inside it and provide the element like this:
         *
         *     document
         *       .querySelector('#tpl')
         *       .innerHTML
         *
         */
        previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n    <div class=\"dz-size\"><span data-dz-size></span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n      <title>Check</title>\n      <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n      <title>Error</title>\n      <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>",
        // END OPTIONS
        // (Required by the dropzone documentation parser)

        /*
         Those functions register themselves to the events on init and handle all
         the user interface specific stuff. Overwriting them won't break the upload
         but can break the way it's displayed.
         You can overwrite them if you don't like the default behavior. If you just
         want to add an additional event handler, register it on the dropzone object
         and don't overwrite those options.
         */
        // Those are self explanatory and simply concern the DragnDrop.
        drop: function drop(e) {
          return this.element.classList.remove("dz-drag-hover");
        },
        dragstart: function dragstart(e) {},
        dragend: function dragend(e) {
          return this.element.classList.remove("dz-drag-hover");
        },
        dragenter: function dragenter(e) {
          return this.element.classList.add("dz-drag-hover");
        },
        dragover: function dragover(e) {
          return this.element.classList.add("dz-drag-hover");
        },
        dragleave: function dragleave(e) {
          return this.element.classList.remove("dz-drag-hover");
        },
        paste: function paste(e) {},
        // Called whenever there are no files left in the dropzone anymore, and the
        // dropzone should be displayed as if in the initial state.
        reset: function reset() {
          return this.element.classList.remove("dz-started");
        },
        // Called when a file is added to the queue
        // Receives `file`
        addedfile: function addedfile(file) {
          var _this2 = this;

          if (this.element === this.previewsContainer) {
            this.element.classList.add("dz-started");
          }

          if (this.previewsContainer) {
            file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
            file.previewTemplate = file.previewElement; // Backwards compatibility

            this.previewsContainer.appendChild(file.previewElement);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = file.previewElement.querySelectorAll("[data-dz-name]")[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;
                node.textContent = file.name;
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = file.previewElement.querySelectorAll("[data-dz-size]")[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                node = _step4.value;
                node.innerHTML = this.filesize(file.size);
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                  _iterator4["return"]();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }

            if (this.options.addRemoveLinks) {
              file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>".concat(this.options.dictRemoveFile, "</a>"));
              file.previewElement.appendChild(file._removeLink);
            }

            var removeFileEvent = function removeFileEvent(e) {
              e.preventDefault();
              e.stopPropagation();

              if (file.status === Dropzone.UPLOADING) {
                return Dropzone.confirm(_this2.options.dictCancelUploadConfirmation, function () {
                  return _this2.removeFile(file);
                });
              } else {
                if (_this2.options.dictRemoveFileConfirmation) {
                  return Dropzone.confirm(_this2.options.dictRemoveFileConfirmation, function () {
                    return _this2.removeFile(file);
                  });
                } else {
                  return _this2.removeFile(file);
                }
              }
            };

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = file.previewElement.querySelectorAll("[data-dz-remove]")[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var removeLink = _step5.value;
                removeLink.addEventListener("click", removeFileEvent);
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                  _iterator5["return"]();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          }
        },
        // Called whenever a file is removed.
        removedfile: function removedfile(file) {
          if (file.previewElement != null && file.previewElement.parentNode != null) {
            file.previewElement.parentNode.removeChild(file.previewElement);
          }

          return this._updateMaxFilesReachedClass();
        },
        // Called when a thumbnail has been generated
        // Receives `file` and `dataUrl`
        thumbnail: function thumbnail(file, dataUrl) {
          if (file.previewElement) {
            file.previewElement.classList.remove("dz-file-preview");
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = file.previewElement.querySelectorAll("[data-dz-thumbnail]")[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var thumbnailElement = _step6.value;
                thumbnailElement.alt = file.name;
                thumbnailElement.src = dataUrl;
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                  _iterator6["return"]();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
            }

            return setTimeout(function () {
              return file.previewElement.classList.add("dz-image-preview");
            }, 1);
          }
        },
        // Called whenever an error occurs
        // Receives `file` and `message`
        error: function error(file, message) {
          if (file.previewElement) {
            file.previewElement.classList.add("dz-error");

            if (typeof message !== "String" && message.error) {
              message = message.error;
            }

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = file.previewElement.querySelectorAll("[data-dz-errormessage]")[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var node = _step7.value;
                node.textContent = message;
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                  _iterator7["return"]();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }
          }
        },
        errormultiple: function errormultiple() {},
        // Called when a file gets processed. Since there is a cue, not all added
        // files are processed immediately.
        // Receives `file`
        processing: function processing(file) {
          if (file.previewElement) {
            file.previewElement.classList.add("dz-processing");

            if (file._removeLink) {
              return file._removeLink.innerHTML = this.options.dictCancelUpload;
            }
          }
        },
        processingmultiple: function processingmultiple() {},
        // Called whenever the upload progress gets updated.
        // Receives `file`, `progress` (percentage 0-100) and `bytesSent`.
        // To get the total number of bytes of the file, use `file.size`
        uploadprogress: function uploadprogress(file, progress, bytesSent) {
          if (file.previewElement) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
              for (var _iterator8 = file.previewElement.querySelectorAll("[data-dz-uploadprogress]")[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var node = _step8.value;
                node.nodeName === 'PROGRESS' ? node.value = progress : node.style.width = "".concat(progress, "%");
              }
            } catch (err) {
              _didIteratorError8 = true;
              _iteratorError8 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                  _iterator8["return"]();
                }
              } finally {
                if (_didIteratorError8) {
                  throw _iteratorError8;
                }
              }
            }
          }
        },
        // Called whenever the total upload progress gets updated.
        // Called with totalUploadProgress (0-100), totalBytes and totalBytesSent
        totaluploadprogress: function totaluploadprogress() {},
        // Called just before the file is sent. Gets the `xhr` object as second
        // parameter, so you can modify it (for example to add a CSRF token) and a
        // `formData` object to add additional information.
        sending: function sending() {},
        sendingmultiple: function sendingmultiple() {},
        // When the complete upload is finished and successful
        // Receives `file`
        success: function success(file) {
          if (file.previewElement) {
            return file.previewElement.classList.add("dz-success");
          }
        },
        successmultiple: function successmultiple() {},
        // When the upload is canceled.
        canceled: function canceled(file) {
          return this.emit("error", file, this.options.dictUploadCanceled);
        },
        canceledmultiple: function canceledmultiple() {},
        // When the upload is finished, either with success or an error.
        // Receives `file`
        complete: function complete(file) {
          if (file._removeLink) {
            file._removeLink.innerHTML = this.options.dictRemoveFile;
          }

          if (file.previewElement) {
            return file.previewElement.classList.add("dz-complete");
          }
        },
        completemultiple: function completemultiple() {},
        maxfilesexceeded: function maxfilesexceeded() {},
        maxfilesreached: function maxfilesreached() {},
        queuecomplete: function queuecomplete() {},
        addedfiles: function addedfiles() {}
      };
      this.prototype._thumbnailQueue = [];
      this.prototype._processingThumbnail = false;
    } // global utility

  }, {
    key: "extend",
    value: function extend(target) {
      for (var _len2 = arguments.length, objects = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        objects[_key2 - 1] = arguments[_key2];
      }

      for (var _i = 0, _objects = objects; _i < _objects.length; _i++) {
        var object = _objects[_i];

        for (var key in object) {
          var val = object[key];
          target[key] = val;
        }
      }

      return target;
    }
  }]);

  function Dropzone(el, options) {
    var _this;

    _classCallCheck(this, Dropzone);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Dropzone).call(this));
    var fallback, left;
    _this.element = el; // For backwards compatibility since the version was in the prototype previously

    _this.version = Dropzone.version;
    _this.defaultOptions.previewTemplate = _this.defaultOptions.previewTemplate.replace(/\n*/g, "");
    _this.clickableElements = [];
    _this.listeners = [];
    _this.files = []; // All files

    if (typeof _this.element === "string") {
      _this.element = document.querySelector(_this.element);
    } // Not checking if instance of HTMLElement or Element since IE9 is extremely weird.


    if (!_this.element || _this.element.nodeType == null) {
      throw new Error("Invalid dropzone element.");
    }

    if (_this.element.dropzone) {
      throw new Error("Dropzone already attached.");
    } // Now add this dropzone to the instances.


    Dropzone.instances.push(_assertThisInitialized(_this)); // Put the dropzone inside the element itself.

    _this.element.dropzone = _assertThisInitialized(_this);
    var elementOptions = (left = Dropzone.optionsForElement(_this.element)) != null ? left : {};
    _this.options = Dropzone.extend({}, _this.defaultOptions, elementOptions, options != null ? options : {}); // If the browser failed, just call the fallback and leave

    if (_this.options.forceFallback || !Dropzone.isBrowserSupported()) {
      return _possibleConstructorReturn(_this, _this.options.fallback.call(_assertThisInitialized(_this)));
    } // @options.url = @element.getAttribute "action" unless @options.url?


    if (_this.options.url == null) {
      _this.options.url = _this.element.getAttribute("action");
    }

    if (!_this.options.url) {
      throw new Error("No URL provided.");
    }

    if (_this.options.acceptedFiles && _this.options.acceptedMimeTypes) {
      throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
    }

    if (_this.options.uploadMultiple && _this.options.chunking) {
      throw new Error('You cannot set both: uploadMultiple and chunking.');
    } // Backwards compatibility


    if (_this.options.acceptedMimeTypes) {
      _this.options.acceptedFiles = _this.options.acceptedMimeTypes;
      delete _this.options.acceptedMimeTypes;
    } // Backwards compatibility


    if (_this.options.renameFilename != null) {
      _this.options.renameFile = function (file) {
        return _this.options.renameFilename.call(_assertThisInitialized(_this), file.name, file);
      };
    }

    _this.options.method = _this.options.method.toUpperCase();

    if ((fallback = _this.getExistingFallback()) && fallback.parentNode) {
      // Remove the fallback
      fallback.parentNode.removeChild(fallback);
    } // Display previews in the previewsContainer element or the Dropzone element unless explicitly set to false


    if (_this.options.previewsContainer !== false) {
      if (_this.options.previewsContainer) {
        _this.previewsContainer = Dropzone.getElement(_this.options.previewsContainer, "previewsContainer");
      } else {
        _this.previewsContainer = _this.element;
      }
    }

    if (_this.options.clickable) {
      if (_this.options.clickable === true) {
        _this.clickableElements = [_this.element];
      } else {
        _this.clickableElements = Dropzone.getElements(_this.options.clickable, "clickable");
      }
    }

    _this.init();

    return _this;
  } // Returns all files that have been accepted


  _createClass(Dropzone, [{
    key: "getAcceptedFiles",
    value: function getAcceptedFiles() {
      return this.files.filter(function (file) {
        return file.accepted;
      }).map(function (file) {
        return file;
      });
    } // Returns all files that have been rejected
    // Not sure when that's going to be useful, but added for completeness.

  }, {
    key: "getRejectedFiles",
    value: function getRejectedFiles() {
      return this.files.filter(function (file) {
        return !file.accepted;
      }).map(function (file) {
        return file;
      });
    }
  }, {
    key: "getFilesWithStatus",
    value: function getFilesWithStatus(status) {
      return this.files.filter(function (file) {
        return file.status === status;
      }).map(function (file) {
        return file;
      });
    } // Returns all files that are in the queue

  }, {
    key: "getQueuedFiles",
    value: function getQueuedFiles() {
      return this.getFilesWithStatus(Dropzone.QUEUED);
    }
  }, {
    key: "getUploadingFiles",
    value: function getUploadingFiles() {
      return this.getFilesWithStatus(Dropzone.UPLOADING);
    }
  }, {
    key: "getAddedFiles",
    value: function getAddedFiles() {
      return this.getFilesWithStatus(Dropzone.ADDED);
    } // Files that are either queued or uploading

  }, {
    key: "getActiveFiles",
    value: function getActiveFiles() {
      return this.files.filter(function (file) {
        return file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED;
      }).map(function (file) {
        return file;
      });
    } // The function that gets called when Dropzone is initialized. You
    // can (and should) setup event listeners inside this function.

  }, {
    key: "init",
    value: function init() {
      var _this3 = this;

      // In case it isn't set already
      if (this.element.tagName === "form") {
        this.element.setAttribute("enctype", "multipart/form-data");
      }

      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
        this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><button class=\"dz-button\" type=\"button\">".concat(this.options.dictDefaultMessage, "</button></div>")));
      }

      if (this.clickableElements.length) {
        var setupHiddenFileInput = function setupHiddenFileInput() {
          if (_this3.hiddenFileInput) {
            _this3.hiddenFileInput.parentNode.removeChild(_this3.hiddenFileInput);
          }

          _this3.hiddenFileInput = document.createElement("input");

          _this3.hiddenFileInput.setAttribute("type", "file");

          if (_this3.options.maxFiles === null || _this3.options.maxFiles > 1) {
            _this3.hiddenFileInput.setAttribute("multiple", "multiple");
          }

          _this3.hiddenFileInput.className = "dz-hidden-input";

          if (_this3.options.acceptedFiles !== null) {
            _this3.hiddenFileInput.setAttribute("accept", _this3.options.acceptedFiles);
          }

          if (_this3.options.capture !== null) {
            _this3.hiddenFileInput.setAttribute("capture", _this3.options.capture);
          } // Not setting `display="none"` because some browsers don't accept clicks
          // on elements that aren't displayed.


          _this3.hiddenFileInput.style.visibility = "hidden";
          _this3.hiddenFileInput.style.position = "absolute";
          _this3.hiddenFileInput.style.top = "0";
          _this3.hiddenFileInput.style.left = "0";
          _this3.hiddenFileInput.style.height = "0";
          _this3.hiddenFileInput.style.width = "0";
          Dropzone.getElement(_this3.options.hiddenInputContainer, 'hiddenInputContainer').appendChild(_this3.hiddenFileInput);
          return _this3.hiddenFileInput.addEventListener("change", function () {
            var files = _this3.hiddenFileInput.files;

            if (files.length) {
              var _iteratorNormalCompletion9 = true;
              var _didIteratorError9 = false;
              var _iteratorError9 = undefined;

              try {
                for (var _iterator9 = files[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                  var file = _step9.value;

                  _this3.addFile(file);
                }
              } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                    _iterator9["return"]();
                  }
                } finally {
                  if (_didIteratorError9) {
                    throw _iteratorError9;
                  }
                }
              }
            }

            _this3.emit("addedfiles", files);

            return setupHiddenFileInput();
          });
        };

        setupHiddenFileInput();
      }

      this.URL = window.URL !== null ? window.URL : window.webkitURL; // Setup all event listeners on the Dropzone object itself.
      // They're not in @setupEventListeners() because they shouldn't be removed
      // again when the dropzone gets disabled.

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.events[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var eventName = _step10.value;
          this.on(eventName, this.options[eventName]);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
            _iterator10["return"]();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      this.on("uploadprogress", function () {
        return _this3.updateTotalUploadProgress();
      });
      this.on("removedfile", function () {
        return _this3.updateTotalUploadProgress();
      });
      this.on("canceled", function (file) {
        return _this3.emit("complete", file);
      }); // Emit a `queuecomplete` event if all files finished uploading.

      this.on("complete", function (file) {
        if (_this3.getAddedFiles().length === 0 && _this3.getUploadingFiles().length === 0 && _this3.getQueuedFiles().length === 0) {
          // This needs to be deferred so that `queuecomplete` really triggers after `complete`
          return setTimeout(function () {
            return _this3.emit("queuecomplete");
          }, 0);
        }
      });

      var containsFiles = function containsFiles(e) {
        return e.dataTransfer.types && e.dataTransfer.types.some(function (type) {
          return type == "Files";
        });
      };

      var noPropagation = function noPropagation(e) {
        // If there are no files, we don't want to stop
        // propagation so we don't interfere with other
        // drag and drop behaviour.
        if (!containsFiles(e)) return;
        e.stopPropagation();

        if (e.preventDefault) {
          return e.preventDefault();
        } else {
          return e.returnValue = false;
        }
      }; // Create the listeners


      this.listeners = [{
        element: this.element,
        events: {
          "dragstart": function dragstart(e) {
            return _this3.emit("dragstart", e);
          },
          "dragenter": function dragenter(e) {
            noPropagation(e);
            return _this3.emit("dragenter", e);
          },
          "dragover": function dragover(e) {
            // Makes it possible to drag files from chrome's download bar
            // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
            // Try is required to prevent bug in Internet Explorer 11 (SCRIPT65535 exception)
            var efct;

            try {
              efct = e.dataTransfer.effectAllowed;
            } catch (error) {}

            e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
            noPropagation(e);
            return _this3.emit("dragover", e);
          },
          "dragleave": function dragleave(e) {
            return _this3.emit("dragleave", e);
          },
          "drop": function drop(e) {
            noPropagation(e);
            return _this3.drop(e);
          },
          "dragend": function dragend(e) {
            return _this3.emit("dragend", e);
          }
        } // This is disabled right now, because the browsers don't implement it properly.
        // "paste": (e) =>
        //   noPropagation e
        //   @paste e

      }];
      this.clickableElements.forEach(function (clickableElement) {
        return _this3.listeners.push({
          element: clickableElement,
          events: {
            "click": function click(evt) {
              // Only the actual dropzone or the message element should trigger file selection
              if (clickableElement !== _this3.element || evt.target === _this3.element || Dropzone.elementInside(evt.target, _this3.element.querySelector(".dz-message"))) {
                _this3.hiddenFileInput.click(); // Forward the click

              }

              return true;
            }
          }
        });
      });
      this.enable();
      return this.options.init.call(this);
    } // Not fully tested yet

  }, {
    key: "destroy",
    value: function destroy() {
      this.disable();
      this.removeAllFiles(true);

      if (this.hiddenFileInput != null ? this.hiddenFileInput.parentNode : undefined) {
        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
        this.hiddenFileInput = null;
      }

      delete this.element.dropzone;
      return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
    }
  }, {
    key: "updateTotalUploadProgress",
    value: function updateTotalUploadProgress() {
      var totalUploadProgress;
      var totalBytesSent = 0;
      var totalBytes = 0;
      var activeFiles = this.getActiveFiles();

      if (activeFiles.length) {
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this.getActiveFiles()[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var file = _step11.value;
            totalBytesSent += file.upload.bytesSent;
            totalBytes += file.upload.total;
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        totalUploadProgress = 100 * totalBytesSent / totalBytes;
      } else {
        totalUploadProgress = 100;
      }

      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
    } // @options.paramName can be a function taking one parameter rather than a string.
    // A parameter name for a file is obtained simply by calling this with an index number.

  }, {
    key: "_getParamName",
    value: function _getParamName(n) {
      if (typeof this.options.paramName === "function") {
        return this.options.paramName(n);
      } else {
        return "".concat(this.options.paramName).concat(this.options.uploadMultiple ? "[".concat(n, "]") : "");
      }
    } // If @options.renameFile is a function,
    // the function will be used to rename the file.name before appending it to the formData

  }, {
    key: "_renameFile",
    value: function _renameFile(file) {
      if (typeof this.options.renameFile !== "function") {
        return file.name;
      }

      return this.options.renameFile(file);
    } // Returns a form that can be used as fallback if the browser does not support DragnDrop
    //
    // If the dropzone is already a form, only the input field and button are returned. Otherwise a complete form element is provided.
    // This code has to pass in IE7 :(

  }, {
    key: "getFallbackForm",
    value: function getFallbackForm() {
      var existingFallback, form;

      if (existingFallback = this.getExistingFallback()) {
        return existingFallback;
      }

      var fieldsString = "<div class=\"dz-fallback\">";

      if (this.options.dictFallbackText) {
        fieldsString += "<p>".concat(this.options.dictFallbackText, "</p>");
      }

      fieldsString += "<input type=\"file\" name=\"".concat(this._getParamName(0), "\" ").concat(this.options.uploadMultiple ? 'multiple="multiple"' : undefined, " /><input type=\"submit\" value=\"Upload!\"></div>");
      var fields = Dropzone.createElement(fieldsString);

      if (this.element.tagName !== "FORM") {
        form = Dropzone.createElement("<form action=\"".concat(this.options.url, "\" enctype=\"multipart/form-data\" method=\"").concat(this.options.method, "\"></form>"));
        form.appendChild(fields);
      } else {
        // Make sure that the enctype and method attributes are set properly
        this.element.setAttribute("enctype", "multipart/form-data");
        this.element.setAttribute("method", this.options.method);
      }

      return form != null ? form : fields;
    } // Returns the fallback elements if they exist already
    //
    // This code has to pass in IE7 :(

  }, {
    key: "getExistingFallback",
    value: function getExistingFallback() {
      var getFallback = function getFallback(elements) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = elements[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var el = _step12.value;

            if (/(^| )fallback($| )/.test(el.className)) {
              return el;
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
              _iterator12["return"]();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      };

      for (var _i2 = 0, _arr = ["div", "form"]; _i2 < _arr.length; _i2++) {
        var tagName = _arr[_i2];
        var fallback;

        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
          return fallback;
        }
      }
    } // Activates all listeners stored in @listeners

  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      return this.listeners.map(function (elementListeners) {
        return function () {
          var result = [];

          for (var event in elementListeners.events) {
            var listener = elementListeners.events[event];
            result.push(elementListeners.element.addEventListener(event, listener, false));
          }

          return result;
        }();
      });
    } // Deactivates all listeners stored in @listeners

  }, {
    key: "removeEventListeners",
    value: function removeEventListeners() {
      return this.listeners.map(function (elementListeners) {
        return function () {
          var result = [];

          for (var event in elementListeners.events) {
            var listener = elementListeners.events[event];
            result.push(elementListeners.element.removeEventListener(event, listener, false));
          }

          return result;
        }();
      });
    } // Removes all event listeners and cancels all files in the queue or being processed.

  }, {
    key: "disable",
    value: function disable() {
      var _this4 = this;

      this.clickableElements.forEach(function (element) {
        return element.classList.remove("dz-clickable");
      });
      this.removeEventListeners();
      this.disabled = true;
      return this.files.map(function (file) {
        return _this4.cancelUpload(file);
      });
    }
  }, {
    key: "enable",
    value: function enable() {
      delete this.disabled;
      this.clickableElements.forEach(function (element) {
        return element.classList.add("dz-clickable");
      });
      return this.setupEventListeners();
    } // Returns a nicely formatted filesize

  }, {
    key: "filesize",
    value: function filesize(size) {
      var selectedSize = 0;
      var selectedUnit = "b";

      if (size > 0) {
        var units = ['tb', 'gb', 'mb', 'kb', 'b'];

        for (var i = 0; i < units.length; i++) {
          var unit = units[i];
          var cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;

          if (size >= cutoff) {
            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
            selectedUnit = unit;
            break;
          }
        }

        selectedSize = Math.round(10 * selectedSize) / 10; // Cutting of digits
      }

      return "<strong>".concat(selectedSize, "</strong> ").concat(this.options.dictFileSizeUnits[selectedUnit]);
    } // Adds or removes the `dz-max-files-reached` class from the form.

  }, {
    key: "_updateMaxFilesReachedClass",
    value: function _updateMaxFilesReachedClass() {
      if (this.options.maxFiles != null && this.getAcceptedFiles().length >= this.options.maxFiles) {
        if (this.getAcceptedFiles().length === this.options.maxFiles) {
          this.emit('maxfilesreached', this.files);
        }

        return this.element.classList.add("dz-max-files-reached");
      } else {
        return this.element.classList.remove("dz-max-files-reached");
      }
    }
  }, {
    key: "drop",
    value: function drop(e) {
      if (!e.dataTransfer) {
        return;
      }

      this.emit("drop", e); // Convert the FileList to an Array
      // This is necessary for IE11

      var files = [];

      for (var i = 0; i < e.dataTransfer.files.length; i++) {
        files[i] = e.dataTransfer.files[i];
      } // Even if it's a folder, files.length will contain the folders.


      if (files.length) {
        var items = e.dataTransfer.items;

        if (items && items.length && items[0].webkitGetAsEntry != null) {
          // The browser supports dropping of folders, so handle items instead of files
          this._addFilesFromItems(items);
        } else {
          this.handleFiles(files);
        }
      }

      this.emit("addedfiles", files);
    }
  }, {
    key: "paste",
    value: function paste(e) {
      if (__guard__(e != null ? e.clipboardData : undefined, function (x) {
        return x.items;
      }) == null) {
        return;
      }

      this.emit("paste", e);
      var items = e.clipboardData.items;

      if (items.length) {
        return this._addFilesFromItems(items);
      }
    }
  }, {
    key: "handleFiles",
    value: function handleFiles(files) {
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = files[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var file = _step13.value;
          this.addFile(file);
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
            _iterator13["return"]();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }
    } // When a folder is dropped (or files are pasted), items must be handled
    // instead of files.

  }, {
    key: "_addFilesFromItems",
    value: function _addFilesFromItems(items) {
      var _this5 = this;

      return function () {
        var result = [];
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = items[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var item = _step14.value;
            var entry;

            if (item.webkitGetAsEntry != null && (entry = item.webkitGetAsEntry())) {
              if (entry.isFile) {
                result.push(_this5.addFile(item.getAsFile()));
              } else if (entry.isDirectory) {
                // Append all files from that directory to files
                result.push(_this5._addFilesFromDirectory(entry, entry.name));
              } else {
                result.push(undefined);
              }
            } else if (item.getAsFile != null) {
              if (item.kind == null || item.kind === "file") {
                result.push(_this5.addFile(item.getAsFile()));
              } else {
                result.push(undefined);
              }
            } else {
              result.push(undefined);
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
              _iterator14["return"]();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }

        return result;
      }();
    } // Goes through the directory, and adds each file it finds recursively

  }, {
    key: "_addFilesFromDirectory",
    value: function _addFilesFromDirectory(directory, path) {
      var _this6 = this;

      var dirReader = directory.createReader();

      var errorHandler = function errorHandler(error) {
        return __guardMethod__(console, 'log', function (o) {
          return o.log(error);
        });
      };

      var readEntries = function readEntries() {
        return dirReader.readEntries(function (entries) {
          if (entries.length > 0) {
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
              for (var _iterator15 = entries[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                var entry = _step15.value;

                if (entry.isFile) {
                  entry.file(function (file) {
                    if (_this6.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
                      return;
                    }

                    file.fullPath = "".concat(path, "/").concat(file.name);
                    return _this6.addFile(file);
                  });
                } else if (entry.isDirectory) {
                  _this6._addFilesFromDirectory(entry, "".concat(path, "/").concat(entry.name));
                }
              } // Recursively call readEntries() again, since browser only handle
              // the first 100 entries.
              // See: https://developer.mozilla.org/en-US/docs/Web/API/DirectoryReader#readEntries

            } catch (err) {
              _didIteratorError15 = true;
              _iteratorError15 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
                  _iterator15["return"]();
                }
              } finally {
                if (_didIteratorError15) {
                  throw _iteratorError15;
                }
              }
            }

            readEntries();
          }

          return null;
        }, errorHandler);
      };

      return readEntries();
    } // If `done()` is called without argument the file is accepted
    // If you call it with an error message, the file is rejected
    // (This allows for asynchronous validation)
    //
    // This function checks the filesize, and if the file.type passes the
    // `acceptedFiles` check.

  }, {
    key: "accept",
    value: function accept(file, done) {
      if (this.options.maxFilesize && file.size > this.options.maxFilesize * 1024 * 1024) {
        done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
      } else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
        done(this.options.dictInvalidFileType);
      } else if (this.options.maxFiles != null && this.getAcceptedFiles().length >= this.options.maxFiles) {
        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
        this.emit("maxfilesexceeded", file);
      } else {
        this.options.accept.call(this, file, done);
      }
    }
  }, {
    key: "addFile",
    value: function addFile(file) {
      var _this7 = this;

      file.upload = {
        uuid: Dropzone.uuidv4(),
        progress: 0,
        // Setting the total upload size to file.size for the beginning
        // It's actual different than the size to be transmitted.
        total: file.size,
        bytesSent: 0,
        filename: this._renameFile(file) // Not setting chunking information here, because the acutal data — and
        // thus the chunks — might change if `options.transformFile` is set
        // and does something to the data.

      };
      this.files.push(file);
      file.status = Dropzone.ADDED;
      this.emit("addedfile", file);

      this._enqueueThumbnail(file);

      this.accept(file, function (error) {
        if (error) {
          file.accepted = false;

          _this7._errorProcessing([file], error); // Will set the file.status

        } else {
          file.accepted = true;

          if (_this7.options.autoQueue) {
            _this7.enqueueFile(file);
          } // Will set .accepted = true

        }

        _this7._updateMaxFilesReachedClass();
      });
    } // Wrapper for enqueueFile

  }, {
    key: "enqueueFiles",
    value: function enqueueFiles(files) {
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = files[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var file = _step16.value;
          this.enqueueFile(file);
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
            _iterator16["return"]();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      return null;
    }
  }, {
    key: "enqueueFile",
    value: function enqueueFile(file) {
      var _this8 = this;

      if (file.status === Dropzone.ADDED && file.accepted === true) {
        file.status = Dropzone.QUEUED;

        if (this.options.autoProcessQueue) {
          return setTimeout(function () {
            return _this8.processQueue();
          }, 0); // Deferring the call
        }
      } else {
        throw new Error("This file can't be queued because it has already been processed or was rejected.");
      }
    }
  }, {
    key: "_enqueueThumbnail",
    value: function _enqueueThumbnail(file) {
      var _this9 = this;

      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
        this._thumbnailQueue.push(file);

        return setTimeout(function () {
          return _this9._processThumbnailQueue();
        }, 0); // Deferring the call
      }
    }
  }, {
    key: "_processThumbnailQueue",
    value: function _processThumbnailQueue() {
      var _this10 = this;

      if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
        return;
      }

      this._processingThumbnail = true;

      var file = this._thumbnailQueue.shift();

      return this.createThumbnail(file, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, true, function (dataUrl) {
        _this10.emit("thumbnail", file, dataUrl);

        _this10._processingThumbnail = false;
        return _this10._processThumbnailQueue();
      });
    } // Can be called by the user to remove a file

  }, {
    key: "removeFile",
    value: function removeFile(file) {
      if (file.status === Dropzone.UPLOADING) {
        this.cancelUpload(file);
      }

      this.files = without(this.files, file);
      this.emit("removedfile", file);

      if (this.files.length === 0) {
        return this.emit("reset");
      }
    } // Removes all files that aren't currently processed from the list

  }, {
    key: "removeAllFiles",
    value: function removeAllFiles(cancelIfNecessary) {
      // Create a copy of files since removeFile() changes the @files array.
      if (cancelIfNecessary == null) {
        cancelIfNecessary = false;
      }

      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.files.slice()[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var file = _step17.value;

          if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
            this.removeFile(file);
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
            _iterator17["return"]();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      return null;
    } // Resizes an image before it gets sent to the server. This function is the default behavior of
    // `options.transformFile` if `resizeWidth` or `resizeHeight` are set. The callback is invoked with
    // the resized blob.

  }, {
    key: "resizeImage",
    value: function resizeImage(file, width, height, resizeMethod, callback) {
      var _this11 = this;

      return this.createThumbnail(file, width, height, resizeMethod, true, function (dataUrl, canvas) {
        if (canvas == null) {
          // The image has not been resized
          return callback(file);
        } else {
          var resizeMimeType = _this11.options.resizeMimeType;

          if (resizeMimeType == null) {
            resizeMimeType = file.type;
          }

          var resizedDataURL = canvas.toDataURL(resizeMimeType, _this11.options.resizeQuality);

          if (resizeMimeType === 'image/jpeg' || resizeMimeType === 'image/jpg') {
            // Now add the original EXIF information
            resizedDataURL = ExifRestore.restore(file.dataURL, resizedDataURL);
          }

          return callback(Dropzone.dataURItoBlob(resizedDataURL));
        }
      });
    }
  }, {
    key: "createThumbnail",
    value: function createThumbnail(file, width, height, resizeMethod, fixOrientation, callback) {
      var _this12 = this;

      var fileReader = new FileReader();

      fileReader.onload = function () {
        file.dataURL = fileReader.result; // Don't bother creating a thumbnail for SVG images since they're vector

        if (file.type === "image/svg+xml") {
          if (callback != null) {
            callback(fileReader.result);
          }

          return;
        }

        _this12.createThumbnailFromUrl(file, width, height, resizeMethod, fixOrientation, callback);
      };

      fileReader.readAsDataURL(file);
    } // `mockFile` needs to have these attributes:
    // 
    //     { name: 'name', size: 12345, imageUrl: '' }
    //
    // `callback` will be invoked when the image has been downloaded and displayed.
    // `crossOrigin` will be added to the `img` tag when accessing the file.

  }, {
    key: "displayExistingFile",
    value: function displayExistingFile(mockFile, imageUrl, callback, crossOrigin) {
      var _this13 = this;

      var resizeThumbnail = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      this.emit("addedfile", mockFile);
      this.emit("complete", mockFile);

      if (!resizeThumbnail) {
        this.emit("thumbnail", mockFile, imageUrl);
        if (callback) callback();
      } else {
        var onDone = function onDone(thumbnail) {
          _this13.emit('thumbnail', mockFile, thumbnail);

          if (callback) callback();
        };

        mockFile.dataURL = imageUrl;
        this.createThumbnailFromUrl(mockFile, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.resizeMethod, this.options.fixOrientation, onDone, crossOrigin);
      }
    }
  }, {
    key: "createThumbnailFromUrl",
    value: function createThumbnailFromUrl(file, width, height, resizeMethod, fixOrientation, callback, crossOrigin) {
      var _this14 = this;

      // Not using `new Image` here because of a bug in latest Chrome versions.
      // See https://github.com/enyo/dropzone/pull/226
      var img = document.createElement("img");

      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      img.onload = function () {
        var loadExif = function loadExif(callback) {
          return callback(1);
        };

        if (typeof EXIF !== 'undefined' && EXIF !== null && fixOrientation) {
          loadExif = function loadExif(callback) {
            return EXIF.getData(img, function () {
              return callback(EXIF.getTag(this, 'Orientation'));
            });
          };
        }

        return loadExif(function (orientation) {
          file.width = img.width;
          file.height = img.height;

          var resizeInfo = _this14.options.resize.call(_this14, file, width, height, resizeMethod);

          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          canvas.width = resizeInfo.trgWidth;
          canvas.height = resizeInfo.trgHeight;

          if (orientation > 4) {
            canvas.width = resizeInfo.trgHeight;
            canvas.height = resizeInfo.trgWidth;
          }

          switch (orientation) {
            case 2:
              // horizontal flip
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              break;

            case 3:
              // 180° rotate left
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate(Math.PI);
              break;

            case 4:
              // vertical flip
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
              break;

            case 5:
              // vertical flip + 90 rotate right
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;

            case 6:
              // 90° rotate right
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -canvas.width);
              break;

            case 7:
              // horizontal flip + 90 rotate right
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(canvas.height, -canvas.width);
              ctx.scale(-1, 1);
              break;

            case 8:
              // 90° rotate left
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-canvas.height, 0);
              break;
          } // This is a bugfix for iOS' scaling bug.


          drawImageIOSFix(ctx, img, resizeInfo.srcX != null ? resizeInfo.srcX : 0, resizeInfo.srcY != null ? resizeInfo.srcY : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, resizeInfo.trgX != null ? resizeInfo.trgX : 0, resizeInfo.trgY != null ? resizeInfo.trgY : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
          var thumbnail = canvas.toDataURL("image/png");

          if (callback != null) {
            return callback(thumbnail, canvas);
          }
        });
      };

      if (callback != null) {
        img.onerror = callback;
      }

      return img.src = file.dataURL;
    } // Goes through the queue and processes files if there aren't too many already.

  }, {
    key: "processQueue",
    value: function processQueue() {
      var parallelUploads = this.options.parallelUploads;
      var processingLength = this.getUploadingFiles().length;
      var i = processingLength; // There are already at least as many files uploading than should be

      if (processingLength >= parallelUploads) {
        return;
      }

      var queuedFiles = this.getQueuedFiles();

      if (!(queuedFiles.length > 0)) {
        return;
      }

      if (this.options.uploadMultiple) {
        // The files should be uploaded in one request
        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
      } else {
        while (i < parallelUploads) {
          if (!queuedFiles.length) {
            return;
          } // Nothing left to process


          this.processFile(queuedFiles.shift());
          i++;
        }
      }
    } // Wrapper for `processFiles`

  }, {
    key: "processFile",
    value: function processFile(file) {
      return this.processFiles([file]);
    } // Loads the file, then calls finishedLoading()

  }, {
    key: "processFiles",
    value: function processFiles(files) {
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = files[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var file = _step18.value;
          file.processing = true; // Backwards compatibility

          file.status = Dropzone.UPLOADING;
          this.emit("processing", file);
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18["return"] != null) {
            _iterator18["return"]();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      if (this.options.uploadMultiple) {
        this.emit("processingmultiple", files);
      }

      return this.uploadFiles(files);
    }
  }, {
    key: "_getFilesWithXhr",
    value: function _getFilesWithXhr(xhr) {
      var files;
      return files = this.files.filter(function (file) {
        return file.xhr === xhr;
      }).map(function (file) {
        return file;
      });
    } // Cancels the file upload and sets the status to CANCELED
    // **if** the file is actually being uploaded.
    // If it's still in the queue, the file is being removed from it and the status
    // set to CANCELED.

  }, {
    key: "cancelUpload",
    value: function cancelUpload(file) {
      if (file.status === Dropzone.UPLOADING) {
        var groupedFiles = this._getFilesWithXhr(file.xhr);

        var _iteratorNormalCompletion19 = true;
        var _didIteratorError19 = false;
        var _iteratorError19 = undefined;

        try {
          for (var _iterator19 = groupedFiles[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var groupedFile = _step19.value;
            groupedFile.status = Dropzone.CANCELED;
          }
        } catch (err) {
          _didIteratorError19 = true;
          _iteratorError19 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion19 && _iterator19["return"] != null) {
              _iterator19["return"]();
            }
          } finally {
            if (_didIteratorError19) {
              throw _iteratorError19;
            }
          }
        }

        if (typeof file.xhr !== 'undefined') {
          file.xhr.abort();
        }

        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = groupedFiles[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var _groupedFile = _step20.value;
            this.emit("canceled", _groupedFile);
          }
        } catch (err) {
          _didIteratorError20 = true;
          _iteratorError20 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion20 && _iterator20["return"] != null) {
              _iterator20["return"]();
            }
          } finally {
            if (_didIteratorError20) {
              throw _iteratorError20;
            }
          }
        }

        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", groupedFiles);
        }
      } else if (file.status === Dropzone.ADDED || file.status === Dropzone.QUEUED) {
        file.status = Dropzone.CANCELED;
        this.emit("canceled", file);

        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", [file]);
        }
      }

      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    }
  }, {
    key: "resolveOption",
    value: function resolveOption(option) {
      if (typeof option === 'function') {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        return option.apply(this, args);
      }

      return option;
    }
  }, {
    key: "uploadFile",
    value: function uploadFile(file) {
      return this.uploadFiles([file]);
    }
  }, {
    key: "uploadFiles",
    value: function uploadFiles(files) {
      var _this15 = this;

      this._transformFiles(files, function (transformedFiles) {
        if (_this15.options.chunking) {
          // Chunking is not allowed to be used with `uploadMultiple` so we know
          // that there is only __one__file.
          var transformedFile = transformedFiles[0];
          files[0].upload.chunked = _this15.options.chunking && (_this15.options.forceChunking || transformedFile.size > _this15.options.chunkSize);
          files[0].upload.totalChunkCount = Math.ceil(transformedFile.size / _this15.options.chunkSize);
        }

        if (files[0].upload.chunked) {
          // This file should be sent in chunks!
          // If the chunking option is set, we **know** that there can only be **one** file, since
          // uploadMultiple is not allowed with this option.
          var file = files[0];
          var _transformedFile = transformedFiles[0];
          var startedChunkCount = 0;
          file.upload.chunks = [];

          var handleNextChunk = function handleNextChunk() {
            var chunkIndex = 0; // Find the next item in file.upload.chunks that is not defined yet.

            while (file.upload.chunks[chunkIndex] !== undefined) {
              chunkIndex++;
            } // This means, that all chunks have already been started.


            if (chunkIndex >= file.upload.totalChunkCount) return;
            startedChunkCount++;
            var start = chunkIndex * _this15.options.chunkSize;
            var end = Math.min(start + _this15.options.chunkSize, file.size);
            var dataBlock = {
              name: _this15._getParamName(0),
              data: _transformedFile.webkitSlice ? _transformedFile.webkitSlice(start, end) : _transformedFile.slice(start, end),
              filename: file.upload.filename,
              chunkIndex: chunkIndex
            };
            file.upload.chunks[chunkIndex] = {
              file: file,
              index: chunkIndex,
              dataBlock: dataBlock,
              // In case we want to retry.
              status: Dropzone.UPLOADING,
              progress: 0,
              retries: 0 // The number of times this block has been retried.

            };

            _this15._uploadData(files, [dataBlock]);
          };

          file.upload.finishedChunkUpload = function (chunk) {
            var allFinished = true;
            chunk.status = Dropzone.SUCCESS; // Clear the data from the chunk

            chunk.dataBlock = null; // Leaving this reference to xhr intact here will cause memory leaks in some browsers

            chunk.xhr = null;

            for (var i = 0; i < file.upload.totalChunkCount; i++) {
              if (file.upload.chunks[i] === undefined) {
                return handleNextChunk();
              }

              if (file.upload.chunks[i].status !== Dropzone.SUCCESS) {
                allFinished = false;
              }
            }

            if (allFinished) {
              _this15.options.chunksUploaded(file, function () {
                _this15._finished(files, '', null);
              });
            }
          };

          if (_this15.options.parallelChunkUploads) {
            for (var i = 0; i < file.upload.totalChunkCount; i++) {
              handleNextChunk();
            }
          } else {
            handleNextChunk();
          }
        } else {
          var dataBlocks = [];

          for (var _i3 = 0; _i3 < files.length; _i3++) {
            dataBlocks[_i3] = {
              name: _this15._getParamName(_i3),
              data: transformedFiles[_i3],
              filename: files[_i3].upload.filename
            };
          }

          _this15._uploadData(files, dataBlocks);
        }
      });
    } /// Returns the right chunk for given file and xhr

  }, {
    key: "_getChunk",
    value: function _getChunk(file, xhr) {
      for (var i = 0; i < file.upload.totalChunkCount; i++) {
        if (file.upload.chunks[i] !== undefined && file.upload.chunks[i].xhr === xhr) {
          return file.upload.chunks[i];
        }
      }
    } // This function actually uploads the file(s) to the server.
    // If dataBlocks contains the actual data to upload (meaning, that this could either be transformed
    // files, or individual chunks for chunked upload).

  }, {
    key: "_uploadData",
    value: function _uploadData(files, dataBlocks) {
      var _this16 = this;

      var xhr = new XMLHttpRequest(); // Put the xhr object in the file objects to be able to reference it later.

      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = files[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var file = _step21.value;
          file.xhr = xhr;
        }
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21["return"] != null) {
            _iterator21["return"]();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }

      if (files[0].upload.chunked) {
        // Put the xhr object in the right chunk object, so it can be associated later, and found with _getChunk
        files[0].upload.chunks[dataBlocks[0].chunkIndex].xhr = xhr;
      }

      var method = this.resolveOption(this.options.method, files);
      var url = this.resolveOption(this.options.url, files);
      xhr.open(method, url, true); // Setting the timeout after open because of IE11 issue: https://gitlab.com/meno/dropzone/issues/8

      xhr.timeout = this.resolveOption(this.options.timeout, files); // Has to be after `.open()`. See https://github.com/enyo/dropzone/issues/179

      xhr.withCredentials = !!this.options.withCredentials;

      xhr.onload = function (e) {
        _this16._finishedUploading(files, xhr, e);
      };

      xhr.ontimeout = function () {
        _this16._handleUploadError(files, xhr, "Request timedout after ".concat(_this16.options.timeout, " seconds"));
      };

      xhr.onerror = function () {
        _this16._handleUploadError(files, xhr);
      }; // Some browsers do not have the .upload property


      var progressObj = xhr.upload != null ? xhr.upload : xhr;

      progressObj.onprogress = function (e) {
        return _this16._updateFilesUploadProgress(files, xhr, e);
      };

      var headers = {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"
      };

      if (this.options.headers) {
        Dropzone.extend(headers, this.options.headers);
      }

      for (var headerName in headers) {
        var headerValue = headers[headerName];

        if (headerValue) {
          xhr.setRequestHeader(headerName, headerValue);
        }
      }

      var formData = new FormData(); // Adding all @options parameters

      if (this.options.params) {
        var additionalParams = this.options.params;

        if (typeof additionalParams === 'function') {
          additionalParams = additionalParams.call(this, files, xhr, files[0].upload.chunked ? this._getChunk(files[0], xhr) : null);
        }

        for (var key in additionalParams) {
          var value = additionalParams[key];
          formData.append(key, value);
        }
      } // Let the user add additional data if necessary


      var _iteratorNormalCompletion22 = true;
      var _didIteratorError22 = false;
      var _iteratorError22 = undefined;

      try {
        for (var _iterator22 = files[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
          var _file = _step22.value;
          this.emit("sending", _file, xhr, formData);
        }
      } catch (err) {
        _didIteratorError22 = true;
        _iteratorError22 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion22 && _iterator22["return"] != null) {
            _iterator22["return"]();
          }
        } finally {
          if (_didIteratorError22) {
            throw _iteratorError22;
          }
        }
      }

      if (this.options.uploadMultiple) {
        this.emit("sendingmultiple", files, xhr, formData);
      }

      this._addFormElementData(formData); // Finally add the files
      // Has to be last because some servers (eg: S3) expect the file to be the last parameter


      for (var i = 0; i < dataBlocks.length; i++) {
        var dataBlock = dataBlocks[i];
        formData.append(dataBlock.name, dataBlock.data, dataBlock.filename);
      }

      this.submitRequest(xhr, formData, files);
    } // Transforms all files with this.options.transformFile and invokes done with the transformed files when done.

  }, {
    key: "_transformFiles",
    value: function _transformFiles(files, done) {
      var _this17 = this;

      var transformedFiles = []; // Clumsy way of handling asynchronous calls, until I get to add a proper Future library.

      var doneCounter = 0;

      var _loop = function _loop(i) {
        _this17.options.transformFile.call(_this17, files[i], function (transformedFile) {
          transformedFiles[i] = transformedFile;

          if (++doneCounter === files.length) {
            done(transformedFiles);
          }
        });
      };

      for (var i = 0; i < files.length; i++) {
        _loop(i);
      }
    } // Takes care of adding other input elements of the form to the AJAX request

  }, {
    key: "_addFormElementData",
    value: function _addFormElementData(formData) {
      // Take care of other input elements
      if (this.element.tagName === "FORM") {
        var _iteratorNormalCompletion23 = true;
        var _didIteratorError23 = false;
        var _iteratorError23 = undefined;

        try {
          for (var _iterator23 = this.element.querySelectorAll("input, textarea, select, button")[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
            var input = _step23.value;
            var inputName = input.getAttribute("name");
            var inputType = input.getAttribute("type");
            if (inputType) inputType = inputType.toLowerCase(); // If the input doesn't have a name, we can't use it.

            if (typeof inputName === 'undefined' || inputName === null) continue;

            if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
              // Possibly multiple values
              var _iteratorNormalCompletion24 = true;
              var _didIteratorError24 = false;
              var _iteratorError24 = undefined;

              try {
                for (var _iterator24 = input.options[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                  var option = _step24.value;

                  if (option.selected) {
                    formData.append(inputName, option.value);
                  }
                }
              } catch (err) {
                _didIteratorError24 = true;
                _iteratorError24 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion24 && _iterator24["return"] != null) {
                    _iterator24["return"]();
                  }
                } finally {
                  if (_didIteratorError24) {
                    throw _iteratorError24;
                  }
                }
              }
            } else if (!inputType || inputType !== "checkbox" && inputType !== "radio" || input.checked) {
              formData.append(inputName, input.value);
            }
          }
        } catch (err) {
          _didIteratorError23 = true;
          _iteratorError23 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion23 && _iterator23["return"] != null) {
              _iterator23["return"]();
            }
          } finally {
            if (_didIteratorError23) {
              throw _iteratorError23;
            }
          }
        }
      }
    } // Invoked when there is new progress information about given files.
    // If e is not provided, it is assumed that the upload is finished.

  }, {
    key: "_updateFilesUploadProgress",
    value: function _updateFilesUploadProgress(files, xhr, e) {
      var progress;

      if (typeof e !== 'undefined') {
        progress = 100 * e.loaded / e.total;

        if (files[0].upload.chunked) {
          var file = files[0]; // Since this is a chunked upload, we need to update the appropriate chunk progress.

          var chunk = this._getChunk(file, xhr);

          chunk.progress = progress;
          chunk.total = e.total;
          chunk.bytesSent = e.loaded;
          var fileProgress = 0,
              fileTotal,
              fileBytesSent;
          file.upload.progress = 0;
          file.upload.total = 0;
          file.upload.bytesSent = 0;

          for (var i = 0; i < file.upload.totalChunkCount; i++) {
            if (file.upload.chunks[i] !== undefined && file.upload.chunks[i].progress !== undefined) {
              file.upload.progress += file.upload.chunks[i].progress;
              file.upload.total += file.upload.chunks[i].total;
              file.upload.bytesSent += file.upload.chunks[i].bytesSent;
            }
          }

          file.upload.progress = file.upload.progress / file.upload.totalChunkCount;
        } else {
          var _iteratorNormalCompletion25 = true;
          var _didIteratorError25 = false;
          var _iteratorError25 = undefined;

          try {
            for (var _iterator25 = files[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
              var _file2 = _step25.value;
              _file2.upload.progress = progress;
              _file2.upload.total = e.total;
              _file2.upload.bytesSent = e.loaded;
            }
          } catch (err) {
            _didIteratorError25 = true;
            _iteratorError25 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion25 && _iterator25["return"] != null) {
                _iterator25["return"]();
              }
            } finally {
              if (_didIteratorError25) {
                throw _iteratorError25;
              }
            }
          }
        }

        var _iteratorNormalCompletion26 = true;
        var _didIteratorError26 = false;
        var _iteratorError26 = undefined;

        try {
          for (var _iterator26 = files[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
            var _file3 = _step26.value;
            this.emit("uploadprogress", _file3, _file3.upload.progress, _file3.upload.bytesSent);
          }
        } catch (err) {
          _didIteratorError26 = true;
          _iteratorError26 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion26 && _iterator26["return"] != null) {
              _iterator26["return"]();
            }
          } finally {
            if (_didIteratorError26) {
              throw _iteratorError26;
            }
          }
        }
      } else {
        // Called when the file finished uploading
        var allFilesFinished = true;
        progress = 100;
        var _iteratorNormalCompletion27 = true;
        var _didIteratorError27 = false;
        var _iteratorError27 = undefined;

        try {
          for (var _iterator27 = files[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
            var _file4 = _step27.value;

            if (_file4.upload.progress !== 100 || _file4.upload.bytesSent !== _file4.upload.total) {
              allFilesFinished = false;
            }

            _file4.upload.progress = progress;
            _file4.upload.bytesSent = _file4.upload.total;
          } // Nothing to do, all files already at 100%

        } catch (err) {
          _didIteratorError27 = true;
          _iteratorError27 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion27 && _iterator27["return"] != null) {
              _iterator27["return"]();
            }
          } finally {
            if (_didIteratorError27) {
              throw _iteratorError27;
            }
          }
        }

        if (allFilesFinished) {
          return;
        }

        var _iteratorNormalCompletion28 = true;
        var _didIteratorError28 = false;
        var _iteratorError28 = undefined;

        try {
          for (var _iterator28 = files[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
            var _file5 = _step28.value;
            this.emit("uploadprogress", _file5, progress, _file5.upload.bytesSent);
          }
        } catch (err) {
          _didIteratorError28 = true;
          _iteratorError28 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion28 && _iterator28["return"] != null) {
              _iterator28["return"]();
            }
          } finally {
            if (_didIteratorError28) {
              throw _iteratorError28;
            }
          }
        }
      }
    }
  }, {
    key: "_finishedUploading",
    value: function _finishedUploading(files, xhr, e) {
      var response;

      if (files[0].status === Dropzone.CANCELED) {
        return;
      }

      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.responseType !== 'arraybuffer' && xhr.responseType !== 'blob') {
        response = xhr.responseText;

        if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
          try {
            response = JSON.parse(response);
          } catch (error) {
            e = error;
            response = "Invalid JSON response from server.";
          }
        }
      }

      this._updateFilesUploadProgress(files);

      if (!(200 <= xhr.status && xhr.status < 300)) {
        this._handleUploadError(files, xhr, response);
      } else {
        if (files[0].upload.chunked) {
          files[0].upload.finishedChunkUpload(this._getChunk(files[0], xhr));
        } else {
          this._finished(files, response, e);
        }
      }
    }
  }, {
    key: "_handleUploadError",
    value: function _handleUploadError(files, xhr, response) {
      if (files[0].status === Dropzone.CANCELED) {
        return;
      }

      if (files[0].upload.chunked && this.options.retryChunks) {
        var chunk = this._getChunk(files[0], xhr);

        if (chunk.retries++ < this.options.retryChunksLimit) {
          this._uploadData(files, [chunk.dataBlock]);

          return;
        } else {
          console.warn('Retried this chunk too often. Giving up.');
        }
      }

      this._errorProcessing(files, response || this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr);
    }
  }, {
    key: "submitRequest",
    value: function submitRequest(xhr, formData, files) {
      xhr.send(formData);
    } // Called internally when processing is finished.
    // Individual callbacks have to be called in the appropriate sections.

  }, {
    key: "_finished",
    value: function _finished(files, responseText, e) {
      var _iteratorNormalCompletion29 = true;
      var _didIteratorError29 = false;
      var _iteratorError29 = undefined;

      try {
        for (var _iterator29 = files[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
          var file = _step29.value;
          file.status = Dropzone.SUCCESS;
          this.emit("success", file, responseText, e);
          this.emit("complete", file);
        }
      } catch (err) {
        _didIteratorError29 = true;
        _iteratorError29 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion29 && _iterator29["return"] != null) {
            _iterator29["return"]();
          }
        } finally {
          if (_didIteratorError29) {
            throw _iteratorError29;
          }
        }
      }

      if (this.options.uploadMultiple) {
        this.emit("successmultiple", files, responseText, e);
        this.emit("completemultiple", files);
      }

      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    } // Called internally when processing is finished.
    // Individual callbacks have to be called in the appropriate sections.

  }, {
    key: "_errorProcessing",
    value: function _errorProcessing(files, message, xhr) {
      var _iteratorNormalCompletion30 = true;
      var _didIteratorError30 = false;
      var _iteratorError30 = undefined;

      try {
        for (var _iterator30 = files[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
          var file = _step30.value;
          file.status = Dropzone.ERROR;
          this.emit("error", file, message, xhr);
          this.emit("complete", file);
        }
      } catch (err) {
        _didIteratorError30 = true;
        _iteratorError30 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion30 && _iterator30["return"] != null) {
            _iterator30["return"]();
          }
        } finally {
          if (_didIteratorError30) {
            throw _iteratorError30;
          }
        }
      }

      if (this.options.uploadMultiple) {
        this.emit("errormultiple", files, message, xhr);
        this.emit("completemultiple", files);
      }

      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    }
  }], [{
    key: "uuidv4",
    value: function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }]);

  return Dropzone;
}(Emitter);

Dropzone.initClass();
Dropzone.version = "5.7.0"; // This is a map of options for your different dropzones. Add configurations
// to this object for your different dropzone elemens.
//
// Example:
//
//     Dropzone.options.myDropzoneElementId = { maxFilesize: 1 };
//
// To disable autoDiscover for a specific element, you can set `false` as an option:
//
//     Dropzone.options.myDisabledElementId = false;
//
// And in html:
//
//     <form action="/upload" id="my-dropzone-element-id" class="dropzone"></form>

Dropzone.options = {}; // Returns the options for an element or undefined if none available.

Dropzone.optionsForElement = function (element) {
  // Get the `Dropzone.options.elementId` for this element if it exists
  if (element.getAttribute("id")) {
    return Dropzone.options[camelize(element.getAttribute("id"))];
  } else {
    return undefined;
  }
}; // Holds a list of all dropzone instances


Dropzone.instances = []; // Returns the dropzone for given element if any

Dropzone.forElement = function (element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  if ((element != null ? element.dropzone : undefined) == null) {
    throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
  }

  return element.dropzone;
}; // Set to false if you don't want Dropzone to automatically find and attach to .dropzone elements.


Dropzone.autoDiscover = true; // Looks for all .dropzone elements and creates a dropzone for them

Dropzone.discover = function () {
  var dropzones;

  if (document.querySelectorAll) {
    dropzones = document.querySelectorAll(".dropzone");
  } else {
    dropzones = []; // IE :(

    var checkElements = function checkElements(elements) {
      return function () {
        var result = [];
        var _iteratorNormalCompletion31 = true;
        var _didIteratorError31 = false;
        var _iteratorError31 = undefined;

        try {
          for (var _iterator31 = elements[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
            var el = _step31.value;

            if (/(^| )dropzone($| )/.test(el.className)) {
              result.push(dropzones.push(el));
            } else {
              result.push(undefined);
            }
          }
        } catch (err) {
          _didIteratorError31 = true;
          _iteratorError31 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion31 && _iterator31["return"] != null) {
              _iterator31["return"]();
            }
          } finally {
            if (_didIteratorError31) {
              throw _iteratorError31;
            }
          }
        }

        return result;
      }();
    };

    checkElements(document.getElementsByTagName("div"));
    checkElements(document.getElementsByTagName("form"));
  }

  return function () {
    var result = [];
    var _iteratorNormalCompletion32 = true;
    var _didIteratorError32 = false;
    var _iteratorError32 = undefined;

    try {
      for (var _iterator32 = dropzones[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
        var dropzone = _step32.value;

        // Create a dropzone unless auto discover has been disabled for specific element
        if (Dropzone.optionsForElement(dropzone) !== false) {
          result.push(new Dropzone(dropzone));
        } else {
          result.push(undefined);
        }
      }
    } catch (err) {
      _didIteratorError32 = true;
      _iteratorError32 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion32 && _iterator32["return"] != null) {
          _iterator32["return"]();
        }
      } finally {
        if (_didIteratorError32) {
          throw _iteratorError32;
        }
      }
    }

    return result;
  }();
}; // Since the whole Drag'n'Drop API is pretty new, some browsers implement it,
// but not correctly.
// So I created a blacklist of userAgents. Yes, yes. Browser sniffing, I know.
// But what to do when browsers *theoretically* support an API, but crash
// when using it.
//
// This is a list of regular expressions tested against navigator.userAgent
//
// ** It should only be used on browser that *do* support the API, but
// incorrectly **
//


Dropzone.blacklistedBrowsers = [// The mac os and windows phone version of opera 12 seems to have a problem with the File drag'n'drop API.
/opera.*(Macintosh|Windows Phone).*version\/12/i]; // Checks if the browser is supported

Dropzone.isBrowserSupported = function () {
  var capableBrowser = true;

  if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
    if (!("classList" in document.createElement("a"))) {
      capableBrowser = false;
    } else {
      // The browser supports the API, but may be blacklisted.
      var _iteratorNormalCompletion33 = true;
      var _didIteratorError33 = false;
      var _iteratorError33 = undefined;

      try {
        for (var _iterator33 = Dropzone.blacklistedBrowsers[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
          var regex = _step33.value;

          if (regex.test(navigator.userAgent)) {
            capableBrowser = false;
            continue;
          }
        }
      } catch (err) {
        _didIteratorError33 = true;
        _iteratorError33 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion33 && _iterator33["return"] != null) {
            _iterator33["return"]();
          }
        } finally {
          if (_didIteratorError33) {
            throw _iteratorError33;
          }
        }
      }
    }
  } else {
    capableBrowser = false;
  }

  return capableBrowser;
};

Dropzone.dataURItoBlob = function (dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]); // separate out the mime component

  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]; // write the bytes of the string to an ArrayBuffer

  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0, end = byteString.length, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
    ia[i] = byteString.charCodeAt(i);
  } // write the ArrayBuffer to a blob


  return new Blob([ab], {
    type: mimeString
  });
}; // Returns an array without the rejected item


var without = function without(list, rejectedItem) {
  return list.filter(function (item) {
    return item !== rejectedItem;
  }).map(function (item) {
    return item;
  });
}; // abc-def_ghi -> abcDefGhi


var camelize = function camelize(str) {
  return str.replace(/[\-_](\w)/g, function (match) {
    return match.charAt(1).toUpperCase();
  });
}; // Creates an element from string


Dropzone.createElement = function (string) {
  var div = document.createElement("div");
  div.innerHTML = string;
  return div.childNodes[0];
}; // Tests if given element is inside (or simply is) the container


Dropzone.elementInside = function (element, container) {
  if (element === container) {
    return true;
  } // Coffeescript doesn't support do/while loops


  while (element = element.parentNode) {
    if (element === container) {
      return true;
    }
  }

  return false;
};

Dropzone.getElement = function (el, name) {
  var element;

  if (typeof el === "string") {
    element = document.querySelector(el);
  } else if (el.nodeType != null) {
    element = el;
  }

  if (element == null) {
    throw new Error("Invalid `".concat(name, "` option provided. Please provide a CSS selector or a plain HTML element."));
  }

  return element;
};

Dropzone.getElements = function (els, name) {
  var el, elements;

  if (els instanceof Array) {
    elements = [];

    try {
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = els[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          el = _step34.value;
          elements.push(this.getElement(el, name));
        }
      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34["return"] != null) {
            _iterator34["return"]();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }
    } catch (e) {
      elements = null;
    }
  } else if (typeof els === "string") {
    elements = [];
    var _iteratorNormalCompletion35 = true;
    var _didIteratorError35 = false;
    var _iteratorError35 = undefined;

    try {
      for (var _iterator35 = document.querySelectorAll(els)[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
        el = _step35.value;
        elements.push(el);
      }
    } catch (err) {
      _didIteratorError35 = true;
      _iteratorError35 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion35 && _iterator35["return"] != null) {
          _iterator35["return"]();
        }
      } finally {
        if (_didIteratorError35) {
          throw _iteratorError35;
        }
      }
    }
  } else if (els.nodeType != null) {
    elements = [els];
  }

  if (elements == null || !elements.length) {
    throw new Error("Invalid `".concat(name, "` option provided. Please provide a CSS selector, a plain HTML element or a list of those."));
  }

  return elements;
}; // Asks the user the question and calls accepted or rejected accordingly
//
// The default implementation just uses `window.confirm` and then calls the
// appropriate callback.


Dropzone.confirm = function (question, accepted, rejected) {
  if (window.confirm(question)) {
    return accepted();
  } else if (rejected != null) {
    return rejected();
  }
}; // Validates the mime type like this:
//
// https://developer.mozilla.org/en-US/docs/HTML/Element/input#attr-accept


Dropzone.isValidFile = function (file, acceptedFiles) {
  if (!acceptedFiles) {
    return true;
  } // If there are no accepted mime types, it's OK


  acceptedFiles = acceptedFiles.split(",");
  var mimeType = file.type;
  var baseMimeType = mimeType.replace(/\/.*$/, "");
  var _iteratorNormalCompletion36 = true;
  var _didIteratorError36 = false;
  var _iteratorError36 = undefined;

  try {
    for (var _iterator36 = acceptedFiles[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
      var validType = _step36.value;
      validType = validType.trim();

      if (validType.charAt(0) === ".") {
        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
          return true;
        }
      } else if (/\/\*$/.test(validType)) {
        // This is something like a image/* mime type
        if (baseMimeType === validType.replace(/\/.*$/, "")) {
          return true;
        }
      } else {
        if (mimeType === validType) {
          return true;
        }
      }
    }
  } catch (err) {
    _didIteratorError36 = true;
    _iteratorError36 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion36 && _iterator36["return"] != null) {
        _iterator36["return"]();
      }
    } finally {
      if (_didIteratorError36) {
        throw _iteratorError36;
      }
    }
  }

  return false;
}; // Augment jQuery


if (typeof jQuery !== 'undefined' && jQuery !== null) {
  jQuery.fn.dropzone = function (options) {
    return this.each(function () {
      return new Dropzone(this, options);
    });
  };
}

if ( true && module !== null) {
  module.exports = Dropzone;
} else {
  window.Dropzone = Dropzone;
} // Dropzone file status codes


Dropzone.ADDED = "added";
Dropzone.QUEUED = "queued"; // For backwards compatibility. Now, if a file is accepted, it's either queued
// or uploading.

Dropzone.ACCEPTED = Dropzone.QUEUED;
Dropzone.UPLOADING = "uploading";
Dropzone.PROCESSING = Dropzone.UPLOADING; // alias

Dropzone.CANCELED = "canceled";
Dropzone.ERROR = "error";
Dropzone.SUCCESS = "success";
/*

 Bugfix for iOS 6 and 7
 Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
 based on the work of https://github.com/stomita/ios-imagefile-megapixel

 */
// Detecting vertical squash in loaded image.
// Fixes a bug which squash image vertically while drawing into canvas for some images.
// This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel

var detectVerticalSquash = function detectVerticalSquash(img) {
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;
  var canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = ih;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  var _ctx$getImageData = ctx.getImageData(1, 0, 1, ih),
      data = _ctx$getImageData.data; // search image edge pixel position in case it is squashed vertically.


  var sy = 0;
  var ey = ih;
  var py = ih;

  while (py > sy) {
    var alpha = data[(py - 1) * 4 + 3];

    if (alpha === 0) {
      ey = py;
    } else {
      sy = py;
    }

    py = ey + sy >> 1;
  }

  var ratio = py / ih;

  if (ratio === 0) {
    return 1;
  } else {
    return ratio;
  }
}; // A replacement for context.drawImage
// (args are for source and destination).


var drawImageIOSFix = function drawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  var vertSquashRatio = detectVerticalSquash(img);
  return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
}; // Based on MinifyJpeg
// Source: http://www.perry.cz/files/ExifRestorer.js
// http://elicon.blog57.fc2.com/blog-entry-206.html


var ExifRestore =
/*#__PURE__*/
function () {
  function ExifRestore() {
    _classCallCheck(this, ExifRestore);
  }

  _createClass(ExifRestore, null, [{
    key: "initClass",
    value: function initClass() {
      this.KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    }
  }, {
    key: "encode64",
    value: function encode64(input) {
      var output = '';
      var chr1 = undefined;
      var chr2 = undefined;
      var chr3 = '';
      var enc1 = undefined;
      var enc2 = undefined;
      var enc3 = undefined;
      var enc4 = '';
      var i = 0;

      while (true) {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output + this.KEY_STR.charAt(enc1) + this.KEY_STR.charAt(enc2) + this.KEY_STR.charAt(enc3) + this.KEY_STR.charAt(enc4);
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';

        if (!(i < input.length)) {
          break;
        }
      }

      return output;
    }
  }, {
    key: "restore",
    value: function restore(origFileBase64, resizedFileBase64) {
      if (!origFileBase64.match('data:image/jpeg;base64,')) {
        return resizedFileBase64;
      }

      var rawImage = this.decode64(origFileBase64.replace('data:image/jpeg;base64,', ''));
      var segments = this.slice2Segments(rawImage);
      var image = this.exifManipulation(resizedFileBase64, segments);
      return "data:image/jpeg;base64,".concat(this.encode64(image));
    }
  }, {
    key: "exifManipulation",
    value: function exifManipulation(resizedFileBase64, segments) {
      var exifArray = this.getExifArray(segments);
      var newImageArray = this.insertExif(resizedFileBase64, exifArray);
      var aBuffer = new Uint8Array(newImageArray);
      return aBuffer;
    }
  }, {
    key: "getExifArray",
    value: function getExifArray(segments) {
      var seg = undefined;
      var x = 0;

      while (x < segments.length) {
        seg = segments[x];

        if (seg[0] === 255 & seg[1] === 225) {
          return seg;
        }

        x++;
      }

      return [];
    }
  }, {
    key: "insertExif",
    value: function insertExif(resizedFileBase64, exifArray) {
      var imageData = resizedFileBase64.replace('data:image/jpeg;base64,', '');
      var buf = this.decode64(imageData);
      var separatePoint = buf.indexOf(255, 3);
      var mae = buf.slice(0, separatePoint);
      var ato = buf.slice(separatePoint);
      var array = mae;
      array = array.concat(exifArray);
      array = array.concat(ato);
      return array;
    }
  }, {
    key: "slice2Segments",
    value: function slice2Segments(rawImageArray) {
      var head = 0;
      var segments = [];

      while (true) {
        var length;

        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 218) {
          break;
        }

        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 216) {
          head += 2;
        } else {
          length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3];
          var endPoint = head + length + 2;
          var seg = rawImageArray.slice(head, endPoint);
          segments.push(seg);
          head = endPoint;
        }

        if (head > rawImageArray.length) {
          break;
        }
      }

      return segments;
    }
  }, {
    key: "decode64",
    value: function decode64(input) {
      var output = '';
      var chr1 = undefined;
      var chr2 = undefined;
      var chr3 = '';
      var enc1 = undefined;
      var enc2 = undefined;
      var enc3 = undefined;
      var enc4 = '';
      var i = 0;
      var buf = []; // remove all characters that are not A-Z, a-z, 0-9, +, /, or =

      var base64test = /[^A-Za-z0-9\+\/\=]/g;

      if (base64test.exec(input)) {
        console.warn('There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\nExpect errors in decoding.');
      }

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      while (true) {
        enc1 = this.KEY_STR.indexOf(input.charAt(i++));
        enc2 = this.KEY_STR.indexOf(input.charAt(i++));
        enc3 = this.KEY_STR.indexOf(input.charAt(i++));
        enc4 = this.KEY_STR.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        buf.push(chr1);

        if (enc3 !== 64) {
          buf.push(chr2);
        }

        if (enc4 !== 64) {
          buf.push(chr3);
        }

        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';

        if (!(i < input.length)) {
          break;
        }
      }

      return buf;
    }
  }]);

  return ExifRestore;
}();

ExifRestore.initClass();
/*
 * contentloaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 * Updated: 20101020
 * License: MIT
 * Version: 1.2
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 */
// @win window reference
// @fn function reference

var contentLoaded = function contentLoaded(win, fn) {
  var done = false;
  var top = true;
  var doc = win.document;
  var root = doc.documentElement;
  var add = doc.addEventListener ? "addEventListener" : "attachEvent";
  var rem = doc.addEventListener ? "removeEventListener" : "detachEvent";
  var pre = doc.addEventListener ? "" : "on";

  var init = function init(e) {
    if (e.type === "readystatechange" && doc.readyState !== "complete") {
      return;
    }

    (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);

    if (!done && (done = true)) {
      return fn.call(win, e.type || e);
    }
  };

  var poll = function poll() {
    try {
      root.doScroll("left");
    } catch (e) {
      setTimeout(poll, 50);
      return;
    }

    return init("poll");
  };

  if (doc.readyState !== "complete") {
    if (doc.createEventObject && root.doScroll) {
      try {
        top = !win.frameElement;
      } catch (error) {}

      if (top) {
        poll();
      }
    }

    doc[add](pre + "DOMContentLoaded", init, false);
    doc[add](pre + "readystatechange", init, false);
    return win[add](pre + "load", init, false);
  }
}; // As a single function to be able to write tests.


Dropzone._autoDiscoverFunction = function () {
  if (Dropzone.autoDiscover) {
    return Dropzone.discover();
  }
};

contentLoaded(window, Dropzone._autoDiscoverFunction);

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYWR2YW5jZS1zdHJpbmctaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlZ2V4cC1leGVjLWFic3RyYWN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWdleHAtZXhlYy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVnZXhwLXN0aWNreS1oZWxwZXJzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucmVnZXhwLmV4ZWMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5zdHJpbmcucmVwbGFjZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZHJvcHpvbmUvZGlzdC9kcm9wem9uZS5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiLGFBQWEsbUJBQU8sQ0FBQywyRkFBK0I7O0FBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNQYTtBQUNiO0FBQ0EsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDbkMsZUFBZSxtQkFBTyxDQUFDLDJFQUF1QjtBQUM5QyxZQUFZLG1CQUFPLENBQUMscUVBQW9CO0FBQ3hDLHNCQUFzQixtQkFBTyxDQUFDLDZGQUFnQztBQUM5RCxpQkFBaUIsbUJBQU8sQ0FBQyxpRkFBMEI7QUFDbkQsa0NBQWtDLG1CQUFPLENBQUMsdUhBQTZDOztBQUV2Rjs7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QUFFSDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxFQUFFO0FBQy9DOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxzQ0FBc0M7QUFDbkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLFVBQVUsU0FBUyxhQUFhO0FBQzlDO0FBQ0EsNENBQTRDLFVBQVUsc0JBQXNCLGFBQWE7O0FBRXpGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLFlBQVk7QUFDMUI7QUFDQSxvREFBb0QsWUFBWTs7QUFFaEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUF5QixVQUFVO0FBQ25DO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNHQUFzRyxtRUFBbUU7QUFDeks7O0FBRUE7QUFDQTtBQUNBLCtDQUErQzs7QUFFL0M7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsV0FBVztBQUNYO0FBQ0EsV0FBVzs7O0FBR1g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdURBQXVEOztBQUV2RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNIQUFzSCxtRUFBbUU7QUFDekw7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzSEFBc0gsbUVBQW1FO0FBQ3pMO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0R0FBNEc7QUFDNUc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdIQUF3SCxtRUFBbUU7QUFDM0w7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJIQUEySCxtRUFBbUU7QUFDOUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOEhBQThILG1FQUFtRTtBQUNqTTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Qsa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdJQUFnSSxtRUFBbUU7QUFDbk07QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSw4REFBOEQ7QUFDOUQ7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Qsc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCx3REFBd0Q7QUFDeEQsd0RBQXdEO0FBQ3hELHNEQUFzRDtBQUN0RCxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMLEdBQUc7QUFDSDtBQUNBO0FBQ0EsbUdBQW1HLGVBQWU7QUFDbEg7QUFDQTs7QUFFQSwwQ0FBMEMsc0JBQXNCO0FBQ2hFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQXVCOztBQUV2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjs7QUFFckI7QUFDQTtBQUNBLEtBQUs7OztBQUdMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7O0FBR0wsMkRBQTJEOztBQUUzRDtBQUNBO0FBQ0Esc0NBQXNDLHNFQUFzRSxFQUFFOztBQUU5RztBQUNBO0FBQ0EsS0FBSzs7O0FBR0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7OztBQUdMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7OztBQUdMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7O0FBR0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsR0FBRzs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUEsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVc7QUFDWDs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUVBQXVFLG1FQUFtRTtBQUMxSTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0E7O0FBRUEscUVBQXFFO0FBQ3JFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUVBQXVFLHNFQUFzRTtBQUM3STtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTyxFQUFFOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBUTs7O0FBR1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0M7O0FBRS9DOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtRkFBbUYsc0VBQXNFO0FBQ3pKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMOztBQUVBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0VBQXNFLHNFQUFzRTtBQUM1STs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwrQ0FBK0MsbUJBQW1CO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLOztBQUVMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLOztBQUVMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7O0FBRUE7O0FBRUEscUJBQXFCLGlDQUFpQztBQUN0RDtBQUNBLE9BQU87OztBQUdQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUVBQWlFLHNFQUFzRTtBQUN2STtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRSxzRUFBc0U7QUFDekk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUVBQXlFLHNFQUFzRTtBQUMvSTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTs7QUFFQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0Esb0RBQW9ELFVBQVUsMERBQTBELGFBQWE7QUFDckksT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQLDBEQUEwRCxVQUFVO0FBQ3BFO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlEQUFpRDs7QUFFakQsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQSxXQUFXOztBQUVYOztBQUVBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpRUFBaUUsc0VBQXNFO0FBQ3ZJO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEI7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTLEtBQUs7QUFDZDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOEVBQThFLHNFQUFzRTtBQUNwSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLHlDQUF5Qzs7QUFFekM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7O0FBR1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0I7O0FBRS9CO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLFdBQVc7OztBQUdYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlFQUFpRSxzRUFBc0U7QUFDdkk7QUFDQSxpQ0FBaUM7O0FBRWpDO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwRUFBMEUsc0VBQXNFO0FBQ2hKO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBFQUEwRSxzRUFBc0U7QUFDaEo7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxrR0FBa0csZUFBZTtBQUNqSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsK0JBQStCOztBQUUvQjtBQUNBO0FBQ0EsYUFBYTs7O0FBR2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUMsbUNBQW1DOztBQUVuQzs7QUFFQSwyQkFBMkIsaUNBQWlDO0FBQzVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTs7QUFFQTtBQUNBLDJCQUEyQixpQ0FBaUM7QUFDNUQ7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBLDJCQUEyQixvQkFBb0I7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBLHFCQUFxQixpQ0FBaUM7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBLHFDQUFxQzs7QUFFckM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUVBQWlFLHNFQUFzRTtBQUN2STtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0M7O0FBRWxDLG9FQUFvRTs7QUFFcEU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTs7O0FBR1I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0NBQW9DOztBQUVwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87OztBQUdQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlFQUFpRSxzRUFBc0U7QUFDdkk7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEseUNBQXlDO0FBQ3pDOzs7QUFHQSxxQkFBcUIsdUJBQXVCO0FBQzVDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUwsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBZ0M7O0FBRWhDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUEscUJBQXFCLGtCQUFrQjtBQUN2QztBQUNBO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4SEFBOEgsc0VBQXNFO0FBQ3BNO0FBQ0E7QUFDQTtBQUNBLCtEQUErRDs7QUFFL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlGQUFpRixzRUFBc0U7QUFDdko7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw4QkFBOEI7O0FBRTlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUIsaUNBQWlDO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxRUFBcUUsc0VBQXNFO0FBQzNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUVBQW1FLHNFQUFzRTtBQUN6STtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRSxzRUFBc0U7QUFDekk7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXOztBQUVYLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRSxzRUFBc0U7QUFDekk7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBLHlGQUF5RixZQUFZO0FBQ3JHO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlFQUFpRSxzRUFBc0U7QUFDdkk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUVBQWlFLHNFQUFzRTtBQUN2STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxHQUFHOztBQUVIO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNCQUFzQjs7QUFFdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUU7OztBQUdGLHdCQUF3Qjs7QUFFeEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBRTs7O0FBR0YsNkJBQTZCOztBQUU3QjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsbUJBQW1COztBQUVuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzRUFBc0Usc0VBQXNFO0FBQzVJOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRSxzRUFBc0U7QUFDekk7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0gsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBLGtEQUFrRDs7QUFFbEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3RkFBd0Ysc0VBQXNFO0FBQzlKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQzs7QUFFL0MsK0RBQStELE1BQU07O0FBRXJFO0FBQ0E7O0FBRUEsMERBQTBELDJCQUEyQjtBQUNyRjtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsRUFBRTs7O0FBR0Y7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNILEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrREFBK0Qsc0VBQXNFO0FBQ3JJO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdGQUF3RixzRUFBc0U7QUFDOUo7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFFQUFxRSxzRUFBc0U7QUFDM0k7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUEsSUFBSSxLQUE2QjtBQUNqQztBQUNBLENBQUM7QUFDRDtBQUNBLENBQUM7OztBQUdEO0FBQ0EsMkJBQTJCO0FBQzNCOztBQUVBO0FBQ0E7QUFDQSx5Q0FBeUM7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0NBQW9DOzs7QUFHcEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsRUFBRTtBQUNGOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsaURBQWlEO0FBQ2pEO0FBQ0E7O0FBRUEsMkVBQTJFO0FBQzNFO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7QUFFbkI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNydkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJ2ZW5kb3JzfnByb2ZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgY2hhckF0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUnKS5jaGFyQXQ7XG5cbi8vIGBBZHZhbmNlU3RyaW5nSW5kZXhgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYWR2YW5jZXN0cmluZ2luZGV4XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChTLCBpbmRleCwgdW5pY29kZSkge1xuICByZXR1cm4gaW5kZXggKyAodW5pY29kZSA/IGNoYXJBdChTLCBpbmRleCkubGVuZ3RoIDogMSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gVE9ETzogUmVtb3ZlIGZyb20gYGNvcmUtanNANGAgc2luY2UgaXQncyBtb3ZlZCB0byBlbnRyeSBwb2ludHNcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXMucmVnZXhwLmV4ZWMnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWdleHAtZXhlYycpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxudmFyIFJFUExBQ0VfU1VQUE9SVFNfTkFNRURfR1JPVVBTID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gI3JlcGxhY2UgbmVlZHMgYnVpbHQtaW4gc3VwcG9ydCBmb3IgbmFtZWQgZ3JvdXBzLlxuICAvLyAjbWF0Y2ggd29ya3MgZmluZSBiZWNhdXNlIGl0IGp1c3QgcmV0dXJuIHRoZSBleGVjIHJlc3VsdHMsIGV2ZW4gaWYgaXQgaGFzXG4gIC8vIGEgXCJncm9wc1wiIHByb3BlcnR5LlxuICB2YXIgcmUgPSAvLi87XG4gIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHJlc3VsdC5ncm91cHMgPSB7IGE6ICc3JyB9O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHJldHVybiAnJy5yZXBsYWNlKHJlLCAnJDxhPicpICE9PSAnNyc7XG59KTtcblxuLy8gSUUgPD0gMTEgcmVwbGFjZXMgJDAgd2l0aCB0aGUgd2hvbGUgbWF0Y2gsIGFzIGlmIGl0IHdhcyAkJlxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjAyNDY2Ni9nZXR0aW5nLWllLXRvLXJlcGxhY2UtYS1yZWdleC13aXRoLXRoZS1saXRlcmFsLXN0cmluZy0wXG52YXIgUkVQTEFDRV9LRUVQU18kMCA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnYScucmVwbGFjZSgvLi8sICckMCcpID09PSAnJDAnO1xufSkoKTtcblxudmFyIFJFUExBQ0UgPSB3ZWxsS25vd25TeW1ib2woJ3JlcGxhY2UnKTtcbi8vIFNhZmFyaSA8PSAxMy4wLjMoPykgc3Vic3RpdHV0ZXMgbnRoIGNhcHR1cmUgd2hlcmUgbj5tIHdpdGggYW4gZW1wdHkgc3RyaW5nXG52YXIgUkVHRVhQX1JFUExBQ0VfU1VCU1RJVFVURVNfVU5ERUZJTkVEX0NBUFRVUkUgPSAoZnVuY3Rpb24gKCkge1xuICBpZiAoLy4vW1JFUExBQ0VdKSB7XG4gICAgcmV0dXJuIC8uL1tSRVBMQUNFXSgnYScsICckMCcpID09PSAnJztcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KSgpO1xuXG4vLyBDaHJvbWUgNTEgaGFzIGEgYnVnZ3kgXCJzcGxpdFwiIGltcGxlbWVudGF0aW9uIHdoZW4gUmVnRXhwI2V4ZWMgIT09IG5hdGl2ZUV4ZWNcbi8vIFdlZXggSlMgaGFzIGZyb3plbiBidWlsdC1pbiBwcm90b3R5cGVzLCBzbyB1c2UgdHJ5IC8gY2F0Y2ggd3JhcHBlclxudmFyIFNQTElUX1dPUktTX1dJVEhfT1ZFUldSSVRURU5fRVhFQyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciByZSA9IC8oPzopLztcbiAgdmFyIG9yaWdpbmFsRXhlYyA9IHJlLmV4ZWM7XG4gIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBvcmlnaW5hbEV4ZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgdmFyIHJlc3VsdCA9ICdhYicuc3BsaXQocmUpO1xuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCAhPT0gMiB8fCByZXN1bHRbMF0gIT09ICdhJyB8fCByZXN1bHRbMV0gIT09ICdiJztcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChLRVksIGxlbmd0aCwgZXhlYywgc2hhbSkge1xuICB2YXIgU1lNQk9MID0gd2VsbEtub3duU3ltYm9sKEtFWSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19TWU1CT0wgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0cmluZyBtZXRob2RzIGNhbGwgc3ltYm9sLW5hbWVkIFJlZ0VwIG1ldGhvZHNcbiAgICB2YXIgTyA9IHt9O1xuICAgIE9bU1lNQk9MXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH07XG4gICAgcmV0dXJuICcnW0tFWV0oTykgIT0gNztcbiAgfSk7XG5cbiAgdmFyIERFTEVHQVRFU19UT19FWEVDID0gREVMRUdBVEVTX1RPX1NZTUJPTCAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIFN5bWJvbC1uYW1lZCBSZWdFeHAgbWV0aG9kcyBjYWxsIC5leGVjXG4gICAgdmFyIGV4ZWNDYWxsZWQgPSBmYWxzZTtcbiAgICB2YXIgcmUgPSAvYS87XG5cbiAgICBpZiAoS0VZID09PSAnc3BsaXQnKSB7XG4gICAgICAvLyBXZSBjYW4ndCB1c2UgcmVhbCByZWdleCBoZXJlIHNpbmNlIGl0IGNhdXNlcyBkZW9wdGltaXphdGlvblxuICAgICAgLy8gYW5kIHNlcmlvdXMgcGVyZm9ybWFuY2UgZGVncmFkYXRpb24gaW4gVjhcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8zMDZcbiAgICAgIHJlID0ge307XG4gICAgICAvLyBSZWdFeHBbQEBzcGxpdF0gZG9lc24ndCBjYWxsIHRoZSByZWdleCdzIGV4ZWMgbWV0aG9kLCBidXQgZmlyc3QgY3JlYXRlc1xuICAgICAgLy8gYSBuZXcgb25lLiBXZSBuZWVkIHRvIHJldHVybiB0aGUgcGF0Y2hlZCByZWdleCB3aGVuIGNyZWF0aW5nIHRoZSBuZXcgb25lLlxuICAgICAgcmUuY29uc3RydWN0b3IgPSB7fTtcbiAgICAgIHJlLmNvbnN0cnVjdG9yW1NQRUNJRVNdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmU7IH07XG4gICAgICByZS5mbGFncyA9ICcnO1xuICAgICAgcmVbU1lNQk9MXSA9IC8uL1tTWU1CT0xdO1xuICAgIH1cblxuICAgIHJlLmV4ZWMgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDYWxsZWQgPSB0cnVlOyByZXR1cm4gbnVsbDsgfTtcblxuICAgIHJlW1NZTUJPTF0oJycpO1xuICAgIHJldHVybiAhZXhlY0NhbGxlZDtcbiAgfSk7XG5cbiAgaWYgKFxuICAgICFERUxFR0FURVNfVE9fU1lNQk9MIHx8XG4gICAgIURFTEVHQVRFU19UT19FWEVDIHx8XG4gICAgKEtFWSA9PT0gJ3JlcGxhY2UnICYmICEoXG4gICAgICBSRVBMQUNFX1NVUFBPUlRTX05BTUVEX0dST1VQUyAmJlxuICAgICAgUkVQTEFDRV9LRUVQU18kMCAmJlxuICAgICAgIVJFR0VYUF9SRVBMQUNFX1NVQlNUSVRVVEVTX1VOREVGSU5FRF9DQVBUVVJFXG4gICAgKSkgfHxcbiAgICAoS0VZID09PSAnc3BsaXQnICYmICFTUExJVF9XT1JLU19XSVRIX09WRVJXUklUVEVOX0VYRUMpXG4gICkge1xuICAgIHZhciBuYXRpdmVSZWdFeHBNZXRob2QgPSAvLi9bU1lNQk9MXTtcbiAgICB2YXIgbWV0aG9kcyA9IGV4ZWMoU1lNQk9MLCAnJ1tLRVldLCBmdW5jdGlvbiAobmF0aXZlTWV0aG9kLCByZWdleHAsIHN0ciwgYXJnMiwgZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgIGlmIChyZWdleHAuZXhlYyA9PT0gcmVnZXhwRXhlYykge1xuICAgICAgICBpZiAoREVMRUdBVEVTX1RPX1NZTUJPTCAmJiAhZm9yY2VTdHJpbmdNZXRob2QpIHtcbiAgICAgICAgICAvLyBUaGUgbmF0aXZlIFN0cmluZyBtZXRob2QgYWxyZWFkeSBkZWxlZ2F0ZXMgdG8gQEBtZXRob2QgKHRoaXNcbiAgICAgICAgICAvLyBwb2x5ZmlsbGVkIGZ1bmN0aW9uKSwgbGVhc2luZyB0byBpbmZpbml0ZSByZWN1cnNpb24uXG4gICAgICAgICAgLy8gV2UgYXZvaWQgaXQgYnkgZGlyZWN0bHkgY2FsbGluZyB0aGUgbmF0aXZlIEBAbWV0aG9kIG1ldGhvZC5cbiAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbmF0aXZlUmVnRXhwTWV0aG9kLmNhbGwocmVnZXhwLCBzdHIsIGFyZzIpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG5hdGl2ZU1ldGhvZC5jYWxsKHN0ciwgcmVnZXhwLCBhcmcyKSB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UgfTtcbiAgICB9LCB7XG4gICAgICBSRVBMQUNFX0tFRVBTXyQwOiBSRVBMQUNFX0tFRVBTXyQwLFxuICAgICAgUkVHRVhQX1JFUExBQ0VfU1VCU1RJVFVURVNfVU5ERUZJTkVEX0NBUFRVUkU6IFJFR0VYUF9SRVBMQUNFX1NVQlNUSVRVVEVTX1VOREVGSU5FRF9DQVBUVVJFXG4gICAgfSk7XG4gICAgdmFyIHN0cmluZ01ldGhvZCA9IG1ldGhvZHNbMF07XG4gICAgdmFyIHJlZ2V4TWV0aG9kID0gbWV0aG9kc1sxXTtcblxuICAgIHJlZGVmaW5lKFN0cmluZy5wcm90b3R5cGUsIEtFWSwgc3RyaW5nTWV0aG9kKTtcbiAgICByZWRlZmluZShSZWdFeHAucHJvdG90eXBlLCBTWU1CT0wsIGxlbmd0aCA9PSAyXG4gICAgICAvLyAyMS4yLjUuOCBSZWdFeHAucHJvdG90eXBlW0BAcmVwbGFjZV0oc3RyaW5nLCByZXBsYWNlVmFsdWUpXG4gICAgICAvLyAyMS4yLjUuMTEgUmVnRXhwLnByb3RvdHlwZVtAQHNwbGl0XShzdHJpbmcsIGxpbWl0KVxuICAgICAgPyBmdW5jdGlvbiAoc3RyaW5nLCBhcmcpIHsgcmV0dXJuIHJlZ2V4TWV0aG9kLmNhbGwoc3RyaW5nLCB0aGlzLCBhcmcpOyB9XG4gICAgICAvLyAyMS4yLjUuNiBSZWdFeHAucHJvdG90eXBlW0BAbWF0Y2hdKHN0cmluZylcbiAgICAgIC8vIDIxLjIuNS45IFJlZ0V4cC5wcm90b3R5cGVbQEBzZWFyY2hdKHN0cmluZylcbiAgICAgIDogZnVuY3Rpb24gKHN0cmluZykgeyByZXR1cm4gcmVnZXhNZXRob2QuY2FsbChzdHJpbmcsIHRoaXMpOyB9XG4gICAgKTtcbiAgfVxuXG4gIGlmIChzaGFtKSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoUmVnRXhwLnByb3RvdHlwZVtTWU1CT0xdLCAnc2hhbScsIHRydWUpO1xufTtcbiIsInZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9jbGFzc29mLXJhdycpO1xudmFyIHJlZ2V4cEV4ZWMgPSByZXF1aXJlKCcuL3JlZ2V4cC1leGVjJyk7XG5cbi8vIGBSZWdFeHBFeGVjYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cGV4ZWNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFIsIFMpIHtcbiAgdmFyIGV4ZWMgPSBSLmV4ZWM7XG4gIGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciByZXN1bHQgPSBleGVjLmNhbGwoUiwgUyk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1JlZ0V4cCBleGVjIG1ldGhvZCByZXR1cm5lZCBzb21ldGhpbmcgb3RoZXIgdGhhbiBhbiBPYmplY3Qgb3IgbnVsbCcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKGNsYXNzb2YoUikgIT09ICdSZWdFeHAnKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdSZWdFeHAjZXhlYyBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHJlY2VpdmVyJyk7XG4gIH1cblxuICByZXR1cm4gcmVnZXhwRXhlYy5jYWxsKFIsIFMpO1xufTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZ2V4cEZsYWdzID0gcmVxdWlyZSgnLi9yZWdleHAtZmxhZ3MnKTtcbnZhciBzdGlja3lIZWxwZXJzID0gcmVxdWlyZSgnLi9yZWdleHAtc3RpY2t5LWhlbHBlcnMnKTtcblxudmFyIG5hdGl2ZUV4ZWMgPSBSZWdFeHAucHJvdG90eXBlLmV4ZWM7XG4vLyBUaGlzIGFsd2F5cyByZWZlcnMgdG8gdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiwgYmVjYXVzZSB0aGVcbi8vIFN0cmluZyNyZXBsYWNlIHBvbHlmaWxsIHVzZXMgLi9maXgtcmVnZXhwLXdlbGwta25vd24tc3ltYm9sLWxvZ2ljLmpzLFxuLy8gd2hpY2ggbG9hZHMgdGhpcyBmaWxlIGJlZm9yZSBwYXRjaGluZyB0aGUgbWV0aG9kLlxudmFyIG5hdGl2ZVJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG5cbnZhciBwYXRjaGVkRXhlYyA9IG5hdGl2ZUV4ZWM7XG5cbnZhciBVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmUxID0gL2EvO1xuICB2YXIgcmUyID0gL2IqL2c7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTEsICdhJyk7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTIsICdhJyk7XG4gIHJldHVybiByZTEubGFzdEluZGV4ICE9PSAwIHx8IHJlMi5sYXN0SW5kZXggIT09IDA7XG59KSgpO1xuXG52YXIgVU5TVVBQT1JURURfWSA9IHN0aWNreUhlbHBlcnMuVU5TVVBQT1JURURfWSB8fCBzdGlja3lIZWxwZXJzLkJST0tFTl9DQVJFVDtcblxuLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXAsIGNvcGllZCBmcm9tIGVzNS1zaGltJ3MgU3RyaW5nI3NwbGl0IHBhdGNoLlxudmFyIE5QQ0dfSU5DTFVERUQgPSAvKCk/Py8uZXhlYygnJylbMV0gIT09IHVuZGVmaW5lZDtcblxudmFyIFBBVENIID0gVVBEQVRFU19MQVNUX0lOREVYX1dST05HIHx8IE5QQ0dfSU5DTFVERUQgfHwgVU5TVVBQT1JURURfWTtcblxuaWYgKFBBVENIKSB7XG4gIHBhdGNoZWRFeGVjID0gZnVuY3Rpb24gZXhlYyhzdHIpIHtcbiAgICB2YXIgcmUgPSB0aGlzO1xuICAgIHZhciBsYXN0SW5kZXgsIHJlQ29weSwgbWF0Y2gsIGk7XG4gICAgdmFyIHN0aWNreSA9IFVOU1VQUE9SVEVEX1kgJiYgcmUuc3RpY2t5O1xuICAgIHZhciBmbGFncyA9IHJlZ2V4cEZsYWdzLmNhbGwocmUpO1xuICAgIHZhciBzb3VyY2UgPSByZS5zb3VyY2U7XG4gICAgdmFyIGNoYXJzQWRkZWQgPSAwO1xuICAgIHZhciBzdHJDb3B5ID0gc3RyO1xuXG4gICAgaWYgKHN0aWNreSkge1xuICAgICAgZmxhZ3MgPSBmbGFncy5yZXBsYWNlKCd5JywgJycpO1xuICAgICAgaWYgKGZsYWdzLmluZGV4T2YoJ2cnKSA9PT0gLTEpIHtcbiAgICAgICAgZmxhZ3MgKz0gJ2cnO1xuICAgICAgfVxuXG4gICAgICBzdHJDb3B5ID0gU3RyaW5nKHN0cikuc2xpY2UocmUubGFzdEluZGV4KTtcbiAgICAgIC8vIFN1cHBvcnQgYW5jaG9yZWQgc3RpY2t5IGJlaGF2aW9yLlxuICAgICAgaWYgKHJlLmxhc3RJbmRleCA+IDAgJiYgKCFyZS5tdWx0aWxpbmUgfHwgcmUubXVsdGlsaW5lICYmIHN0cltyZS5sYXN0SW5kZXggLSAxXSAhPT0gJ1xcbicpKSB7XG4gICAgICAgIHNvdXJjZSA9ICcoPzogJyArIHNvdXJjZSArICcpJztcbiAgICAgICAgc3RyQ29weSA9ICcgJyArIHN0ckNvcHk7XG4gICAgICAgIGNoYXJzQWRkZWQrKztcbiAgICAgIH1cbiAgICAgIC8vIF4oPyArIHJ4ICsgKSBpcyBuZWVkZWQsIGluIGNvbWJpbmF0aW9uIHdpdGggc29tZSBzdHIgc2xpY2luZywgdG9cbiAgICAgIC8vIHNpbXVsYXRlIHRoZSAneScgZmxhZy5cbiAgICAgIHJlQ29weSA9IG5ldyBSZWdFeHAoJ14oPzonICsgc291cmNlICsgJyknLCBmbGFncyk7XG4gICAgfVxuXG4gICAgaWYgKE5QQ0dfSU5DTFVERUQpIHtcbiAgICAgIHJlQ29weSA9IG5ldyBSZWdFeHAoJ14nICsgc291cmNlICsgJyQoPyFcXFxccyknLCBmbGFncyk7XG4gICAgfVxuICAgIGlmIChVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcpIGxhc3RJbmRleCA9IHJlLmxhc3RJbmRleDtcblxuICAgIG1hdGNoID0gbmF0aXZlRXhlYy5jYWxsKHN0aWNreSA/IHJlQ29weSA6IHJlLCBzdHJDb3B5KTtcblxuICAgIGlmIChzdGlja3kpIHtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBtYXRjaC5pbnB1dCA9IG1hdGNoLmlucHV0LnNsaWNlKGNoYXJzQWRkZWQpO1xuICAgICAgICBtYXRjaFswXSA9IG1hdGNoWzBdLnNsaWNlKGNoYXJzQWRkZWQpO1xuICAgICAgICBtYXRjaC5pbmRleCA9IHJlLmxhc3RJbmRleDtcbiAgICAgICAgcmUubGFzdEluZGV4ICs9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIH0gZWxzZSByZS5sYXN0SW5kZXggPSAwO1xuICAgIH0gZWxzZSBpZiAoVVBEQVRFU19MQVNUX0lOREVYX1dST05HICYmIG1hdGNoKSB7XG4gICAgICByZS5sYXN0SW5kZXggPSByZS5nbG9iYWwgPyBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCA6IGxhc3RJbmRleDtcbiAgICB9XG4gICAgaWYgKE5QQ0dfSU5DTFVERUQgJiYgbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGBcbiAgICAgIC8vIGZvciBOUENHLCBsaWtlIElFOC4gTk9URTogVGhpcyBkb2Vzbicgd29yayBmb3IgLyguPyk/L1xuICAgICAgbmF0aXZlUmVwbGFjZS5jYWxsKG1hdGNoWzBdLCByZUNvcHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZmluZWQpIG1hdGNoW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGF0Y2hlZEV4ZWM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmYWlscyA9IHJlcXVpcmUoJy4vZmFpbHMnKTtcblxuLy8gYmFiZWwtbWluaWZ5IHRyYW5zcGlsZXMgUmVnRXhwKCdhJywgJ3knKSAtPiAvYS95IGFuZCBpdCBjYXVzZXMgU3ludGF4RXJyb3IsXG4vLyBzbyB3ZSB1c2UgYW4gaW50ZXJtZWRpYXRlIGZ1bmN0aW9uLlxuZnVuY3Rpb24gUkUocywgZikge1xuICByZXR1cm4gUmVnRXhwKHMsIGYpO1xufVxuXG5leHBvcnRzLlVOU1VQUE9SVEVEX1kgPSBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIGJhYmVsLW1pbmlmeSB0cmFuc3BpbGVzIFJlZ0V4cCgnYScsICd5JykgLT4gL2EveSBhbmQgaXQgY2F1c2VzIFN5bnRheEVycm9yXG4gIHZhciByZSA9IFJFKCdhJywgJ3knKTtcbiAgcmUubGFzdEluZGV4ID0gMjtcbiAgcmV0dXJuIHJlLmV4ZWMoJ2FiY2QnKSAhPSBudWxsO1xufSk7XG5cbmV4cG9ydHMuQlJPS0VOX0NBUkVUID0gZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD03NzM2ODdcbiAgdmFyIHJlID0gUkUoJ15yJywgJ2d5Jyk7XG4gIHJlLmxhc3RJbmRleCA9IDI7XG4gIHJldHVybiByZS5leGVjKCdzdHInKSAhPSBudWxsO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBleGVjID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZ2V4cC1leGVjJyk7XG5cbiQoeyB0YXJnZXQ6ICdSZWdFeHAnLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiAvLi8uZXhlYyAhPT0gZXhlYyB9LCB7XG4gIGV4ZWM6IGV4ZWNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG52YXIgYWR2YW5jZVN0cmluZ0luZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgcmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWdleHAtZXhlYy1hYnN0cmFjdCcpO1xuXG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTID0gL1xcJChbJCYnYF18XFxkXFxkP3w8W14+XSo+KS9nO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTX05PX05BTUVEID0gL1xcJChbJCYnYF18XFxkXFxkPykvZztcblxudmFyIG1heWJlVG9TdHJpbmcgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyBpdCA6IFN0cmluZyhpdCk7XG59O1xuXG4vLyBAQHJlcGxhY2UgbG9naWNcbmZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljKCdyZXBsYWNlJywgMiwgZnVuY3Rpb24gKFJFUExBQ0UsIG5hdGl2ZVJlcGxhY2UsIG1heWJlQ2FsbE5hdGl2ZSwgcmVhc29uKSB7XG4gIHZhciBSRUdFWFBfUkVQTEFDRV9TVUJTVElUVVRFU19VTkRFRklORURfQ0FQVFVSRSA9IHJlYXNvbi5SRUdFWFBfUkVQTEFDRV9TVUJTVElUVVRFU19VTkRFRklORURfQ0FQVFVSRTtcbiAgdmFyIFJFUExBQ0VfS0VFUFNfJDAgPSByZWFzb24uUkVQTEFDRV9LRUVQU18kMDtcbiAgdmFyIFVOU0FGRV9TVUJTVElUVVRFID0gUkVHRVhQX1JFUExBQ0VfU1VCU1RJVFVURVNfVU5ERUZJTkVEX0NBUFRVUkUgPyAnJCcgOiAnJDAnO1xuXG4gIHJldHVybiBbXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlXG4gICAgZnVuY3Rpb24gcmVwbGFjZShzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKSB7XG4gICAgICB2YXIgTyA9IHJlcXVpcmVPYmplY3RDb2VyY2libGUodGhpcyk7XG4gICAgICB2YXIgcmVwbGFjZXIgPSBzZWFyY2hWYWx1ZSA9PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzZWFyY2hWYWx1ZVtSRVBMQUNFXTtcbiAgICAgIHJldHVybiByZXBsYWNlciAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gcmVwbGFjZXIuY2FsbChzZWFyY2hWYWx1ZSwgTywgcmVwbGFjZVZhbHVlKVxuICAgICAgICA6IG5hdGl2ZVJlcGxhY2UuY2FsbChTdHJpbmcoTyksIHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpO1xuICAgIH0sXG4gICAgLy8gYFJlZ0V4cC5wcm90b3R5cGVbQEByZXBsYWNlXWAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwLnByb3RvdHlwZS1AQHJlcGxhY2VcbiAgICBmdW5jdGlvbiAocmVnZXhwLCByZXBsYWNlVmFsdWUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgKCFSRUdFWFBfUkVQTEFDRV9TVUJTVElUVVRFU19VTkRFRklORURfQ0FQVFVSRSAmJiBSRVBMQUNFX0tFRVBTXyQwKSB8fFxuICAgICAgICAodHlwZW9mIHJlcGxhY2VWYWx1ZSA9PT0gJ3N0cmluZycgJiYgcmVwbGFjZVZhbHVlLmluZGV4T2YoVU5TQUZFX1NVQlNUSVRVVEUpID09PSAtMSlcbiAgICAgICkge1xuICAgICAgICB2YXIgcmVzID0gbWF5YmVDYWxsTmF0aXZlKG5hdGl2ZVJlcGxhY2UsIHJlZ2V4cCwgdGhpcywgcmVwbGFjZVZhbHVlKTtcbiAgICAgICAgaWYgKHJlcy5kb25lKSByZXR1cm4gcmVzLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcnggPSBhbk9iamVjdChyZWdleHApO1xuICAgICAgdmFyIFMgPSBTdHJpbmcodGhpcyk7XG5cbiAgICAgIHZhciBmdW5jdGlvbmFsUmVwbGFjZSA9IHR5cGVvZiByZXBsYWNlVmFsdWUgPT09ICdmdW5jdGlvbic7XG4gICAgICBpZiAoIWZ1bmN0aW9uYWxSZXBsYWNlKSByZXBsYWNlVmFsdWUgPSBTdHJpbmcocmVwbGFjZVZhbHVlKTtcblxuICAgICAgdmFyIGdsb2JhbCA9IHJ4Lmdsb2JhbDtcbiAgICAgIGlmIChnbG9iYWwpIHtcbiAgICAgICAgdmFyIGZ1bGxVbmljb2RlID0gcngudW5pY29kZTtcbiAgICAgICAgcngubGFzdEluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVnRXhwRXhlYyhyeCwgUyk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIGJyZWFrO1xuXG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICBpZiAoIWdsb2JhbCkgYnJlYWs7XG5cbiAgICAgICAgdmFyIG1hdGNoU3RyID0gU3RyaW5nKHJlc3VsdFswXSk7XG4gICAgICAgIGlmIChtYXRjaFN0ciA9PT0gJycpIHJ4Lmxhc3RJbmRleCA9IGFkdmFuY2VTdHJpbmdJbmRleChTLCB0b0xlbmd0aChyeC5sYXN0SW5kZXgpLCBmdWxsVW5pY29kZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhY2N1bXVsYXRlZFJlc3VsdCA9ICcnO1xuICAgICAgdmFyIG5leHRTb3VyY2VQb3NpdGlvbiA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1tpXTtcblxuICAgICAgICB2YXIgbWF0Y2hlZCA9IFN0cmluZyhyZXN1bHRbMF0pO1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBtYXgobWluKHRvSW50ZWdlcihyZXN1bHQuaW5kZXgpLCBTLmxlbmd0aCksIDApO1xuICAgICAgICB2YXIgY2FwdHVyZXMgPSBbXTtcbiAgICAgICAgLy8gTk9URTogVGhpcyBpcyBlcXVpdmFsZW50IHRvXG4gICAgICAgIC8vICAgY2FwdHVyZXMgPSByZXN1bHQuc2xpY2UoMSkubWFwKG1heWJlVG9TdHJpbmcpXG4gICAgICAgIC8vIGJ1dCBmb3Igc29tZSByZWFzb24gYG5hdGl2ZVNsaWNlLmNhbGwocmVzdWx0LCAxLCByZXN1bHQubGVuZ3RoKWAgKGNhbGxlZCBpblxuICAgICAgICAvLyB0aGUgc2xpY2UgcG9seWZpbGwgd2hlbiBzbGljaW5nIG5hdGl2ZSBhcnJheXMpIFwiZG9lc24ndCB3b3JrXCIgaW4gc2FmYXJpIDkgYW5kXG4gICAgICAgIC8vIGNhdXNlcyBhIGNyYXNoIChodHRwczovL3Bhc3RlYmluLmNvbS9OMjFRemVRQSkgd2hlbiB0cnlpbmcgdG8gZGVidWcgaXQuXG4gICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgcmVzdWx0Lmxlbmd0aDsgaisrKSBjYXB0dXJlcy5wdXNoKG1heWJlVG9TdHJpbmcocmVzdWx0W2pdKSk7XG4gICAgICAgIHZhciBuYW1lZENhcHR1cmVzID0gcmVzdWx0Lmdyb3VwcztcbiAgICAgICAgaWYgKGZ1bmN0aW9uYWxSZXBsYWNlKSB7XG4gICAgICAgICAgdmFyIHJlcGxhY2VyQXJncyA9IFttYXRjaGVkXS5jb25jYXQoY2FwdHVyZXMsIHBvc2l0aW9uLCBTKTtcbiAgICAgICAgICBpZiAobmFtZWRDYXB0dXJlcyAhPT0gdW5kZWZpbmVkKSByZXBsYWNlckFyZ3MucHVzaChuYW1lZENhcHR1cmVzKTtcbiAgICAgICAgICB2YXIgcmVwbGFjZW1lbnQgPSBTdHJpbmcocmVwbGFjZVZhbHVlLmFwcGx5KHVuZGVmaW5lZCwgcmVwbGFjZXJBcmdzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVwbGFjZW1lbnQgPSBnZXRTdWJzdGl0dXRpb24obWF0Y2hlZCwgUywgcG9zaXRpb24sIGNhcHR1cmVzLCBuYW1lZENhcHR1cmVzLCByZXBsYWNlVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3NpdGlvbiA+PSBuZXh0U291cmNlUG9zaXRpb24pIHtcbiAgICAgICAgICBhY2N1bXVsYXRlZFJlc3VsdCArPSBTLnNsaWNlKG5leHRTb3VyY2VQb3NpdGlvbiwgcG9zaXRpb24pICsgcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgbmV4dFNvdXJjZVBvc2l0aW9uID0gcG9zaXRpb24gKyBtYXRjaGVkLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY3VtdWxhdGVkUmVzdWx0ICsgUy5zbGljZShuZXh0U291cmNlUG9zaXRpb24pO1xuICAgIH1cbiAgXTtcblxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1nZXRzdWJzdGl0dXRpb25cbiAgZnVuY3Rpb24gZ2V0U3Vic3RpdHV0aW9uKG1hdGNoZWQsIHN0ciwgcG9zaXRpb24sIGNhcHR1cmVzLCBuYW1lZENhcHR1cmVzLCByZXBsYWNlbWVudCkge1xuICAgIHZhciB0YWlsUG9zID0gcG9zaXRpb24gKyBtYXRjaGVkLmxlbmd0aDtcbiAgICB2YXIgbSA9IGNhcHR1cmVzLmxlbmd0aDtcbiAgICB2YXIgc3ltYm9scyA9IFNVQlNUSVRVVElPTl9TWU1CT0xTX05PX05BTUVEO1xuICAgIGlmIChuYW1lZENhcHR1cmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5hbWVkQ2FwdHVyZXMgPSB0b09iamVjdChuYW1lZENhcHR1cmVzKTtcbiAgICAgIHN5bWJvbHMgPSBTVUJTVElUVVRJT05fU1lNQk9MUztcbiAgICB9XG4gICAgcmV0dXJuIG5hdGl2ZVJlcGxhY2UuY2FsbChyZXBsYWNlbWVudCwgc3ltYm9scywgZnVuY3Rpb24gKG1hdGNoLCBjaCkge1xuICAgICAgdmFyIGNhcHR1cmU7XG4gICAgICBzd2l0Y2ggKGNoLmNoYXJBdCgwKSkge1xuICAgICAgICBjYXNlICckJzogcmV0dXJuICckJztcbiAgICAgICAgY2FzZSAnJic6IHJldHVybiBtYXRjaGVkO1xuICAgICAgICBjYXNlICdgJzogcmV0dXJuIHN0ci5zbGljZSgwLCBwb3NpdGlvbik7XG4gICAgICAgIGNhc2UgXCInXCI6IHJldHVybiBzdHIuc2xpY2UodGFpbFBvcyk7XG4gICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgIGNhcHR1cmUgPSBuYW1lZENhcHR1cmVzW2NoLnNsaWNlKDEsIC0xKV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IC8vIFxcZFxcZD9cbiAgICAgICAgICB2YXIgbiA9ICtjaDtcbiAgICAgICAgICBpZiAobiA9PT0gMCkgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIGlmIChuID4gbSkge1xuICAgICAgICAgICAgdmFyIGYgPSBmbG9vcihuIC8gMTApO1xuICAgICAgICAgICAgaWYgKGYgPT09IDApIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIGlmIChmIDw9IG0pIHJldHVybiBjYXB0dXJlc1tmIC0gMV0gPT09IHVuZGVmaW5lZCA/IGNoLmNoYXJBdCgxKSA6IGNhcHR1cmVzW2YgLSAxXSArIGNoLmNoYXJBdCgxKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FwdHVyZSA9IGNhcHR1cmVzW24gLSAxXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXB0dXJlID09PSB1bmRlZmluZWQgPyAnJyA6IGNhcHR1cmU7XG4gICAgfSk7XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTsgfVxuXG5mdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pOyB9OyByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pOyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTsgfVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbi8qXG4gKlxuICogTW9yZSBpbmZvIGF0IFt3d3cuZHJvcHpvbmVqcy5jb21dKGh0dHA6Ly93d3cuZHJvcHpvbmVqcy5jb20pXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyLCBNYXRpYXMgTWVub1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKlxuICovXG4vLyBUaGUgRW1pdHRlciBjbGFzcyBwcm92aWRlcyB0aGUgYWJpbGl0eSB0byBjYWxsIGAub24oKWAgb24gRHJvcHpvbmUgdG8gbGlzdGVuXG4vLyB0byBldmVudHMuXG4vLyBJdCBpcyBzdHJvbmdseSBiYXNlZCBvbiBjb21wb25lbnQncyBlbWl0dGVyIGNsYXNzLCBhbmQgSSByZW1vdmVkIHRoZVxuLy8gZnVuY3Rpb25hbGl0eSBiZWNhdXNlIG9mIHRoZSBkZXBlbmRlbmN5IGhlbGwgd2l0aCBkaWZmZXJlbnQgZnJhbWV3b3Jrcy5cbnZhciBFbWl0dGVyID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRW1pdHRlcigpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW1pdHRlcik7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRW1pdHRlciwgW3tcbiAgICBrZXk6IFwib25cIixcbiAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgZm9yIGdpdmVuIGV2ZW50XG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbikge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9OyAvLyBDcmVhdGUgbmFtZXNwYWNlIGZvciB0aGlzIGV2ZW50XG5cbiAgICAgIGlmICghdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gW107XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tldmVudF0ucHVzaChmbik7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJlbWl0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGNhbGxiYWNrc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IF9zdGVwLnZhbHVlO1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3JbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfaXRlcmF0b3JbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lciBmb3IgZ2l2ZW4gZXZlbnQuIElmIGZuIGlzIG5vdCBwcm92aWRlZCwgYWxsIGV2ZW50XG4gICAgLy8gbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHdpbGwgYmUgcmVtb3ZlZC4gSWYgbmVpdGhlciBpcyBwcm92aWRlZCwgYWxsXG4gICAgLy8gZXZlbnQgbGlzdGVuZXJzIHdpbGwgYmUgcmVtb3ZlZC5cblxuICB9LCB7XG4gICAga2V5OiBcIm9mZlwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvZmYoZXZlbnQsIGZuKSB7XG4gICAgICBpZiAoIXRoaXMuX2NhbGxiYWNrcyB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gLy8gc3BlY2lmaWMgZXZlbnRcblxuXG4gICAgICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcblxuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG5cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gZm4pIHtcbiAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFbWl0dGVyO1xufSgpO1xuXG52YXIgRHJvcHpvbmUgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9FbWl0dGVyKSB7XG4gIF9pbmhlcml0cyhEcm9wem9uZSwgX0VtaXR0ZXIpO1xuXG4gIF9jcmVhdGVDbGFzcyhEcm9wem9uZSwgbnVsbCwgW3tcbiAgICBrZXk6IFwiaW5pdENsYXNzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRDbGFzcygpIHtcbiAgICAgIC8vIEV4cG9zaW5nIHRoZSBlbWl0dGVyIGNsYXNzLCBtYWlubHkgZm9yIHRlc3RzXG4gICAgICB0aGlzLnByb3RvdHlwZS5FbWl0dGVyID0gRW1pdHRlcjtcbiAgICAgIC8qXG4gICAgICAgVGhpcyBpcyBhIGxpc3Qgb2YgYWxsIGF2YWlsYWJsZSBldmVudHMgeW91IGNhbiByZWdpc3RlciBvbiBhIGRyb3B6b25lIG9iamVjdC5cbiAgICAgICAgWW91IGNhbiByZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGxpa2UgdGhpczpcbiAgICAgICAgZHJvcHpvbmUub24oXCJkcmFnRW50ZXJcIiwgZnVuY3Rpb24oKSB7IH0pO1xuICAgICAgICAqL1xuXG4gICAgICB0aGlzLnByb3RvdHlwZS5ldmVudHMgPSBbXCJkcm9wXCIsIFwiZHJhZ3N0YXJ0XCIsIFwiZHJhZ2VuZFwiLCBcImRyYWdlbnRlclwiLCBcImRyYWdvdmVyXCIsIFwiZHJhZ2xlYXZlXCIsIFwiYWRkZWRmaWxlXCIsIFwiYWRkZWRmaWxlc1wiLCBcInJlbW92ZWRmaWxlXCIsIFwidGh1bWJuYWlsXCIsIFwiZXJyb3JcIiwgXCJlcnJvcm11bHRpcGxlXCIsIFwicHJvY2Vzc2luZ1wiLCBcInByb2Nlc3NpbmdtdWx0aXBsZVwiLCBcInVwbG9hZHByb2dyZXNzXCIsIFwidG90YWx1cGxvYWRwcm9ncmVzc1wiLCBcInNlbmRpbmdcIiwgXCJzZW5kaW5nbXVsdGlwbGVcIiwgXCJzdWNjZXNzXCIsIFwic3VjY2Vzc211bHRpcGxlXCIsIFwiY2FuY2VsZWRcIiwgXCJjYW5jZWxlZG11bHRpcGxlXCIsIFwiY29tcGxldGVcIiwgXCJjb21wbGV0ZW11bHRpcGxlXCIsIFwicmVzZXRcIiwgXCJtYXhmaWxlc2V4Y2VlZGVkXCIsIFwibWF4ZmlsZXNyZWFjaGVkXCIsIFwicXVldWVjb21wbGV0ZVwiXTtcbiAgICAgIHRoaXMucHJvdG90eXBlLmRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogSGFzIHRvIGJlIHNwZWNpZmllZCBvbiBlbGVtZW50cyBvdGhlciB0aGFuIGZvcm0gKG9yIHdoZW4gdGhlIGZvcm1cbiAgICAgICAgICogZG9lc24ndCBoYXZlIGFuIGBhY3Rpb25gIGF0dHJpYnV0ZSkuIFlvdSBjYW4gYWxzb1xuICAgICAgICAgKiBwcm92aWRlIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGBmaWxlc2AgYW5kXG4gICAgICAgICAqIG11c3QgcmV0dXJuIHRoZSB1cmwgKHNpbmNlIGB2My4xMi4wYClcbiAgICAgICAgICovXG4gICAgICAgIHVybDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuIGJlIGNoYW5nZWQgdG8gYFwicHV0XCJgIGlmIG5lY2Vzc2FyeS4gWW91IGNhbiBhbHNvIHByb3ZpZGUgYSBmdW5jdGlvblxuICAgICAgICAgKiB0aGF0IHdpbGwgYmUgY2FsbGVkIHdpdGggYGZpbGVzYCBhbmQgbXVzdCByZXR1cm4gdGhlIG1ldGhvZCAoc2luY2UgYHYzLjEyLjBgKS5cbiAgICAgICAgICovXG4gICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpbGwgYmUgc2V0IG9uIHRoZSBYSFJlcXVlc3QuXG4gICAgICAgICAqL1xuICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGltZW91dCBmb3IgdGhlIFhIUiByZXF1ZXN0cyBpbiBtaWxsaXNlY29uZHMgKHNpbmNlIGB2NC40LjBgKS5cbiAgICAgICAgICovXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIb3cgbWFueSBmaWxlIHVwbG9hZHMgdG8gcHJvY2VzcyBpbiBwYXJhbGxlbCAoU2VlIHRoZVxuICAgICAgICAgKiBFbnF1ZXVpbmcgZmlsZSB1cGxvYWRzIGRvY3VtZW50YXRpb24gc2VjdGlvbiBmb3IgbW9yZSBpbmZvKVxuICAgICAgICAgKi9cbiAgICAgICAgcGFyYWxsZWxVcGxvYWRzOiAyLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRvIHNlbmQgbXVsdGlwbGUgZmlsZXMgaW4gb25lIHJlcXVlc3QuIElmXG4gICAgICAgICAqIHRoaXMgaXQgc2V0IHRvIHRydWUsIHRoZW4gdGhlIGZhbGxiYWNrIGZpbGUgaW5wdXQgZWxlbWVudCB3aWxsXG4gICAgICAgICAqIGhhdmUgdGhlIGBtdWx0aXBsZWAgYXR0cmlidXRlIGFzIHdlbGwuIFRoaXMgb3B0aW9uIHdpbGxcbiAgICAgICAgICogYWxzbyB0cmlnZ2VyIGFkZGl0aW9uYWwgZXZlbnRzIChsaWtlIGBwcm9jZXNzaW5nbXVsdGlwbGVgKS4gU2VlIHRoZSBldmVudHNcbiAgICAgICAgICogZG9jdW1lbnRhdGlvbiBzZWN0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdXBsb2FkTXVsdGlwbGU6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHlvdSB3YW50IGZpbGVzIHRvIGJlIHVwbG9hZGVkIGluIGNodW5rcyB0byB5b3VyIHNlcnZlci4gVGhpcyBjYW4ndCBiZVxuICAgICAgICAgKiB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYHVwbG9hZE11bHRpcGxlYC5cbiAgICAgICAgICpcbiAgICAgICAgICogU2VlIFtjaHVua3NVcGxvYWRlZF0oI2NvbmZpZy1jaHVua3NVcGxvYWRlZCkgZm9yIHRoZSBjYWxsYmFjayB0byBmaW5hbGlzZSBhbiB1cGxvYWQuXG4gICAgICAgICAqL1xuICAgICAgICBjaHVua2luZzogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGBjaHVua2luZ2AgaXMgZW5hYmxlZCwgdGhpcyBkZWZpbmVzIHdoZXRoZXIgKipldmVyeSoqIGZpbGUgc2hvdWxkIGJlIGNodW5rZWQsXG4gICAgICAgICAqIGV2ZW4gaWYgdGhlIGZpbGUgc2l6ZSBpcyBiZWxvdyBjaHVua1NpemUuIFRoaXMgbWVhbnMsIHRoYXQgdGhlIGFkZGl0aW9uYWwgY2h1bmtcbiAgICAgICAgICogZm9ybSBkYXRhIHdpbGwgYmUgc3VibWl0dGVkIGFuZCB0aGUgYGNodW5rc1VwbG9hZGVkYCBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQuXG4gICAgICAgICAqL1xuICAgICAgICBmb3JjZUNodW5raW5nOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgYGNodW5raW5nYCBpcyBgdHJ1ZWAsIHRoZW4gdGhpcyBkZWZpbmVzIHRoZSBjaHVuayBzaXplIGluIGJ5dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgY2h1bmtTaXplOiAyMDAwMDAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBgdHJ1ZWAsIHRoZSBpbmRpdmlkdWFsIGNodW5rcyBvZiBhIGZpbGUgYXJlIGJlaW5nIHVwbG9hZGVkIHNpbXVsdGFuZW91c2x5LlxuICAgICAgICAgKi9cbiAgICAgICAgcGFyYWxsZWxDaHVua1VwbG9hZHM6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIGEgY2h1bmsgc2hvdWxkIGJlIHJldHJpZWQgaWYgaXQgZmFpbHMuXG4gICAgICAgICAqL1xuICAgICAgICByZXRyeUNodW5rczogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGByZXRyeUNodW5rc2AgaXMgdHJ1ZSwgaG93IG1hbnkgdGltZXMgc2hvdWxkIGl0IGJlIHJldHJpZWQuXG4gICAgICAgICAqL1xuICAgICAgICByZXRyeUNodW5rc0xpbWl0OiAzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBub3QgYG51bGxgIGRlZmluZXMgaG93IG1hbnkgZmlsZXMgdGhpcyBEcm9wem9uZSBoYW5kbGVzLiBJZiBpdCBleGNlZWRzLFxuICAgICAgICAgKiB0aGUgZXZlbnQgYG1heGZpbGVzZXhjZWVkZWRgIHdpbGwgYmUgY2FsbGVkLiBUaGUgZHJvcHpvbmUgZWxlbWVudCBnZXRzIHRoZVxuICAgICAgICAgKiBjbGFzcyBgZHotbWF4LWZpbGVzLXJlYWNoZWRgIGFjY29yZGluZ2x5IHNvIHlvdSBjYW4gcHJvdmlkZSB2aXN1YWwgZmVlZGJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBtYXhGaWxlc2l6ZTogMjU2LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZmlsZSBwYXJhbSB0aGF0IGdldHMgdHJhbnNmZXJyZWQuXG4gICAgICAgICAqICoqTk9URSoqOiBJZiB5b3UgaGF2ZSB0aGUgb3B0aW9uICBgdXBsb2FkTXVsdGlwbGVgIHNldCB0byBgdHJ1ZWAsIHRoZW5cbiAgICAgICAgICogRHJvcHpvbmUgd2lsbCBhcHBlbmQgYFtdYCB0byB0aGUgbmFtZS5cbiAgICAgICAgICovXG4gICAgICAgIHBhcmFtTmFtZTogXCJmaWxlXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGh1bWJuYWlscyBmb3IgaW1hZ2VzIHNob3VsZCBiZSBnZW5lcmF0ZWRcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlVGh1bWJuYWlsczogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW4gTUIuIFdoZW4gdGhlIGZpbGVuYW1lIGV4Y2VlZHMgdGhpcyBsaW1pdCwgdGhlIHRodW1ibmFpbCB3aWxsIG5vdCBiZSBnZW5lcmF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICBtYXhUaHVtYm5haWxGaWxlc2l6ZTogMTAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGBudWxsYCwgdGhlIHJhdGlvIG9mIHRoZSBpbWFnZSB3aWxsIGJlIHVzZWQgdG8gY2FsY3VsYXRlIGl0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGh1bWJuYWlsV2lkdGg6IDEyMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNhbWUgYXMgYHRodW1ibmFpbFdpZHRoYC4gSWYgYm90aCBhcmUgbnVsbCwgaW1hZ2VzIHdpbGwgbm90IGJlIHJlc2l6ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aHVtYm5haWxIZWlnaHQ6IDEyMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSG93IHRoZSBpbWFnZXMgc2hvdWxkIGJlIHNjYWxlZCBkb3duIGluIGNhc2UgYm90aCwgYHRodW1ibmFpbFdpZHRoYCBhbmQgYHRodW1ibmFpbEhlaWdodGAgYXJlIHByb3ZpZGVkLlxuICAgICAgICAgKiBDYW4gYmUgZWl0aGVyIGBjb250YWluYCBvciBgY3JvcGAuXG4gICAgICAgICAqL1xuICAgICAgICB0aHVtYm5haWxNZXRob2Q6ICdjcm9wJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgc2V0LCBpbWFnZXMgd2lsbCBiZSByZXNpemVkIHRvIHRoZXNlIGRpbWVuc2lvbnMgYmVmb3JlIGJlaW5nICoqdXBsb2FkZWQqKi5cbiAgICAgICAgICogSWYgb25seSBvbmUsIGByZXNpemVXaWR0aGAgKipvcioqIGByZXNpemVIZWlnaHRgIGlzIHByb3ZpZGVkLCB0aGUgb3JpZ2luYWwgYXNwZWN0XG4gICAgICAgICAqIHJhdGlvIG9mIHRoZSBmaWxlIHdpbGwgYmUgcHJlc2VydmVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgYG9wdGlvbnMudHJhbnNmb3JtRmlsZWAgZnVuY3Rpb24gdXNlcyB0aGVzZSBvcHRpb25zLCBzbyBpZiB0aGUgYHRyYW5zZm9ybUZpbGVgIGZ1bmN0aW9uXG4gICAgICAgICAqIGlzIG92ZXJyaWRkZW4sIHRoZXNlIG9wdGlvbnMgZG9uJ3QgZG8gYW55dGhpbmcuXG4gICAgICAgICAqL1xuICAgICAgICByZXNpemVXaWR0aDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGByZXNpemVXaWR0aGAuXG4gICAgICAgICAqL1xuICAgICAgICByZXNpemVIZWlnaHQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtaW1lIHR5cGUgb2YgdGhlIHJlc2l6ZWQgaW1hZ2UgKGJlZm9yZSBpdCBnZXRzIHVwbG9hZGVkIHRvIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgKiBJZiBgbnVsbGAgdGhlIG9yaWdpbmFsIG1pbWUgdHlwZSB3aWxsIGJlIHVzZWQuIFRvIGZvcmNlIGpwZWcsIGZvciBleGFtcGxlLCB1c2UgYGltYWdlL2pwZWdgLlxuICAgICAgICAgKiBTZWUgYHJlc2l6ZVdpZHRoYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHJlc2l6ZU1pbWVUeXBlOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgcXVhbGl0eSBvZiB0aGUgcmVzaXplZCBpbWFnZXMuIFNlZSBgcmVzaXplV2lkdGhgLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVzaXplUXVhbGl0eTogMC44LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIb3cgdGhlIGltYWdlcyBzaG91bGQgYmUgc2NhbGVkIGRvd24gaW4gY2FzZSBib3RoLCBgcmVzaXplV2lkdGhgIGFuZCBgcmVzaXplSGVpZ2h0YCBhcmUgcHJvdmlkZWQuXG4gICAgICAgICAqIENhbiBiZSBlaXRoZXIgYGNvbnRhaW5gIG9yIGBjcm9wYC5cbiAgICAgICAgICovXG4gICAgICAgIHJlc2l6ZU1ldGhvZDogJ2NvbnRhaW4nLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYmFzZSB0aGF0IGlzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBmaWxlc2l6ZS4gWW91IGNhbiBjaGFuZ2UgdGhpcyB0b1xuICAgICAgICAgKiAxMDI0IGlmIHlvdSB3b3VsZCByYXRoZXIgZGlzcGxheSBraWJpYnl0ZXMsIG1lYmlieXRlcywgZXRjLi4uXG4gICAgICAgICAqIDEwMjQgaXMgdGVjaG5pY2FsbHkgaW5jb3JyZWN0LCBiZWNhdXNlIGAxMDI0IGJ5dGVzYCBhcmUgYDEga2liaWJ5dGVgIG5vdCBgMSBraWxvYnl0ZWAuXG4gICAgICAgICAqIFlvdSBjYW4gY2hhbmdlIHRoaXMgdG8gYDEwMjRgIGlmIHlvdSBkb24ndCBjYXJlIGFib3V0IHZhbGlkaXR5LlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXNpemVCYXNlOiAxMDAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW4gYmUgdXNlZCB0byBsaW1pdCB0aGUgbWF4aW11bSBudW1iZXIgb2YgZmlsZXMgdGhhdCB3aWxsIGJlIGhhbmRsZWQgYnkgdGhpcyBEcm9wem9uZVxuICAgICAgICAgKi9cbiAgICAgICAgbWF4RmlsZXM6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIG9wdGlvbmFsIG9iamVjdCB0byBzZW5kIGFkZGl0aW9uYWwgaGVhZGVycyB0byB0aGUgc2VydmVyLiBFZzpcbiAgICAgICAgICogYHsgXCJNeS1Bd2Vzb21lLUhlYWRlclwiOiBcImhlYWRlciB2YWx1ZVwiIH1gXG4gICAgICAgICAqL1xuICAgICAgICBoZWFkZXJzOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBgdHJ1ZWAsIHRoZSBkcm9wem9uZSBlbGVtZW50IGl0c2VsZiB3aWxsIGJlIGNsaWNrYWJsZSwgaWYgYGZhbHNlYFxuICAgICAgICAgKiBub3RoaW5nIHdpbGwgYmUgY2xpY2thYmxlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBhbiBIVE1MIGVsZW1lbnQsIGEgQ1NTIHNlbGVjdG9yIChmb3IgbXVsdGlwbGUgZWxlbWVudHMpXG4gICAgICAgICAqIG9yIGFuIGFycmF5IG9mIHRob3NlLiBJbiB0aGF0IGNhc2UsIGFsbCBvZiB0aG9zZSBlbGVtZW50cyB3aWxsIHRyaWdnZXIgYW5cbiAgICAgICAgICogdXBsb2FkIHdoZW4gY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciBoaWRkZW4gZmlsZXMgaW4gZGlyZWN0b3JpZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAgICAgICAqL1xuICAgICAgICBpZ25vcmVIaWRkZW5GaWxlczogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgYGFjY2VwdGAgY2hlY2tzIHRoZSBmaWxlJ3MgbWltZSB0eXBlIG9yXG4gICAgICAgICAqIGV4dGVuc2lvbiBhZ2FpbnN0IHRoaXMgbGlzdC4gVGhpcyBpcyBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIG1pbWVcbiAgICAgICAgICogdHlwZXMgb3IgZmlsZSBleHRlbnNpb25zLlxuICAgICAgICAgKlxuICAgICAgICAgKiBFZy46IGBpbWFnZS8qLGFwcGxpY2F0aW9uL3BkZiwucHNkYFxuICAgICAgICAgKlxuICAgICAgICAgKiBJZiB0aGUgRHJvcHpvbmUgaXMgYGNsaWNrYWJsZWAgdGhpcyBvcHRpb24gd2lsbCBhbHNvIGJlIHVzZWQgYXNcbiAgICAgICAgICogW2BhY2NlcHRgXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0hUTUwvRWxlbWVudC9pbnB1dCNhdHRyLWFjY2VwdClcbiAgICAgICAgICogcGFyYW1ldGVyIG9uIHRoZSBoaWRkZW4gZmlsZSBpbnB1dCBhcyB3ZWxsLlxuICAgICAgICAgKi9cbiAgICAgICAgYWNjZXB0ZWRGaWxlczogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogKipEZXByZWNhdGVkISoqXG4gICAgICAgICAqIFVzZSBhY2NlcHRlZEZpbGVzIGluc3RlYWQuXG4gICAgICAgICAqL1xuICAgICAgICBhY2NlcHRlZE1pbWVUeXBlczogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgZmFsc2UsIGZpbGVzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHF1ZXVlIGJ1dCB0aGUgcXVldWUgd2lsbCBub3QgYmVcbiAgICAgICAgICogcHJvY2Vzc2VkIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgICAqIFRoaXMgY2FuIGJlIHVzZWZ1bCBpZiB5b3UgbmVlZCBzb21lIGFkZGl0aW9uYWwgdXNlciBpbnB1dCBiZWZvcmUgc2VuZGluZ1xuICAgICAgICAgKiBmaWxlcyAob3IgaWYgeW91IHdhbnQgd2FudCBhbGwgZmlsZXMgc2VudCBhdCBvbmNlKS5cbiAgICAgICAgICogSWYgeW91J3JlIHJlYWR5IHRvIHNlbmQgdGhlIGZpbGUgc2ltcGx5IGNhbGwgYG15RHJvcHpvbmUucHJvY2Vzc1F1ZXVlKClgLlxuICAgICAgICAgKlxuICAgICAgICAgKiBTZWUgdGhlIFtlbnF1ZXVpbmcgZmlsZSB1cGxvYWRzXSgjZW5xdWV1aW5nLWZpbGUtdXBsb2FkcykgZG9jdW1lbnRhdGlvblxuICAgICAgICAgKiBzZWN0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgYXV0b1Byb2Nlc3NRdWV1ZTogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgZmFsc2UsIGZpbGVzIGFkZGVkIHRvIHRoZSBkcm9wem9uZSB3aWxsIG5vdCBiZSBxdWV1ZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgICogWW91J2xsIGhhdmUgdG8gY2FsbCBgZW5xdWV1ZUZpbGUoZmlsZSlgIG1hbnVhbGx5LlxuICAgICAgICAgKi9cbiAgICAgICAgYXV0b1F1ZXVlOiB0cnVlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBgdHJ1ZWAsIHRoaXMgd2lsbCBhZGQgYSBsaW5rIHRvIGV2ZXJ5IGZpbGUgcHJldmlldyB0byByZW1vdmUgb3IgY2FuY2VsIChpZlxuICAgICAgICAgKiBhbHJlYWR5IHVwbG9hZGluZykgdGhlIGZpbGUuIFRoZSBgZGljdENhbmNlbFVwbG9hZGAsIGBkaWN0Q2FuY2VsVXBsb2FkQ29uZmlybWF0aW9uYFxuICAgICAgICAgKiBhbmQgYGRpY3RSZW1vdmVGaWxlYCBvcHRpb25zIGFyZSB1c2VkIGZvciB0aGUgd29yZGluZy5cbiAgICAgICAgICovXG4gICAgICAgIGFkZFJlbW92ZUxpbmtzOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmaW5lcyB3aGVyZSB0byBkaXNwbGF5IHRoZSBmaWxlIHByZXZpZXdzIOKAkyBpZiBgbnVsbGAgdGhlXG4gICAgICAgICAqIERyb3B6b25lIGVsZW1lbnQgaXRzZWxmIGlzIHVzZWQuIENhbiBiZSBhIHBsYWluIGBIVE1MRWxlbWVudGAgb3IgYSBDU1NcbiAgICAgICAgICogc2VsZWN0b3IuIFRoZSBlbGVtZW50IHNob3VsZCBoYXZlIHRoZSBgZHJvcHpvbmUtcHJldmlld3NgIGNsYXNzIHNvXG4gICAgICAgICAqIHRoZSBwcmV2aWV3cyBhcmUgZGlzcGxheWVkIHByb3Blcmx5LlxuICAgICAgICAgKi9cbiAgICAgICAgcHJldmlld3NDb250YWluZXI6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgaXMgdGhlIGVsZW1lbnQgdGhlIGhpZGRlbiBpbnB1dCBmaWVsZCAod2hpY2ggaXMgdXNlZCB3aGVuIGNsaWNraW5nIG9uIHRoZVxuICAgICAgICAgKiBkcm9wem9uZSB0byB0cmlnZ2VyIGZpbGUgc2VsZWN0aW9uKSB3aWxsIGJlIGFwcGVuZGVkIHRvLiBUaGlzIG1pZ2h0XG4gICAgICAgICAqIGJlIGltcG9ydGFudCBpbiBjYXNlIHlvdSB1c2UgZnJhbWV3b3JrcyB0byBzd2l0Y2ggdGhlIGNvbnRlbnQgb2YgeW91ciBwYWdlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBDYW4gYmUgYSBzZWxlY3RvciBzdHJpbmcsIG9yIGFuIGVsZW1lbnQgZGlyZWN0bHkuXG4gICAgICAgICAqL1xuICAgICAgICBoaWRkZW5JbnB1dENvbnRhaW5lcjogXCJib2R5XCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIG51bGwsIG5vIGNhcHR1cmUgdHlwZSB3aWxsIGJlIHNwZWNpZmllZFxuICAgICAgICAgKiBJZiBjYW1lcmEsIG1vYmlsZSBkZXZpY2VzIHdpbGwgc2tpcCB0aGUgZmlsZSBzZWxlY3Rpb24gYW5kIGNob29zZSBjYW1lcmFcbiAgICAgICAgICogSWYgbWljcm9waG9uZSwgbW9iaWxlIGRldmljZXMgd2lsbCBza2lwIHRoZSBmaWxlIHNlbGVjdGlvbiBhbmQgY2hvb3NlIHRoZSBtaWNyb3Bob25lXG4gICAgICAgICAqIElmIGNhbWNvcmRlciwgbW9iaWxlIGRldmljZXMgd2lsbCBza2lwIHRoZSBmaWxlIHNlbGVjdGlvbiBhbmQgY2hvb3NlIHRoZSBjYW1lcmEgaW4gdmlkZW8gbW9kZVxuICAgICAgICAgKiBPbiBhcHBsZSBkZXZpY2VzIG11bHRpcGxlIG11c3QgYmUgc2V0IHRvIGZhbHNlLiAgQWNjZXB0ZWRGaWxlcyBtYXkgbmVlZCB0b1xuICAgICAgICAgKiBiZSBzZXQgdG8gYW4gYXBwcm9wcmlhdGUgbWltZSB0eXBlIChlLmcuIFwiaW1hZ2UvKlwiLCBcImF1ZGlvLypcIiwgb3IgXCJ2aWRlby8qXCIpLlxuICAgICAgICAgKi9cbiAgICAgICAgY2FwdHVyZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogKipEZXByZWNhdGVkKiouIFVzZSBgcmVuYW1lRmlsZWAgaW5zdGVhZC5cbiAgICAgICAgICovXG4gICAgICAgIHJlbmFtZUZpbGVuYW1lOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGZ1bmN0aW9uIHRoYXQgaXMgaW52b2tlZCBiZWZvcmUgdGhlIGZpbGUgaXMgdXBsb2FkZWQgdG8gdGhlIHNlcnZlciBhbmQgcmVuYW1lcyB0aGUgZmlsZS5cbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSBgRmlsZWAgYXMgYXJndW1lbnQgYW5kIGNhbiB1c2UgdGhlIGBmaWxlLm5hbWVgLiBUaGUgYWN0dWFsIG5hbWUgb2YgdGhlXG4gICAgICAgICAqIGZpbGUgdGhhdCBnZXRzIHVzZWQgZHVyaW5nIHRoZSB1cGxvYWQgY2FuIGJlIGFjY2Vzc2VkIHRocm91Z2ggYGZpbGUudXBsb2FkLmZpbGVuYW1lYC5cbiAgICAgICAgICovXG4gICAgICAgIHJlbmFtZUZpbGU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGB0cnVlYCB0aGUgZmFsbGJhY2sgd2lsbCBiZSBmb3JjZWQuIFRoaXMgaXMgdmVyeSB1c2VmdWwgdG8gdGVzdCB5b3VyIHNlcnZlclxuICAgICAgICAgKiBpbXBsZW1lbnRhdGlvbnMgZmlyc3QgYW5kIG1ha2Ugc3VyZSB0aGF0IGV2ZXJ5dGhpbmcgd29ya3MgYXNcbiAgICAgICAgICogZXhwZWN0ZWQgd2l0aG91dCBkcm9wem9uZSBpZiB5b3UgZXhwZXJpZW5jZSBwcm9ibGVtcywgYW5kIHRvIHRlc3RcbiAgICAgICAgICogaG93IHlvdXIgZmFsbGJhY2tzIHdpbGwgbG9vay5cbiAgICAgICAgICovXG4gICAgICAgIGZvcmNlRmFsbGJhY2s6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGV4dCB1c2VkIGJlZm9yZSBhbnkgZmlsZXMgYXJlIGRyb3BwZWQuXG4gICAgICAgICAqL1xuICAgICAgICBkaWN0RGVmYXVsdE1lc3NhZ2U6IFwiRHJvcCBmaWxlcyBoZXJlIHRvIHVwbG9hZFwiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGV4dCB0aGF0IHJlcGxhY2VzIHRoZSBkZWZhdWx0IG1lc3NhZ2UgdGV4dCBpdCB0aGUgYnJvd3NlciBpcyBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdEZhbGxiYWNrTWVzc2FnZTogXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBkcmFnJ24nZHJvcCBmaWxlIHVwbG9hZHMuXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBhZGRlZCBiZWZvcmUgdGhlIGZhbGxiYWNrIGZvcm0uXG4gICAgICAgICAqIElmIHlvdSBwcm92aWRlIGEgIGZhbGxiYWNrIGVsZW1lbnQgeW91cnNlbGYsIG9yIGlmIHRoaXMgb3B0aW9uIGlzIGBudWxsYCB0aGlzIHdpbGxcbiAgICAgICAgICogYmUgaWdub3JlZC5cbiAgICAgICAgICovXG4gICAgICAgIGRpY3RGYWxsYmFja1RleHQ6IFwiUGxlYXNlIHVzZSB0aGUgZmFsbGJhY2sgZm9ybSBiZWxvdyB0byB1cGxvYWQgeW91ciBmaWxlcyBsaWtlIGluIHRoZSBvbGRlbiBkYXlzLlwiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0aGUgZmlsZXNpemUgaXMgdG9vIGJpZy5cbiAgICAgICAgICogYHt7ZmlsZXNpemV9fWAgYW5kIGB7e21heEZpbGVzaXplfX1gIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCB0aGUgcmVzcGVjdGl2ZSBjb25maWd1cmF0aW9uIHZhbHVlcy5cbiAgICAgICAgICovXG4gICAgICAgIGRpY3RGaWxlVG9vQmlnOiBcIkZpbGUgaXMgdG9vIGJpZyAoe3tmaWxlc2l6ZX19TWlCKS4gTWF4IGZpbGVzaXplOiB7e21heEZpbGVzaXplfX1NaUIuXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSBmaWxlIGRvZXNuJ3QgbWF0Y2ggdGhlIGZpbGUgdHlwZS5cbiAgICAgICAgICovXG4gICAgICAgIGRpY3RJbnZhbGlkRmlsZVR5cGU6IFwiWW91IGNhbid0IHVwbG9hZCBmaWxlcyBvZiB0aGlzIHR5cGUuXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSBzZXJ2ZXIgcmVzcG9uc2Ugd2FzIGludmFsaWQuXG4gICAgICAgICAqIGB7e3N0YXR1c0NvZGV9fWAgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBzZXJ2ZXJzIHN0YXR1cyBjb2RlLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdFJlc3BvbnNlRXJyb3I6IFwiU2VydmVyIHJlc3BvbmRlZCB3aXRoIHt7c3RhdHVzQ29kZX19IGNvZGUuXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGBhZGRSZW1vdmVMaW5rc2AgaXMgdHJ1ZSwgdGhlIHRleHQgdG8gYmUgdXNlZCBmb3IgdGhlIGNhbmNlbCB1cGxvYWQgbGluay5cbiAgICAgICAgICovXG4gICAgICAgIGRpY3RDYW5jZWxVcGxvYWQ6IFwiQ2FuY2VsIHVwbG9hZFwiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGV4dCB0aGF0IGlzIGRpc3BsYXllZCBpZiBhbiB1cGxvYWQgd2FzIG1hbnVhbGx5IGNhbmNlbGVkXG4gICAgICAgICAqL1xuICAgICAgICBkaWN0VXBsb2FkQ2FuY2VsZWQ6IFwiVXBsb2FkIGNhbmNlbGVkLlwiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBgYWRkUmVtb3ZlTGlua3NgIGlzIHRydWUsIHRoZSB0ZXh0IHRvIGJlIHVzZWQgZm9yIGNvbmZpcm1hdGlvbiB3aGVuIGNhbmNlbGxpbmcgdXBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdENhbmNlbFVwbG9hZENvbmZpcm1hdGlvbjogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gY2FuY2VsIHRoaXMgdXBsb2FkP1wiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBgYWRkUmVtb3ZlTGlua3NgIGlzIHRydWUsIHRoZSB0ZXh0IHRvIGJlIHVzZWQgdG8gcmVtb3ZlIGEgZmlsZS5cbiAgICAgICAgICovXG4gICAgICAgIGRpY3RSZW1vdmVGaWxlOiBcIlJlbW92ZSBmaWxlXCIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoaXMgaXMgbm90IG51bGwsIHRoZW4gdGhlIHVzZXIgd2lsbCBiZSBwcm9tcHRlZCBiZWZvcmUgcmVtb3ZpbmcgYSBmaWxlLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdFJlbW92ZUZpbGVDb25maXJtYXRpb246IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BsYXllZCBpZiBgbWF4RmlsZXNgIGlzIHN0IGFuZCBleGNlZWRlZC5cbiAgICAgICAgICogVGhlIHN0cmluZyBge3ttYXhGaWxlc319YCB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBjb25maWd1cmF0aW9uIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdE1heEZpbGVzRXhjZWVkZWQ6IFwiWW91IGNhbiBub3QgdXBsb2FkIGFueSBtb3JlIGZpbGVzLlwiLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbGxvd3MgeW91IHRvIHRyYW5zbGF0ZSB0aGUgZGlmZmVyZW50IHVuaXRzLiBTdGFydGluZyB3aXRoIGB0YmAgZm9yIHRlcmFieXRlcyBhbmQgZ29pbmcgZG93biB0b1xuICAgICAgICAgKiBgYmAgZm9yIGJ5dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZGljdEZpbGVTaXplVW5pdHM6IHtcbiAgICAgICAgICB0YjogXCJUQlwiLFxuICAgICAgICAgIGdiOiBcIkdCXCIsXG4gICAgICAgICAgbWI6IFwiTUJcIixcbiAgICAgICAgICBrYjogXCJLQlwiLFxuICAgICAgICAgIGI6IFwiYlwiXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCB3aGVuIGRyb3B6b25lIGluaXRpYWxpemVkXG4gICAgICAgICAqIFlvdSBjYW4gYWRkIGV2ZW50IGxpc3RlbmVycyBoZXJlXG4gICAgICAgICAqL1xuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge30sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbiBiZSBhbiAqKm9iamVjdCoqIG9mIGFkZGl0aW9uYWwgcGFyYW1ldGVycyB0byB0cmFuc2ZlciB0byB0aGUgc2VydmVyLCAqKm9yKiogYSBgRnVuY3Rpb25gXG4gICAgICAgICAqIHRoYXQgZ2V0cyBpbnZva2VkIHdpdGggdGhlIGBmaWxlc2AsIGB4aHJgIGFuZCwgaWYgaXQncyBhIGNodW5rZWQgdXBsb2FkLCBgY2h1bmtgIGFyZ3VtZW50cy4gSW4gY2FzZVxuICAgICAgICAgKiBvZiBhIGZ1bmN0aW9uLCB0aGlzIG5lZWRzIHRvIHJldHVybiBhIG1hcC5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gZG9lcyBub3RoaW5nIGZvciBub3JtYWwgdXBsb2FkcywgYnV0IGFkZHMgcmVsZXZhbnQgaW5mb3JtYXRpb24gZm9yXG4gICAgICAgICAqIGNodW5rZWQgdXBsb2Fkcy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhpcyBpcyB0aGUgc2FtZSBhcyBhZGRpbmcgaGlkZGVuIGlucHV0IGZpZWxkcyBpbiB0aGUgZm9ybSBlbGVtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgcGFyYW1zOiBmdW5jdGlvbiBwYXJhbXMoZmlsZXMsIHhociwgY2h1bmspIHtcbiAgICAgICAgICBpZiAoY2h1bmspIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGR6dXVpZDogY2h1bmsuZmlsZS51cGxvYWQudXVpZCxcbiAgICAgICAgICAgICAgZHpjaHVua2luZGV4OiBjaHVuay5pbmRleCxcbiAgICAgICAgICAgICAgZHp0b3RhbGZpbGVzaXplOiBjaHVuay5maWxlLnNpemUsXG4gICAgICAgICAgICAgIGR6Y2h1bmtzaXplOiB0aGlzLm9wdGlvbnMuY2h1bmtTaXplLFxuICAgICAgICAgICAgICBkenRvdGFsY2h1bmtjb3VudDogY2h1bmsuZmlsZS51cGxvYWQudG90YWxDaHVua0NvdW50LFxuICAgICAgICAgICAgICBkemNodW5rYnl0ZW9mZnNldDogY2h1bmsuaW5kZXggKiB0aGlzLm9wdGlvbnMuY2h1bmtTaXplXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQSBmdW5jdGlvbiB0aGF0IGdldHMgYSBbZmlsZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9ET00vRmlsZSlcbiAgICAgICAgICogYW5kIGEgYGRvbmVgIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIElmIHRoZSBkb25lIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIHRoZSBmaWxlIGlzIFwiYWNjZXB0ZWRcIiBhbmQgd2lsbFxuICAgICAgICAgKiBiZSBwcm9jZXNzZWQuIElmIHlvdSBwYXNzIGFuIGVycm9yIG1lc3NhZ2UsIHRoZSBmaWxlIGlzIHJlamVjdGVkLCBhbmQgdGhlIGVycm9yXG4gICAgICAgICAqIG1lc3NhZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQuXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBub3QgYmUgY2FsbGVkIGlmIHRoZSBmaWxlIGlzIHRvbyBiaWcgb3IgZG9lc24ndCBtYXRjaCB0aGUgbWltZSB0eXBlcy5cbiAgICAgICAgICovXG4gICAgICAgIGFjY2VwdDogZnVuY3Rpb24gYWNjZXB0KGZpbGUsIGRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGludm9rZWQgd2hlbiBhbGwgY2h1bmtzIGhhdmUgYmVlbiB1cGxvYWRlZCBmb3IgYSBmaWxlLlxuICAgICAgICAgKiBJdCBnZXRzIHRoZSBmaWxlIGZvciB3aGljaCB0aGUgY2h1bmtzIGhhdmUgYmVlbiB1cGxvYWRlZCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLFxuICAgICAgICAgKiBhbmQgdGhlIGBkb25lYCBmdW5jdGlvbiBhcyBzZWNvbmQuIGBkb25lKClgIG5lZWRzIHRvIGJlIGludm9rZWQgd2hlbiBldmVyeXRoaW5nXG4gICAgICAgICAqIG5lZWRlZCB0byBmaW5pc2ggdGhlIHVwbG9hZCBwcm9jZXNzIGlzIGRvbmUuXG4gICAgICAgICAqL1xuICAgICAgICBjaHVua3NVcGxvYWRlZDogZnVuY3Rpb24gY2h1bmtzVXBsb2FkZWQoZmlsZSwgZG9uZSkge1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyBjYWxsZWQgd2hlbiB0aGUgYnJvd3NlciBpcyBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBzaG93cyB0aGUgZmFsbGJhY2sgaW5wdXQgZmllbGQgYW5kIGFkZHNcbiAgICAgICAgICogYSB0ZXh0LlxuICAgICAgICAgKi9cbiAgICAgICAgZmFsbGJhY2s6IGZ1bmN0aW9uIGZhbGxiYWNrKCkge1xuICAgICAgICAgIC8vIFRoaXMgY29kZSBzaG91bGQgcGFzcyBpbiBJRTcuLi4gOihcbiAgICAgICAgICB2YXIgbWVzc2FnZUVsZW1lbnQ7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9IFwiXCIuY29uY2F0KHRoaXMuZWxlbWVudC5jbGFzc05hbWUsIFwiIGR6LWJyb3dzZXItbm90LXN1cHBvcnRlZFwiKTtcbiAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0aGlzLmVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIilbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgdmFyIGNoaWxkID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgICAgICAgIGlmICgvKF58IClkei1tZXNzYWdlKCR8ICkvLnRlc3QoY2hpbGQuY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50ID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xhc3NOYW1lID0gXCJkei1tZXNzYWdlXCI7IC8vIFJlbW92ZXMgdGhlICdkei1kZWZhdWx0JyBjbGFzc1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMltcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yMltcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFtZXNzYWdlRWxlbWVudCkge1xuICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KFwiPGRpdiBjbGFzcz1cXFwiZHotbWVzc2FnZVxcXCI+PHNwYW4+PC9zcGFuPjwvZGl2PlwiKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHNwYW4gPSBtZXNzYWdlRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNwYW5cIilbMF07XG5cbiAgICAgICAgICBpZiAoc3Bhbikge1xuICAgICAgICAgICAgaWYgKHNwYW4udGV4dENvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBzcGFuLnRleHRDb250ZW50ID0gdGhpcy5vcHRpb25zLmRpY3RGYWxsYmFja01lc3NhZ2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNwYW4uaW5uZXJUZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgc3Bhbi5pbm5lclRleHQgPSB0aGlzLm9wdGlvbnMuZGljdEZhbGxiYWNrTWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZ2V0RmFsbGJhY2tGb3JtKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIGNhbGxlZCB0byBjYWxjdWxhdGUgdGhlIHRodW1ibmFpbCBkaW1lbnNpb25zLlxuICAgICAgICAgKlxuICAgICAgICAgKiBJdCBnZXRzIGBmaWxlYCwgYHdpZHRoYCBhbmQgYGhlaWdodGAgKGJvdGggbWF5IGJlIGBudWxsYCkgYXMgcGFyYW1ldGVycyBhbmQgbXVzdCByZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGBzcmNXaWR0aGAgJiBgc3JjSGVpZ2h0YCAocmVxdWlyZWQpXG4gICAgICAgICAqICAtIGB0cmdXaWR0aGAgJiBgdHJnSGVpZ2h0YCAocmVxdWlyZWQpXG4gICAgICAgICAqICAtIGBzcmNYYCAmIGBzcmNZYCAob3B0aW9uYWwsIGRlZmF1bHQgYDBgKVxuICAgICAgICAgKiAgLSBgdHJnWGAgJiBgdHJnWWAgKG9wdGlvbmFsLCBkZWZhdWx0IGAwYClcbiAgICAgICAgICpcbiAgICAgICAgICogVGhvc2UgdmFsdWVzIGFyZSBnb2luZyB0byBiZSB1c2VkIGJ5IGBjdHguZHJhd0ltYWdlKClgLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVzaXplOiBmdW5jdGlvbiByZXNpemUoZmlsZSwgd2lkdGgsIGhlaWdodCwgcmVzaXplTWV0aG9kKSB7XG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICBzcmNYOiAwLFxuICAgICAgICAgICAgc3JjWTogMCxcbiAgICAgICAgICAgIHNyY1dpZHRoOiBmaWxlLndpZHRoLFxuICAgICAgICAgICAgc3JjSGVpZ2h0OiBmaWxlLmhlaWdodFxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIHNyY1JhdGlvID0gZmlsZS53aWR0aCAvIGZpbGUuaGVpZ2h0OyAvLyBBdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZSBkaW1lbnNpb25zIGlmIG5vdCBzcGVjaWZpZWRcblxuICAgICAgICAgIGlmICh3aWR0aCA9PSBudWxsICYmIGhlaWdodCA9PSBudWxsKSB7XG4gICAgICAgICAgICB3aWR0aCA9IGluZm8uc3JjV2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSBpbmZvLnNyY0hlaWdodDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHdpZHRoID09IG51bGwpIHtcbiAgICAgICAgICAgIHdpZHRoID0gaGVpZ2h0ICogc3JjUmF0aW87XG4gICAgICAgICAgfSBlbHNlIGlmIChoZWlnaHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgaGVpZ2h0ID0gd2lkdGggLyBzcmNSYXRpbztcbiAgICAgICAgICB9IC8vIE1ha2Ugc3VyZSBpbWFnZXMgYXJlbid0IHVwc2NhbGVkXG5cblxuICAgICAgICAgIHdpZHRoID0gTWF0aC5taW4od2lkdGgsIGluZm8uc3JjV2lkdGgpO1xuICAgICAgICAgIGhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgaW5mby5zcmNIZWlnaHQpO1xuICAgICAgICAgIHZhciB0cmdSYXRpbyA9IHdpZHRoIC8gaGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKGluZm8uc3JjV2lkdGggPiB3aWR0aCB8fCBpbmZvLnNyY0hlaWdodCA+IGhlaWdodCkge1xuICAgICAgICAgICAgLy8gSW1hZ2UgaXMgYmlnZ2VyIGFuZCBuZWVkcyByZXNjYWxpbmdcbiAgICAgICAgICAgIGlmIChyZXNpemVNZXRob2QgPT09ICdjcm9wJykge1xuICAgICAgICAgICAgICBpZiAoc3JjUmF0aW8gPiB0cmdSYXRpbykge1xuICAgICAgICAgICAgICAgIGluZm8uc3JjSGVpZ2h0ID0gZmlsZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgaW5mby5zcmNXaWR0aCA9IGluZm8uc3JjSGVpZ2h0ICogdHJnUmF0aW87XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5mby5zcmNXaWR0aCA9IGZpbGUud2lkdGg7XG4gICAgICAgICAgICAgICAgaW5mby5zcmNIZWlnaHQgPSBpbmZvLnNyY1dpZHRoIC8gdHJnUmF0aW87XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzaXplTWV0aG9kID09PSAnY29udGFpbicpIHtcbiAgICAgICAgICAgICAgLy8gTWV0aG9kICdjb250YWluJ1xuICAgICAgICAgICAgICBpZiAoc3JjUmF0aW8gPiB0cmdSYXRpbykge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IHdpZHRoIC8gc3JjUmF0aW87XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzcmNSYXRpbztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biByZXNpemVNZXRob2QgJ1wiLmNvbmNhdChyZXNpemVNZXRob2QsIFwiJ1wiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5mby5zcmNYID0gKGZpbGUud2lkdGggLSBpbmZvLnNyY1dpZHRoKSAvIDI7XG4gICAgICAgICAgaW5mby5zcmNZID0gKGZpbGUuaGVpZ2h0IC0gaW5mby5zcmNIZWlnaHQpIC8gMjtcbiAgICAgICAgICBpbmZvLnRyZ1dpZHRoID0gd2lkdGg7XG4gICAgICAgICAgaW5mby50cmdIZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbiBiZSB1c2VkIHRvIHRyYW5zZm9ybSB0aGUgZmlsZSAoZm9yIGV4YW1wbGUsIHJlc2l6ZSBhbiBpbWFnZSBpZiBuZWNlc3NhcnkpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiB1c2VzIGByZXNpemVXaWR0aGAgYW5kIGByZXNpemVIZWlnaHRgIChpZiBwcm92aWRlZCkgYW5kIHJlc2l6ZXNcbiAgICAgICAgICogaW1hZ2VzIGFjY29yZGluZyB0byB0aG9zZSBkaW1lbnNpb25zLlxuICAgICAgICAgKlxuICAgICAgICAgKiBHZXRzIHRoZSBgZmlsZWAgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciwgYW5kIGEgYGRvbmUoKWAgZnVuY3Rpb24gYXMgdGhlIHNlY29uZCwgdGhhdCBuZWVkc1xuICAgICAgICAgKiB0byBiZSBpbnZva2VkIHdpdGggdGhlIGZpbGUgd2hlbiB0aGUgdHJhbnNmb3JtYXRpb24gaXMgZG9uZS5cbiAgICAgICAgICovXG4gICAgICAgIHRyYW5zZm9ybUZpbGU6IGZ1bmN0aW9uIHRyYW5zZm9ybUZpbGUoZmlsZSwgZG9uZSkge1xuICAgICAgICAgIGlmICgodGhpcy5vcHRpb25zLnJlc2l6ZVdpZHRoIHx8IHRoaXMub3B0aW9ucy5yZXNpemVIZWlnaHQpICYmIGZpbGUudHlwZS5tYXRjaCgvaW1hZ2UuKi8pKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVJbWFnZShmaWxlLCB0aGlzLm9wdGlvbnMucmVzaXplV2lkdGgsIHRoaXMub3B0aW9ucy5yZXNpemVIZWlnaHQsIHRoaXMub3B0aW9ucy5yZXNpemVNZXRob2QsIGRvbmUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZShmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgc3RyaW5nIHRoYXQgY29udGFpbnMgdGhlIHRlbXBsYXRlIHVzZWQgZm9yIGVhY2ggZHJvcHBlZFxuICAgICAgICAgKiBmaWxlLiBDaGFuZ2UgaXQgdG8gZnVsZmlsbCB5b3VyIG5lZWRzIGJ1dCBtYWtlIHN1cmUgdG8gcHJvcGVybHlcbiAgICAgICAgICogcHJvdmlkZSBhbGwgZWxlbWVudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIElmIHlvdSB3YW50IHRvIHVzZSBhbiBhY3R1YWwgSFRNTCBlbGVtZW50IGluc3RlYWQgb2YgcHJvdmlkaW5nIGEgU3RyaW5nXG4gICAgICAgICAqIGFzIGEgY29uZmlnIG9wdGlvbiwgeW91IGNvdWxkIGNyZWF0ZSBhIGRpdiB3aXRoIHRoZSBpZCBgdHBsYCxcbiAgICAgICAgICogcHV0IHRoZSB0ZW1wbGF0ZSBpbnNpZGUgaXQgYW5kIHByb3ZpZGUgdGhlIGVsZW1lbnQgbGlrZSB0aGlzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgZG9jdW1lbnRcbiAgICAgICAgICogICAgICAgLnF1ZXJ5U2VsZWN0b3IoJyN0cGwnKVxuICAgICAgICAgKiAgICAgICAuaW5uZXJIVE1MXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBwcmV2aWV3VGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiZHotcHJldmlldyBkei1maWxlLXByZXZpZXdcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotaW1hZ2VcXFwiPjxpbWcgZGF0YS1kei10aHVtYm5haWwgLz48L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWRldGFpbHNcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkei1zaXplXFxcIj48c3BhbiBkYXRhLWR6LXNpemU+PC9zcGFuPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkei1maWxlbmFtZVxcXCI+PHNwYW4gZGF0YS1kei1uYW1lPjwvc3Bhbj48L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotcHJvZ3Jlc3NcXFwiPjxzcGFuIGNsYXNzPVxcXCJkei11cGxvYWRcXFwiIGRhdGEtZHotdXBsb2FkcHJvZ3Jlc3M+PC9zcGFuPjwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotZXJyb3ItbWVzc2FnZVxcXCI+PHNwYW4gZGF0YS1kei1lcnJvcm1lc3NhZ2U+PC9zcGFuPjwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZHotc3VjY2Vzcy1tYXJrXFxcIj5cXG4gICAgPHN2ZyB3aWR0aD1cXFwiNTRweFxcXCIgaGVpZ2h0PVxcXCI1NHB4XFxcIiB2aWV3Qm94PVxcXCIwIDAgNTQgNTRcXFwiIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCI+XFxuICAgICAgPHRpdGxlPkNoZWNrPC90aXRsZT5cXG4gICAgICA8ZyBzdHJva2U9XFxcIm5vbmVcXFwiIHN0cm9rZS13aWR0aD1cXFwiMVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIj5cXG4gICAgICAgIDxwYXRoIGQ9XFxcIk0yMy41LDMxLjg0MzE0NTggTDE3LjU4NTI0MTksMjUuOTI4Mzg3NyBDMTYuMDI0ODI1MywyNC4zNjc5NzExIDEzLjQ5MTAyOTQsMjQuMzY2ODM1IDExLjkyODkzMjIsMjUuOTI4OTMyMiBDMTAuMzcwMDEzNiwyNy40ODc4NTA4IDEwLjM2NjU5MTIsMzAuMDIzNDQ1NSAxMS45MjgzODc3LDMxLjU4NTI0MTkgTDIwLjQxNDc1ODEsNDAuMDcxNjEyMyBDMjAuNTEzMzk5OSw0MC4xNzAyNTQxIDIwLjYxNTkzMTUsNDAuMjYyNjY0OSAyMC43MjE4NjE1LDQwLjM0ODg0MzUgQzIyLjI4MzU2NjksNDEuODcyNTY1MSAyNC43OTQyMzQsNDEuODYyNjIwMiAyNi4zNDYxNTY0LDQwLjMxMDY5NzggTDQzLjMxMDY5NzgsMjMuMzQ2MTU2NCBDNDQuODc3MTAyMSwyMS43Nzk3NTIxIDQ0Ljg3NTgwNTcsMTkuMjQ4Mzg4NyA0My4zMTM3MDg1LDE3LjY4NjI5MTUgQzQxLjc1NDc4OTksMTYuMTI3MzcyOSAzOS4yMTc2MDM1LDE2LjEyNTU0MjIgMzcuNjUzODQzNiwxNy42ODkzMDIyIEwyMy41LDMxLjg0MzE0NTggWiBNMjcsNTMgQzQxLjM1OTQwMzUsNTMgNTMsNDEuMzU5NDAzNSA1MywyNyBDNTMsMTIuNjQwNTk2NSA0MS4zNTk0MDM1LDEgMjcsMSBDMTIuNjQwNTk2NSwxIDEsMTIuNjQwNTk2NSAxLDI3IEMxLDQxLjM1OTQwMzUgMTIuNjQwNTk2NSw1MyAyNyw1MyBaXFxcIiBzdHJva2Utb3BhY2l0eT1cXFwiMC4xOTg3OTQxNThcXFwiIHN0cm9rZT1cXFwiIzc0NzQ3NFxcXCIgZmlsbC1vcGFjaXR5PVxcXCIwLjgxNjUxOTQ3NVxcXCIgZmlsbD1cXFwiI0ZGRkZGRlxcXCI+PC9wYXRoPlxcbiAgICAgIDwvZz5cXG4gICAgPC9zdmc+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImR6LWVycm9yLW1hcmtcXFwiPlxcbiAgICA8c3ZnIHdpZHRoPVxcXCI1NHB4XFxcIiBoZWlnaHQ9XFxcIjU0cHhcXFwiIHZpZXdCb3g9XFxcIjAgMCA1NCA1NFxcXCIgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIj5cXG4gICAgICA8dGl0bGU+RXJyb3I8L3RpdGxlPlxcbiAgICAgIDxnIHN0cm9rZT1cXFwibm9uZVxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIxXFxcIiBmaWxsPVxcXCJub25lXFxcIiBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiPlxcbiAgICAgICAgPGcgc3Ryb2tlPVxcXCIjNzQ3NDc0XFxcIiBzdHJva2Utb3BhY2l0eT1cXFwiMC4xOTg3OTQxNThcXFwiIGZpbGw9XFxcIiNGRkZGRkZcXFwiIGZpbGwtb3BhY2l0eT1cXFwiMC44MTY1MTk0NzVcXFwiPlxcbiAgICAgICAgICA8cGF0aCBkPVxcXCJNMzIuNjU2ODU0MiwyOSBMMzguMzEwNjk3OCwyMy4zNDYxNTY0IEMzOS44NzcxMDIxLDIxLjc3OTc1MjEgMzkuODc1ODA1NywxOS4yNDgzODg3IDM4LjMxMzcwODUsMTcuNjg2MjkxNSBDMzYuNzU0Nzg5OSwxNi4xMjczNzI5IDM0LjIxNzYwMzUsMTYuMTI1NTQyMiAzMi42NTM4NDM2LDE3LjY4OTMwMjIgTDI3LDIzLjM0MzE0NTggTDIxLjM0NjE1NjQsMTcuNjg5MzAyMiBDMTkuNzgyMzk2NSwxNi4xMjU1NDIyIDE3LjI0NTIxMDEsMTYuMTI3MzcyOSAxNS42ODYyOTE1LDE3LjY4NjI5MTUgQzE0LjEyNDE5NDMsMTkuMjQ4Mzg4NyAxNC4xMjI4OTc5LDIxLjc3OTc1MjEgMTUuNjg5MzAyMiwyMy4zNDYxNTY0IEwyMS4zNDMxNDU4LDI5IEwxNS42ODkzMDIyLDM0LjY1Mzg0MzYgQzE0LjEyMjg5NzksMzYuMjIwMjQ3OSAxNC4xMjQxOTQzLDM4Ljc1MTYxMTMgMTUuNjg2MjkxNSw0MC4zMTM3MDg1IEMxNy4yNDUyMTAxLDQxLjg3MjYyNzEgMTkuNzgyMzk2NSw0MS44NzQ0NTc4IDIxLjM0NjE1NjQsNDAuMzEwNjk3OCBMMjcsMzQuNjU2ODU0MiBMMzIuNjUzODQzNiw0MC4zMTA2OTc4IEMzNC4yMTc2MDM1LDQxLjg3NDQ1NzggMzYuNzU0Nzg5OSw0MS44NzI2MjcxIDM4LjMxMzcwODUsNDAuMzEzNzA4NSBDMzkuODc1ODA1NywzOC43NTE2MTEzIDM5Ljg3NzEwMjEsMzYuMjIwMjQ3OSAzOC4zMTA2OTc4LDM0LjY1Mzg0MzYgTDMyLjY1Njg1NDIsMjkgWiBNMjcsNTMgQzQxLjM1OTQwMzUsNTMgNTMsNDEuMzU5NDAzNSA1MywyNyBDNTMsMTIuNjQwNTk2NSA0MS4zNTk0MDM1LDEgMjcsMSBDMTIuNjQwNTk2NSwxIDEsMTIuNjQwNTk2NSAxLDI3IEMxLDQxLjM1OTQwMzUgMTIuNjQwNTk2NSw1MyAyNyw1MyBaXFxcIj48L3BhdGg+XFxuICAgICAgICA8L2c+XFxuICAgICAgPC9nPlxcbiAgICA8L3N2Zz5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiLFxuICAgICAgICAvLyBFTkQgT1BUSU9OU1xuICAgICAgICAvLyAoUmVxdWlyZWQgYnkgdGhlIGRyb3B6b25lIGRvY3VtZW50YXRpb24gcGFyc2VyKVxuXG4gICAgICAgIC8qXG4gICAgICAgICBUaG9zZSBmdW5jdGlvbnMgcmVnaXN0ZXIgdGhlbXNlbHZlcyB0byB0aGUgZXZlbnRzIG9uIGluaXQgYW5kIGhhbmRsZSBhbGxcbiAgICAgICAgIHRoZSB1c2VyIGludGVyZmFjZSBzcGVjaWZpYyBzdHVmZi4gT3ZlcndyaXRpbmcgdGhlbSB3b24ndCBicmVhayB0aGUgdXBsb2FkXG4gICAgICAgICBidXQgY2FuIGJyZWFrIHRoZSB3YXkgaXQncyBkaXNwbGF5ZWQuXG4gICAgICAgICBZb3UgY2FuIG92ZXJ3cml0ZSB0aGVtIGlmIHlvdSBkb24ndCBsaWtlIHRoZSBkZWZhdWx0IGJlaGF2aW9yLiBJZiB5b3UganVzdFxuICAgICAgICAgd2FudCB0byBhZGQgYW4gYWRkaXRpb25hbCBldmVudCBoYW5kbGVyLCByZWdpc3RlciBpdCBvbiB0aGUgZHJvcHpvbmUgb2JqZWN0XG4gICAgICAgICBhbmQgZG9uJ3Qgb3ZlcndyaXRlIHRob3NlIG9wdGlvbnMuXG4gICAgICAgICAqL1xuICAgICAgICAvLyBUaG9zZSBhcmUgc2VsZiBleHBsYW5hdG9yeSBhbmQgc2ltcGx5IGNvbmNlcm4gdGhlIERyYWduRHJvcC5cbiAgICAgICAgZHJvcDogZnVuY3Rpb24gZHJvcChlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotZHJhZy1ob3ZlclwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgZHJhZ3N0YXJ0OiBmdW5jdGlvbiBkcmFnc3RhcnQoZSkge30sXG4gICAgICAgIGRyYWdlbmQ6IGZ1bmN0aW9uIGRyYWdlbmQoZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIGRyYWdlbnRlcjogZnVuY3Rpb24gZHJhZ2VudGVyKGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1kcmFnLWhvdmVyXCIpO1xuICAgICAgICB9LFxuICAgICAgICBkcmFnb3ZlcjogZnVuY3Rpb24gZHJhZ292ZXIoZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LWRyYWctaG92ZXJcIik7XG4gICAgICAgIH0sXG4gICAgICAgIGRyYWdsZWF2ZTogZnVuY3Rpb24gZHJhZ2xlYXZlKGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1kcmFnLWhvdmVyXCIpO1xuICAgICAgICB9LFxuICAgICAgICBwYXN0ZTogZnVuY3Rpb24gcGFzdGUoZSkge30sXG4gICAgICAgIC8vIENhbGxlZCB3aGVuZXZlciB0aGVyZSBhcmUgbm8gZmlsZXMgbGVmdCBpbiB0aGUgZHJvcHpvbmUgYW55bW9yZSwgYW5kIHRoZVxuICAgICAgICAvLyBkcm9wem9uZSBzaG91bGQgYmUgZGlzcGxheWVkIGFzIGlmIGluIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgICAgICByZXNldDogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotc3RhcnRlZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSBmaWxlIGlzIGFkZGVkIHRvIHRoZSBxdWV1ZVxuICAgICAgICAvLyBSZWNlaXZlcyBgZmlsZWBcbiAgICAgICAgYWRkZWRmaWxlOiBmdW5jdGlvbiBhZGRlZGZpbGUoZmlsZSkge1xuICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgaWYgKHRoaXMuZWxlbWVudCA9PT0gdGhpcy5wcmV2aWV3c0NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1zdGFydGVkXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLnByZXZpZXdzQ29udGFpbmVyKSB7XG4gICAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50ID0gRHJvcHpvbmUuY3JlYXRlRWxlbWVudCh0aGlzLm9wdGlvbnMucHJldmlld1RlbXBsYXRlLnRyaW0oKSk7XG4gICAgICAgICAgICBmaWxlLnByZXZpZXdUZW1wbGF0ZSA9IGZpbGUucHJldmlld0VsZW1lbnQ7IC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cbiAgICAgICAgICAgIHRoaXMucHJldmlld3NDb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsZS5wcmV2aWV3RWxlbWVudCk7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMyA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LW5hbWVdXCIpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAzOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gKF9zdGVwMyA9IF9pdGVyYXRvcjMubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBfc3RlcDMudmFsdWU7XG4gICAgICAgICAgICAgICAgbm9kZS50ZXh0Q29udGVudCA9IGZpbGUubmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzW1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjNbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yNCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yNCA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LXNpemVdXCIpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IF9zdGVwNC52YWx1ZTtcbiAgICAgICAgICAgICAgICBub2RlLmlubmVySFRNTCA9IHRoaXMuZmlsZXNpemUoZmlsZS5zaXplKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yNCA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNCAmJiBfaXRlcmF0b3I0W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjRbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yNCkge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkZFJlbW92ZUxpbmtzKSB7XG4gICAgICAgICAgICAgIGZpbGUuX3JlbW92ZUxpbmsgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KFwiPGEgY2xhc3M9XFxcImR6LXJlbW92ZVxcXCIgaHJlZj1cXFwiamF2YXNjcmlwdDp1bmRlZmluZWQ7XFxcIiBkYXRhLWR6LXJlbW92ZT5cIi5jb25jYXQodGhpcy5vcHRpb25zLmRpY3RSZW1vdmVGaWxlLCBcIjwvYT5cIikpO1xuICAgICAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LmFwcGVuZENoaWxkKGZpbGUuX3JlbW92ZUxpbmspO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlRmlsZUV2ZW50ID0gZnVuY3Rpb24gcmVtb3ZlRmlsZUV2ZW50KGUpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuVVBMT0FESU5HKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIERyb3B6b25lLmNvbmZpcm0oX3RoaXMyLm9wdGlvbnMuZGljdENhbmNlbFVwbG9hZENvbmZpcm1hdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5yZW1vdmVGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpczIub3B0aW9ucy5kaWN0UmVtb3ZlRmlsZUNvbmZpcm1hdGlvbikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIERyb3B6b25lLmNvbmZpcm0oX3RoaXMyLm9wdGlvbnMuZGljdFJlbW92ZUZpbGVDb25maXJtYXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5yZW1vdmVGaWxlKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczIucmVtb3ZlRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I1ID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3I1ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I1ID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotcmVtb3ZlXVwiKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwNTsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNSA9IChfc3RlcDUgPSBfaXRlcmF0b3I1Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb241ID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdmVMaW5rID0gX3N0ZXA1LnZhbHVlO1xuICAgICAgICAgICAgICAgIHJlbW92ZUxpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJlbW92ZUZpbGVFdmVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjUgPSB0cnVlO1xuICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjUgPSBlcnI7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjUgJiYgX2l0ZXJhdG9yNVtcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBfaXRlcmF0b3I1W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjUpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yNTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhbGxlZCB3aGVuZXZlciBhIGZpbGUgaXMgcmVtb3ZlZC5cbiAgICAgICAgcmVtb3ZlZGZpbGU6IGZ1bmN0aW9uIHJlbW92ZWRmaWxlKGZpbGUpIHtcbiAgICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCAhPSBudWxsICYmIGZpbGUucHJldmlld0VsZW1lbnQucGFyZW50Tm9kZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBmaWxlLnByZXZpZXdFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZmlsZS5wcmV2aWV3RWxlbWVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZU1heEZpbGVzUmVhY2hlZENsYXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIGEgdGh1bWJuYWlsIGhhcyBiZWVuIGdlbmVyYXRlZFxuICAgICAgICAvLyBSZWNlaXZlcyBgZmlsZWAgYW5kIGBkYXRhVXJsYFxuICAgICAgICB0aHVtYm5haWw6IGZ1bmN0aW9uIHRodW1ibmFpbChmaWxlLCBkYXRhVXJsKSB7XG4gICAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImR6LWZpbGUtcHJldmlld1wiKTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNiA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I2ID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3I2ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I2ID0gZmlsZS5wcmV2aWV3RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHotdGh1bWJuYWlsXVwiKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwNjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNiA9IChfc3RlcDYgPSBfaXRlcmF0b3I2Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb242ID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0aHVtYm5haWxFbGVtZW50ID0gX3N0ZXA2LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQuYWx0ID0gZmlsZS5uYW1lO1xuICAgICAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQuc3JjID0gZGF0YVVybDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNiA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yNiA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uNiAmJiBfaXRlcmF0b3I2W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjZbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yNikge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmaWxlLnByZXZpZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkei1pbWFnZS1wcmV2aWV3XCIpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBDYWxsZWQgd2hlbmV2ZXIgYW4gZXJyb3Igb2NjdXJzXG4gICAgICAgIC8vIFJlY2VpdmVzIGBmaWxlYCBhbmQgYG1lc3NhZ2VgXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiBlcnJvcihmaWxlLCBtZXNzYWdlKSB7XG4gICAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LWVycm9yXCIpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09IFwiU3RyaW5nXCIgJiYgbWVzc2FnZS5lcnJvcikge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5lcnJvcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb243ID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjcgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjcgPSBmaWxlLnByZXZpZXdFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kei1lcnJvcm1lc3NhZ2VdXCIpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA3OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb243ID0gKF9zdGVwNyA9IF9pdGVyYXRvcjcubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjcgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBfc3RlcDcudmFsdWU7XG4gICAgICAgICAgICAgICAgbm9kZS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjcgPSB0cnVlO1xuICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjcgPSBlcnI7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjcgJiYgX2l0ZXJhdG9yN1tcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBfaXRlcmF0b3I3W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjcpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yNztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9ybXVsdGlwbGU6IGZ1bmN0aW9uIGVycm9ybXVsdGlwbGUoKSB7fSxcbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSBmaWxlIGdldHMgcHJvY2Vzc2VkLiBTaW5jZSB0aGVyZSBpcyBhIGN1ZSwgbm90IGFsbCBhZGRlZFxuICAgICAgICAvLyBmaWxlcyBhcmUgcHJvY2Vzc2VkIGltbWVkaWF0ZWx5LlxuICAgICAgICAvLyBSZWNlaXZlcyBgZmlsZWBcbiAgICAgICAgcHJvY2Vzc2luZzogZnVuY3Rpb24gcHJvY2Vzc2luZyhmaWxlKSB7XG4gICAgICAgICAgaWYgKGZpbGUucHJldmlld0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LXByb2Nlc3NpbmdcIik7XG5cbiAgICAgICAgICAgIGlmIChmaWxlLl9yZW1vdmVMaW5rKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmaWxlLl9yZW1vdmVMaW5rLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kaWN0Q2FuY2VsVXBsb2FkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2Vzc2luZ211bHRpcGxlOiBmdW5jdGlvbiBwcm9jZXNzaW5nbXVsdGlwbGUoKSB7fSxcbiAgICAgICAgLy8gQ2FsbGVkIHdoZW5ldmVyIHRoZSB1cGxvYWQgcHJvZ3Jlc3MgZ2V0cyB1cGRhdGVkLlxuICAgICAgICAvLyBSZWNlaXZlcyBgZmlsZWAsIGBwcm9ncmVzc2AgKHBlcmNlbnRhZ2UgMC0xMDApIGFuZCBgYnl0ZXNTZW50YC5cbiAgICAgICAgLy8gVG8gZ2V0IHRoZSB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgb2YgdGhlIGZpbGUsIHVzZSBgZmlsZS5zaXplYFxuICAgICAgICB1cGxvYWRwcm9ncmVzczogZnVuY3Rpb24gdXBsb2FkcHJvZ3Jlc3MoZmlsZSwgcHJvZ3Jlc3MsIGJ5dGVzU2VudCkge1xuICAgICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjggPSB0cnVlO1xuICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yOCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yOCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yOCA9IGZpbGUucHJldmlld0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWR6LXVwbG9hZHByb2dyZXNzXVwiKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwODsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uOCA9IChfc3RlcDggPSBfaXRlcmF0b3I4Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb244ID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gX3N0ZXA4LnZhbHVlO1xuICAgICAgICAgICAgICAgIG5vZGUubm9kZU5hbWUgPT09ICdQUk9HUkVTUycgPyBub2RlLnZhbHVlID0gcHJvZ3Jlc3MgOiBub2RlLnN0eWxlLndpZHRoID0gXCJcIi5jb25jYXQocHJvZ3Jlc3MsIFwiJVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yOCA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yOCA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uOCAmJiBfaXRlcmF0b3I4W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjhbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yOCkge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gQ2FsbGVkIHdoZW5ldmVyIHRoZSB0b3RhbCB1cGxvYWQgcHJvZ3Jlc3MgZ2V0cyB1cGRhdGVkLlxuICAgICAgICAvLyBDYWxsZWQgd2l0aCB0b3RhbFVwbG9hZFByb2dyZXNzICgwLTEwMCksIHRvdGFsQnl0ZXMgYW5kIHRvdGFsQnl0ZXNTZW50XG4gICAgICAgIHRvdGFsdXBsb2FkcHJvZ3Jlc3M6IGZ1bmN0aW9uIHRvdGFsdXBsb2FkcHJvZ3Jlc3MoKSB7fSxcbiAgICAgICAgLy8gQ2FsbGVkIGp1c3QgYmVmb3JlIHRoZSBmaWxlIGlzIHNlbnQuIEdldHMgdGhlIGB4aHJgIG9iamVjdCBhcyBzZWNvbmRcbiAgICAgICAgLy8gcGFyYW1ldGVyLCBzbyB5b3UgY2FuIG1vZGlmeSBpdCAoZm9yIGV4YW1wbGUgdG8gYWRkIGEgQ1NSRiB0b2tlbikgYW5kIGFcbiAgICAgICAgLy8gYGZvcm1EYXRhYCBvYmplY3QgdG8gYWRkIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAgICAgIHNlbmRpbmc6IGZ1bmN0aW9uIHNlbmRpbmcoKSB7fSxcbiAgICAgICAgc2VuZGluZ211bHRpcGxlOiBmdW5jdGlvbiBzZW5kaW5nbXVsdGlwbGUoKSB7fSxcbiAgICAgICAgLy8gV2hlbiB0aGUgY29tcGxldGUgdXBsb2FkIGlzIGZpbmlzaGVkIGFuZCBzdWNjZXNzZnVsXG4gICAgICAgIC8vIFJlY2VpdmVzIGBmaWxlYFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiBzdWNjZXNzKGZpbGUpIHtcbiAgICAgICAgICBpZiAoZmlsZS5wcmV2aWV3RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGUucHJldmlld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LXN1Y2Nlc3NcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzbXVsdGlwbGU6IGZ1bmN0aW9uIHN1Y2Nlc3NtdWx0aXBsZSgpIHt9LFxuICAgICAgICAvLyBXaGVuIHRoZSB1cGxvYWQgaXMgY2FuY2VsZWQuXG4gICAgICAgIGNhbmNlbGVkOiBmdW5jdGlvbiBjYW5jZWxlZChmaWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdChcImVycm9yXCIsIGZpbGUsIHRoaXMub3B0aW9ucy5kaWN0VXBsb2FkQ2FuY2VsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBjYW5jZWxlZG11bHRpcGxlOiBmdW5jdGlvbiBjYW5jZWxlZG11bHRpcGxlKCkge30sXG4gICAgICAgIC8vIFdoZW4gdGhlIHVwbG9hZCBpcyBmaW5pc2hlZCwgZWl0aGVyIHdpdGggc3VjY2VzcyBvciBhbiBlcnJvci5cbiAgICAgICAgLy8gUmVjZWl2ZXMgYGZpbGVgXG4gICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiBjb21wbGV0ZShmaWxlKSB7XG4gICAgICAgICAgaWYgKGZpbGUuX3JlbW92ZUxpbmspIHtcbiAgICAgICAgICAgIGZpbGUuX3JlbW92ZUxpbmsuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmRpY3RSZW1vdmVGaWxlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaWxlLnByZXZpZXdFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZS5wcmV2aWV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotY29tcGxldGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZW11bHRpcGxlOiBmdW5jdGlvbiBjb21wbGV0ZW11bHRpcGxlKCkge30sXG4gICAgICAgIG1heGZpbGVzZXhjZWVkZWQ6IGZ1bmN0aW9uIG1heGZpbGVzZXhjZWVkZWQoKSB7fSxcbiAgICAgICAgbWF4ZmlsZXNyZWFjaGVkOiBmdW5jdGlvbiBtYXhmaWxlc3JlYWNoZWQoKSB7fSxcbiAgICAgICAgcXVldWVjb21wbGV0ZTogZnVuY3Rpb24gcXVldWVjb21wbGV0ZSgpIHt9LFxuICAgICAgICBhZGRlZGZpbGVzOiBmdW5jdGlvbiBhZGRlZGZpbGVzKCkge31cbiAgICAgIH07XG4gICAgICB0aGlzLnByb3RvdHlwZS5fdGh1bWJuYWlsUXVldWUgPSBbXTtcbiAgICAgIHRoaXMucHJvdG90eXBlLl9wcm9jZXNzaW5nVGh1bWJuYWlsID0gZmFsc2U7XG4gICAgfSAvLyBnbG9iYWwgdXRpbGl0eVxuXG4gIH0sIHtcbiAgICBrZXk6IFwiZXh0ZW5kXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgb2JqZWN0cyA9IG5ldyBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIG9iamVjdHNbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9pID0gMCwgX29iamVjdHMgPSBvYmplY3RzOyBfaSA8IF9vYmplY3RzLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgb2JqZWN0ID0gX29iamVjdHNbX2ldO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICB2YXIgdmFsID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gIH1dKTtcblxuICBmdW5jdGlvbiBEcm9wem9uZShlbCwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcztcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEcm9wem9uZSk7XG5cbiAgICBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9nZXRQcm90b3R5cGVPZihEcm9wem9uZSkuY2FsbCh0aGlzKSk7XG4gICAgdmFyIGZhbGxiYWNrLCBsZWZ0O1xuICAgIF90aGlzLmVsZW1lbnQgPSBlbDsgLy8gRm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHNpbmNlIHRoZSB2ZXJzaW9uIHdhcyBpbiB0aGUgcHJvdG90eXBlIHByZXZpb3VzbHlcblxuICAgIF90aGlzLnZlcnNpb24gPSBEcm9wem9uZS52ZXJzaW9uO1xuICAgIF90aGlzLmRlZmF1bHRPcHRpb25zLnByZXZpZXdUZW1wbGF0ZSA9IF90aGlzLmRlZmF1bHRPcHRpb25zLnByZXZpZXdUZW1wbGF0ZS5yZXBsYWNlKC9cXG4qL2csIFwiXCIpO1xuICAgIF90aGlzLmNsaWNrYWJsZUVsZW1lbnRzID0gW107XG4gICAgX3RoaXMubGlzdGVuZXJzID0gW107XG4gICAgX3RoaXMuZmlsZXMgPSBbXTsgLy8gQWxsIGZpbGVzXG5cbiAgICBpZiAodHlwZW9mIF90aGlzLmVsZW1lbnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIF90aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKF90aGlzLmVsZW1lbnQpO1xuICAgIH0gLy8gTm90IGNoZWNraW5nIGlmIGluc3RhbmNlIG9mIEhUTUxFbGVtZW50IG9yIEVsZW1lbnQgc2luY2UgSUU5IGlzIGV4dHJlbWVseSB3ZWlyZC5cblxuXG4gICAgaWYgKCFfdGhpcy5lbGVtZW50IHx8IF90aGlzLmVsZW1lbnQubm9kZVR5cGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBkcm9wem9uZSBlbGVtZW50LlwiKTtcbiAgICB9XG5cbiAgICBpZiAoX3RoaXMuZWxlbWVudC5kcm9wem9uZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHJvcHpvbmUgYWxyZWFkeSBhdHRhY2hlZC5cIik7XG4gICAgfSAvLyBOb3cgYWRkIHRoaXMgZHJvcHpvbmUgdG8gdGhlIGluc3RhbmNlcy5cblxuXG4gICAgRHJvcHpvbmUuaW5zdGFuY2VzLnB1c2goX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcykpOyAvLyBQdXQgdGhlIGRyb3B6b25lIGluc2lkZSB0aGUgZWxlbWVudCBpdHNlbGYuXG5cbiAgICBfdGhpcy5lbGVtZW50LmRyb3B6b25lID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyk7XG4gICAgdmFyIGVsZW1lbnRPcHRpb25zID0gKGxlZnQgPSBEcm9wem9uZS5vcHRpb25zRm9yRWxlbWVudChfdGhpcy5lbGVtZW50KSkgIT0gbnVsbCA/IGxlZnQgOiB7fTtcbiAgICBfdGhpcy5vcHRpb25zID0gRHJvcHpvbmUuZXh0ZW5kKHt9LCBfdGhpcy5kZWZhdWx0T3B0aW9ucywgZWxlbWVudE9wdGlvbnMsIG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMgOiB7fSk7IC8vIElmIHRoZSBicm93c2VyIGZhaWxlZCwganVzdCBjYWxsIHRoZSBmYWxsYmFjayBhbmQgbGVhdmVcblxuICAgIGlmIChfdGhpcy5vcHRpb25zLmZvcmNlRmFsbGJhY2sgfHwgIURyb3B6b25lLmlzQnJvd3NlclN1cHBvcnRlZCgpKSB7XG4gICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMsIF90aGlzLm9wdGlvbnMuZmFsbGJhY2suY2FsbChfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSkpO1xuICAgIH0gLy8gQG9wdGlvbnMudXJsID0gQGVsZW1lbnQuZ2V0QXR0cmlidXRlIFwiYWN0aW9uXCIgdW5sZXNzIEBvcHRpb25zLnVybD9cblxuXG4gICAgaWYgKF90aGlzLm9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgIF90aGlzLm9wdGlvbnMudXJsID0gX3RoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJhY3Rpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKCFfdGhpcy5vcHRpb25zLnVybCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gVVJMIHByb3ZpZGVkLlwiKTtcbiAgICB9XG5cbiAgICBpZiAoX3RoaXMub3B0aW9ucy5hY2NlcHRlZEZpbGVzICYmIF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW4ndCBwcm92aWRlIGJvdGggJ2FjY2VwdGVkRmlsZXMnIGFuZCAnYWNjZXB0ZWRNaW1lVHlwZXMnLiAnYWNjZXB0ZWRNaW1lVHlwZXMnIGlzIGRlcHJlY2F0ZWQuXCIpO1xuICAgIH1cblxuICAgIGlmIChfdGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlICYmIF90aGlzLm9wdGlvbnMuY2h1bmtpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbm5vdCBzZXQgYm90aDogdXBsb2FkTXVsdGlwbGUgYW5kIGNodW5raW5nLicpO1xuICAgIH0gLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHlcblxuXG4gICAgaWYgKF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXMpIHtcbiAgICAgIF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcyA9IF90aGlzLm9wdGlvbnMuYWNjZXB0ZWRNaW1lVHlwZXM7XG4gICAgICBkZWxldGUgX3RoaXMub3B0aW9ucy5hY2NlcHRlZE1pbWVUeXBlcztcbiAgICB9IC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cblxuICAgIGlmIChfdGhpcy5vcHRpb25zLnJlbmFtZUZpbGVuYW1lICE9IG51bGwpIHtcbiAgICAgIF90aGlzLm9wdGlvbnMucmVuYW1lRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5vcHRpb25zLnJlbmFtZUZpbGVuYW1lLmNhbGwoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIGZpbGUubmFtZSwgZmlsZSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIF90aGlzLm9wdGlvbnMubWV0aG9kID0gX3RoaXMub3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKTtcblxuICAgIGlmICgoZmFsbGJhY2sgPSBfdGhpcy5nZXRFeGlzdGluZ0ZhbGxiYWNrKCkpICYmIGZhbGxiYWNrLnBhcmVudE5vZGUpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgZmFsbGJhY2tcbiAgICAgIGZhbGxiYWNrLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZmFsbGJhY2spO1xuICAgIH0gLy8gRGlzcGxheSBwcmV2aWV3cyBpbiB0aGUgcHJldmlld3NDb250YWluZXIgZWxlbWVudCBvciB0aGUgRHJvcHpvbmUgZWxlbWVudCB1bmxlc3MgZXhwbGljaXRseSBzZXQgdG8gZmFsc2VcblxuXG4gICAgaWYgKF90aGlzLm9wdGlvbnMucHJldmlld3NDb250YWluZXIgIT09IGZhbHNlKSB7XG4gICAgICBpZiAoX3RoaXMub3B0aW9ucy5wcmV2aWV3c0NvbnRhaW5lcikge1xuICAgICAgICBfdGhpcy5wcmV2aWV3c0NvbnRhaW5lciA9IERyb3B6b25lLmdldEVsZW1lbnQoX3RoaXMub3B0aW9ucy5wcmV2aWV3c0NvbnRhaW5lciwgXCJwcmV2aWV3c0NvbnRhaW5lclwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnByZXZpZXdzQ29udGFpbmVyID0gX3RoaXMuZWxlbWVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX3RoaXMub3B0aW9ucy5jbGlja2FibGUpIHtcbiAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsaWNrYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICBfdGhpcy5jbGlja2FibGVFbGVtZW50cyA9IFtfdGhpcy5lbGVtZW50XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLmNsaWNrYWJsZUVsZW1lbnRzID0gRHJvcHpvbmUuZ2V0RWxlbWVudHMoX3RoaXMub3B0aW9ucy5jbGlja2FibGUsIFwiY2xpY2thYmxlXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF90aGlzLmluaXQoKTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfSAvLyBSZXR1cm5zIGFsbCBmaWxlcyB0aGF0IGhhdmUgYmVlbiBhY2NlcHRlZFxuXG5cbiAgX2NyZWF0ZUNsYXNzKERyb3B6b25lLCBbe1xuICAgIGtleTogXCJnZXRBY2NlcHRlZEZpbGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEFjY2VwdGVkRmlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGUuYWNjZXB0ZWQ7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9KTtcbiAgICB9IC8vIFJldHVybnMgYWxsIGZpbGVzIHRoYXQgaGF2ZSBiZWVuIHJlamVjdGVkXG4gICAgLy8gTm90IHN1cmUgd2hlbiB0aGF0J3MgZ29pbmcgdG8gYmUgdXNlZnVsLCBidXQgYWRkZWQgZm9yIGNvbXBsZXRlbmVzcy5cblxuICB9LCB7XG4gICAga2V5OiBcImdldFJlamVjdGVkRmlsZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UmVqZWN0ZWRGaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gIWZpbGUuYWNjZXB0ZWQ7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0RmlsZXNXaXRoU3RhdHVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZpbGVzV2l0aFN0YXR1cyhzdGF0dXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gZmlsZS5zdGF0dXMgPT09IHN0YXR1cztcbiAgICAgIH0pLm1hcChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH0pO1xuICAgIH0gLy8gUmV0dXJucyBhbGwgZmlsZXMgdGhhdCBhcmUgaW4gdGhlIHF1ZXVlXG5cbiAgfSwge1xuICAgIGtleTogXCJnZXRRdWV1ZWRGaWxlc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRRdWV1ZWRGaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5RVUVVRUQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRVcGxvYWRpbmdGaWxlc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRVcGxvYWRpbmdGaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGVzV2l0aFN0YXR1cyhEcm9wem9uZS5VUExPQURJTkcpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRBZGRlZEZpbGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEFkZGVkRmlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaWxlc1dpdGhTdGF0dXMoRHJvcHpvbmUuQURERUQpO1xuICAgIH0gLy8gRmlsZXMgdGhhdCBhcmUgZWl0aGVyIHF1ZXVlZCBvciB1cGxvYWRpbmdcblxuICB9LCB7XG4gICAga2V5OiBcImdldEFjdGl2ZUZpbGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEFjdGl2ZUZpbGVzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZXMuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuVVBMT0FESU5HIHx8IGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5RVUVVRUQ7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9KTtcbiAgICB9IC8vIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIHdoZW4gRHJvcHpvbmUgaXMgaW5pdGlhbGl6ZWQuIFlvdVxuICAgIC8vIGNhbiAoYW5kIHNob3VsZCkgc2V0dXAgZXZlbnQgbGlzdGVuZXJzIGluc2lkZSB0aGlzIGZ1bmN0aW9uLlxuXG4gIH0sIHtcbiAgICBrZXk6IFwiaW5pdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIC8vIEluIGNhc2UgaXQgaXNuJ3Qgc2V0IGFscmVhZHlcbiAgICAgIGlmICh0aGlzLmVsZW1lbnQudGFnTmFtZSA9PT0gXCJmb3JtXCIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImVuY3R5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpICYmICF0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5kei1tZXNzYWdlXCIpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChEcm9wem9uZS5jcmVhdGVFbGVtZW50KFwiPGRpdiBjbGFzcz1cXFwiZHotZGVmYXVsdCBkei1tZXNzYWdlXFxcIj48YnV0dG9uIGNsYXNzPVxcXCJkei1idXR0b25cXFwiIHR5cGU9XFxcImJ1dHRvblxcXCI+XCIuY29uY2F0KHRoaXMub3B0aW9ucy5kaWN0RGVmYXVsdE1lc3NhZ2UsIFwiPC9idXR0b24+PC9kaXY+XCIpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICB2YXIgc2V0dXBIaWRkZW5GaWxlSW5wdXQgPSBmdW5jdGlvbiBzZXR1cEhpZGRlbkZpbGVJbnB1dCgpIHtcbiAgICAgICAgICBpZiAoX3RoaXMzLmhpZGRlbkZpbGVJbnB1dCkge1xuICAgICAgICAgICAgX3RoaXMzLmhpZGRlbkZpbGVJbnB1dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKF90aGlzMy5oaWRkZW5GaWxlSW5wdXQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzMy5oaWRkZW5GaWxlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG5cbiAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJmaWxlXCIpO1xuXG4gICAgICAgICAgaWYgKF90aGlzMy5vcHRpb25zLm1heEZpbGVzID09PSBudWxsIHx8IF90aGlzMy5vcHRpb25zLm1heEZpbGVzID4gMSkge1xuICAgICAgICAgICAgX3RoaXMzLmhpZGRlbkZpbGVJbnB1dC5zZXRBdHRyaWJ1dGUoXCJtdWx0aXBsZVwiLCBcIm11bHRpcGxlXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzMy5oaWRkZW5GaWxlSW5wdXQuY2xhc3NOYW1lID0gXCJkei1oaWRkZW4taW5wdXRcIjtcblxuICAgICAgICAgIGlmIChfdGhpczMub3B0aW9ucy5hY2NlcHRlZEZpbGVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LnNldEF0dHJpYnV0ZShcImFjY2VwdFwiLCBfdGhpczMub3B0aW9ucy5hY2NlcHRlZEZpbGVzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoX3RoaXMzLm9wdGlvbnMuY2FwdHVyZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgX3RoaXMzLmhpZGRlbkZpbGVJbnB1dC5zZXRBdHRyaWJ1dGUoXCJjYXB0dXJlXCIsIF90aGlzMy5vcHRpb25zLmNhcHR1cmUpO1xuICAgICAgICAgIH0gLy8gTm90IHNldHRpbmcgYGRpc3BsYXk9XCJub25lXCJgIGJlY2F1c2Ugc29tZSBicm93c2VycyBkb24ndCBhY2NlcHQgY2xpY2tzXG4gICAgICAgICAgLy8gb24gZWxlbWVudHMgdGhhdCBhcmVuJ3QgZGlzcGxheWVkLlxuXG5cbiAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAgIF90aGlzMy5oaWRkZW5GaWxlSW5wdXQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgICAgX3RoaXMzLmhpZGRlbkZpbGVJbnB1dC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LnN0eWxlLmhlaWdodCA9IFwiMFwiO1xuICAgICAgICAgIF90aGlzMy5oaWRkZW5GaWxlSW5wdXQuc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgICAgICAgICBEcm9wem9uZS5nZXRFbGVtZW50KF90aGlzMy5vcHRpb25zLmhpZGRlbklucHV0Q29udGFpbmVyLCAnaGlkZGVuSW5wdXRDb250YWluZXInKS5hcHBlbmRDaGlsZChfdGhpczMuaGlkZGVuRmlsZUlucHV0KTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMzLmhpZGRlbkZpbGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IF90aGlzMy5oaWRkZW5GaWxlSW5wdXQuZmlsZXM7XG5cbiAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb245ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yOSA9IGZhbHNlO1xuICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3I5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yOSA9IGZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA5OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb245ID0gKF9zdGVwOSA9IF9pdGVyYXRvcjkubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjkgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IF9zdGVwOS52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgX3RoaXMzLmFkZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yOSA9IGVycjtcbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uOSAmJiBfaXRlcmF0b3I5W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yOVtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yOTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMzLmVtaXQoXCJhZGRlZGZpbGVzXCIsIGZpbGVzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNldHVwSGlkZGVuRmlsZUlucHV0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2V0dXBIaWRkZW5GaWxlSW5wdXQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5VUkwgPSB3aW5kb3cuVVJMICE9PSBudWxsID8gd2luZG93LlVSTCA6IHdpbmRvdy53ZWJraXRVUkw7IC8vIFNldHVwIGFsbCBldmVudCBsaXN0ZW5lcnMgb24gdGhlIERyb3B6b25lIG9iamVjdCBpdHNlbGYuXG4gICAgICAvLyBUaGV5J3JlIG5vdCBpbiBAc2V0dXBFdmVudExpc3RlbmVycygpIGJlY2F1c2UgdGhleSBzaG91bGRuJ3QgYmUgcmVtb3ZlZFxuICAgICAgLy8gYWdhaW4gd2hlbiB0aGUgZHJvcHpvbmUgZ2V0cyBkaXNhYmxlZC5cblxuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMCA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IxMCA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yMTAgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjEwID0gdGhpcy5ldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDEwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMCA9IChfc3RlcDEwID0gX2l0ZXJhdG9yMTAubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjEwID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBldmVudE5hbWUgPSBfc3RlcDEwLnZhbHVlO1xuICAgICAgICAgIHRoaXMub24oZXZlbnROYW1lLCB0aGlzLm9wdGlvbnNbZXZlbnROYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjEwID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IxMCA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTAgJiYgX2l0ZXJhdG9yMTBbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMTBbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTApIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMTA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMub24oXCJ1cGxvYWRwcm9ncmVzc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczMudXBkYXRlVG90YWxVcGxvYWRQcm9ncmVzcygpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm9uKFwicmVtb3ZlZGZpbGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMzLnVwZGF0ZVRvdGFsVXBsb2FkUHJvZ3Jlc3MoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5vbihcImNhbmNlbGVkXCIsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBfdGhpczMuZW1pdChcImNvbXBsZXRlXCIsIGZpbGUpO1xuICAgICAgfSk7IC8vIEVtaXQgYSBgcXVldWVjb21wbGV0ZWAgZXZlbnQgaWYgYWxsIGZpbGVzIGZpbmlzaGVkIHVwbG9hZGluZy5cblxuICAgICAgdGhpcy5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIGlmIChfdGhpczMuZ2V0QWRkZWRGaWxlcygpLmxlbmd0aCA9PT0gMCAmJiBfdGhpczMuZ2V0VXBsb2FkaW5nRmlsZXMoKS5sZW5ndGggPT09IDAgJiYgX3RoaXMzLmdldFF1ZXVlZEZpbGVzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBiZSBkZWZlcnJlZCBzbyB0aGF0IGBxdWV1ZWNvbXBsZXRlYCByZWFsbHkgdHJpZ2dlcnMgYWZ0ZXIgYGNvbXBsZXRlYFxuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczMuZW1pdChcInF1ZXVlY29tcGxldGVcIik7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY29udGFpbnNGaWxlcyA9IGZ1bmN0aW9uIGNvbnRhaW5zRmlsZXMoZSkge1xuICAgICAgICByZXR1cm4gZS5kYXRhVHJhbnNmZXIudHlwZXMgJiYgZS5kYXRhVHJhbnNmZXIudHlwZXMuc29tZShmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgIHJldHVybiB0eXBlID09IFwiRmlsZXNcIjtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgbm9Qcm9wYWdhdGlvbiA9IGZ1bmN0aW9uIG5vUHJvcGFnYXRpb24oZSkge1xuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gZmlsZXMsIHdlIGRvbid0IHdhbnQgdG8gc3RvcFxuICAgICAgICAvLyBwcm9wYWdhdGlvbiBzbyB3ZSBkb24ndCBpbnRlcmZlcmUgd2l0aCBvdGhlclxuICAgICAgICAvLyBkcmFnIGFuZCBkcm9wIGJlaGF2aW91ci5cbiAgICAgICAgaWYgKCFjb250YWluc0ZpbGVzKGUpKSByZXR1cm47XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICByZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBlLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH07IC8vIENyZWF0ZSB0aGUgbGlzdGVuZXJzXG5cblxuICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbe1xuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgIFwiZHJhZ3N0YXJ0XCI6IGZ1bmN0aW9uIGRyYWdzdGFydChlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMzLmVtaXQoXCJkcmFnc3RhcnRcIiwgZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRyYWdlbnRlclwiOiBmdW5jdGlvbiBkcmFnZW50ZXIoZSkge1xuICAgICAgICAgICAgbm9Qcm9wYWdhdGlvbihlKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczMuZW1pdChcImRyYWdlbnRlclwiLCBlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZHJhZ292ZXJcIjogZnVuY3Rpb24gZHJhZ292ZXIoZSkge1xuICAgICAgICAgICAgLy8gTWFrZXMgaXQgcG9zc2libGUgdG8gZHJhZyBmaWxlcyBmcm9tIGNocm9tZSdzIGRvd25sb2FkIGJhclxuICAgICAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTUyNjQzMC9kcmFnLWFuZC1kcm9wLWZpbGUtdXBsb2Fkcy1mcm9tLWNocm9tZS1kb3dubG9hZHMtYmFyXG4gICAgICAgICAgICAvLyBUcnkgaXMgcmVxdWlyZWQgdG8gcHJldmVudCBidWcgaW4gSW50ZXJuZXQgRXhwbG9yZXIgMTEgKFNDUklQVDY1NTM1IGV4Y2VwdGlvbilcbiAgICAgICAgICAgIHZhciBlZmN0O1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBlZmN0ID0gZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuXG4gICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnID09PSBlZmN0IHx8ICdsaW5rTW92ZScgPT09IGVmY3QgPyAnbW92ZScgOiAnY29weSc7XG4gICAgICAgICAgICBub1Byb3BhZ2F0aW9uKGUpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5lbWl0KFwiZHJhZ292ZXJcIiwgZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRyYWdsZWF2ZVwiOiBmdW5jdGlvbiBkcmFnbGVhdmUoZSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5lbWl0KFwiZHJhZ2xlYXZlXCIsIGUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkcm9wXCI6IGZ1bmN0aW9uIGRyb3AoZSkge1xuICAgICAgICAgICAgbm9Qcm9wYWdhdGlvbihlKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczMuZHJvcChlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZHJhZ2VuZFwiOiBmdW5jdGlvbiBkcmFnZW5kKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczMuZW1pdChcImRyYWdlbmRcIiwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IC8vIFRoaXMgaXMgZGlzYWJsZWQgcmlnaHQgbm93LCBiZWNhdXNlIHRoZSBicm93c2VycyBkb24ndCBpbXBsZW1lbnQgaXQgcHJvcGVybHkuXG4gICAgICAgIC8vIFwicGFzdGVcIjogKGUpID0+XG4gICAgICAgIC8vICAgbm9Qcm9wYWdhdGlvbiBlXG4gICAgICAgIC8vICAgQHBhc3RlIGVcblxuICAgICAgfV07XG4gICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGNsaWNrYWJsZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMy5saXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgZWxlbWVudDogY2xpY2thYmxlRWxlbWVudCxcbiAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgIFwiY2xpY2tcIjogZnVuY3Rpb24gY2xpY2soZXZ0KSB7XG4gICAgICAgICAgICAgIC8vIE9ubHkgdGhlIGFjdHVhbCBkcm9wem9uZSBvciB0aGUgbWVzc2FnZSBlbGVtZW50IHNob3VsZCB0cmlnZ2VyIGZpbGUgc2VsZWN0aW9uXG4gICAgICAgICAgICAgIGlmIChjbGlja2FibGVFbGVtZW50ICE9PSBfdGhpczMuZWxlbWVudCB8fCBldnQudGFyZ2V0ID09PSBfdGhpczMuZWxlbWVudCB8fCBEcm9wem9uZS5lbGVtZW50SW5zaWRlKGV2dC50YXJnZXQsIF90aGlzMy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZHotbWVzc2FnZVwiKSkpIHtcbiAgICAgICAgICAgICAgICBfdGhpczMuaGlkZGVuRmlsZUlucHV0LmNsaWNrKCk7IC8vIEZvcndhcmQgdGhlIGNsaWNrXG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmluaXQuY2FsbCh0aGlzKTtcbiAgICB9IC8vIE5vdCBmdWxseSB0ZXN0ZWQgeWV0XG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsRmlsZXModHJ1ZSk7XG5cbiAgICAgIGlmICh0aGlzLmhpZGRlbkZpbGVJbnB1dCAhPSBudWxsID8gdGhpcy5oaWRkZW5GaWxlSW5wdXQucGFyZW50Tm9kZSA6IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmhpZGRlbkZpbGVJbnB1dC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaGlkZGVuRmlsZUlucHV0KTtcbiAgICAgICAgdGhpcy5oaWRkZW5GaWxlSW5wdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBkZWxldGUgdGhpcy5lbGVtZW50LmRyb3B6b25lO1xuICAgICAgcmV0dXJuIERyb3B6b25lLmluc3RhbmNlcy5zcGxpY2UoRHJvcHpvbmUuaW5zdGFuY2VzLmluZGV4T2YodGhpcyksIDEpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVUb3RhbFVwbG9hZFByb2dyZXNzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVRvdGFsVXBsb2FkUHJvZ3Jlc3MoKSB7XG4gICAgICB2YXIgdG90YWxVcGxvYWRQcm9ncmVzcztcbiAgICAgIHZhciB0b3RhbEJ5dGVzU2VudCA9IDA7XG4gICAgICB2YXIgdG90YWxCeXRlcyA9IDA7XG4gICAgICB2YXIgYWN0aXZlRmlsZXMgPSB0aGlzLmdldEFjdGl2ZUZpbGVzKCk7XG5cbiAgICAgIGlmIChhY3RpdmVGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMSA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjExID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjExID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTEgPSB0aGlzLmdldEFjdGl2ZUZpbGVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDExOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMSA9IChfc3RlcDExID0gX2l0ZXJhdG9yMTEubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjExID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGZpbGUgPSBfc3RlcDExLnZhbHVlO1xuICAgICAgICAgICAgdG90YWxCeXRlc1NlbnQgKz0gZmlsZS51cGxvYWQuYnl0ZXNTZW50O1xuICAgICAgICAgICAgdG90YWxCeXRlcyArPSBmaWxlLnVwbG9hZC50b3RhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMTEgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMTEgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjExICYmIF9pdGVyYXRvcjExW1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMTFbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTEpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IxMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b3RhbFVwbG9hZFByb2dyZXNzID0gMTAwICogdG90YWxCeXRlc1NlbnQgLyB0b3RhbEJ5dGVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG90YWxVcGxvYWRQcm9ncmVzcyA9IDEwMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZW1pdChcInRvdGFsdXBsb2FkcHJvZ3Jlc3NcIiwgdG90YWxVcGxvYWRQcm9ncmVzcywgdG90YWxCeXRlcywgdG90YWxCeXRlc1NlbnQpO1xuICAgIH0gLy8gQG9wdGlvbnMucGFyYW1OYW1lIGNhbiBiZSBhIGZ1bmN0aW9uIHRha2luZyBvbmUgcGFyYW1ldGVyIHJhdGhlciB0aGFuIGEgc3RyaW5nLlxuICAgIC8vIEEgcGFyYW1ldGVyIG5hbWUgZm9yIGEgZmlsZSBpcyBvYnRhaW5lZCBzaW1wbHkgYnkgY2FsbGluZyB0aGlzIHdpdGggYW4gaW5kZXggbnVtYmVyLlxuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2dldFBhcmFtTmFtZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0UGFyYW1OYW1lKG4pIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnBhcmFtTmFtZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGFyYW1OYW1lKG4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHRoaXMub3B0aW9ucy5wYXJhbU5hbWUpLmNvbmNhdCh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUgPyBcIltcIi5jb25jYXQobiwgXCJdXCIpIDogXCJcIik7XG4gICAgICB9XG4gICAgfSAvLyBJZiBAb3B0aW9ucy5yZW5hbWVGaWxlIGlzIGEgZnVuY3Rpb24sXG4gICAgLy8gdGhlIGZ1bmN0aW9uIHdpbGwgYmUgdXNlZCB0byByZW5hbWUgdGhlIGZpbGUubmFtZSBiZWZvcmUgYXBwZW5kaW5nIGl0IHRvIHRoZSBmb3JtRGF0YVxuXG4gIH0sIHtcbiAgICBrZXk6IFwiX3JlbmFtZUZpbGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbmFtZUZpbGUoZmlsZSkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMucmVuYW1lRmlsZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBmaWxlLm5hbWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucmVuYW1lRmlsZShmaWxlKTtcbiAgICB9IC8vIFJldHVybnMgYSBmb3JtIHRoYXQgY2FuIGJlIHVzZWQgYXMgZmFsbGJhY2sgaWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBEcmFnbkRyb3BcbiAgICAvL1xuICAgIC8vIElmIHRoZSBkcm9wem9uZSBpcyBhbHJlYWR5IGEgZm9ybSwgb25seSB0aGUgaW5wdXQgZmllbGQgYW5kIGJ1dHRvbiBhcmUgcmV0dXJuZWQuIE90aGVyd2lzZSBhIGNvbXBsZXRlIGZvcm0gZWxlbWVudCBpcyBwcm92aWRlZC5cbiAgICAvLyBUaGlzIGNvZGUgaGFzIHRvIHBhc3MgaW4gSUU3IDooXG5cbiAgfSwge1xuICAgIGtleTogXCJnZXRGYWxsYmFja0Zvcm1cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RmFsbGJhY2tGb3JtKCkge1xuICAgICAgdmFyIGV4aXN0aW5nRmFsbGJhY2ssIGZvcm07XG5cbiAgICAgIGlmIChleGlzdGluZ0ZhbGxiYWNrID0gdGhpcy5nZXRFeGlzdGluZ0ZhbGxiYWNrKCkpIHtcbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nRmFsbGJhY2s7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWVsZHNTdHJpbmcgPSBcIjxkaXYgY2xhc3M9XFxcImR6LWZhbGxiYWNrXFxcIj5cIjtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaWN0RmFsbGJhY2tUZXh0KSB7XG4gICAgICAgIGZpZWxkc1N0cmluZyArPSBcIjxwPlwiLmNvbmNhdCh0aGlzLm9wdGlvbnMuZGljdEZhbGxiYWNrVGV4dCwgXCI8L3A+XCIpO1xuICAgICAgfVxuXG4gICAgICBmaWVsZHNTdHJpbmcgKz0gXCI8aW5wdXQgdHlwZT1cXFwiZmlsZVxcXCIgbmFtZT1cXFwiXCIuY29uY2F0KHRoaXMuX2dldFBhcmFtTmFtZSgwKSwgXCJcXFwiIFwiKS5jb25jYXQodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlID8gJ211bHRpcGxlPVwibXVsdGlwbGVcIicgOiB1bmRlZmluZWQsIFwiIC8+PGlucHV0IHR5cGU9XFxcInN1Ym1pdFxcXCIgdmFsdWU9XFxcIlVwbG9hZCFcXFwiPjwvZGl2PlwiKTtcbiAgICAgIHZhciBmaWVsZHMgPSBEcm9wem9uZS5jcmVhdGVFbGVtZW50KGZpZWxkc1N0cmluZyk7XG5cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQudGFnTmFtZSAhPT0gXCJGT1JNXCIpIHtcbiAgICAgICAgZm9ybSA9IERyb3B6b25lLmNyZWF0ZUVsZW1lbnQoXCI8Zm9ybSBhY3Rpb249XFxcIlwiLmNvbmNhdCh0aGlzLm9wdGlvbnMudXJsLCBcIlxcXCIgZW5jdHlwZT1cXFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVxcXCIgbWV0aG9kPVxcXCJcIikuY29uY2F0KHRoaXMub3B0aW9ucy5tZXRob2QsIFwiXFxcIj48L2Zvcm0+XCIpKTtcbiAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChmaWVsZHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIGVuY3R5cGUgYW5kIG1ldGhvZCBhdHRyaWJ1dGVzIGFyZSBzZXQgcHJvcGVybHlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImVuY3R5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWV0aG9kXCIsIHRoaXMub3B0aW9ucy5tZXRob2QpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm9ybSAhPSBudWxsID8gZm9ybSA6IGZpZWxkcztcbiAgICB9IC8vIFJldHVybnMgdGhlIGZhbGxiYWNrIGVsZW1lbnRzIGlmIHRoZXkgZXhpc3QgYWxyZWFkeVxuICAgIC8vXG4gICAgLy8gVGhpcyBjb2RlIGhhcyB0byBwYXNzIGluIElFNyA6KFxuXG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0RXhpc3RpbmdGYWxsYmFja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFeGlzdGluZ0ZhbGxiYWNrKCkge1xuICAgICAgdmFyIGdldEZhbGxiYWNrID0gZnVuY3Rpb24gZ2V0RmFsbGJhY2soZWxlbWVudHMpIHtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMiA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjEyID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjEyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTIgPSBlbGVtZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMTI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjEyID0gKF9zdGVwMTIgPSBfaXRlcmF0b3IxMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTIgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBfc3RlcDEyLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAoLyhefCApZmFsbGJhY2soJHwgKS8udGVzdChlbC5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMTIgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMTIgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjEyICYmIF9pdGVyYXRvcjEyW1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMTJbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZvciAodmFyIF9pMiA9IDAsIF9hcnIgPSBbXCJkaXZcIiwgXCJmb3JtXCJdOyBfaTIgPCBfYXJyLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSBfYXJyW19pMl07XG4gICAgICAgIHZhciBmYWxsYmFjaztcblxuICAgICAgICBpZiAoZmFsbGJhY2sgPSBnZXRGYWxsYmFjayh0aGlzLmVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAvLyBBY3RpdmF0ZXMgYWxsIGxpc3RlbmVycyBzdG9yZWQgaW4gQGxpc3RlbmVyc1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2V0dXBFdmVudExpc3RlbmVyc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXR1cEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLm1hcChmdW5jdGlvbiAoZWxlbWVudExpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgICAgICAgIGZvciAodmFyIGV2ZW50IGluIGVsZW1lbnRMaXN0ZW5lcnMuZXZlbnRzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBlbGVtZW50TGlzdGVuZXJzLmV2ZW50c1tldmVudF07XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbGVtZW50TGlzdGVuZXJzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGZhbHNlKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSgpO1xuICAgICAgfSk7XG4gICAgfSAvLyBEZWFjdGl2YXRlcyBhbGwgbGlzdGVuZXJzIHN0b3JlZCBpbiBAbGlzdGVuZXJzXG5cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVFdmVudExpc3RlbmVyc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVycygpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5tYXAoZnVuY3Rpb24gKGVsZW1lbnRMaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgICBmb3IgKHZhciBldmVudCBpbiBlbGVtZW50TGlzdGVuZXJzLmV2ZW50cykge1xuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gZWxlbWVudExpc3RlbmVycy5ldmVudHNbZXZlbnRdO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZWxlbWVudExpc3RlbmVycy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyLCBmYWxzZSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0oKTtcbiAgICAgIH0pO1xuICAgIH0gLy8gUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGFuZCBjYW5jZWxzIGFsbCBmaWxlcyBpbiB0aGUgcXVldWUgb3IgYmVpbmcgcHJvY2Vzc2VkLlxuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGlzYWJsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIHRoaXMuY2xpY2thYmxlRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHotY2xpY2thYmxlXCIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVzLm1hcChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gX3RoaXM0LmNhbmNlbFVwbG9hZChmaWxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJlbmFibGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgZGVsZXRlIHRoaXMuZGlzYWJsZWQ7XG4gICAgICB0aGlzLmNsaWNrYWJsZUVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImR6LWNsaWNrYWJsZVwiKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xuICAgIH0gLy8gUmV0dXJucyBhIG5pY2VseSBmb3JtYXR0ZWQgZmlsZXNpemVcblxuICB9LCB7XG4gICAga2V5OiBcImZpbGVzaXplXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbGVzaXplKHNpemUpIHtcbiAgICAgIHZhciBzZWxlY3RlZFNpemUgPSAwO1xuICAgICAgdmFyIHNlbGVjdGVkVW5pdCA9IFwiYlwiO1xuXG4gICAgICBpZiAoc2l6ZSA+IDApIHtcbiAgICAgICAgdmFyIHVuaXRzID0gWyd0YicsICdnYicsICdtYicsICdrYicsICdiJ107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciB1bml0ID0gdW5pdHNbaV07XG4gICAgICAgICAgdmFyIGN1dG9mZiA9IE1hdGgucG93KHRoaXMub3B0aW9ucy5maWxlc2l6ZUJhc2UsIDQgLSBpKSAvIDEwO1xuXG4gICAgICAgICAgaWYgKHNpemUgPj0gY3V0b2ZmKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFNpemUgPSBzaXplIC8gTWF0aC5wb3codGhpcy5vcHRpb25zLmZpbGVzaXplQmFzZSwgNCAtIGkpO1xuICAgICAgICAgICAgc2VsZWN0ZWRVbml0ID0gdW5pdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdGVkU2l6ZSA9IE1hdGgucm91bmQoMTAgKiBzZWxlY3RlZFNpemUpIC8gMTA7IC8vIEN1dHRpbmcgb2YgZGlnaXRzXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBcIjxzdHJvbmc+XCIuY29uY2F0KHNlbGVjdGVkU2l6ZSwgXCI8L3N0cm9uZz4gXCIpLmNvbmNhdCh0aGlzLm9wdGlvbnMuZGljdEZpbGVTaXplVW5pdHNbc2VsZWN0ZWRVbml0XSk7XG4gICAgfSAvLyBBZGRzIG9yIHJlbW92ZXMgdGhlIGBkei1tYXgtZmlsZXMtcmVhY2hlZGAgY2xhc3MgZnJvbSB0aGUgZm9ybS5cblxuICB9LCB7XG4gICAga2V5OiBcIl91cGRhdGVNYXhGaWxlc1JlYWNoZWRDbGFzc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlTWF4RmlsZXNSZWFjaGVkQ2xhc3MoKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm1heEZpbGVzICE9IG51bGwgJiYgdGhpcy5nZXRBY2NlcHRlZEZpbGVzKCkubGVuZ3RoID49IHRoaXMub3B0aW9ucy5tYXhGaWxlcykge1xuICAgICAgICBpZiAodGhpcy5nZXRBY2NlcHRlZEZpbGVzKCkubGVuZ3RoID09PSB0aGlzLm9wdGlvbnMubWF4RmlsZXMpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ21heGZpbGVzcmVhY2hlZCcsIHRoaXMuZmlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHotbWF4LWZpbGVzLXJlYWNoZWRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkei1tYXgtZmlsZXMtcmVhY2hlZFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZHJvcFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkcm9wKGUpIHtcbiAgICAgIGlmICghZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXQoXCJkcm9wXCIsIGUpOyAvLyBDb252ZXJ0IHRoZSBGaWxlTGlzdCB0byBhbiBBcnJheVxuICAgICAgLy8gVGhpcyBpcyBuZWNlc3NhcnkgZm9yIElFMTFcblxuICAgICAgdmFyIGZpbGVzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZS5kYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmlsZXNbaV0gPSBlLmRhdGFUcmFuc2Zlci5maWxlc1tpXTtcbiAgICAgIH0gLy8gRXZlbiBpZiBpdCdzIGEgZm9sZGVyLCBmaWxlcy5sZW5ndGggd2lsbCBjb250YWluIHRoZSBmb2xkZXJzLlxuXG5cbiAgICAgIGlmIChmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gZS5kYXRhVHJhbnNmZXIuaXRlbXM7XG5cbiAgICAgICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCAmJiBpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5ICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBUaGUgYnJvd3NlciBzdXBwb3J0cyBkcm9wcGluZyBvZiBmb2xkZXJzLCBzbyBoYW5kbGUgaXRlbXMgaW5zdGVhZCBvZiBmaWxlc1xuICAgICAgICAgIHRoaXMuX2FkZEZpbGVzRnJvbUl0ZW1zKGl0ZW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUZpbGVzKGZpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXQoXCJhZGRlZGZpbGVzXCIsIGZpbGVzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicGFzdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFzdGUoZSkge1xuICAgICAgaWYgKF9fZ3VhcmRfXyhlICE9IG51bGwgPyBlLmNsaXBib2FyZERhdGEgOiB1bmRlZmluZWQsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4Lml0ZW1zO1xuICAgICAgfSkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW1pdChcInBhc3RlXCIsIGUpO1xuICAgICAgdmFyIGl0ZW1zID0gZS5jbGlwYm9hcmREYXRhLml0ZW1zO1xuXG4gICAgICBpZiAoaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRGaWxlc0Zyb21JdGVtcyhpdGVtcyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZUZpbGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGZpbGVzKSB7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjEzID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjEzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IxMyA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTMgPSBmaWxlc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMTM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjEzID0gKF9zdGVwMTMgPSBfaXRlcmF0b3IxMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTMgPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIGZpbGUgPSBfc3RlcDEzLnZhbHVlO1xuICAgICAgICAgIHRoaXMuYWRkRmlsZShmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMTMgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvcjEzID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xMyAmJiBfaXRlcmF0b3IxM1tcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IxM1tcInJldHVyblwiXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IxMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IxMztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IC8vIFdoZW4gYSBmb2xkZXIgaXMgZHJvcHBlZCAob3IgZmlsZXMgYXJlIHBhc3RlZCksIGl0ZW1zIG11c3QgYmUgaGFuZGxlZFxuICAgIC8vIGluc3RlYWQgb2YgZmlsZXMuXG5cbiAgfSwge1xuICAgIGtleTogXCJfYWRkRmlsZXNGcm9tSXRlbXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZEZpbGVzRnJvbUl0ZW1zKGl0ZW1zKSB7XG4gICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE0ID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMTQgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMTQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IxNCA9IGl0ZW1zW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAxNDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTQgPSAoX3N0ZXAxNCA9IF9pdGVyYXRvcjE0Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xNCA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gX3N0ZXAxNC52YWx1ZTtcbiAgICAgICAgICAgIHZhciBlbnRyeTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0ud2Via2l0R2V0QXNFbnRyeSAhPSBudWxsICYmIChlbnRyeSA9IGl0ZW0ud2Via2l0R2V0QXNFbnRyeSgpKSkge1xuICAgICAgICAgICAgICBpZiAoZW50cnkuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goX3RoaXM1LmFkZEZpbGUoaXRlbS5nZXRBc0ZpbGUoKSkpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIGFsbCBmaWxlcyBmcm9tIHRoYXQgZGlyZWN0b3J5IHRvIGZpbGVzXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goX3RoaXM1Ll9hZGRGaWxlc0Zyb21EaXJlY3RvcnkoZW50cnksIGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uZ2V0QXNGaWxlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgaWYgKGl0ZW0ua2luZCA9PSBudWxsIHx8IGl0ZW0ua2luZCA9PT0gXCJmaWxlXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChfdGhpczUuYWRkRmlsZShpdGVtLmdldEFzRmlsZSgpKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMTQgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMTQgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE0ICYmIF9pdGVyYXRvcjE0W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMTRbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTQpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IxNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSgpO1xuICAgIH0gLy8gR29lcyB0aHJvdWdoIHRoZSBkaXJlY3RvcnksIGFuZCBhZGRzIGVhY2ggZmlsZSBpdCBmaW5kcyByZWN1cnNpdmVseVxuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2FkZEZpbGVzRnJvbURpcmVjdG9yeVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfYWRkRmlsZXNGcm9tRGlyZWN0b3J5KGRpcmVjdG9yeSwgcGF0aCkge1xuICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgIHZhciBkaXJSZWFkZXIgPSBkaXJlY3RvcnkuY3JlYXRlUmVhZGVyKCk7XG5cbiAgICAgIHZhciBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiBlcnJvckhhbmRsZXIoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIF9fZ3VhcmRNZXRob2RfXyhjb25zb2xlLCAnbG9nJywgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICByZXR1cm4gby5sb2coZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHZhciByZWFkRW50cmllcyA9IGZ1bmN0aW9uIHJlYWRFbnRyaWVzKCkge1xuICAgICAgICByZXR1cm4gZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uIChlbnRyaWVzKSB7XG4gICAgICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xNSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IxNSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMTUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjE1ID0gZW50cmllc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMTU7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE1ID0gKF9zdGVwMTUgPSBfaXRlcmF0b3IxNS5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTUgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gX3N0ZXAxNS52YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIGVudHJ5LmZpbGUoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzNi5vcHRpb25zLmlnbm9yZUhpZGRlbkZpbGVzICYmIGZpbGUubmFtZS5zdWJzdHJpbmcoMCwgMSkgPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZpbGUuZnVsbFBhdGggPSBcIlwiLmNvbmNhdChwYXRoLCBcIi9cIikuY29uY2F0KGZpbGUubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczYuYWRkRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgIF90aGlzNi5fYWRkRmlsZXNGcm9tRGlyZWN0b3J5KGVudHJ5LCBcIlwiLmNvbmNhdChwYXRoLCBcIi9cIikuY29uY2F0KGVudHJ5Lm5hbWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gLy8gUmVjdXJzaXZlbHkgY2FsbCByZWFkRW50cmllcygpIGFnYWluLCBzaW5jZSBicm93c2VyIG9ubHkgaGFuZGxlXG4gICAgICAgICAgICAgIC8vIHRoZSBmaXJzdCAxMDAgZW50cmllcy5cbiAgICAgICAgICAgICAgLy8gU2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRGlyZWN0b3J5UmVhZGVyI3JlYWRFbnRyaWVzXG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjE1ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IxNSA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTUgJiYgX2l0ZXJhdG9yMTVbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yMTVbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTUpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMTU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sIGVycm9ySGFuZGxlcik7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcmVhZEVudHJpZXMoKTtcbiAgICB9IC8vIElmIGBkb25lKClgIGlzIGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50IHRoZSBmaWxlIGlzIGFjY2VwdGVkXG4gICAgLy8gSWYgeW91IGNhbGwgaXQgd2l0aCBhbiBlcnJvciBtZXNzYWdlLCB0aGUgZmlsZSBpcyByZWplY3RlZFxuICAgIC8vIChUaGlzIGFsbG93cyBmb3IgYXN5bmNocm9ub3VzIHZhbGlkYXRpb24pXG4gICAgLy9cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGNoZWNrcyB0aGUgZmlsZXNpemUsIGFuZCBpZiB0aGUgZmlsZS50eXBlIHBhc3NlcyB0aGVcbiAgICAvLyBgYWNjZXB0ZWRGaWxlc2AgY2hlY2suXG5cbiAgfSwge1xuICAgIGtleTogXCJhY2NlcHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWNjZXB0KGZpbGUsIGRvbmUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RmlsZXNpemUgJiYgZmlsZS5zaXplID4gdGhpcy5vcHRpb25zLm1heEZpbGVzaXplICogMTAyNCAqIDEwMjQpIHtcbiAgICAgICAgZG9uZSh0aGlzLm9wdGlvbnMuZGljdEZpbGVUb29CaWcucmVwbGFjZShcInt7ZmlsZXNpemV9fVwiLCBNYXRoLnJvdW5kKGZpbGUuc2l6ZSAvIDEwMjQgLyAxMC4yNCkgLyAxMDApLnJlcGxhY2UoXCJ7e21heEZpbGVzaXplfX1cIiwgdGhpcy5vcHRpb25zLm1heEZpbGVzaXplKSk7XG4gICAgICB9IGVsc2UgaWYgKCFEcm9wem9uZS5pc1ZhbGlkRmlsZShmaWxlLCB0aGlzLm9wdGlvbnMuYWNjZXB0ZWRGaWxlcykpIHtcbiAgICAgICAgZG9uZSh0aGlzLm9wdGlvbnMuZGljdEludmFsaWRGaWxlVHlwZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5tYXhGaWxlcyAhPSBudWxsICYmIHRoaXMuZ2V0QWNjZXB0ZWRGaWxlcygpLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMubWF4RmlsZXMpIHtcbiAgICAgICAgZG9uZSh0aGlzLm9wdGlvbnMuZGljdE1heEZpbGVzRXhjZWVkZWQucmVwbGFjZShcInt7bWF4RmlsZXN9fVwiLCB0aGlzLm9wdGlvbnMubWF4RmlsZXMpKTtcbiAgICAgICAgdGhpcy5lbWl0KFwibWF4ZmlsZXNleGNlZWRlZFwiLCBmaWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5hY2NlcHQuY2FsbCh0aGlzLCBmaWxlLCBkb25lKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWRkRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRGaWxlKGZpbGUpIHtcbiAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICBmaWxlLnVwbG9hZCA9IHtcbiAgICAgICAgdXVpZDogRHJvcHpvbmUudXVpZHY0KCksXG4gICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAvLyBTZXR0aW5nIHRoZSB0b3RhbCB1cGxvYWQgc2l6ZSB0byBmaWxlLnNpemUgZm9yIHRoZSBiZWdpbm5pbmdcbiAgICAgICAgLy8gSXQncyBhY3R1YWwgZGlmZmVyZW50IHRoYW4gdGhlIHNpemUgdG8gYmUgdHJhbnNtaXR0ZWQuXG4gICAgICAgIHRvdGFsOiBmaWxlLnNpemUsXG4gICAgICAgIGJ5dGVzU2VudDogMCxcbiAgICAgICAgZmlsZW5hbWU6IHRoaXMuX3JlbmFtZUZpbGUoZmlsZSkgLy8gTm90IHNldHRpbmcgY2h1bmtpbmcgaW5mb3JtYXRpb24gaGVyZSwgYmVjYXVzZSB0aGUgYWN1dGFsIGRhdGEg4oCUIGFuZFxuICAgICAgICAvLyB0aHVzIHRoZSBjaHVua3Mg4oCUIG1pZ2h0IGNoYW5nZSBpZiBgb3B0aW9ucy50cmFuc2Zvcm1GaWxlYCBpcyBzZXRcbiAgICAgICAgLy8gYW5kIGRvZXMgc29tZXRoaW5nIHRvIHRoZSBkYXRhLlxuXG4gICAgICB9O1xuICAgICAgdGhpcy5maWxlcy5wdXNoKGZpbGUpO1xuICAgICAgZmlsZS5zdGF0dXMgPSBEcm9wem9uZS5BRERFRDtcbiAgICAgIHRoaXMuZW1pdChcImFkZGVkZmlsZVwiLCBmaWxlKTtcblxuICAgICAgdGhpcy5fZW5xdWV1ZVRodW1ibmFpbChmaWxlKTtcblxuICAgICAgdGhpcy5hY2NlcHQoZmlsZSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGZpbGUuYWNjZXB0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgIF90aGlzNy5fZXJyb3JQcm9jZXNzaW5nKFtmaWxlXSwgZXJyb3IpOyAvLyBXaWxsIHNldCB0aGUgZmlsZS5zdGF0dXNcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpbGUuYWNjZXB0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKF90aGlzNy5vcHRpb25zLmF1dG9RdWV1ZSkge1xuICAgICAgICAgICAgX3RoaXM3LmVucXVldWVGaWxlKGZpbGUpO1xuICAgICAgICAgIH0gLy8gV2lsbCBzZXQgLmFjY2VwdGVkID0gdHJ1ZVxuXG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczcuX3VwZGF0ZU1heEZpbGVzUmVhY2hlZENsYXNzKCk7XG4gICAgICB9KTtcbiAgICB9IC8vIFdyYXBwZXIgZm9yIGVucXVldWVGaWxlXG5cbiAgfSwge1xuICAgIGtleTogXCJlbnF1ZXVlRmlsZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW5xdWV1ZUZpbGVzKGZpbGVzKSB7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE2ID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjE2ID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IxNiA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTYgPSBmaWxlc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMTY7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE2ID0gKF9zdGVwMTYgPSBfaXRlcmF0b3IxNi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTYgPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIGZpbGUgPSBfc3RlcDE2LnZhbHVlO1xuICAgICAgICAgIHRoaXMuZW5xdWV1ZUZpbGUoZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjE2ID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IxNiA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTYgJiYgX2l0ZXJhdG9yMTZbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMTZbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMTYpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMTY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJlbnF1ZXVlRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbnF1ZXVlRmlsZShmaWxlKSB7XG4gICAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5BRERFRCAmJiBmaWxlLmFjY2VwdGVkID09PSB0cnVlKSB7XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuUVVFVUVEO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpczgucHJvY2Vzc1F1ZXVlKCk7XG4gICAgICAgICAgfSwgMCk7IC8vIERlZmVycmluZyB0aGUgY2FsbFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGZpbGUgY2FuJ3QgYmUgcXVldWVkIGJlY2F1c2UgaXQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQgb3Igd2FzIHJlamVjdGVkLlwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VucXVldWVUaHVtYm5haWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VucXVldWVUaHVtYm5haWwoZmlsZSkge1xuICAgICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3JlYXRlSW1hZ2VUaHVtYm5haWxzICYmIGZpbGUudHlwZS5tYXRjaCgvaW1hZ2UuKi8pICYmIGZpbGUuc2l6ZSA8PSB0aGlzLm9wdGlvbnMubWF4VGh1bWJuYWlsRmlsZXNpemUgKiAxMDI0ICogMTAyNCkge1xuICAgICAgICB0aGlzLl90aHVtYm5haWxRdWV1ZS5wdXNoKGZpbGUpO1xuXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXM5Ll9wcm9jZXNzVGh1bWJuYWlsUXVldWUoKTtcbiAgICAgICAgfSwgMCk7IC8vIERlZmVycmluZyB0aGUgY2FsbFxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfcHJvY2Vzc1RodW1ibmFpbFF1ZXVlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wcm9jZXNzVGh1bWJuYWlsUXVldWUoKSB7XG4gICAgICB2YXIgX3RoaXMxMCA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl9wcm9jZXNzaW5nVGh1bWJuYWlsIHx8IHRoaXMuX3RodW1ibmFpbFF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3Byb2Nlc3NpbmdUaHVtYm5haWwgPSB0cnVlO1xuXG4gICAgICB2YXIgZmlsZSA9IHRoaXMuX3RodW1ibmFpbFF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVRodW1ibmFpbChmaWxlLCB0aGlzLm9wdGlvbnMudGh1bWJuYWlsV2lkdGgsIHRoaXMub3B0aW9ucy50aHVtYm5haWxIZWlnaHQsIHRoaXMub3B0aW9ucy50aHVtYm5haWxNZXRob2QsIHRydWUsIGZ1bmN0aW9uIChkYXRhVXJsKSB7XG4gICAgICAgIF90aGlzMTAuZW1pdChcInRodW1ibmFpbFwiLCBmaWxlLCBkYXRhVXJsKTtcblxuICAgICAgICBfdGhpczEwLl9wcm9jZXNzaW5nVGh1bWJuYWlsID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBfdGhpczEwLl9wcm9jZXNzVGh1bWJuYWlsUXVldWUoKTtcbiAgICAgIH0pO1xuICAgIH0gLy8gQ2FuIGJlIGNhbGxlZCBieSB0aGUgdXNlciB0byByZW1vdmUgYSBmaWxlXG5cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVGaWxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUZpbGUoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxVcGxvYWQoZmlsZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZmlsZXMgPSB3aXRob3V0KHRoaXMuZmlsZXMsIGZpbGUpO1xuICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlZGZpbGVcIiwgZmlsZSk7XG5cbiAgICAgIGlmICh0aGlzLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbWl0KFwicmVzZXRcIik7XG4gICAgICB9XG4gICAgfSAvLyBSZW1vdmVzIGFsbCBmaWxlcyB0aGF0IGFyZW4ndCBjdXJyZW50bHkgcHJvY2Vzc2VkIGZyb20gdGhlIGxpc3RcblxuICB9LCB7XG4gICAga2V5OiBcInJlbW92ZUFsbEZpbGVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUFsbEZpbGVzKGNhbmNlbElmTmVjZXNzYXJ5KSB7XG4gICAgICAvLyBDcmVhdGUgYSBjb3B5IG9mIGZpbGVzIHNpbmNlIHJlbW92ZUZpbGUoKSBjaGFuZ2VzIHRoZSBAZmlsZXMgYXJyYXkuXG4gICAgICBpZiAoY2FuY2VsSWZOZWNlc3NhcnkgPT0gbnVsbCkge1xuICAgICAgICBjYW5jZWxJZk5lY2Vzc2FyeSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE3ID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjE3ID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IxNyA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTcgPSB0aGlzLmZpbGVzLnNsaWNlKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDE3OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xNyA9IChfc3RlcDE3ID0gX2l0ZXJhdG9yMTcubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE3ID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBmaWxlID0gX3N0ZXAxNy52YWx1ZTtcblxuICAgICAgICAgIGlmIChmaWxlLnN0YXR1cyAhPT0gRHJvcHpvbmUuVVBMT0FESU5HIHx8IGNhbmNlbElmTmVjZXNzYXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IxNyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMTcgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE3ICYmIF9pdGVyYXRvcjE3W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgIF9pdGVyYXRvcjE3W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjE3KSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjE3O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IC8vIFJlc2l6ZXMgYW4gaW1hZ2UgYmVmb3JlIGl0IGdldHMgc2VudCB0byB0aGUgc2VydmVyLiBUaGlzIGZ1bmN0aW9uIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mXG4gICAgLy8gYG9wdGlvbnMudHJhbnNmb3JtRmlsZWAgaWYgYHJlc2l6ZVdpZHRoYCBvciBgcmVzaXplSGVpZ2h0YCBhcmUgc2V0LiBUaGUgY2FsbGJhY2sgaXMgaW52b2tlZCB3aXRoXG4gICAgLy8gdGhlIHJlc2l6ZWQgYmxvYi5cblxuICB9LCB7XG4gICAga2V5OiBcInJlc2l6ZUltYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2l6ZUltYWdlKGZpbGUsIHdpZHRoLCBoZWlnaHQsIHJlc2l6ZU1ldGhvZCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBfdGhpczExID0gdGhpcztcblxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVGh1bWJuYWlsKGZpbGUsIHdpZHRoLCBoZWlnaHQsIHJlc2l6ZU1ldGhvZCwgdHJ1ZSwgZnVuY3Rpb24gKGRhdGFVcmwsIGNhbnZhcykge1xuICAgICAgICBpZiAoY2FudmFzID09IG51bGwpIHtcbiAgICAgICAgICAvLyBUaGUgaW1hZ2UgaGFzIG5vdCBiZWVuIHJlc2l6ZWRcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZmlsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHJlc2l6ZU1pbWVUeXBlID0gX3RoaXMxMS5vcHRpb25zLnJlc2l6ZU1pbWVUeXBlO1xuXG4gICAgICAgICAgaWYgKHJlc2l6ZU1pbWVUeXBlID09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc2l6ZU1pbWVUeXBlID0gZmlsZS50eXBlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXNpemVkRGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwocmVzaXplTWltZVR5cGUsIF90aGlzMTEub3B0aW9ucy5yZXNpemVRdWFsaXR5KTtcblxuICAgICAgICAgIGlmIChyZXNpemVNaW1lVHlwZSA9PT0gJ2ltYWdlL2pwZWcnIHx8IHJlc2l6ZU1pbWVUeXBlID09PSAnaW1hZ2UvanBnJykge1xuICAgICAgICAgICAgLy8gTm93IGFkZCB0aGUgb3JpZ2luYWwgRVhJRiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgcmVzaXplZERhdGFVUkwgPSBFeGlmUmVzdG9yZS5yZXN0b3JlKGZpbGUuZGF0YVVSTCwgcmVzaXplZERhdGFVUkwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhEcm9wem9uZS5kYXRhVVJJdG9CbG9iKHJlc2l6ZWREYXRhVVJMKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjcmVhdGVUaHVtYm5haWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlVGh1bWJuYWlsKGZpbGUsIHdpZHRoLCBoZWlnaHQsIHJlc2l6ZU1ldGhvZCwgZml4T3JpZW50YXRpb24sIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgX3RoaXMxMiA9IHRoaXM7XG5cbiAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZpbGUuZGF0YVVSTCA9IGZpbGVSZWFkZXIucmVzdWx0OyAvLyBEb24ndCBib3RoZXIgY3JlYXRpbmcgYSB0aHVtYm5haWwgZm9yIFNWRyBpbWFnZXMgc2luY2UgdGhleSdyZSB2ZWN0b3JcblxuICAgICAgICBpZiAoZmlsZS50eXBlID09PSBcImltYWdlL3N2Zyt4bWxcIikge1xuICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhmaWxlUmVhZGVyLnJlc3VsdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMxMi5jcmVhdGVUaHVtYm5haWxGcm9tVXJsKGZpbGUsIHdpZHRoLCBoZWlnaHQsIHJlc2l6ZU1ldGhvZCwgZml4T3JpZW50YXRpb24sIGNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9IC8vIGBtb2NrRmlsZWAgbmVlZHMgdG8gaGF2ZSB0aGVzZSBhdHRyaWJ1dGVzOlxuICAgIC8vIFxuICAgIC8vICAgICB7IG5hbWU6ICduYW1lJywgc2l6ZTogMTIzNDUsIGltYWdlVXJsOiAnJyB9XG4gICAgLy9cbiAgICAvLyBgY2FsbGJhY2tgIHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSBpbWFnZSBoYXMgYmVlbiBkb3dubG9hZGVkIGFuZCBkaXNwbGF5ZWQuXG4gICAgLy8gYGNyb3NzT3JpZ2luYCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBgaW1nYCB0YWcgd2hlbiBhY2Nlc3NpbmcgdGhlIGZpbGUuXG5cbiAgfSwge1xuICAgIGtleTogXCJkaXNwbGF5RXhpc3RpbmdGaWxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BsYXlFeGlzdGluZ0ZpbGUobW9ja0ZpbGUsIGltYWdlVXJsLCBjYWxsYmFjaywgY3Jvc3NPcmlnaW4pIHtcbiAgICAgIHZhciBfdGhpczEzID0gdGhpcztcblxuICAgICAgdmFyIHJlc2l6ZVRodW1ibmFpbCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdChcImFkZGVkZmlsZVwiLCBtb2NrRmlsZSk7XG4gICAgICB0aGlzLmVtaXQoXCJjb21wbGV0ZVwiLCBtb2NrRmlsZSk7XG5cbiAgICAgIGlmICghcmVzaXplVGh1bWJuYWlsKSB7XG4gICAgICAgIHRoaXMuZW1pdChcInRodW1ibmFpbFwiLCBtb2NrRmlsZSwgaW1hZ2VVcmwpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb25Eb25lID0gZnVuY3Rpb24gb25Eb25lKHRodW1ibmFpbCkge1xuICAgICAgICAgIF90aGlzMTMuZW1pdCgndGh1bWJuYWlsJywgbW9ja0ZpbGUsIHRodW1ibmFpbCk7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbW9ja0ZpbGUuZGF0YVVSTCA9IGltYWdlVXJsO1xuICAgICAgICB0aGlzLmNyZWF0ZVRodW1ibmFpbEZyb21VcmwobW9ja0ZpbGUsIHRoaXMub3B0aW9ucy50aHVtYm5haWxXaWR0aCwgdGhpcy5vcHRpb25zLnRodW1ibmFpbEhlaWdodCwgdGhpcy5vcHRpb25zLnJlc2l6ZU1ldGhvZCwgdGhpcy5vcHRpb25zLmZpeE9yaWVudGF0aW9uLCBvbkRvbmUsIGNyb3NzT3JpZ2luKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY3JlYXRlVGh1bWJuYWlsRnJvbVVybFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVUaHVtYm5haWxGcm9tVXJsKGZpbGUsIHdpZHRoLCBoZWlnaHQsIHJlc2l6ZU1ldGhvZCwgZml4T3JpZW50YXRpb24sIGNhbGxiYWNrLCBjcm9zc09yaWdpbikge1xuICAgICAgdmFyIF90aGlzMTQgPSB0aGlzO1xuXG4gICAgICAvLyBOb3QgdXNpbmcgYG5ldyBJbWFnZWAgaGVyZSBiZWNhdXNlIG9mIGEgYnVnIGluIGxhdGVzdCBDaHJvbWUgdmVyc2lvbnMuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VueW8vZHJvcHpvbmUvcHVsbC8yMjZcbiAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuXG4gICAgICBpZiAoY3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gY3Jvc3NPcmlnaW47XG4gICAgICB9XG5cbiAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsb2FkRXhpZiA9IGZ1bmN0aW9uIGxvYWRFeGlmKGNhbGxiYWNrKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKDEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0eXBlb2YgRVhJRiAhPT0gJ3VuZGVmaW5lZCcgJiYgRVhJRiAhPT0gbnVsbCAmJiBmaXhPcmllbnRhdGlvbikge1xuICAgICAgICAgIGxvYWRFeGlmID0gZnVuY3Rpb24gbG9hZEV4aWYoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBFWElGLmdldERhdGEoaW1nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhFWElGLmdldFRhZyh0aGlzLCAnT3JpZW50YXRpb24nKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxvYWRFeGlmKGZ1bmN0aW9uIChvcmllbnRhdGlvbikge1xuICAgICAgICAgIGZpbGUud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgZmlsZS5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuXG4gICAgICAgICAgdmFyIHJlc2l6ZUluZm8gPSBfdGhpczE0Lm9wdGlvbnMucmVzaXplLmNhbGwoX3RoaXMxNCwgZmlsZSwgd2lkdGgsIGhlaWdodCwgcmVzaXplTWV0aG9kKTtcblxuICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHJlc2l6ZUluZm8udHJnV2lkdGg7XG4gICAgICAgICAgY2FudmFzLmhlaWdodCA9IHJlc2l6ZUluZm8udHJnSGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKG9yaWVudGF0aW9uID4gNCkge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gcmVzaXplSW5mby50cmdIZWlnaHQ7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gcmVzaXplSW5mby50cmdXaWR0aDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIC8vIGhvcml6b250YWwgZmxpcFxuICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKGNhbnZhcy53aWR0aCwgMCk7XG4gICAgICAgICAgICAgIGN0eC5zY2FsZSgtMSwgMSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIC8vIDE4MMKwIHJvdGF0ZSBsZWZ0XG4gICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgY3R4LnJvdGF0ZShNYXRoLlBJKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgLy8gdmVydGljYWwgZmxpcFxuICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICBjdHguc2NhbGUoMSwgLTEpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAvLyB2ZXJ0aWNhbCBmbGlwICsgOTAgcm90YXRlIHJpZ2h0XG4gICAgICAgICAgICAgIGN0eC5yb3RhdGUoMC41ICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgIGN0eC5zY2FsZSgxLCAtMSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgIC8vIDkwwrAgcm90YXRlIHJpZ2h0XG4gICAgICAgICAgICAgIGN0eC5yb3RhdGUoMC41ICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoMCwgLWNhbnZhcy53aWR0aCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICAgIC8vIGhvcml6b250YWwgZmxpcCArIDkwIHJvdGF0ZSByaWdodFxuICAgICAgICAgICAgICBjdHgucm90YXRlKDAuNSAqIE1hdGguUEkpO1xuICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKGNhbnZhcy5oZWlnaHQsIC1jYW52YXMud2lkdGgpO1xuICAgICAgICAgICAgICBjdHguc2NhbGUoLTEsIDEpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAvLyA5MMKwIHJvdGF0ZSBsZWZ0XG4gICAgICAgICAgICAgIGN0eC5yb3RhdGUoLTAuNSAqIE1hdGguUEkpO1xuICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKC1jYW52YXMuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSAvLyBUaGlzIGlzIGEgYnVnZml4IGZvciBpT1MnIHNjYWxpbmcgYnVnLlxuXG5cbiAgICAgICAgICBkcmF3SW1hZ2VJT1NGaXgoY3R4LCBpbWcsIHJlc2l6ZUluZm8uc3JjWCAhPSBudWxsID8gcmVzaXplSW5mby5zcmNYIDogMCwgcmVzaXplSW5mby5zcmNZICE9IG51bGwgPyByZXNpemVJbmZvLnNyY1kgOiAwLCByZXNpemVJbmZvLnNyY1dpZHRoLCByZXNpemVJbmZvLnNyY0hlaWdodCwgcmVzaXplSW5mby50cmdYICE9IG51bGwgPyByZXNpemVJbmZvLnRyZ1ggOiAwLCByZXNpemVJbmZvLnRyZ1kgIT0gbnVsbCA/IHJlc2l6ZUluZm8udHJnWSA6IDAsIHJlc2l6ZUluZm8udHJnV2lkdGgsIHJlc2l6ZUluZm8udHJnSGVpZ2h0KTtcbiAgICAgICAgICB2YXIgdGh1bWJuYWlsID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodGh1bWJuYWlsLCBjYW52YXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICBpbWcub25lcnJvciA9IGNhbGxiYWNrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW1nLnNyYyA9IGZpbGUuZGF0YVVSTDtcbiAgICB9IC8vIEdvZXMgdGhyb3VnaCB0aGUgcXVldWUgYW5kIHByb2Nlc3NlcyBmaWxlcyBpZiB0aGVyZSBhcmVuJ3QgdG9vIG1hbnkgYWxyZWFkeS5cblxuICB9LCB7XG4gICAga2V5OiBcInByb2Nlc3NRdWV1ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzUXVldWUoKSB7XG4gICAgICB2YXIgcGFyYWxsZWxVcGxvYWRzID0gdGhpcy5vcHRpb25zLnBhcmFsbGVsVXBsb2FkcztcbiAgICAgIHZhciBwcm9jZXNzaW5nTGVuZ3RoID0gdGhpcy5nZXRVcGxvYWRpbmdGaWxlcygpLmxlbmd0aDtcbiAgICAgIHZhciBpID0gcHJvY2Vzc2luZ0xlbmd0aDsgLy8gVGhlcmUgYXJlIGFscmVhZHkgYXQgbGVhc3QgYXMgbWFueSBmaWxlcyB1cGxvYWRpbmcgdGhhbiBzaG91bGQgYmVcblxuICAgICAgaWYgKHByb2Nlc3NpbmdMZW5ndGggPj0gcGFyYWxsZWxVcGxvYWRzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHF1ZXVlZEZpbGVzID0gdGhpcy5nZXRRdWV1ZWRGaWxlcygpO1xuXG4gICAgICBpZiAoIShxdWV1ZWRGaWxlcy5sZW5ndGggPiAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgLy8gVGhlIGZpbGVzIHNob3VsZCBiZSB1cGxvYWRlZCBpbiBvbmUgcmVxdWVzdFxuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzRmlsZXMocXVldWVkRmlsZXMuc2xpY2UoMCwgcGFyYWxsZWxVcGxvYWRzIC0gcHJvY2Vzc2luZ0xlbmd0aCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUgKGkgPCBwYXJhbGxlbFVwbG9hZHMpIHtcbiAgICAgICAgICBpZiAoIXF1ZXVlZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gLy8gTm90aGluZyBsZWZ0IHRvIHByb2Nlc3NcblxuXG4gICAgICAgICAgdGhpcy5wcm9jZXNzRmlsZShxdWV1ZWRGaWxlcy5zaGlmdCgpKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IC8vIFdyYXBwZXIgZm9yIGBwcm9jZXNzRmlsZXNgXG5cbiAgfSwge1xuICAgIGtleTogXCJwcm9jZXNzRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzRmlsZShmaWxlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9jZXNzRmlsZXMoW2ZpbGVdKTtcbiAgICB9IC8vIExvYWRzIHRoZSBmaWxlLCB0aGVuIGNhbGxzIGZpbmlzaGVkTG9hZGluZygpXG5cbiAgfSwge1xuICAgIGtleTogXCJwcm9jZXNzRmlsZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc0ZpbGVzKGZpbGVzKSB7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE4ID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjE4ID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IxOCA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTggPSBmaWxlc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMTg7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE4ID0gKF9zdGVwMTggPSBfaXRlcmF0b3IxOC5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTggPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIGZpbGUgPSBfc3RlcDE4LnZhbHVlO1xuICAgICAgICAgIGZpbGUucHJvY2Vzc2luZyA9IHRydWU7IC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cbiAgICAgICAgICBmaWxlLnN0YXR1cyA9IERyb3B6b25lLlVQTE9BRElORztcbiAgICAgICAgICB0aGlzLmVtaXQoXCJwcm9jZXNzaW5nXCIsIGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IxOCA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMTggPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE4ICYmIF9pdGVyYXRvcjE4W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgIF9pdGVyYXRvcjE4W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjE4KSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjE4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuZW1pdChcInByb2Nlc3NpbmdtdWx0aXBsZVwiLCBmaWxlcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2dldEZpbGVzV2l0aFhoclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0RmlsZXNXaXRoWGhyKHhocikge1xuICAgICAgdmFyIGZpbGVzO1xuICAgICAgcmV0dXJuIGZpbGVzID0gdGhpcy5maWxlcy5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGUueGhyID09PSB4aHI7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICB9KTtcbiAgICB9IC8vIENhbmNlbHMgdGhlIGZpbGUgdXBsb2FkIGFuZCBzZXRzIHRoZSBzdGF0dXMgdG8gQ0FOQ0VMRURcbiAgICAvLyAqKmlmKiogdGhlIGZpbGUgaXMgYWN0dWFsbHkgYmVpbmcgdXBsb2FkZWQuXG4gICAgLy8gSWYgaXQncyBzdGlsbCBpbiB0aGUgcXVldWUsIHRoZSBmaWxlIGlzIGJlaW5nIHJlbW92ZWQgZnJvbSBpdCBhbmQgdGhlIHN0YXR1c1xuICAgIC8vIHNldCB0byBDQU5DRUxFRC5cblxuICB9LCB7XG4gICAga2V5OiBcImNhbmNlbFVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5jZWxVcGxvYWQoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5VUExPQURJTkcpIHtcbiAgICAgICAgdmFyIGdyb3VwZWRGaWxlcyA9IHRoaXMuX2dldEZpbGVzV2l0aFhocihmaWxlLnhocik7XG5cbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xOSA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjE5ID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjE5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMTkgPSBncm91cGVkRmlsZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDE5OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24xOSA9IChfc3RlcDE5ID0gX2l0ZXJhdG9yMTkubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjE5ID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGdyb3VwZWRGaWxlID0gX3N0ZXAxOS52YWx1ZTtcbiAgICAgICAgICAgIGdyb3VwZWRGaWxlLnN0YXR1cyA9IERyb3B6b25lLkNBTkNFTEVEO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IxOSA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IxOSA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMTkgJiYgX2l0ZXJhdG9yMTlbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IxOVtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IxOSkge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjE5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZS54aHIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgZmlsZS54aHIuYWJvcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjAgPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyMCA9IGZhbHNlO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyMCA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIwID0gZ3JvdXBlZEZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyMDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjAgPSAoX3N0ZXAyMCA9IF9pdGVyYXRvcjIwLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yMCA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfZ3JvdXBlZEZpbGUgPSBfc3RlcDIwLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsZWRcIiwgX2dyb3VwZWRGaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMjAgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMjAgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIwICYmIF9pdGVyYXRvcjIwW1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMjBbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMjApIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsZWRtdWx0aXBsZVwiLCBncm91cGVkRmlsZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGZpbGUuc3RhdHVzID09PSBEcm9wem9uZS5BRERFRCB8fCBmaWxlLnN0YXR1cyA9PT0gRHJvcHpvbmUuUVVFVUVEKSB7XG4gICAgICAgIGZpbGUuc3RhdHVzID0gRHJvcHpvbmUuQ0FOQ0VMRUQ7XG4gICAgICAgIHRoaXMuZW1pdChcImNhbmNlbGVkXCIsIGZpbGUpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoXCJjYW5jZWxlZG11bHRpcGxlXCIsIFtmaWxlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUHJvY2Vzc1F1ZXVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb24ob3B0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTMgLSAxXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3B0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0aW9uO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ1cGxvYWRGaWxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwbG9hZEZpbGUoZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZXMoW2ZpbGVdKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidXBsb2FkRmlsZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBsb2FkRmlsZXMoZmlsZXMpIHtcbiAgICAgIHZhciBfdGhpczE1ID0gdGhpcztcblxuICAgICAgdGhpcy5fdHJhbnNmb3JtRmlsZXMoZmlsZXMsIGZ1bmN0aW9uICh0cmFuc2Zvcm1lZEZpbGVzKSB7XG4gICAgICAgIGlmIChfdGhpczE1Lm9wdGlvbnMuY2h1bmtpbmcpIHtcbiAgICAgICAgICAvLyBDaHVua2luZyBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIHdpdGggYHVwbG9hZE11bHRpcGxlYCBzbyB3ZSBrbm93XG4gICAgICAgICAgLy8gdGhhdCB0aGVyZSBpcyBvbmx5IF9fb25lX19maWxlLlxuICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZEZpbGUgPSB0cmFuc2Zvcm1lZEZpbGVzWzBdO1xuICAgICAgICAgIGZpbGVzWzBdLnVwbG9hZC5jaHVua2VkID0gX3RoaXMxNS5vcHRpb25zLmNodW5raW5nICYmIChfdGhpczE1Lm9wdGlvbnMuZm9yY2VDaHVua2luZyB8fCB0cmFuc2Zvcm1lZEZpbGUuc2l6ZSA+IF90aGlzMTUub3B0aW9ucy5jaHVua1NpemUpO1xuICAgICAgICAgIGZpbGVzWzBdLnVwbG9hZC50b3RhbENodW5rQ291bnQgPSBNYXRoLmNlaWwodHJhbnNmb3JtZWRGaWxlLnNpemUgLyBfdGhpczE1Lm9wdGlvbnMuY2h1bmtTaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlc1swXS51cGxvYWQuY2h1bmtlZCkge1xuICAgICAgICAgIC8vIFRoaXMgZmlsZSBzaG91bGQgYmUgc2VudCBpbiBjaHVua3MhXG4gICAgICAgICAgLy8gSWYgdGhlIGNodW5raW5nIG9wdGlvbiBpcyBzZXQsIHdlICoqa25vdyoqIHRoYXQgdGhlcmUgY2FuIG9ubHkgYmUgKipvbmUqKiBmaWxlLCBzaW5jZVxuICAgICAgICAgIC8vIHVwbG9hZE11bHRpcGxlIGlzIG5vdCBhbGxvd2VkIHdpdGggdGhpcyBvcHRpb24uXG4gICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1swXTtcbiAgICAgICAgICB2YXIgX3RyYW5zZm9ybWVkRmlsZSA9IHRyYW5zZm9ybWVkRmlsZXNbMF07XG4gICAgICAgICAgdmFyIHN0YXJ0ZWRDaHVua0NvdW50ID0gMDtcbiAgICAgICAgICBmaWxlLnVwbG9hZC5jaHVua3MgPSBbXTtcblxuICAgICAgICAgIHZhciBoYW5kbGVOZXh0Q2h1bmsgPSBmdW5jdGlvbiBoYW5kbGVOZXh0Q2h1bmsoKSB7XG4gICAgICAgICAgICB2YXIgY2h1bmtJbmRleCA9IDA7IC8vIEZpbmQgdGhlIG5leHQgaXRlbSBpbiBmaWxlLnVwbG9hZC5jaHVua3MgdGhhdCBpcyBub3QgZGVmaW5lZCB5ZXQuXG5cbiAgICAgICAgICAgIHdoaWxlIChmaWxlLnVwbG9hZC5jaHVua3NbY2h1bmtJbmRleF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBjaHVua0luZGV4Kys7XG4gICAgICAgICAgICB9IC8vIFRoaXMgbWVhbnMsIHRoYXQgYWxsIGNodW5rcyBoYXZlIGFscmVhZHkgYmVlbiBzdGFydGVkLlxuXG5cbiAgICAgICAgICAgIGlmIChjaHVua0luZGV4ID49IGZpbGUudXBsb2FkLnRvdGFsQ2h1bmtDb3VudCkgcmV0dXJuO1xuICAgICAgICAgICAgc3RhcnRlZENodW5rQ291bnQrKztcbiAgICAgICAgICAgIHZhciBzdGFydCA9IGNodW5rSW5kZXggKiBfdGhpczE1Lm9wdGlvbnMuY2h1bmtTaXplO1xuICAgICAgICAgICAgdmFyIGVuZCA9IE1hdGgubWluKHN0YXJ0ICsgX3RoaXMxNS5vcHRpb25zLmNodW5rU2l6ZSwgZmlsZS5zaXplKTtcbiAgICAgICAgICAgIHZhciBkYXRhQmxvY2sgPSB7XG4gICAgICAgICAgICAgIG5hbWU6IF90aGlzMTUuX2dldFBhcmFtTmFtZSgwKSxcbiAgICAgICAgICAgICAgZGF0YTogX3RyYW5zZm9ybWVkRmlsZS53ZWJraXRTbGljZSA/IF90cmFuc2Zvcm1lZEZpbGUud2Via2l0U2xpY2Uoc3RhcnQsIGVuZCkgOiBfdHJhbnNmb3JtZWRGaWxlLnNsaWNlKHN0YXJ0LCBlbmQpLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZS51cGxvYWQuZmlsZW5hbWUsXG4gICAgICAgICAgICAgIGNodW5rSW5kZXg6IGNodW5rSW5kZXhcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaWxlLnVwbG9hZC5jaHVua3NbY2h1bmtJbmRleF0gPSB7XG4gICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgIGluZGV4OiBjaHVua0luZGV4LFxuICAgICAgICAgICAgICBkYXRhQmxvY2s6IGRhdGFCbG9jayxcbiAgICAgICAgICAgICAgLy8gSW4gY2FzZSB3ZSB3YW50IHRvIHJldHJ5LlxuICAgICAgICAgICAgICBzdGF0dXM6IERyb3B6b25lLlVQTE9BRElORyxcbiAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICAgIHJldHJpZXM6IDAgLy8gVGhlIG51bWJlciBvZiB0aW1lcyB0aGlzIGJsb2NrIGhhcyBiZWVuIHJldHJpZWQuXG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF90aGlzMTUuX3VwbG9hZERhdGEoZmlsZXMsIFtkYXRhQmxvY2tdKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgZmlsZS51cGxvYWQuZmluaXNoZWRDaHVua1VwbG9hZCA9IGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICAgICAgdmFyIGFsbEZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNodW5rLnN0YXR1cyA9IERyb3B6b25lLlNVQ0NFU1M7IC8vIENsZWFyIHRoZSBkYXRhIGZyb20gdGhlIGNodW5rXG5cbiAgICAgICAgICAgIGNodW5rLmRhdGFCbG9jayA9IG51bGw7IC8vIExlYXZpbmcgdGhpcyByZWZlcmVuY2UgdG8geGhyIGludGFjdCBoZXJlIHdpbGwgY2F1c2UgbWVtb3J5IGxlYWtzIGluIHNvbWUgYnJvd3NlcnNcblxuICAgICAgICAgICAgY2h1bmsueGhyID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlLnVwbG9hZC50b3RhbENodW5rQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoZmlsZS51cGxvYWQuY2h1bmtzW2ldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlTmV4dENodW5rKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZmlsZS51cGxvYWQuY2h1bmtzW2ldLnN0YXR1cyAhPT0gRHJvcHpvbmUuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgIGFsbEZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFsbEZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgIF90aGlzMTUub3B0aW9ucy5jaHVua3NVcGxvYWRlZChmaWxlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxNS5fZmluaXNoZWQoZmlsZXMsICcnLCBudWxsKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChfdGhpczE1Lm9wdGlvbnMucGFyYWxsZWxDaHVua1VwbG9hZHMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZS51cGxvYWQudG90YWxDaHVua0NvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgaGFuZGxlTmV4dENodW5rKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZU5leHRDaHVuaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZGF0YUJsb2NrcyA9IFtdO1xuXG4gICAgICAgICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgZmlsZXMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICAgICAgZGF0YUJsb2Nrc1tfaTNdID0ge1xuICAgICAgICAgICAgICBuYW1lOiBfdGhpczE1Ll9nZXRQYXJhbU5hbWUoX2kzKSxcbiAgICAgICAgICAgICAgZGF0YTogdHJhbnNmb3JtZWRGaWxlc1tfaTNdLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZXNbX2kzXS51cGxvYWQuZmlsZW5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX3RoaXMxNS5fdXBsb2FkRGF0YShmaWxlcywgZGF0YUJsb2Nrcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gLy8vIFJldHVybnMgdGhlIHJpZ2h0IGNodW5rIGZvciBnaXZlbiBmaWxlIGFuZCB4aHJcblxuICB9LCB7XG4gICAga2V5OiBcIl9nZXRDaHVua1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0Q2h1bmsoZmlsZSwgeGhyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGUudXBsb2FkLnRvdGFsQ2h1bmtDb3VudDsgaSsrKSB7XG4gICAgICAgIGlmIChmaWxlLnVwbG9hZC5jaHVua3NbaV0gIT09IHVuZGVmaW5lZCAmJiBmaWxlLnVwbG9hZC5jaHVua3NbaV0ueGhyID09PSB4aHIpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS51cGxvYWQuY2h1bmtzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAvLyBUaGlzIGZ1bmN0aW9uIGFjdHVhbGx5IHVwbG9hZHMgdGhlIGZpbGUocykgdG8gdGhlIHNlcnZlci5cbiAgICAvLyBJZiBkYXRhQmxvY2tzIGNvbnRhaW5zIHRoZSBhY3R1YWwgZGF0YSB0byB1cGxvYWQgKG1lYW5pbmcsIHRoYXQgdGhpcyBjb3VsZCBlaXRoZXIgYmUgdHJhbnNmb3JtZWRcbiAgICAvLyBmaWxlcywgb3IgaW5kaXZpZHVhbCBjaHVua3MgZm9yIGNodW5rZWQgdXBsb2FkKS5cblxuICB9LCB7XG4gICAga2V5OiBcIl91cGxvYWREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF91cGxvYWREYXRhKGZpbGVzLCBkYXRhQmxvY2tzKSB7XG4gICAgICB2YXIgX3RoaXMxNiA9IHRoaXM7XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTsgLy8gUHV0IHRoZSB4aHIgb2JqZWN0IGluIHRoZSBmaWxlIG9iamVjdHMgdG8gYmUgYWJsZSB0byByZWZlcmVuY2UgaXQgbGF0ZXIuXG5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjEgPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMjEgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIxID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyMSA9IGZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyMTsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjEgPSAoX3N0ZXAyMSA9IF9pdGVyYXRvcjIxLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yMSA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgZmlsZSA9IF9zdGVwMjEudmFsdWU7XG4gICAgICAgICAgZmlsZS54aHIgPSB4aHI7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIxID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IyMSA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjEgJiYgX2l0ZXJhdG9yMjFbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMjFbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMjEpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlc1swXS51cGxvYWQuY2h1bmtlZCkge1xuICAgICAgICAvLyBQdXQgdGhlIHhociBvYmplY3QgaW4gdGhlIHJpZ2h0IGNodW5rIG9iamVjdCwgc28gaXQgY2FuIGJlIGFzc29jaWF0ZWQgbGF0ZXIsIGFuZCBmb3VuZCB3aXRoIF9nZXRDaHVua1xuICAgICAgICBmaWxlc1swXS51cGxvYWQuY2h1bmtzW2RhdGFCbG9ja3NbMF0uY2h1bmtJbmRleF0ueGhyID0geGhyO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWV0aG9kID0gdGhpcy5yZXNvbHZlT3B0aW9uKHRoaXMub3B0aW9ucy5tZXRob2QsIGZpbGVzKTtcbiAgICAgIHZhciB1cmwgPSB0aGlzLnJlc29sdmVPcHRpb24odGhpcy5vcHRpb25zLnVybCwgZmlsZXMpO1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpOyAvLyBTZXR0aW5nIHRoZSB0aW1lb3V0IGFmdGVyIG9wZW4gYmVjYXVzZSBvZiBJRTExIGlzc3VlOiBodHRwczovL2dpdGxhYi5jb20vbWVuby9kcm9wem9uZS9pc3N1ZXMvOFxuXG4gICAgICB4aHIudGltZW91dCA9IHRoaXMucmVzb2x2ZU9wdGlvbih0aGlzLm9wdGlvbnMudGltZW91dCwgZmlsZXMpOyAvLyBIYXMgdG8gYmUgYWZ0ZXIgYC5vcGVuKClgLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VueW8vZHJvcHpvbmUvaXNzdWVzLzE3OVxuXG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gISF0aGlzLm9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgX3RoaXMxNi5fZmluaXNoZWRVcGxvYWRpbmcoZmlsZXMsIHhociwgZSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczE2Ll9oYW5kbGVVcGxvYWRFcnJvcihmaWxlcywgeGhyLCBcIlJlcXVlc3QgdGltZWRvdXQgYWZ0ZXIgXCIuY29uY2F0KF90aGlzMTYub3B0aW9ucy50aW1lb3V0LCBcIiBzZWNvbmRzXCIpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczE2Ll9oYW5kbGVVcGxvYWRFcnJvcihmaWxlcywgeGhyKTtcbiAgICAgIH07IC8vIFNvbWUgYnJvd3NlcnMgZG8gbm90IGhhdmUgdGhlIC51cGxvYWQgcHJvcGVydHlcblxuXG4gICAgICB2YXIgcHJvZ3Jlc3NPYmogPSB4aHIudXBsb2FkICE9IG51bGwgPyB4aHIudXBsb2FkIDogeGhyO1xuXG4gICAgICBwcm9ncmVzc09iai5vbnByb2dyZXNzID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMTYuX3VwZGF0ZUZpbGVzVXBsb2FkUHJvZ3Jlc3MoZmlsZXMsIHhociwgZSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgXCJBY2NlcHRcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiQ2FjaGUtQ29udHJvbFwiOiBcIm5vLWNhY2hlXCIsXG4gICAgICAgIFwiWC1SZXF1ZXN0ZWQtV2l0aFwiOiBcIlhNTEh0dHBSZXF1ZXN0XCJcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICBEcm9wem9uZS5leHRlbmQoaGVhZGVycywgdGhpcy5vcHRpb25zLmhlYWRlcnMpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBoZWFkZXJOYW1lIGluIGhlYWRlcnMpIHtcbiAgICAgICAgdmFyIGhlYWRlclZhbHVlID0gaGVhZGVyc1toZWFkZXJOYW1lXTtcblxuICAgICAgICBpZiAoaGVhZGVyVmFsdWUpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXJOYW1lLCBoZWFkZXJWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7IC8vIEFkZGluZyBhbGwgQG9wdGlvbnMgcGFyYW1ldGVyc1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgICB2YXIgYWRkaXRpb25hbFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGRpdGlvbmFsUGFyYW1zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRkaXRpb25hbFBhcmFtcyA9IGFkZGl0aW9uYWxQYXJhbXMuY2FsbCh0aGlzLCBmaWxlcywgeGhyLCBmaWxlc1swXS51cGxvYWQuY2h1bmtlZCA/IHRoaXMuX2dldENodW5rKGZpbGVzWzBdLCB4aHIpIDogbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYWRkaXRpb25hbFBhcmFtcykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGFkZGl0aW9uYWxQYXJhbXNba2V5XTtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gTGV0IHRoZSB1c2VyIGFkZCBhZGRpdGlvbmFsIGRhdGEgaWYgbmVjZXNzYXJ5XG5cblxuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yMiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyMiA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yMjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIyID0gZmlsZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDIyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yMiA9IChfc3RlcDIyID0gX2l0ZXJhdG9yMjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIyID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBfZmlsZSA9IF9zdGVwMjIudmFsdWU7XG4gICAgICAgICAgdGhpcy5lbWl0KFwic2VuZGluZ1wiLCBfZmlsZSwgeGhyLCBmb3JtRGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIyID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IyMiA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjIgJiYgX2l0ZXJhdG9yMjJbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMjJbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMjIpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VuZGluZ211bHRpcGxlXCIsIGZpbGVzLCB4aHIsIGZvcm1EYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYWRkRm9ybUVsZW1lbnREYXRhKGZvcm1EYXRhKTsgLy8gRmluYWxseSBhZGQgdGhlIGZpbGVzXG4gICAgICAvLyBIYXMgdG8gYmUgbGFzdCBiZWNhdXNlIHNvbWUgc2VydmVycyAoZWc6IFMzKSBleHBlY3QgdGhlIGZpbGUgdG8gYmUgdGhlIGxhc3QgcGFyYW1ldGVyXG5cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRhQmxvY2sgPSBkYXRhQmxvY2tzW2ldO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoZGF0YUJsb2NrLm5hbWUsIGRhdGFCbG9jay5kYXRhLCBkYXRhQmxvY2suZmlsZW5hbWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN1Ym1pdFJlcXVlc3QoeGhyLCBmb3JtRGF0YSwgZmlsZXMpO1xuICAgIH0gLy8gVHJhbnNmb3JtcyBhbGwgZmlsZXMgd2l0aCB0aGlzLm9wdGlvbnMudHJhbnNmb3JtRmlsZSBhbmQgaW52b2tlcyBkb25lIHdpdGggdGhlIHRyYW5zZm9ybWVkIGZpbGVzIHdoZW4gZG9uZS5cblxuICB9LCB7XG4gICAga2V5OiBcIl90cmFuc2Zvcm1GaWxlc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfdHJhbnNmb3JtRmlsZXMoZmlsZXMsIGRvbmUpIHtcbiAgICAgIHZhciBfdGhpczE3ID0gdGhpcztcblxuICAgICAgdmFyIHRyYW5zZm9ybWVkRmlsZXMgPSBbXTsgLy8gQ2x1bXN5IHdheSBvZiBoYW5kbGluZyBhc3luY2hyb25vdXMgY2FsbHMsIHVudGlsIEkgZ2V0IHRvIGFkZCBhIHByb3BlciBGdXR1cmUgbGlicmFyeS5cblxuICAgICAgdmFyIGRvbmVDb3VudGVyID0gMDtcblxuICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoaSkge1xuICAgICAgICBfdGhpczE3Lm9wdGlvbnMudHJhbnNmb3JtRmlsZS5jYWxsKF90aGlzMTcsIGZpbGVzW2ldLCBmdW5jdGlvbiAodHJhbnNmb3JtZWRGaWxlKSB7XG4gICAgICAgICAgdHJhbnNmb3JtZWRGaWxlc1tpXSA9IHRyYW5zZm9ybWVkRmlsZTtcblxuICAgICAgICAgIGlmICgrK2RvbmVDb3VudGVyID09PSBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRvbmUodHJhbnNmb3JtZWRGaWxlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgX2xvb3AoaSk7XG4gICAgICB9XG4gICAgfSAvLyBUYWtlcyBjYXJlIG9mIGFkZGluZyBvdGhlciBpbnB1dCBlbGVtZW50cyBvZiB0aGUgZm9ybSB0byB0aGUgQUpBWCByZXF1ZXN0XG5cbiAgfSwge1xuICAgIGtleTogXCJfYWRkRm9ybUVsZW1lbnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRGb3JtRWxlbWVudERhdGEoZm9ybURhdGEpIHtcbiAgICAgIC8vIFRha2UgY2FyZSBvZiBvdGhlciBpbnB1dCBlbGVtZW50c1xuICAgICAgaWYgKHRoaXMuZWxlbWVudC50YWdOYW1lID09PSBcIkZPUk1cIikge1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIzID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMjMgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMjMgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyMyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIGJ1dHRvblwiKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIzID0gKF9zdGVwMjMgPSBfaXRlcmF0b3IyMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjMgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXQgPSBfc3RlcDIzLnZhbHVlO1xuICAgICAgICAgICAgdmFyIGlucHV0TmFtZSA9IGlucHV0LmdldEF0dHJpYnV0ZShcIm5hbWVcIik7XG4gICAgICAgICAgICB2YXIgaW5wdXRUeXBlID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICAgIGlmIChpbnB1dFR5cGUpIGlucHV0VHlwZSA9IGlucHV0VHlwZS50b0xvd2VyQ2FzZSgpOyAvLyBJZiB0aGUgaW5wdXQgZG9lc24ndCBoYXZlIGEgbmFtZSwgd2UgY2FuJ3QgdXNlIGl0LlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0TmFtZSA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5wdXROYW1lID09PSBudWxsKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKGlucHV0LnRhZ05hbWUgPT09IFwiU0VMRUNUXCIgJiYgaW5wdXQuaGFzQXR0cmlidXRlKFwibXVsdGlwbGVcIikpIHtcbiAgICAgICAgICAgICAgLy8gUG9zc2libHkgbXVsdGlwbGUgdmFsdWVzXG4gICAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjQgPSB0cnVlO1xuICAgICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyNCA9IGZhbHNlO1xuICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjI0ID0gaW5wdXQub3B0aW9uc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjQ7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI0ID0gKF9zdGVwMjQgPSBfaXRlcmF0b3IyNC5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gX3N0ZXAyNC52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoaW5wdXROYW1lLCBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyNCA9IHRydWU7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyNCA9IGVycjtcbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjQgJiYgX2l0ZXJhdG9yMjRbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3IyNFtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyNCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghaW5wdXRUeXBlIHx8IGlucHV0VHlwZSAhPT0gXCJjaGVja2JveFwiICYmIGlucHV0VHlwZSAhPT0gXCJyYWRpb1wiIHx8IGlucHV0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGlucHV0TmFtZSwgaW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyMyA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyMyA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjMgJiYgX2l0ZXJhdG9yMjNbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IyM1tcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyMykge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjIzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gLy8gSW52b2tlZCB3aGVuIHRoZXJlIGlzIG5ldyBwcm9ncmVzcyBpbmZvcm1hdGlvbiBhYm91dCBnaXZlbiBmaWxlcy5cbiAgICAvLyBJZiBlIGlzIG5vdCBwcm92aWRlZCwgaXQgaXMgYXNzdW1lZCB0aGF0IHRoZSB1cGxvYWQgaXMgZmluaXNoZWQuXG5cbiAgfSwge1xuICAgIGtleTogXCJfdXBkYXRlRmlsZXNVcGxvYWRQcm9ncmVzc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlRmlsZXNVcGxvYWRQcm9ncmVzcyhmaWxlcywgeGhyLCBlKSB7XG4gICAgICB2YXIgcHJvZ3Jlc3M7XG5cbiAgICAgIGlmICh0eXBlb2YgZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAxMDAgKiBlLmxvYWRlZCAvIGUudG90YWw7XG5cbiAgICAgICAgaWYgKGZpbGVzWzBdLnVwbG9hZC5jaHVua2VkKSB7XG4gICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1swXTsgLy8gU2luY2UgdGhpcyBpcyBhIGNodW5rZWQgdXBsb2FkLCB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgYXBwcm9wcmlhdGUgY2h1bmsgcHJvZ3Jlc3MuXG5cbiAgICAgICAgICB2YXIgY2h1bmsgPSB0aGlzLl9nZXRDaHVuayhmaWxlLCB4aHIpO1xuXG4gICAgICAgICAgY2h1bmsucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICBjaHVuay50b3RhbCA9IGUudG90YWw7XG4gICAgICAgICAgY2h1bmsuYnl0ZXNTZW50ID0gZS5sb2FkZWQ7XG4gICAgICAgICAgdmFyIGZpbGVQcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgIGZpbGVUb3RhbCxcbiAgICAgICAgICAgICAgZmlsZUJ5dGVzU2VudDtcbiAgICAgICAgICBmaWxlLnVwbG9hZC5wcm9ncmVzcyA9IDA7XG4gICAgICAgICAgZmlsZS51cGxvYWQudG90YWwgPSAwO1xuICAgICAgICAgIGZpbGUudXBsb2FkLmJ5dGVzU2VudCA9IDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGUudXBsb2FkLnRvdGFsQ2h1bmtDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmlsZS51cGxvYWQuY2h1bmtzW2ldICE9PSB1bmRlZmluZWQgJiYgZmlsZS51cGxvYWQuY2h1bmtzW2ldLnByb2dyZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgZmlsZS51cGxvYWQucHJvZ3Jlc3MgKz0gZmlsZS51cGxvYWQuY2h1bmtzW2ldLnByb2dyZXNzO1xuICAgICAgICAgICAgICBmaWxlLnVwbG9hZC50b3RhbCArPSBmaWxlLnVwbG9hZC5jaHVua3NbaV0udG90YWw7XG4gICAgICAgICAgICAgIGZpbGUudXBsb2FkLmJ5dGVzU2VudCArPSBmaWxlLnVwbG9hZC5jaHVua3NbaV0uYnl0ZXNTZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGZpbGUudXBsb2FkLnByb2dyZXNzID0gZmlsZS51cGxvYWQucHJvZ3Jlc3MgLyBmaWxlLnVwbG9hZC50b3RhbENodW5rQ291bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNSA9IHRydWU7XG4gICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMjUgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyNSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyNSA9IGZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyNTsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjUgPSAoX3N0ZXAyNSA9IF9pdGVyYXRvcjI1Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNSA9IHRydWUpIHtcbiAgICAgICAgICAgICAgdmFyIF9maWxlMiA9IF9zdGVwMjUudmFsdWU7XG4gICAgICAgICAgICAgIF9maWxlMi51cGxvYWQucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgX2ZpbGUyLnVwbG9hZC50b3RhbCA9IGUudG90YWw7XG4gICAgICAgICAgICAgIF9maWxlMi51cGxvYWQuYnl0ZXNTZW50ID0gZS5sb2FkZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjI1ID0gdHJ1ZTtcbiAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMjUgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI1ICYmIF9pdGVyYXRvcjI1W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3IyNVtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyNSkge1xuICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI2ID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMjYgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMjYgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyNiA9IGZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyNjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjYgPSAoX3N0ZXAyNiA9IF9pdGVyYXRvcjI2Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfZmlsZTMgPSBfc3RlcDI2LnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwidXBsb2FkcHJvZ3Jlc3NcIiwgX2ZpbGUzLCBfZmlsZTMudXBsb2FkLnByb2dyZXNzLCBfZmlsZTMudXBsb2FkLmJ5dGVzU2VudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjI2ID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvcjI2ID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNiAmJiBfaXRlcmF0b3IyNltcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjI2W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjI2KSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDYWxsZWQgd2hlbiB0aGUgZmlsZSBmaW5pc2hlZCB1cGxvYWRpbmdcbiAgICAgICAgdmFyIGFsbEZpbGVzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICBwcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNyA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjI3ID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjI3ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMjcgPSBmaWxlc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjc7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI3ID0gKF9zdGVwMjcgPSBfaXRlcmF0b3IyNy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjcgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgX2ZpbGU0ID0gX3N0ZXAyNy52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKF9maWxlNC51cGxvYWQucHJvZ3Jlc3MgIT09IDEwMCB8fCBfZmlsZTQudXBsb2FkLmJ5dGVzU2VudCAhPT0gX2ZpbGU0LnVwbG9hZC50b3RhbCkge1xuICAgICAgICAgICAgICBhbGxGaWxlc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9maWxlNC51cGxvYWQucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgIF9maWxlNC51cGxvYWQuYnl0ZXNTZW50ID0gX2ZpbGU0LnVwbG9hZC50b3RhbDtcbiAgICAgICAgICB9IC8vIE5vdGhpbmcgdG8gZG8sIGFsbCBmaWxlcyBhbHJlYWR5IGF0IDEwMCVcblxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjI3ID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvcjI3ID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yNyAmJiBfaXRlcmF0b3IyN1tcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjI3W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjI3KSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFsbEZpbGVzRmluaXNoZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI4ID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMjggPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMjggPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyOCA9IGZpbGVzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyODsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjggPSAoX3N0ZXAyOCA9IF9pdGVyYXRvcjI4Lm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yOCA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfZmlsZTUgPSBfc3RlcDI4LnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwidXBsb2FkcHJvZ3Jlc3NcIiwgX2ZpbGU1LCBwcm9ncmVzcywgX2ZpbGU1LnVwbG9hZC5ieXRlc1NlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyOCA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyOCA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMjggJiYgX2l0ZXJhdG9yMjhbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IyOFtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyOCkge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfZmluaXNoZWRVcGxvYWRpbmdcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2ZpbmlzaGVkVXBsb2FkaW5nKGZpbGVzLCB4aHIsIGUpIHtcbiAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgaWYgKGZpbGVzWzBdLnN0YXR1cyA9PT0gRHJvcHpvbmUuQ0FOQ0VMRUQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoeGhyLnJlc3BvbnNlVHlwZSAhPT0gJ2FycmF5YnVmZmVyJyAmJiB4aHIucmVzcG9uc2VUeXBlICE9PSAnYmxvYicpIHtcbiAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuXG4gICAgICAgIGlmICh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJjb250ZW50LXR5cGVcIikgJiYgfnhoci5nZXRSZXNwb25zZUhlYWRlcihcImNvbnRlbnQtdHlwZVwiKS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBlID0gZXJyb3I7XG4gICAgICAgICAgICByZXNwb25zZSA9IFwiSW52YWxpZCBKU09OIHJlc3BvbnNlIGZyb20gc2VydmVyLlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl91cGRhdGVGaWxlc1VwbG9hZFByb2dyZXNzKGZpbGVzKTtcblxuICAgICAgaWYgKCEoMjAwIDw9IHhoci5zdGF0dXMgJiYgeGhyLnN0YXR1cyA8IDMwMCkpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlVXBsb2FkRXJyb3IoZmlsZXMsIHhociwgcmVzcG9uc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZpbGVzWzBdLnVwbG9hZC5jaHVua2VkKSB7XG4gICAgICAgICAgZmlsZXNbMF0udXBsb2FkLmZpbmlzaGVkQ2h1bmtVcGxvYWQodGhpcy5fZ2V0Q2h1bmsoZmlsZXNbMF0sIHhocikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2ZpbmlzaGVkKGZpbGVzLCByZXNwb25zZSwgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2hhbmRsZVVwbG9hZEVycm9yXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVVcGxvYWRFcnJvcihmaWxlcywgeGhyLCByZXNwb25zZSkge1xuICAgICAgaWYgKGZpbGVzWzBdLnN0YXR1cyA9PT0gRHJvcHpvbmUuQ0FOQ0VMRUQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZXNbMF0udXBsb2FkLmNodW5rZWQgJiYgdGhpcy5vcHRpb25zLnJldHJ5Q2h1bmtzKSB7XG4gICAgICAgIHZhciBjaHVuayA9IHRoaXMuX2dldENodW5rKGZpbGVzWzBdLCB4aHIpO1xuXG4gICAgICAgIGlmIChjaHVuay5yZXRyaWVzKysgPCB0aGlzLm9wdGlvbnMucmV0cnlDaHVua3NMaW1pdCkge1xuICAgICAgICAgIHRoaXMuX3VwbG9hZERhdGEoZmlsZXMsIFtjaHVuay5kYXRhQmxvY2tdKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1JldHJpZWQgdGhpcyBjaHVuayB0b28gb2Z0ZW4uIEdpdmluZyB1cC4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lcnJvclByb2Nlc3NpbmcoZmlsZXMsIHJlc3BvbnNlIHx8IHRoaXMub3B0aW9ucy5kaWN0UmVzcG9uc2VFcnJvci5yZXBsYWNlKFwie3tzdGF0dXNDb2RlfX1cIiwgeGhyLnN0YXR1cyksIHhocik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN1Ym1pdFJlcXVlc3RcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0UmVxdWVzdCh4aHIsIGZvcm1EYXRhLCBmaWxlcykge1xuICAgICAgeGhyLnNlbmQoZm9ybURhdGEpO1xuICAgIH0gLy8gQ2FsbGVkIGludGVybmFsbHkgd2hlbiBwcm9jZXNzaW5nIGlzIGZpbmlzaGVkLlxuICAgIC8vIEluZGl2aWR1YWwgY2FsbGJhY2tzIGhhdmUgdG8gYmUgY2FsbGVkIGluIHRoZSBhcHByb3ByaWF0ZSBzZWN0aW9ucy5cblxuICB9LCB7XG4gICAga2V5OiBcIl9maW5pc2hlZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZmluaXNoZWQoZmlsZXMsIHJlc3BvbnNlVGV4dCwgZSkge1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yOSA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyOSA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yMjkgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjI5ID0gZmlsZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI5OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yOSA9IChfc3RlcDI5ID0gX2l0ZXJhdG9yMjkubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI5ID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBmaWxlID0gX3N0ZXAyOS52YWx1ZTtcbiAgICAgICAgICBmaWxlLnN0YXR1cyA9IERyb3B6b25lLlNVQ0NFU1M7XG4gICAgICAgICAgdGhpcy5lbWl0KFwic3VjY2Vzc1wiLCBmaWxlLCByZXNwb25zZVRleHQsIGUpO1xuICAgICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlXCIsIGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyOSA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMjkgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjI5ICYmIF9pdGVyYXRvcjI5W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgIF9pdGVyYXRvcjI5W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjI5KSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZE11bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuZW1pdChcInN1Y2Nlc3NtdWx0aXBsZVwiLCBmaWxlcywgcmVzcG9uc2VUZXh0LCBlKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiY29tcGxldGVtdWx0aXBsZVwiLCBmaWxlcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgIH1cbiAgICB9IC8vIENhbGxlZCBpbnRlcm5hbGx5IHdoZW4gcHJvY2Vzc2luZyBpcyBmaW5pc2hlZC5cbiAgICAvLyBJbmRpdmlkdWFsIGNhbGxiYWNrcyBoYXZlIHRvIGJlIGNhbGxlZCBpbiB0aGUgYXBwcm9wcmlhdGUgc2VjdGlvbnMuXG5cbiAgfSwge1xuICAgIGtleTogXCJfZXJyb3JQcm9jZXNzaW5nXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9lcnJvclByb2Nlc3NpbmcoZmlsZXMsIG1lc3NhZ2UsIHhocikge1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMCA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzMCA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yMzAgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjMwID0gZmlsZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDMwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMCA9IChfc3RlcDMwID0gX2l0ZXJhdG9yMzAubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMwID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBmaWxlID0gX3N0ZXAzMC52YWx1ZTtcbiAgICAgICAgICBmaWxlLnN0YXR1cyA9IERyb3B6b25lLkVSUk9SO1xuICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGZpbGUsIG1lc3NhZ2UsIHhocik7XG4gICAgICAgICAgdGhpcy5lbWl0KFwiY29tcGxldGVcIiwgZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjMwID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IzMCA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzAgJiYgX2l0ZXJhdG9yMzBbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMzBbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMzApIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMzA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JtdWx0aXBsZVwiLCBmaWxlcywgbWVzc2FnZSwgeGhyKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiY29tcGxldGVtdWx0aXBsZVwiLCBmaWxlcyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dLCBbe1xuICAgIGtleTogXCJ1dWlkdjRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXVpZHY0KCkge1xuICAgICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLFxuICAgICAgICAgICAgdiA9IGMgPT09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4O1xuICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRHJvcHpvbmU7XG59KEVtaXR0ZXIpO1xuXG5Ecm9wem9uZS5pbml0Q2xhc3MoKTtcbkRyb3B6b25lLnZlcnNpb24gPSBcIjUuNy4wXCI7IC8vIFRoaXMgaXMgYSBtYXAgb2Ygb3B0aW9ucyBmb3IgeW91ciBkaWZmZXJlbnQgZHJvcHpvbmVzLiBBZGQgY29uZmlndXJhdGlvbnNcbi8vIHRvIHRoaXMgb2JqZWN0IGZvciB5b3VyIGRpZmZlcmVudCBkcm9wem9uZSBlbGVtZW5zLlxuLy9cbi8vIEV4YW1wbGU6XG4vL1xuLy8gICAgIERyb3B6b25lLm9wdGlvbnMubXlEcm9wem9uZUVsZW1lbnRJZCA9IHsgbWF4RmlsZXNpemU6IDEgfTtcbi8vXG4vLyBUbyBkaXNhYmxlIGF1dG9EaXNjb3ZlciBmb3IgYSBzcGVjaWZpYyBlbGVtZW50LCB5b3UgY2FuIHNldCBgZmFsc2VgIGFzIGFuIG9wdGlvbjpcbi8vXG4vLyAgICAgRHJvcHpvbmUub3B0aW9ucy5teURpc2FibGVkRWxlbWVudElkID0gZmFsc2U7XG4vL1xuLy8gQW5kIGluIGh0bWw6XG4vL1xuLy8gICAgIDxmb3JtIGFjdGlvbj1cIi91cGxvYWRcIiBpZD1cIm15LWRyb3B6b25lLWVsZW1lbnQtaWRcIiBjbGFzcz1cImRyb3B6b25lXCI+PC9mb3JtPlxuXG5Ecm9wem9uZS5vcHRpb25zID0ge307IC8vIFJldHVybnMgdGhlIG9wdGlvbnMgZm9yIGFuIGVsZW1lbnQgb3IgdW5kZWZpbmVkIGlmIG5vbmUgYXZhaWxhYmxlLlxuXG5Ecm9wem9uZS5vcHRpb25zRm9yRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIC8vIEdldCB0aGUgYERyb3B6b25lLm9wdGlvbnMuZWxlbWVudElkYCBmb3IgdGhpcyBlbGVtZW50IGlmIGl0IGV4aXN0c1xuICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJpZFwiKSkge1xuICAgIHJldHVybiBEcm9wem9uZS5vcHRpb25zW2NhbWVsaXplKGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaWRcIikpXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59OyAvLyBIb2xkcyBhIGxpc3Qgb2YgYWxsIGRyb3B6b25lIGluc3RhbmNlc1xuXG5cbkRyb3B6b25lLmluc3RhbmNlcyA9IFtdOyAvLyBSZXR1cm5zIHRoZSBkcm9wem9uZSBmb3IgZ2l2ZW4gZWxlbWVudCBpZiBhbnlcblxuRHJvcHpvbmUuZm9yRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIikge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xuICB9XG5cbiAgaWYgKChlbGVtZW50ICE9IG51bGwgPyBlbGVtZW50LmRyb3B6b25lIDogdW5kZWZpbmVkKSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gRHJvcHpvbmUgZm91bmQgZm9yIGdpdmVuIGVsZW1lbnQuIFRoaXMgaXMgcHJvYmFibHkgYmVjYXVzZSB5b3UncmUgdHJ5aW5nIHRvIGFjY2VzcyBpdCBiZWZvcmUgRHJvcHpvbmUgaGFkIHRoZSB0aW1lIHRvIGluaXRpYWxpemUuIFVzZSB0aGUgYGluaXRgIG9wdGlvbiB0byBzZXR1cCBhbnkgYWRkaXRpb25hbCBvYnNlcnZlcnMgb24geW91ciBEcm9wem9uZS5cIik7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5kcm9wem9uZTtcbn07IC8vIFNldCB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCBEcm9wem9uZSB0byBhdXRvbWF0aWNhbGx5IGZpbmQgYW5kIGF0dGFjaCB0byAuZHJvcHpvbmUgZWxlbWVudHMuXG5cblxuRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gdHJ1ZTsgLy8gTG9va3MgZm9yIGFsbCAuZHJvcHpvbmUgZWxlbWVudHMgYW5kIGNyZWF0ZXMgYSBkcm9wem9uZSBmb3IgdGhlbVxuXG5Ecm9wem9uZS5kaXNjb3ZlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGRyb3B6b25lcztcblxuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIGRyb3B6b25lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcHpvbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgZHJvcHpvbmVzID0gW107IC8vIElFIDooXG5cbiAgICB2YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uIGNoZWNrRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMSA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjMxID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjMxID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMzEgPSBlbGVtZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzE7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMxID0gKF9zdGVwMzEgPSBfaXRlcmF0b3IzMS5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzEgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBfc3RlcDMxLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAoLyhefCApZHJvcHpvbmUoJHwgKS8udGVzdChlbC5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRyb3B6b25lcy5wdXNoKGVsKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IzMSA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IzMSA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzEgJiYgX2l0ZXJhdG9yMzFbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IzMVtcInJldHVyblwiXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzMSkge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjMxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KCk7XG4gICAgfTtcblxuICAgIGNoZWNrRWxlbWVudHMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikpO1xuICAgIGNoZWNrRWxlbWVudHMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJmb3JtXCIpKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzIgPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjMyID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yMzIgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMzIgPSBkcm9wem9uZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDMyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMiA9IChfc3RlcDMyID0gX2l0ZXJhdG9yMzIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMyID0gdHJ1ZSkge1xuICAgICAgICB2YXIgZHJvcHpvbmUgPSBfc3RlcDMyLnZhbHVlO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGRyb3B6b25lIHVubGVzcyBhdXRvIGRpc2NvdmVyIGhhcyBiZWVuIGRpc2FibGVkIGZvciBzcGVjaWZpYyBlbGVtZW50XG4gICAgICAgIGlmIChEcm9wem9uZS5vcHRpb25zRm9yRWxlbWVudChkcm9wem9uZSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gobmV3IERyb3B6b25lKGRyb3B6b25lKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IzMiA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvcjMyID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMiAmJiBfaXRlcmF0b3IzMltcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yMzJbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMzIpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjMyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSgpO1xufTsgLy8gU2luY2UgdGhlIHdob2xlIERyYWcnbidEcm9wIEFQSSBpcyBwcmV0dHkgbmV3LCBzb21lIGJyb3dzZXJzIGltcGxlbWVudCBpdCxcbi8vIGJ1dCBub3QgY29ycmVjdGx5LlxuLy8gU28gSSBjcmVhdGVkIGEgYmxhY2tsaXN0IG9mIHVzZXJBZ2VudHMuIFllcywgeWVzLiBCcm93c2VyIHNuaWZmaW5nLCBJIGtub3cuXG4vLyBCdXQgd2hhdCB0byBkbyB3aGVuIGJyb3dzZXJzICp0aGVvcmV0aWNhbGx5KiBzdXBwb3J0IGFuIEFQSSwgYnV0IGNyYXNoXG4vLyB3aGVuIHVzaW5nIGl0LlxuLy9cbi8vIFRoaXMgaXMgYSBsaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGVzdGVkIGFnYWluc3QgbmF2aWdhdG9yLnVzZXJBZ2VudFxuLy9cbi8vICoqIEl0IHNob3VsZCBvbmx5IGJlIHVzZWQgb24gYnJvd3NlciB0aGF0ICpkbyogc3VwcG9ydCB0aGUgQVBJLCBidXRcbi8vIGluY29ycmVjdGx5ICoqXG4vL1xuXG5cbkRyb3B6b25lLmJsYWNrbGlzdGVkQnJvd3NlcnMgPSBbLy8gVGhlIG1hYyBvcyBhbmQgd2luZG93cyBwaG9uZSB2ZXJzaW9uIG9mIG9wZXJhIDEyIHNlZW1zIHRvIGhhdmUgYSBwcm9ibGVtIHdpdGggdGhlIEZpbGUgZHJhZyduJ2Ryb3AgQVBJLlxuL29wZXJhLiooTWFjaW50b3NofFdpbmRvd3MgUGhvbmUpLip2ZXJzaW9uXFwvMTIvaV07IC8vIENoZWNrcyBpZiB0aGUgYnJvd3NlciBpcyBzdXBwb3J0ZWRcblxuRHJvcHpvbmUuaXNCcm93c2VyU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2FwYWJsZUJyb3dzZXIgPSB0cnVlO1xuXG4gIGlmICh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgJiYgd2luZG93LkZvcm1EYXRhICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IpIHtcbiAgICBpZiAoIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpKSkge1xuICAgICAgY2FwYWJsZUJyb3dzZXIgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhlIEFQSSwgYnV0IG1heSBiZSBibGFja2xpc3RlZC5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzMgPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMzMgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjMzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzMyA9IERyb3B6b25lLmJsYWNrbGlzdGVkQnJvd3NlcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDMzOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMyA9IChfc3RlcDMzID0gX2l0ZXJhdG9yMzMubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMzID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciByZWdleCA9IF9zdGVwMzMudmFsdWU7XG5cbiAgICAgICAgICBpZiAocmVnZXgudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgICAgICAgICAgY2FwYWJsZUJyb3dzZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMzMgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvcjMzID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zMyAmJiBfaXRlcmF0b3IzM1tcInJldHVyblwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IzM1tcInJldHVyblwiXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzMztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2FwYWJsZUJyb3dzZXIgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBjYXBhYmxlQnJvd3Nlcjtcbn07XG5cbkRyb3B6b25lLmRhdGFVUkl0b0Jsb2IgPSBmdW5jdGlvbiAoZGF0YVVSSSkge1xuICAvLyBjb252ZXJ0IGJhc2U2NCB0byByYXcgYmluYXJ5IGRhdGEgaGVsZCBpbiBhIHN0cmluZ1xuICAvLyBkb2Vzbid0IGhhbmRsZSBVUkxFbmNvZGVkIERhdGFVUklzIC0gc2VlIFNPIGFuc3dlciAjNjg1MDI3NiBmb3IgY29kZSB0aGF0IGRvZXMgdGhpc1xuICB2YXIgYnl0ZVN0cmluZyA9IGF0b2IoZGF0YVVSSS5zcGxpdCgnLCcpWzFdKTsgLy8gc2VwYXJhdGUgb3V0IHRoZSBtaW1lIGNvbXBvbmVudFxuXG4gIHZhciBtaW1lU3RyaW5nID0gZGF0YVVSSS5zcGxpdCgnLCcpWzBdLnNwbGl0KCc6JylbMV0uc3BsaXQoJzsnKVswXTsgLy8gd3JpdGUgdGhlIGJ5dGVzIG9mIHRoZSBzdHJpbmcgdG8gYW4gQXJyYXlCdWZmZXJcblxuICB2YXIgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZVN0cmluZy5sZW5ndGgpO1xuICB2YXIgaWEgPSBuZXcgVWludDhBcnJheShhYik7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJ5dGVTdHJpbmcubGVuZ3RoLCBhc2MgPSAwIDw9IGVuZDsgYXNjID8gaSA8PSBlbmQgOiBpID49IGVuZDsgYXNjID8gaSsrIDogaS0tKSB7XG4gICAgaWFbaV0gPSBieXRlU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gIH0gLy8gd3JpdGUgdGhlIEFycmF5QnVmZmVyIHRvIGEgYmxvYlxuXG5cbiAgcmV0dXJuIG5ldyBCbG9iKFthYl0sIHtcbiAgICB0eXBlOiBtaW1lU3RyaW5nXG4gIH0pO1xufTsgLy8gUmV0dXJucyBhbiBhcnJheSB3aXRob3V0IHRoZSByZWplY3RlZCBpdGVtXG5cblxudmFyIHdpdGhvdXQgPSBmdW5jdGlvbiB3aXRob3V0KGxpc3QsIHJlamVjdGVkSXRlbSkge1xuICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAhPT0gcmVqZWN0ZWRJdGVtO1xuICB9KS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbTtcbiAgfSk7XG59OyAvLyBhYmMtZGVmX2doaSAtPiBhYmNEZWZHaGlcblxuXG52YXIgY2FtZWxpemUgPSBmdW5jdGlvbiBjYW1lbGl6ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXFwtX10oXFx3KS9nLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2guY2hhckF0KDEpLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufTsgLy8gQ3JlYXRlcyBhbiBlbGVtZW50IGZyb20gc3RyaW5nXG5cblxuRHJvcHpvbmUuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGRpdi5pbm5lckhUTUwgPSBzdHJpbmc7XG4gIHJldHVybiBkaXYuY2hpbGROb2Rlc1swXTtcbn07IC8vIFRlc3RzIGlmIGdpdmVuIGVsZW1lbnQgaXMgaW5zaWRlIChvciBzaW1wbHkgaXMpIHRoZSBjb250YWluZXJcblxuXG5Ecm9wem9uZS5lbGVtZW50SW5zaWRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lcikge1xuICBpZiAoZWxlbWVudCA9PT0gY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gQ29mZmVlc2NyaXB0IGRvZXNuJ3Qgc3VwcG9ydCBkby93aGlsZSBsb29wc1xuXG5cbiAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gY29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5Ecm9wem9uZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsLCBuYW1lKSB7XG4gIHZhciBlbGVtZW50O1xuXG4gIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG4gIH0gZWxzZSBpZiAoZWwubm9kZVR5cGUgIT0gbnVsbCkge1xuICAgIGVsZW1lbnQgPSBlbDtcbiAgfVxuXG4gIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGBcIi5jb25jYXQobmFtZSwgXCJgIG9wdGlvbiBwcm92aWRlZC4gUGxlYXNlIHByb3ZpZGUgYSBDU1Mgc2VsZWN0b3Igb3IgYSBwbGFpbiBIVE1MIGVsZW1lbnQuXCIpKTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50O1xufTtcblxuRHJvcHpvbmUuZ2V0RWxlbWVudHMgPSBmdW5jdGlvbiAoZWxzLCBuYW1lKSB7XG4gIHZhciBlbCwgZWxlbWVudHM7XG5cbiAgaWYgKGVscyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgZWxlbWVudHMgPSBbXTtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM0ID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjM0ID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzNCA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMzQgPSBlbHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zNCA9IChfc3RlcDM0ID0gX2l0ZXJhdG9yMzQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM0ID0gdHJ1ZSkge1xuICAgICAgICAgIGVsID0gX3N0ZXAzNC52YWx1ZTtcbiAgICAgICAgICBlbGVtZW50cy5wdXNoKHRoaXMuZ2V0RWxlbWVudChlbCwgbmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IzNCA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMzQgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM0ICYmIF9pdGVyYXRvcjM0W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgIF9pdGVyYXRvcjM0W1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjM0KSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjM0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVsZW1lbnRzID0gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVscyA9PT0gXCJzdHJpbmdcIikge1xuICAgIGVsZW1lbnRzID0gW107XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zNSA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMzUgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzNSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IzNSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxzKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzU7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM1ID0gKF9zdGVwMzUgPSBfaXRlcmF0b3IzNS5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzUgPSB0cnVlKSB7XG4gICAgICAgIGVsID0gX3N0ZXAzNS52YWx1ZTtcbiAgICAgICAgZWxlbWVudHMucHVzaChlbCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvcjM1ID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yMzUgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM1ICYmIF9pdGVyYXRvcjM1W1wicmV0dXJuXCJdICE9IG51bGwpIHtcbiAgICAgICAgICBfaXRlcmF0b3IzNVtcInJldHVyblwiXSgpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzNSkge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMzU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoZWxzLm5vZGVUeXBlICE9IG51bGwpIHtcbiAgICBlbGVtZW50cyA9IFtlbHNdO1xuICB9XG5cbiAgaWYgKGVsZW1lbnRzID09IG51bGwgfHwgIWVsZW1lbnRzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYFwiLmNvbmNhdChuYW1lLCBcImAgb3B0aW9uIHByb3ZpZGVkLiBQbGVhc2UgcHJvdmlkZSBhIENTUyBzZWxlY3RvciwgYSBwbGFpbiBIVE1MIGVsZW1lbnQgb3IgYSBsaXN0IG9mIHRob3NlLlwiKSk7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudHM7XG59OyAvLyBBc2tzIHRoZSB1c2VyIHRoZSBxdWVzdGlvbiBhbmQgY2FsbHMgYWNjZXB0ZWQgb3IgcmVqZWN0ZWQgYWNjb3JkaW5nbHlcbi8vXG4vLyBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBqdXN0IHVzZXMgYHdpbmRvdy5jb25maXJtYCBhbmQgdGhlbiBjYWxscyB0aGVcbi8vIGFwcHJvcHJpYXRlIGNhbGxiYWNrLlxuXG5cbkRyb3B6b25lLmNvbmZpcm0gPSBmdW5jdGlvbiAocXVlc3Rpb24sIGFjY2VwdGVkLCByZWplY3RlZCkge1xuICBpZiAod2luZG93LmNvbmZpcm0ocXVlc3Rpb24pKSB7XG4gICAgcmV0dXJuIGFjY2VwdGVkKCk7XG4gIH0gZWxzZSBpZiAocmVqZWN0ZWQgIT0gbnVsbCkge1xuICAgIHJldHVybiByZWplY3RlZCgpO1xuICB9XG59OyAvLyBWYWxpZGF0ZXMgdGhlIG1pbWUgdHlwZSBsaWtlIHRoaXM6XG4vL1xuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9IVE1ML0VsZW1lbnQvaW5wdXQjYXR0ci1hY2NlcHRcblxuXG5Ecm9wem9uZS5pc1ZhbGlkRmlsZSA9IGZ1bmN0aW9uIChmaWxlLCBhY2NlcHRlZEZpbGVzKSB7XG4gIGlmICghYWNjZXB0ZWRGaWxlcykge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIElmIHRoZXJlIGFyZSBubyBhY2NlcHRlZCBtaW1lIHR5cGVzLCBpdCdzIE9LXG5cblxuICBhY2NlcHRlZEZpbGVzID0gYWNjZXB0ZWRGaWxlcy5zcGxpdChcIixcIik7XG4gIHZhciBtaW1lVHlwZSA9IGZpbGUudHlwZTtcbiAgdmFyIGJhc2VNaW1lVHlwZSA9IG1pbWVUeXBlLnJlcGxhY2UoL1xcLy4qJC8sIFwiXCIpO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM2ID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMzYgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMzYgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IzNiA9IGFjY2VwdGVkRmlsZXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM2OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zNiA9IChfc3RlcDM2ID0gX2l0ZXJhdG9yMzYubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjM2ID0gdHJ1ZSkge1xuICAgICAgdmFyIHZhbGlkVHlwZSA9IF9zdGVwMzYudmFsdWU7XG4gICAgICB2YWxpZFR5cGUgPSB2YWxpZFR5cGUudHJpbSgpO1xuXG4gICAgICBpZiAodmFsaWRUeXBlLmNoYXJBdCgwKSA9PT0gXCIuXCIpIHtcbiAgICAgICAgaWYgKGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsaWRUeXBlLnRvTG93ZXJDYXNlKCksIGZpbGUubmFtZS5sZW5ndGggLSB2YWxpZFR5cGUubGVuZ3RoKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICgvXFwvXFwqJC8udGVzdCh2YWxpZFR5cGUpKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgc29tZXRoaW5nIGxpa2UgYSBpbWFnZS8qIG1pbWUgdHlwZVxuICAgICAgICBpZiAoYmFzZU1pbWVUeXBlID09PSB2YWxpZFR5cGUucmVwbGFjZSgvXFwvLiokLywgXCJcIikpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG1pbWVUeXBlID09PSB2YWxpZFR5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IzNiA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IzNiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMzYgJiYgX2l0ZXJhdG9yMzZbXCJyZXR1cm5cIl0gIT0gbnVsbCkge1xuICAgICAgICBfaXRlcmF0b3IzNltcInJldHVyblwiXSgpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzNikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjM2O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07IC8vIEF1Z21lbnQgalF1ZXJ5XG5cblxuaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnICYmIGpRdWVyeSAhPT0gbnVsbCkge1xuICBqUXVlcnkuZm4uZHJvcHpvbmUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBEcm9wem9uZSh0aGlzLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZSAhPT0gbnVsbCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IERyb3B6b25lO1xufSBlbHNlIHtcbiAgd2luZG93LkRyb3B6b25lID0gRHJvcHpvbmU7XG59IC8vIERyb3B6b25lIGZpbGUgc3RhdHVzIGNvZGVzXG5cblxuRHJvcHpvbmUuQURERUQgPSBcImFkZGVkXCI7XG5Ecm9wem9uZS5RVUVVRUQgPSBcInF1ZXVlZFwiOyAvLyBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIE5vdywgaWYgYSBmaWxlIGlzIGFjY2VwdGVkLCBpdCdzIGVpdGhlciBxdWV1ZWRcbi8vIG9yIHVwbG9hZGluZy5cblxuRHJvcHpvbmUuQUNDRVBURUQgPSBEcm9wem9uZS5RVUVVRUQ7XG5Ecm9wem9uZS5VUExPQURJTkcgPSBcInVwbG9hZGluZ1wiO1xuRHJvcHpvbmUuUFJPQ0VTU0lORyA9IERyb3B6b25lLlVQTE9BRElORzsgLy8gYWxpYXNcblxuRHJvcHpvbmUuQ0FOQ0VMRUQgPSBcImNhbmNlbGVkXCI7XG5Ecm9wem9uZS5FUlJPUiA9IFwiZXJyb3JcIjtcbkRyb3B6b25lLlNVQ0NFU1MgPSBcInN1Y2Nlc3NcIjtcbi8qXG5cbiBCdWdmaXggZm9yIGlPUyA2IGFuZCA3XG4gU291cmNlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExOTI5MDk5L2h0bWw1LWNhbnZhcy1kcmF3aW1hZ2UtcmF0aW8tYnVnLWlvc1xuIGJhc2VkIG9uIHRoZSB3b3JrIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9zdG9taXRhL2lvcy1pbWFnZWZpbGUtbWVnYXBpeGVsXG5cbiAqL1xuLy8gRGV0ZWN0aW5nIHZlcnRpY2FsIHNxdWFzaCBpbiBsb2FkZWQgaW1hZ2UuXG4vLyBGaXhlcyBhIGJ1ZyB3aGljaCBzcXVhc2ggaW1hZ2UgdmVydGljYWxseSB3aGlsZSBkcmF3aW5nIGludG8gY2FudmFzIGZvciBzb21lIGltYWdlcy5cbi8vIFRoaXMgaXMgYSBidWcgaW4gaU9TNiBkZXZpY2VzLiBUaGlzIGZ1bmN0aW9uIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3N0b21pdGEvaW9zLWltYWdlZmlsZS1tZWdhcGl4ZWxcblxudmFyIGRldGVjdFZlcnRpY2FsU3F1YXNoID0gZnVuY3Rpb24gZGV0ZWN0VmVydGljYWxTcXVhc2goaW1nKSB7XG4gIHZhciBpdyA9IGltZy5uYXR1cmFsV2lkdGg7XG4gIHZhciBpaCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgY2FudmFzLndpZHRoID0gMTtcbiAgY2FudmFzLmhlaWdodCA9IGloO1xuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuXG4gIHZhciBfY3R4JGdldEltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMSwgMCwgMSwgaWgpLFxuICAgICAgZGF0YSA9IF9jdHgkZ2V0SW1hZ2VEYXRhLmRhdGE7IC8vIHNlYXJjaCBpbWFnZSBlZGdlIHBpeGVsIHBvc2l0aW9uIGluIGNhc2UgaXQgaXMgc3F1YXNoZWQgdmVydGljYWxseS5cblxuXG4gIHZhciBzeSA9IDA7XG4gIHZhciBleSA9IGloO1xuICB2YXIgcHkgPSBpaDtcblxuICB3aGlsZSAocHkgPiBzeSkge1xuICAgIHZhciBhbHBoYSA9IGRhdGFbKHB5IC0gMSkgKiA0ICsgM107XG5cbiAgICBpZiAoYWxwaGEgPT09IDApIHtcbiAgICAgIGV5ID0gcHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN5ID0gcHk7XG4gICAgfVxuXG4gICAgcHkgPSBleSArIHN5ID4+IDE7XG4gIH1cblxuICB2YXIgcmF0aW8gPSBweSAvIGloO1xuXG4gIGlmIChyYXRpbyA9PT0gMCkge1xuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByYXRpbztcbiAgfVxufTsgLy8gQSByZXBsYWNlbWVudCBmb3IgY29udGV4dC5kcmF3SW1hZ2Vcbi8vIChhcmdzIGFyZSBmb3Igc291cmNlIGFuZCBkZXN0aW5hdGlvbikuXG5cblxudmFyIGRyYXdJbWFnZUlPU0ZpeCA9IGZ1bmN0aW9uIGRyYXdJbWFnZUlPU0ZpeChjdHgsIGltZywgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoKSB7XG4gIHZhciB2ZXJ0U3F1YXNoUmF0aW8gPSBkZXRlY3RWZXJ0aWNhbFNxdWFzaChpbWcpO1xuICByZXR1cm4gY3R4LmRyYXdJbWFnZShpbWcsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCAvIHZlcnRTcXVhc2hSYXRpbyk7XG59OyAvLyBCYXNlZCBvbiBNaW5pZnlKcGVnXG4vLyBTb3VyY2U6IGh0dHA6Ly93d3cucGVycnkuY3ovZmlsZXMvRXhpZlJlc3RvcmVyLmpzXG4vLyBodHRwOi8vZWxpY29uLmJsb2c1Ny5mYzIuY29tL2Jsb2ctZW50cnktMjA2Lmh0bWxcblxuXG52YXIgRXhpZlJlc3RvcmUgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFeGlmUmVzdG9yZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXhpZlJlc3RvcmUpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEV4aWZSZXN0b3JlLCBudWxsLCBbe1xuICAgIGtleTogXCJpbml0Q2xhc3NcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdENsYXNzKCkge1xuICAgICAgdGhpcy5LRVlfU1RSID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZW5jb2RlNjRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW5jb2RlNjQoaW5wdXQpIHtcbiAgICAgIHZhciBvdXRwdXQgPSAnJztcbiAgICAgIHZhciBjaHIxID0gdW5kZWZpbmVkO1xuICAgICAgdmFyIGNocjIgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgY2hyMyA9ICcnO1xuICAgICAgdmFyIGVuYzEgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgZW5jMiA9IHVuZGVmaW5lZDtcbiAgICAgIHZhciBlbmMzID0gdW5kZWZpbmVkO1xuICAgICAgdmFyIGVuYzQgPSAnJztcbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hyMSA9IGlucHV0W2krK107XG4gICAgICAgIGNocjIgPSBpbnB1dFtpKytdO1xuICAgICAgICBjaHIzID0gaW5wdXRbaSsrXTtcbiAgICAgICAgZW5jMSA9IGNocjEgPj4gMjtcbiAgICAgICAgZW5jMiA9IChjaHIxICYgMykgPDwgNCB8IGNocjIgPj4gNDtcbiAgICAgICAgZW5jMyA9IChjaHIyICYgMTUpIDw8IDIgfCBjaHIzID4+IDY7XG4gICAgICAgIGVuYzQgPSBjaHIzICYgNjM7XG5cbiAgICAgICAgaWYgKGlzTmFOKGNocjIpKSB7XG4gICAgICAgICAgZW5jMyA9IGVuYzQgPSA2NDtcbiAgICAgICAgfSBlbHNlIGlmIChpc05hTihjaHIzKSkge1xuICAgICAgICAgIGVuYzQgPSA2NDtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCA9IG91dHB1dCArIHRoaXMuS0VZX1NUUi5jaGFyQXQoZW5jMSkgKyB0aGlzLktFWV9TVFIuY2hhckF0KGVuYzIpICsgdGhpcy5LRVlfU1RSLmNoYXJBdChlbmMzKSArIHRoaXMuS0VZX1NUUi5jaGFyQXQoZW5jNCk7XG4gICAgICAgIGNocjEgPSBjaHIyID0gY2hyMyA9ICcnO1xuICAgICAgICBlbmMxID0gZW5jMiA9IGVuYzMgPSBlbmM0ID0gJyc7XG5cbiAgICAgICAgaWYgKCEoaSA8IGlucHV0Lmxlbmd0aCkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZXN0b3JlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc3RvcmUob3JpZ0ZpbGVCYXNlNjQsIHJlc2l6ZWRGaWxlQmFzZTY0KSB7XG4gICAgICBpZiAoIW9yaWdGaWxlQmFzZTY0Lm1hdGNoKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcpKSB7XG4gICAgICAgIHJldHVybiByZXNpemVkRmlsZUJhc2U2NDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJhd0ltYWdlID0gdGhpcy5kZWNvZGU2NChvcmlnRmlsZUJhc2U2NC5yZXBsYWNlKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcsICcnKSk7XG4gICAgICB2YXIgc2VnbWVudHMgPSB0aGlzLnNsaWNlMlNlZ21lbnRzKHJhd0ltYWdlKTtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuZXhpZk1hbmlwdWxhdGlvbihyZXNpemVkRmlsZUJhc2U2NCwgc2VnbWVudHMpO1xuICAgICAgcmV0dXJuIFwiZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCxcIi5jb25jYXQodGhpcy5lbmNvZGU2NChpbWFnZSkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJleGlmTWFuaXB1bGF0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4aWZNYW5pcHVsYXRpb24ocmVzaXplZEZpbGVCYXNlNjQsIHNlZ21lbnRzKSB7XG4gICAgICB2YXIgZXhpZkFycmF5ID0gdGhpcy5nZXRFeGlmQXJyYXkoc2VnbWVudHMpO1xuICAgICAgdmFyIG5ld0ltYWdlQXJyYXkgPSB0aGlzLmluc2VydEV4aWYocmVzaXplZEZpbGVCYXNlNjQsIGV4aWZBcnJheSk7XG4gICAgICB2YXIgYUJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG5ld0ltYWdlQXJyYXkpO1xuICAgICAgcmV0dXJuIGFCdWZmZXI7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldEV4aWZBcnJheVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFeGlmQXJyYXkoc2VnbWVudHMpIHtcbiAgICAgIHZhciBzZWcgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgeCA9IDA7XG5cbiAgICAgIHdoaWxlICh4IDwgc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHNlZyA9IHNlZ21lbnRzW3hdO1xuXG4gICAgICAgIGlmIChzZWdbMF0gPT09IDI1NSAmIHNlZ1sxXSA9PT0gMjI1KSB7XG4gICAgICAgICAgcmV0dXJuIHNlZztcbiAgICAgICAgfVxuXG4gICAgICAgIHgrKztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbnNlcnRFeGlmXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEV4aWYocmVzaXplZEZpbGVCYXNlNjQsIGV4aWZBcnJheSkge1xuICAgICAgdmFyIGltYWdlRGF0YSA9IHJlc2l6ZWRGaWxlQmFzZTY0LnJlcGxhY2UoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJywgJycpO1xuICAgICAgdmFyIGJ1ZiA9IHRoaXMuZGVjb2RlNjQoaW1hZ2VEYXRhKTtcbiAgICAgIHZhciBzZXBhcmF0ZVBvaW50ID0gYnVmLmluZGV4T2YoMjU1LCAzKTtcbiAgICAgIHZhciBtYWUgPSBidWYuc2xpY2UoMCwgc2VwYXJhdGVQb2ludCk7XG4gICAgICB2YXIgYXRvID0gYnVmLnNsaWNlKHNlcGFyYXRlUG9pbnQpO1xuICAgICAgdmFyIGFycmF5ID0gbWFlO1xuICAgICAgYXJyYXkgPSBhcnJheS5jb25jYXQoZXhpZkFycmF5KTtcbiAgICAgIGFycmF5ID0gYXJyYXkuY29uY2F0KGF0byk7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNsaWNlMlNlZ21lbnRzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNsaWNlMlNlZ21lbnRzKHJhd0ltYWdlQXJyYXkpIHtcbiAgICAgIHZhciBoZWFkID0gMDtcbiAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgbGVuZ3RoO1xuXG4gICAgICAgIGlmIChyYXdJbWFnZUFycmF5W2hlYWRdID09PSAyNTUgJiByYXdJbWFnZUFycmF5W2hlYWQgKyAxXSA9PT0gMjE4KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmF3SW1hZ2VBcnJheVtoZWFkXSA9PT0gMjU1ICYgcmF3SW1hZ2VBcnJheVtoZWFkICsgMV0gPT09IDIxNikge1xuICAgICAgICAgIGhlYWQgKz0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZW5ndGggPSByYXdJbWFnZUFycmF5W2hlYWQgKyAyXSAqIDI1NiArIHJhd0ltYWdlQXJyYXlbaGVhZCArIDNdO1xuICAgICAgICAgIHZhciBlbmRQb2ludCA9IGhlYWQgKyBsZW5ndGggKyAyO1xuICAgICAgICAgIHZhciBzZWcgPSByYXdJbWFnZUFycmF5LnNsaWNlKGhlYWQsIGVuZFBvaW50KTtcbiAgICAgICAgICBzZWdtZW50cy5wdXNoKHNlZyk7XG4gICAgICAgICAgaGVhZCA9IGVuZFBvaW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhlYWQgPiByYXdJbWFnZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZGVjb2RlNjRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVjb2RlNjQoaW5wdXQpIHtcbiAgICAgIHZhciBvdXRwdXQgPSAnJztcbiAgICAgIHZhciBjaHIxID0gdW5kZWZpbmVkO1xuICAgICAgdmFyIGNocjIgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgY2hyMyA9ICcnO1xuICAgICAgdmFyIGVuYzEgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgZW5jMiA9IHVuZGVmaW5lZDtcbiAgICAgIHZhciBlbmMzID0gdW5kZWZpbmVkO1xuICAgICAgdmFyIGVuYzQgPSAnJztcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBidWYgPSBbXTsgLy8gcmVtb3ZlIGFsbCBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBBLVosIGEteiwgMC05LCArLCAvLCBvciA9XG5cbiAgICAgIHZhciBiYXNlNjR0ZXN0ID0gL1teQS1aYS16MC05XFwrXFwvXFw9XS9nO1xuXG4gICAgICBpZiAoYmFzZTY0dGVzdC5leGVjKGlucHV0KSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1RoZXJlIHdlcmUgaW52YWxpZCBiYXNlNjQgY2hhcmFjdGVycyBpbiB0aGUgaW5wdXQgdGV4dC5cXG5WYWxpZCBiYXNlNjQgY2hhcmFjdGVycyBhcmUgQS1aLCBhLXosIDAtOSwgXFwnK1xcJywgXFwnL1xcJyxhbmQgXFwnPVxcJ1xcbkV4cGVjdCBlcnJvcnMgaW4gZGVjb2RpbmcuJyk7XG4gICAgICB9XG5cbiAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgZW5jMSA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jMiA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jMyA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jNCA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgY2hyMSA9IGVuYzEgPDwgMiB8IGVuYzIgPj4gNDtcbiAgICAgICAgY2hyMiA9IChlbmMyICYgMTUpIDw8IDQgfCBlbmMzID4+IDI7XG4gICAgICAgIGNocjMgPSAoZW5jMyAmIDMpIDw8IDYgfCBlbmM0O1xuICAgICAgICBidWYucHVzaChjaHIxKTtcblxuICAgICAgICBpZiAoZW5jMyAhPT0gNjQpIHtcbiAgICAgICAgICBidWYucHVzaChjaHIyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmM0ICE9PSA2NCkge1xuICAgICAgICAgIGJ1Zi5wdXNoKGNocjMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hyMSA9IGNocjIgPSBjaHIzID0gJyc7XG4gICAgICAgIGVuYzEgPSBlbmMyID0gZW5jMyA9IGVuYzQgPSAnJztcblxuICAgICAgICBpZiAoIShpIDwgaW5wdXQubGVuZ3RoKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWY7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEV4aWZSZXN0b3JlO1xufSgpO1xuXG5FeGlmUmVzdG9yZS5pbml0Q2xhc3MoKTtcbi8qXG4gKiBjb250ZW50bG9hZGVkLmpzXG4gKlxuICogQXV0aG9yOiBEaWVnbyBQZXJpbmkgKGRpZWdvLnBlcmluaSBhdCBnbWFpbC5jb20pXG4gKiBTdW1tYXJ5OiBjcm9zcy1icm93c2VyIHdyYXBwZXIgZm9yIERPTUNvbnRlbnRMb2FkZWRcbiAqIFVwZGF0ZWQ6IDIwMTAxMDIwXG4gKiBMaWNlbnNlOiBNSVRcbiAqIFZlcnNpb246IDEuMlxuICpcbiAqIFVSTDpcbiAqIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9Db250ZW50TG9hZGVkL1xuICogaHR0cDovL2phdmFzY3JpcHQubndib3guY29tL0NvbnRlbnRMb2FkZWQvTUlULUxJQ0VOU0VcbiAqL1xuLy8gQHdpbiB3aW5kb3cgcmVmZXJlbmNlXG4vLyBAZm4gZnVuY3Rpb24gcmVmZXJlbmNlXG5cbnZhciBjb250ZW50TG9hZGVkID0gZnVuY3Rpb24gY29udGVudExvYWRlZCh3aW4sIGZuKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHZhciB0b3AgPSB0cnVlO1xuICB2YXIgZG9jID0gd2luLmRvY3VtZW50O1xuICB2YXIgcm9vdCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gIHZhciBhZGQgPSBkb2MuYWRkRXZlbnRMaXN0ZW5lciA/IFwiYWRkRXZlbnRMaXN0ZW5lclwiIDogXCJhdHRhY2hFdmVudFwiO1xuICB2YXIgcmVtID0gZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyBcInJlbW92ZUV2ZW50TGlzdGVuZXJcIiA6IFwiZGV0YWNoRXZlbnRcIjtcbiAgdmFyIHByZSA9IGRvYy5hZGRFdmVudExpc3RlbmVyID8gXCJcIiA6IFwib25cIjtcblxuICB2YXIgaW5pdCA9IGZ1bmN0aW9uIGluaXQoZSkge1xuICAgIGlmIChlLnR5cGUgPT09IFwicmVhZHlzdGF0ZWNoYW5nZVwiICYmIGRvYy5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAoZS50eXBlID09PSBcImxvYWRcIiA/IHdpbiA6IGRvYylbcmVtXShwcmUgKyBlLnR5cGUsIGluaXQsIGZhbHNlKTtcblxuICAgIGlmICghZG9uZSAmJiAoZG9uZSA9IHRydWUpKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh3aW4sIGUudHlwZSB8fCBlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHBvbGwgPSBmdW5jdGlvbiBwb2xsKCkge1xuICAgIHRyeSB7XG4gICAgICByb290LmRvU2Nyb2xsKFwibGVmdFwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRUaW1lb3V0KHBvbGwsIDUwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5pdChcInBvbGxcIik7XG4gIH07XG5cbiAgaWYgKGRvYy5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIpIHtcbiAgICBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0ICYmIHJvb3QuZG9TY3JvbGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRvcCA9ICF3aW4uZnJhbWVFbGVtZW50O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5cbiAgICAgIGlmICh0b3ApIHtcbiAgICAgICAgcG9sbCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRvY1thZGRdKHByZSArIFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0LCBmYWxzZSk7XG4gICAgZG9jW2FkZF0ocHJlICsgXCJyZWFkeXN0YXRlY2hhbmdlXCIsIGluaXQsIGZhbHNlKTtcbiAgICByZXR1cm4gd2luW2FkZF0ocHJlICsgXCJsb2FkXCIsIGluaXQsIGZhbHNlKTtcbiAgfVxufTsgLy8gQXMgYSBzaW5nbGUgZnVuY3Rpb24gdG8gYmUgYWJsZSB0byB3cml0ZSB0ZXN0cy5cblxuXG5Ecm9wem9uZS5fYXV0b0Rpc2NvdmVyRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChEcm9wem9uZS5hdXRvRGlzY292ZXIpIHtcbiAgICByZXR1cm4gRHJvcHpvbmUuZGlzY292ZXIoKTtcbiAgfVxufTtcblxuY29udGVudExvYWRlZCh3aW5kb3csIERyb3B6b25lLl9hdXRvRGlzY292ZXJGdW5jdGlvbik7XG5cbmZ1bmN0aW9uIF9fZ3VhcmRfXyh2YWx1ZSwgdHJhbnNmb3JtKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsID8gdHJhbnNmb3JtKHZhbHVlKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX19ndWFyZE1ldGhvZF9fKG9iaiwgbWV0aG9kTmFtZSwgdHJhbnNmb3JtKSB7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSAndW5kZWZpbmVkJyAmJiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9ialttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0cmFuc2Zvcm0ob2JqLCBtZXRob2ROYW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHRpZiAoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcblx0XHRtb2R1bGUuZGVwcmVjYXRlID0gZnVuY3Rpb24oKSB7fTtcblx0XHRtb2R1bGUucGF0aHMgPSBbXTtcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcblx0XHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XG5cdH1cblx0cmV0dXJuIG1vZHVsZTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9