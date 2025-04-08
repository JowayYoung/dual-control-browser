import { dirname, join } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";
import { BrowserWindow, app } from "electron";

// 构造__dirname等效项
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 禁用Electron安全警告
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

// 保持对窗口对象的全局引用，避免JavaScript对象被垃圾回收时窗口关闭
let mainWindow: BrowserWindow | null = null;

function CreateWindow() {
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({
		height: 800,
		minHeight: 800,
		minWidth: 1200,
		webPreferences: {
			contextIsolation: true, // 隔离主进程与渲染进程的上下文
			nodeIntegration: false, // 禁止渲染进程访问主线程的Node环境
			preload: join(__dirname, "preload.js"),
			webviewTag: true // 启用Webview标签
		},
		width: 1200
	});
	mainWindow.loadFile(join(__dirname, "index.html"));// 加载应用的index.html
	// 当窗口关闭时触发
	mainWindow.on("closed", () => {
		mainWindow = null; // 取消引用窗口对象
	});
}

// Electron完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(() => {
	CreateWindow();
	// 在MacOS中当点击Dock且没有其他窗口打开时，通常在应用程序中重新创建一个窗口
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			CreateWindow();
		}
	});
});

// 当所有窗口关闭时退出应用
app.on("window-all-closed", () => {
	// 在MacOS中除非用户使用Cmd+Q明确退出，否则应用及其菜单栏通常会保持活动状态
	if (platform !== "darwin") {
		app.quit();
	}
});