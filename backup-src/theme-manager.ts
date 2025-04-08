export class ThemeManager {
	private isDarkTheme: boolean = false;
	private themeToggleButton: HTMLElement;
	constructor(themeToggleButton: HTMLElement) {
		this.themeToggleButton = themeToggleButton;
		this.bindEvents();
	}
	// 初始化主题
	public init(): void {
		this.checkSystemThemePreference();
	}
	// 绑定事件
	private bindEvents(): void {
		// 主题切换按钮点击事件
		this.themeToggleButton.addEventListener("click", () => {
			this.toggleTheme();
		});
	}
	// 切换主题
	private toggleTheme(): void {
		this.isDarkTheme = !this.isDarkTheme;
		this.applyTheme(this.isDarkTheme);

		// 通知主进程主题已更改
		window.electronAPI.toggleTheme(this.isDarkTheme);
	}
	// 应用主题
	private applyTheme(isDark: boolean): void {
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}
	// 检查系统主题偏好
	private checkSystemThemePreference(): void {
		// 检查系统是否支持主题偏好
		if (window.matchMedia) {
			// 检查当前系统主题
			const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

			// 应用初始主题
			this.isDarkTheme = darkModeMediaQuery.matches;
			this.applyTheme(this.isDarkTheme);

			// 监听系统主题变化
			darkModeMediaQuery.addEventListener("change", e => {
				this.isDarkTheme = e.matches;
				this.applyTheme(this.isDarkTheme);
			});
		}
	}
	// 获取当前主题状态
	public isDark(): boolean {
		return this.isDarkTheme;
	}
	// 设置主题
	public setTheme(isDark: boolean): void {
		if (this.isDarkTheme !== isDark) {
			this.isDarkTheme = isDark;
			this.applyTheme(isDark);
		}
	}
}