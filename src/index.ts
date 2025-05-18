import { connect } from "puppeteer-core";

import { LockOrder, LoginAccount } from "./libs";

(async() => {
	// MacOS：终端执行`npm run open:mac`
	// Windows：终端执行`npm run open:windows`
	const browser = await connect({
		browserURL: "http://localhost:9222",
		defaultViewport: null
	});
	try {
		const pages = await browser.pages();
		const page = pages[0]; // 使用第一个打开的页面
		await LoginAccount(page);
		await LockOrder(page);
		// await SearchProducts(page);
		await browser.disconnect();
	} catch (err) {
		console.error("打开页面发生错误:", err);
		// await browser.close();
	}
})().catch(err => console.error(err));