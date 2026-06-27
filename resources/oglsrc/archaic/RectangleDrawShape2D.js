import { Plane2D } from "../extras/Plane2D.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { DrawShape2D } from "./DrawShape2D.js";
import { Program } from "../core/Program.js";

const vertex1 = `
    //attribute vec2 uv;
    attribute vec2 position;

    uniform mat3 cameraMatrix;
    uniform mat3 drawableMatrix;
    uniform float zPosition;

    //varying vec2 vUv;

    void main() {
        //vUv = uv;
        
        vec3 p = cameraMatrix * drawableMatrix * vec3(position, 1.0);
        p.z = zPosition;

        gl_Position = vec4(p.xyz, 1.0);
    }
`;

const fragment1 = `
precision highp float;

//varying vec2 vUv;

uniform vec4 color;

void main() {
    gl_FragColor = color;
}
`;

export class RectangleDrawShape2D extends DrawShape2D {
    constructor(rect, color, drawable) {
        const geometry = new Plane2D({rect});

        const program = new Program({
            vertex: vertex1,
            fragment: fragment1,
            transparent: true,
            cullFace: false
        });

        super(geometry, program, color);

        this._rect = rect;

        this.drawable = drawable;
    }

    containsPoint(p) {
        const transformedPoint = new Vec2();
        transformedPoint.copy(p);

        this.drawable.worldToLocal(transformedPoint);

        return this._rect.containsPoint(transformedPoint);
    }
}