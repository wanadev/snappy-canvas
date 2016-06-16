"use strict";

var helpers = require("./helpers.js");

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
                autoResizeCanvas: false,
            }, options)
        });

        function _context2dMethod(...call) {
            this._drawing.push(call);  // jshint ignore:line
        }

        for (let prop in context2d) {
            if (this[prop] !== undefined) {
                continue;
            }
            if (typeof(context2d[prop]) == "function") {
                this[prop] = _context2dMethod.bind(this, prop);
            } else {
                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: false,
                    get: function(){},
                    set: _context2dMethod.bind(this, prop)
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

    setSnappyOptions(options) {
        helpers.merge(this._options, options);
        this.render();
    }

    clear() {
        this._drawing.length = 0;
        this._context2d.clearRect(0, 0, this._context2d.canvas.width, this._context2d.canvas.height);
    }

    render() {
        var ctx = this._context2d;
        var options = this._options;

        var pathStack = [];
        var isStroke = 0;

        var canvasStatus = {
            tx: options.globalTranslationX,
            ty: options.globalTranslationY,
            scale: options.globalScale,
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

        var _posx = (x, cs, opt) => ((x+cs.tx)*cs.scale|0)+((cs.lw*isStroke)%2/2);
        var _posy = (y, cs, opt) => ((y+cs.ty)*cs.scale|0)+((cs.lw*isStroke)%2/2);
        var _size = (s, cs, opt) => s*cs.scale|0;
        var _nop = (v, cs, opt) => v;

        // Operations

        function _operationGeneric(operation, operationName, ...values) {
            if (operation.isStroke !== undefined && operation.isStroke !== null) {
                isStroke = operation.isStroke;
            }
            var args = [];
            for (let i = 0 ; i < values.length ; i++) {
                args[i] = operation.args[i](values[i], canvasStatus, options);
            }
            _contextOperationCall(ctx, operationName, ...args);
        }

        function _operationPathStack(operation, operationName, ...values) {
            pathStack.push([operationName, ...values]);
        }

        function _operationUnimplemented(operation, operationName, ...values) {
            console.warn(`SnappyContext2D: the "${operationName}" operation is not implemented by SnappyCanvas. The output may be ugly!`);
            ctx.save();
            ctx.translate(canvasStatus.tx|0, canvasStatus.ty|0);
            ctx.scale(canvasStatus.scale, canvasStatus.scale);
            _contextOperationCall(ctx, operationName, ...values);
            ctx.restore();
        }

        var operations = {

            // Drawing rectangles
            clearRect: {isStroke: 0, args: [_posx, _posy, _size, _size]},
            fillRect: {isStroke: 0, args: [_posx, _posy, _size, _size]},
            strokeRect: {isStroke: 1, args: [_posx, _posy, _size, _size]},

            // Drawing text
            // TODO fillText()
            // TODO strokeText()
            // TODO measureText()

            // Line style
            lineWidth: {fn: function(operation, operationName, ...values) {
                var lineWidth;
                if (options.scaleLineWidth) {
                    lineWidth = (values[0] * canvasStatus.scale) | 0;
                } else {
                    lineWidth = values[0]|0;
                }
                canvasStatus.lw = lineWidth;
                ctx.lineWidth = lineWidth;
            }},
            lineCap: {args: [_nop]},
            lineJoin: {args: [_nop]},
            miterLimit: {args: [_nop]},
            // TODO getLineDash()
            // TODO setLineDash()
            // TODO lineDashOffset

            // Text styles
            // TODO font
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
            arc: {isPath: true, args: [_posx, _posy, _size, _nop, _nop, _nop]},
            arcTo: {isPath: true, args: [_posx, _posy, _posx, _posy, _size]},
            // TODO ellipse()   /!\ Experimental
            rect: {args: [_posx, _posy, _size, _size]},

            // Drawing paths
            fill: {fn: _ => {isStroke = false; _drawStack(pathStack, false); ctx.fill(); }},
            stroke: {fn: _ => {isStroke = true; _drawStack(pathStack, false); ctx.stroke(); }},
            // TODO drawFocusIfNeeded()
            // TODO scrollPathIntoView()    /!\ Experimental
            // TODO clip()
            // TODO isPointInPath()
            // TODO isPointInStroke()

            // Transformation
            // TODO currentTransform   /!\ Experimental
            // TODO rotate()
            scale: {fn: _ => { throw new Error("NotImplementedError: scale is not supported by snappy canvas"); }},
            translate: {fn: function(operation, operationName, tx, ty) {
                canvasStatus.tx += tx;
                canvasStatus.ty += ty;
            }},
            // TODO transform()
            // TODO resetTransform()    /!\ Experimental

            // Compositing
            globalAlpha: {args: [_nop]},
            globalCompositeOperation: {args: [_nop]},

            // Drawing images
            // TODO drawImage

            // Pixel manipulation
            // TODO createImageData()
            // TODO getImageData()
            // TODO putImageData()

            // Image smoothing
            imageSmoothingEnabled: {args: [_nop]},

            // The canvas state
            save: {fn: _ => console.error("SnappyContext2D: the 'save' operation is not implemented yet!")},  // FIXME
            restore: {fn: _ => console.error("SnappyContext2D: the 'restore' operation is not implemented yet!")},  //FIXME

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
        ctx.lineWidth = canvasStatus.lw;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        _drawStack(this._drawing);
        ctx.restore();
    }

}

module.exports = SnappyContext2D;
