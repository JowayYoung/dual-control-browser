let urlInput: HTMLInputElement;
let goBtn: HTMLButtonElement;
let backBtn: HTMLButtonElement;
let forwardBtn: HTMLButtonElement;
let refreshBtn: HTMLButtonElement;
let themeBtn: HTMLButtonElement;
let webviewA: Electron.WebviewTag;
let webviewB: Electron.WebviewTag;

let currTheme: "light" | "dark" = "light";

// 应用主题
function ApplyTheme(theme: "dark" | "light" = "light") {
	const root = document.documentElement;
	const themeIcon = document.getElementById("theme-icon") as HTMLElement;
	if (theme === "dark") {
		root.classList.add("dark");
		themeIcon.textContent = "light_mode";
	} else {
		root.classList.remove("dark");
		themeIcon.textContent = "dark_mode";
	}
}

// 设置事件监听器
function SetupEventListeners() {
	// 回车导航
	urlInput.addEventListener("keypress", e => {
		if (e.key === "Enter") {
			const url = urlInput.value.trim();
			!!url && GotoUrl(url);
		}
	});
	// 导航按钮
	goBtn.addEventListener("click", () => {
		const url = urlInput.value.trim();
		!!url && GotoUrl(url);
	});
	// 后退按钮
	backBtn.addEventListener("click", () => {
		if (webviewA.canGoBack()) {
			webviewA.goBack();
			webviewB.goBack();
		}
	});
	// 前进按钮
	forwardBtn.addEventListener("click", () => {
		if (webviewA.canGoForward()) {
			webviewA.goForward();
			webviewB.goForward();
		}
	});
	// 刷新按钮
	refreshBtn.addEventListener("click", () => {
		webviewA.reload();
		webviewB.reload();
	});
	// 主题按钮
	themeBtn.addEventListener("click", () => {
		currTheme = currTheme === "light" ? "dark" : "light";
		ApplyTheme(currTheme);
	});
	// 监听Webview导航事件以更新URL输入框
	webviewA.addEventListener("did-navigate", e => {
		urlInput.value = e.url;
		backBtn.disabled = !webviewA.canGoBack();
		forwardBtn.disabled = !webviewA.canGoForward();
	});
	// 从主进程接收URL导航请求
	window.electronAPI.onLoadUrl(url => GotoUrl(url));
}

// 导航到指定URL
function GotoUrl(url: string = "") {
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

// 初始化应用
function InitApp() {
	urlInput = document.getElementById("url-input") as HTMLInputElement;
	goBtn = document.getElementById("go-btn") as HTMLButtonElement;
	backBtn = document.getElementById("back-btn") as HTMLButtonElement;
	forwardBtn = document.getElementById("forward-btn") as HTMLButtonElement;
	refreshBtn = document.getElementById("refresh-btn") as HTMLButtonElement;
	themeBtn = document.getElementById("theme-toggle") as HTMLButtonElement;
	webviewA = document.getElementById("webview-a") as Electron.WebviewTag;
	webviewB = document.getElementById("webview-b") as Electron.WebviewTag;
	ApplyTheme(currTheme);
	SetupEventListeners();
	GotoUrl("https://baidu.com");
}

// 当DOM加载完成初始化应用
document.addEventListener("DOMContentLoaded", InitApp);