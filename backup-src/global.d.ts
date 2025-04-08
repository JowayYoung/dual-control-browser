declare module "electron-squirrel-startup";

// 全局 Electron API 接口定义
interface Window {
	electronAPI: {
		goBack: () => Promise<{ success: boolean }>
		goForward: () => Promise<{ success: boolean }>
		navigate: (url: string) => Promise<{ success: boolean; url: string }>
		on: <T>(channel: string, callback: (data: T) => void) => () => void
		refresh: () => Promise<{ success: boolean }>
		toggleTheme: (isDark: boolean) => Promise<{ success: boolean; isDark: boolean }>
	}
}