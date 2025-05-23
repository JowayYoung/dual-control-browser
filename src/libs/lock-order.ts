import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

import { WAITFOT_OPT } from "../utils";

const { blueBright, greenBright, magentaBright, redBright } = Chalk;

const SELECTOR = {
	cartBtn: ".menu-bar .menu-box .handle .cart-box .cart", // 购物车按钮
	checkoutBtn: ".cart-list .content .footer .footer-right .submit", // 结算按钮
	checkoutMsg: ".custom-toast", // 结算提示
	homeBtn: ".menu-bar .menu-box .menu-list .item:first-of-type" // 首页按钮
};

export default async function LockOrder(page: Page, index = 1): Promise<void> {
	// 1. 检查购物车数量
	const cartText = await page.$eval(SELECTOR.cartBtn, e => e.textContent?.trim() ?? "");
	const cartCount = parseInt(/\((\d+)\)/.exec(cartText)?.[1] ?? "0", 10);
	if (cartCount > 0) {
		console.log(magentaBright("系统提示："), blueBright(`购物车存在${greenBright(cartCount)}件商品，开始锁单`));
		// 2. 点击购物车按钮
		await page.waitForSelector(SELECTOR.cartBtn, WAITFOT_OPT);
		await page.click(SELECTOR.cartBtn);
		await WaitFor();
		// 3. 点击结算按钮
		await page.waitForSelector(SELECTOR.checkoutBtn, WAITFOT_OPT);
		await page.click(SELECTOR.checkoutBtn);
		await WaitFor();
		// 4. 等待结算结果
		try {
			await page.waitForSelector(SELECTOR.checkoutMsg, WAITFOT_OPT);
			console.log(magentaBright("系统提示："), redBright("锁单失败，额度受限"));
		} catch (error) {
			// 如果没有等到结算提示，认为锁单成功
			console.log(magentaBright("系统提示："), greenBright(`锁单成功，稍后需要手动结算订单${index}`));
		}
		// 5. 点击首页按钮
		await page.waitForSelector(SELECTOR.homeBtn, WAITFOT_OPT);
		await page.click(SELECTOR.homeBtn);
	} else {
		console.log(magentaBright("系统提示："), redBright("锁单失败，商品为空"));
	}
}