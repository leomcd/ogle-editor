import { Transform } from './Transform.js';

//TODO: FINISH THIS THING HAHAHA

export class Layer extends Transform {
    static editorProperties = [["layerIdx",false,"string"], ["useDefaultCamera",true,"boolean"]];

    constructor() {
        super();
        this.layerIdx = 0;

        this.useDefaultCamera = false;
    }
}