import { versions } from "node:process";
import { contextBridge } from "electron";

// 预加载脚本，用于安全地暴露Electron API给到渲染进程

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld("eapi", {
	chromeVer: () => versions.chrome,
	electronVer: () => versions.electron,
	nodeVer: () => versions.node
});