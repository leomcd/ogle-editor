import { Tool } from "./Tool.js";
import { Rectangle2D, Color, Rect, Drawable2D, Vec2 } from "../../index.mjs";

//TODO: move this into a mouse class
let mousePos = null;

export class PointerTool extends Tool {
    constructor(...args) {
        super("pointer", ...args);

        this.rect = new Rectangle2D();
        this.rect.color = new Color(0.3, 0.3, 1, 0.3);
        this.rect.parent = this.layer;

        this.selectingCanvas = false;
        this.draggingNode = false; //mb1 held on node

        this.selectionStart = null;

        this.scrollZoomMultiplier = 1.1;
        this.scrollZoomMax = 20;
        this.scrollZoomMin = 0.1;
    }

    mouseDown(button) {
        if (button !== 0) return;

        const res = this.checkMousecastObject();

        if (res === null) this.editor.sceneManager.canvasDeselected(); //TODO: Maybe change deselected to selected([])

        if (res && !this.editor.sceneManager.selectedNodeIDList.includes(res.nodeID)) {
            this.editor.sceneManager.canvasSelectedNode([res.nodeID]);
        }

        if (this.editor.sceneManager.selectedNodeIDList.length === 0) {
            this.selectingCanvas = true;
            this.selectionStart = (new Vec2()).copy(this.editor.utils.worldMouse());        
        } else {
            this.draggingNode = true;
        }
    }

    mouseMoved(dx, dy) {
        mousePos = this.editor.utils.worldMouse();
        
        if (this.selectingCanvas) {
            this.checkSelectionRect();
        }
        else if (this.draggingNode) {
            for (const node of this.editor.sceneManager.getSelectedNodes()) {
                const cam2D = this.editor.stageManager.editorCamera2D;
                node.position.x += dx / cam2D.zoom * 2;
                node.position.y -= dy / cam2D.zoom * 2;
            }
        }
    }

    mouseUp(button) {
        if (button !== 0) return;

        this.selectingCanvas = false;
        this.draggingNode = false;
    }

    update() {
        if (this.selectingCanvas) {
            const r = new Rect(mousePos, this.selectionStart);
            r.fix();
            this.rect.setByRect(r);
            this.rect.visible = true;
        } else this.rect.visible = false;
    }

    checkSelectionRect() {
        let nodes = [];
        function rec(o) {
            if (o instanceof Drawable2D && o.visible) nodes.push(o);
            o.children.forEach(rec);
        }
        const rootNode = this.editor.sceneManager.rootNode;
        if (rootNode) rec(rootNode);
    
        let res = [];
    
        const selectionRect = new Rect(this.selectionStart, mousePos);
        selectionRect.fix();
        nodes.forEach(node => {
            if (selectionRect.containsRect(node.getGlobalBounds())) res.push(node.nodeID);
        });
    
        this.editor.sceneManager.canvasSelectedNode(res);
    }
    
    //TODO: change to checkMouseoverObject
    checkMousecastObject() {
        const coords = this.editor.utils.worldMouse()
    
        let nodes = [];
        function rec(o) {
            if (o instanceof Drawable2D && o.visible) nodes.push(o);
            o.children.forEach(rec);
        }
        const rootNode = this.editor.sceneManager.rootNode;
        if (rootNode) rec(rootNode);
    
        let res = null;
        nodes.forEach(drawable => {
            if (drawable.containsPoint(coords)) res = drawable;
        });
    
        return res;
    }
}
