import { app, BrowserWindow, ipcMain, session } from "electron";
import { join, dirname } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
if (platform === "win32") {
    import("electron-squirrel-startup").then(squirrelStartup => {
        if (squirrelStartup.default) {
            app.quit();
        }
    });
}
let mainWindow = null;
const createWindow = () => {
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
    mainWindow.loadFile(join(__dirname, "index.html"));
    mainWindow.setFullScreen(true);
    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools();
    }
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { "Content-Security-Policy": ["default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:"] })
        });
    });
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
ipcMain.handle("navigate", (_, url) => {
    if (mainWindow) {
        return { success: true, url };
    }
    return {
        error: "主窗口不可用",
        success: false
    };
});
ipcMain.handle("go-back", () => {
    if (mainWindow) {
        return { success: true };
    }
    return {
        error: "主窗口不可用",
        success: false
    };
});
ipcMain.handle("go-forward", () => {
    if (mainWindow) {
        return { success: true };
    }
    return {
        error: "主窗口不可用",
        success: false
    };
});
ipcMain.handle("refresh", () => {
    if (mainWindow) {
        return { success: true };
    }
    return {
        error: "主窗口不可用",
        success: false
    };
});
ipcMain.handle("toggle-theme", (_, isDark) => {
    return {
        isDark,
        success: true
    };
});
