import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

const { blueBright, greenBright, magentaBright, redBright } = Chalk;

// 进入购物车进行锁单
export default async function LockOrder(page: Page): Promise<void> {
	const cartBtnSelector = ".menu-bar .menu-box .handle .cart-box .cart"; // 购物车按钮
	const settlementBtnSelector = ".cart-list .content .footer .footer-right .submit"; // 结算按钮
	const homeBtnSelector = ".menu-bar .menu-box .menu-list .item:first-of-type"; // 首页按钮
	const cartText = await page.$eval(cartBtnSelector, e => e.textContent?.trim() ?? "");
	const match = /\((\d+)\)/.exec(cartText);
	const cartCount = match ? parseInt(match[1], 10) : 0;
	if (cartCount > 0) {
		console.log(magentaBright("系统提示："), blueBright(`购物车存在${cartCount}件商品，开始锁单`));
		await page.click(cartBtnSelector);
		await WaitFor(2000);
		await page.click(settlementBtnSelector);
		await WaitFor(2000);
		await page.click(homeBtnSelector);
		console.log(magentaBright("系统提示："), greenBright("锁单成功"));
	} else {
		console.log(magentaBright("系统提示："), redBright("锁单失败，购物车为空"));
	}
}