import { Plane } from '../extras/Plane.js';
import { Mesh } from './Mesh.js';
import { Program } from './Program.js';
import { TextureLoader } from '../extras/TextureLoader.js';

const vertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec3 position;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;

    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;

export class Sprite extends Mesh {
    #texture = null;

    static editorProperties = [];

    constructor(name, parent = null) {
        super({ geometry: new Plane({width:1, height:1}), program: new Program({
            vertex,
            fragment,
            uniforms: {
                tMap: { value: TextureLoader.load({src: 'grimacing-face.png'})},
            },
            cullFace: null,
            transparent: true,
        }) });
    }
    get texture() {
        return this.#texture;
    }
    set texture(value) {
        this.setTexture(value);
    }
    setTexture(value) {
        this.#texture = value;
        this.program = new Program({
            vertex,
            fragment,
            uniforms: {
                tMap: { value: this.#texture },
            },
            cullFace: null,
            transparent: true,
        });
    }
}

/*
this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};
*/