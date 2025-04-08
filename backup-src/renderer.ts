// 引入同步控制器和主题管理器
import { SyncController } from "./sync-controller";
import { ThemeManager } from "./theme-manager";

// DOM 元素
const urlInput = document.getElementById("url-input") as HTMLInputElement;
const goButton = document.getElementById("go-button") as HTMLButtonElement;
const backButton = document.getElementById("back-button") as HTMLButtonElement;
const forwardButton = document.getElementById("forward-button") as HTMLButtonElement;
const refreshButton = document.getElementById("refresh-button") as HTMLButtonElement;
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;
const webviewA = document.getElementById("webview-a") as Electron.WebviewTag;
const webviewB = document.getElementById("webview-b") as Electron.WebviewTag;
const mirrorCursor = document.getElementById("mirror-cursor") as HTMLDivElement;
// 添加加载指示器元素
const loadingIndicatorA = document.getElementById("loading-a") as HTMLElement;
const loadingIndicatorB = document.getElementById("loading-b") as HTMLElement;

// 初始 URL
const DEFAULT_URL = "https://www.baidu.com";

// 创建同步控制器和主题管理器实例
let syncController: SyncController;
let themeManager: ThemeManager;

// 初始化函数
function init(): void {
	// 初始化同步控制器和主题管理器
	syncController = new SyncController(webviewA, webviewB, mirrorCursor);
	themeManager = new ThemeManager(themeToggle);

	// 初始化同步控制器和主题管理器
	syncController.init();
	themeManager.init();

	// 设置初始 URL
	navigateToUrl(DEFAULT_URL);

	// 绑定事件监听器
	bindEventListeners();
}

// 导航到指定 URL
function navigateToUrl(url: string): void {
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = "https://" + url;
	}

	// 显示加载指示器
	if (loadingIndicatorA) loadingIndicatorA.classList.remove("hidden");
	if (loadingIndicatorB) loadingIndicatorB.classList.remove("hidden");

	console.log("正在导航到:", url); // 添加日志

	// 直接设置 webview 的 src
	webviewA.src = url;
	webviewB.src = url;
	urlInput.value = url;

	// 同时通知主进程
	window.electronAPI.navigate(url).then(response => {
		if (!response.success) {
			console.error("导航失败:", response);
			// 如果导航失败，隐藏加载指示器
			if (loadingIndicatorA) loadingIndicatorA.classList.add("hidden");
			if (loadingIndicatorB) loadingIndicatorB.classList.add("hidden");
		}
	});
}

// 绑定事件监听器
function bindEventListeners(): void {
	// URL 输入和导航
	urlInput.addEventListener("keydown", e => {
		if (e.key === "Enter") {
			navigateToUrl(urlInput.value);
		}
	});
	goButton.addEventListener("click", () => {
		navigateToUrl(urlInput.value);
	});

	// 导航按钮
	backButton.addEventListener("click", () => {
		window.electronAPI.goBack().then(() => {
			webviewA.goBack();
			webviewB.goBack();
		});
	});
	forwardButton.addEventListener("click", () => {
		window.electronAPI.goForward().then(() => {
			webviewA.goForward();
			webviewB.goForward();
		});
	});
	refreshButton.addEventListener("click", () => {
		window.electronAPI.refresh().then(() => {
			webviewA.reload();
			webviewB.reload();
		});
	});

	// Webview 加载完成事件
	webviewA.addEventListener("dom-ready", () => {
		console.log("窗口 A 已加载");
		if (loadingIndicatorA) loadingIndicatorA.classList.add("hidden");

		// 添加调试信息
		webviewA.executeJavaScript(`
			console.log("窗口 A 内部 JavaScript 执行");
			document.title = "已加载 - " + document.title;
		`);
	});

	// 添加更多的事件监听，帮助调试
	webviewA.addEventListener("did-start-loading", () => {
		console.log("窗口 A 开始加载");
	});

	webviewA.addEventListener("did-stop-loading", () => {
		console.log("窗口 A 停止加载");
	});
	webviewB.addEventListener("dom-ready", () => {
		console.log("窗口 B 已加载");
		if (loadingIndicatorB) loadingIndicatorB.classList.add("hidden");
	});

	// 添加错误处理
	webviewA.addEventListener("did-fail-load", event => {
		console.error("窗口 A 加载失败:", event);
		if (loadingIndicatorA) loadingIndicatorA.classList.add("hidden");
	});

	webviewB.addEventListener("did-fail-load", event => {
		console.error("窗口 B 加载失败:", event);
		if (loadingIndicatorB) loadingIndicatorB.classList.add("hidden");
	});

	// 监听 webview 的标题变化，可以更新浏览器标题
	webviewA.addEventListener("page-title-updated", event => {
		const title = event.title;
		document.title = `${title} - 双控浏览器`;
	});
}

// 启动应用
document.addEventListener("DOMContentLoaded", init);