import type { Page } from "puppeteer-core";

interface Product {
	count: number
	desc: string
	name: string
	price: number
	specs: string[]
}

async function CheckElemVisible(page: Page, selecter: string): Promise<boolean> {
	const isPopupVisible = await page.evaluate(selector => {
		const elem = document.querySelector(selector);
		return !!elem && window.getComputedStyle(elem).display !== "none";
	}, selecter);
	return isPopupVisible;
}

function ParseProducts(productsStr = ""): Product[][] {
	const groups = productsStr.trim().split("--------------------");
	return groups.map(group => {
		// 处理每个分组中的商品
		const lines = group.trim().split("\n")
			.filter(line => line.trim());
		return lines.map(v => {
			const parts = v.trim().split(" ")
				.filter(Boolean);
			// 解析商品名称与商品描述
			const nameMatch = /(.*?)\((.*?)\)/.exec(parts[0]);
			const name = nameMatch ? nameMatch[1] : parts[0];
			const desc = nameMatch ? nameMatch[2] : "";
			// 解析商品规格
			const specs = parts[1].includes("/")
				? parts[1].split("/")
				: [parts[1]];
			// 解析商品价格与商品数量
			const [price, count] = parts[2].split("*").map(Number);
			return { count, desc, name, price, specs };
		});
	}).filter(group => group.length > 0);
}

export {
	CheckElemVisible,
	ParseProducts
};