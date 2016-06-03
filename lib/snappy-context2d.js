"use strict";

var helpers = ("./helpers.js");

class SnappyContext2D {

    constructor(context2d) {
        Object.defineProperty(this, "_context2d",  {
            enumerable: false,
            configurable: false,
            value: context2d
        });
    }

    render(_options={}) {
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

}

module.exports = SnappyContext2D;
