import { LineGeometry2D } from "../extras/LineGeometry2D.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { Drawable2D } from "./Drawable2D.js";
import { Program } from "../core/Program.js";
import { detectableArray } from "../core/Utils.js";

const vertex1 = `
    attribute vec2 position;

    uniform mat3 cameraMatrix;
    uniform mat3 drawableMatrix;
    uniform float zPosition;

    void main() {
        vec3 p3 = cameraMatrix * drawableMatrix * vec3(position, 1.0);
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

export class Line2D extends Drawable2D {
    static editorProperties = [];

    constructor() {
        super();

        this._points = null;
        this.points = [];

        this._closed = true;
        this._lineWidth = 10;

        this.updateGeometry();

        this.program = new Program({
            vertex: vertex1,
            fragment: fragment1,
            transparent: true,
            cullFace: false
        });

        this.drawableUniforms = {};
    }

    addPoint(a) {
        if (!(a instanceof Vec2)) a = new Vec2(...a);
        this.points.push(a);
    }

    draw(...args) {
        if (this.geometry) super.draw(...args);
    }

    containsPoint(p) {
        const transformedPoint = new Vec2();
        transformedPoint.copy(p);

        this.worldToLocal(transformedPoint);
        return false;
        return this._rect.containsPoint(transformedPoint);
    }

    updateGeometry() {
        if (this.points.length < 2) return;
        console.log(this.points);
        this.geometry = new LineGeometry2D({ points: this._points, closed: this._closed, lineWidth: this._lineWidth });
    }

    updateDrawableUniforms() {
        
    }

    getLocalBounds() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let v = new Vec2(i, j);

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
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let v = new Vec2(i, j);
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

        return this.getLocalBounds().fix().containsPoint(p);
    }

    get points() {
        return this._points;
    }
    set points(v) {
        this._points = detectableArray(v);
        this._points.onChange.add(() => this.updateGeometry());
        this.updateGeometry();
    }

    get closed() {
        return this._closed;
    }
    set closed(v) {
        this._closed = v;
        this.updateGeometry();
    }

    get lineWidth() {
        return this._lineWidth;
    }
    set lineWidth(v) {
        this._lineWidth = v;
        this.updateGeometry();
    }
}