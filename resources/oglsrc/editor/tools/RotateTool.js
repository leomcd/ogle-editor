import { Rectangle2D, Transform2D, Vec2, Color, Rect } from "../../index.mjs";
import { Tool } from "./Tool.js";

export class RotateTool extends Tool {
    constructor(...args) {
        super("rotate", ...args);

        this.dragRect = new Rectangle2D();
        this.dragRect.rectSize.y = 4;
        this.dragRect.parent = this.layer;
        this.dragRect.visible = false;

        this.lastRot = null;
    }

    update() {
        const inputManager = this.editor.stageManager.inputManager;
        if (this.editor.sceneManager.getSelectedNodes().length !== 0 && inputManager.mousePressed[0]) {
            this.dragRect.visible = true;

            this.dragRect.extendToPoints(this.editor.sceneManager.getSelectedNodes()[0].globalPosition, this.editor.utils.worldMouse());
            
            if (this.lastRot === null) this.lastRot = this.dragRect.rotation;
            this.editor.sceneManager.getSelectedNodes().forEach(o => {o.rotation += this.dragRect.rotation - this.lastRot});
            this.lastRot = this.dragRect.rotation;
        } else {
            this.dragRect.visible = false;
            this.lastRot = null;
        }
    }
}
