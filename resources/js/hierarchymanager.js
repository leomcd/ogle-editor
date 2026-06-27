const hierarchyContainer = document.getElementById("hierarchy-list");

export class HierarchyManager {
    constructor(editor) {
        this.editor = editor;

        this.selectedNodeContainers = [];

        this.idHierarchyContainerTable = {};

        document.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("hierarchy-node-label")) {
                this.nodeLabelContainerMouseDown(e.target.parentElement.nodeID, e.ctrlKey);
            }
            else if (e.target.classList.contains("hierarchy-node-label-container")) {
                this.nodeLabelContainerMouseDown(e.target.nodeID, e.ctrlKey);
            }
            else if (e.target.classList.contains("hierarchy-arrow-drop")) {
                this.hierarchyArrowDropMouseDown(e.target.nodeContainer, e.ctrlKey);
            }
            else if (e.target.id === "hierarchy-list") {
                this.deselectNodeContainer();
            }
        })
    }

    hierarchyUpdateSelectedNode() {
        this.deselectHierarchy();
    
        this.selectedNodeContainers = [];
    
        this.editor.sceneManager.selectedNodeIDList.forEach(nodeID => this.selectNodeHierarchy(this.idHierarchyContainerTable[nodeID]));
    }

    hierarchyUpdateDeselected() {
        this.deselectHierarchy();
    }

    hierarchyUpdateNodeName(nodeID) {
        const node = this.editor.sceneManager.nodeIDTable[nodeID];
    
        const nodeContainer = this.idHierarchyContainerTable[nodeID];
    
        const hierarchyLabel = nodeContainer.querySelector('.hierarchy-node-label');
    
        hierarchyLabel.innerHTML = node.name;
    }

    initializeHierarchy() {
        this.clearHierarchy();
    
        this.addNodeToHierarchy(this.editor.sceneManager.rootNode, hierarchyContainer);
    }

    clearHierarchy() {
        hierarchyContainer.innerHTML = "";
    }

    addNodeToHierarchy(newNode, parentContainer) {
        const nodeName = newNode.name;
    
        const nodeContainer = document.createElement("div");
        nodeContainer.classList.add("hierarchy-node-container");
    
        const nodeLabelContainer = document.createElement("div");
        nodeLabelContainer.classList.add("hierarchy-node-label-container");
        nodeLabelContainer.nodeID = newNode.nodeID;
        nodeContainer.appendChild(nodeLabelContainer);
    
        if (newNode.children.length > 0) {
            const arrowDrop = document.createElement("img");
            arrowDrop.src = "editorimg/dropdown.png";
            arrowDrop.classList.add("hierarchy-arrow-drop");
            arrowDrop.nodeContainer = nodeContainer;
            nodeLabelContainer.appendChild(arrowDrop);
        }
    
        const nodeLabel = document.createElement("span");
        nodeLabel.innerHTML = nodeName;
        nodeLabel.classList.add("hierarchy-node-label");
        nodeLabelContainer.appendChild(nodeLabel);
    
        const childrenContainer = document.createElement("div");
        childrenContainer.classList.add("hierarchy-children-container");
        nodeContainer.appendChild(childrenContainer);
        newNode.children.forEach((child) => {
            this.addNodeToHierarchy(child, childrenContainer);
        })
    
        this.idHierarchyContainerTable[newNode.nodeID] = nodeContainer;
    
        parentContainer.appendChild(nodeContainer);
    }

    deselectHierarchy() {
        this.selectedNodeContainers.forEach(container => container.querySelector(".hierarchy-node-label-container").classList.remove("hierarchy-node-label-container-selected"));
    
        this.selectedNodeContainers = [];
    }

    deselectNodeContainer() {
        this.deselectHierarchy();
        
        this.editor.sceneManager.hierarchyDeselected();
    }

    hierarchyArrowDropMouseDown(nodeContainer) {
        nodeContainer.classList.toggle("hierarchy-hide-children");
    }

    selectNodeHierarchy(nodeLabelContainer) {
        this.selectedNodeContainers.push(nodeLabelContainer);
    
        nodeLabelContainer.querySelector(".hierarchy-node-label-container").classList.add("hierarchy-node-label-container-selected");
    }

    nodeLabelContainerMouseDown(nodeID, ctrlKey, shiftKey) { //TODO: IMPLEMENT SHIFTKEY
        const nodeList = ctrlKey ? this.editor.sceneManager.selectedNodeIDList : [];
    
        if (ctrlKey) {
            if (nodeList.includes(nodeID)) delete nodeList[nodeList.indexOf(nodeID)];
            else nodeList.push(nodeID);
        } else nodeList.push(nodeID);
    
        this.editor.sceneManager.hierarchySelectedNode(nodeList);
    
        this.hierarchyUpdateSelectedNode();
    }
}
