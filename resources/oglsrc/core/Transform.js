import { Node } from './Node.js';
import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat4 } from '../math/Mat4.js';
import { Euler } from '../math/Euler.js';

//TODO: add directions, clean up visible, naming of functions and variables

//TODO: once operator overloading is added to scripting
// have assignment operator be overloadable
// so math classes dont need to have a getter and setter each time
// i.e. a vec2 class would have the assignment operator set to .set instead

export class Transform extends Node {
    static editorProperties = [["visible",true,"boolean"],["position",true,"vector3"]];

    constructor(name, parent = null) {
        super(name, parent)

        this.visible = true;

        //to prevent circular signals from existing
        //this happened with original ogl, where rotation properties updated off eachother
        //and there was no onchange being called on fromquaternion or fromeuler (thats stupid)
        this.shouldUpdateFromSignal = true;

        //LOCAL MATRIX
        this._matrix = new Mat4();
        this._matrix.onChange.add(() => {
            this.safeCall(() => {
                this.decomposeLocal();
                this.updateWorldMatrix();
            });
        });

        this._position = new Vec3();
        this._position.onChange.add(() => {
            this.safeCall(() => {
                this.composeMatrix();
            });
        });

        this._rotation = new Euler();
        this._quaternion = new Quat();
        this._rotation.onChange.add(() => {
            this.safeCall(() => {
                this._quaternion.fromEuler(this._rotation);
                this.composeMatrix();
            });
        });
        this._quaternion.onChange.add(() => {
            this.safeCall(() => {
                this._rotation.fromQuaternion(this._quaternion); //yeah i dont know about this one (what is a full rotation) 2pi you idiot
                this.composeMatrix();
            });
        });

        this._scale = new Vec3(1);
        this._scale.onChange.add(() => {
            this.safeCall(() => {
                this.composeMatrix();
            });
        });

        // WORLD MATRIX
        this._worldMatrix = new Mat4();
        this._worldMatrix.onChange.add(() => {
            this.safeCall(() => {
                //if (this.name == "test") debugger;
                this.decomposeWorld();
                this.updateLocalMatrix();
            });
        });

        this._globalPosition = new Vec3();
        this._globalPosition.onChange.add(() => {
            this.safeCall(() => {
                this.composeWorldMatrix();
                this.updateLocalMatrix();
            });
        });

        this._globalRotation = new Euler();
        this._globalQuaternion = new Quat();
        this._globalRotation.onChange.add(() => {
            this.safeCall(() => {
                this._globalQuaternion.fromEuler(this._rotation);
                this.composeWorldMatrix();
                this.updateLocalMatrix();
            });
        });
        this._globalQuaternion.onChange.add(() => {
            this.safeCall(() => {
                this._globalRotation.fromQuaternion(this._quaternion); //yeah i dont know about this one (what is a full rotation) 2pi you idiot
                this.composeWorldMatrix();
                this.updateLocalMatrix();
            });
        });

        this._globalScale = new Vec3(1);
        this._globalScale.onChange.add(() => {
            this.safeCall(() => {
                this.composeWorldMatrix();
                this.updateLocalMatrix();
            });
        });
    }

    safeCall(f) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            f();

            this.shouldUpdateFromSignal = true;
        }
    }

    composeMatrix() {
        this._matrix.compose(this._quaternion, this._position, this._scale);
    }

    decomposeLocal() {
        this._matrix.getTranslation(this._position); // set up onChange for these functions
        this._matrix.getRotation(this._quaternion);
        this._matrix.getScaling(this._scale);
        this._rotation.fromQuaternion(this._quaternion);
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
        this._worldMatrix.compose(this._globalQuaternion, this._globalPosition, this._globalScale);
    }

    decomposeWorld() {
        //if (this.name == "test") debugger;
        this._worldMatrix.getTranslation(this._globalPosition); // set up onChange for these functions
        //if (this.name == "test") debugger;
        this._worldMatrix.getRotation(this._globalQuaternion);
        //if (this.name == "test") debugger;
        this._worldMatrix.getScaling(this._globalScale);
        //if (this.name == "test") debugger;
        this._globalRotation.fromQuaternion(this._globalQuaternion);
        //if (this.name == "test") debugger;
    }

    worldFromLocal() { // fix stupid name
        if (this.parent instanceof Transform) this._worldMatrix.multiply(this.parent.worldMatrix, this._matrix);
        else this._worldMatrix.copy(this._matrix);
    }

    //this basically takes the current world matrix and makes the local matrix mirror that (inverse of updateWorldMatrix)
    localFromWorld() { //fix stupid name
        if (this.parent instanceof Transform) {
            var tempMat4 = new Mat4(); //IDK MAKE THIS A VAR AT START LIKE EVERYWHERE ELSE???
            tempMat4.copy(this.parent.worldMatrix);
            tempMat4.inverse();
            this._matrix.multiply(tempMat4, this._worldMatrix);
        }
        else this._matrix.copy(this._worldMatrix);
    }

    lookAt(target, up = new Vec3(0, 1, 0), invert = false) { //should lookAt be using globalmatrix or not???
        if (invert) this.matrix.lookAt(this.position, target, up);
        else this.matrix.lookAt(target, this.position, up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion); // is this line necessary
    }

    //TODO: worldtolocal and localtoworld

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
        this._rotation.set(value);
    }

    get quaternion() {
        return this._quaternion;
    }
    set quaternion(value) {
        this._quaternion.set(value);
    }

    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale.set(value);
    }

    get worldMatrix() {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });
        
        return this._worldMatrix;
    }
    set worldMatrix(value) {
        this._worldMatrix.set(value);
    }

    get globalPosition() { //using standard naming, maybe change worldmatrix to globalmatrix
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        return this._globalPosition;
    }
    set globalPosition(value) {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        this._globalPosition.set(value);
    }

    get globalRotation() { //using standard naming, maybe change worldmatrix to globalmtx
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        return this._globalRotation;
    }
    set globalRotation(value) {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        this._globalRotation.set(value);
    }

    get globalQuaternion() { //using standard naming, maybe change worldmatrix to globalmtx
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        return this._globalQuaternion;
    }
    set globalQuaternion(value) {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        this._globalQuaternion.set(value);
    }

    get globalScale() { //using standard naming, maybe change worldmatrix to globalmtx
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        return this._globalScale;
    }
    set globalScale(value) {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        this._globalScale.set(value);
    }

    get forward() {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        let forward = new Vec3(0, 0, 1);
        forward.applyQuaternion(this._globalQuaternion);
        return forward;
    }

    get right() {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        let right = new Vec3(1, 0, 0);
        right.applyQuaternion(this._globalQuaternion);
        return right;
    }

    get up() {
        this.safeCall(() => {
            this.updateWorldMatrix();
        });

        var up = new Vec3(0, 1, 0);
        up.applyQuaternion(this._globalQuaternion);
        return up;
    }
}
