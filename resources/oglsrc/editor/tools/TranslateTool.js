import { Rectangle2D, Transform2D, Vec2, Color, Rect } from "../../index.mjs";
import { Tool } from "./Tool.js";

const SIZE1 = 100
const SIZE2 = 8

export class TranslateTool extends Tool {
    constructor(...args) {
        super("translate", ...args);

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
        if (this.arrowPressed !== null) {
            const cam2D = this.editor.stageManager.editorCamera2D;
            const mul = 2 / cam2D.zoom; // TODO: Make arrows point in rotation
            if (this.arrowPressed === this.arrowX) {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.position.x += dx * mul;
                }
            } else if (this.arrowPressed === this.arrowY) {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.position.y -= dy * mul;
                }
            } else /*arrowpressed === true*/ {
                for (const node of this.editor.sceneManager.getSelectedNodes()) {
                    node.position.x += dx * mul;
                    node.position.y -= dy * mul;
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
