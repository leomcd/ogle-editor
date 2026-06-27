export class ProjectManager {
    constructor(editor) {
        this.editor = editor;

        this.projectName = null;
        this.projectRoot = null;

        this.newProjectName = null;

        this.projectFolder = null;
        this.templateDirectory = NL_CWD + "/resources/template-project";
        this.projectJSON = null;
    }

    async createProjectFolderWatcher() {
        let watcherId = await Neutralino.filesystem.createWatcher(this.projectFolder);
        Neutralino.events.on('watchFile', (evt) => {
            if(watcherId == evt.detail.id) {
                this.editor.assetManager.loadProjectAssetsContainer();
            }
        });
    }

    async loadProject() {
        //loadProjectName();
    
        //createProjectFolderWatcher();
    
        this.editor.assetManager.loadProjectAssetsContainer();
    }

    async loadProjectJSON() {
        const projectContents = await Neutralino.filesystem.readFile(this.projectFolder + "/project.json");
    
        this.projectJSON = JSON.parse(projectContents);
    }

    changeProjectName(newName) {
        this.projectName = newName;
        this.loadProjectName();
    }

    loadProjectName() {
        document.getElementById("project-name").innerHTML = this.projectName;
    }

    resetProjectPrompt() {
        this.stopWarnEmptyFolder();
    
        this.projectFolder = null;
    
        const newProjectSpan = document.getElementById("new-project-span");
    
        newProjectSpan.innerHTML = "";
    }

    async newProject() {
        this.resetProjectPrompt();
    
        this.displayNewProjectPrompt();
    }

    async openProjectFolder() {
        let folder = await Neutralino.os.showFolderDialog("PICK A FOLDER NOW!!!");
        this.projectFolder = folder ? folder : null;
        if (this.projectFolder === null) return;
    
        await this.loadProjectJSON();
    
        this.loadProject(this.projectJSON);
    }

    async chooseNewProjectFolder() {//TODO: WHY IS THIS UNUSED
        this.projectFolder = await Neutralino.os.showFolderDialog("PICK A FOLDER NOW!!!");
    
        const newProjectSpan = document.getElementById("new-project-span");
    
        newProjectSpan.innerHTML = this.projectFolder;
    }

    displayNewProjectPrompt() {
        const dialogContainer = document.getElementById("dialog-container");
        dialogContainer.classList.add("dialog-show");
    
        const newProjectDialog = document.getElementById("new-project-dialog");
        newProjectDialog.classList.add("dialog-show");
    }

    cancelDialog() {
        const dialogContainer = document.getElementById("dialog-container");
        dialogContainer.classList.remove("dialog-show");
    
        const dialogs = document.getElementsByClassName("dialog-box");
    
        Array.from(dialogs).forEach((dialogBox) => {
            dialogBox.classList.remove("dialog-show");
        })
    }

    async confirmCreateProject() {
        this.stopWarnEmptyFolder();
    
        try {
            const projectFolderFiles = await Neutralino.filesystem.readDirectory(this.projectFolder);
    
            if (projectFolderFiles.length > 2) {
                this.warnCreateProjectEmptyFolder();
                return;
            }
            await this.createProjectTemplate();
    
            this.loadProjectJSON();
    
            //this.newProjectName = document.getElementById("new-project-name").value;
    
            this.loadProject(this.projectJSON);
    
            this.cancelDialog();
        } catch {
            this.warnCreateProjectGeneral();
        }
    }

    warnCreateProjectEmptyFolder() {
        const newProjectWarning = document.getElementById("new-project-warning");
        newProjectWarning.classList.add("warning-show");
        newProjectWarning.innerHTML = "The project folder must be empty upon creation.";
    }

    warnCreateProjectGeneral() {
        const newProjectWarning = document.getElementById("new-project-warning");
        newProjectWarning.classList.add("warning-show");
        newProjectWarning.innerHTML = "Something went wrong.";
    }

    stopWarnEmptyFolder() {
        const newProjectWarning = document.getElementById("new-project-warning");
        newProjectWarning.classList.remove("warning-show");
        newProjectWarning.innerHTML = "";
    }

    async createProjectTemplate() {
        const templateProjectSource = await Neutralino.filesystem.readDirectory(this.templateDirectory);
        templateProjectSource.forEach((file) => {
            if (file["entry"] !== "." && file["entry"] !== "..") {
                console.log(this.templateDirectory + "/" + file["entry"]);
                Neutralino.filesystem.copyFile(this.templateDirectory + "/" + file["entry"], this.projectFolder + "/" + file["entry"]);
            }
        })
    }

    async saveProject() { //TODO: change to saveScene
        this.editor.sceneManager.saveScene();
    }
}
