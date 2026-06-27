//TO not DO: this whole file should be removed once gui is made
//note: i am not reimplementing the editor with gui components; the html version will be kept
import { Node } from "../oglsrc/index.mjs";

const propertyList = document.getElementById("property-list");

export class PropertiesManager {
    constructor(editor) {
        this.editor = editor;
    }

    propertiesUpdateSelectedNode() {
        propertyList.innerHTML = "";
        //TODO: it gets updated every mousedrag for selection tool
        //console.log("properties cleared");
    
        if (this.editor.sceneManager.getSelectedNodes().length > 0) {
            const classList = [];
            this.editor.sceneManager.getSelectedNodes().forEach(node => classList.push(node.nodeClass));
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
                    });
                }
        
                currentClass = Object.getPrototypeOf(currentClass);
            }
        
            classPropertyList.forEach(editorProperty => this.createEditorPropContainer(editorProperty));
        }
    }

    propertiesUpdateDeselected() {
        propertyList.innerHTML = "";
    }

    createEditorPropContainer(editorProperty) {
        const propContainer = document.createElement("div");
        propContainer.classList.add("property-container");
    
        const firstSelectedNode = this.editor.sceneManager.getSelectedNodes()[0];

        const [propName, canEdit, className] = editorProperty;
        const arg = {
            propName,
            propValue: firstSelectedNode[editorProperty[0]],
            canEdit,
            propContainer
        }

        const createFunc = "createProp" + className[0].toUpperCase() + className.slice(1);
        if (!this[createFunc]) console.error(className + ' is not an editor-revealable property type.');
        else {
            this.createPropLabel(propName, propContainer);
            this[createFunc](arg);
            propertyList.appendChild(propContainer);
        }
    }

    createPropLabel(propName, propContainer) {
        const propNameSpan = document.createElement("span");
        propNameSpan.classList.add("property-name");
        propNameSpan.innerHTML = propName;
        propContainer.appendChild(propNameSpan);
    }

    createPropString({ propName, propValue, canEdit, propContainer }) {    
        const propValueElement = document.createElement("input");
        propValueElement.type = "text";
        propValueElement.name = "property-input";
        propValueElement.classList.add("property-value", "property-value-string");
        propValueElement.value = propValue;

        if (!canEdit) propValueElement.disabled = true;
        if (canEdit) propValueElement.onchange = () => this.onPropChangeString(propName, propValueElement, this.editor.sceneManager.selectedNodeIDList);
        
        propContainer.appendChild(propValueElement);
    }

    onPropChangeString(propName, propValueElement, nodeIDList) {
        const newValue = propValueElement.value;
    
        if (propName === "name" && newValue.trim() === "") {
            propValueElement.focus();
        } else {
            propValueElement.blur(); //deselect entry
    
            nodeIDList.forEach(nodeID => {
                const node = this.editor.sceneManager.nodeIDTable[nodeID];
                node[propName] = propValueElement.value;
                if (propName === "name") this.editor.sceneManager.propertiesChangedName(nodeID);
            });
        }
    }

    createPropBoolean({ propName, propValue, canEdit, propContainer }) {
        const propValueElement = document.createElement("input");
        propValueElement.type = "checkbox";
        propValueElement.name = "property-input";
        propValueElement.classList.add("property-value", "property-value-boolean");
        propValueElement.checked = propValue;
        if (!canEdit) propValueElement.disabled = true;
    
        if (canEdit) propValueElement.onchange = () => this.onPropChangeBoolean(propName, propValueElement, this.editor.sceneManager.selectedNodeIDList);
        propContainer.appendChild(propValueElement);
    }

    onPropChangeBoolean(propName, propValueElement, nodeIDList) {
        const newValue = propValueElement.checked;
    
        propValueElement.blur(); //deselect entry
    
        nodeIDList.forEach(nodeID => {
            const node = this.editor.sceneManager.nodeIDTable[nodeID];
    
            node[propName] = newValue;
        });
    }

    createPropNumber({ propName, propValue, canEdit, propContainer }) {
        const propValueElement = document.createElement("input");
        propValueElement.type = "number";
        propValueElement.name = "property-input";
        propValueElement.classList.add("property-value", "property-value-number");
        propValueElement.value = propValue;
    
        if (!canEdit) propValueElement.disabled = true;
        if (canEdit) propValueElement.onchange = () => this.onPropChangeNumber(propName, propValueElement, this.editor.sceneManager.selectedNodeIDList);
    
        propContainer.appendChild(propValueElement);
    }

    onPropChangeNumber(propName, propValueElement, nodeIDList) {
        nodeIDList.forEach(nodeID => {
            const node = this.editor.sceneManager.nodeIDTable[nodeID];

            node[propName] = parseFloat(propValueElement.value);
        });
    }

    createPropVectorEntry(vectorComponent, propName, propValue, canEdit, propValueContainer) {
        const propValueElement = document.createElement("input");
        propValueElement.type = "number";
        propValueElement.name = "property-input";
        propValueElement.classList.add("property-value", "property-value-number");
        propValueElement.value = "" + propValue[vectorComponent];
    
        if (!canEdit) propValueElement.disabled = true;
        if (canEdit) propValueElement.onchange = () => this.onPropChangeVector(propName, propValueElement, this.editor.sceneManager.selectedNodeIDList, vectorComponent);
    
        propValueContainer.appendChild(propValueElement);
    }

    createPropVector2({ propName, propValue, canEdit, propContainer }) {
        const propValueContainer = document.createElement("div");
        propValueContainer.classList.add("property-value", "property-value-vector");
    
        this.createPropVectorEntry("x", propName, propValue, canEdit, propValueContainer);
        this.createPropVectorEntry("y", propName, propValue, canEdit, propValueContainer);
    
        propContainer.appendChild(propValueContainer);
    }

    createPropVector3({ propName, propValue, canEdit, propContainer }) {
        const propValueContainer = document.createElement("div");
        propValueContainer.classList.add("property-value", "property-value-vector");
    
        this.createPropVectorEntry("x", propName, propValue, canEdit, propValueContainer);
        this.createPropVectorEntry("y", propName, propValue, canEdit, propValueContainer);
        this.createPropVectorEntry("z", propName, propValue, canEdit, propValueContainer);
    
        propContainer.appendChild(propValueContainer);
    }

    onPropChangeVector(propName, propValueElement, nodeIDList, vectorComponent) {
        const newValue = parseFloat(propValueElement.value);
    
        propValueElement.blur(); //deselect entry
    
        nodeIDList.forEach(nodeID => {
            const node = this.editor.sceneManager.nodeIDTable[nodeID];
    
            node[propName][vectorComponent] = newValue;
        });
    }
}

//TODO: never shoulda written this code
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
export function getPrototypeChain(cls) {
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