# SnappyCanvas - Canvas where everything is snapped to nearest pixel

[![Travis CI](https://travis-ci.org/wanadev/snappy-canvas.svg)](https://travis-ci.org/wanadev/snappy-canvas)
[![NPM Version](http://img.shields.io/npm/v/snappy-canvas.svg?style=flat)](https://www.npmjs.com/package/snappy-canvas)
[![License](http://img.shields.io/npm/l/snappy-canvas.svg?style=flat)](https://github.com/wanadev/snappy-canvas/blob/master/LICENSE)

Snappy canvas is an HTML5 canvas that provides a `"snappy"` 2D context that
provides an API similar to the standard 2D context but that approximate
everything to the nearest pixel: no more blurry draw!

![Snappy Context 2D vs Standard Context 2D](./render-example.png)

```javascript
var canvas = new SnappyCanvas({
    width: 300,                // Canvas real width
    height: 300,               // Canvas real height
    contentWidth: 150,         // Width at scale 1 (usefull when autoResize = true)
    contentHeight: 150,        // Height at scale 1 (usefull when autoResize = true)
    globalScale: 1,            // Initial scale of the snappy context (default 1)
    globalTranslationX: 0,     // Initial translation x of the snappy context (default 0)
    globalTranslationY: 0,     // Initial translation y of the snappy context (default 0)
    scaleLineWidth: true,      // If true, the snappy context will scale the line width according to scale (default true)
    autoResizeCanvas: false    // Allow canvas to be resized when `globalScale` changes
});

var ctx = canvas.getContext("snappy");

ctx.strokeRect(10, 10, 50, 50);
ctx.fillRect(70, 10, 50, 50);

ctx.beginPath();
ctx.arc(35, 95, 25, Math.PI, 2.5 * Math.PI);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(70, 95);
ctx.arcTo(120, 95, 120, 120, 25);
ctx.stroke();

ctx.render();
```

* Live example on JSFiddle: [https://jsfiddle.net/hq746L43/3/](https://jsfiddle.net/hq746L43/3/)


