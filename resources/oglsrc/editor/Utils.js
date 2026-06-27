import { Mat3, Vec2 } from "../index.mjs";

export class Utils {
    constructor(editor) {
        this.editor = editor;
    }

    normalizeCanvasCoordinates(v) {
        const canvas = this.editor.stageManager.editorCanvas;
        return new Vec2((v.x / canvas.clientWidth - 0.5) * 2, ((1 - v.y / canvas.clientHeight) - 0.5) * 2);
    }

    canvasTo2DWorld(v) { //TODO: FIX THIS 
        v = this.normalizeCanvasCoordinates(v); //putting in center
        const m = new Mat3();
        m.copy(this.editor.stageManager.editorCamera2D.projectionViewMatrix);
        m.inverse();
        v.applyMatrix3(m);
        return v; // TODO: put all this is inputmanager
    }

    worldMouse() {
        return this.canvasTo2DWorld(this.editor.stageManager.inputManager.mousePosition);
    }
}