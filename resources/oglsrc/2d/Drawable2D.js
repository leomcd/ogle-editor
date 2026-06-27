import { Transform2D } from './Transform2D.js';
import { Mat3 } from '../math/Mat3.js';
import { Vec2 } from '../math/Vec2.js';
import { Rect } from '../math/Rect.js';
import { Color } from '../math/Color.js';

export class Drawable2D extends Transform2D { //2d version of mesh
    constructor() {
        super();

        this.geometry = null;
        this.outlineGeometry = null;
        this.program = null;
        this.color = new Color(0.5, 0.5, 1, 1);
        this.zPosition = 0;
        this.frustumCulled = true;

        this.drawableUniforms = {};
    }

    draw({ camera2D } = {}) { //draw function called by the renderer
        const c = new Mat3();
        c.copy(camera2D.viewMatrix);
        c.multiply(this.worldMatrix);

        const geometry = this.geometry;
        const color = this.color;
        const program = this.program;
        // Set the matrix uniforms
        Object.assign(program.uniforms, this.drawableUniforms);
        program.uniforms.cameraMatrix = { value: camera2D.projectionMatrix };
        program.uniforms.drawableMatrix = { value: c };
        program.uniforms.zPosition = { value: this.zPosition };
        program.uniforms.color = { value: color };
        program.use({ flipFaces: false });
        
        geometry.draw({ program });
    }

    containsPoint(p) {
        throw new Error("Not implemented");
    }

    getLocalBounds() {
        throw new Error("Not implemented");
    }

    getGlobalBounds() {
        throw new Error("Not implemented");
    }
}