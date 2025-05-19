interface SkuProductType {
	results: {
		id: number
		nameCN: string
		skuInfoVos: Array<{
			invNum: number
			minAmount: number
			salePrice: number
			shortDesc: string
			specName: string
		}>
	}
}

interface SkuSearchType {
	results: {
		items: Array<{
			id: number
			invNum: number
			nameCN: string
		}>
	}
}

export type {
	SkuProductType,
	SkuSearchType
};