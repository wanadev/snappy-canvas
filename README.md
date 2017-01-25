# SnappyCanvas - Canvas where everything is snapped to nearest pixel

[![Travis CI](https://travis-ci.org/wanadev/snappy-canvas.svg)](https://travis-ci.org/wanadev/snappy-canvas)
[![NPM Version](http://img.shields.io/npm/v/snappy-canvas.svg?style=flat)](https://www.npmjs.com/package/snappy-canvas)
[![License](http://img.shields.io/npm/l/snappy-canvas.svg?style=flat)](https://github.com/wanadev/snappy-canvas/blob/master/LICENSE)

Snappy canvas is an HTML5 canvas that provides a `"snappy"` 2D context with
an API similar to the standard 2D context but where everything is approximated
to the nearest pixel: no more blurry drawings!

![Snappy Context 2D vs Standard Context 2D](./render-example.png)

```javascript
var canvas = new SnappyCanvas({
    width: 300,
    height: 300
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


## SnappyCanvas API

### Constructor

    var canvas = new SnappyCanvas([options={}]) -> HTMLCanvasElement


* `options`: Object -- The SnappyCanvas and SnappyContext2D options.

```javascript
{
    // SnappyCanvas options
    width: <Number>,               // Width of the canvas HTML element
    height: <Number>,              // Height of the canvas HTML element
    contentWidth: <Number>,        // Width of the drawing at scale 1 (useful when autoResize = true)
    contentHeight: <Number>,       // Height of the drawing at scale 1 (useful when autoResize = true)

    // SnappyContext2D options
    globalScale: <Number>,         // Initial scale of the snappy context (default 1)
    globalTranslationX: <Number>,  // Initial x translation of the snappy context (default 0)
    globalTranslationY: <Number>,  // Initial y translation of the snappy context (default 0)
    scaleLineWidth: <Boolean>,     // If true, the snappy context will scale the line width according to scale (default true)
    autoResizeCanvas: <Boolean>    // Allow canvas to be resized when `SnappyContext2D.globalScale` changes
}
```

__NOTE:__ The constructor returns a standard `HTMLCanvasElement` augmented with
some additional properties.

### SnappyCanvas.getContext()

    canvas.getContext(contextType [, contextAttributes]) -> SnappyContext2D

Same as the standard [`HTMLCanvasElement.getContext()`][canvas-getcontext] but
with an additional `contextType`: `"snappy"`.

Example:

```javascript
var ctx = canvas.getContext("snappy");
```

### SnappyCanvas.contentWidth

    canvas.contentWidth = <Number>

Width of the drawing at scale 1 (useful when `autoResize` enabled).

### SnappyCanvas.contentHeight

    canvas.contentHeight = <Number>

Height of the drawing at scale 1 (useful when `autoResize` enabled).


## SnappyContext2D

`SnappyContext2D` provides most of the standard
[`CanvasRenderingContext2D`][ctx2d] and works almost the same.

The main differences between the standard context 2D and the snappy context 2D
are:

* the snappy context 2D **does not** draw anything when you call a drawing
  operation: it just stacks the operations and draws everything when you call the
  `render()` method.
* you can change the global scale and translation of the snappy context at any
  time and **everything will be automatically redrawn** according to the new
  parameters (no need to repeat the operations yourself).

To access the snappy context, just request it from a `SnappyCanvas`:

```javascript
var canvas = new SnappyCanvas();
var ctx = canvas.getContext("snappy");
```

### SnappyContext2D.globalTranslationX

    ctx.globalTranslationX = <Number>

The global translation of the canvas (offset x).

__NOTE:__ The canvas is automatically updated when this value is changed.

### SnappyContext2D.globalTranslationY

    ctx.globalTranslationY = <Number>

The global translation of the canvas (offset y).

__NOTE:__ The canvas is automatically updated when this value is changed.

### SnappyContext2D.globalScale

    ctx.globalScale = <Number>

The global scale of the canvas.

__NOTE:__ The canvas is automatically updated when this value is changed.

### SnappyContext2D.scaleLineWidth

    ctx.scaleLineWidth = <Boolean>

Determines if the line width is scaled (`true`, default) or if it keeps the same
thickness at each scale (`false`).

__NOTE:__ The canvas is automatically updated when this value is changed.

### SnappyContext2D.setSnappyOptions()

    ctx.setSnappyOptions(options)

Sets multiple options in one round.

* `options`: Object -- The SnappyContext2D options.

```javascript
{
    globalScale: <Number>,         // Initial scale of the snappy context (default 1)
    globalTranslationX: <Number>,  // Initial x translation of the snappy context (default 0)
    globalTranslationY: <Number>,  // Initial y translation of the snappy context (default 0)
    scaleLineWidth: <Boolean>,     // If true, the snappy context will scale the line width according to scale (default true)
    autoResizeCanvas: <Boolean>    // Allow canvas to be resized when `SnappyContext2D.globalScale` changes
}
```

__NOTE:__ The canvas is automatically updated when this value is changed.

### SnappyContext2D.clear()

    ctx.clear()

Clears the canvas and empties the drawing operation stack. Must be used as
replacement of `ctx.clearRect(0, 0, canvas.width, canvas.height)`) to clear the
canvas.

### SnappyContext2D.render()

    ctx.render()

(Re)paints all the drawings.

### CanvasRenderingContext2D supported operations

Note that the support of the following operations does not only depend on
`SnappyCanvas` but also depends on the Browser implementation of the canvas.

You can find the documentation related to all those operation on MDN:
[`CanvasRenderingContext2D`][ctx2d].

#### Drawing rectangles

* `clearRect()`
* `fillRect()`
* `strokeRect()`

#### Drawing text

* `fillText()`
* `strokeText()`
* `measureText()`

#### Line style

* `lineWidth`
* `lineCap`
* `lineJoin`
* `miterLimit`
* `getLineDash()`
* `setLineDash()`
* `lineDashOffset`

#### Text styles

* `font`
* `textAlign`
* `textBaseline`
* `direction`

#### Fill and stroke styles

* `fillStyle`
* `strokeStyle`

#### Gradients and patterns

* ~~`createLinearGradient()`~~ **TODO**
* ~~`createRadialGradient()`~~ **TODO**
* ~~`createPattern()`~~ **TODO**

#### Shadows

* ~~`shadowBlur`~~ **TODO**
* `shadowColor`
* ~~`shadowOffsetX`~~ **TODO**
* ~~`shadowOffsetY`~~ **TODO**

#### Path

* `beginPath()`
* `closePath()`
* `moveTo()`
* `lineTo()`
* `bezierCurveTo()`
* `quadraticCurveTo()`
* `arc()`
* `arcTo()`
* `ellipse()`
* `rect()`

#### Drawing paths

* `fill()`
* `stroke()`
* ~~`drawFocusIfNeeded()`~~ **TODO**
* ~~`scrollPathIntoView()`~~ **TODO**
* ~~`clip()`~~ **TODO**
* ~~`isPointInPath()`~~ **TODO**
* ~~`isPointInStroke()`~~ **TODO**

#### Transformation

* ~~`currentTransform`~~ **NOT SUPPORTED**
* ~~`scale()`~~ **NOT SUPPORTED**
* `translate()`
* ~~`transform()`~~ **NOT SUPPORTED**
* ~~`resetTransform()`~~ **NOT SUPPORTED**

#### Compositing

* `globalAlpha`
* `globalCompositeOperation`

#### Drawing images

* `drawImage()`

#### Pixel manipulation

* ~~`createImageData()`~~ **NOT SUPPORTED**
* ~~`getImageData()`~~ **NOT SUPPORTED**
* ~~`putImageData()`~~ **NOT SUPPORTED**

#### Image smoothing

* `imageSmoothingEnabled`

#### The canvas state

* `save()`
* `restore()`

#### Hit regions

* ~~`addHitRegion()`~~ **TODO**
* ~~`removeHitRegion()`~~ **TODO**
* ~~`clearHitRegion()`~~ **TODO**


## Changelog

* **0.4.1:** Updates Browserify to 14.0.0
* **0.4.0:** Context2D: `ellipse()` support implemented
* **0.3.0:**
  * Context2D: `getLineDash()`, `setLineDash()` and `lineDashOffset` support
    implemented
  * Fixes miss behavior when using translation in path operations (#1)


[canvas-getcontext]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
[ctx2d]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
