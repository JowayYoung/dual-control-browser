import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

import { ACCOUNT, OPTS_WAITFOT_SELECTOR, PASSWORD, CheckElemVisible } from "../utils";

const { blueBright, greenBright, magentaBright, redBright, yellowBright } = Chalk;

// 检测是否已经登录（判断是否存在额度信息）
export default async function LoginAccount(page: Page): Promise<void> {
	await WaitFor();
	const limitInfoSelector = ".second-header .limit .limit-box"; // 额度信息
	const isLimitInfoVisible = await CheckElemVisible(page, limitInfoSelector);
	if (isLimitInfoVisible) {
		console.log(blueBright("登录状态："), greenBright("已登录"));
	} else {
		console.log(blueBright("登录状态："), yellowBright("未登录，正在尝试登录"));
		// 循环检测并点击弹窗按钮，直到弹窗消失
		const closeConfirmPopup = async function(): Promise<void> {
			const confirmPopupSelector = ".pop-salerule2 .salerule-box"; // 确认弹窗
			const confirmBtnSelector = ".pop-salerule2 .salerule-box .btn-box .btn.confirm"; // 确认按钮
			while (true) {
				const isConfirmPopupVisible = await CheckElemVisible(page, confirmPopupSelector);
				const isConfirmBtnVisible = await CheckElemVisible(page, confirmBtnSelector);
				if (isConfirmPopupVisible && isConfirmBtnVisible) {
					await page.click(confirmBtnSelector);
					break;
				} else {
					console.log(magentaBright("系统提示："), yellowBright("未检测到弹窗，继续重试"));
					await WaitFor(2000);
				}
			}
		};
		await closeConfirmPopup();
		// 输入账号密码，滑动滑块，点击登录，进入首页
		const accountInputSelector = ".login .main .container .inputbox.user .input"; // 账号输入框
		const passswordInputSelector = ".login .main .container .inputbox.pass .input"; // 密码输入框
		const loginBtnSelector = ".login .main .container .submit"; // 登录按钮
		const sliderSelector = ".nc_scale"; // 滑块
		const sliderBtnSelector = ".nc-container .nc_scale .btn_slide"; // 滑块按钮
		const sliderFlagSelector = ".nc-container .nc_scale .btn_ok"; // 滑块标记
		await page.type(accountInputSelector, ACCOUNT, { delay: 10 });
		await page.type(passswordInputSelector, PASSWORD, { delay: 10 });
		await page.waitForSelector(sliderSelector, OPTS_WAITFOT_SELECTOR);
		await page.waitForSelector(sliderBtnSelector, OPTS_WAITFOT_SELECTOR);
		const slider = await page.$(sliderSelector);
		const sliderBtn = await page.$(sliderBtnSelector);
		const sliderBox = await slider?.boundingBox();
		const sliderBtnBox = await sliderBtn?.boundingBox();
		if (!!sliderBox && !!sliderBtnBox) {
			await page.mouse.move(sliderBtnBox.x + sliderBtnBox.width / 2, sliderBtnBox.y + sliderBtnBox.height / 2);
			await page.mouse.down();
			await page.mouse.move(sliderBox.x + sliderBox.width, sliderBtnBox.y + sliderBtnBox.height / 2, { steps: 20 });
			await page.mouse.up();
		}
		try {
			await page.waitForSelector(sliderFlagSelector, OPTS_WAITFOT_SELECTOR);
			await page.click(loginBtnSelector);
			await page.waitForNavigation({ waitUntil: "networkidle0" });
		} catch (e) {
			console.log(magentaBright("系统提示："), redBright("未检测到滑块确认按钮，登录失败"), e);
		}
		// 确认是否登录成功
		try {
			await page.waitForSelector(limitInfoSelector, OPTS_WAITFOT_SELECTOR);
			console.log(magentaBright("系统提示："), greenBright("登录成功"));
		} catch (e) {
			console.log(magentaBright("系统提示："), redBright("登录失败"), e);
		}
	}
}