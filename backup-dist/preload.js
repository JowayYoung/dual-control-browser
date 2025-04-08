import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
    goBack: () => ipcRenderer.invoke("go-back"),
    goForward: () => ipcRenderer.invoke("go-forward"),
    navigate: (url) => ipcRenderer.invoke("navigate", url),
    on: (channel, callback) => {
        const validChannels = ["theme-changed"];
        if (validChannels.includes(channel)) {
            const subscription = (_event, ...args) => callback(args[0]);
            ipcRenderer.on(channel, subscription);
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }
        return () => { };
    },
    refresh: () => ipcRenderer.invoke("refresh"),
    toggleTheme: (isDark) => ipcRenderer.invoke("toggle-theme", isDark)
});
console.log("预加载脚本已加载");
