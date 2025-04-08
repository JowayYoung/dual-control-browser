import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// 定义事件回调函数的类型
type CallbackFunction<T = unknown> = (data: T) => void;

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
	goBack: () => ipcRenderer.invoke("go-back"),
	goForward: () => ipcRenderer.invoke("go-forward"),
	navigate: (url: string) => ipcRenderer.invoke("navigate", url),
	// 添加事件监听器的安全方法
	on: <T = unknown>(channel: string, callback: CallbackFunction<T>) => {
		// 白名单频道列表
		const validChannels = ["theme-changed"];
		if (validChannels.includes(channel)) {
			// 转发IPC事件到渲染进程
			const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(args[0] as T);
			ipcRenderer.on(channel, subscription);
			// 返回清理函数
			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		}
		return () => {}; // 无效频道返回空函数
	},
	refresh: () => ipcRenderer.invoke("refresh"),
	toggleTheme: (isDark: boolean) => ipcRenderer.invoke("toggle-theme", isDark)
});

// 预加载脚本完成加载
console.log("预加载脚本已加载");