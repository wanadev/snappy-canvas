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
            var canvasStatusStack = [];
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

            var _posx = function _posx(x, cs) {
                return ((x + cs.tx) * cs.scale | 0) + cs.lw * isStroke % 2 / 2;
            };
            var _posy = function _posy(y, cs) {
                return ((y + cs.ty) * cs.scale | 0) + cs.lw * isStroke % 2 / 2;
            };
            var _size = function _size(s, cs) {
                return s * cs.scale | 0;
            };
            var _nop = function _nop(v, cs) {
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
                    args[i] = operation.args[i](values[i], canvasStatus);
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
                scale: { fn: function fn(_) {
                        throw new Error("NotImplementedError: scale is not supported by snappy canvas");
                    } },
                translate: { fn: function fn(operation, operationName, tx, ty) {
                        canvasStatus.tx += tx;
                        canvasStatus.ty += ty;
                    } },
                // TODO transform()
                // TODO resetTransform()    /!\ Experimental

                // Compositing
                globalAlpha: { args: [_nop] },
                globalCompositeOperation: { args: [_nop] },

                // Drawing images
                drawImage: { fn: function fn(operation, operationName) {
                        for (var _len6 = arguments.length, values = Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
                            values[_key6 - 2] = arguments[_key6];
                        }

                        switch (values.length) {
                            case 3:
                                _contextOperationCall(ctx, operationName, values[0], // Image
                                _posx(values[1], canvasStatus), // dx
                                _posy(values[2], canvasStatus), // dy
                                _size(values[0].width, canvasStatus), // dWidth
                                _size(values[0].height, canvasStatus) // dHeight
                                );
                                break;
                            case 5:
                                _contextOperationCall(ctx, operationName, values[0], // Image
                                _posx(values[1], canvasStatus), // dx
                                _posy(values[2], canvasStatus), // dy
                                _size(values[3], canvasStatus), // dWidth
                                _size(values[4], canvasStatus) // dHeight
                                );
                                break;
                            case 9:
                                _contextOperationCall(ctx, operationName, values[0], // Image
                                values[1], // sx
                                values[2], // sy
                                values[3], // sWidth
                                values[4], // sHeight
                                _posx(values[5], canvasStatus), // dx
                                _posy(values[6], canvasStatus), // dy
                                _size(values[7], canvasStatus), // dWidth
                                _size(values[8], canvasStatus) // dHeight
                                );
                                break;
                            default:
                                throw new Error("drawImage: wrong arguments");
                        }
                    } },

                // Pixel manipulation
                // TODO createImageData()
                // TODO getImageData()
                // TODO putImageData()

                // Image smoothing
                imageSmoothingEnabled: { args: [_nop] },

                // The canvas state
                save: { fn: function fn(operation, operationName) {
                        canvasStatusStack.push(helpers.clone(canvasStatus));
                        ctx.save();
                    } },
                restore: { fn: function fn(operation, operationName) {
                        canvasStatus = canvasStatusStack.pop();
                        ctx.restore();
                    } }

            };

            // Let it draw! Let it draw!

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