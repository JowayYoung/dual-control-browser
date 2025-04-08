import { app, BrowserWindow, ipcMain } from "electron";
import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";

// 获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 保存主窗口的引用
let mainWindow: BrowserWindow | null = null;

// 创建主窗口
function createWindow() {
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({
		height: 800,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: join(__dirname, "preload.js"),
			webviewTag: true // 启用webview标签
		},
		width: 1200
	});
	// 加载index.html
	mainWindow.loadFile(join(__dirname, "../src/index.html"));
	// 打开开发者工具
	// mainWindow.webContents.openDevTools();
	// 关闭窗口时清除引用
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
	createWindow();
	app.on("activate", () => {
		// 在macOS上，当点击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// 当所有窗口关闭时退出应用
app.on("window-all-closed", () => {
	// 在macOS上，除非用户使用Cmd + Q明确退出，否则应用及其菜单栏通常会保持活动状态
	platform !== "darwin" && app.quit();
});

// 处理导航请求
ipcMain.on("navigate", (event, url) => {
	if (mainWindow) {
		// 将URL发送到渲染进程
		mainWindow.webContents.send("load-url", url);
	}
});