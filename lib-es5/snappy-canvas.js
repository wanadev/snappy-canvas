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
    var contentWidth = null;
    var contentHeight = null;

    canvas.getContext = function (contextType) {
        if (contextType == "snappy") {
            return snappyContext2d;
        } else {
            return HTMLCanvasElement.prototype.getContext.call(this, contextType);
        }
    };

    Object.defineProperty(canvas, "contentWidth", {
        enumerable: true,
        configurable: false,
        get: function get() {
            if (contentWidth === null) {
                return this.width / snappyContext2d.globalScale | 0;
            } else {
                return contentWidth | 0;
            }
        },
        set: function set(width) {
            contentWidth = width;
            if (options.autoResizeCanvas) {
                this.width = width * snappyContext2d.globalScale | 0;
            }
        }
    });

    Object.defineProperty(canvas, "contentHeight", {
        enumerable: true,
        configurable: false,
        get: function get() {
            if (contentHeight === null) {
                return this.height / snappyContext2d.globalScale | 0;
            } else {
                return contentHeight | 0;
            }
        },
        set: function set(height) {
            contentHeight = height | 0;
            if (options.autoResizeCanvas) {
                this.height = height * snappyContext2d.globalScale | 0;
            }
        }
    });

    if (options.width) {
        canvas.width = options.width;
    }
    if (options.height) {
        canvas.height = options.height;
    }

    if (options.contentWidth) {
        canvas.contentWidth = options.contentWidth;
    }

    if (options.contentHeight) {
        canvas.contentHeight = options.contentHeight;
    }
};

module.exports = SnappyCanvas;