import type { WaitForSelectorOptions } from "puppeteer-core";

// 配置
const WAITFOT_OPT: WaitForSelectorOptions = {
	timeout: 5000,
	visible: true
};

const WAITFOT_HIDDEN_OPT: WaitForSelectorOptions = {
	hidden: true,
	timeout: 5000
};

const WEBSITE = "https://www.loreal-boutique.com/";

// 数据
const ACCOUNT = "00819749";
const PASSWORD = "38Z1GJXX";

const PRODUCTS = `
兰蔻菁纯臻颜精萃乳霜(轻盈型) 60ml 876*1
--------------------
修丽可植萃舒缓修复精华露 30ml 187.52*1
兰蔻全新清滢保湿柔肤水 200ml 96*1
`;

// 兰蔻菁纯臻颜精萃乳霜(轻盈型) 60ml 876*1
// --------------------
// 圣罗兰爆品粉气垫套组(B10) 499*5
// 兰蔻轻透水漾防晒乳 30ml 173*1
// --------------------
// 圣罗兰香色套装 419*3
// 兰蔻菁纯臻颜精萃乳霜(轻盈型) 60ml 876*1
// --------------------
// TAKAMI角质护理精华液 30ml 99*5
// 兰蔻菁纯臻颜精萃乳霜(轻盈型) 60ml 876*1
// --------------------
// 修丽可多肽抗皱精华液 30ml 312*4
// 兰蔻菁纯臻颜精萃乳霜(轻盈型) 60ml 876*1
// --------------------
// 修丽可臻彩焕亮精华防晒乳 40ml 135*5
// 修丽可植萃舒缓修复精华露 30ml 188*3
// 兰蔻全新清滢保湿柔肤水 400ml 175*1
// --------------------
// AGE面霜 576*2
// 修丽可植萃舒缓修复精华露 30ml 188*1
// 兰蔻全新清滢保湿柔肤水 400ml 175*1
// --------------------
// AGE面霜 576*2
// 修丽可植萃舒缓修复精华露 30ml 188*1
// 兰蔻全新清滢保湿柔肤水 400ml 175*1
// --------------------
// 科颜氏亚马逊白泥清洁面膜 125ml 71*1
// 十分稀有老款精油 53*5
// 欧莱雅男士水能保湿护肤套装 22*7

export {
	ACCOUNT,
	PASSWORD,
	PRODUCTS,
	WAITFOT_HIDDEN_OPT,
	WAITFOT_OPT,
	WEBSITE
};