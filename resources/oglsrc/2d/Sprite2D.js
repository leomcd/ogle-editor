import { PlaneGeometry2D } from "../extras/PlaneGeometry2D.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { Drawable2D } from "./Drawable2D.js";
import { Program } from "../core/Program.js";
import { TextureLoader } from "../extras/TextureLoader.js";

const vertex12 = `
    attribute vec2 uv;
    attribute vec2 position;

    uniform vec2 rectSize;
    uniform vec2 anchorPosition;
    uniform mat3 cameraMatrix;
    uniform mat3 drawableMatrix;
    uniform float zPosition;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        
        vec2 p2 = vec2(position.x * rectSize.x, position.y * rectSize.y);
        p2 -= anchorPosition;

        vec3 p3 = cameraMatrix * drawableMatrix * vec3(p2, 1.0);
        p3.z = zPosition;

        gl_Position = vec4(p3, 1.0);
    }
`;

const fragment12 = `
precision highp float;

varying vec2 vUv;
uniform sampler2D tMap;
uniform vec4 color;

void main() {
    gl_FragColor = texture2D(tMap, vUv);
}
`;

export class Sprite2D extends Drawable2D {
    static editorProperties = [["rectSize",true,"vector2"]];

    constructor() {
        super();

        this._rectSize = new Vec2(100, 100);
        this._rectSize.onChange.add(() => {
            this.updateDrawableUniforms();
        });

        this._anchorPosition = new Vec2(0, 0);
        this._anchorPosition.onChange.add(() => {
            this.updateDrawableUniforms();
        });

        this.updateGeometry();

        this.program = new Program({
            vertex: vertex12,
            fragment: fragment12,
            transparent: true,
            cullFace: false,
        });

        this.drawableUniforms = {
            rectSize: { value: this._rectSize },
            anchorPosition: { value: this._anchorPosition },
            tMap: { value: TextureLoader.load({src: 'grimacing-face.png'})},
        };
    }

    containsPoint(p) {
        const transformedPoint = new Vec2();
        transformedPoint.copy(p);

        this.worldToLocal(transformedPoint);

        return this._rect.containsPoint(transformedPoint);
    }

    updateGeometry() {
        this.geometry = new PlaneGeometry2D({ rect: new Rect({ start: new Vec2(0, 0), end: new Vec2(1, 1) }) });
    }

    updateDrawableUniforms() {
        this.drawableUniforms.rectSize.value = this.rectSize;
        this.drawableUniforms.anchorPosition.value = this.anchorPosition;
    }

    get rectSize() {
        return this._rectSize;
    }
    set rectSize(value) {
        this._rectSize.set(value);
    }

    get anchorPosition() {
        return this._anchorPosition;
    }
    set anchorPosition(value) {
        this._anchorPosition.set(value);
    }

    setByRect(rect) {
        this.anchorPosition = new Vec2();
        this.position = rect.position;
        this.rectSize = rect.size;
    }

    getLocalBounds() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let v = new Vec2(i * this.rectSize.x, j * this.rectSize.y);
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
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let v = new Vec2(i * this.rectSize.x, j * this.rectSize.y);
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

        return this.getLocalBounds().containsPoint(p);
    }
}