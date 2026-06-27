import { Geometry } from '../core/Geometry.js';
import { Vec2 } from '../math/Vec2.js';

// TODO: fix geometry not getting gl context

function getNormalVec(p1, p2) {
    const difVec = new Vec2();
    difVec.copy(p2);
    difVec.sub(p1);
    difVec.normalize();
    return new Vec2(-difVec.y,difVec.x);
}

function lineIntersection(l1p1, l1p2, l2p1, l2p2) {
    const denom = (l1p1.x - l1p2.x) * (l2p1.y - l2p2.y) - (l1p1.y - l1p2.y) * (l2p1.x - l2p2.x);
  
    if (denom === 0) {
      return null; // No intersection or lines are parallel
    }
  
    const intersectX = ((l1p1.x * l1p2.y - l1p1.y * l1p2.x) * (l2p1.x - l2p2.x) - (l1p1.x - l1p2.x) * (l2p1.x * l2p2.y - l2p1.y * l2p2.x)) / denom;
    const intersectY = ((l1p1.x * l1p2.y - l1p1.y * l1p2.x) * (l2p1.y - l2p2.y) - (l1p1.y - l1p2.y) * (l2p1.x * l2p2.y - l2p1.y * l2p2.x)) / denom;
  
    return new Vec2(intersectX, intersectY);
  }

export class LineGeometry2D extends Geometry {
    constructor({ points, closed, lineWidth, attributes = {} } = {}) {
        // Generate empty arrays once
        const position = new Float32Array(points.length * 2 * 2);
        //const normal = new Float32Array(num * 2);
        //const uv = new Float32Array(8);
        const index = new Uint16Array((points.length - (closed ? 0 : 1)) * 2 * 3);

        LineGeometry2D.buildLine(position, index, points, closed, lineWidth);

        Object.assign(attributes, {
            position: { size: 2, data: position },
            //normal: { size: 2, data: normal },
            //uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(attributes);
    }

    static buildLine(position, index, points, closed, lineWidth) {
        const hlw = lineWidth / 2;

        for (let i = 0; i < points.length; i++) {
            let j = i*4;

            const pl = points[(i-1+points.length)%points.length]
            const p = points[i];
            const pn = points[(i+1)%points.length]
            
            const n1 = getNormalVec(pl, p).multiply(hlw);
            const n2 = getNormalVec(p, pn).multiply(hlw);
            
            // upper intersection
            const l1p1 = (new Vec2()).copy(pl).add(n1);
            const l1p2 = (new Vec2()).copy(p).add(n1);
            const l2p1 = (new Vec2()).copy(p).add(n2);
            const l2p2 = (new Vec2()).copy(pn).add(n2);
            
            // lower
            const l3p1 = (new Vec2()).copy(pl).sub(n1);
            const l3p2 = (new Vec2()).copy(p).sub(n1);
            const l4p1 = (new Vec2()).copy(p).sub(n2);
            const l4p2 = (new Vec2()).copy(pn).sub(n2);

            if (!closed) {
                if (i === 0) {
                    // use only p, pn (l2p1, l4p1)
                    position[j] = l2p1.x;
                    position[j+1] = l2p1.y;
                    position[j+2] = l4p1.x;
                    position[j+3] = l4p1.y;

                    continue;
                } else if (i === points.length - 1) {
                    // use only pl, p (l1p2, l3p2)
                    position[j] = l1p2.x;
                    position[j+1] = l1p2.y;
                    position[j+2] = l3p2.x;
                    position[j+3] = l3p2.y;

                    break;
                }
            }

            const intersection1 = lineIntersection(l1p1, l1p2, l2p1, l2p2); // upper
            const intersection2 = lineIntersection(l3p1, l3p2, l4p1, l4p2); // lower

            if (!intersection1 || !intersection2) { // pl, p, pn form a straight line
                // l1p2 and l2p1 are basically the same, so use l1p2
                // same with lower, use l3p2
                position[j] = l1p2.x;
                position[j+1] = l1p2.y;
                position[j+2] = l3p2.x;
                position[j+3] = l3p2.y;
            } else {
                position[j] = intersection1.x;
                position[j+1] = intersection1.y;
                position[j+2] = intersection2.x;
                position[j+3] = intersection2.y;
            }
        }

        for (let i = 0; i < (points.length - (closed ? 0 : 1)); i++) {
            let j = i * 6;
            if (i===(points.length-1)) {
                // wraparound (i*2+2->0, i*2+3->1)
                index[j] = i*2;
                index[j+1] = i*2+1;
                index[j+2] = 0;
                index[j+3] = i*2+1;
                index[j+4] = 1;
                index[j+5] = 0;
                continue;
            }
            //index for current p top is i*2
            //current p bottom is i*2+1
            //next p top is i*2+2
            //next p bottom is i*2+3
            index[j] = i*2;
            index[j+1] = i*2+1;
            index[j+2] = i*2+2;
            index[j+3] = i*2+1;
            index[j+4] = i*2+3;
            index[j+5] = i*2+2;
        }
    }
}
