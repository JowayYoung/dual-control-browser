import { BrowserWindow, app, ipcMain } from "electron";
import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let mainWindow = null;
function CreateWindow() {
    console.log("preload.js", join(__dirname, "./preload.js"));
    mainWindow = new BrowserWindow({
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
        BrowserWindow.getAllWindows().length === 0 && CreateWindow();
    });
});
app.on("window-all-closed", () => {
    platform !== "darwin" && app.quit();
});
ipcMain.on("navigate", (e, url) => {
    !!mainWindow && mainWindow.webContents.send("load-url", url);
});
