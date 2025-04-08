import { app, BrowserWindow, ipcMain } from "electron";
import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: join(__dirname, "preload.js"),
            webviewTag: true
        },
        width: 1200
    });
    mainWindow.loadFile(join(__dirname, "../src/index.html"));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on("window-all-closed", () => {
    platform !== "darwin" && app.quit();
});
ipcMain.on("navigate", (event, url) => {
    if (mainWindow) {
        mainWindow.webContents.send("load-url", url);
    }
});
