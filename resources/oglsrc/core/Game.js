import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Transform } from './Transform.js';
import { getGlContext } from './Canvas.js';
import { PhysicsEngine2D } from '../physics2d/PhysicsEngine2D.js';
import { InputManager } from './InputManager.js';
import { Transform2D } from '../index.mjs';

let then = 0;
let dt = 0;

export class Game {
    #time = 0.0;
    #scene = null;
    activeCamera = null;
    activeCamera2D = null;

    constructor({scene = new Transform2D(), canvas, autoCreateRenderer = true }) {
        this.setScene(scene);

        this.renderer = autoCreateRenderer ? new Renderer(this, {alpha: false, premultipliedAlpha: false}, canvas) : null;
        this.physicsEngine2D = new PhysicsEngine2D(this);
        this.inputManager = new InputManager();

        this.running = false;
    }

    get time() {
        return this.#time;
    }

    mainloop() {
        then = document.timeline.currentTime * 0.001;

        this.running = true;

        this.scene.broadcast('start');

        requestAnimationFrame((now) => {this.loop(now);})
    }

    loop(now) {
        if (!this.running) return;

        now *= 0.001;
        dt = now - then;
        then = now;

        this.#time += dt;

        this.scene.broadcast('update',dt);

        this.physicsEngine2D._update(dt);

        this.renderer.renderSceneCamera();
        
        requestAnimationFrame((now) => {this.loop(now);})
    }

    get scene() {
        return this.#scene;
    }
    setScene(scene) {
        if (scene.parent !== null) throw new Error("Scene (root node) must not have parents");

        this.#scene = scene;
        this.#scene.traverse(o => {
            o._game = this;
        })
    }
}