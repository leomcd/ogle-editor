export class AssetManager {
    constructor(editor) {
        this.editor = editor;
        this.selectedFile = null;

        document.addEventListener("click", e => {
            if (e.target.id === "asset-list") {
                if (this.selectedFile) this.selectedFile.classList.remove("asset-element-active");
            }
        });
        
        document.addEventListener("contextmenu", e => {
            if (e.target.classList.contains("asset-element")) {
                showContextMenu(e, [
                    ["Rename", () => renameFile(e.target)]
                ]);
            }
        }, false);
    }

    createFileDiv(name, isDirectory) {
        const newFileDiv = document.createElement("div");
        newFileDiv.classList.add("asset-element");
        newFileDiv.onclick = () => this.fileDivClicked(newFileDiv);
    
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

    async addDirectory(directoryName, folderDirectory, level = 0) {
        const directoryContainer = document.createElement("div");
    
        const directoryTitle = this.createFileDiv(directoryName, true);
        directoryContainer.appendChild(directoryTitle);
    
        const directoryContentsContainer = document.createElement("div");
        directoryContentsContainer.classList.add("directory-contents-container");
        directoryContainer.appendChild(directoryContentsContainer);
    
        directoryTitle.onclick = () => this.directoryClicked(directoryTitle, directoryContentsContainer);
    
        const contents = await Neutralino.filesystem.readDirectory(folderDirectory);
        for (var i = 0; i < contents.length; i++) {
            const file = contents[i];
    
            if (file.entry !== "." && file.entry !== "..") {
                let newDiv;
                if (file.type === "DIRECTORY") {
                    newDiv = await this.addDirectory(file.entry, folderDirectory + "/" + file.entry, level + 1);
                } else {
                    newDiv = this.createFileDiv(file.entry, false);
    
                    newDiv.ondblclick = () => this.fileDoubleClicked(folderDirectory + "/" + file.entry);
                }
                
                directoryContentsContainer.appendChild(newDiv);
            }
        }
    
        return directoryContainer;
    }

    fileDivClicked(fileDiv) {
        if (this.selectedFile) this.selectedFile.classList.remove("asset-element-active");
    
        this.selectedFile = fileDiv;
        this.selectedFile.classList.add("asset-element-active");
    }

    directoryClicked(title, contents) {
        this.fileDivClicked(title);
    
        title.classList.toggle("asset-element-arrow-drop");
    
        contents.classList.toggle("directory-contents-show");
    }

    fileDoubleClicked(path) {
        if (path.length > 5 && path.slice(-5) === ".oscn") {
            this.editor.sceneManager.openSceneFile(path);
        }
    }

    async loadProjectAssetsContainer() {
        const assetList = document.getElementById("asset-list");
    
        assetList.innerHTML = "";
    
        assetList.appendChild(await this.addDirectory("root", this.editor.projectManager.projectFolder));
    }
}