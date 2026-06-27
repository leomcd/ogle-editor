import { rootNode, nodeIDTable, selectedNodeIDList, hierarchySelectedNode } from "./scenemanager.js";

const hierarchyContainer = document.getElementById("hierarchy-list");

let selectedNodeContainers = [];

const idHierarchyContainerTable = {};

export function hierarchyUpdateSelectedNode() {
    deselectHierarchy();

    selectedNodeContainers = [];

    selectedNodeIDList.forEach(nodeID => selectNodeHierarchy(idHierarchyContainerTable[nodeID]));
}

export function hierarchyUpdateDeselected() {
    deselectHierarchy();
}

export function hierarchyUpdateNodeName(nodeID) {
    const node = nodeIDTable[nodeID];

    const nodeContainer = idHierarchyContainerTable[nodeID];

    const hierarchyLabel = nodeContainer.querySelector('.hierarchy-node-label');

    hierarchyLabel.innerHTML = node.name;
}

export function initializeHierarchy() {
    clearHierarchy();

    addNodeToHierarchy(rootNode, hierarchyContainer);
}

function clearHierarchy() {
    hierarchyContainer.innerHTML = "";
}

function addNodeToHierarchy(newNode, parentContainer) {
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
        addNodeToHierarchy(child, childrenContainer);
    })

    idHierarchyContainerTable[newNode.nodeID] = nodeContainer;

    parentContainer.appendChild(nodeContainer);
}

function deselectHierarchy() {
    selectedNodeContainers.forEach(container => container.querySelector(".hierarchy-node-label-container").classList.remove("hierarchy-node-label-container-selected"));

    selectedNodeContainers = [];
}

function deselectNodeContainer() {
    deselectHierarchy();
    
    hierarchyDeselected();
}

document.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("hierarchy-node-label")) {
        nodeLabelContainerMouseDown(e.target.parentElement.nodeID, e.ctrlKey);
    }
    else if (e.target.classList.contains("hierarchy-node-label-container")) {
        nodeLabelContainerMouseDown(e.target.nodeID, e.ctrlKey);
    }
    else if (e.target.classList.contains("hierarchy-arrow-drop")) {
        hierarchyArrowDropMouseDown(e.target.nodeContainer, e.ctrlKey);
    }
    else if (e.target.id === "hierarchy-list") {
        deselectNodeContainer();
    }
})

function hierarchyArrowDropMouseDown(nodeContainer) {
    nodeContainer.classList.toggle("hierarchy-hide-children");
}

function selectNodeHierarchy(nodeLabelContainer) {
    selectedNodeContainers.push(nodeLabelContainer);

    nodeLabelContainer.querySelector(".hierarchy-node-label-container").classList.add("hierarchy-node-label-container-selected");
}

function nodeLabelContainerMouseDown(nodeID, ctrlKey, shiftKey) { //TODO: IMPLEMENT SHIFTKEY
    const nodeList = ctrlKey ? selectedNodeIDList : [];

    if (ctrlKey) {
        if (nodeList.includes(nodeID)) delete nodeList[nodeList.indexOf(nodeID)];
        else nodeList.push(nodeID);
    } else nodeList.push(nodeID);

    hierarchySelectedNode(nodeList);

    hierarchyUpdateSelectedNode();
}