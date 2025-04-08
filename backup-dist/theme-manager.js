export class ThemeManager {
    constructor(themeToggleButton) {
        this.isDarkTheme = false;
        this.themeToggleButton = themeToggleButton;
        this.bindEvents();
    }
    init() {
        this.checkSystemThemePreference();
    }
    bindEvents() {
        this.themeToggleButton.addEventListener("click", () => {
            this.toggleTheme();
        });
    }
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme(this.isDarkTheme);
        window.electronAPI.toggleTheme(this.isDarkTheme);
    }
    applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add("dark");
        }
        else {
            document.documentElement.classList.remove("dark");
        }
    }
    checkSystemThemePreference() {
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            this.isDarkTheme = darkModeMediaQuery.matches;
            this.applyTheme(this.isDarkTheme);
            darkModeMediaQuery.addEventListener("change", e => {
                this.isDarkTheme = e.matches;
                this.applyTheme(this.isDarkTheme);
            });
        }
    }
    isDark() {
        return this.isDarkTheme;
    }
    setTheme(isDark) {
        if (this.isDarkTheme !== isDark) {
            this.isDarkTheme = isDark;
            this.applyTheme(isDark);
        }
    }
}
