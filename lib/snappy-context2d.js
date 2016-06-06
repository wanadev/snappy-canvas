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
        var instructions = this._drawing;

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

        // operations
        var _posx = (x, cs) => ((x+cs.translationX)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
        var _posy = (y, cs) => ((y+cs.translationY)*cs.scale|0)+((cs.lineWidth*isStroke)%2/2);
        var _size = (s, cs) => s*cs.scale|0;
        var _nop = (v, cs) => v;

        function _genericOperation(operation, instruction, ...values) {
            if (operation.isStroke !== undefined) {
                isStroke = operation.isStroke;
            }
            var result = [];
            for (let i = 0 ; i < values.length ; i++) {
                result[i] = operation.args[i](values[i], canvasStatus);
            }
            return result;
        }

        function _apply(ctx, instruction, args) {
            if (typeof(ctx[instruction]) == "function") {
                return ctx[instruction].apply(ctx, args);
            } else {
                ctx[instruction] = args[0];
            }
        }

        var operations = {
            strokeRect: {isStroke: 1, args: [_posx, _posy, _size, _size], fn: _genericOperation},
            fillRect:   {isStroke: 0, args: [_posx, _posy, _size, _size], fn: _genericOperation}
        };

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let i = 0 ; i < instructions.length ; i++) {
            let instruction = instructions[i][0];
            if (operations[instruction]) {
                let args = operations[instruction].fn(operations[instruction], ...instructions[i]);
                _apply(ctx, instruction, args);
            } else {
                throw new Error("NotImplementedError");  // FIXME
            }
        }
    }

}

module.exports = SnappyContext2D;
