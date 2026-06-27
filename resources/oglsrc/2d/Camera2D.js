import { Mat3 } from "../math/Mat3.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { Transform2D } from "./Transform2D.js";
import { getGlContext } from "../core/Canvas.js";

//TODO: ZOOM DOESNT IMMEDIATELY UPDATE projectionMatrices
export class Camera2D extends Transform2D {
    static editorProperties = [
        ["zoom",true,"number"]
    ]

    constructor() {
        super();

        this._zoom = 1;

        this.viewMatrix = new Mat3(); //TODO: put onchange on uhh zoom

        this.projectionMatrix = new Mat3();

        this.projectionViewMatrix = new Mat3();

        this.matrix.onChange.add(() => {
           this.generateViewMatrix();
        })
    }

    generateViewMatrix() {
        this.viewMatrix.inverse(this.worldMatrix);

        const canvas = getGlContext().canvas;
        const renderer = getGlContext().renderer; //this is weird ONLY BECAUSE this is supposed to be done in the renderer class oops

        this.projectionMatrix.set(1 / renderer.width * this.zoom,0,0,0, 1 / renderer.height * this.zoom,0,0,0,1);

        this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix);
    }

    getFrustumBounds() {
        const m = new Mat3();
        m.copy(this.projectionViewMatrix);
        m.inverse();

        const v1 = new Vec2(-1);
        v1.applyMatrix3(m);

        const v2 = new Vec2(1);
        v2.applyMatrix3(m);

        return new Rect(v1, v2);
    }

    frustumIntersectsDrawable(node) {
        return this.getFrustumBounds().intersectsRect(node.getGlobalBounds());
    }

    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        this._zoom = value;
        this.generateViewMatrix();
    }
}

//TODO: FIX EVERYTHING THAT BREAKS ACCORDING TO THE RENDERER DPI
