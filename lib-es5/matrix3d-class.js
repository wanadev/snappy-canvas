'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    /**
     * @param  { Matrix3D || {a,b,c,d,e,f} || a,b,c,d,e,f } values 
     */
    function Matrix3D() {
        var _this = this;

        _classCallCheck(this, Matrix3D);

        this._init();

        for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
            values[_key] = arguments[_key];
        }

        if (values.length == 1 && (values[0] instanceof Matrix3D || _typeof(values[0]) == 'object')) {
            var matrix = values[0];
            Object.keys(matrix).map(function (key) {
                if (_this.hasOwnProperty(key)) {
                    _this[key] = matrix[key];
                }
            });
        } else {
            var positionArray = ['a', 'b', 'c', 'd', 'e', 'f'];
            values.map(function (value, index) {
                var key = positionArray[index];
                if (_this.hasOwnProperty(key)) {
                    _this[key] = value;
                }
            });
        }
    }

    _createClass(Matrix3D, [{
        key: '_init',
        value: function _init() {
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.d = 0;
            this.e = 0;
            this.f = 0;
        }
    }, {
        key: 'scale',

        /**
         * 
         * @param { number } scaleX 
         * @param { number } scaleY 
         */
        value: function scale(scaleX, scaleY) {
            var scaleMatrix = new Matrix3D({
                a: scaleX,
                d: scaleY
            });
            this._multiply(scaleMatrix);
        }

        /**
         * 
         * @param { number } translateX 
         * @param { number } translateY 
         */

    }, {
        key: 'translate',
        value: function translate(translateX, translateY) {
            var translateMatrix = new Matrix3D({
                a: 1,
                d: 1,
                e: translateX,
                f: translateY
            });
            this._multiply(translateMatrix);
        }

        /**
         * 
         * @param { number } angle Angle in radian
         */

    }, {
        key: 'rotate',
        value: function rotate(angle) {
            var rotateMatrix = new Matrix3D({
                a: Math.cos(angle), c: -Math.sin(angle),
                b: Math.sin(angle), d: Math.cos(angle)
            });
            this._multiply(rotateMatrix);
        }
    }, {
        key: 'transformCoordinates',
        value: function transformCoordinates(vector2) {
            return {
                x: this.a * vector2.x + this.b * vector2.y,
                y: this.c * vector2.x + this.d * vector2.y
            };
        }
    }, {
        key: '_multiply',
        value: function _multiply(matrix) {
            return Matrix3D.multiply(this, matrix);
        }

        /**
         * @returns { Matrix3D }
         */

    }, {
        key: 'clone',
        value: function clone() {
            return new Matrix3D(this);
        }

        /**
         * For debug matrix
         */

    }, {
        key: '_drawMatrixInConsole',
        value: function _drawMatrixInConsole() {
            console.log('-------------');
            console.log('| ' + this.a + ' | ' + this.c + ' | ' + this.e + ' |');
            console.log('| ' + this.b + ' | ' + this.d + ' | ' + this.f + ' |');
            console.log('| 0 | 0 | 1 |');
            console.log('-------------');
        }
    }], [{
        key: 'opposite',
        value: function opposite(matrix) {
            var matrixClone = matrix.clone();
            var det = Matrix3D.determine(matrix);

            matrix.a = matrixClone.d / det;
            matrix.c = -matrixClone.c / det;
            matrix.e = (matrixClone.c * matrixClone.f - matrixClone.d * matrixClone.e) / det;

            matrix.b = -matrixClone.b / det;
            matrix.d = matrixClone.a / det;
            matrix.f = (-(matrixClone.a * matrixClone.f) + matrixClone.b * matrixClone.e) / det;

            return matrix;
        }

        /**
         * 
         * @param { Matrix3D } matrix
         */

    }, {
        key: 'multiply',
        value: function multiply(matrixA, matrixB) {
            var matrixClone = matrixA.clone();

            matrixA.a = matrixClone.a * matrixB.a + matrixClone.c * matrixB.b;
            matrixA.c = matrixClone.a * matrixB.c + matrixClone.c * matrixB.d;
            matrixA.e = matrixClone.a * matrixB.e + matrixClone.c * matrixB.f + matrixClone.e;

            matrixA.b = matrixClone.b * matrixB.a + matrixClone.d * matrixB.b;
            matrixA.d = matrixClone.b * matrixB.c + matrixClone.d * matrixB.d;
            matrixA.f = matrixClone.b * matrixB.e + matrixClone.d * matrixB.f + matrixClone.f;

            return matrixA;
        }
    }, {
        key: 'determine',
        value: function determine(matrix) {
            return matrix.a * matrix.d - matrix.b * matrix.c;
        }
    }]);

    return Matrix3D;
}();