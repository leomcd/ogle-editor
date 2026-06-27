import { Geometry } from '../core/Geometry.js';

// TODO: fix geometry not getting gl context

export class PlaneGeometry2D extends Geometry {
    constructor({ rect, attributes = {} } = {}) {
        // Generate empty arrays once
        const position = new Float32Array(8);
        //const normal = new Float32Array(num * 2);
        const uv = new Float32Array(8);
        const index = new Uint16Array(6);

        PlaneGeometry2D.buildPlane(position, index, uv, rect);

        Object.assign(attributes, {
            position: { size: 2, data: position },
            //normal: { size: 2, data: normal },
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(attributes);
    }

    static buildPlane(position, index, uv, rect) {
        position[0] = rect.position.x;
        position[1] = rect.position.y;
        
        position[2] = rect.position.x;
        position[3] = rect.end.y;

        position[4] = rect.end.x;
        position[5] = rect.end.y;

        position[6] = rect.end.x;
        position[7] = rect.position.y;

        index[0] = 0;
        index[1] = 1;
        index[2] = 2;
        index[3] = 0;
        index[4] = 3;
        index[5] = 2;

        uv[0] = 0;
        uv[1] = 0;
        uv[2] = 0;
        uv[3] = 1;
        uv[4] = 1;
        uv[5] = 1;
        uv[6] = 1;
        uv[7] = 0;
    }
}
