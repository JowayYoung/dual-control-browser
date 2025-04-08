import { BrowserWindow, app, ipcMain } from "electron";
import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";

// 获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 保存主窗口引用
let mainWindow: BrowserWindow | null = null;

// 创建主窗口
function CreateWindow() {
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({
		height: 1000,
		minHeight: 1000,
		minWidth: 1600,
		webPreferences: {
			contextIsolation: true, // 隔离主进程与渲染进程的上下文
			nodeIntegration: false, // 禁止渲染进程访问主线程的Node环境
			preload: join(__dirname, "preload.js"),
			webviewTag: true // 启用Webview标签
		},
		width: 1600
	});
	// 加载应用入口文件
	mainWindow.loadFile(join(__dirname, "../src/index.html"));
	// 打开开发者工具
	mainWindow.webContents.openDevTools();
	// 关闭窗口时清除引用
	mainWindow.on("closed", () => mainWindow = null);
}

// 当Electron完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(() => {
	CreateWindow();
	app.on("activate", () => {
		// 在MacOS中点击Dock且没有其他窗口打开时，通常在应用程序中重新创建一个窗口
		BrowserWindow.getAllWindows().length === 0 && CreateWindow();
	});
});

// 当所有窗口关闭时退出应用
app.on("window-all-closed", () => {
	// 在MacOS中除非用户使用Cmd+Q明确退出，否则应用及其菜单栏通常会保持活动状态
	platform !== "darwin" && app.quit();
});

// 处理导航请求
ipcMain.on("navigate", (e, url) => {
	// 将URL发送到渲染进程
	!!mainWindow && mainWindow.webContents.send("load-url", url);
});