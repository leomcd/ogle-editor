function onWindowClose() {
    Neutralino.app.exit();
}
Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

// TODO: move all the js editor stuff into oglsrc
//TODO: nogle