import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";
import { connect } from "puppeteer-core";

import { ACCOUNT, PASSWORD, PRODUCTS } from "./data";
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
		await WaitFor(2000);
		const limitSelector = ".second-header .limit .limit-box"; // 额度
		const isLimitVisible = await CheckElemVisible(page, limitSelector);
		if (isLimitVisible) {
			console.log(blueBright("登录状态："), greenBright("已登录"));
		} else {
			console.log(blueBright("登录状态："), yellowBright("未登录，正在尝试登录"));
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
				const sliderCtnSelector = ".nc_scale"; // 滑块容器
				// 等待账号输入框出现并输入
				await page.waitForSelector(accountInputSelector);
				await page.type(accountInputSelector, ACCOUNT, { delay: 50 });
				// 等待密码输入框出现并输入
				await page.waitForSelector(passswordInputSelector);
				await page.type(passswordInputSelector, PASSWORD, { delay: 50 });
				// 等待滑块元素出现并拖动
				await page.waitForSelector(sliderSelector);
				await page.waitForSelector(sliderCtnSelector);
				const slider = await page.$(sliderSelector);
				const sliderCtn = await page.$(sliderCtnSelector);
				const sliderBox = await slider?.boundingBox();
				const sliderCtnBox = await sliderCtn?.boundingBox();
				if (!!sliderBox && !!sliderCtnBox) {
					await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
					await page.mouse.down();
					await page.mouse.move(sliderCtnBox.x + sliderCtnBox.width, sliderBox.y + sliderBox.height / 2, {
						steps: 20 // 分步移动，使得移动更加自然
					});
					await page.mouse.up();
				}
				// 等待登录按钮出现并点击
				await WaitFor(2000);
				await page.waitForSelector(loginBtnSelector);
				await page.click(loginBtnSelector);
				await page.waitForNavigation({ waitUntil: "networkidle0" });
			}
			await loginUser();
			await WaitFor(2000);
			console.log(magentaBright("系统提示："), blueBright("登录成功"));
		}
		// 格式化产品信息
		const products = ParseProducts(PRODUCTS);
		for (const group of products) {
			for (const product of group) {
				const { name } = product;
				const searchInputSelector = ".menu-bar .menu-box .handle .search-box .search .input"; // 搜索输入框
				const searchResultSelector = ".search-list .main .detail"; // 搜索结果
				// 等待搜索输入框出现，先清空再输入
				await page.waitForSelector(searchInputSelector);
				await page.$eval(searchInputSelector, el => {
					const elem = el as HTMLInputElement;
					elem.value = "";
				});
				await page.type(searchInputSelector, name);
				await page.keyboard.press("Enter");
				// 等待搜索结果出现
				await WaitFor(2000);
				const isSearchResultVisible = await CheckElemVisible(page, searchResultSelector);
				if (isSearchResultVisible) {
					console.log(greenBright("搜索成功："), name);
					await WaitFor(2000);
				} else {
					console.log(redBright("搜索失败："), name);
					await WaitFor(2000);
				}
			}
		}
		// 等待一段时间断开浏览器
		await WaitFor(5000);
		await browser.disconnect();
	} catch (err) {
		console.error("打开页面发生错误:", err);
		await browser.close();
	}
})();