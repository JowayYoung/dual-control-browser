import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";

// 进入购物车进行锁单
export default async function LockOrder(page: Page): Promise<void> {
	const cartBtnSelector = ".menu-bar .menu-box .handle .cart-box .cart"; // 购物车按钮
	const settlementBtnSelector = ".cart-list .content .footer .footer-right .submit"; // 结算按钮
	const homeBtnSelector = ".menu-bar .menu-box .menu-list .item:first-of-type"; // 首页按钮
	await page.click(cartBtnSelector);
	await WaitFor(2000);
	await page.click(settlementBtnSelector);
	await WaitFor(2000);
	await page.click(homeBtnSelector);
}