import { connect } from "puppeteer-core";
import Chalk from "chalk";

import { LoginAccount, SearchProducts } from "./libs";

const { magentaBright } = Chalk;

(async() => {
	const browser = await connect({
		// MacOS：终端执行`npm run open:mac`
		// Windows：终端执行`npm run open:windows`
		browserURL: "http://localhost:9222",
		defaultViewport: null
	});
	try {
		console.log(magentaBright("----- 浏览器已连接 -----\n"));
		const pages = await browser.pages();
		const page = pages[0]; // 使用第一个打开的页面
		const flag = await LoginAccount(page);
		if (flag) {
			await SearchProducts(page, browser);
		}
		await browser.disconnect();
		console.log(magentaBright("\n----- 浏览器已断开 -----"));
	} catch (e) {
		console.error("程序发生错误:", e);
		// await browser.close();
	}
})().catch(console.error);