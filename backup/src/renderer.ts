import type { WebviewTag } from "electron";

const urlInput = document.getElementById("url-input") as HTMLInputElement;
const goButton = document.getElementById("go-button") as HTMLButtonElement;
const backButton = document.getElementById("back-button") as HTMLButtonElement;
const forwardButton = document.getElementById("forward-button") as HTMLButtonElement;
const refreshButton = document.getElementById("refresh-button") as HTMLButtonElement;
const themeBtn = document.getElementById("theme-btn") as HTMLButtonElement;
const webviewA = document.getElementById("webview-a") as WebviewTag;
const webviewB = document.getElementById("webview-b") as WebviewTag;

const DEFAULT_URL = "https://baidu.com";

// 标记滚动状态，防止无限循环同步
// const isScrolling = {
// 	a: false,
// 	b: false
// };

// 跳转指定URL
function GotoUrl(url: string) {
	// 确保URL格式正确
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = "https://" + url;
	}
	webviewA.src = url;
	webviewB.src = url;
	urlInput.value = url;
}

// 同步滚动位置
// async function SyncScrollPos() {
// 	// 获取窗口滚动位置
// 	const scrollDataA = await webviewA.executeJavaScript("window.scrollData");
// 	const scrollDataB = await webviewB.executeJavaScript("window.scrollData");
// 	// 同步滚动位置
// 	if (scrollDataA && !isScrolling.b) {
// 		isScrolling.a = true;
// 		await webviewB.executeJavaScript(`
// window.scrollTo(${scrollDataA.scrollX}, ${scrollDataA.scrollY});
// 		`);
// 		setTimeout(() => {
// 			isScrolling.a = false;
// 		}, 50);
// 	} else if (scrollDataB && !isScrolling.a) {
// 		isScrolling.b = true;
// 		await webviewA.executeJavaScript(`
// window.scrollTo(${scrollDataB.scrollX}, ${scrollDataB.scrollY});
// 		`);
// 		setTimeout(() => {
// 			isScrolling.b = false;
// 		}, 50);
// 	}
// }

// 更新导航按钮状态
function UpdateNavBtns() {
	const isGoBack = webviewA.canGoBack();
	const isGoForward = webviewA.canGoForward();
	backButton.disabled = !isGoBack;
	backButton.classList.toggle("opacity-50", !isGoBack);
	forwardButton.disabled = !isGoForward;
	forwardButton.classList.toggle("opacity-50", !isGoForward);
}

// -----主函数-----

// 加载保存的主题设置
function LoadTheme() {
	const isDarkMode = localStorage.getItem("darkMode") === "true";
	if (isDarkMode) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}

// 初始化webview
function InitWebviews() {
	webviewA.src = DEFAULT_URL;
	webviewB.src = DEFAULT_URL;
	// 监听Webview加载完成事件，更新地址栏
	webviewA.addEventListener("did-navigate", () => { // 监听页面主导航完成事件
		urlInput.value = webviewA.getURL();
		UpdateNavBtns();
	});
	webviewA.addEventListener("did-navigate-in-page", () => { // 监听页面内部导航完成事件
		urlInput.value = webviewA.getURL();
		UpdateNavBtns();
	});
	// 同步两个Webview的滚动位置
	webviewA.addEventListener("dom-ready", () => {
		// 监听A窗口滚动
		webviewA.executeJavaScript(`
window.addEventListener("scroll", () => {
	window.scrollData = {
		scrollX: window.scrollX,
		scrollY: window.scrollY
	};
});
    	`);
	});
	webviewB.addEventListener("dom-ready", () => {
		// 监听B窗口滚动
		webviewB.executeJavaScript(`
window.addEventListener("scroll", () => {
	window.scrollData = {
		scrollX: window.scrollX,
		scrollY: window.scrollY
	};
});
    	`);
	});
	// 定期同步滚动位置
	// setInterval(SyncScrollPos, 100);
}

// 事件监听
function SetupEventListeners() {
	// 回车导航
	urlInput.addEventListener("keypress", e => {
		e.key === "Enter" && GotoUrl(urlInput.value);
	});
	// 导航按钮
	goButton.addEventListener("click", () => {
		GotoUrl(urlInput.value);
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
	// 主题按钮
	themeBtn.addEventListener("click", () => {
		document.documentElement.classList.toggle("dark");
		const isDarkMode = document.documentElement.classList.contains("dark");
		localStorage.setItem("darkMode", isDarkMode.toString());
	});
}

// 初始化应用
function InitApp() {
	LoadTheme();
	InitWebviews();
	SetupEventListeners();
}

// 当DOM加载完成后初始化应用
document.addEventListener("DOMContentLoaded", InitApp);