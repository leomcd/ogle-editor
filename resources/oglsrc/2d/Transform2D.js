import { Node } from '../core/Node.js';
import { Vec2 } from '../math/Vec2.js';
import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat3 } from '../math/Mat3.js';
import { Euler } from '../math/Euler.js';

//TODO: add directions, clean up visible, naming of functions and variables

export class Transform2D extends Node {
    static editorProperties = [
        ["visible",true,"boolean"],
        ["position",true,"vector2"],
        ["rotation",true,"number"],
        ["scale",true,"vector2"]
    ];

    constructor(name, parent = null) {
        super(name, parent)

        this.visible = true;

        //to prevent circular signals from existing
        //this happened with original ogl, where rotation properties updated off eachother
        //and there was no onchange being called on fromquaternion or fromeuler (thats stupid)
        this.shouldUpdateFromSignal = true;

        //LOCAL MATRIX
        this._matrix = new Mat3();
        this._matrix.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.decomposeLocal();
                this.updateWorldMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._position = new Vec2();
        this._position.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._rotation = 0.0;

        this._scale = new Vec2(1);
        this._scale.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        // WORLD MATRIX
        this._worldMatrix = new Mat3();
        this._worldMatrix.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                //if (this.name == "test") debugger;
                this.decomposeWorld();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        // TODO: change global to world (same in Transform)
        this._globalPosition = new Vec2();
        this._globalPosition.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._globalRotation = 0.0;

        this._globalScale = new Vec2(1);
        this._globalScale.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this.zPosition = 0;
    }

    composeMatrix() { //composes the 3x3 matrix from the 2d position, rotation, and scale
        this._matrix.fromPositionRotationScale(this._position, this._rotation, this._scale);
    }

    decomposeLocal() {
        this._matrix.getTranslation(this._position);
        this._rotation = this._matrix.getRotation();
        this._matrix.getScaling(this._scale);
    }

    updateWorldMatrix() {
        this.worldFromLocal();
        this.decomposeWorld();
    }

    updateLocalMatrix() {
        this.localFromWorld();
        this.decomposeLocal();
    }

    composeWorldMatrix() {
        this._worldMatrix.fromPositionRotationScale(this._globalPosition, this._globalRotation, this._globalScale);
    }

    decomposeWorld() {
        //if (this.name == "test") debugger;
        this._worldMatrix.getTranslation(this._globalPosition); // set up onChange for these functions
        //if (this.name == "test") debugger;
        this._globalRotation = this._worldMatrix.getRotation();
        //if (this.name == "test") debugger;
        this._worldMatrix.getScaling(this._globalScale);
        //if (this.name == "test") debugger;
    }

    worldFromLocal() { // fix stupid name
        if (this.parent instanceof Transform2D) this._worldMatrix.multiply(this.parent.worldMatrix, this._matrix);
        else this._worldMatrix.copy(this._matrix);
    }

    //this basically takes the current world matrix and makes the local matrix mirror that (inverse of updateWorldMatrix)
    localFromWorld() { //fix stupid name
        if (this.parent instanceof Transform2D) {
            var tempMat3 = new Mat3(); //IDK MAKE THIS A VAR AT START LIKE EVERYWHERE ELSE???
            tempMat3.copy(this.parent.worldMatrix);
            tempMat3.inverse();
            this._matrix.multiply(tempMat3, this._worldMatrix);
        }
        else this._matrix.copy(this._worldMatrix);
    }

    //TODO: write localtoworld
    worldToLocal(p) {
        const tempP = new Vec2();
        tempP.copy(p);
        const transformationMat = new Mat3();
        transformationMat.inverse(this.worldMatrix);
        tempP.applyMatrix3(transformationMat);

        return tempP;
    }

    /*
    TODO: implement this later for mat3
    lookAt(target, up = new Vec3(0, 1, 0), invert = false) { //should lookAt be using globalmatrix or not???
        if (invert) this.matrix.lookAt(this.position, target, up);
        else this.matrix.lookAt(target, this.position, up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion); // is this line necessary
    }
    */

    get matrix() {
        return this._matrix;
    }
    set matrix(value) {
        this._matrix.set(value);
    }

    get position() {
        return this._position;
    }
    set position(value) {
        this._position.set(value);
    }

    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        this._rotation = value;

        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.composeMatrix();

            this.shouldUpdateFromSignal = true;
        }
    }

    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale.set(value);
    }

    get worldMatrix() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }
        
        return this._worldMatrix;
    }
    set worldMatrix(value) {
        this._worldMatrix.set(value);
    }

    get globalPosition() { //using standard naming, maybe change worldmatrix to globalmatrix
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalPosition;
    }
    set globalPosition(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalPosition.set(value);
    }

    get globalRotation() { //using standard naming, maybe change worldmatrix to globalmtx
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalRotation;
    }
    set globalRotation(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalRotation = value;
    }

    get globalScale() { //using standard naming, maybe change worldmatrix to globalmtx
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalScale;
    }
    set globalScale(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalScale.set(value);
    }

    get globalZPosition() {
        if (!this.parent instanceof Transform2D) return this.zPosition;
        return this.parent.globalZPosition + this.zPosition;
    }
    set globalZPosition(value) {
        this.zPosition = value - this.parent.globalZPosition;
    }

    /*
    TODO: implement later
    get forward() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var forward = new Vec3(0, 0, 1);
        forward.applyQuaternion(this._globalQuaternion);
        return forward;
    }

    get rightd() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var right = new Vec3(1, 0, 0);
        right.applyQuaternion(this._globalQuaternion);
        return right;
    }

    get up() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var up = new Vec3(0, 1, 0);
        up.applyQuaternion(this._globalQuaternion);
        return up;
    }
    */
}
