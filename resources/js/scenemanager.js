import * as oglClasses from "../oglsrc/index.mjs";
import { EditorGame } from "../oglsrc/editor/EditorGame.js";
import { getPrototypeChain } from "./PropertiesManager.js";

import { Color, Euler, Rect, Vec2, Vec3, Vec4, Mat3, Mat4, Quat } from "../oglsrc/index.mjs";

const modeElements = document.getElementsByClassName("mode");

//TODO: rootNode doesnt have an id and therefore cannot be interacted with
//TODO: in a selection rect, it goes in order of id instead of which was selected first (nonissue?)

const getProtChainEditable = protChain => {
    const arr = [];
    for (const cls of protChain) {
        if (cls.editorProperties)
            for (const ep of cls.editorProperties)
                arr.push(ep[0]);
    }

    return arr;
}

const mathClasses = [Color, Euler, Rect, Vec2, Vec3, Vec4, Mat3, Mat4, Quat];
const isMathInstance = obj => {
    for (const cls of mathClasses) {
        if (obj instanceof cls) return true;
    }
    return false;
}

export class SceneManager {
    constructor(editor) {
        this.editor = editor;

        this.scenePath = null;
        this.sceneJSON = null;

        this.selectedNodeIDList = []; //id of currently selected node
        this.rootNode = null;

        this.nodeIDTable = {};

        this.currentNodeID = 0; //variable for initializing id

        this.mode = "2D";

        for (const clsName in oglClasses) {
            const cls = oglClasses[clsName];
            window[clsName] = cls;
        }
    }

    getSelectedNodes() {
        const res = [];

        this.selectedNodeIDList.forEach(nodeID => res.push(this.nodeIDTable[nodeID]));

        return res;
    }

    async openSceneFile(path) {
        this.scenePath = path;
        const sceneFile = await Neutralino.filesystem.readFile(path);

        this.sceneJSON = JSON.parse(sceneFile);

        this.initializeNode(this.sceneJSON.root, null);

        this.reloadScene();
    }

    initializeNode(nodeJSON, parentNode) {
        const newNode = this.initializeNodeJSON(nodeJSON, parentNode);
        if (parentNode === null) {
            this.rootNode = newNode;
            this.editor.stageManager.game.setScene(this.rootNode);
        }
        this.nodeIDTable[this.currentNodeID] = newNode;
        this.currentNodeID++;

        for (var i = 0; i < nodeJSON.children.length; i++) {
            const childJSON = nodeJSON.children[i];

            this.initializeNode(childJSON, newNode);
        }
    }

    initializeNodeJSON(nodeJSON, parentNode) {
        const nodeClass = oglClasses[nodeJSON.className];

        const newNode = nodeJSON.initCallProperties ? new nodeClass(...initCallProperties) : new nodeClass();

        newNode.nodeID = this.currentNodeID;
        newNode.nodeClass = nodeClass;
        newNode.name = nodeJSON.name;
        newNode.parent = parentNode;

        if (nodeJSON.initSetProperties) this.setInitProperties(newNode, nodeJSON.initSetProperties)

        return newNode;
    }

    initializeProperty(propValue) {
        if (!["object", "function"].includes(typeof propValue)) {
            return propValue;
        }

        const propClass = oglClasses[propValue.className]
        const newProp = propValue.initCallProperties ? new propClass(...propValue.initCallProperties) : new propClass();

        if (newProp.initSetProperties) this.setInitProperties(newProp, newProp.initSetProperties)

        return newProp;
    }

    setInitProperties(obj, initSetProperties) {
        Object.keys(initSetProperties).forEach(initProperty => {
            //TODO: maybe make a function for this; also god forbid the object be not in the oglclasses
            const propValue = initSetProperties[initProperty];

            // if a primitive
            obj[initProperty] = this.initializeProperty(propValue);
        });
    }

    clearScene() {
        this.initializeNode(this.sceneJSON.root, null);
    }

    reloadScene() {
        this.editor.hierarchyManager.initializeHierarchy();
    }

    hierarchySelectedNode(nodeIDList) {
        this.selectedNodeIDList = nodeIDList;

        this.editor.propertiesManager.propertiesUpdateSelectedNode();
    }

    hierarchyDeselected() {
        this.selectedNodeIDList = [];
        this.editor.propertiesManager.propertiesUpdateDeselected();
    }

    canvasSelectedNode(nodeIDList) {
        this.selectedNodeIDList = nodeIDList;

        this.editor.hierarchyManager.hierarchyUpdateSelectedNode();
        this.editor.propertiesManager.propertiesUpdateSelectedNode();
    }

    canvasDeselected() {
        this.selectedNodeIDList = [];

        this.editor.hierarchyManager.hierarchyUpdateDeselected();
        this.editor.propertiesManager.propertiesUpdateDeselected();
    }

    propertiesChangedName(nodeID) {
        this.editor.hierarchyManager.hierarchyUpdateNodeName(nodeID);
    }

    setMode(modeIndex, modeName) {
        this.mode = modeName;

        modeElements[1 - modeIndex].classList.remove("active-mode");
        modeElements[modeIndex].classList.add("active-mode");
    }

    JSONifyScene() {
        let root;

        const addToRes = (obj, childrenArr) => {
            const cur = {};

            cur.name = obj.name; // this doesnt need to be here and could be in initset
            cur.className = obj.nodeClass.name;
            cur.children = [];
            cur.initSetProperties = {};

            const protChain = getPrototypeChain(obj.nodeClass);
            const protChainEditable = getProtChainEditable(protChain);

            protChainEditable.forEach(key => {
                if (["parent", "name"].includes(key)) return;

                if (isMathInstance(obj[key])) {
                    const mathProp = { className: obj[key].constructor.name, initCallProperties: [] };
                    if (Array.isArray(obj[key])) mathProp.initCallProperties.push(...obj[key]);
                    else if (obj[key] instanceof Rect) mathProp.initCallProperties.push({ start: obj[key].position, end: obj[key].end });
                    cur.initSetProperties[key] = mathProp;
                }
                else cur.initSetProperties[key] = obj[key];
            });

            if (!childrenArr) root = cur;
            else childrenArr.push(cur);

            obj._children.forEach(childObj => addToRes(childObj, cur.children));
        }
        addToRes(this.rootNode);

        return root;
    }

    saveScene() {
        const sceneObj = { root: this.JSONifyScene() };

        Neutralino.filesystem.writeFile(this.scenePath, JSON.stringify(sceneObj));
    }
}