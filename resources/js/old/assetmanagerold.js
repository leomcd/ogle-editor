import { projectFolder } from "./main.js";
import { openSceneFile } from "./scenemanager.js";

let selectedFile = null;

function createFileDiv(name, isDirectory) {
    const newFileDiv = document.createElement("div");
    newFileDiv.classList.add("asset-element");
    newFileDiv.onclick = () => fileDivClicked(newFileDiv);

    if (isDirectory) {
        newFileDiv.classList.add("asset-element-directory");

        const newFileArrow = document.createElement("img");
        newFileArrow.src = "editorimg/expand.png";
        newFileDiv.appendChild(newFileArrow);
        newFileArrow.classList.add("asset-element-arrow");
    }

    const newFileName = document.createElement("span");
    newFileDiv.appendChild(newFileName);
    newFileName.innerHTML = name;
    newFileName.classList.add("asset-element-name");

    return newFileDiv;
}

async function addDirectory(directoryName, folderDirectory, level = 0) {
    const directoryContainer = document.createElement("div");

    const directoryTitle = createFileDiv(directoryName, true);
    directoryContainer.appendChild(directoryTitle);

    const directoryContentsContainer = document.createElement("div");
    directoryContentsContainer.classList.add("directory-contents-container");
    directoryContainer.appendChild(directoryContentsContainer);

    directoryTitle.onclick = () => directoryClicked(directoryTitle, directoryContentsContainer);

    const contents = await Neutralino.filesystem.readDirectory(folderDirectory);
    for (var i = 0; i < contents.length; i++) {
        const file = contents[i];

        if (file.entry !== "." && file.entry !== "..") {
            let newDiv;
            if (file.type === "DIRECTORY") {
                newDiv = await addDirectory(file.entry, folderDirectory + "/" + file.entry, level + 1);
            } else {
                newDiv = createFileDiv(file.entry, false);

                newDiv.ondblclick = () => fileDoubleClicked(folderDirectory + "/" + file.entry);
            }
            
            directoryContentsContainer.appendChild(newDiv);
        }
    }

    return directoryContainer;
}

function fileDivClicked(fileDiv) {
    if (selectedFile) selectedFile.classList.remove("asset-element-active");

    selectedFile = fileDiv;
    selectedFile.classList.add("asset-element-active");
}

document.addEventListener("click", e => {
    if (e.target.id === "asset-list") {
        if (selectedFile) selectedFile.classList.remove("asset-element-active");
    }
});

document.addEventListener("contextmenu", e => {
    if (e.target.classList.contains("asset-element")) {
        showContextMenu(e, [
            ["Rename", () => renameFile(e.target)]
        ]);
    }
}, false);

function directoryClicked(title, contents) {
    fileDivClicked(title);

    title.classList.toggle("asset-element-arrow-drop");

    contents.classList.toggle("directory-contents-show");
}

function fileDoubleClicked(path) {
    if (path.length > 5 && path.slice(-5) === ".oscn") {
        openSceneFile(path);
    }
}

export async function loadProjectAssetsContainer() {
    const assetList = document.getElementById("asset-list");

    assetList.innerHTML = "";

    assetList.appendChild(await addDirectory("root", projectFolder));
}