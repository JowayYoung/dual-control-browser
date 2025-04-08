import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
    navigate: (url) => ipcRenderer.send("navigate", url),
    onLoadUrl: (callback) => {
        const subscription = (_event, url) => callback(url);
        ipcRenderer.on("load-url", subscription);
        return () => ipcRenderer.removeListener("load-url", subscription);
    }
});
