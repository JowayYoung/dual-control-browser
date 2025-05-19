import type { Browser, Page } from "puppeteer-core";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AbsPath, WaitFor } from "@yangzw/bruce-us/dist/node";
import Chalk from "chalk";
import Excel from "exceljs";

import type { SkuProductType, SkuSearchType } from "../types";
import { WAITFOT_HIDDEN_OPT, WAITFOT_OPT } from "../utils";

interface Product {
	desc: string
	name: string
	purchase: number[][]
	quality: boolean
	rise: number
	specs: string[]
	type: string
}

const { blueBright, greenBright, magentaBright, redBright } = Chalk;

const root = dirname(fileURLToPath(import.meta.url));

const SELECTOR = {
	addBtn: ".pop-skusel .skusel-box .detail .operate .symbol:nth-of-type(2)", // 增加按钮
	cartBtn: ".pop-skusel .skusel-box .detail .btn-box .btn.add-cart", // 加购按钮
	cartMsg: ".custom-toast", // 加购提示
	homeBtn: ".menu-bar .menu-box .menu-list .item:first-of-type", // 首页按钮
	productPopBox: ".pop-skusel", // 商品弹窗
	productPopBtn: ".pop-skusel .skusel-box .close", // 关闭按钮
	searchIpt: ".menu-bar .menu-box .handle .search-box .search .input" // 搜索输入框
};

async function ParseProducts(path = ""): Promise<Product[][]> {
	let group: Product[] = [];
	let currLine = 0;
	const result: Product[][] = [];
	const workbook = new Excel.Workbook();
	await workbook.xlsx.readFile(AbsPath(path, root));
	const worksheet = workbook.getWorksheet(1);
	if (!worksheet) return [];
	worksheet.eachRow((row, line) => {
		currLine += 1;
		if (line === 1) return;
		if (line !== currLine) { // 产生断行
			if (group.length > 0) {
				result.push(group);
				group = [];
			}
			currLine = line;
		}
		const product: Product = {
			desc: row.getCell(2).text.trim(),
			name: row.getCell(1).text.trim(),
			purchase: row.getCell(4).text.split(/[,、]/).map(v => v.trim().split("*")
				.map(Number)
				.filter(v => !isNaN(v)))
				.filter(v => v.length === 2),
			quality: row.getCell(6).text.trim().toUpperCase() === "TRUE",
			rise: Number(row.getCell(5).text),
			specs: row.getCell(3).text.split(/[,、]/).map(v => v.trim().toLowerCase())
				.filter(Boolean),
			type: row.getCell(7).text.trim()
		};
		group.push(product);
	});
	!!group.length && result.push(group);
	return result;
}

export default async function SearchProducts(page: Page, browser: Browser): Promise<void> {
	const products = await ParseProducts("../../data/products.xlsx");
	for (const [orderIndex, group] of products.entries()) {
		console.log(blueBright("\n-----", `开始搜索订单${orderIndex + 1}`, "-----"));
		for (const product of group) {
			const { desc, name, purchase, quality, rise, specs } = product;
			const productsPromise = page.waitForResponse(res => res.url().includes("/v1/product/search") && res.request().method() === "GET");
			const productPromise = page.waitForResponse(res => res.url().includes("/v1/product/spu") && res.request().method() === "GET");
			// 1. 清空搜索框并搜索商品
			await page.$eval(SELECTOR.searchIpt, e => {
				(e as HTMLInputElement).value = "";
			});
			await page.type(SELECTOR.searchIpt, name);
			await page.keyboard.press("Enter");
			// 2. 检查搜索结果
			const { results: { items: productsData } } = await (await productsPromise).json() as SkuSearchType;
			if (!productsData.length) {
				continue;
			}
			const productIndex = productsData.findIndex(v => v.nameCN.includes(name) && (desc ? v.nameCN.includes(desc) : true) && !!v.invNum);
			console.log("\n-----", greenBright("搜索成功："), name, "-----");
			console.log(magentaBright("系统提示："), productIndex === -1 ? redBright("无货") : greenBright(`有货, 点击第${productIndex + 1}个商品`));
			if (productIndex === -1) {
				continue;
			}
			// 3. 打开商品详情
			const productItemSelector = `.product-list .item:nth-of-type(${productIndex + 1}) .single-product`; // 商品项目
			await WaitFor();
			await page.waitForSelector(productItemSelector, WAITFOT_OPT);
			await page.click(productItemSelector);
			await page.waitForSelector(SELECTOR.productPopBox, WAITFOT_OPT);
			// 4. 选择商品规格
			const { results: { skuInfoVos: sepcsData } } = await (await productPromise).json() as SkuProductType;
			if (specs.length) {
				console.log("至少一个期望规格，需要遍历处理");
			} else {
				if (sepcsData[0].invNum) {
					const [price, count] = purchase[0];
					const diffCount = count === 1 || sepcsData[0].invNum === 1 ? 1 : Math.min(count, sepcsData[0].invNum) - sepcsData[0].minAmount;
					if (price * rise >= sepcsData[0].salePrice / 100 && (quality ? sepcsData[0].shortDesc.includes("大于1年") : true)) {
						for (let i = 0; i < diffCount; i++) {
							await page.click(SELECTOR.addBtn);
							await WaitFor(300);
						}
						await page.waitForSelector(SELECTOR.cartBtn, WAITFOT_OPT);
						await page.click(SELECTOR.cartBtn);
						await page.waitForSelector(SELECTOR.cartMsg, WAITFOT_OPT);
						console.log(magentaBright("系统提示："), greenBright(`${diffCount === 1 ? 1 : diffCount}件，加购成功`));
					}
				}
			}
			// 5. 关闭商品详情
			await WaitFor(2000);
			await page.click(SELECTOR.productPopBtn);
			await page.waitForSelector(SELECTOR.productPopBox, WAITFOT_HIDDEN_OPT);
		}
		// 5. 点击首页按钮
		await page.waitForSelector(SELECTOR.homeBtn, WAITFOT_OPT);
		await page.click(SELECTOR.homeBtn);
	}
}