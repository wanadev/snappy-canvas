"use strict";

var SnappyContext2D = require("./snappy-context2d.js");

class SnappyCanvas {

    constructor(options) {
        var canvas = options.canvas || document.createElement("canvas");
        SnappyCanvas.transformCanvas(canvas, options);
        if (options.width !== undefined) {
            canvas.width = options.width;
        }
        if (options.height !== undefined) {
            canvas.height = options.height;
        }
        return canvas;
    }

}

SnappyCanvas.transformCanvas = function(canvas, options={}) {
    var _scale = (options.scale !== undefined) ? options.scale : 1;
    var _translationX = (options.translationX !== undefined) ? options.translationX : 0;
    var _translationY = (options.translationY !== undefined) ? options.translationY : 0;
    var _scaleLineWidth = (options.scaleLineWidth !== undefined) ? options.scaleLineWidth : true;
    var _resizeCanvas = (options.resizeCanvas !== undefined) ? options.resizeCanvas : false;

    if (options.uWidth) {
        canvas.width = options.uWidth * _scale | 0;
    }

    if (options.uHeight) {
        canvas.height = options.uHeight * _scale | 0;
    }

    canvas._rawContext2d = canvas.getContext("2d");
    canvas._snappyContext2d = new SnappyContext2D(canvas._rawContext2d);

    canvas.getContext = function(contextType) {
        if (contextType != "2d") {
            throw new Error("ValueError: SnappyCanvas only supports '2d' context type.");
        }
        return this._snappyContext2d;
    };

    canvas.translate = function(tx, ty) {
        _translationX = tx;
        _translationY = ty;
        this.render();
    };

    canvas.render = function() {
        this._snappyContext2d.render();
    };

    Object.defineProperty(canvas, "scale", {
        enumerable: true,
        configurable: false,
        get: function() {
            return _scale;
        },
        set: function(scale) {
            var uWidth = this.uWidth;
            var uHeight = this.uHeight;
            _scale = scale;
            this.width = uWidth * _scale | 0;
            this.height = uHeight * _scale | 0;
            this.render();
        }
    });

    Object.defineProperty(canvas, "translationX", {
        enumerable: true,
        configurable: false,
        get: function() {
            return _translationX;
        },
        set: function(tx) {
            _translationX = tx;
            this.render();
        }
    });

    Object.defineProperty(canvas, "translationY", {
        enumerable: true,
        configurable: false,
        get: function() {
            return _translationY;
        },
        set: function(ty) {
            _translationY = ty;
            this.render();
        }
    });

    Object.defineProperty(canvas, "scaleLineWidth", {
        enumerable: true,
        configurable: false,
        get: function() {
            return _scaleLineWidth;
        },
        set: function(scaleLineWidth) {
            _scaleLineWidth = scaleLineWidth;
            this.render();
        }
    });

    Object.defineProperty(canvas, "resizeCanvas", {
        enumerable: true,
        configurable: false,
        get: function() {
            return _resizeCanvas;
        },
        set: function(resizeCanvas) {
            _resizeCanvas = resizeCanvas;
            this.render();
        }
    });

    Object.defineProperty(canvas, "uWidth", {
        enumerable: true,
        configurable: false,
        get: function() {
            return this.width / _scale | 0;
        },
        set: function(uWidth) {
            this.width = uWidth * _scale | 0;
            this.render();
        }
    });

    Object.defineProperty(canvas, "uHeight", {
        enumerable: true,
        configurable: false,
        get: function() {
            return this.height / _scale | 0;
        },
        set: function(uHeight) {
            this.height = uHeight * _scale | 0;
            this.render();
        }
    });

};

module.exports = SnappyCanvas;
