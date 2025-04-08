import { dirname, join } from "node:path";
import { platform } from "node:process";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app } from "electron";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let mainWindow = null;
function CreateWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        height: 1000,
        minHeight: 1000,
        minWidth: 1600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: join(__dirname, "./preload.js"),
            webviewTag: true
        },
        width: 1600
    });
    mainWindow.loadFile(join(__dirname, "./index.html"));
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", () => mainWindow = null);
}
app.whenReady().then(() => {
    CreateWindow();
    app.on("activate", () => {
        !BrowserWindow.getAllWindows().length && CreateWindow();
    });
});
app.on("window-all-closed", () => {
    platform !== "darwin" && app.quit();
});
