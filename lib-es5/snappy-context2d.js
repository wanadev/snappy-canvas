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

        function _context2dMethod() {
            for (var _len = arguments.length, call = Array(_len), _key = 0; _key < _len; _key++) {
                call[_key] = arguments[_key];
            }

            this._drawing.push(call); // jshint ignore:line
        }

        for (var prop in context2d) {
            if (typeof context2d[prop] == "function") {
                this[prop] = _context2dMethod.bind(this, prop);
            }
        }
    }

    _createClass(SnappyContext2D, [{
        key: "render",
        value: function render() {
            var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
                lineWidth: options.scaleLineWidth ? Math.max(1, options.scale | 0) : 1
            };

            ctx.lineWidth = canvasStatus.lineWidth;

            var canvasStatusStack = [];
            var pathBuff = [];
            var isStroke = 0;

            // operations
            var _posx = function _posx(x, cs) {
                return ((x + cs.translationX) * cs.scale | 0) + cs.lineWidth * isStroke % 2 / 2;
            };
            var _posy = function _posy(y, cs) {
                return ((y + cs.translationY) * cs.scale | 0) + cs.lineWidth * isStroke % 2 / 2;
            };
            var _size = function _size(s, cs) {
                return s * cs.scale | 0;
            };
            var _nop = function _nop(v, cs) {
                return v;
            };

            function _genericOperation(operation, instruction) {
                if (operation.isStroke !== undefined) {
                    isStroke = operation.isStroke;
                }
                var result = [];

                for (var _len2 = arguments.length, values = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                    values[_key2 - 2] = arguments[_key2];
                }

                for (var i = 0; i < values.length; i++) {
                    result[i] = operation.args[i](values[i], canvasStatus);
                }
                return result;
            }

            function _apply(ctx, instruction, args) {
                if (typeof ctx[instruction] == "function") {
                    return ctx[instruction].apply(ctx, args);
                } else {
                    ctx[instruction] = args[0];
                }
            }

            var operations = {
                strokeRect: { isStroke: 1, args: [_posx, _posy, _size, _size], fn: _genericOperation },
                fillRect: { isStroke: 0, args: [_posx, _posy, _size, _size], fn: _genericOperation }
            };

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            for (var i = 0; i < instructions.length; i++) {
                var instruction = instructions[i][0];
                if (operations[instruction]) {
                    var _operations$instructi;

                    var args = (_operations$instructi = operations[instruction]).fn.apply(_operations$instructi, [operations[instruction]].concat(_toConsumableArray(instructions[i])));
                    _apply(ctx, instruction, args);
                } else {
                    throw new Error("NotImplementedError"); // FIXME
                }
            }
        }
    }]);

    return SnappyContext2D;
}();

module.exports = SnappyContext2D;