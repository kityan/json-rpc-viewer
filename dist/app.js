/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(setImmediate) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_json_formatter_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_json_formatter_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_json_formatter_js__);


const body = document.getElementsByTagName('body')
const left = document.getElementById('left')
const right = document.getElementById('right')
const params = document.getElementById('params')
const table = document.getElementById('table')
const helpPopup = document.getElementById('helpPopup')
const divParamsViewer = document.getElementById('params_json_viewer')
const divResultErrorViewer = document.getElementById('resultError_json_viewer')
const leftResizer = document.getElementById('left_resizer')
const paramsResizer = document.getElementById('params_resizer')
const resetLayoutBtn = document.getElementById('reset_layout')
const opts = {animateOpen: false, animateClose: false}
const currentTheme = chrome.devtools.panels.themeName

let trClass = 1;

// add theme class name
if (currentTheme && body.length > 0) {
    body[0].classList.add('theme-' + currentTheme)
}

loadLayout()

// clear log
document.getElementById('clear').addEventListener('click', () => {
    divParamsViewer.innerHTML = ''
    divResultErrorViewer.innerHTML = ''
    Array.from(table.childNodes).forEach((node, index) => index > 1 && table.removeChild(node))
})

// show help
document.getElementById('help').addEventListener('click', () => helpPopup.classList.remove('hidden'))
document.getElementById('closeHelp').addEventListener('click', () => helpPopup.classList.add('hidden'))

// process finished request
chrome.devtools.network.onRequestFinished.addListener(request => {
    if (
        request.request &&
        request.request.postData &&
        request.request.postData.mimeType &&
        request.request.postData.mimeType.match(/application\/json/) &&
        request.request.postData.text && request.request.postData.text.match(/jsonrpc/)
    ) {
        request.getContent(body => {
            // [+] add check for spec?
            const responseJSON = JSON.parse(body)
            const requestJSON = JSON.parse(request.request.postData.text)
            // [+] add check for equal length?

            const isBatch = Array.isArray(requestJSON) && Array.isArray(responseJSON)
            if (!isBatch) {
                addListItem(request, requestJSON, responseJSON)
            } else {
                const reponseJSONIndex = responseJSON.reduce((obj, item) => {
                    obj[item.id] = item;
                    return obj
                }, {})
                // [+] add check and warning for: id duplication? absent id?
                for (let i = 0; i < requestJSON.length; i++) {
                    const inBatch = i == 0 ? 'start' : (i == requestJSON.length - 1 ? 'end' : 'mid')
                    addListItem(request, requestJSON[i], reponseJSONIndex[requestJSON[i].id], inBatch, requestJSON.length)
                }
            }

        })
    }
})


function addListItem(request, requestJSON, responseJSON, inBatch, batchSize) {

    const tr = document.createElement('tr')
    tr.classList.add(trClass > 0 ? 'even' : 'odd')
    trClass *= -1

    const td1 = document.createElement('td')

    if (responseJSON) {
        td1.classList.add(responseJSON && responseJSON.hasOwnProperty && responseJSON.hasOwnProperty('result') ? 'ok' : 'error')
    } else {
        td1.classList.add('reponseNotParsed')
    }

    const td2 = document.createElement('td')
    const td3 = document.createElement('td')
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)


    const wasScrolledToBottom = left.clientHeight + Math.ceil(left.scrollTop) >= left.scrollHeight
    table.appendChild(tr)
    if (wasScrolledToBottom) {
        setImmediate(() => left.scrollTop = left.scrollHeight - left.clientHeight)
    }


    tr.addEventListener('click', event => {
        Array.from(document.getElementsByTagName('tr')).forEach(el => el.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
        let formatter1
        if (requestJSON && requestJSON.hasOwnProperty && requestJSON.hasOwnProperty('params')) {
            formatter1 = new __WEBPACK_IMPORTED_MODULE_0_json_formatter_js___default.a(requestJSON.params, 1, opts)
        }
        // [?] too large responses are not available
        let formatter2
        if (responseJSON && responseJSON.hasOwnProperty) {
            if (responseJSON.hasOwnProperty('result')) {
                formatter2 = new __WEBPACK_IMPORTED_MODULE_0_json_formatter_js___default.a(responseJSON.result, 1, opts)
            }
            if (responseJSON.hasOwnProperty('error')) {
                formatter2 = new __WEBPACK_IMPORTED_MODULE_0_json_formatter_js___default.a(responseJSON.error, 1, opts)
            }
        }
        divParamsViewer.innerHTML = ''
        if (formatter1) {
            divParamsViewer.appendChild(formatter1.render())
        }
        divResultErrorViewer.innerHTML = ''
        if (formatter2) {
            divResultErrorViewer.appendChild(formatter2.render())
        }
    })

    const time = Number.isFinite(request.time) ? Math.round(request.time) : ''
    const size = request.response && request.response.content && request.response.content.size

    const method = document.createElement('div');
    const url = document.createElement('div');

    method.classList.add('title');
    url.classList.add('url');

    const origin = request.request.headers.find(({ name }) => name === 'Host');
    const host = origin ? origin.value : '';

    if (!request.request.url.includes(host)) {
      url.classList.add('cors');
    }

    method.innerText = requestJSON.method;
    url.innerText = request.request.url;

    td1.appendChild(method);
    td1.appendChild(url);

    td1.classList.add('methodName');

    if (inBatch) {
        td1.classList.add('inBatch_' + inBatch)
        if (inBatch === 'start') {
            td2.innerText = time
            td3.innerText = size
        } else {
            td2.innerText = ' '
            td3.innerText = ' '
        }
    } else {
        td2.innerText = time
        td3.innerText = size
    }

}

leftResizer.addEventListener('mousedown', function (e) {
    document.addEventListener('mousemove', resizeLeftDiv)
    document.addEventListener('mouseup', stopResizeLeftDiv)
    document.addEventListener('mouseleave', stopResizeLeftDiv)
})

function loadLayout() {
    const leftWidth = localStorage.getItem('left-width')
    const paramsHeight = localStorage.getItem('params-height')

    left.style.width = leftWidth ? leftWidth : '50%';
    params.style.height = paramsHeight ? paramsHeight : '25%';

    if (leftWidth || paramsHeight) {
        resetLayoutBtn.style.display = 'inherit'
    } else {
        resetLayoutBtn.style.display = 'none'
    }
}

/**
 * @param {MouseEvent} e
 */
function resizeLeftDiv(e) {
    left.style.width = (e.pageX / body[0].clientWidth) * 100 + '%';
    localStorage.setItem('left-width', left.style.width)
    resetLayoutBtn.style.display = 'inherit'
}

function stopResizeLeftDiv() {
    document.removeEventListener('mousemove', resizeLeftDiv)
    document.removeEventListener('mouseup', stopResizeLeftDiv)
    document.removeEventListener('mouseleave', stopResizeLeftDiv)
}

paramsResizer.addEventListener('mousedown', function (e) {
    document.addEventListener('mousemove', resizeParamsDiv)
    document.addEventListener('mouseup', stopResizeParamsDiv)
    document.addEventListener('mouseleave', stopResizeParamsDiv)
})

/**
 * @param {MouseEvent} e
 */
function resizeParamsDiv(e) {
    let rightRect = right.getBoundingClientRect()
    params.style.height = ((e.pageY - rightRect.top) / rightRect.height) * 100 + '%';
    localStorage.setItem('params-height', params.style.height)
    resetLayoutBtn.style.display = 'inherit'
}

function stopResizeParamsDiv() {
    document.removeEventListener('mousemove', resizeParamsDiv)
    document.removeEventListener('mouseup', stopResizeParamsDiv)
    document.removeEventListener('mouseleave', stopResizeParamsDiv)
}

resetLayoutBtn.addEventListener('click', function () {
    localStorage.removeItem('params-height')
    localStorage.removeItem('left-width')
    loadLayout()
})

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2).setImmediate))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(3);
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function(modules) {
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    var installedModules = {};
    return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
    __webpack_require__.i = function(value) {
        return value;
    }, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            configurable: !1,
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "dist", __webpack_require__(__webpack_require__.s = 6);
}([ function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", {
        value: !0
    });
    var __WEBPACK_IMPORTED_MODULE_0__helpers__ = __webpack_require__(5), __WEBPACK_IMPORTED_MODULE_1__style_less__ = __webpack_require__(4), DATE_STRING_REGEX = (__webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__style_less__), 
    /(^\d{1,4}[\.|\\\/|-]\d{1,2}[\.|\\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/), PARTIAL_DATE_REGEX = /\d{2}:\d{2}:\d{2} GMT-\d{4}/, JSON_DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/, requestAnimationFrame = window.requestAnimationFrame || function(cb) {
        return cb(), 0;
    }, _defaultConfig = {
        hoverPreviewEnabled: !1,
        hoverPreviewArrayCount: 100,
        hoverPreviewFieldCount: 5,
        animateOpen: !0,
        animateClose: !0,
        theme: null,
        useToJSON: !0,
        sortPropertiesBy: null
    }, JSONFormatter = function() {
        function JSONFormatter(json, open, config, key) {
            void 0 === open && (open = 1), void 0 === config && (config = _defaultConfig), this.json = json, 
            this.open = open, this.config = config, this.key = key, this._isOpen = null, void 0 === this.config.hoverPreviewEnabled && (this.config.hoverPreviewEnabled = _defaultConfig.hoverPreviewEnabled), 
            void 0 === this.config.hoverPreviewArrayCount && (this.config.hoverPreviewArrayCount = _defaultConfig.hoverPreviewArrayCount), 
            void 0 === this.config.hoverPreviewFieldCount && (this.config.hoverPreviewFieldCount = _defaultConfig.hoverPreviewFieldCount), 
            void 0 === this.config.useToJSON && (this.config.useToJSON = _defaultConfig.useToJSON);
        }
        return Object.defineProperty(JSONFormatter.prototype, "isOpen", {
            get: function() {
                return null !== this._isOpen ? this._isOpen : this.open > 0;
            },
            set: function(value) {
                this._isOpen = value;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isDate", {
            get: function() {
                return this.json instanceof Date || "string" === this.type && (DATE_STRING_REGEX.test(this.json) || JSON_DATE_REGEX.test(this.json) || PARTIAL_DATE_REGEX.test(this.json));
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isUrl", {
            get: function() {
                return "string" === this.type && 0 === this.json.indexOf("http");
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isArray", {
            get: function() {
                return Array.isArray(this.json);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isObject", {
            get: function() {
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.a)(this.json);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isEmptyObject", {
            get: function() {
                return !this.keys.length && !this.isArray;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "isEmpty", {
            get: function() {
                return this.isEmptyObject || this.keys && !this.keys.length && this.isArray;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "useToJSON", {
            get: function() {
                return this.config.useToJSON && "stringifiable" === this.type;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "hasKey", {
            get: function() {
                return void 0 !== this.key;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "constructorName", {
            get: function() {
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.b)(this.json);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "type", {
            get: function() {
                return null === this.json ? "null" : this.config.useToJSON && this.json && this.json.toJSON ? "stringifiable" : typeof this.json;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(JSONFormatter.prototype, "keys", {
            get: function() {
                if (this.isObject) {
                    var keys = Object.keys(this.json).map(function(key) {
                        return key || '""';
                    });
                    return !this.isArray && this.config.sortPropertiesBy ? keys.sort(this.config.sortPropertiesBy) : keys;
                }
                return [];
            },
            enumerable: !0,
            configurable: !0
        }), JSONFormatter.prototype.toggleOpen = function() {
            this.isOpen = !this.isOpen, this.element && (this.isOpen ? this.appendChildren(this.config.animateOpen) : this.removeChildren(this.config.animateClose), 
            this.element.classList.toggle(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("open")));
        }, JSONFormatter.prototype.openAtDepth = function(depth) {
            void 0 === depth && (depth = 1), depth < 0 || (this.open = depth, this.isOpen = 0 !== depth, 
            this.element && (this.removeChildren(!1), 0 === depth ? this.element.classList.remove(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("open")) : (this.appendChildren(this.config.animateOpen), 
            this.element.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("open")))));
        }, JSONFormatter.prototype.getInlinepreview = function() {
            var _this = this;
            if (this.isArray) return this.json.length > this.config.hoverPreviewArrayCount ? "Array[" + this.json.length + "]" : "[" + this.json.map(__WEBPACK_IMPORTED_MODULE_0__helpers__.d).join(", ") + "]";
            var keys = this.keys, narrowKeys = keys.slice(0, this.config.hoverPreviewFieldCount), kvs = narrowKeys.map(function(key) {
                return key + ":" + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.d)(_this.type, _this.json[key]);
            }), ellipsis = keys.length >= this.config.hoverPreviewFieldCount ? "…" : "";
            return "{" + kvs.join(", ") + ellipsis + "}";
        }, JSONFormatter.prototype.render = function() {
            this.element = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("div", "row");
            var togglerLink = this.isObject ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("a", "toggler-link") : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span");
            if (this.isObject && !this.useToJSON && togglerLink.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "toggler")), 
            this.hasKey && togglerLink.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "key", this.key + ":")), 
            this.isObject && !this.useToJSON) {
                var value = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "value"), objectWrapperSpan = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span"), constructorName = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "constructor-name", this.constructorName);
                if (objectWrapperSpan.appendChild(constructorName), this.isArray) {
                    var arrayWrapperSpan = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span");
                    arrayWrapperSpan.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "bracket", "[")), 
                    arrayWrapperSpan.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "number", this.json.length)), 
                    arrayWrapperSpan.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "bracket", "]")), 
                    objectWrapperSpan.appendChild(arrayWrapperSpan);
                }
                value.appendChild(objectWrapperSpan), togglerLink.appendChild(value);
            } else {
                var value = this.isUrl ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("a") : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span");
                value.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)(this.type)), 
                this.isDate && value.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("date")), 
                this.isUrl && (value.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("url")), 
                value.setAttribute("href", this.json));
                var valuePreview = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.f)(this.type, this.json, this.useToJSON ? this.json.toJSON() : this.json);
                value.appendChild(document.createTextNode(valuePreview)), togglerLink.appendChild(value);
            }
            if (this.isObject && this.config.hoverPreviewEnabled) {
                var preview = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("span", "preview-text");
                preview.appendChild(document.createTextNode(this.getInlinepreview())), togglerLink.appendChild(preview);
            }
            var children = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.e)("div", "children");
            return this.isObject && children.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("object")), 
            this.isArray && children.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("array")), 
            this.isEmpty && children.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("empty")), 
            this.config && this.config.theme && this.element.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)(this.config.theme)), 
            this.isOpen && this.element.classList.add(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("open")), 
            this.element.appendChild(togglerLink), this.element.appendChild(children), this.isObject && this.isOpen && this.appendChildren(), 
            this.isObject && !this.useToJSON && togglerLink.addEventListener("click", this.toggleOpen.bind(this)), 
            this.element;
        }, JSONFormatter.prototype.appendChildren = function(animated) {
            var _this = this;
            void 0 === animated && (animated = !1);
            var children = this.element.querySelector("div." + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("children"));
            if (children && !this.isEmpty) if (animated) {
                var index_1 = 0, addAChild_1 = function() {
                    var key = _this.keys[index_1], formatter = new JSONFormatter(_this.json[key], _this.open - 1, _this.config, key);
                    children.appendChild(formatter.render()), (index_1 += 1) < _this.keys.length && (index_1 > 10 ? addAChild_1() : requestAnimationFrame(addAChild_1));
                };
                requestAnimationFrame(addAChild_1);
            } else this.keys.forEach(function(key) {
                var formatter = new JSONFormatter(_this.json[key], _this.open - 1, _this.config, key);
                children.appendChild(formatter.render());
            });
        }, JSONFormatter.prototype.removeChildren = function(animated) {
            void 0 === animated && (animated = !1);
            var childrenElement = this.element.querySelector("div." + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__.c)("children"));
            if (animated) {
                var childrenRemoved_1 = 0, removeAChild_1 = function() {
                    childrenElement && childrenElement.children.length && (childrenElement.removeChild(childrenElement.children[0]), 
                    childrenRemoved_1 += 1, childrenRemoved_1 > 10 ? removeAChild_1() : requestAnimationFrame(removeAChild_1));
                };
                requestAnimationFrame(removeAChild_1);
            } else childrenElement && (childrenElement.innerHTML = "");
        }, JSONFormatter;
    }();
    __webpack_exports__.default = JSONFormatter;
}, function(module, exports, __webpack_require__) {
    exports = module.exports = __webpack_require__(2)(), exports.push([ module.i, '.json-formatter-row {\n  font-family: monospace;\n}\n.json-formatter-row,\n.json-formatter-row a,\n.json-formatter-row a:hover {\n  color: black;\n  text-decoration: none;\n}\n.json-formatter-row .json-formatter-row {\n  margin-left: 1rem;\n}\n.json-formatter-row .json-formatter-children.json-formatter-empty {\n  opacity: 0.5;\n  margin-left: 1rem;\n}\n.json-formatter-row .json-formatter-children.json-formatter-empty:after {\n  display: none;\n}\n.json-formatter-row .json-formatter-children.json-formatter-empty.json-formatter-object:after {\n  content: "No properties";\n}\n.json-formatter-row .json-formatter-children.json-formatter-empty.json-formatter-array:after {\n  content: "[]";\n}\n.json-formatter-row .json-formatter-string,\n.json-formatter-row .json-formatter-stringifiable {\n  color: green;\n  white-space: pre;\n  word-wrap: break-word;\n}\n.json-formatter-row .json-formatter-number {\n  color: blue;\n}\n.json-formatter-row .json-formatter-boolean {\n  color: red;\n}\n.json-formatter-row .json-formatter-null {\n  color: #855A00;\n}\n.json-formatter-row .json-formatter-undefined {\n  color: #ca0b69;\n}\n.json-formatter-row .json-formatter-function {\n  color: #FF20ED;\n}\n.json-formatter-row .json-formatter-date {\n  background-color: rgba(0, 0, 0, 0.05);\n}\n.json-formatter-row .json-formatter-url {\n  text-decoration: underline;\n  color: blue;\n  cursor: pointer;\n}\n.json-formatter-row .json-formatter-bracket {\n  color: blue;\n}\n.json-formatter-row .json-formatter-key {\n  color: #00008B;\n  padding-right: 0.2rem;\n}\n.json-formatter-row .json-formatter-toggler-link {\n  cursor: pointer;\n}\n.json-formatter-row .json-formatter-toggler {\n  line-height: 1.2rem;\n  font-size: 0.7rem;\n  vertical-align: middle;\n  opacity: 0.6;\n  cursor: pointer;\n  padding-right: 0.2rem;\n}\n.json-formatter-row .json-formatter-toggler:after {\n  display: inline-block;\n  transition: transform 100ms ease-in;\n  content: "\\25BA";\n}\n.json-formatter-row > a > .json-formatter-preview-text {\n  opacity: 0;\n  transition: opacity 0.15s ease-in;\n  font-style: italic;\n}\n.json-formatter-row:hover > a > .json-formatter-preview-text {\n  opacity: 0.6;\n}\n.json-formatter-row.json-formatter-open > .json-formatter-toggler-link .json-formatter-toggler:after {\n  transform: rotate(90deg);\n}\n.json-formatter-row.json-formatter-open > .json-formatter-children:after {\n  display: inline-block;\n}\n.json-formatter-row.json-formatter-open > a > .json-formatter-preview-text {\n  display: none;\n}\n.json-formatter-row.json-formatter-open.json-formatter-empty:after {\n  display: block;\n}\n.json-formatter-dark.json-formatter-row {\n  font-family: monospace;\n}\n.json-formatter-dark.json-formatter-row,\n.json-formatter-dark.json-formatter-row a,\n.json-formatter-dark.json-formatter-row a:hover {\n  color: white;\n  text-decoration: none;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-row {\n  margin-left: 1rem;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-children.json-formatter-empty {\n  opacity: 0.5;\n  margin-left: 1rem;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-children.json-formatter-empty:after {\n  display: none;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-children.json-formatter-empty.json-formatter-object:after {\n  content: "No properties";\n}\n.json-formatter-dark.json-formatter-row .json-formatter-children.json-formatter-empty.json-formatter-array:after {\n  content: "[]";\n}\n.json-formatter-dark.json-formatter-row .json-formatter-string,\n.json-formatter-dark.json-formatter-row .json-formatter-stringifiable {\n  color: #31F031;\n  white-space: pre;\n  word-wrap: break-word;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-number {\n  color: #66C2FF;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-boolean {\n  color: #EC4242;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-null {\n  color: #EEC97D;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-undefined {\n  color: #ef8fbe;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-function {\n  color: #FD48CB;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-date {\n  background-color: rgba(255, 255, 255, 0.05);\n}\n.json-formatter-dark.json-formatter-row .json-formatter-url {\n  text-decoration: underline;\n  color: #027BFF;\n  cursor: pointer;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-bracket {\n  color: #9494FF;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-key {\n  color: #23A0DB;\n  padding-right: 0.2rem;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-toggler-link {\n  cursor: pointer;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-toggler {\n  line-height: 1.2rem;\n  font-size: 0.7rem;\n  vertical-align: middle;\n  opacity: 0.6;\n  cursor: pointer;\n  padding-right: 0.2rem;\n}\n.json-formatter-dark.json-formatter-row .json-formatter-toggler:after {\n  display: inline-block;\n  transition: transform 100ms ease-in;\n  content: "\\25BA";\n}\n.json-formatter-dark.json-formatter-row > a > .json-formatter-preview-text {\n  opacity: 0;\n  transition: opacity 0.15s ease-in;\n  font-style: italic;\n}\n.json-formatter-dark.json-formatter-row:hover > a > .json-formatter-preview-text {\n  opacity: 0.6;\n}\n.json-formatter-dark.json-formatter-row.json-formatter-open > .json-formatter-toggler-link .json-formatter-toggler:after {\n  transform: rotate(90deg);\n}\n.json-formatter-dark.json-formatter-row.json-formatter-open > .json-formatter-children:after {\n  display: inline-block;\n}\n.json-formatter-dark.json-formatter-row.json-formatter-open > a > .json-formatter-preview-text {\n  display: none;\n}\n.json-formatter-dark.json-formatter-row.json-formatter-open.json-formatter-empty:after {\n  display: block;\n}\n', "" ]);
}, function(module, exports) {
    module.exports = function() {
        var list = [];
        return list.toString = function() {
            for (var result = [], i = 0; i < this.length; i++) {
                var item = this[i];
                item[2] ? result.push("@media " + item[2] + "{" + item[1] + "}") : result.push(item[1]);
            }
            return result.join("");
        }, list.i = function(modules, mediaQuery) {
            "string" == typeof modules && (modules = [ [ null, modules, "" ] ]);
            for (var alreadyImportedModules = {}, i = 0; i < this.length; i++) {
                var id = this[i][0];
                "number" == typeof id && (alreadyImportedModules[id] = !0);
            }
            for (i = 0; i < modules.length; i++) {
                var item = modules[i];
                "number" == typeof item[0] && alreadyImportedModules[item[0]] || (mediaQuery && !item[2] ? item[2] = mediaQuery : mediaQuery && (item[2] = "(" + item[2] + ") and (" + mediaQuery + ")"), 
                list.push(item));
            }
        }, list;
    };
}, function(module, exports) {
    function addStylesToDom(styles, options) {
        for (var i = 0; i < styles.length; i++) {
            var item = styles[i], domStyle = stylesInDom[item.id];
            if (domStyle) {
                domStyle.refs++;
                for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j](item.parts[j]);
                for (;j < item.parts.length; j++) domStyle.parts.push(addStyle(item.parts[j], options));
            } else {
                for (var parts = [], j = 0; j < item.parts.length; j++) parts.push(addStyle(item.parts[j], options));
                stylesInDom[item.id] = {
                    id: item.id,
                    refs: 1,
                    parts: parts
                };
            }
        }
    }
    function listToStyles(list) {
        for (var styles = [], newStyles = {}, i = 0; i < list.length; i++) {
            var item = list[i], id = item[0], css = item[1], media = item[2], sourceMap = item[3], part = {
                css: css,
                media: media,
                sourceMap: sourceMap
            };
            newStyles[id] ? newStyles[id].parts.push(part) : styles.push(newStyles[id] = {
                id: id,
                parts: [ part ]
            });
        }
        return styles;
    }
    function insertStyleElement(options, styleElement) {
        var head = getHeadElement(), lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
        if ("top" === options.insertAt) lastStyleElementInsertedAtTop ? lastStyleElementInsertedAtTop.nextSibling ? head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling) : head.appendChild(styleElement) : head.insertBefore(styleElement, head.firstChild), 
        styleElementsInsertedAtTop.push(styleElement); else {
            if ("bottom" !== options.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
            head.appendChild(styleElement);
        }
    }
    function removeStyleElement(styleElement) {
        styleElement.parentNode.removeChild(styleElement);
        var idx = styleElementsInsertedAtTop.indexOf(styleElement);
        idx >= 0 && styleElementsInsertedAtTop.splice(idx, 1);
    }
    function createStyleElement(options) {
        var styleElement = document.createElement("style");
        return styleElement.type = "text/css", insertStyleElement(options, styleElement), 
        styleElement;
    }
    function createLinkElement(options) {
        var linkElement = document.createElement("link");
        return linkElement.rel = "stylesheet", insertStyleElement(options, linkElement), 
        linkElement;
    }
    function addStyle(obj, options) {
        var styleElement, update, remove;
        if (options.singleton) {
            var styleIndex = singletonCounter++;
            styleElement = singletonElement || (singletonElement = createStyleElement(options)), 
            update = applyToSingletonTag.bind(null, styleElement, styleIndex, !1), remove = applyToSingletonTag.bind(null, styleElement, styleIndex, !0);
        } else obj.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (styleElement = createLinkElement(options), 
        update = updateLink.bind(null, styleElement), remove = function() {
            removeStyleElement(styleElement), styleElement.href && URL.revokeObjectURL(styleElement.href);
        }) : (styleElement = createStyleElement(options), update = applyToTag.bind(null, styleElement), 
        remove = function() {
            removeStyleElement(styleElement);
        });
        return update(obj), function(newObj) {
            if (newObj) {
                if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) return;
                update(obj = newObj);
            } else remove();
        };
    }
    function applyToSingletonTag(styleElement, index, remove, obj) {
        var css = remove ? "" : obj.css;
        if (styleElement.styleSheet) styleElement.styleSheet.cssText = replaceText(index, css); else {
            var cssNode = document.createTextNode(css), childNodes = styleElement.childNodes;
            childNodes[index] && styleElement.removeChild(childNodes[index]), childNodes.length ? styleElement.insertBefore(cssNode, childNodes[index]) : styleElement.appendChild(cssNode);
        }
    }
    function applyToTag(styleElement, obj) {
        var css = obj.css, media = obj.media;
        if (media && styleElement.setAttribute("media", media), styleElement.styleSheet) styleElement.styleSheet.cssText = css; else {
            for (;styleElement.firstChild; ) styleElement.removeChild(styleElement.firstChild);
            styleElement.appendChild(document.createTextNode(css));
        }
    }
    function updateLink(linkElement, obj) {
        var css = obj.css, sourceMap = obj.sourceMap;
        sourceMap && (css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */");
        var blob = new Blob([ css ], {
            type: "text/css"
        }), oldSrc = linkElement.href;
        linkElement.href = URL.createObjectURL(blob), oldSrc && URL.revokeObjectURL(oldSrc);
    }
    var stylesInDom = {}, memoize = function(fn) {
        var memo;
        return function() {
            return void 0 === memo && (memo = fn.apply(this, arguments)), memo;
        };
    }, isOldIE = memoize(function() {
        return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
    }), getHeadElement = memoize(function() {
        return document.head || document.getElementsByTagName("head")[0];
    }), singletonElement = null, singletonCounter = 0, styleElementsInsertedAtTop = [];
    module.exports = function(list, options) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
        options = options || {}, void 0 === options.singleton && (options.singleton = isOldIE()), 
        void 0 === options.insertAt && (options.insertAt = "bottom");
        var styles = listToStyles(list);
        return addStylesToDom(styles, options), function(newList) {
            for (var mayRemove = [], i = 0; i < styles.length; i++) {
                var item = styles[i], domStyle = stylesInDom[item.id];
                domStyle.refs--, mayRemove.push(domStyle);
            }
            if (newList) {
                addStylesToDom(listToStyles(newList), options);
            }
            for (var i = 0; i < mayRemove.length; i++) {
                var domStyle = mayRemove[i];
                if (0 === domStyle.refs) {
                    for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();
                    delete stylesInDom[domStyle.id];
                }
            }
        };
    };
    var replaceText = function() {
        var textStore = [];
        return function(index, replacement) {
            return textStore[index] = replacement, textStore.filter(Boolean).join("\n");
        };
    }();
}, function(module, exports, __webpack_require__) {
    var content = __webpack_require__(1);
    "string" == typeof content && (content = [ [ module.i, content, "" ] ]);
    __webpack_require__(3)(content, {});
    content.locals && (module.exports = content.locals);
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function escapeString(str) {
        return str.replace('"', '"');
    }
    function isObject(value) {
        var type = typeof value;
        return !!value && "object" == type;
    }
    function getObjectName(object) {
        if (void 0 === object) return "";
        if (null === object) return "Object";
        if ("object" == typeof object && !object.constructor) return "Object";
        var funcNameRegex = /function ([^(]*)/, results = funcNameRegex.exec(object.constructor.toString());
        return results && results.length > 1 ? results[1] : "";
    }
    function getValuePreview(type, object, value) {
        return "null" === type || "undefined" === type ? type : ("string" !== type && "stringifiable" !== type || (value = '"' + escapeString(value) + '"'), 
        "function" === type ? object.toString().replace(/[\r\n]/g, "").replace(/\{.*\}/, "") + "{…}" : value);
    }
    function getPreview(type, object) {
        var value = "";
        return isObject(object) ? (value = getObjectName(object), Array.isArray(object) && (value += "[" + object.length + "]")) : value = getValuePreview(type, object, object), 
        value;
    }
    function cssClass(className) {
        return "json-formatter-" + className;
    }
    function createElement(type, className, content) {
        var el = document.createElement(type);
        return className && el.classList.add(cssClass(className)), void 0 !== content && (content instanceof Node ? el.appendChild(content) : el.appendChild(document.createTextNode(String(content)))), 
        el;
    }
    __webpack_exports__.a = isObject, __webpack_exports__.b = getObjectName, __webpack_exports__.f = getValuePreview, 
    __webpack_exports__.d = getPreview, __webpack_exports__.c = cssClass, __webpack_exports__.e = createElement;
}, function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(0);
} ]);
//# sourceMappingURL=json-formatter.js.map

/***/ })
/******/ ]);