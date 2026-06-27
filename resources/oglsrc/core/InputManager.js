import { Signal } from "./Signal.js";
import { Vec2 } from "../math/Vec2.js";

export class InputManager {
    #keys = {};
    constructor(doc = document) {
        doc.addEventListener("keydown", (event) => {this.processKeyDown(event)});
        doc.addEventListener("keyup", (event) => {this.processKeyUp(event)});
        doc.addEventListener("keypress", (event) => {this.processKeyPress(event)});

        doc.addEventListener("click", (event) => {this.processClick(event)});
        doc.addEventListener("mousemove", (event) => {this.processMouseMove(event)});
        doc.addEventListener("drag", (event) => {this.processMouseDrag(event)});
        doc.addEventListener("mousedown", (event) => {this.processMouseDown(event)});
        doc.addEventListener("mouseup", (event) => {this.processMouseUp(event)});
        doc.addEventListener("wheel", (event) => {this.processWheel(event)});

        this.keyDown = new Signal();
        this.keyUp = new Signal();
        this.keyPressed = new Signal();

        this.clicked = new Signal();
        this.mouseMoved = new Signal();
        this.mouseDragged = new Signal();
        this.mouseDown = new Signal();
        this.mouseUp = new Signal();
        this.wheel = new Signal();

        this._mousePressed = [false, false, false];

        this._mousePosition = new Vec2();
        // TODO: change to canvasMousePosition
        // TODO: add world2DMousePosition
    }

    get mousePressed() {
        // TODO: change this once transpiling is done
        const arr = Array.from(this._mousePressed);
        Object.freeze(arr);
        return arr;
    }

    get mousePosition() {
        const frozen = (new Vec2()).copy(this._mousePosition);
        Object.freeze(frozen);
        return frozen;
    } //no setter because may not change externally (outside of this class)

    processKeyDown(event) { //TODO: figure out if we need to put preventdefault here
        this.#keys[event.code] = true;
        this.keyDown.fire(event.code);
    }
    processKeyUp(event) {
        this.#keys[event.code] = false;
        this.keyUp.fire(event.code);
    }
    processKeyPress(event) {
        this.keyPressed.fire(event.code);
    }
    processClick(event) {
        this.clicked.fire(event.button);
    }
    processMouseMove(event) {
        this._mousePosition.set(event.clientX, event.clientY);

        this.mouseMoved.fire(event.movementX, event.movementY);
    }
    processMouseDrag(event) { //TODO: this is just mousemove + clicked do we need this
        this._mousePosition.set(event.clientX, event.clientY);

        this.mouseDragged.fire(event.movementX, event.movementY);

        throw new Error("something got dragged");
    }
    processMouseDown(event) {
        this._mousePressed[event.button] = true;
        this.mouseDown.fire(event.button);
    }
    processMouseUp(event) {
        this._mousePressed[event.button] = false;
        this.mouseUp.fire(event.button);
    }
    processWheel(event) {
        this.wheel.fire(event.deltaY);
    }
    getInput(code) {
        return (this.#keys[code] === true);
    }
}