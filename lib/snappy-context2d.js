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

        function _context2dMethod(...call) {
            this._drawing.push(call);  // jshint ignore:line
        }

        for (let prop in context2d) {
            if (typeof(context2d[prop]) == "function") {
                this[prop] = _context2dMethod.bind(this, prop);
            }
        }
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
        var pathBuff = [];
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

        var _posx = (x, cs) => ((x+cs.translationX)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
        var _posy = (y, cs) => ((y+cs.translationY)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
        var _size = (s, cs) => s*cs.scale|0;
        var _nop = (v, cs) => v;

        // Operations

        function _operationGeneric(operation, operationName, ...values) {
            if (operation.isStroke !== undefined && operation.isStroke !== null) {
                isStroke = operation.isStroke;
            }
            var args = [];
            for (let i = 0 ; i < values.length ; i++) {
                args[i] = operation.args[i](values[i], canvasStatus);
            }
            _contextOperationCall(ctx, operationName, ...args);
        }

        function _operationPathStack(operation, operationName, ...values) {
            pathBuff.push([operationName, ...values]);
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
            pathBuff = [];
        }

        function _operationStroke(operation, operationName, ...values) {
            isStroke = true;
            ctx.beginPath();
            _drawStack(pathBuff, false);
            ctx.stroke();
        }

        function _operationFill(operation, operationName, ...values) {
            isStroke = false;
            ctx.beginPath();
            _drawStack(pathBuff, false);
            ctx.fill();
        }

        // Operations definition

        var operationDefs = {
            strokeRect: {isStroke: 1, args: [_posx, _posy, _size, _size]},
            fillRect: {isStroke: 0, args: [_posx, _posy, _size, _size]},

            beginPath: {fn: _operationBeginPath},
            moveTo: {isPath: true, args: [_posx, _posy]},
            lineTo: {isPath: true, args: [_posx, _posy]},
            closePath: {isPath: true},

            stroke: {fn: _operationStroke},
            fill: {fn: _operationFill},
        };

        // Let's draw

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        _drawStack(this._drawing);
    }

}

module.exports = SnappyContext2D;
