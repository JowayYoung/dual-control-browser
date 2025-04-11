import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";
import { connect } from "puppeteer-core";

import { ACCOUNT, OPTS_WAITFOT_SELECTOR, PASSWORD, PRODUCTS } from "./data";
import { CheckElemVisible, ParseProducts } from "./util";

const { blueBright, greenBright, magentaBright, redBright, yellowBright } = Chalk;

(async() => {
	// A: 重新打开Chrome
	// const browser = await launch({
	// 	args: [
	// 		"--start-maximized",
	// 		"--no-sandbox",
	// 		"--disable-setuid-sandbox",
	// 		"--disable-blink-features=AutomationControlled"
	// 	],
	// 	defaultViewport: null,
	// 	executablePath: "/Applications/Chrome.app/Contents/MacOS/Google Chrome",
	// 	headless: false,
	// 	ignoreDefaultArgs: ["--enable-automation"]
	// });
	// B: 使用已经打开的Chrome
	const browser = await connect({
		// MacOS：终端执行`/Applications/Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222`
		// Windows：终端执行`C:\Program Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222`
		browserURL: "http://localhost:9222",
		defaultViewport: null
	});
	try {
		// A分支
		// const page = await browser.newPage();
		// await page.goto(WEBSITE, { waitUntil: "networkidle0" });
		// B分支
		const pages = await browser.pages();
		const page = pages[0]; // 使用第一个打开的页面
		// 检测是否已经登录（判断是否存在额度信息）
		const limitSelector = ".second-header .limit .limit-box"; // 额度
		try {
			await page.waitForSelector(limitSelector, OPTS_WAITFOT_SELECTOR);
			console.log(blueBright("登录状态："), greenBright("已登录"));
		} catch (e) {
			console.log(blueBright("登录状态："), yellowBright("未登录，正在尝试登录"));
			console.error(e);
			// 循环检测并点击弹窗按钮，直到弹窗消失
			async function closePopup() {
				const confirmPopupSelector = ".pop-salerule2 .salerule-box"; // 确认弹窗
				const confirmBtnSelector = ".pop-salerule2 .salerule-box .btn-box .btn.confirm"; // 确认按钮
				while (true) {
					const isPopupVisible = await CheckElemVisible(page, confirmPopupSelector);
					const isButtonVisible = await CheckElemVisible(page, confirmBtnSelector);
					if (isPopupVisible && isButtonVisible) {
						await page.click(confirmBtnSelector);
						break;
					} else {
						console.log(magentaBright("系统提示："), yellowBright("未检测到弹窗，继续重试"));
						await WaitFor(2000);
					}
				}
			}
			await closePopup();
			// 输入账号密码，滑动滑块，进入首页
			async function loginUser() {
				const accountInputSelector = ".login .main .container .inputbox.user .input"; // 账号输入框
				const passswordInputSelector = ".login .main .container .inputbox.pass .input"; // 密码输入框
				const loginBtnSelector = ".login .main .container .submit"; // 登录按钮
				const sliderSelector = ".nc-container .nc_scale .btn_slide"; // 滑块
				const sliderFlagSelector = ".nc-container .nc_scale .btn_ok"; // 滑块标记
				const sliderCtnSelector = ".nc_scale"; // 滑块容器
				// 输入账号密码
				await page.type(accountInputSelector, ACCOUNT, { delay: 50 });
				await page.type(passswordInputSelector, PASSWORD, { delay: 50 });
				// 等待滑块元素出现并拖动
				await page.waitForSelector(sliderSelector, OPTS_WAITFOT_SELECTOR);
				await page.waitForSelector(sliderCtnSelector, OPTS_WAITFOT_SELECTOR);
				const slider = await page.$(sliderSelector);
				const sliderCtn = await page.$(sliderCtnSelector);
				const sliderBox = await slider?.boundingBox();
				const sliderCtnBox = await sliderCtn?.boundingBox();
				if (!!sliderBox && !!sliderCtnBox) {
					await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
					await page.mouse.down();
					await page.mouse.move(sliderCtnBox.x + sliderCtnBox.width, sliderBox.y + sliderBox.height / 2, { steps: 20 });
					await page.mouse.up();
				}
				// 等待滑块标记与登录按钮出现并登录
				try {
					await page.waitForSelector(sliderFlagSelector, OPTS_WAITFOT_SELECTOR);
					await page.click(loginBtnSelector);
					await page.waitForNavigation({ waitUntil: "networkidle0" });
				} catch (e) {
					console.log(magentaBright("系统提示："), yellowBright("未检测到滑块确认按钮，登录失败"), e);
				}
			}
			await loginUser();
			try {
				await page.waitForSelector(limitSelector, OPTS_WAITFOT_SELECTOR);
				console.log(magentaBright("系统提示："), greenBright("登录成功"));
			} catch (e) {
				console.log(magentaBright("系统提示："), redBright("登录失败"), e);
			}
		}
		// 格式化产品信息
		const products = ParseProducts(PRODUCTS);
		for (const group of products) {
			for (const product of group) {
				const { name, price } = product;
				const searchInputSelector = ".menu-bar .menu-box .handle .search-box .search .input"; // 搜索输入框
				const searchResultSelector = ".search-list .main .detail"; // 搜索结果
				// 先清空再输入后搜索
				await page.$eval(searchInputSelector, el => {
					const elem = el as HTMLInputElement;
					elem.value = "";
				});
				await page.type(searchInputSelector, name);
				await page.keyboard.press("Enter");
				// 等待搜索结果出现并加购
				await WaitFor(2000);
				const isSearchResultVisible = await CheckElemVisible(page, searchResultSelector);
				if (isSearchResultVisible) {
					console.log("-----", greenBright("搜索成功："), name, "-----");
					const productListSelector = ".product-list .item .single-product"; // 商品列表
					const products = await page.$$eval(productListSelector, productElems => {
						return productElems.map(v => {
							const nameElem = v.querySelector(".info .name-cn");
							const priceElem = v.querySelector(".info .price .sale .num:last-of-type");
							return {
								isSellout: v.classList.contains("sellOut"),
								name: nameElem?.textContent?.trim() || "",
								price: +(priceElem?.textContent?.trim() || "")
							};
						});
					});
					const goodsIndex = products.findIndex(v => v.name.includes(name) && v.price === price && !v.isSellout);
					console.log(blueBright("是否有货："), goodsIndex === -1 ? redBright("无货") : greenBright("有货"));
					console.log(blueBright("商品顺序："), goodsIndex);
					await WaitFor(2000);
				} else {
					console.log("-----", redBright("搜索失败："), name, "-----");
					await WaitFor(2000);
				}
			}
		}
		// 完成流程断开浏览器
		await WaitFor(2000);
		const homeBtnSelector = ".menu-bar .menu-box .menu-list .item:first-of-type"; // 首页按钮
		await page.click(homeBtnSelector);
		await browser.disconnect();
	} catch (err) {
		console.error("打开页面发生错误:", err);
		await browser.close();
	}
})();