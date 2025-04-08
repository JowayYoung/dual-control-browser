var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export class SyncController {
    constructor(webviewA, webviewB, mirrorCursor) {
        this.isMouseInWindowB = false;
        this.webviewA = webviewA;
        this.webviewB = webviewB;
        this.mirrorCursor = mirrorCursor;
    }
    init() {
        this.setupMouseTracking();
        this.injectScriptsToWebviewA();
        this.setupEventListeners();
    }
    setupMouseTracking() {
        const windowB = document.getElementById("window-b");
        if (windowB) {
            windowB.addEventListener("mouseenter", () => {
                this.isMouseInWindowB = true;
                this.mirrorCursor.style.display = "none";
            });
            windowB.addEventListener("mouseleave", () => {
                this.isMouseInWindowB = false;
            });
        }
    }
    injectScriptsToWebviewA() {
        this.webviewA.addEventListener("dom-ready", () => {
            this.webviewA.executeJavaScript(`
// 创建一个函数来发送IPC消息
function sendToHost(data) {
	if (window.ipcRenderer && window.ipcRenderer.sendToHost) {
		window.ipcRenderer.sendToHost("message", data);
	} else {
		console.error("ipcRenderer not available in webview");
	}
}

// 监听鼠标移动
document.addEventListener("mousemove", (e) => {
	const rect = document.documentElement.getBoundingClientRect();
	sendToHost({
		type: "mousemove",
		x: e.clientX,
		y: e.clientY,
		maxX: rect.width,
		maxY: rect.height
	});
});

// 监听点击事件
document.addEventListener("click", (e) => {
	sendToHost({
		type: "click",
		x: e.clientX,
		y: e.clientY
	});
});

// 监听滚动事件
document.addEventListener("scroll", () => {
	sendToHost({
		type: "scroll",
		scrollX: window.scrollX,
		scrollY: window.scrollY
	});
});

// 监听键盘事件
document.addEventListener("keydown", (e) => {
	sendToHost({
		type: "keydown",
		key: e.key,
		code: e.code,
		altKey: e.altKey,
		ctrlKey: e.ctrlKey,
		metaKey: e.metaKey,
		shiftKey: e.shiftKey
	});
});
    		`);
        });
    }
    setupEventListeners() {
        this.webviewA.addEventListener("ipc-message", event => {
            if (this.isMouseInWindowB)
                return;
            if (event.channel === "message" && event.args && event.args.length > 0) {
                const eventData = event.args[0];
                if (typeof eventData === "object" && eventData !== null && "type" in eventData) {
                    const { type } = eventData, data = __rest(eventData, ["type"]);
                    this.handleEvent(type, data);
                }
            }
        });
    }
    handleEvent(type, data) {
        switch (type) {
            case "mousemove":
                this.syncMouseMove(data);
                break;
            case "click":
                this.syncClick(data);
                break;
            case "scroll":
                this.syncScroll(data);
                break;
            case "keydown":
                this.syncKeydown(data);
                break;
        }
    }
    syncMouseMove(data) {
        const relativeX = data.x / data.maxX;
        const relativeY = data.y / data.maxY;
        const rect = this.webviewB.getBoundingClientRect();
        const targetX = relativeX * rect.width;
        const targetY = relativeY * rect.height;
        this.mirrorCursor.style.display = "block";
        this.mirrorCursor.style.left = `${rect.left + targetX}px`;
        this.mirrorCursor.style.top = `${rect.top + targetY}px`;
        this.webviewB.executeJavaScript(`
const event = new MouseEvent("mousemove", {
	clientX: ${targetX},
	clientY: ${targetY},
	bubbles: true
});
document.elementFromPoint(${targetX}, ${targetY})?.dispatchEvent(event);
`);
    }
    syncClick(data) {
        const rectA = this.webviewA.getBoundingClientRect();
        const rectB = this.webviewB.getBoundingClientRect();
        const relativeX = data.x / rectA.width;
        const relativeY = data.y / rectA.height;
        const targetX = relativeX * rectB.width;
        const targetY = relativeY * rectB.height;
        this.webviewB.executeJavaScript(`
const element = document.elementFromPoint(${targetX}, ${targetY});
if (element) {
	element.click();
}
		`);
    }
    syncScroll(data) {
        this.webviewB.executeJavaScript(`
      window.scrollTo(${data.scrollX}, ${data.scrollY});
    `);
    }
    syncKeydown(data) {
        this.webviewB.executeJavaScript(`
const event = new KeyboardEvent("keydown", {
	key: "${data.key}",
	code: "${data.code}",
	altKey: ${data.altKey},
	ctrlKey: ${data.ctrlKey},
	metaKey: ${data.metaKey},
	shiftKey: ${data.shiftKey},
	bubbles: true
});
document.activeElement?.dispatchEvent(event) || document.body.dispatchEvent(event);
`);
    }
}
