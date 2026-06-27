import { Signal } from "./Signal.js";

export function detectableArray(array) {
    const onChange = new Signal();
    array.onChange = onChange;

    return new Proxy(array, {
        set(target, prop, value) {
            target[prop] = value;
            onChange.fire();
            return true;
        },
        deleteProperty(target, prop) {
            delete target[prop];
            onChange.fire();
            return true;
        }
    });
}