import type { WaitForSelectorOptions } from "puppeteer-core";

// 配置
const OPTS_WAITFOT_SELECTOR: WaitForSelectorOptions = {
	timeout: 3000,
	visible: true
};

const WEBSITE = "https://www.loreal-boutique.com/";

// 数据
const ACCOUNT = "00837444";
const PASSWORD = "FS9659JL";

// const PRODUCTS = `
// 兰蔻新菁纯精华粉底液(35ml) 100/110 297*5
// --------------------
// AGE面霜 48ml 564*1
// 阿玛尼轻垫菁华粉底液(15g) 2/3 135*1
// `;

const PRODUCTS = `
兰蔻新菁纯精华粉底液(35ml) 100/110 297*5
兰蔻XXX 100/110 297*5
--------------------
兰蔻全新菁纯眼霜 20ml 360*5
兰蔻净澈焕肤亮白乳液 75ml 255*5
--------------------
圣罗兰黑管镜面唇釉(5.5ml) 440 140*5
兰蔻轻透水漾防晒乳 30ml 149*5
兰蔻全新清滢保湿柔肤水 400ml 150*5
卡诗肌源焕新头皮焕新洗发凝露 200ml 62*5
--------------------
卡诗赋活舒盈洗发水 500ml 135*5
卡诗赋源芯丝沁透洗发水 500ml 135*5
普拉达至色持久轻盈唇膏(3.8g) B03 100*5
--------------------
修丽可臻彩焕亮精华防晒乳 40ml 129*1
修丽可紧致塑颜精华霜 48ml 564*1
AGE面霜 48ml 564*1
阿玛尼轻垫菁华粉底液(15g) 2/3 135*1
兰蔻净澈焕肤亮白精华液 30ml 245*1
--------------------
圣罗兰爆品粉气垫套组 B10/BR20 499*1
植村秀羽纱持妆粉底液(35ml) 574 147*1
兰蔻净澈焕肤亮白精华液 30ml 245*1
`;

// 欧莱雅男士水能保湿护肤套装 29*10

export {
	ACCOUNT,
	OPTS_WAITFOT_SELECTOR,
	PASSWORD,
	PRODUCTS,
	WEBSITE
};