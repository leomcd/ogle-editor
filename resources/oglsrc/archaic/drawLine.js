import { Plane } from '../extras/Plane.js';
import { Color } from '../math/Color.js';
import { Mat4 } from '../math/Mat4.js';
import { Vec2 } from '../math/Vec2.js';
import { Vec3 } from '../math/Vec3.js';
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

export function drawLine(camera, {start = new Vec2(0,0), end = new Vec2(0,0), color = new Color("black"), strokeWidth = 0.05, extend = true}) {
    const midPoint = new Vec3();
    midPoint.x = (start.x + end.x) / 2;
    midPoint.y = (start.y + end.y) / 2;

    const direction = new Vec2();
    direction.copy(end);
    direction.sub(start);
    const angle = Math.atan2(direction.y, direction.x);

    let width = direction.len();
    if (extend) width += strokeWidth;
    const selectionRect = new Plane({width, height: strokeWidth});
    
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
    ccp.translate(midPoint);
    ccp.rotate(angle, new Vec3(0,0,1));
    program.uniforms.modelViewMatrix = {value: ccp};

    program.uniforms.shapeColor = {value: color};

    program.use({ flipFaces: false });
    selectionRect.draw({ program });
}
