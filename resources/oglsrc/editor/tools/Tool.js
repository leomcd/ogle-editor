import { Layer } from "../../core/Layer.js";
import { Vec2, Mat3 } from "../../index.mjs";

// TODO: let tools define shortcuts using the shortcut manager and rewrite all the tools
// to use it instead of HTML cursor events

const EDITOR_GUI_LAYER_INDEX = 1024;

export class Tool {
    constructor(name, editor) {
        this.name = name;
        this.editor = editor;
        this.layer = new Layer();
        this.layer.layerIdx = EDITOR_GUI_LAYER_INDEX;
    }
    draw() { // dont override
        const stageManager = this.editor.stageManager;
        stageManager.renderer.render({ scene: this.layer, camera2D: stageManager.game.activeCamera2D, clear: false });
    }

    // override the following
    update() {}

    keyDown(keyCode) {}
    keyUp(keyCode) {}
    keyPressed(keyCode) {}

    clicked(button) {}
    mouseMoved() {}
    mouseDragged() {}
    mouseDown(button) {}
    mouseUp(button) {}
    wheel(deltaY) {}
}