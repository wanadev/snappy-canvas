module.exports.Matrix3D  = class Matrix3D {
    /**
     * @param  { Matrix3D || {a,b,c,d,e,f} || a,b,c,d,e,f } values 
     */
    constructor(...values) {
        this._init();
        if ( values.length == 1 && ( values[0] instanceof Matrix3D || typeof values[0] == 'object' ) ) {
            const matrix = values[0];
            Object.keys(matrix).map( key => {
                if (this.hasOwnProperty(key)) {
                    this[key] = matrix[key];
                }
            });
        }
        else {
            const positionArray = ['a','b','c','d','e','f'];
            values.map((value, index) => {
                const key = positionArray[index];
                if ( this.hasOwnProperty(key) ) {
                    this[key] = value;
                }
            });
        }
    }
    /**
     * 
     * @private
     */
    _init() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.f = 0;
    }
    
    /**
     * 
     * @param { number } scaleX 
     * @param { number } scaleY 
     */
    scale(scaleX, scaleY) {
        const scaleMatrix = new Matrix3D({
            a : scaleX,
            d : scaleY
        });
        this._multiply(scaleMatrix);
    }

    /**
     * 
     * @param { number } translateX 
     * @param { number } translateY 
     */
    translate(translateX, translateY) {
        const translateMatrix = new Matrix3D({
            a : 1,
            d : 1,
            e : translateX,
            f : translateY
        });
        this._multiply(translateMatrix);
    }

    /**
     * 
     * @param { number } angle Angle in radian
     */
    rotate(angle) {
        const rotateMatrix = new Matrix3D({
            a : Math.cos(angle), c : -Math.sin(angle),
            b : Math.sin(angle), d :  Math.cos(angle)
        });
        this._multiply(rotateMatrix);
    }

    /**
     * 
     * @param { Matrix3D } matrix
     * @private
     */
    _multiply(matrix) {
        const matrixClone = this.clone();

        this.a = matrixClone.a * matrix.a + matrixClone.c * matrix.b;
        this.c = matrixClone.a * matrix.c + matrixClone.c * matrix.d;
        this.e = matrixClone.a * matrix.e + matrixClone.c * matrix.f + matrixClone.e;

        this.b = matrixClone.b * matrix.a + matrixClone.d * matrix.b;
        this.d = matrixClone.b * matrix.c + matrixClone.d * matrix.d;
        this.f = matrixClone.b * matrix.e + matrixClone.d * matrix.f + matrixClone.f;
    }

    /**
     * @returns { Matrix3D }
     */
    clone() {
        return new Matrix3D(this);
    }

    /**
     * For debug matrix
     */
    _drawMatrixInConsole() {
        console.log('-------------');
        console.log('| ' + this.a + ' | ' + this.c + ' | ' + this.e + ' |');
        console.log('| ' + this.b + ' | ' + this.d + ' | ' + this.f + ' |');
        console.log('| 0 | 0 | 1 |');
        console.log('-------------');
    }
}