import { platform } from "process";
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
    closeWindow: () => ipcRenderer.send("close-window"),
    getSystemInfo: () => platform,
    getVersionInfo: () => ipcRenderer.invoke("get-app-version"),
    maximizeWindow: () => ipcRenderer.send("maximize-window"),
    minimizeWindow: () => ipcRenderer.send("minimize-window"),
    openDevTools: () => ipcRenderer.send("open-dev-tools")
});
console.log("预加载脚本加载完成");
