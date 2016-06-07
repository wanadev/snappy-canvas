"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SnappyContext2D = require("./snappy-context2d.js");

var SnappyCanvas = function SnappyCanvas(options) {
    _classCallCheck(this, SnappyCanvas);

    var canvas = options.canvas || document.createElement("canvas");
    SnappyCanvas.transformCanvas(canvas, options);
    return canvas;
};

SnappyCanvas.transformCanvas = function (canvas) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var context2d = canvas.getContext("2d");
    var snappyContext2d = new SnappyContext2D(context2d, options);

    canvas.getContext = function (contextType) {
        if (contextType == "snappy") {
            return snappyContext2d;
        } else {
            return HTMLCanvasElement.prototype.getContext.call(this, contextType);
        }
    };

    if (options.width) {
        canvas.width = options.width;
    }
    if (options.height) {
        canvas.height = options.height;
    }

    if (options.uWidth) {
        canvas.uWidth = options.uWidth;
    }

    if (options.uHeight) {
        canvas.uHeight = options.uHeight;
    }

    Object.defineProperty(canvas, "uWidth", {
        enumerable: true,
        configurable: false,
        get: function get() {
            return this.width / snappyContext2d.globalScale | 0;
        },
        set: function set(uWidth) {
            this.width = uWidth * snappyContext2d.globalScale | 0;
        }
    });

    Object.defineProperty(canvas, "uHeight", {
        enumerable: true,
        configurable: false,
        get: function get() {
            return this.height / snappyContext2d.globalScale | 0;
        },
        set: function set(uHeight) {
            this.height = uHeight * snappyContext2d.globalScale | 0;
        }
    });
};

module.exports = SnappyCanvas;