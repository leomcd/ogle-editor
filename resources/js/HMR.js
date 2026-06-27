// TODO: make sure directory stuff works

export class HMR {
    constructor(editor) {
        this.editor = editor;

        this.filesToRecompile = [];
        this.shouldReload = false;
        this.windowFocused = false;

        this.init();
    }
    async init() {
        let resourcesId = await Neutralino.filesystem.createWatcher("resources/js");
        let srcId = await Neutralino.filesystem.createWatcher("resources/oglsrc");
        
        Neutralino.events.on('watchFile', async (evt) => {
            if(resourcesId == evt.detail.id) {
                await Neutralino.filesystem.removeWatcher(resourcesId);
                location.reload();
            }
            if (srcId == evt.detail.id) {
                this.shouldReload = true;
                if (["add", "modified"].includes(evt.detail.action)) this.filesToRecompile.push(evt.detail.dir+"/"+evt.detail.filename);
                if (this.windowFocused) this.attemptRecompile();
            }
        });

        Neutralino.events.on('fromCompiler', e => this.fromCompiler(e));

        Neutralino.events.on('windowFocus', () => this.onWindowFocus());
        Neutralino.events.on('windowBlur', () => this.windowFocused = false);
    }

    onWindowFocus() {
        this.windowFocused = true;
        if (this.shouldReload) this.attemptRecompile();
    }

    async sendToCompiler(data) {
        await Neutralino.extensions.dispatch('js.neutralino.scriptcompiler', 'toCompiler', data);
    }

    attemptRecompile() {
        this.sendToCompiler({filesToRecompile: this.filesToRecompile});
    }

    fromCompiler(e) {
        const data = e.detail;
        const { successfulRecompile } = data;

        console.log("Recompile successful: "+successfulRecompile);
    }
}
