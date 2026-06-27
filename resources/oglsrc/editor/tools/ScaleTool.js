import { Rectangle2D, Transform2D, Vec2, Color, Mat3, Rect } from "../../index.mjs";
import { Tool } from "./Tool.js";

const SIZE1 = 100
const SIZE2 = 8

export class ScaleTool extends Tool {
    constructor(...args) {
        super("scale", ...args);

        this.arrows = new Transform2D();
        this.arrows.parent = this.layer;
        this.arrowX = new Rectangle2D();
        this.arrowY = new Rectangle2D();

        this.arrowX.rectSize = new Vec2(SIZE1, SIZE2);
        this.arrowX.parent = this.arrows;
        this.arrowX.color = new Color(1,0,0,1);
        this.arrowX.anchorPosition.y = SIZE2 / 2;

        this.arrowY.rectSize = new Vec2(SIZE2, SIZE1);
        this.arrowY.parent = this.arrows;
        this.arrowY.color = new Color(0,1,0,1);
        this.arrowY.anchorPosition.x = SIZE2 / 2;

        this.arrowPressed = null;
    }

    mouseDown(button) {
        if (button === 0) {
            let mouseFixed = new Vec2();
            mouseFixed.copy(this.editor.stageManager.inputManager.mousePosition);
            mouseFixed = this.editor.utils.canvasTo2DWorld(mouseFixed);
            if (this.arrowX.containsPoint(mouseFixed)) this.arrowPressed = this.arrowX;
            else if (this.arrowY.containsPoint(mouseFixed)) this.arrowPressed = this.arrowY;
            else this.arrowPressed = true;
        }
    }

    mouseMoved(dx, dy) {
        let mouseFixed = new Vec2();
        mouseFixed.copy(this.editor.stageManager.inputManager.mousePosition);
        mouseFixed = this.editor.utils.canvasTo2DWorld(mouseFixed);

        const refNode = this.editor.sceneManager.getSelectedNodes()[0];
        const bounds = refNode.getLocalBounds ? refNode.getLocalBounds() : new Rect(0, 0, 100, 100);

        if (this.arrowPressed !== null) {
            const cam2D = this.editor.stageManager.editorCamera2D;
            const zoomAdjustedDx = dx / cam2D.zoom * 2; // TODO: WHY 2
            const zoomAdjustedDy = dy / cam2D.zoom * 2; // TODO: Make arrows point in rotation

            if (this.arrowPressed === this.arrowX) {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.scale.x += zoomAdjustedDx / bounds.size.x;
                }
            } else if (this.arrowPressed === this.arrowY) {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.scale.y -= zoomAdjustedDy / bounds.size.y;
                }
            } else /*arrowpressed === true*/ {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.scale.x += zoomAdjustedDx / bounds.size.x;
                    node.scale.y -= zoomAdjustedDy / bounds.size.y;
                }
            }
        }
        else {
            let mouseFixed = new Vec2();
            mouseFixed.copy(this.editor.stageManager.inputManager.mousePosition);
            mouseFixed = this.editor.utils.canvasTo2DWorld(mouseFixed);
            if (this.arrowX.containsPoint(mouseFixed)) {
                this.arrowX.rectSize.x = SIZE1 + 4;
                this.arrowX.rectSize.y = SIZE2 + 4;
            } else {this.arrowX.rectSize.x = SIZE1; this.arrowX.rectSize.y = SIZE2}
            if (this.arrowY.containsPoint(mouseFixed)) {
                this.arrowY.rectSize.x = SIZE2 + 4;
                this.arrowY.rectSize.y = SIZE1 + 4;
            } else {this.arrowY.rectSize.x = SIZE2; this.arrowY.rectSize.y = SIZE1}
        }
    }

    mouseUp(button) {
        if (button === 0) this.arrowPressed = null;
    }

    update() {
        if (this.editor.sceneManager.getSelectedNodes().length !== 0) {
            this.arrows.visible = true;
            const selNode = this.editor.sceneManager.getSelectedNodes()[0];
            this.arrows.globalPosition = selNode.globalPosition;
            this.arrows.globalRotation = selNode.globalRotation;
            this.arrows.scale.normalize().multiply(1 / this.editor.stageManager.editorCamera2D.zoom);
        } else {
            this.arrows.visible = false;
        }
    }
}
