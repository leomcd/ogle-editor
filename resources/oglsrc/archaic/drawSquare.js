import { Plane } from '../extras/Plane.js';
import { Color } from '../math/Color.js';
import { Mat4 } from '../math/Mat4.js';
import { Vec2 } from '../math/Vec2.js';
import { Vec3 } from '../math/Vec3.js';
import { Vec4 } from '../math/Vec4.js';
import { Program } from './Program.js';

const selectionVertex = `
    attribute vec2 uv;
    attribute vec3 position;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        p.z = -1.0; //keep object in front of everything else

        gl_Position = p;
    }
`;

const selectionFragment = `
precision highp float;

varying vec2 vUv;

uniform vec4 shapeColor;

void main() {
    gl_FragColor = shapeColor;
}
`;

export function drawSquare(camera, {position = new Vec2(0, 0), size = new Vec2(1, 1), color = new Color("black"), fill = true, strokeWidth = 0.02}) {
    if (fill) {
        const selectionRect = new Plane({width: size.x, height: size.y});
    
        const program = new Program({
            vertex: selectionVertex,
            fragment: selectionFragment,
            transparent: true,
            cullFace: false
        });
    
        // Set the matrix uniforms
        program.uniforms.projectionMatrix = {value: camera.projectionMatrix};
    
        let ccp = new Mat4();
        ccp.multiply(camera.viewMatrix);
        ccp.translate(new Vec3(position.x, position.y, 0));
        program.uniforms.modelViewMatrix = {value: ccp};
    
        program.uniforms.shapeColor = {value: color};
    
        program.use({ flipFaces: false });
        selectionRect.draw({ program });
    } else {
        drawLine(camera, {
            start: new Vec2(position.x - size.x / 2, position.y - size.y / 2),
            end: new Vec2(position.x + size.x / 2, position.y - size.y / 2),
            color,
            strokeWidth,
            extend: true
        });
        drawLine(camera, {
            start: new Vec2(position.x + size.x / 2, position.y - size.y / 2),
            end: new Vec2(position.x + size.x / 2, position.y + size.y / 2),
            color,
            strokeWidth,
            extend: true
        });
        drawLine(camera, {
            start: new Vec2(position.x + size.x / 2, position.y + size.y / 2),
            end: new Vec2(position.x - size.x / 2, position.y + size.y / 2),
            color,
            strokeWidth,
            extend: true
        });
        drawLine(camera, {
            start: new Vec2(position.x - size.x / 2, position.y + size.y / 2),
            end: new Vec2(position.x - size.x / 2, position.y - size.y / 2),
            color,
            strokeWidth,
            extend: true
        });
    }
}
