// 渲染进程脚本

// DOM元素
let urlInput: HTMLInputElement;
let goButton: HTMLButtonElement;
let backButton: HTMLButtonElement;
let forwardButton: HTMLButtonElement;
let refreshButton: HTMLButtonElement;
let themeToggle: HTMLButtonElement;
let webviewA: Electron.WebviewTag;
let webviewB: Electron.WebviewTag;

// 当前主题 (light/dark)
let currentTheme = "light";

// 初始化函数
function init() {
	// 获取DOM元素
	urlInput = document.getElementById("url-input") as HTMLInputElement;
	goButton = document.getElementById("go-button") as HTMLButtonElement;
	backButton = document.getElementById("back-button") as HTMLButtonElement;
	forwardButton = document.getElementById("forward-button") as HTMLButtonElement;
	refreshButton = document.getElementById("refresh-button") as HTMLButtonElement;
	themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;
	webviewA = document.getElementById("webview-a") as Electron.WebviewTag;
	webviewB = document.getElementById("webview-b") as Electron.WebviewTag;

	// 设置事件监听器
	setupEventListeners();

	// 初始化主题
	applyTheme(currentTheme);

	// 初始加载默认页面
	navigateToUrl("https://www.bing.com");
}

// 设置事件监听器
function setupEventListeners() {
	// 导航按钮点击事件
	goButton.addEventListener("click", () => {
		const url = urlInput.value.trim();
		if (url) {
			navigateToUrl(url);
		}
	});

	// 回车键导航
	urlInput.addEventListener("keypress", e => {
		if (e.key === "Enter") {
			const url = urlInput.value.trim();
			if (url) {
				navigateToUrl(url);
			}
		}
	});

	// 后退按钮
	backButton.addEventListener("click", () => {
		if (webviewA.canGoBack()) {
			webviewA.goBack();
			webviewB.goBack();
		}
	});

	// 前进按钮
	forwardButton.addEventListener("click", () => {
		if (webviewA.canGoForward()) {
			webviewA.goForward();
			webviewB.goForward();
		}
	});

	// 刷新按钮
	refreshButton.addEventListener("click", () => {
		webviewA.reload();
		webviewB.reload();
	});

	// 主题切换按钮
	themeToggle.addEventListener("click", () => {
		currentTheme = currentTheme === "light" ? "dark" : "light";
		applyTheme(currentTheme);
	});

	// 监听webview导航事件以更新URL输入框
	webviewA.addEventListener("did-navigate", e => {
		urlInput.value = e.url;
		updateNavigationButtons();
	});

	// 从主进程接收URL导航请求
	window.electronAPI.onLoadUrl(url => {
		navigateToUrl(url);
	});
}

// 导航到指定URL
function navigateToUrl(url: string) {
	// 确保URL格式正确
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = "https://" + url;
	}

	// 更新输入框
	urlInput.value = url;

	// 导航两个webview
	webviewA.src = url;
	webviewB.src = url;

	// 通知主进程当前导航的URL（可选，取决于是否需要主进程知道当前URL）
	window.electronAPI.navigate(url);
}

// 更新导航按钮状态
function updateNavigationButtons() {
	backButton.disabled = !webviewA.canGoBack();
	forwardButton.disabled = !webviewA.canGoForward();
}

// 应用主题
function applyTheme(theme: string) {
	const root = document.documentElement;
	const themeIcon = document.getElementById("theme-icon") as HTMLElement;

	if (theme === "dark") {
		root.classList.add("dark");
		themeIcon.textContent = "light_mode"; // 显示太阳图标
	} else {
		root.classList.remove("dark");
		themeIcon.textContent = "dark_mode"; // 显示月亮图标
	}
}

// 当DOM加载完成后初始化
document.addEventListener("DOMContentLoaded", init);