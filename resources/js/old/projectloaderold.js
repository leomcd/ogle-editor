import { projectFolder } from "../main.js";
//import { loadProjectAssetsContainer } from "./assetmanagerold.js";
//TODO: change this
import { assetManager } from "../scenemanager.js";

let projectName = null;
let projectRoot = null;

async function createProjectFolderWatcher() {
    let watcherId = await Neutralino.filesystem.createWatcher(projectFolder);
    Neutralino.events.on('watchFile', (evt) => {
        if(watcherId == evt.detail.id) {
            assetManager.loadProjectAssetsContainer();
        }
    });
}

export async function loadProject() {
    //loadProjectName();

    //createProjectFolderWatcher();

    assetManager.loadProjectAssetsContainer();
}

function changeProjectName(newName) {
    projectName = newName;
    loadProjectName();
}

function loadProjectName() {
    document.getElementById("project-name").innerHTML = projectName;
}