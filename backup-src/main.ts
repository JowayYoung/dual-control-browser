import { app, BrowserWindow, ipcMain, session } from "electron";
import { join, dirname } from "path";
import { platform } from "process";
import { fileURLToPath } from "url";

// 创建等效的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 处理在Windows上安装/卸载时创建/删除快捷方式
if (platform === "win32") {
	import("electron-squirrel-startup").then(squirrelStartup => {
		if (squirrelStartup.default) {
			app.quit();
		}
	});
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({
		height: 800,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: join(__dirname, "preload.js"),
			webviewTag: true
		},
		width: 1200
	});
	// 加载应用的index.html
	mainWindow.loadFile(join(__dirname, "index.html"));
	// 设置窗口为全屏
	mainWindow.setFullScreen(true);
	// 在开发模式下打开开发者工具
	if (process.env.NODE_ENV === "development") {
		mainWindow.webContents.openDevTools();
	}
	// 为 webviews 设置内容安全策略
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": ["default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:"]
			}
		});
	});
};

// 当 Electron 完成初始化时，将调用此方法
app.on("ready", createWindow);

// 当所有窗口关闭时退出应用，在 macOS 上除外
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，
	// 通常会在应用程序中重新创建一个窗口
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// 浏览器导航的 IPC 处理程序
ipcMain.handle("navigate", (_, url: string) => {
	if (mainWindow) {
		return { success: true, url };
	}
	return {
		error: "主窗口不可用",
		success: false
	};
});

ipcMain.handle("go-back", () => {
	if (mainWindow) {
		return { success: true };
	}
	return {
		error: "主窗口不可用",
		success: false
	};
});

ipcMain.handle("go-forward", () => {
	if (mainWindow) {
		return { success: true };
	}
	return {
		error: "主窗口不可用",
		success: false
	};
});

ipcMain.handle("refresh", () => {
	if (mainWindow) {
		return { success: true };
	}
	return {
		error: "主窗口不可用",
		success: false
	};
});

// 处理主题变更
ipcMain.handle("toggle-theme", (_, isDark: boolean) => {
	return {
		isDark,
		success: true
	};
});