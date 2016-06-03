"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = "./helpers.js";

var SnappyContext2D = function () {
    function SnappyContext2D(context2d) {
        _classCallCheck(this, SnappyContext2D);

        Object.defineProperty(this, "_context2d", {
            enumerable: false,
            configurable: false,
            value: context2d
        });
    }

    _createClass(SnappyContext2D, [{
        key: "render",
        value: function render() {
            var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var ctx = this._context2d;

            var options = {
                translationX: 0,
                translationY: 0,
                scale: 1,
                scaleLineWidth: true
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
                lineWidth: 1
            };

            var canvasStatusStack = [];
            var isStroke = 0;

            // TODO
        }
    }]);

    return SnappyContext2D;
}();

module.exports = SnappyContext2D;