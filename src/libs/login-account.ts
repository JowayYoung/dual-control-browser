import type { Page } from "puppeteer-core";
import { WaitFor } from "@yangzw/bruce-us";
import Chalk from "chalk";

import { ACCOUNT, PASSWORD, WAITFOT_OPT, CheckElemVisible } from "../utils";

const { blueBright, greenBright, magentaBright, redBright, yellowBright } = Chalk;

// const confirmPopupSelector = ".pop-salerule2 .salerule-box"; // 确认弹窗
// const confirmBtnSelector = ".pop-salerule2 .salerule-box .btn-box .btn.confirm"; // 确认按钮
const SELECTOR = {
	accountIpt: ".login .main .container .inputbox.user .input", // 账号输入框
	limitInfo: ".second-header .limit .limit-box", // 额度信息
	loginBtn: ".login .main .container .submit", // 登录按钮
	passwordIpt: ".login .main .container .inputbox.pass .input", // 密码输入框
	popupBox: ".salerule-box", // 确认弹窗
	popupBtn: ".salerule-box .btn-box .btn.confirm", // 确认按钮
	slider: ".nc_scale", // 滑块
	sliderBtn: ".nc-container .nc_scale .btn_slide", // 滑块按钮
	sliderFlag: ".nc-container .nc_scale .btn_ok" // 滑块标记
};

async function CloseConfirmPopup(page: Page): Promise<void> {
	try {
		await page.waitForSelector(SELECTOR.popupBox, { ...WAITFOT_OPT, timeout: 100000 });
		await page.waitForSelector(SELECTOR.popupBtn, { ...WAITFOT_OPT, timeout: 100000 });
		await page.click(SELECTOR.popupBtn);
	} catch {
		console.log(magentaBright("系统提示："), yellowBright("未检测到确认弹窗"));
	}
}

export default async function LoginAccount(page: Page): Promise<boolean> {
	// 1. 检查登录状态
	try {
		await page.waitForSelector(SELECTOR.limitInfo, WAITFOT_OPT);
		console.log(blueBright("登录状态："), greenBright("已登录"));
	} catch {
		console.log(blueBright("登录状态："), yellowBright("未登录，开始登录流程"));
		// 2. 检测确认弹窗并关闭
		await CloseConfirmPopup(page);
		// 3. 输入账号密码
		await page.type(SELECTOR.accountIpt, ACCOUNT, { delay: 10 });
		await page.type(SELECTOR.passwordIpt, PASSWORD, { delay: 10 });
		// 4. 拖动验证滑块
		await page.waitForSelector(SELECTOR.slider, WAITFOT_OPT);
		const slider = await page.$(SELECTOR.slider);
		const sliderBtn = await page.$(SELECTOR.sliderBtn);
		const sliderBox = await slider?.boundingBox();
		const sliderBtnBox = await sliderBtn?.boundingBox();
		if (!!sliderBox && !!sliderBtnBox) {
			await page.mouse.move(sliderBtnBox.x + sliderBtnBox.width / 2, sliderBtnBox.y + sliderBtnBox.height / 2);
			await page.mouse.down();
			await page.mouse.move(sliderBox.x + sliderBox.width, sliderBtnBox.y + sliderBtnBox.height / 2, { steps: 20 });
			await page.mouse.up();
		}
		try {
			await page.waitForSelector(SELECTOR.sliderFlag, WAITFOT_OPT);
		} catch {
			console.log(magentaBright("系统提示："), redBright("登录失败，未检测到滑块标记"));
			return false;
		}
		// 5. 点击登录按钮
		await page.click(SELECTOR.loginBtn);
		// 6. 检查登录状态
		try {
			await page.waitForSelector(SELECTOR.limitInfo, WAITFOT_OPT);
			console.log(magentaBright("系统提示："), greenBright("登录成功"));
		} catch {
			console.log(magentaBright("系统提示："), redBright("登录失败，未检测到额度信息"));
			return false;
		}
	}
	// 7. 检测确认弹窗并关闭
	await WaitFor();
	const isPopupVisible = await CheckElemVisible(page, SELECTOR.popupBox);
	isPopupVisible && await CloseConfirmPopup(page);
	console.log(magentaBright("系统提示："), greenBright("进入首页"));
	return true;
}