import { Transform2D } from './Transform2D.js';
import { Mat3 } from '../math/Mat3.js';
import { Vec2 } from '../math/Vec2.js';
import { Rect } from '../math/Rect.js';
import { RectangleDrawShape2D } from './RectangleDrawShape2D.js';

export class Drawable2D extends Transform2D { //2d version of mesh
    constructor() {
        super();

        //storing draw function calls by saving their geometries in this list instead of creating new geometries every update
        this.drawShapes = [];
        this.zPosition = 0;
        this.frustumCulled = true;

        this.setupDraw();
    }

    setupDraw() {}

    draw({ camera2D } = {}) { //draw function called by the renderer
        const c = new Mat3();
        c.copy(camera2D.viewMatrix);
        c.multiply(this.worldMatrix);

        this.drawShapes.forEach(drawShape => {
            const geometry = drawShape.geometry;
            const color = drawShape.color;
            const program = drawShape.program;
            // Set the matrix uniforms
            program.uniforms.cameraMatrix = { value: camera2D.projectionMatrix };
            
            program.uniforms.drawableMatrix = { value: c };
    
            program.uniforms.zPosition = { value: this.zPosition };
    
            program.uniforms.color = { value: color };
    
            program.use({ flipFaces: false });
            geometry.draw({ program });
        });
    }

    containsPoint(p) {
        let res = false;

        this.drawShapes.forEach(drawShape => {
            if (drawShape.containsPoint(p)) res = true;
        })

        return res;
    }

    getLocalBounds() {
        let i = 0;

        let vertex = new Vec2();

        let lowX = Infinity;
        let lowY = Infinity;
        let highX = -Infinity;
        let highY = -Infinity;

        this.drawShapes.forEach(drawShape => {
            drawShape.geometry.attributes.position.data.forEach(vertexComponent => {
                vertex[i] = vertexComponent;
    
                if (i === 1) {
                    lowX = Math.min(lowX, vertex.x);
                    lowY = Math.min(lowY, vertex.y);
                    highX = Math.max(highX, vertex.x);
                    highY = Math.max(highY, vertex.y);
                };
                i++
                if (i > 1) i = 0;
            });
        });
        
        return new Rect(new Vec2(lowX, lowY), new Vec2(highX, highY));
    }

    getGlobalBounds() {
        let i = 0;

        let vertex = new Vec2();

        let lowX = Infinity;
        let lowY = Infinity;
        let highX = -Infinity;
        let highY = -Infinity;

        this.drawShapes.forEach(drawShape => {
            drawShape.geometry.attributes.position.data.forEach(vertexComponent => {
                vertex[i] = vertexComponent;
    
                if (i === 1) {
                    vertex.applyMatrix3(this.worldMatrix);
    
                    lowX = Math.min(lowX, vertex.x);
                    lowY = Math.min(lowY, vertex.y);
                    highX = Math.max(highX, vertex.x);
                    highY = Math.max(highY, vertex.y);
                };
                i++
                if (i > 1) i = 0;
            });
        });
        
        return new Rect(new Vec2(lowX, lowY), new Vec2(highX, highY));
    }

    drawRectangle(rect, color) {
        this.drawShapes.push(new RectangleDrawShape2D(rect, color, this));
    }
}