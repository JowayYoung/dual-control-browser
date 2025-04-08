import { platform } from "process";
import { contextBridge, ipcRenderer } from "electron";

// 在window对象中暴露API给渲染进程使用
contextBridge.exposeInMainWorld("electronAPI", {
	closeWindow: () => ipcRenderer.send("close-window"), // 关闭窗口
	getSystemInfo: () => platform, // 获取系统信息
	getVersionInfo: () => ipcRenderer.invoke("get-app-version"), // 获取版本信息
	maximizeWindow: () => ipcRenderer.send("maximize-window"), // 最大化窗口
	minimizeWindow: () => ipcRenderer.send("minimize-window"), // 最小化窗口
	openDevTools: () => ipcRenderer.send("open-dev-tools") // 打开开发者工具
});

// 初始化完成
console.log("预加载脚本加载完成");