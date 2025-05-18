import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

import { ACCOUNT, PASSWORD, WAITFOT_OPT, CheckElemVisible } from "../utils";

const { blueBright, greenBright, magentaBright, redBright, yellowBright } = Chalk;

// const confirmPopupSelector = ".pop-salerule2 .salerule-box"; // 确认弹窗
// const confirmBtnSelector = ".pop-salerule2 .salerule-box .btn-box .btn.confirm"; // 确认按钮
const SELECTOR = {
	confirmBtn: ".salerule-box .btn-box .btn.confirm", // 确认按钮
	confirmPopup: ".salerule-box", // 确认弹窗
	limitInfo: ".second-header .limit .limit-box" // 额度信息
};

async function CloseConfirmPopup(page: Page): Promise<void> {
	while (true) {
		const isConfirmPopupVisible = await CheckElemVisible(page, SELECTOR.confirmPopup);
		const isConfirmBtnVisible = await CheckElemVisible(page, SELECTOR.confirmBtn);
		if (isConfirmPopupVisible && isConfirmBtnVisible) {
			await page.click(SELECTOR.confirmBtn);
			break;
		} else {
			console.log(magentaBright("系统提示："), yellowBright("未检测到弹窗，继续重试"));
			await WaitFor(2000);
		}
	}
}

// 检测是否已经登录（判断是否存在额度信息）
export default async function LoginAccount(page: Page): Promise<void> {
	await WaitFor();
	const isLimitInfoVisible = await CheckElemVisible(page, SELECTOR.limitInfo);
	if (isLimitInfoVisible) {
		console.log(blueBright("登录状态："), greenBright("已登录"));
	} else {
		console.log(blueBright("登录状态："), yellowBright("未登录，正在尝试登录"));
		// 循环检测并点击弹窗按钮，直到弹窗消失
		await CloseConfirmPopup(page);
		// 输入账号密码，滑动滑块，点击登录，进入首页
		const accountInputSelector = ".login .main .container .inputbox.user .input"; // 账号输入框
		const passswordInputSelector = ".login .main .container .inputbox.pass .input"; // 密码输入框
		const loginBtnSelector = ".login .main .container .submit"; // 登录按钮
		const sliderSelector = ".nc_scale"; // 滑块
		const sliderBtnSelector = ".nc-container .nc_scale .btn_slide"; // 滑块按钮
		const sliderFlagSelector = ".nc-container .nc_scale .btn_ok"; // 滑块标记
		await page.type(accountInputSelector, ACCOUNT, { delay: 10 });
		await page.type(passswordInputSelector, PASSWORD, { delay: 10 });
		await page.waitForSelector(sliderSelector, WAITFOT_OPT);
		await page.waitForSelector(sliderBtnSelector, WAITFOT_OPT);
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
			await page.waitForSelector(sliderFlagSelector, WAITFOT_OPT);
			await page.click(loginBtnSelector);
			await page.waitForNavigation({ waitUntil: "networkidle0" });
		} catch (e) {
			console.log(magentaBright("系统提示："), redBright("未检测到滑块确认按钮，登录失败"), e);
		}
		// 确认是否登录成功
		try {
			await page.waitForSelector(SELECTOR.limitInfo, WAITFOT_OPT);
			console.log(magentaBright("系统提示："), greenBright("登录成功"));
		} catch (e) {
			console.log(magentaBright("系统提示："), redBright("登录失败"), e);
		}
		// 循环检测并点击弹窗按钮，直到弹窗消失
		await WaitFor();
		const isConfirmPopupVisible = await CheckElemVisible(page, SELECTOR.confirmPopup);
		isConfirmPopupVisible && await CloseConfirmPopup(page);
	}
}