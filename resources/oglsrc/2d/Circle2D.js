import { Circle } from "../extras/Circle.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { Drawable2D } from "./Drawable2D.js";
import { Program } from "../core/Program.js";

const vertex1 = `
    attribute vec2 position;

    uniform float radius;
    uniform vec2 anchorPosition;
    uniform mat3 cameraMatrix;
    uniform mat3 drawableMatrix;
    uniform float zPosition;

    void main() {
        vec2 p2 = position * radius;
        p2 -= anchorPosition;

        vec3 p3 = cameraMatrix * drawableMatrix * vec3(p2, 1.0);
        p3.z = zPosition;

        gl_Position = vec4(p3, 1.0);
    }
`;

const fragment1 = `
precision highp float;

uniform vec4 color;

void main() {
    gl_FragColor = color;
}
`;

export class Circle2D extends Drawable2D {
    static editorProperties = [["radius",true,"number"]];

    constructor() {
        super();

        this._radius = 25;

        this._anchorPosition = new Vec2(0, 0);
        this._anchorPosition.onChange.add(() => {
            this.updateDrawableUniforms();
        });

        this.updateGeometry();

        this.program = new Program({
            vertex: vertex1,
            fragment: fragment1,
            transparent: true,
            cullFace: false
        });

        this.drawableUniforms = {
            radius: { value: this._radius },
            anchorPosition: { value: this._anchorPosition },
        };
    }

    containsPoint(p) {
        const transformedPoint = new Vec2();
        transformedPoint.copy(p);

        this.worldToLocal(transformedPoint);

        return this.getLocalBounds().containsPoint(transformedPoint);
    }

    updateGeometry() {
        this.geometry = new Circle({ radius: 1 });
    }

    updateDrawableUniforms() {
        this.drawableUniforms.radius.value = this._radius;
        this.drawableUniforms.anchorPosition.value = this.anchorPosition;
    }

    get radius() {
        return this._radius;
    }
    set radius(value) {
        this._radius = value;
        this.updateDrawableUniforms();
    }

    get anchorPosition() {
        return this._anchorPosition;
    }
    set anchorPosition(value) {
        this._anchorPosition.set(value);
    }

    // TODO: change to be like an actual circle (use radius instead of vertices)
    getLocalBounds() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = -1; i < 2; i+=2) {
            for (let j = -1; j < 2; j+=2) {
                let v = new Vec2(i * this._radius, j * this._radius);
                v.sub(this.anchorPosition);

                minX = Math.min(minX, v.x);
                maxX = Math.max(maxX, v.x);
                minY = Math.min(minY, v.y);
                maxY = Math.max(maxY, v.y);
            }
        }

        return new Rect(new Vec2(minX, minY), new Vec2(maxX, maxY));
    }

    getGlobalBounds() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = -1; i < 2; i+=2) {
            for (let j = -1; j < 2; j+=2) {
                let v = new Vec2(i * this._radius, j * this._radius);
                v.sub(this.anchorPosition);
                v.applyMatrix3(this.worldMatrix);

                minX = Math.min(minX, v.x);
                maxX = Math.max(maxX, v.x);
                minY = Math.min(minY, v.y);
                maxY = Math.max(maxY, v.y);
            }
        }

        return new Rect(new Vec2(minX, minY), new Vec2(maxX, maxY));
    }

    containsPoint(p) {
        p = this.worldToLocal(p);
        const distSq = p.x ** 2 + p.y ** 2;

        return distSq <= this._radius ** 2;
    }
}