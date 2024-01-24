const { app, BrowserWindow } = require("electron/main");
const path = require("path");
const claroBillsMain = require("./IPCMain/claroBillsMain")

function stratElectron() {

    function createWindow() {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, "./preload.js"),
            },
        });
        win.loadFile(path.resolve(__dirname, "../../public/index.html"));
    }

    app.whenReady().then(() => {
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        });
    })

    app.on('window-all-closed', () => {
        if (process.platform!== 'darwin') {
            app.quit()
        }
    })

    //IPC Main
    claroBillsMain();
}

module.exports = stratElectron
