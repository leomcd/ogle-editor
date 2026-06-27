import { Geometry } from '../core/Geometry.js';
import { Vec3 } from '../math/Vec3.js';

export class Circle extends Geometry {
    constructor(
        {
            radius = 0.5,
            segments = 32,
            attributes = {},
        } = {}
    ) {
        if (segments < 3) throw new Error("Need at least 3 segments in a circle");

        const num = segments;
        const numIndices = 3 * segments;

        const position = new Float32Array(num * 2);
        //const normal = new Float32Array(num * 2);
        //const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        position[0] = 0;
        position[1] = 0;

        for (let i = 1; i < num + 1; i++) {
            const a = (i - 1) / (num - 1);

            position[i*2] = Math.cos(a * 2 * Math.PI) * radius;
            position[i*2 + 1] = Math.sin(a * 2 * Math.PI) * radius;
        }

        for (let j = 0; j < num + 1; j++) {
            index[j * 3] = 0;
            index[j * 3 + 1] = j + 1;
            index[j * 3 + 2] = (j !== num - 2) ? j + 2 : 1;
        }

        Object.assign(attributes, {
            position: { size: 2, data: position },
            //normal: { size: 2, data: normal },
            //uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(attributes);
    }
}
