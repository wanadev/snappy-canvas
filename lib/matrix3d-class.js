module.exports  = class Matrix3D {
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

    _init() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.f = 0;
    }
    
    static opposite(matrix) {
        const matrixClone = matrix.clone();
        const det = Matrix3D.determine(matrix);

        matrix.a = matrixClone.d / det;
        matrix.c = -matrixClone.c / det;
        matrix.e = ((matrixClone.c * matrixClone.f) - (matrixClone.d * matrixClone.e)) / det;

        matrix.b = -matrixClone.b / det;
        matrix.d = matrixClone.a / det;
        matrix.f = (-(matrixClone.a * matrixClone.f) + (matrixClone.b * matrixClone.e)) / det;

        return matrix;
    }

    /**
     * 
     * @param { Matrix3D } matrix
     */
    static multiply(matrixA, matrixB) {
        const matrixClone = matrixA.clone();

        matrixA.a = matrixClone.a * matrixB.a + matrixClone.c * matrixB.b;
        matrixA.c = matrixClone.a * matrixB.c + matrixClone.c * matrixB.d;
        matrixA.e = matrixClone.a * matrixB.e + matrixClone.c * matrixB.f + matrixClone.e;

        matrixA.b = matrixClone.b * matrixB.a + matrixClone.d * matrixB.b;
        matrixA.d = matrixClone.b * matrixB.c + matrixClone.d * matrixB.d;
        matrixA.f = matrixClone.b * matrixB.e + matrixClone.d * matrixB.f + matrixClone.f;

        return matrixA;
    }

    static determine(matrix) {
        return matrix.a * matrix.d - matrix.b * matrix.c;
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

    transformCoordinates(vector2) {
        return {
            x : this.a * vector2.x + this.b * vector2.y,
            y : this.c * vector2.x + this.d * vector2.y
        };
    }
    
    _multiply(matrix) {
        return Matrix3D.multiply(this, matrix);
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
};