async function getClassFromSource(name) {
    const res = await import("../oglsrc/core/" + name + ".js");

    return res[name];
}

async function loadClassesDirectory(dir) {
    const files = await Neutralino.filesystem.readDirectory("resources/oglsrc/" + dir);

    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.entry;

        if (file.type === "FILE") {
            const className = fileName.replace(".js", "");

            window[className] = (await import("../oglsrc/" + dir + "/" + fileName))[className];
        }
    }
}

async function loadAllClasses() {
    console.log("Loading core classes");

    await loadClassesDirectory("core");

    console.log("Loading 2d classes");
    
    await loadClassesDirectory("2d");

    console.log("Loading math classes");
    
    await loadClassesDirectory("math");

    console.log("Loading extra classes");
    
    await loadClassesDirectory("extras");

    console.log("Done loading classes");
}