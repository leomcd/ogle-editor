import { Signal } from '../core/Signal.js';
import { getGlContext } from './Canvas.js';
import { Texture } from './Texture.js';

export class Node {
    static editorProperties = [["name",true,"string"], ["parent",false,"string"]];

    constructor(name, parent = null) {
        this.name = name;

        this._parent = parent;
        this._children = [];

        this._game = null;

        this.parentChanging = new Signal();
        this.parentChanged = new Signal();
        this.gameTreeChanging = new Signal();
        this.gameTreeChanged = new Signal();
    }

    get game() {
        return this._game;
    }

    get parent() {
        return this._parent;
    }
    set parent(value) {
        this.setParent(value);
    }
    setParent(parent, notifyParent = true) {
        if (this._parent !== parent) {
            let oldParent = this._parent;

            if (this._parent) this._parent.removeChild(this, false);

            this.parentChanging.fire(parent);

            this._parent = parent;

            //change game here:
            if (this._parent instanceof Node) { //check if we have a new game:
                if (this._game !== this._parent.game) { //we have a new game
                    this.gameTreeChanging.fire();
                    let oldGame = this._game;
                    this.traverse(o => {
                        o._game = parent.game;
                    })
                    this._game = parent.game;
                    this.gameTreeChanged.fire(oldGame);
                }
            }
            else if (this._parent === null) {
                this.traverse(o => {
                    o._game = null;
                })
            }
            else {throw new Error("Parent of Node object must be another Node or null.");}

            if (notifyParent && parent instanceof Node) parent.addChild(this, false);

            this.parentChanged.fire(oldParent);
        }
    }

    get children() {
        return this._children;
    }
    addChild(child, notifyChild = true) {
        if (!~this._children.indexOf(child)) this._children.push(child);
        if (notifyChild) child.setParent(this, false);
    }
    removeChild(child, notifyChild = true) {
        if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
        if (notifyChild) child.setParent(null, false);
    }

    get root() {
        let current = this;
        while (current.parent !== null) {
            current = current.parent;
        }
        return current;
    }

    getNode(name = null, type = null) {
        let res = null;
        this.traverse((child) => {
            let isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res = child; }
            return false;
        })
        return res;
    }

    findFirstDescendant(name = null, type = null) {
        let res = null;
        this.traverse((child) => {
            let isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res = child }
            return false;
        })
        if (res !== null) { return res; }
        this._children.forEach((child) => { //THIS CODE SUCKS YOU SHOULD K
            let res = child.findFirstDescendant(name, type);
            if (res !== null) {
                return res;
            }
        })
        return null;
    }

    findDescendants(name = null, type = null) {
        let res = [];
        this.traverse((child) => {
            let isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res.push(child) }
            return false;
        })
        this._children.forEach((child) => {
            let childRes = child.findDescendants(name, type);
            res.push(...childRes);
        })
        return res;
    }
    
    findClosestAncestor(name = null, type = null) {
        let currentNode = this;
        while (currentNode !== null) {
            currentNode = currentNode.parent;

            if ((name === null || currentNode.name === name) && (type === null || currentNode instanceof type))
                return currentNode;
        }
    }

    traverse(callback) { //TODO: replace every iteration through node family with traverse because its so cool
        // Return true in callback to stop traversing children
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }

    broadcast(func, ...args) {
        if (func in this) {
            this[func](...args);
        }
        this._children.forEach((child) => {
            child.broadcast(func, ...args);
        });
    }

    clone() {
        const cloneObj = new this.constructor();

        for (const key in this) {
            if (!this[key]) continue;

            if (["_parent", "_children", "_game"].includes(key)) continue;

            if (this[key].set) { //this because onChange references this and we dont want to overwrite onChange
                cloneObj[key].set(this[key]);
                continue;
            }
            
            if (this[key].clone) {
                cloneObj[key] = this[key].clone();
                continue;
            }

            // just pass original instead of cloning all this
            cloneObj[key] = !["nodeClass", "geometry", "program", "drawableUniforms"].includes(key) ? myStructuredClone(this[key]) : this[key];
        }

        return cloneObj;
    }

    cloneR() {
        const newThis = this.clone();
        for (const child of this._children) {
            const newChild = child.cloneR();
            
            newChild.parent = newThis;
        }
        return newThis;
    }
}

function myStructuredClone(value, v) { //i swear to god TODO: put this replace above
    if (v) console.log(v);
    if (value === null || typeof value !== 'object') {
        // Handle primitive types and null
        return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        const arrayCopy = [];
        for (let i = 0; i < value.length; i++) {
            if (value[i] instanceof Texture) objectCopy[i] = value[i];
            if (value[i].clone) arrayCopy[i] = value[i].clone();
            else arrayCopy[i] = myStructuredClone(value[i]);
        }
        return arrayCopy;
    }

    // Handle objects
    const objectCopy = {};
    for (const key of Object.keys(value)) {
        if (value[key] instanceof Texture) objectCopy[key] = value[key];
        if (value[key]?.clone) objectCopy[key] = value[key].clone();
        else objectCopy[key] = myStructuredClone(value[key]);
    }

    return objectCopy;
}
