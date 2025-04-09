import { contextBridge } from "electron";

// preload.js：用于安全地暴露Electron API给到渲染进程
// preload.js无法直接引入node:process，但是可以直接使用node:process

// 暴露安全的API给到渲染进程
contextBridge.exposeInMainWorld("eapi", {
	chromeVer: () => process.versions.chrome,
	electronVer: () => process.versions.electron,
	nodeVer: () => process.versions.node
});