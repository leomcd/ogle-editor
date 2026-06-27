//TODO: figure out whether to put the default shortcuts here
// this "tool" is always active, though it is not selected

import { Vec2, Mat3 } from "../../index.mjs";
import { Tool } from "./Tool.js";

let mousePos = null;

export class PanTool extends Tool {
    constructor(...args) {
        super("pan", ...args);

        this.draggingCanvas = false;

        this.scrollZoomMultiplier = 1.1;
        this.scrollZoomMax = 20;
        this.scrollZoomMin = 0.1;
    }

    mouseDown(button) {
        if (button === 1) // this tool uses the middle mouse button
            this.draggingCanvas = true;
    }

    mouseMoved(dx, dy) {
        mousePos = this.editor.utils.worldMouse()

        if (this.draggingCanvas) this.dragCanvas(dx, dy);
    }

    mouseUp(button) {
        if (button === 1) this.draggingCanvas = false;
    }

    wheel(deltaY) {
        mousePos = this.editor.utils.worldMouse()
        const v = new Vec2();
        v.copy(mousePos);

        const cam = this.editor.stageManager.editorCamera2D;
        
        if (deltaY > 0) {
            cam.zoom /= this.scrollZoomMultiplier;
        } else {
            cam.zoom *= this.scrollZoomMultiplier;
        }

        //TODO:make !!! automattic (any changes to the camerica updates viewmatrix)
        cam.generateViewMatrix();
        mousePos = this.editor.utils.worldMouse()

        v.sub(mousePos);
        //v.multiply(k);
        cam.position.add(v);

        cam.zoom = Math.max(Math.min(cam.zoom, this.scrollZoomMax), this.scrollZoomMin);

        //twice
        cam.generateViewMatrix();
    }

    dragCanvas(dx, dy) {
        const cam = this.editor.stageManager.editorCamera2D;
        cam.position.x -= dx / (cam.zoom) * 2;
        cam.position.y += dy / (cam.zoom) * 2;
    }
}