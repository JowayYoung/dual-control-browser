"use strict";
let urlInput;
let goBtn;
let backBtn;
let forwardBtn;
let refreshBtn;
let themeBtn;
let webviewA;
let webviewB;
let currTheme = "light";
const DEFAULT_URL = "https://www.loreal-boutique.com/";
function ApplyTheme(theme = "light") {
    const root = document.documentElement;
    const themeIcon = document.getElementById("theme-icon");
    if (theme === "dark") {
        root.classList.add("dark");
        themeIcon.textContent = "light_mode";
    }
    else {
        root.classList.remove("dark");
        themeIcon.textContent = "dark_mode";
    }
}
function GotoUrl(url = "") {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    urlInput.value = url;
    webviewA.src = url;
    webviewB.src = url;
}
function SetupEventListeners() {
    urlInput.addEventListener("keypress", e => {
        const url = urlInput.value.trim();
        e.key === "Enter" && !!url && GotoUrl(url);
    });
    goBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        !!url && GotoUrl(url);
    });
    backBtn.addEventListener("click", () => {
        if (webviewA.canGoBack()) {
            webviewA.goBack();
            webviewB.goBack();
        }
    });
    forwardBtn.addEventListener("click", () => {
        if (webviewA.canGoForward()) {
            webviewA.goForward();
            webviewB.goForward();
        }
    });
    refreshBtn.addEventListener("click", () => {
        webviewA.reload();
        webviewB.reload();
    });
    themeBtn.addEventListener("click", () => {
        currTheme = currTheme === "light" ? "dark" : "light";
        ApplyTheme(currTheme);
    });
    webviewA.addEventListener("did-navigate", e => {
        urlInput.value = e.url;
        backBtn.disabled = !webviewA.canGoBack();
        forwardBtn.disabled = !webviewA.canGoForward();
    });
}
function InitApp() {
    urlInput = document.getElementById("url-input");
    goBtn = document.getElementById("go-btn");
    backBtn = document.getElementById("back-btn");
    forwardBtn = document.getElementById("forward-btn");
    refreshBtn = document.getElementById("refresh-btn");
    themeBtn = document.getElementById("theme-btn");
    webviewA = document.getElementById("webview-a");
    webviewB = document.getElementById("webview-b");
    ApplyTheme(currTheme);
    SetupEventListeners();
    setTimeout(() => GotoUrl(DEFAULT_URL), 500);
    console.log("Electron Version: ", window.eapi.electronVer());
    console.log("Chrome Version: ", window.eapi.chromeVer());
    console.log("Node Version: ", window.eapi.nodeVer());
}
document.addEventListener("DOMContentLoaded", InitApp);
