//TODO: this whole file should be removed once gui is made

import { getSelectedNodes, selectedNodeIDList, nodeIDTable } from "./scenemanager.js";
import { Node } from "../oglsrc/index.mjs";

const propertyList = document.getElementById("property-list");

export function propertiesUpdateSelectedNode() {
    propertyList.innerHTML = "";

    if (getSelectedNodes().length > 0) {
        const classList = [];
        getSelectedNodes().forEach(node => classList.push(node.nodeClass));
        const highestCommonClass = findCommonPrototype(classList);
    
        const classPropertyList = [];
    
        let currentClass = highestCommonClass;
        //TODO: i hate html node
        while (currentClass !== Node && currentClass !== undefined) {
            if (currentClass.editorProperties) {  //DO MULTUIPLE SELECTED NODes
                currentClass.editorProperties.forEach((editorProperty) => {
                    if (!classPropertyList.includes(editorProperty)) {
                        classPropertyList.push(editorProperty);
                    }
                })
            }
    
            currentClass = Object.getPrototypeOf(currentClass);
        }
    
        classPropertyList.forEach(editorProperty => createEditorPropertyContainer(editorProperty));
    }
}

export function propertiesUpdateDeselected() {
    propertyList.innerHTML = "";
}

function createEditorPropertyString(propertyName, propertyValue, canEdit, propertyContainer) {
    const propertyNameSpan = document.createElement("span");
    propertyNameSpan.classList.add("property-name");
    propertyNameSpan.innerHTML = propertyName;
    propertyContainer.appendChild(propertyNameSpan);

    const propertyValueElement = document.createElement("input");
    propertyValueElement.type = "text";
    propertyValueElement.name = "property-input";
    propertyValueElement.classList.add("property-value", "property-value-string");
    propertyValueElement.value = propertyValue;
    if (!canEdit) propertyValueElement.disabled = true;

    if (canEdit) propertyValueElement.onchange = () => propertyValueElementChangedString(propertyName, propertyValueElement, selectedNodeIDList);
    propertyContainer.appendChild(propertyValueElement);
}

function propertyValueElementChangedString(propertyName, propertyValueElement, nodeIDList) {
    const newValue = propertyValueElement.value;

    if (propertyName === "name" && newValue.trim() === "") {
        propertyValueElement.focus();
    } else {
        propertyValueElement.blur(); //deselect entry

        nodeIDList.forEach(nodeID => {
            const node = nodeIDTable[nodeID];

            node[propertyName] = propertyValueElement.value;

            if (propertyName === "name") propertiesChangedName(nodeID);
        });
    }
}

function createEditorPropertyBoolean(propertyName, propertyValue, canEdit, propertyContainer) {
    const propertyNameSpan = document.createElement("span");
    propertyNameSpan.classList.add("property-name");
    propertyNameSpan.innerHTML = propertyName;
    propertyContainer.appendChild(propertyNameSpan);

    const propertyValueElement = document.createElement("input");
    propertyValueElement.type = "checkbox";
    propertyValueElement.name = "property-input";
    propertyValueElement.classList.add("property-value", "property-value-boolean");
    propertyValueElement.checked = propertyValue;
    if (!canEdit) propertyValueElement.disabled = true;

    if (canEdit) propertyValueElement.onchange = () => propertyValueElementChangedBoolean(propertyName, propertyValueElement, selectedNodeIDList);
    propertyContainer.appendChild(propertyValueElement);
}

function propertyValueElementChangedBoolean(propertyName, propertyValueElement, nodeIDList) {
    const newValue = propertyValueElement.checked;

    propertyValueElement.blur(); //deselect entry

    nodeIDList.forEach(nodeID => {
        const node = nodeIDTable[nodeID];

        node[propertyName] = newValue;
    });
}

function createEditorPropertyVectorEntry(vectorComponent, propertyName, propertyValue, canEdit, propertyValueContainer) {
    const propertyValueElement = document.createElement("input");
    propertyValueElement.type = "number";
    propertyValueElement.name = "property-input";
    propertyValueElement.classList.add("property-value", "property-value-number");
    propertyValueElement.value = "" + propertyValue[vectorComponent];

    if (!canEdit) propertyValueElement.disabled = true;
    if (canEdit) propertyValueElement.onchange = () => propertyValueElementChangedVector3(propertyName, propertyValueElement, selectedNodeIDList, vectorComponent);

    propertyValueContainer.appendChild(propertyValueElement);
}

function createEditorPropertyVector2(propertyName, propertyValue, canEdit, propertyContainer) {
    const propertyNameSpan = document.createElement("span");
    propertyNameSpan.classList.add("property-name");
    propertyNameSpan.innerHTML = propertyName;
    propertyContainer.appendChild(propertyNameSpan);

    const propertyValueContainer = document.createElement("div");
    propertyValueContainer.classList.add("property-value", "property-value-vector");

    createEditorPropertyVectorEntry("x", propertyName, propertyValue, canEdit, propertyValueContainer);
    createEditorPropertyVectorEntry("y", propertyName, propertyValue, canEdit, propertyValueContainer);

    propertyContainer.appendChild(propertyValueContainer);
}

function propertyValueElementChangedVector2(propertyName, propertyValueElement, nodeIDList, vectorComponent) {
    const newValue = parseFloat(propertyValueElement.value);

    propertyValueElement.blur(); //deselect entry

    nodeIDList.forEach(nodeID => {
        const node = nodeIDTable[nodeID];

        node[propertyName][vectorComponent] = newValue;
    });
}

function createEditorPropertyVector3(propertyName, propertyValue, canEdit, propertyContainer) {
    const propertyNameSpan = document.createElement("span");
    propertyNameSpan.classList.add("property-name");
    propertyNameSpan.innerHTML = propertyName;
    propertyContainer.appendChild(propertyNameSpan);

    const propertyValueContainer = document.createElement("div");
    propertyValueContainer.classList.add("property-value", "property-value-vector");

    createEditorPropertyVectorEntry("x", propertyName, propertyValue, canEdit, propertyValueContainer);
    createEditorPropertyVectorEntry("y", propertyName, propertyValue, canEdit, propertyValueContainer);
    createEditorPropertyVectorEntry("z", propertyName, propertyValue, canEdit, propertyValueContainer);

    propertyContainer.appendChild(propertyValueContainer);
}

function propertyValueElementChangedVector3(propertyName, propertyValueElement, nodeIDList, vectorComponent) {
    const newValue = parseFloat(propertyValueElement.value);

    propertyValueElement.blur(); //deselect entry

    nodeIDList.forEach(nodeID => {
        const node = nodeIDTable[nodeID];

        node[propertyName][vectorComponent] = newValue;
    });
}

function createEditorPropertyFunctionEntry(argumentName, current) {

}

function createEditorPropertyFunction(propertyName, propertyValue, canEdit, propertyContainer, argumentList) {
    const propertyNameSpan = document.createElement("span");
    propertyNameSpan.classList.add("property-name");
    propertyNameSpan.innerHTML = propertyName;
    propertyContainer.appendChild(propertyNameSpan);

    const propertyValueContainer = document.createElement("div");
    propertyValueContainer.classList.add("property-value", "property-value-vector");

    argumentList.forEach(argumentName => createEditorPropertyFunctionEntry(argumentName));

    propertyContainer.appendChild(propertyValueContainer);
}

function propertyValueElementChangedFunction(propertyName, propertyValueElement, nodeIDList, vectorComponent) {
    const newValue = parseFloat(propertyValueElement.value);

    propertyValueElement.blur(); //deselect entry

    nodeIDList.forEach(nodeID => {
        const node = nodeIDTable[nodeID];

        node[propertyName][vectorComponent] = newValue;
    });
}

function createEditorPropertyContainer(editorProperty) {
    const propertyContainer = document.createElement("div");
    propertyContainer.classList.add("property-container");

    const firstSelectedNode = getSelectedNodes()[0];

    if (editorProperty[2] === "string") {
        createEditorPropertyString(editorProperty[0], firstSelectedNode[editorProperty[0]], editorProperty[1], propertyContainer);
    } else if (editorProperty[2] === "boolean") {
        createEditorPropertyBoolean(editorProperty[0], firstSelectedNode[editorProperty[0]], editorProperty[1], propertyContainer);
    } else if (editorProperty[2] === "vector2") {
        createEditorPropertyVector2(editorProperty[0], firstSelectedNode[editorProperty[0]], editorProperty[1], propertyContainer);
    } else if (editorProperty[2] === "vector3") {
        createEditorPropertyVector3(editorProperty[0], firstSelectedNode[editorProperty[0]], editorProperty[1], propertyContainer);
    } else if (editorProperty[2] === "function") {
        createEditorPropertyFunction(editorProperty[0], firstSelectedNode[editorProperty[0]], editorProperty[1], propertyContainer, editorProperty[2]);
    }

    propertyList.appendChild(propertyContainer);
}

function findCommonPrototype(classes) {
    let currentCommonPrototype = classes[0];

    // Iterate through the remaining classes
    for (let i = 1; i < classes.length; i++) {
        const currentCommonPrototypeChain = getPrototypeChain(currentCommonPrototype);

        // Get the prototype chain for the current class
        const currentPrototypeChain = getPrototypeChain(classes[i]);

        // Find the common prototype between the current class and the accumulated common prototype
        currentCommonPrototype = findCommonElement(currentPrototypeChain, currentCommonPrototypeChain);
    }

    return currentCommonPrototype;
}

// Helper function to get the prototype chain of a class
function getPrototypeChain(cls) {
    const prototypeChain = [cls];
    let currentPrototype = Object.getPrototypeOf(cls);

    while (currentPrototype !== null) {
        prototypeChain.push(currentPrototype);
        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    return prototypeChain;
}

// Helper function to find the common element between two arrays
function findCommonElement(arr1, arr2) {
    for (const element of arr1) {
        if (arr2.includes(element)) {
            return element;
        }
    }

    return null;
}