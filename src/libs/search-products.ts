import type { Page } from "puppeteer-core";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AbsPath, WaitFor } from "@yangzw/bruce-us/dist/node";
import Chalk from "chalk";
import Excel from "exceljs";

import { WAITFOT_OPT } from "../utils";

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
	productList: ".product-list .item .single-product", // 商品列表
	productPopBox: ".pop-skusel", // 商品弹窗
	productPopBtn: ".pop-skusel .skusel-box .close", // 关闭按钮
	searchIpt: ".menu-bar .menu-box .handle .search-box .search .input", // 搜索输入框
	searchRes: ".search-list .main .detail", // 搜索结果
	specCount: ".pop-skusel .skusel-box .detail .operate .input", // 规格数量
	specDesc: ".pop-skusel .skusel-box .detail .short-desc:first-of-type", // 规格描述
	specList: ".pop-skusel .skusel-box .detail .spec .list .item", // 规格列表
	specPrice: ".pop-skusel .skusel-box .detail .price .sale .num:nth-of-type(2)" // 规格价格
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

export default async function SearchProducts(page: Page): Promise<void> {
	const products = await ParseProducts("../../data/products.xlsx");
	for (const [orderIndex, group] of products.entries()) {
		console.log("\n", magentaBright("系统提示："), blueBright(`开始搜索订单${orderIndex + 1}`));
		for (const product of group) {
			const { desc, name, purchase, quality, rise, specs } = product;
			// 1. 清空搜索框并搜索商品
			await page.$eval(SELECTOR.searchIpt, e => {
				(e as HTMLInputElement).value = "";
			});
			await page.type(SELECTOR.searchIpt, name);
			await page.keyboard.press("Enter");
			// 2. 检查搜索结果
			try {
				await WaitFor(2000);
				await page.waitForSelector(SELECTOR.searchRes, WAITFOT_OPT);
				console.log("-----", greenBright("搜索成功："), name, "-----");
				// 3. 检查商品是否在售
				const products = await page.$$eval(SELECTOR.productList, e => e.map(v => {
					const nameElem = v.querySelector(".info .name-cn");
					return {
						isSellout: v.classList.contains("sellOut"),
						name: nameElem?.textContent?.trim() ?? ""
					};
				}));
				console.log(blueBright("搜索结果："), products);
				const productIndex = products.findIndex(v => v.name.includes(name) && (desc ? v.name.includes(desc) : true) && !v.isSellout);
				console.log(blueBright("是否有货："), productIndex === -1 ? redBright("无货") : greenBright(`有货, 第${productIndex + 1}个商品`));
				if (productIndex > -1) {
					console.log("打开商品弹窗");
					// 4. 打开商品详情
					const productItemSelector = `.product-list .item:nth-of-type(${productIndex + 1}) .single-product`; // 商品项目
					await page.click(productItemSelector);
					await page.waitForSelector(SELECTOR.productPopBox, WAITFOT_OPT);
					// // 5. 选择商品规格
					const currSpecs = await page.$$eval(SELECTOR.specList, e => e.filter(el => !el.classList.contains("disabled")).map(elem => (elem.textContent?.trim() ?? "").toLowerCase()));
					console.log(blueBright("当前规格："), currSpecs);
					console.log(blueBright("期望规格："), specs);
					for (const [index, spec] of specs.entries()) {
						if (!currSpecs.includes(spec)) {
							continue;
						}
						const currIndex = currSpecs.findIndex(v => v === spec);
						const productSpecItemSelector = `.pop-skusel .skusel-box .detail .spec .list .item.selected:nth-of-type(${currIndex + 1})`;
						await page.click(productSpecItemSelector);
						await WaitFor(500);
						// 6. 判断条件加购商品
						// const [price, count] = purchase[index];
						// const currDesc = await page.$eval(SELECTOR.specDesc, e => e.textContent?.trim() ?? "");
						// const currPrice = await page.$eval(SELECTOR.specPrice, e => +(e as HTMLInputElement).value);
						// const currCount = await page.$eval(SELECTOR.specCount, e => +(e as HTMLInputElement).value);
						// if (price * rise <= currPrice && (quality ? currDesc.includes("大于1年") : true)) {
						// 	const diffCount = count - currCount;
						// 	for (let i = 0; i < diffCount; i++) {
						// 		await page.click(SELECTOR.addBtn);
						// 		await WaitFor(100);
						// 	}
						// 	await page.click(SELECTOR.cartBtn);
						// 	await page.waitForSelector(SELECTOR.cartMsg, WAITFOT_OPT);
						// 	console.log(blueBright("加购结果："), greenBright("加购成功"));
						// } else {
						// 	console.log(blueBright("加购结果："), redBright("加购失败，价格或日期不符合要求"));
						// }
						await WaitFor();
					}
					await WaitFor(2000); // 等待加购完成
					await page.click(SELECTOR.productPopBtn);
					console.log("关闭商品弹窗");
				}
			} catch {
				console.log("-----", redBright("搜索失败："), name, "-----");
			}
			await WaitFor(2000); // 加购完成一个产品
			console.log("-----123-----");
		}
		// 5. 点击首页按钮
		await page.waitForSelector(SELECTOR.homeBtn, WAITFOT_OPT);
		await page.click(SELECTOR.homeBtn);
	}
}