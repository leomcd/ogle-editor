const shortcutMap = {};
const unorderedShortcutMap = {};
const currentPressed = [];

function generateMapKey(keyList=[], ordered = true) {
    keyList = Array.from(keyList);
    if (!ordered) keyList.sort();
    return keyList.join(" ");
}

function defineShortcut(keyList, {callback = () => {}, cond = () => true, pressed = false, ordered = true}) {
    const keyListCase = [];
    keyList.forEach(k => keyListCase.push(k.toLowerCase()));
    const mapKey = generateMapKey(keyListCase, ordered);
    const map = ordered ? shortcutMap : unorderedShortcutMap;
    map[mapKey] = [callback, cond, pressed];
}

defineShortcut(["control", "d"], {callback: () => console.log(true), ordered: true});

const processShortcutKeydown = e => {
    const k = e.key.toLowerCase();
    if (!currentPressed.includes(k)) currentPressed.push(k);
    const mapKey = generateMapKey(currentPressed);
    const unorderedMapKey = generateMapKey(currentPressed, false);
    const r = shortcutMap[mapKey] || unorderedShortcutMap[unorderedMapKey];
    if (r !== undefined) {
        const [callback, cond, pressed] = r;
        if (pressed) return; //skip cause handled below
        if (cond()) callback();
    }
}

const processShortcutKeyup = e => {
    const k = e.key.toLowerCase();
    if (currentPressed.includes(k)) {
        const idx = currentPressed.indexOf(k);
        currentPressed.splice(idx, 1);
    }
}
document.addEventListener("keydown", processShortcutKeydown);
document.addEventListener("keyup", processShortcutKeyup);
Neutralino.events.on("windowBlur", () => currentPressed.length = 0);
Neutralino.events.on("windowFocus", () => currentPressed.length = 0);
//weird alt behavior

//disable copy cut and paste
document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());
document.addEventListener("paste", e => e.preventDefault());