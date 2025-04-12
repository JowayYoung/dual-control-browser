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
		// MacOS：终端执行`npm run open:mac`
		// Windows：终端执行`npm run open:windows`
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
			const closePopup = async function() {
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
			};
			await closePopup();
			// 输入账号密码，滑动滑块，点击登录，进入首页
			const accountInputSelector = ".login .main .container .inputbox.user .input"; // 账号输入框
			const passswordInputSelector = ".login .main .container .inputbox.pass .input"; // 密码输入框
			const loginBtnSelector = ".login .main .container .submit"; // 登录按钮
			const sliderSelector = ".nc-container .nc_scale .btn_slide"; // 滑块
			const sliderFlagSelector = ".nc-container .nc_scale .btn_ok"; // 滑块标记
			const sliderCtnSelector = ".nc_scale"; // 滑块容器
			await page.type(accountInputSelector, ACCOUNT, { delay: 50 });
			await page.type(passswordInputSelector, PASSWORD, { delay: 50 });
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
			try {
				await page.waitForSelector(sliderFlagSelector, OPTS_WAITFOT_SELECTOR);
				await page.click(loginBtnSelector);
				await page.waitForNavigation({ waitUntil: "networkidle0" });
			} catch (e) {
				console.log(magentaBright("系统提示："), yellowBright("未检测到滑块确认按钮，登录失败"), e);
			}
			// 确认是否登录成功
			try {
				await page.waitForSelector(limitSelector, OPTS_WAITFOT_SELECTOR);
				console.log(magentaBright("系统提示："), greenBright("登录成功"));
			} catch (e) {
				console.log(magentaBright("系统提示："), redBright("登录失败"), e);
			}
		}
		// 格式化产品信息
		const products = ParseProducts(PRODUCTS);
		// 搜索商品，对于满足条件的商品进行加购
		const searchInputSelector = ".menu-bar .menu-box .handle .search-box .search .input"; // 搜索输入框
		const searchResultSelector = ".search-list .main .detail"; // 搜索结果
		for (const group of products) {
			for (const product of group) {
				const { count, name, price, specs } = product;
				await page.$eval(searchInputSelector, e => {
					const elem = e as HTMLInputElement;
					elem.value = "";
				});
				await page.type(searchInputSelector, name);
				await page.keyboard.press("Enter");
				await WaitFor(2000);
				const isSearchResultVisible = await CheckElemVisible(page, searchResultSelector);
				if (isSearchResultVisible) {
					console.log("-----", greenBright("搜索成功："), name, "-----");
					const productsSelector = ".product-list .item .single-product"; // 商品列表
					const products = await page.$$eval(productsSelector, elem => {
						return elem.map(v => {
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
						const productSpecs = await page.$$eval(productSpecsSelector, elem => elem.map(e => e.textContent?.trim() || ""));
						console.log("目标规格", specs);
						console.log("当前规格", productSpecs);
						for (const index in productSpecs) {
							const productSpec = productSpecs[index];
							if (specs.includes(productSpec)) {
								const productSpecItemSelector = `.pop-skusel .skusel-box .detail .spec .list .item.selected:nth-of-type(${+index + 1})`; // 商品规格项目
								await page.click(productSpecItemSelector);
								await WaitFor(100);
								// 获取商品数量输入框中的数值
								const productCount = await page.$eval(productCountSelector, e => {
									const elem = e as HTMLInputElement;
									return +elem.value;
								});
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
				await WaitFor(2000);
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