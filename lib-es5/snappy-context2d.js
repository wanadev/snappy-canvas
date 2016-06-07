"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = require("./helpers.js");

var SnappyContext2D = function () {
    function SnappyContext2D(context2d) {
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
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: false,
            value: this._context2d.canvas
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
        key: "clear",
        value: function clear() {
            this._drawing.length = 0;
            this.render();
        }
    }, {
        key: "render",
        value: function render() {
            var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var ctx = this._context2d;

            var options = {
                translationX: 0,
                translationY: 0,
                scale: 1,
                scaleLineWidth: 1
            };

            if (ctx.canvas._snappyContext2d === this) {
                options.translationX = ctx.canvas.translationX;
                options.translationY = ctx.canvas.translationY;
                options.scale = ctx.canvas.scale;
                options.scaleLineWidth = ctx.canvas.scaleLineWidth;
            }

            helpers.merge(options, _options);

            var canvasStatus = {
                translationX: options.translationX,
                translationY: options.translationY,
                scale: options.scale,
                lineWidth: options.scaleLineWidth ? Math.max(1, options.scale | 0) : 1
            };

            ctx.lineWidth = canvasStatus.lineWidth;

            var canvasStatusStack = [];
            var pathStack = [];
            var isStroke = 0;

            // Helpers

            function _drawStack(stack) {
                var skipPath = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

                for (var i = 0; i < stack.length; i++) {
                    var operationName = stack[i][0];
                    var operationDef = operationDefs[operationName];
                    var operationFn = skipPath && operationDef && operationDef.isPath ? _operationPathStack : _operationGeneric;

                    if (operationDef) {
                        if (operationDef.fn) {
                            operationFn = operationDefs[operationName].fn;
                        }
                    } else {
                        operationFn = _operationUnimplemented;
                    }

                    operationFn.apply(undefined, [operationDef].concat(_toConsumableArray(stack[i])));
                }
            }

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
                return ((x + cs.translationX) * cs.scale | 0) + cs.lineWidth * isStroke % 2 / 2;
            };
            var _posy = function _posy(y, cs, opt) {
                return ((y + cs.translationY) * cs.scale | 0) + cs.lineWidth * isStroke % 2 / 2;
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
                ctx.translate(canvasStatus.translationX | 0, canvasStatus.translationY | 0);
                ctx.scale(canvasStatus.scale, canvasStatus.scale);

                for (var _len5 = arguments.length, values = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
                    values[_key5 - 2] = arguments[_key5];
                }

                _contextOperationCall.apply(undefined, [ctx, operationName].concat(values));
                ctx.restore();
            }

            function _operationBeginPath(operation, operationName) {
                pathStack = [];
            }

            function _operationStroke(operation, operationName) {
                isStroke = true;
                ctx.beginPath();
                _drawStack(pathStack, false);
                ctx.stroke();
            }

            function _operationFill(operation, operationName) {
                isStroke = false;
                ctx.beginPath();
                _drawStack(pathStack, false);
                ctx.fill();
            }

            function _operationLineWidth(operation, operationName) {
                var lineWidth;
                if (options.scaleLineWidth) {
                    lineWidth = (arguments.length <= 2 ? undefined : arguments[2]) * canvasStatus.scale | 0;
                } else {
                    lineWidth = (arguments.length <= 2 ? undefined : arguments[2]) | 0;
                }
                canvasStatus.lineWidth = lineWidth;
                ctx.lineWidth = lineWidth;
            }

            // Operations definition

            var operationDefs = {

                // Drawing rectangles
                // TODO clearRect()
                fillRect: { isStroke: 0, args: [_posx, _posy, _size, _size] },
                strokeRect: { isStroke: 1, args: [_posx, _posy, _size, _size] },

                // Drawing text
                // TODO fillText()
                // TODO strokeText()
                // TODO measureText()

                // Line style
                lineWidth: { fn: _operationLineWidth },
                // TODO lineCap
                // TODO lineJoin
                // TODO miterLimit
                // TODO getLineDash()
                // TODO setLineDash()
                // TODO lineDashOffset

                // Text styles
                // TODO font
                // TODO textAlign
                // TODO textBaseline
                // TODO direction

                // Fill and stroke styles
                fillStyle: { args: [_nop] },
                strokeStyle: { args: [_nop] },

                // Gradients and patterns
                // TODO createLinearGradient()
                // TODO createRadialGradient()
                // TODO createPattern()

                // Shadows
                // TODO shadowBlur
                // TODO shadowColor
                // TODO shadowOffsetX
                // TODO shadowOffsetY

                // Path
                beginPath: { fn: _operationBeginPath },
                closePath: { isPath: true },
                moveTo: { isPath: true, args: [_posx, _posy] },
                lineTo: { isPath: true, args: [_posx, _posy] },
                // TODO bezierCurveTo()
                // TODO quadraticCurveTo()
                // TODO arc()
                // TODO arcTo()
                // TODO ellipse()   /!\ Experimental
                rect: { args: [_posx, _posy, _size, _size] },

                // Drawing paths
                fill: { fn: _operationFill },
                stroke: { fn: _operationStroke },
                // TODO drawFocusIfNeeded()
                // TODO scrollPathIntoView()    /!\ Experimental
                // TODO clip()
                // TODO isPointInPath()
                // TODO isPointInStroke()

                // Transformation
                // TODO currentTransform per every
                // TODO rotate()
                // TODO scale()
                // TODO translate()
                // TODO transform()
                // TODO resetTransform()    /!\ Experimental

                // Compositing
                // TODO globalAlpha
                // TODO globalCompositeOperation

                // Drawing images
                // TODO drawImage

                // Pixel manipulation
                // TODO createImageData()
                // TODO getImageData()
                // TODO putImageData()

                // Image smoothing
                // TODO imageSmoothingEnabled       /!\ Experimental

                // The canvas state
                save: { fn: function fn(_) {
                        return console.error("SnappyContext2D: the 'save' operation is not implemented yet!");
                    } },
                restore: { fn: function fn(_) {
                        return console.error("SnappyContext2D: the 'restore' operation is not implemented yet!");
                    } }

            };

            // Let's draw

            // Hit regions
            // TODO addHitRegion()        /!\ Experimental
            // TODO removeHitRegion()     /!\ Experimental
            // TODO clearHitRegion()      /!\ Experimental

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            _drawStack(this._drawing);
            ctx.restore();
        }
    }]);

    return SnappyContext2D;
}();

module.exports = SnappyContext2D;