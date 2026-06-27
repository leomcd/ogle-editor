import { Layer, Camera, Camera2D, Color, Game } from "../oglsrc/index.mjs";
import { InputManager } from "../oglsrc/core/InputManager.js";
import { initTools } from "./initTools.js";
import { EditorGame } from "../oglsrc/editor/EditorGame.js";

const canvasContainer = document.getElementById("canvas-container");
const canvasDocument = canvasContainer.contentWindow.document;
const editorCanvas = canvasDocument.getElementById("editor-canvas");
//const testgameCanvas = canvasDocument.getElementById("testgame-canvas");

export class StageManager {//TODO: why is this stuff in stagemanager
    constructor(editor) {
        this.editor = editor;

        this.game = new EditorGame({canvas: editorCanvas});
        this.renderer = this.game.renderer;

        this.editorCamera = new Camera();
        this.editorCamera2D = new Camera2D();

        this.inputManager = new InputManager(canvasDocument);

        this.editorCamera.position.z = 10;
        this.editorCamera.type = "orthographic";
        this.editorCanvas = editorCanvas;
        //this.testgameCanvas = testgameCanvas;

        this.tools = initTools(this.editor);

        this.selectedTool = "pointer";
        this.selectedToolElement = document.getElementsByClassName("tool-img")[0];

        this.editing = true;

        const toolEventList = [
            "keyDown",
            "keyUp",
            "keyPressed",
            "clicked",
            "mouseMoved",
            "mouseDragged",
            "mouseDown",
            "mouseUp",
            "wheel"
        ];

        toolEventList.forEach((eventName) => {
            this.inputManager[eventName].add((...args) => {
                if (!this.editing) return;

                this.tools["pan"][eventName](...args);
                this.tools[this.selectedTool][eventName](...args);
            });
        });

        const canvas2dContextOptions = [
            ["Create Node Here", (e) => { this.createNode(); }]
        ];

        //TODO: do context menu
        canvasDocument.addEventListener("click", (e) => hideContextMenu());
        canvasDocument.addEventListener("mousedown", (e) => {
            if (e.button === 1) e.preventDefault();
        });
        canvasDocument.addEventListener("contextmenu", (e) => {
            const canvasContainerRect = canvasContainer.getBoundingClientRect();
            const position = [e.x + canvasContainerRect.left, e.y + canvasContainerRect.top];

            showContextMenu(e, canvas2dContextOptions, position);
        });

        this.testGame = new Game({ canvas: editorCanvas, autoCreateRenderer: false }); // TODO: the whole renderer gl canvas connection sucks
        window.testGame = this.testGame;
        testGame.renderer = this.game.renderer;
    }

    setTool(element, toolName) {
        this.selectedToolElement.classList.remove("tool-active");

        this.selectedToolElement = element;
        this.selectedTool = toolName;

        this.selectedToolElement.classList.add("tool-active");
    }

    initializeRenderer() {
        this.game.activeCamera = this.editorCamera;
        this.game.activeCamera2D = this.editorCamera2D;
        this.editorCamera2D._game = this.game;

        this.game.editorUpdate = () => {
            this.tools["pan"].update(); //this isnt even needed
            this.tools[this.selectedTool].update();
            this.tools[this.selectedTool].draw();
            //TODO: funny the gui layers being rendered with editor camera
        };

        this.game.renderer.resizeHandler = () => {
            this.game.renderer.resizeSceneCamera(0, 0, false);
        }
        this.game.renderer.resizeHandler();

        this.game.renderer.clearColor = new Color(0.2, 0.2, 0.2, 1);

        this.game.editorloop();
    }

    playtestScene() {
        this.editing = false;
        this.game.running = false;

        const testGame = this.testGame;

        // instantiating game is all done in here laughing emoji
        const playtestScene = this.editor.sceneManager.rootNode.cloneR();
        testGame.setScene(playtestScene);
        const r = obj => {
            obj._game = testGame;
            obj._children.forEach(r);
        }
        r(playtestScene);

        testGame.renderer.game = testGame; //both editorgame and testgame have renderer connected, but switching done in renderer.game
        testGame.activeCamera2D = testGame.scene.children[2];
        // testGame.activeCamera2D.position = this.editorCamera2D.position;
        // testGame.activeCamera2D.zoom = this.editorCamera2D.zoom;
        // testGame.activeCamera2D.generateViewMatrix();
        testGame.activeCamera = new Camera();
        //throw new Error();
        testGame.mainloop();

        //TODO: handle having nothing in a scene in SceneManager
    }
    stoptestScene() {
        this.testGame.running = false;
        //this.editor.sceneManager.openJSONScene(pretestScene);

        this.testGame.renderer.game = this.game;

        this.editing = true;
        this.game.running = true;
        this.game.editorloop();
    }

    createNode() {
        const pos = this.editor.utils.worldMouse();

        console.log(pos); //TODO: MAKE A NEW GUI HOORAY!!!
    }
}
