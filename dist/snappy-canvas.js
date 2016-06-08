(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SnappyCanvas = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var helpers = {
    merge: function merge(dest, src) {
        for (var prop in src) {
            dest[prop] = src[prop];
        }
        return dest;
    }
};

module.exports = helpers;

},{}],2:[function(require,module,exports){
"use strict";

module.exports = require("./snappy-canvas.js");

},{"./snappy-canvas.js":3}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SnappyContext2D = require("./snappy-context2d.js");

var SnappyCanvas = function SnappyCanvas(options) {
    _classCallCheck(this, SnappyCanvas);

    var canvas = options.canvas || document.createElement("canvas");
    SnappyCanvas.transformCanvas(canvas, options);
    return canvas;
};

SnappyCanvas.transformCanvas = function (canvas) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var context2d = canvas.getContext("2d");
    var snappyContext2d = new SnappyContext2D(context2d, options);
    var contentWidth = null;
    var contentHeight = null;

    canvas.getContext = function (contextType) {
        if (contextType == "snappy") {
            return snappyContext2d;
        } else {
            return HTMLCanvasElement.prototype.getContext.call(this, contextType);
        }
    };

    Object.defineProperty(canvas, "contentWidth", {
        enumerable: true,
        configurable: false,
        get: function get() {
            if (contentWidth === null) {
                return this.width / snappyContext2d.globalScale | 0;
            } else {
                return contentWidth | 0;
            }
        },
        set: function set(width) {
            contentWidth = width;
            if (options.autoResizeCanvas) {
                this.width = width * snappyContext2d.globalScale | 0;
            }
        }
    });

    Object.defineProperty(canvas, "contentHeight", {
        enumerable: true,
        configurable: false,
        get: function get() {
            if (contentHeight === null) {
                return this.height / snappyContext2d.globalScale | 0;
            } else {
                return contentHeight | 0;
            }
        },
        set: function set(height) {
            contentHeight = height | 0;
            if (options.autoResizeCanvas) {
                this.height = height * snappyContext2d.globalScale | 0;
            }
        }
    });

    if (options.width) {
        canvas.width = options.width;
    }
    if (options.height) {
        canvas.height = options.height;
    }

    if (options.contentWidth) {
        canvas.contentWidth = options.contentWidth;
    }

    if (options.contentHeight) {
        canvas.contentHeight = options.contentHeight;
    }
};

module.exports = SnappyCanvas;

},{"./snappy-context2d.js":4}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = require("./helpers.js");

var SnappyContext2D = function () {
    function SnappyContext2D(context2d) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, SnappyContext2D);

        Object.defineProperty(this, "_context2d", {
            enumerable: false,
            configurable: false,
            value: context2d
        });
        Object.defineProperty(this, "_drawing", {
            enumerable: false,
            configurable: false,
            value: []
        });
        Object.defineProperty(this, "_options", {
            enumerable: false,
            configurable: false,
            value: helpers.merge({
                globalTranslationX: 0,
                globalTranslationY: 0,
                globalScale: 1,
                scaleLineWidth: true,
                autoResizeCanvas: false
            }, options)
        });

        function _context2dMethod() {
            for (var _len = arguments.length, call = Array(_len), _key = 0; _key < _len; _key++) {
                call[_key] = arguments[_key];
            }

            this._drawing.push(call); // jshint ignore:line
        }

        for (var prop in context2d) {
            if (this[prop] !== undefined) {
                continue;
            }
            if (typeof context2d[prop] == "function") {
                this[prop] = _context2dMethod.bind(this, prop);
            } else {
                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: false,
                    get: function get() {},
                    set: _context2dMethod.bind(this, prop)
                });
            }
        }
    }

    _createClass(SnappyContext2D, [{
        key: "setSnappyOptions",
        value: function setSnappyOptions(options) {
            helpers.merge(this._options, options);
            this.render();
        }
    }, {
        key: "clear",
        value: function clear() {
            this._drawing.length = 0;
            this._context2d.clearRect(0, 0, this._context2d.canvas.width, this._context2d.canvas.height);
        }
    }, {
        key: "render",
        value: function render() {
            var ctx = this._context2d;
            var options = this._options;

            var pathStack = [];
            var isStroke = 0;

            var canvasStatus = {
                tx: options.globalTranslationX,
                ty: options.globalTranslationY,
                scale: options.globalScale,
                lw: options.scaleLineWidth ? Math.max(1, options.globalScale | 0) : 1
            };

            // Helpers

            function _contextOperationCall(ctx, operationName) {
                for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                    args[_key2 - 2] = arguments[_key2];
                }

                if (typeof ctx[operationName] == "function") {
                    return ctx[operationName].apply(ctx, args);
                } else {
                    ctx[operationName] = args[0];
                }
            }

            // Filters

            var _posx = function _posx(x, cs, opt) {
                return ((x + cs.tx) * cs.scale | 0) + cs.lw * isStroke % 2 / 2;
            };
            var _posy = function _posy(y, cs, opt) {
                return ((y + cs.ty) * cs.scale | 0) + cs.lw * isStroke % 2 / 2;
            };
            var _size = function _size(s, cs, opt) {
                return s * cs.scale | 0;
            };
            var _nop = function _nop(v, cs, opt) {
                return v;
            };

            // Operations

            function _operationGeneric(operation, operationName) {
                if (operation.isStroke !== undefined && operation.isStroke !== null) {
                    isStroke = operation.isStroke;
                }
                var args = [];

                for (var _len3 = arguments.length, values = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                    values[_key3 - 2] = arguments[_key3];
                }

                for (var i = 0; i < values.length; i++) {
                    args[i] = operation.args[i](values[i], canvasStatus, options);
                }
                _contextOperationCall.apply(undefined, [ctx, operationName].concat(args));
            }

            function _operationPathStack(operation, operationName) {
                for (var _len4 = arguments.length, values = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                    values[_key4 - 2] = arguments[_key4];
                }

                pathStack.push([operationName].concat(values));
            }

            function _operationUnimplemented(operation, operationName) {
                console.warn("SnappyContext2D: the \"" + operationName + "\" operation is not implemented by SnappyCanvas. The output may be ugly!");
                ctx.save();
                ctx.translate(canvasStatus.tx | 0, canvasStatus.ty | 0);
                ctx.scale(canvasStatus.scale, canvasStatus.scale);

                for (var _len5 = arguments.length, values = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
                    values[_key5 - 2] = arguments[_key5];
                }

                _contextOperationCall.apply(undefined, [ctx, operationName].concat(values));
                ctx.restore();
            }

            var operations = {

                // Drawing rectangles
                clearRect: { isStroke: 0, args: [_posx, _posy, _size, _size] },
                fillRect: { isStroke: 0, args: [_posx, _posy, _size, _size] },
                strokeRect: { isStroke: 1, args: [_posx, _posy, _size, _size] },

                // Drawing text
                // TODO fillText()
                // TODO strokeText()
                // TODO measureText()

                // Line style
                lineWidth: { fn: function fn(operation, operationName) {
                        var lineWidth;
                        if (options.scaleLineWidth) {
                            lineWidth = (arguments.length <= 2 ? undefined : arguments[2]) * canvasStatus.scale | 0;
                        } else {
                            lineWidth = (arguments.length <= 2 ? undefined : arguments[2]) | 0;
                        }
                        canvasStatus.lw = lineWidth;
                        ctx.lineWidth = lineWidth;
                    } },
                lineCap: { args: [_nop] },
                lineJoin: { args: [_nop] },
                miterLimit: { args: [_nop] },
                // TODO getLineDash()
                // TODO setLineDash()
                // TODO lineDashOffset

                // Text styles
                // TODO font
                textAlign: { args: [_nop] },
                textBaseline: { args: [_nop] },
                direction: { args: [_nop] },

                // Fill and stroke styles
                fillStyle: { args: [_nop] },
                strokeStyle: { args: [_nop] },

                // Gradients and patterns
                // TODO createLinearGradient()
                // TODO createRadialGradient()
                // TODO createPattern()

                // Shadows
                // TODO shadowBlur
                shadowColor: { args: [_nop] },
                // TODO shadowOffsetX
                // TODO shadowOffsetY

                // Path
                beginPath: { fn: function fn(_) {
                        return pathStack = [];
                    } },
                closePath: { isPath: true },
                moveTo: { isPath: true, args: [_posx, _posy] },
                lineTo: { isPath: true, args: [_posx, _posy] },
                bezierCurveTo: { isPath: true, args: [_posx, _posy, _posx, _posy, _posx, _posy] },
                quadraticCurveTo: { isPath: true, args: [_posx, _posy, _posx, _posy] },
                arc: { isPath: true, args: [_posx, _posy, _size, _nop, _nop, _nop] },
                arcTo: { isPath: true, args: [_posx, _posy, _posx, _posy, _size] },
                // TODO ellipse()   /!\ Experimental
                rect: { args: [_posx, _posy, _size, _size] },

                // Drawing paths
                fill: { fn: function fn(_) {
                        isStroke = false;_drawStack(pathStack, false);ctx.fill();
                    } },
                stroke: { fn: function fn(_) {
                        isStroke = true;_drawStack(pathStack, false);ctx.stroke();
                    } },
                // TODO drawFocusIfNeeded()
                // TODO scrollPathIntoView()    /!\ Experimental
                // TODO clip()
                // TODO isPointInPath()
                // TODO isPointInStroke()

                // Transformation
                // TODO currentTransform   /!\ Experimental
                // TODO rotate()
                // TODO scale()
                // TODO translate()
                // TODO transform()
                // TODO resetTransform()    /!\ Experimental

                // Compositing
                globalAlpha: { args: [_nop] },
                globalCompositeOperation: { args: [_nop] },

                // Drawing images
                // TODO drawImage

                // Pixel manipulation
                // TODO createImageData()
                // TODO getImageData()
                // TODO putImageData()

                // Image smoothing
                imageSmoothingEnabled: { args: [_nop] },

                // The canvas state
                save: { fn: function fn(_) {
                        return console.error("SnappyContext2D: the 'save' operation is not implemented yet!");
                    } }, // FIXME
                restore: { fn: function fn(_) {
                        return console.error("SnappyContext2D: the 'restore' operation is not implemented yet!");
                    } } };

            // Let it draw! Let it draw!

            //FIXME

            // Hit regions
            // TODO addHitRegion()        /!\ Experimental
            // TODO removeHitRegion()     /!\ Experimental
            // TODO clearHitRegion()      /!\ Experimental

            function _drawStack(stack) {
                var skipPathOperations = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

                ctx.beginPath();

                for (var i = 0; i < stack.length; i++) {
                    var operationName = stack[i][0];
                    var operation = operations[operationName];
                    var operationFn = skipPathOperations && operation && operation.isPath ? _operationPathStack : _operationGeneric;

                    if (operation && operation.fn) {
                        operationFn = operation.fn;
                    } else if (!operation) {
                        operationFn = _operationUnimplemented;
                    }

                    operationFn.apply(undefined, [operation].concat(_toConsumableArray(stack[i])));
                }
            }

            ctx.save();
            ctx.lineWidth = canvasStatus.lw;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            _drawStack(this._drawing);
            ctx.restore();
        }
    }, {
        key: "canvas",
        get: function get() {
            return this._context2d.canvas;
        }
    }, {
        key: "globalTranslationX",
        get: function get() {
            return this._options.globalTranslationX;
        },
        set: function set(tx) {
            this._options.globalTranslationX = tx;
            this.render();
        }
    }, {
        key: "globalTranslationY",
        get: function get() {
            return this._options.globalTranslationY;
        },
        set: function set(ty) {
            this._options.globalTranslationY = ty;
            this.render();
        }
    }, {
        key: "globalScale",
        get: function get() {
            return this._options.globalScale;
        },
        set: function set(scale) {
            var contentWidth = this._context2d.canvas.contentWidth;
            var contentHeight = this._context2d.canvas.contentHeight;
            this._options.globalScale = Math.max(0.0001, scale);
            if (contentWidth !== undefined && contentHeight !== undefined && this._options.autoResizeCanvas) {
                this._context2d.canvas.contentWidth = contentWidth;
                this._context2d.canvas.contentHeight = contentHeight;
            }
            this.render();
        }
    }, {
        key: "scaleLineWidth",
        get: function get() {
            return this._options.scaleLineWidth;
        },
        set: function set(scaleLineWidth) {
            this._options.scaleLineWidth = scaleLineWidth;
            this.render();
        }
    }]);

    return SnappyContext2D;
}();

module.exports = SnappyContext2D;

},{"./helpers.js":1}]},{},[2])(2)
});