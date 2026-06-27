import { game, renderer } from "./scenemanager.js";
import * as toolDefinitions from "./tooldefinitions.js";
import { tools } from "./tooldefinitions.js";
import { Layer, Camera, Camera2D, Color } from "../oglsrc/index.mjs";

let editorCamera = null;
export let editorCamera2D = null;
const canvasContainer = document.getElementById("canvas-container");
const canvasDocument = canvasContainer.contentWindow.document;
export const gameCanvas = canvasDocument.getElementById("game-canvas");

export let selectedTool = "pointer";
let selectedToolElement = document.getElementsByClassName("tool-img")[0];

export function setTool(element, toolName) {
    selectedToolElement.classList.remove("tool-active");

    selectedToolElement = element;
    selectedTool = toolName;

    selectedToolElement.classList.add("tool-active");
}

const toolEventList = ["mousedown", "mousemove", "mouseup", "wheel"];
console.log(toolDefinitions, toolDefinitions[selectedTool + "Event"])
toolEventList.forEach((eventName) => {
    //canvasDocument.addEventListener(eventName, (e) => toolDefinitions[selectedTool + "Event"](e));
    //DO:
    //canvasDocument.addEventListener(eventName, (e) => tools[selectedTool].toolEvent(e));
})

const canvas2dContextOptions = [
    ["Create Node Here", (e) => {console.log(e);}]
];

canvasDocument.addEventListener("click", (e) => hideContextMenu());
canvasDocument.addEventListener("mousedown", (e) => {
    if (e.button === 1) e.preventDefault();
});
canvasDocument.addEventListener("contextmenu", (e) => {
    const canvasContainerRect = canvasContainer.getBoundingClientRect();
    const position = [e.x + canvasContainerRect.left, e.y + canvasContainerRect.top];

    showContextMenu(e, canvas2dContextOptions, position);
});

export async function initializeRenderer() {
    editorCamera = new Camera();
    editorCamera2D = new Camera2D();

    editorCamera.position.z = 10;
    editorCamera.type = "orthographic";

    game.activeCamera = editorCamera;
    game.activeCamera2D = editorCamera2D;

    game.editorUpdate = () => {
        //toolDefinitions[selectedTool + "Update"]();

        //DO:
        // tools[selectedTool].toolUpdate();
        // tools[selectedTool].toolDraw();

        //game.renderer.render({ scene: editorGuiLayers[selectedTool], camera2D: game.activeCamera2D, clear: false });
        //TODO: funny the gui layers being rendered with editor camera
    };

    renderer.resizeHandler = () => {
        renderer.resizeSceneCamera(0,0,false);

        editorCamera2D.generateViewMatrix();
    }
    renderer.resizeHandler();

    renderer.clearColor = new Color(0.2,0.2,0.2,1);

    game.editorloop();
}
