const urlInput = document.getElementById("url-input");
const goButton = document.getElementById("go-button");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");
const refreshButton = document.getElementById("refresh-button");
const themeBtn = document.getElementById("theme-btn");
const webviewA = document.getElementById("webview-a");
const webviewB = document.getElementById("webview-b");
const DEFAULT_URL = "https://baidu.com";
function GotoUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    webviewA.src = url;
    webviewB.src = url;
    urlInput.value = url;
}
function UpdateNavBtns() {
    const isGoBack = webviewA.canGoBack();
    const isGoForward = webviewA.canGoForward();
    backButton.disabled = !isGoBack;
    backButton.classList.toggle("opacity-50", !isGoBack);
    forwardButton.disabled = !isGoForward;
    forwardButton.classList.toggle("opacity-50", !isGoForward);
}
function LoadTheme() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        document.documentElement.classList.add("dark");
    }
    else {
        document.documentElement.classList.remove("dark");
    }
}
function InitWebviews() {
    webviewA.src = DEFAULT_URL;
    webviewB.src = DEFAULT_URL;
    webviewA.addEventListener("did-navigate", () => {
        urlInput.value = webviewA.getURL();
        UpdateNavBtns();
    });
    webviewA.addEventListener("did-navigate-in-page", () => {
        urlInput.value = webviewA.getURL();
        UpdateNavBtns();
    });
    webviewA.addEventListener("dom-ready", () => {
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
        webviewB.executeJavaScript(`
window.addEventListener("scroll", () => {
	window.scrollData = {
		scrollX: window.scrollX,
		scrollY: window.scrollY
	};
});
    	`);
    });
}
function SetupEventListeners() {
    urlInput.addEventListener("keypress", e => {
        e.key === "Enter" && GotoUrl(urlInput.value);
    });
    goButton.addEventListener("click", () => {
        GotoUrl(urlInput.value);
    });
    backButton.addEventListener("click", () => {
        if (webviewA.canGoBack()) {
            webviewA.goBack();
            webviewB.goBack();
        }
    });
    forwardButton.addEventListener("click", () => {
        if (webviewA.canGoForward()) {
            webviewA.goForward();
            webviewB.goForward();
        }
    });
    refreshButton.addEventListener("click", () => {
        webviewA.reload();
        webviewB.reload();
    });
    themeBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const isDarkMode = document.documentElement.classList.contains("dark");
        localStorage.setItem("darkMode", isDarkMode.toString());
    });
}
function InitApp() {
    LoadTheme();
    InitWebviews();
    SetupEventListeners();
}
document.addEventListener("DOMContentLoaded", InitApp);
export {};
