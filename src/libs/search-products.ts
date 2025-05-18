import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

import { OPTS_WAITFOT_SELECTOR, PRODUCTS, CheckElemVisible, ParseProducts } from "../utils";

const { blueBright, greenBright, redBright } = Chalk;

// 搜索商品，对于满足条件的商品进行加购
export default async function SearchProducts(page: Page): Promise<void> {
	const products = ParseProducts(PRODUCTS);
	console.log("商品列表", products);
	const searchInputSelector = ".menu-bar .menu-box .handle .search-box .search .input"; // 搜索输入框
	const searchResultSelector = ".search-list .main .detail"; // 搜索结果
	for (const group of products) {
		for (const product of group) {
			const { count, name, price, specs } = product;
			// 清空搜索框
			await page.$eval(searchInputSelector, e => {
				(e as HTMLInputElement).value = "";
			});
			await page.type(searchInputSelector, name);
			await page.keyboard.press("Enter");
			await WaitFor(2000);
			const isSearchResultVisible = await CheckElemVisible(page, searchResultSelector);
			if (isSearchResultVisible) {
				console.log("-----", greenBright("搜索成功："), name, "-----");
				const productsSelector = ".product-list .item .single-product"; // 商品列表
				const products = await page.$$eval(productsSelector, e => e.map(v => {
					const nameElem = v.querySelector(".info .name-cn");
					const priceElem = v.querySelector(".info .price .sale .num:last-of-type");
					return {
						isSellout: v.classList.contains("sellOut"),
						name: nameElem?.textContent?.trim() ?? "",
						price: +(priceElem?.textContent?.trim() ?? "")
					};
				}));
				const goodsIndex = products.findIndex(v => v.name.includes(name) && v.price === price && !v.isSellout);
				console.log(blueBright("是否有货："), goodsIndex === -1 ? redBright("无货") : greenBright("有货"));
				if (goodsIndex > -1) {
					const productItemSelector = `.product-list .item:nth-of-type(${goodsIndex + 1}) .single-product`; // 商品项目
					const productCloseBtnSelector = ".pop-skusel .skusel-box .close"; // 商品关闭按钮
					const productSpecsSelector = ".pop-skusel .skusel-box .detail .spec .list .item.selected"; // 商品规格列表
					const productAddBtnSelector = ".pop-skusel .skusel-box .detail .operate .symbol:nth-of-type(2)"; // 商品增加按钮
					const productCountSelector = ".pop-skusel .skusel-box .detail .operate .input"; // 商品数量
					const productCartBtnSelector = ".pop-skusel .skusel-box .detail .btn-box .btn.add-cart"; // 商品加购按钮
					const productToastSelector = ".custom-toast"; // 商品提示
					await page.click(productItemSelector);
					await WaitFor();
					const productSpecs = await page.$$eval(productSpecsSelector, e => e.map(el => el.textContent?.trim() ?? ""));
					console.log("目标规格", specs);
					console.log("当前规格", productSpecs);
					for (const [i, v] of productSpecs.entries()) {
						if (specs.includes(v)) {
							const productSpecItemSelector = `.pop-skusel .skusel-box .detail .spec .list .item.selected:nth-of-type(${i + 1})`; // 商品规格项目
							await page.click(productSpecItemSelector);
							await WaitFor(100);
							// 获取商品数量输入框中的数值
							const productCount = await page.$eval(productCountSelector, e => +(e as HTMLInputElement).value);
							const diffCount = count - productCount;
							for (let i = 0; i < diffCount; i++) {
								await page.click(productAddBtnSelector);
								await WaitFor(100);
							}
							await page.click(productCartBtnSelector);
							await page.waitForSelector(productToastSelector, OPTS_WAITFOT_SELECTOR);
						}
					}
					await WaitFor(2000);
					await page.click(productCloseBtnSelector);
				}
			} else {
				console.log("-----", redBright("搜索失败："), name, "-----");
			}
		}
	}
}