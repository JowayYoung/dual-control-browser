import { SyncController } from "./sync-controller";
import { ThemeManager } from "./theme-manager";
const urlInput = document.getElementById("url-input");
const goButton = document.getElementById("go-button");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");
const refreshButton = document.getElementById("refresh-button");
const themeToggle = document.getElementById("theme-toggle");
const webviewA = document.getElementById("webview-a");
const webviewB = document.getElementById("webview-b");
const mirrorCursor = document.getElementById("mirror-cursor");
const loadingIndicatorA = document.getElementById("loading-a");
const loadingIndicatorB = document.getElementById("loading-b");
const DEFAULT_URL = "https://www.baidu.com";
let syncController;
let themeManager;
function init() {
    syncController = new SyncController(webviewA, webviewB, mirrorCursor);
    themeManager = new ThemeManager(themeToggle);
    syncController.init();
    themeManager.init();
    navigateToUrl(DEFAULT_URL);
    bindEventListeners();
}
function navigateToUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    if (loadingIndicatorA)
        loadingIndicatorA.classList.remove("hidden");
    if (loadingIndicatorB)
        loadingIndicatorB.classList.remove("hidden");
    window.electronAPI.navigate(url).then(response => {
        if (response.success) {
            webviewA.src = url;
            webviewB.src = url;
            urlInput.value = url;
        }
        else {
            console.error("导航失败:", response);
            if (!response.success) {
                if (loadingIndicatorA)
                    loadingIndicatorA.classList.add("hidden");
                if (loadingIndicatorB)
                    loadingIndicatorB.classList.add("hidden");
            }
        }
    });
}
function bindEventListeners() {
    urlInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            navigateToUrl(urlInput.value);
        }
    });
    goButton.addEventListener("click", () => {
        navigateToUrl(urlInput.value);
    });
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
    webviewA.addEventListener("dom-ready", () => {
        console.log("窗口 A 已加载");
        if (loadingIndicatorA)
            loadingIndicatorA.classList.add("hidden");
    });
    webviewB.addEventListener("dom-ready", () => {
        console.log("窗口 B 已加载");
        if (loadingIndicatorB)
            loadingIndicatorB.classList.add("hidden");
    });
    webviewA.addEventListener("did-fail-load", event => {
        console.error("窗口 A 加载失败:", event);
        if (loadingIndicatorA)
            loadingIndicatorA.classList.add("hidden");
    });
    webviewB.addEventListener("did-fail-load", event => {
        console.error("窗口 B 加载失败:", event);
        if (loadingIndicatorB)
            loadingIndicatorB.classList.add("hidden");
    });
    webviewA.addEventListener("page-title-updated", event => {
        const title = event.title;
        document.title = `${title} - 双控浏览器`;
    });
}
document.addEventListener("DOMContentLoaded", init);
