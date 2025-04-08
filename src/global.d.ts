interface Eapi {
	chromeVer: () => string
	electronVer: () => string
	nodeVer: () => string
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
	eapi: Eapi
	tailwind: {
		config: TailwindConfig
	}
}