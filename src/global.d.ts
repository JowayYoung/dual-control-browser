interface ElectronAPI {
	navigate: (url: string) => void
	onLoadUrl: (callback: (url: string) => void) => () => void
}

interface TailwindConfig {
	darkMode: string
	theme: {
		extend: {
			colors: Record<string, {
				dark: string
				light: string
			}>
		}
	}
}

declare interface Window {
	electronAPI: ElectronAPI
	tailwind: {
		config: TailwindConfig
	}
}