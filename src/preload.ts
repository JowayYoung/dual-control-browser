import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

// 预加载脚本，用于安全地暴露Electron API给到渲染进程

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
	// 导航到URL
	navigate: (url: string) => ipcRenderer.send("navigate", url),
	// 监听URL加载事件
	onLoadUrl: (callback: (url: string) => void) => {
		const subscription = (_event: IpcRendererEvent, url: string) => callback(url);
		ipcRenderer.on("load-url", subscription);
		return () => ipcRenderer.removeListener("load-url", subscription); // 返回一个清理函数，用于移除事件监听器
	}
});