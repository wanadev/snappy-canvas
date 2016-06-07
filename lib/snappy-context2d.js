"use strict";

var helpers = require("./helpers.js");

class SnappyContext2D {

    constructor(context2d) {
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
        Object.defineProperty(this, "canvas",  {
            enumerable: true,
            configurable: false,
            value: this._context2d.canvas
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

    clear() {
        this._drawing.length = 0;
        this.render();
    }

    render(_options={}) {
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
            lineWidth: (options.scaleLineWidth) ? Math.max(1, options.scale|0) : 1
        };

        ctx.lineWidth = canvasStatus.lineWidth;

        var canvasStatusStack = [];
        var pathStack = [];
        var isStroke = 0;

        // Helpers

        function _drawStack(stack, skipPath=true) {
            for (let i = 0 ; i < stack.length ; i++) {
                let operationName = stack[i][0];
                let operationDef = operationDefs[operationName];
                let operationFn = (skipPath && operationDef && operationDef.isPath) ? _operationPathStack : _operationGeneric;

                if (operationDef) {
                    if (operationDef.fn) {
                        operationFn = operationDefs[operationName].fn;
                    }
                } else {
                    operationFn = _operationUnimplemented;
                }

                operationFn(operationDef, ...stack[i]);
            }
        }

        function _contextOperationCall(ctx, operationName, ...args) {
            if (typeof(ctx[operationName]) == "function") {
                return ctx[operationName].apply(ctx, args);
            } else {
                ctx[operationName] = args[0];
            }
        }

        // Filters

        var _posx = (x, cs, opt) => ((x+cs.translationX)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
        var _posy = (y, cs, opt) => ((y+cs.translationY)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
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
            ctx.translate(canvasStatus.translationX|0, canvasStatus.translationY|0);
            ctx.scale(canvasStatus.scale, canvasStatus.scale);
            _contextOperationCall(ctx, operationName, ...values);
            ctx.restore();
        }

        function _operationBeginPath(operation, operationName, ...values) {
            pathStack = [];
        }

        function _operationStroke(operation, operationName, ...values) {
            isStroke = true;
            ctx.beginPath();
            _drawStack(pathStack, false);
            ctx.stroke();
        }

        function _operationFill(operation, operationName, ...values) {
            isStroke = false;
            ctx.beginPath();
            _drawStack(pathStack, false);
            ctx.fill();
        }

        function _operationLineWidth(operation, operationName, ...values) {
            var lineWidth;
            if (options.scaleLineWidth) {
                lineWidth = (values[0] * canvasStatus.scale) |0;
            } else {
                lineWidth = values[0]|0;
            }
            canvasStatus.lineWidth = lineWidth;
            ctx.lineWidth = lineWidth;
        }

        // Operations definition

        var operationDefs = {

            // Drawing rectangles
            // TODO clearRect()
            fillRect: {isStroke: 0, args: [_posx, _posy, _size, _size]},
            strokeRect: {isStroke: 1, args: [_posx, _posy, _size, _size]},

            // Drawing text
            // TODO fillText()
            // TODO strokeText()
            // TODO measureText()

            // Line style
            lineWidth: {fn: _operationLineWidth},
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
            fillStyle: {args: [_nop]},
            strokeStyle: {args: [_nop]},

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
            beginPath: {fn: _operationBeginPath},
            closePath: {isPath: true},
            moveTo: {isPath: true, args: [_posx, _posy]},
            lineTo: {isPath: true, args: [_posx, _posy]},
            // TODO bezierCurveTo()
            // TODO quadraticCurveTo()
            // TODO arc()
            // TODO arcTo()
            // TODO ellipse()   /!\ Experimental
            rect: {args: [_posx, _posy, _size, _size]},

            // Drawing paths
            fill: {fn: _operationFill},
            stroke: {fn: _operationStroke},
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
            save: {fn: _ => console.error("SnappyContext2D: the 'save' operation is not implemented yet!")},
            restore: {fn: _ => console.error("SnappyContext2D: the 'restore' operation is not implemented yet!")},

            // Hit regions
            // TODO addHitRegion()        /!\ Experimental
            // TODO removeHitRegion()     /!\ Experimental
            // TODO clearHitRegion()      /!\ Experimental

        };

        // Let's draw

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        _drawStack(this._drawing);
        ctx.restore();
    }

}

module.exports = SnappyContext2D;
