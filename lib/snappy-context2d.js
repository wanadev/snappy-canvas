"use strict";

var helpers = require("./helpers.js");
var Matrix3D = require("./matrix3d-class").Matrix3D;

class SnappyContext2D {

    constructor(context2d, options={}) {
        Object.defineProperty(this, "_context2d",  {
            enumerable: false,
            configurable: false,
            value: context2d
        });
        Object.defineProperty(this, "_drawing",  {
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
                scaleDashesWidth: true,
                autoResizeCanvas: false,
            }, options)
        });
        Object.defineProperty(this, "_contextStatus", {
            enumerable: false,
            configurable: false,
            value: {}
        });
        Object.defineProperty(this, "_defaultContextStatus", {
            enumerable: false,
            configurable: false,
            value: {}
        });

        function _context2dMethod(...call) {
            this._drawing.push(call);  // jshint ignore:line
        }

        function _context2dPropertyGet(property) {
            return this._contextStatus[property];  // jshint ignore:line
        }

        function _context2dPropertySet(property, value) {
            this._contextStatus[property] = value;  // jshint ignore:line
            this._drawing.push([property, value]);  // jshint ignore:line
        }

        for (let prop in context2d) {
            if (this[prop] !== undefined) {
                continue;
            }
            if (typeof(context2d[prop]) == "function") {
                this[prop] = _context2dMethod.bind(this, prop);
            } else {
                this._contextStatus[prop] = this._context2d[prop];
                this._defaultContextStatus[prop] = this._context2d[prop];
                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: false,
                    get: _context2dPropertyGet.bind(this, prop),
                    set: _context2dPropertySet.bind(this, prop)
                });
            }
        }
    }

    get canvas() {
        return this._context2d.canvas;
    }

    get globalTranslationX() {
        return this._options.globalTranslationX;
    }

    set globalTranslationX(tx) {
        this._options.globalTranslationX = tx;
        this.render();
    }

    get globalTranslationY() {
        return this._options.globalTranslationY;
    }

    set globalTranslationY(ty) {
        this._options.globalTranslationY = ty;
        this.render();
    }

    get globalScale() {
        return this._options.globalScale;
    }

    set globalScale(scale) {
        var contentWidth = this._context2d.canvas.contentWidth;
        var contentHeight = this._context2d.canvas.contentHeight;
        this._options.globalScale = Math.max(0.0001, scale);
        if (contentWidth !== undefined && contentHeight !== undefined && this._options.autoResizeCanvas) {
            this._context2d.canvas.contentWidth = contentWidth;
            this._context2d.canvas.contentHeight = contentHeight;
        }
        this.render();
    }

    get scaleLineWidth() {
        return this._options.scaleLineWidth;
    }

    set scaleLineWidth(scaleLineWidth) {
        this._options.scaleLineWidth = scaleLineWidth;
        this.render();
    }

    get scaleDashesWidth() {
        return this._options.scaleDashesWidth;
    }

    set scaleDashesWidth(scaleDashesWidth) {
        this._options.scaleDashesWidth = scaleDashesWidth;
        this.render();
    }

    measureText(text) {
        var ctx = this._context2d;
        ctx.save();
        ctx.font = this._contextStatus.font;
        var textMeasure = ctx.measureText(text);
        ctx.restore();
        return textMeasure;

    }

    setSnappyOptions(options) {
        helpers.merge(this._options, options);
        this.render();
    }

    clear() {
        this._drawing.length = 0;
        helpers.merge(this._contextStatus, this._defaultContextStatus);
        this._context2d.clearRect(0, 0, this._context2d.canvas.width, this._context2d.canvas.height);
    }

    render() {
        var ctx = this._context2d;
        var options = this._options;

        var pathStack = [];
        var contextStatusStack = [];
        var isStroke = 0;

        var contextStatus = {
            tx: options.globalTranslationX,
            ty: options.globalTranslationY,
            scale: options.globalScale,
            currentMatrix : new Matrix3D({
                a : options.globalScale,  c : 0,                   e : options.globalTranslationX,
                b : 0,                    d : options.globalScale, f : options.globalTranslationY
            }),
            lw: (options.scaleLineWidth) ? Math.max(1, options.globalScale|0) : 1
        };

        // Helpers

        function _contextOperationCall(ctx, operationName, ...args) {
            if (typeof(ctx[operationName]) == "function") {
                return ctx[operationName].apply(ctx, args);
            } else {
                ctx[operationName] = args[0];
            }
        }

        // Filters

        var _posx = (x, cs) => x + ((cs.lw*isStroke)%2/2);
        var _posy = (y, cs) => y + ((cs.lw*isStroke)%2/2);
        var _nop = (v, cs) => v;

        // Operations

        function _operationGeneric(operation, operationName, ...values) {
            if (operation.isStroke !== undefined && operation.isStroke !== null) {
                isStroke = operation.isStroke;
            }
            if (!operation.isPath) {
                var args = [];
                for (let i = 0 ; i < values.length ; i++) {
                    args[i] = operation.args[i](values[i], contextStatus);
                }
                _contextOperationCall(ctx, operationName, ...args);
            } else {
                _contextOperationCall(ctx, operationName, ...values);
            }
        }

        function _operationPathStack(operation, operationName, ...values) {
            if (operation.isPath) {
                if (operation.isStroke !== undefined && operation.isStroke !== null) {
                    isStroke = operation.isStroke;
                }
                var args = [];
                for (let i = 0 ; i < values.length ; i++) {
                    args[i] = operation.args[i](values[i], contextStatus);
                }
                pathStack.push([operationName, ...args]);
            } else {
                pathStack.push([operationName, ...values]);
            }
        }

        function _operationUnimplemented(operation, operationName, ...values) {
            throw new Error(`SnappyContext2D: operation not supported: ${operationName}.`);
        }

        var _applyMatrix = (matrix) => {
            ctx.setTransform(matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f);
        };
        

        var operations = {

            // Drawing rectangles
            clearRect: {isStroke: 0, args: [_posx, _posy, _nop, _nop]},
            fillRect : {fn: function(operation, operationName, ...values) {
                ctx.save();
                if (!options.scaleLineWidth) {
                    ctx.lineWidth = contextStatus.lw / contextStatus.scale;
                }
                ctx[operationName](...values);
                ctx.restore();
            }},
            strokeRect: {fn: function(operation, operationName, ...values) {
                ctx.save();
                if (!options.scaleLineWidth) {
                    ctx.lineWidth = contextStatus.lw / contextStatus.scale;
                }
                ctx[operationName](...values);
                ctx.restore();
            }},

            // Drawing text
            fillText: {fn: function(operation, operationName, ...values) {
                ctx.save();
                ctx[operationName](...values);
                ctx.restore();
            }},
            strokeText: {fn: function(operation, operationName, ...values) {
                ctx.save();
                if (!options.scaleLineWidth) {
                    ctx.lineWidth = contextStatus.lw / contextStatus.scale;
                }
                ctx[operationName](...values);
                ctx.restore();
            }},
            // measureText()  -> implemented in the class

            // Line style
            lineWidth: {fn: function(operation, operationName, ...values) {
                var lineWidth;
                if (options.scaleLineWidth) {
                    lineWidth = (values[0] * contextStatus.scale) | 0;
                } else {
                    lineWidth = values[0]|0;
                }
                lineWidth = Math.max(1, lineWidth);
                contextStatus.lw = lineWidth;
                ctx.lineWidth = lineWidth;
            }},
            lineCap: {args: [_nop]},
            lineJoin: {args: [_nop]},
            miterLimit: {args: [_nop]},
            getLineDash: {args: []},
            setLineDash: {fn: function(operation, operationName, ...values) {
                let tmp = values[0] ? values[0].slice(0) : [];
                if (options.scaleDashesWidth) {
                    for (let i = 0; i < tmp.length; i++) {
                        tmp[i] *= contextStatus.scale;
                    }
                }
                ctx.setLineDash(tmp);
            }},
            lineDashOffset: {fn: function(operation, operationName, ...values) {
                ctx.lineDashOffset = values[0] * (contextStatus.scaleDashesWidth ? contextStatus.scale : 1) | 0;
            }},

            // Text styles
            font: {args: [_nop]},
            textAlign: {args: [_nop]},
            textBaseline: {args: [_nop]},
            direction: {args: [_nop]},

            // Fill and stroke styles
            fillStyle: {args: [_nop]},
            strokeStyle: {args: [_nop]},

            // Gradients and patterns
            // TODO createLinearGradient()
            // TODO createRadialGradient()
            // TODO createPattern()

            // Shadows
            // TODO shadowBlur
            shadowColor: {args: [_nop]},
            // TODO shadowOffsetX
            // TODO shadowOffsetY

            // Path
            beginPath: {fn: _ => pathStack = []},
            closePath: {isPath: true},
            moveTo: {isPath: true, args: [_posx, _posy]},
            lineTo: {isPath: true, args: [_posx, _posy]},
            bezierCurveTo: {isPath: true, args: [_posx, _posy, _posx, _posy, _posx, _posy]},
            quadraticCurveTo: {isPath: true, args: [_posx, _posy, _posx, _posy]},
            arc: {isPath: true, args: [_posx, _posy, _nop, _nop, _nop, _nop]},
            arcTo: {isPath: true, args: [_posx, _posy, _posx, _posy, _nop]},
            ellipse: {isPath: true, args: [_posx, _posy, _nop, _nop, _nop, _nop, _nop, _nop]},
            rect: {args: [_posx, _posy, _nop, _nop]},

            // Drawing paths
            fill: {fn: _ => {isStroke = false; _drawStack(pathStack, false); ctx.fill(); }},
            stroke: {fn: _ => {isStroke = true; _drawStack(pathStack, false); ctx.stroke(); }},
            // TODO drawFocusIfNeeded()
            // TODO scrollPathIntoView()    /!\ Experimental
            // TODO clip()
            // TODO isPointInPath()
            // TODO isPointInStroke()

            // Transformation
            // currentTransform    -> not supported
            rotate: {fn: function(operation, operationName, angle) {
                contextStatus.currentMatrix.rotate(angle);
                _applyMatrix(contextStatus.currentMatrix);
            }},
            scale: {fn: function(operation, operationName, sx, sy) {
                contextStatus.currentMatrix.scale(sx,sy);
                _applyMatrix(contextStatus.currentMatrix);
            }},
            // scale               -> not supported
            translate: {fn: function(operation, operationName, tx, ty) {
                contextStatus.currentMatrix.translate(tx, ty, contextStatus.scale);
                _applyMatrix(contextStatus.currentMatrix);
            }},
            // transform()         -> not supported
            // resetTransform()    -> not supported

            // Compositing
            globalAlpha: {args: [_nop]},
            globalCompositeOperation: {args: [_nop]},

            // Drawing images
            drawImage: {fn: function(operation, operationName, ...values) {
                switch (values.length) {
                    case 3:
                        _contextOperationCall(ctx, operationName,
                            values[0],                              // Image
                            _posx(values[1], contextStatus),        // dx
                            _posy(values[2], contextStatus),        // dy
                            _nop(values[0].width, contextStatus),  // dWidth
                            _nop(values[0].height, contextStatus)  // dHeight
                        );
                        break;
                    case 5:
                        _contextOperationCall(ctx, operationName,
                            values[0],                              // Image
                            _posx(values[1], contextStatus),        // dx
                            _posy(values[2], contextStatus),        // dy
                            _nop(values[3], contextStatus),        // dWidth
                            _nop(values[4], contextStatus)         // dHeight
                        );
                        break;
                    case 9:
                        _contextOperationCall(ctx, operationName,
                            values[0],                              // Image
                            values[1],                              // sx
                            values[2],                              // sy
                            values[3],                              // sWidth
                            values[4],                              // sHeight
                            _posx(values[5], contextStatus),        // dx
                            _posy(values[6], contextStatus),        // dy
                            _nop(values[7], contextStatus),        // dWidth
                            _nop(values[8], contextStatus)         // dHeight
                        );
                        break;
                    default:
                        throw new Error("SnappyContext2D: Wrong arguments for drawImage");
                }
            }},

            // Pixel manipulation
            // createImageData  -> not supported
            // getImageData     -> not supported
            // putImageData     -> not supported

            // Image smoothing
            imageSmoothingEnabled: {args: [_nop]},

            // The canvas state
            save: {fn: function(operation, operationName, ...values) {
                contextStatusStack.push(helpers.clone(contextStatus));
                ctx.save();
            }},
            restore: {fn: function(operation, operationName, ...values) {
                contextStatus = contextStatusStack.pop();
                contextStatus.currentMatrix = new Matrix3D(contextStatus.currentMatrix);
                ctx.restore();
            }},

            // Hit regions
            // TODO addHitRegion()        /!\ Experimental
            // TODO removeHitRegion()     /!\ Experimental
            // TODO clearHitRegion()      /!\ Experimental

        };

        // Let it draw! Let it draw!

        function _drawStack(stack, skipPathOperations=true) {
            ctx.beginPath();

            for (let i = 0 ; i < stack.length ; i++) {
                let operationName = stack[i][0];
                let operation = operations[operationName];
                let operationFn = (skipPathOperations && operation && operation.isPath) ? _operationPathStack : _operationGeneric;

                if (operation && operation.fn) {
                    operationFn = operation.fn;
                } else if(!operation) {
                    operationFn = _operationUnimplemented;
                }

                operationFn(operation, ...stack[i]);
            }
        }

        ctx.save();
        ctx.lineWidth = contextStatus.lw;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        _applyMatrix(contextStatus.currentMatrix);
        _drawStack(this._drawing);
        ctx.restore();
    }

}

module.exports = SnappyContext2D;
