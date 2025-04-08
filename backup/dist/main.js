import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";
import { BrowserWindow, app } from "electron";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let mainWindow = null;
function CreateWindow() {
    mainWindow = new BrowserWindow({
        height: 800,
        minHeight: 800,
        minWidth: 1200,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: join(__dirname, "preload.js"),
            webviewTag: true
        },
        width: 1200
    });
    mainWindow.loadFile(join(__dirname, "index.html"));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
app.whenReady().then(() => {
    CreateWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            CreateWindow();
        }
    });
});
app.on("window-all-closed", () => {
    if (platform !== "darwin") {
        app.quit();
    }
});
