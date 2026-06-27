// interaction with HTML page happens HERE

let gl = null;
let _isWebgl2 = null;

export function getGlContext() {
    return gl;
}

export function isWebgl2() {
    return _isWebgl2;
}

export function createCanvas(renderer, { webgl, attributes }, canvasElement) { //TODO: 😒 literally every game needs a unique canvas, given something something universal gl
    if (!canvasElement) {
        canvasElement = document.createElement('canvas');
        document.body.appendChild(canvasElement);
    }

    // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
    if (webgl === 2) gl = canvasElement.getContext('webgl2', attributes);
    _isWebgl2 = !!gl;
    if (!gl) gl = canvasElement.getContext('webgl', attributes);
    if (!gl) console.error('unable to create webgl context');

    // Attach renderer to gl so that all classes have access to internal state functions
    gl.renderer = renderer;
}
