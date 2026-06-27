import { Signal } from '../core/Signal.js';
import * as Mat3Func from './functions/Mat3Func.js';

export class Mat3 extends Array {
    constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0, m20 = 0, m21 = 0, m22 = 1) {
        super(m00, m01, m02, m10, m11, m12, m20, m21, m22);

        this.onChange = new Signal();

        return this;
    }

    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        if (m00.length) return this.copy(m00);
        Mat3Func.set(this, m00, m01, m02, m10, m11, m12, m20, m21, m22);
        this.onChange.fire();
        return this;
    }

    translate(v, m = this) {
        Mat3Func.translate(this, m, v);
        this.onChange.fire();
        return this;
    }

    rotate(v, m = this) {
        Mat3Func.rotate(this, m, v);
        this.onChange.fire();
        return this;
    }

    scale(v, m = this) {
        Mat3Func.scale(this, m, v);
        this.onChange.fire();
        return this;
    }

    multiply(ma, mb) {
        if (!ma.length) {
            Mat3Func.multiplyScalar(this, this, ma);
        } else if (mb) {
            Mat3Func.multiply(this, ma, mb);
        } else {
            Mat3Func.multiply(this, this, ma);
        }
        this.onChange.fire();
        return this;
    }

    identity() {
        Mat3Func.identity(this);
        this.onChange.fire();
        return this;
    }

    copy(m) {
        Mat3Func.copy(this, m);
        this.onChange.fire();
        return this;
    }

    fromMatrix4(m) {
        Mat3Func.fromMat4(this, m);
        this.onChange.fire();
        return this;
    }

    fromQuaternion(q) {
        Mat3Func.fromQuat(this, q);
        this.onChange.fire();
        return this;
    }

    // TODO: change to compose like in Mat4
    fromPositionRotationScale(pos, rot, scale) {
        Mat3Func.fromPositionRotationScale(this, pos, rot, scale);
        this.onChange.fire();
        return this;
    }

    getTranslation(pos) {
        Mat3Func.getTranslation(pos, this);
        return this;
    }

    getRotation() {
        return Mat3Func.getRotation(this);
    }

    getScaling(scale) {
        Mat3Func.getScaling(scale, this);
        return this;
    }

    fromBasis(vec3a, vec3b, vec3c) {
        this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]);
        this.onChange.fire();
        return this;
    }

    inverse(m = this) {
        Mat3Func.invert(this, m);
        this.onChange.fire();
        return this;
    }

    getNormalMatrix(m) {
        Mat3Func.normalFromMat4(this, m);
        return this;
    }

    clone() {
        const newObj = new Mat3();
        newObj.copy(this);
        newObj.onChange = this.onChange.clone();
        return newObj;
    }
}
