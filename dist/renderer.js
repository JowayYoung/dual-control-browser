"use strict";
let urlInput;
let goButton;
let backButton;
let forwardButton;
let refreshButton;
let themeToggle;
let webviewA;
let webviewB;
let currentTheme = "light";
function init() {
    urlInput = document.getElementById("url-input");
    goButton = document.getElementById("go-button");
    backButton = document.getElementById("back-button");
    forwardButton = document.getElementById("forward-button");
    refreshButton = document.getElementById("refresh-button");
    themeToggle = document.getElementById("theme-toggle");
    webviewA = document.getElementById("webview-a");
    webviewB = document.getElementById("webview-b");
    setupEventListeners();
    applyTheme(currentTheme);
    navigateToUrl("https://www.bing.com");
}
function setupEventListeners() {
    goButton.addEventListener("click", () => {
        const url = urlInput.value.trim();
        if (url) {
            navigateToUrl(url);
        }
    });
    urlInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            const url = urlInput.value.trim();
            if (url) {
                navigateToUrl(url);
            }
        }
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
    themeToggle.addEventListener("click", () => {
        currentTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme(currentTheme);
    });
    webviewA.addEventListener("did-navigate", e => {
        urlInput.value = e.url;
        updateNavigationButtons();
    });
    window.electronAPI.onLoadUrl(url => {
        navigateToUrl(url);
    });
}
function navigateToUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    urlInput.value = url;
    webviewA.src = url;
    webviewB.src = url;
    window.electronAPI.navigate(url);
}
function updateNavigationButtons() {
    backButton.disabled = !webviewA.canGoBack();
    forwardButton.disabled = !webviewA.canGoForward();
}
function applyTheme(theme) {
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
document.addEventListener("DOMContentLoaded", init);
