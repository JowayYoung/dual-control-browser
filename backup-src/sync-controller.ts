// 鼠标移动事件数据接口
interface MouseMoveData {
	x: number
	y: number
	maxX: number
	maxY: number
}

// 点击事件数据接口
interface ClickData {
	x: number
	y: number
}

// 滚动事件数据接口
interface ScrollData {
	scrollX: number
	scrollY: number
}

// 键盘事件数据接口
interface KeyboardData {
	key: string
	code: string
	altKey: boolean
	ctrlKey: boolean
	metaKey: boolean
	shiftKey: boolean
}

// 事件类型
type EventType = "mousemove" | "click" | "scroll" | "keydown";

// 事件数据类型
type EventData = MouseMoveData | ClickData | ScrollData | KeyboardData;

/**
 * 同步控制器类
 */
export class SyncController {
	private webviewA: Electron.WebviewTag;
	private webviewB: Electron.WebviewTag;
	private mirrorCursor: HTMLElement;
	private isMouseInWindowB: boolean = false;
	constructor(webviewA: Electron.WebviewTag, webviewB: Electron.WebviewTag, mirrorCursor: HTMLElement) {
		this.webviewA = webviewA;
		this.webviewB = webviewB;
		this.mirrorCursor = mirrorCursor;
	}
	// 初始化同步控制
	public init(): void {
		this.setupMouseTracking();
		this.injectScriptsToWebviewA();
		this.setupEventListeners();
	}
	// 设置鼠标跟踪
	private setupMouseTracking(): void {
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
	// 向窗口A注入脚本
	private injectScriptsToWebviewA(): void {
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
	// 设置事件监听器
	private setupEventListeners(): void {
		this.webviewA.addEventListener("ipc-message", event => {
			if (this.isMouseInWindowB) return; // 如果鼠标在窗口B中，不同步事件

			if (event.channel === "message" && event.args && event.args.length > 0) {
				const eventData = event.args[0];
				if (typeof eventData === "object" && eventData !== null && "type" in eventData) {
					const { type, ...data } = eventData;
					this.handleEvent(type as EventType, data as EventData);
				}
			}
		});
	}
	// 处理事件
	private handleEvent(type: EventType, data: EventData): void {
		switch (type) {
			case "mousemove":
				this.syncMouseMove(data as MouseMoveData);
				break;
			case "click":
				this.syncClick(data as ClickData);
				break;
			case "scroll":
				this.syncScroll(data as ScrollData);
				break;
			case "keydown":
				this.syncKeydown(data as KeyboardData);
				break;
		}
	}
	// 同步鼠标移动
	private syncMouseMove(data: MouseMoveData): void {
		// 计算相对位置
		const relativeX = data.x / data.maxX;
		const relativeY = data.y / data.maxY;

		// 获取窗口B的尺寸
		const rect = this.webviewB.getBoundingClientRect();
		const targetX = relativeX * rect.width;
		const targetY = relativeY * rect.height;

		// 更新镜像光标位置
		this.mirrorCursor.style.display = "block";
		this.mirrorCursor.style.left = `${rect.left + targetX}px`;
		this.mirrorCursor.style.top = `${rect.top + targetY}px`;

		// 在窗口B中模拟鼠标移动
		this.webviewB.executeJavaScript(`
const event = new MouseEvent("mousemove", {
	clientX: ${targetX},
	clientY: ${targetY},
	bubbles: true
});
document.elementFromPoint(${targetX}, ${targetY})?.dispatchEvent(event);
`);
	}
	// 同步点击事件
	private syncClick(data: ClickData): void {
		// 获取窗口B的尺寸
		const rectA = this.webviewA.getBoundingClientRect();
		const rectB = this.webviewB.getBoundingClientRect();

		// 计算相对位置
		const relativeX = data.x / rectA.width;
		const relativeY = data.y / rectA.height;

		// 转换为窗口B中的坐标
		const targetX = relativeX * rectB.width;
		const targetY = relativeY * rectB.height;

		this.webviewB.executeJavaScript(`
const element = document.elementFromPoint(${targetX}, ${targetY});
if (element) {
	element.click();
}
		`);
	}
	// 同步滚动事件
	private syncScroll(data: ScrollData): void {
		this.webviewB.executeJavaScript(`
      window.scrollTo(${data.scrollX}, ${data.scrollY});
    `);
	}
	// 同步键盘事件
	private syncKeydown(data: KeyboardData): void {
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