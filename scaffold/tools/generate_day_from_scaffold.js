const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const travelText = fs.readFileSync(path.join(root, "scaffold/world/travel_times.yaml"), "utf8");

const MAX_TICK = 8640;
const RETURN_HOME_TICK = 8580; // 23:50
const MEMORY_LIMIT = 20;
const RELATIONSHIP_LIMIT = 20;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function defaultTargetDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDate(date);
}

const runDate = process.argv[2] || defaultTargetDate();
if (!DATE_RE.test(runDate)) {
  throw new Error("Usage: node scaffold/tools/generate_day_from_scaffold.js YYYY-MM-DD");
}

function hashString(text) {
  let hash = 2166136261;
  for (const ch of text) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function makeRng(seedText) {
  let state = hashString(seedText) || 1;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function intFor(seedText, max) {
  if (max <= 0) return 0;
  return Math.floor(makeRng(`${runDate}:${seedText}`)() * max);
}

function pickFor(seedText, items) {
  return items[intFor(seedText, items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function jitterFor(seedText, radius) {
  return intFor(seedText, radius * 2 + 1) - radius;
}

function regularWakeTickFor(char, def, index) {
  return clamp(def.wakeTick + jitterFor(`${char}:regular-wake:${index}`, 150), 2700, 3120);
}

function bedtimeReturnTickFor(char, index) {
  return clamp(RETURN_HOME_TICK + jitterFor(`${char}:bedtime-return:${index}`, 100), 8460, 8620);
}

function formatTickClock(tick) {
  const totalMinutes = Math.floor(tick / 6);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const locations = {
  tree_house: { name: "巨树树屋区", kind: "home", x: 230, y: 170, short: "树屋" },
  carrot_square: { name: "胡萝卜广场", kind: "public", x: 390, y: 300, short: "广场" },
  mushroom_cafe: { name: "蘑菇咖啡馆", kind: "food", x: 230, y: 275, short: "咖啡馆" },
  timothy_farm: { name: "提摩西农场", kind: "work", x: 180, y: 400, short: "农场" },
  gear_workshop: { name: "齿轮工坊", kind: "work", x: 350, y: 415, short: "工坊" },
  acorn_library: { name: "橡果图书馆", kind: "study", x: 500, y: 440, short: "图书馆" },
  botanical_garden: { name: "植物园", kind: "park", x: 560, y: 330, short: "植物园" },
  rainbow_lake: { name: "彩虹湖", kind: "park", x: 690, y: 300, short: "彩虹湖" },
  carrot_maze: { name: "地下胡萝卜迷宫", kind: "public", x: 700, y: 430, short: "迷宫" },
  rabbit_mountain: { name: "兔耳山", kind: "park", x: 520, y: 180, short: "兔耳山" },
  weather_station: { name: "云朵气象站", kind: "study", x: 505, y: 75, short: "气象站" },
  observatory: { name: "星光天文台", kind: "study", x: 650, y: 70, short: "天文台" },
  shell_bay: { name: "贝壳海湾", kind: "park", x: 400, y: 555, short: "海湾" },
  lighthouse: { name: "灯塔", kind: "public", x: 78, y: 535, short: "灯塔" },
  chanson_hall: { name: "香颂音乐厅", kind: "art", x: 365, y: 494, short: "音乐厅" }
};

const characterDefs = {
  rabbit_1: {
    name: "小悠米",
    birthday: "3月28日",
    color: "#fff4f4",
    scale: 0.8,
    mood: "勇敢",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["botanical_garden", "mushroom_cafe", "acorn_library", "chanson_hall", "rainbow_lake", "botanical_garden", "mushroom_cafe", "shell_bay", "carrot_square", "lighthouse"],
    actionStatuses: ["认真采蜜", "画鲜花图鉴", "轻轻试飞", "寻找稀有花", "整理树叶书", "迷路后导航"],
    actionDetails: [
      "小悠米穿着蜜蜂服采蜜，把花粉小心收进随身的小罐子。",
      "小悠米翻开树叶做成的《世界鲜花图鉴》，给新花歪歪扭扭补上一页。",
      "小悠米勇敢地飞过路口，虽然路线有点歪，但眼睛一直亮亮的。"
    ],
    dialogues: [
      "这朵花我要记下来。",
      "我没有迷路，只是探险。",
      "蜂蜜罐要拿稳一点。",
      "这朵给杰拉德画画。",
      "晚上我又变回兔兔啦。",
      "世界鲜花还差好多页。",
      "风把路牌吹歪啦。",
      "我找到新花线索啦。",
      "这页要画小星星。",
      "我先勇敢一下。"
    ],
    memory: "记得白天穿蜜蜂服采蜜，晚上整理树叶鲜花图鉴。"
  },
  rabbit_2: {
    name: "乔治",
    birthday: "11月3日",
    color: "#7bdff2",
    scale: 1,
    mood: "调皮",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["botanical_garden", "mushroom_cafe", "carrot_square", "gear_workshop", "botanical_garden", "chanson_hall", "mushroom_cafe", "rabbit_mountain", "acorn_library", "botanical_garden"],
    actionStatuses: ["认真养薄荷", "大喊给我劳", "解释手表梗", "调皮想点子", "被递苦咖啡", "照看植物园"],
    actionDetails: [
      "乔治戴着蓝色帽子在植物园转来转去，顺手给小泽摘了一小把薄荷。",
      "乔治忽然喊出“给我劳”，又赶紧解释自己说的是劳力士手表。",
      "乔治鬼点子转得飞快，看到晓雪端来浓缩咖啡，立刻乖了半拍。"
    ],
    dialogues: [
      "给我劳！我是说表！",
      "乔老爷今天也很稳。",
      "晓雪你看这片叶子。",
      "植物园归我巡逻啦。",
      "这杯咖啡怎么这么苦。",
      "我真没那个意思啊。",
      "薄荷今天很精神。",
      "我只是路过一下。",
      "谁又在传我啦。",
      "这个梗能解释。"
    ],
    memory: "记得自己喜欢晓雪，也记得“给我劳”会让劳伦斯误会。"
  },
  rabbit_3: {
    name: "小泽",
    birthday: "7月12日",
    color: "#f9c74f",
    scale: 1,
    mood: "精致",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["mushroom_cafe", "botanical_garden", "carrot_square", "chanson_hall", "mushroom_cafe", "acorn_library", "rainbow_lake", "mushroom_cafe", "lighthouse", "carrot_square"],
    actionStatuses: ["冲一杯咖啡", "拉花乔治脸", "试做新甜点", "看报听抓马", "邀请晓雪拍照", "整理情报站"],
    actionDetails: [
      "小泽在咖啡馆里慢慢拉花，把奶泡拉成乔治吃瘪的小表情。",
      "小泽端着咖啡精致地看报纸，耳朵却在认真接收乔治和劳伦斯的抓马。",
      "小泽把乔治植物园送来的薄荷洗净，准备做一杯新的推广饮品。"
    ],
    dialogues: [
      "奶泡画了乔治脸。",
      "晓雪来拍新品吗？",
      "薄荷是乔治友情赞助。",
      "咖啡馆消息很灵的。",
      "劳伦斯又听错了吗。",
      "甜点给北欧也打包。",
      "今天情报有香气。",
      "杯垫背面有线索。",
      "新品名我想好了。",
      "先别告诉乔治。"
    ],
    memory: "记得咖啡馆是Bunnyland情报站，新品要请晓雪拍照。"
  },
  rabbit_4: {
    name: "晓雪",
    birthday: "10月9日",
    color: "#95d5b2",
    scale: 1,
    mood: "乖巧",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["botanical_garden", "mushroom_cafe", "acorn_library", "chanson_hall", "weather_station", "observatory", "botanical_garden", "mushroom_cafe", "carrot_square", "rabbit_mountain"],
    actionStatuses: ["扎染新发带", "整理衣帽间", "法语碎碎念", "递浓缩咖啡", "试戴小发带", "安静拍穿搭"],
    actionDetails: [
      "晓雪把小悠米带来的花卉铺平，给薄荷绿色耳朵配一条新的扎染发带。",
      "晓雪在微型衣帽间里整理发带，连最小的蝴蝶结都摆得很端正。",
      "晓雪听见乔治又在喊“给我劳”，安静递上一杯苦涩浓缩咖啡。"
    ],
    dialogues: [
      "乔治，先喝咖啡。",
      "Mon dieu, George, tu es incroyable.",
      "这条发带颜色刚好。",
      "Lino帮我拍一张好吗。",
      "小悠米的花很适合。",
      "乔治又只会点头了。",
      "这色卡好温柔。",
      "慢一点也很好。",
      "George, calme-toi.",
      "我听见你解释啦。"
    ],
    memory: "记得自己喜欢乔治，也记得用法语和浓缩咖啡治住他。"
  },
  rabbit_5: {
    name: "杰拉德",
    birthday: "12月7日",
    color: "#cdb4db",
    scale: 0.8,
    mood: "忧郁",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["chanson_hall", "mushroom_cafe", "botanical_garden", "carrot_maze", "rainbow_lake", "acorn_library", "mushroom_cafe", "lighthouse", "shell_bay", "chanson_hall"],
    actionStatuses: ["画奇幻冒险", "润色鲜花图鉴", "设计咖啡招牌", "躲开鲁菜加餐", "保持忧郁气质", "寻找冬天灵感"],
    actionDetails: [
      "杰拉德把大家今天的日常画成奇幻冒险，乔治的手表被画成神秘宝物。",
      "杰拉德帮小悠米润色鲜花图鉴，又偷偷给花瓣添了冬天的白边。",
      "杰拉德看见劳伦斯端来鲁菜，认真思考艺术家忧郁气质该怎么减肥。"
    ],
    dialogues: [
      "这段日常可以进史诗。",
      "小悠米是我的缪斯。",
      "我真的吃不下鲁菜了。",
      "冬天才有忧郁光线。",
      "招牌要再梦幻一点。",
      "减肥也要保持气质。",
      "这页适合加雾。",
      "我把它画成传说。",
      "灵感在灯塔那边。",
      "别再给我加餐啦。"
    ],
    memory: "记得小悠米是灵感缪斯，也记得劳伦斯总把自己当弟弟投喂。"
  },
  rabbit_6: {
    name: "劳伦斯",
    birthday: "1月18日",
    color: "#f4a261",
    scale: 1.2,
    mood: "沉稳",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["mushroom_cafe", "carrot_square", "timothy_farm", "gear_workshop", "botanical_garden", "mushroom_cafe", "lighthouse", "shell_bay", "chanson_hall", "carrot_square"],
    actionStatuses: ["吃煎饼果子", "蘸大葱酱", "耳朵热耷拉", "误会乔治话", "照顾杰拉德", "打包甜点"],
    actionDetails: [
      "劳伦斯穿着厚毛衣走在山东夏天里，耳朵热得慢慢耷拉下来。",
      "劳伦斯认真研究大葱蘸酱和煎饼果子，觉得这里的美食很值得定居。",
      "劳伦斯听见乔治大喊“给我劳”，沉默片刻后又开始产生复杂误会。"
    ],
    dialogues: [
      "乔治刚才是在叫我吗。",
      "大葱蘸酱很有力量。",
      "毛衣今天有点太厚。",
      "杰拉德再吃一口吧。",
      "圣诞甜点要预订。",
      "我可能误会了吗。",
      "这份也给杰拉德。",
      "我先确认一下。",
      "礼物要包稳一点。",
      "乔治是在说表吧。"
    ],
    memory: "记得山东美食很好，也记得乔治的“给我劳”可能只是手表。"
  },
  rabbit_7: {
    name: "Lino",
    birthday: "6月2日",
    color: "#9b7653",
    scale: 1,
    mood: "温顺",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["observatory", "weather_station", "botanical_garden", "mushroom_cafe", "carrot_square", "rainbow_lake", "chanson_hall", "mushroom_cafe", "rabbit_mountain", "lighthouse", "botanical_garden"],
    actionStatuses: ["拍发带街拍", "记录解释现场", "轻轻撒个娇", "耳朵卷心形", "安静调镜头", "整理吃瓜照片"],
    actionDetails: [
      "Lino安静地帮晓雪拍发带穿搭，镜头把薄荷绿色和小裙子都收得很温柔。",
      "Lino安静站在旁边，却精准拍下了乔治向劳伦斯解释的现场。",
      "Lino撒娇时耳朵卷成两个心形，连快门声都变得软软的。"
    ],
    dialogues: [
      "晓雪，这张很好看。",
      "我拍到解释现场了。",
      "耳朵不要自己卷呀。",
      "狗狗也会喜欢这张。",
      "我只是安静吃瓜。",
      "再让我撒娇一下。",
      "今天光线很软。",
      "我拍到小线索了。",
      "这张先不要删。",
      "我在调曝光。"
    ],
    memory: "记得帮晓雪拍发带街拍，也记得拍下乔治向劳伦斯解释现场。"
  }
};

const characterIds = Object.keys(characterDefs);
const earlyRiserRoll = intFor("early-riser-count", 10);
const earlyRiserCount = earlyRiserRoll < 2 ? 0 : earlyRiserRoll === 9 ? 2 : 1;
const earlyRiserIds = characterIds
  .map(id => ({ id, rank: hashString(`${runDate}:early-riser:${id}`) }))
  .sort((a, b) => a.rank - b.rank)
  .slice(0, earlyRiserCount)
  .map(item => item.id);
const dailyEarlyRisers = new Map(earlyRiserIds.map((id, index) => [
  id,
  {
    wakeTick: 240 + intFor(`early-wake:${id}:${index}`, 420)
  }
]));

const durationByPair = new Map();
let currentPair = null;
for (const line of travelText.split(/\n/)) {
  const from = line.match(/^  - from: (.+)$/);
  if (from) {
    currentPair = { from: from[1] };
    continue;
  }
  if (!currentPair) continue;
  const to = line.match(/^    to: (.+)$/);
  if (to) currentPair.to = to[1];
  const ticks = line.match(/^    duration_ticks: (\d+)$/);
  if (ticks) {
    const duration = Number(ticks[1]);
    durationByPair.set(`${currentPair.from}|${currentPair.to}`, duration);
    durationByPair.set(`${currentPair.to}|${currentPair.from}`, duration);
    currentPair = null;
  }
}

const timeline = [];

const dailyWeather = [
  { mood: "晴朗", note: "晨光把路牌照得亮亮的", prop: "透明花露" },
  { mood: "微雨", note: "细雨落在蘑菇伞沿上", prop: "小雨铃" },
  { mood: "多云", note: "云影慢慢经过广场", prop: "云朵贴纸" },
  { mood: "有风", note: "风把发带和地图角吹起来", prop: "风向缎带" },
  { mood: "薄雾", note: "湖边和灯塔都有一点朦胧", prop: "雾色明信片" },
  { mood: "星晴", note: "夜里天文台的星星格外清楚", prop: "星星糖" },
  { mood: "潮湿", note: "贝壳边缘沾着一点盐味水汽", prop: "盐风纸夹" },
  { mood: "闷热", note: "广场石板晒得像刚烤过的饼皮", prop: "凉薄荷贴" },
  { mood: "凉爽", note: "树屋影子把路口遮成一小片蓝", prop: "树影书签" },
  { mood: "阵雨后", note: "每个小水坑都倒着一截兔耳山", prop: "雨后玻璃珠" }
];

const dailyRumors = [
  "咖啡馆吧台压着一张沾奶泡的新菜单",
  "植物园薄荷田冒出一片歪歪的小帽叶",
  "香颂音乐厅有人反复试弹前三个音",
  "灯塔门口放着一本被海风翻皱的小册子",
  "图书馆借阅卡背面留着一行淡铅笔字",
  "彩虹湖边有枚贝壳把日光晃到草丛里",
  "齿轮工坊的慢钟今天总是晚两下响",
  "农场田埂上排着一串像箭头的小萝卜",
  "气象站雨量杯旁多了一枚咖啡印章",
  "兔耳山路牌被风吹得只剩半句提示",
  "蘑菇咖啡馆后门有张没署名的甜点订单",
  "音乐厅后台的座位表夹着一片薄荷叶",
  "树屋扶手下贴着一张只写了半句的便签",
  "彩虹湖倒影里多出一枚倒着走的小箭头",
  "天文台镜片边缘留着一点灯塔光",
  "迷宫转角的面包屑被摆成很小的星座",
  "咖啡馆糖罐底下压着一张折过三次的小票",
  "工坊抽屉里少了一枚正好合适的小齿轮",
  "海湾沙粒排成一条很像路线的弯线",
  "树屋门口的小拖鞋底下露出半截铅笔字",
  "音乐厅第一排座位号被谁悄悄换了顺序",
  "植物园牌背面画着一个很小的杯垫记号",
  "彩虹湖荷叶下夹着一枚没写完的座位贴",
  "兔耳山浅溪边有一串被水冲淡的小脚印",
  "咖啡馆投影布今天只在真实开球时放下来",
  "天文台登记本上多了几颗没连线的小星星",
  "露营绳结上夹着一片干掉的薄荷叶",
  "灯塔台阶旁的小水洼映出倒着的比分牌",
  "咖啡馆角落多了一张没写比分的空白表",
  "彩虹湖荷花旁边漂来半截橙色纸边",
  "兔耳山浅溪把一颗小石头冲到路牌下面",
  "音乐厅后台有人把节目单折成很窄的一条",
  "树屋窗台留着一只还没收起的小闹钟"
];

const sharedProps = [
  "蜂蜜便签",
  "薄荷糖纸",
  "发带色卡",
  "咖啡印章",
  "旧地图角",
  "星象纸条",
  "灯塔钥匙扣",
  "音乐厅节目单",
  "贝壳票根",
  "薄荷色夹子",
  "雨量杯刻度纸",
  "小萝卜箭头",
  "半截风向牌",
  "糖罐小票",
  "镜片擦布",
  "门铃齿轮",
  "树屋便签",
  "面包屑星图",
  "半截铅笔字",
  "小齿轮垫片",
  "海湾沙线",
  "座位号贴纸",
  "杯垫记号",
  "荷叶便签",
  "溪水小石头",
  "露营绳结",
  "投影遥控器",
  "未连线星图",
  "薄荷冰贴",
  "空白比分表",
  "窄折节目单",
  "溪水圆石",
  "小闹钟贴纸",
  "荷花倒影卡"
];

const tinyMesses = [
  "纸角被风掀起又按回去",
  "杯沿轻轻响了一下",
  "路牌灰被蹭掉半指宽",
  "口袋里的贝壳碰到钥匙扣",
  "小票根粘在爪垫边",
  "铅笔芯忽然短了一截",
  "薄荷叶贴在本子封面",
  "节目单边缘翘起来",
  "一小枚齿轮滚到脚边",
  "树影正好盖住脚尖"
];

const smallWeatherDetails = [
  "树叶背面还挂着一点没落下来的水",
  "远处的热气把路牌边缘烫得软软的",
  "有阵风先从湖面过来，又钻进树影里",
  "地上的光斑被脚步踩散，又慢慢合回去",
  "云影正好遮住肩膀，像短短休息了一下",
  "荷叶边的小水珠滚了半圈，没有掉下去",
  "浅溪的声音把后半句话冲得更轻",
  "咖啡馆窗上起了一层很薄的甜雾",
  "山路树荫深得像把句号写重了",
  "天文台玻璃反出一枚很淡的白星",
  "窗外的蝉声忽然停了一小段",
  "湖风把纸页掀到没有字的那面",
  "树影像慢慢盖上的盒盖一样落下来",
  "浅溪里一颗小石头滚了两下才停住"
];

const objectCloseups = [
  "纸角上有一粒干掉的咖啡沫",
  "杯垫边缘被爪尖压出浅浅一道弧",
  "旧地图折痕里藏着一点蓝色蜡笔",
  "发带色卡最浅那格被多看了两眼",
  "小齿轮的齿缝里卡着半根草",
  "节目单背面有一块被雨气润开的墨",
  "贝壳票根反面粘着一粒细沙",
  "露营绳结被系成一个不太标准的小圆",
  "投影遥控器贴着一张写了时间的小纸",
  "荷叶便签上的字被水汽晕开一点",
  "空白比分表的第一格还没被铅笔碰过",
  "窄折节目单露出半个座位号",
  "小闹钟贴纸的边角翘起一点",
  "荷花倒影卡被压在杯垫下面"
];

const bodilyBeats = [
  "他停了一下，把呼吸放慢再继续",
  "她把耳朵轻轻抖了抖，像甩掉一个小问号",
  "对话没有马上往下走，只先听见杯沿轻响",
  "脚步在门口顿了一拍，才选定下一条路",
  "爪尖把那行字遮住又挪开，确认不是看错",
  "包带滑下来一点，很快又被推回肩上",
  "尾音收得很轻，像怕惊动还没干的纸条",
  "大家都没急，先让风把纸页翻到下一面",
  "那一下笑意很短，刚露出来就收好了",
  "影子从脚边挪开时，决定也跟着变清楚了",
  "他把要说的话咽回去一半，只留下一个点头",
  "她看了看时间，没有把结论说太早",
  "杯垫被推近一点，又被推回原位",
  "两只耳朵先动了一下，话才跟上来"
];

const routeTails = [
  "路边有一小截纸条贴在石缝里。",
  "风把身后的脚印吹淡了一点。",
  "转角处的路牌轻轻晃了两下。",
  "一枚小贝壳在路边亮了一瞬。",
  "草叶擦过包带，发出很轻的沙沙声。",
  "远处慢钟响得不太准，像少数了一拍。",
  "咖啡香从另一条路拐过来，又很快散掉。",
  "树屋方向的灯还没完全暗下去。",
  "脚边的小萝卜箭头像是刚被摆正。",
  "有张节目单被压在石头下面，只露出一角。",
  "石板缝里卡着半截细细的蓝线。",
  "前面那只兔兔留下的脚印还很清楚。",
  "一张杯垫贴着路沿转了半圈。",
  "树叶背面的水珠顺着叶脉滑下来。",
  "路口的风向带忽然安静了一会儿。",
  "远处有人合上一本很厚的书。",
  "灯塔方向闪了一下，又恢复原样。",
  "包里的小齿轮隔着布轻轻碰了一声。"
];

const pauseTails = [
  "话说到这里，刚好停住。",
  "后半句被风带走了一点。",
  "谁也没急着接话。",
  "这一下很轻，差点没人发现。",
  "纸面安静了两秒。",
  "远处的声音先替大家回答了。",
  "它看起来不像线索，但被收好了。",
  "这件事没有变大，只是留下来了。",
  "爪尖在原地停了一会儿。",
  "旁边那页没有马上翻过去。",
  "大家只交换了一个很短的眼神。",
  "这句话被留在了纸角。",
  "风停时，东西还在原来的位置。",
  "没有谁催着把答案说完。",
  "小小的响动很快又安静下来。",
  "它被放好，等下一只兔兔发现。"
];

const handMotions = [
  "又用爪尖把纸边压平",
  "顺手把包带往肩上一提",
  "低头确认了一下小票背面",
  "把刚捡到的东西放进左边口袋",
  "停下来听了半拍远处的声音",
  "用铅笔在角落点了一个小点",
  "把沾灰的边角轻轻吹干净",
  "朝树屋方向看了一眼",
  "把松开的结重新系紧",
  "忍不住又回头看了看路牌"
];

const shortReplies = [
  "嗯，先这样。",
  "我看见了。",
  "等下记上。",
  "别吹走啦。",
  "这句留着。",
  "先别声张。",
  "我再确认。",
  "很小，但有用。",
  "放这里就好。",
  "回家再说。"
];

const halfSpokenDialogues = [
  "先别写满。",
  "这个晚点说。",
  "嗯，像真的。",
  "我听见了。",
  "别急着翻页。",
  "这里留空。",
  "就差一点。",
  "等风停。",
  "我先收好。",
  "小声一点。",
  "别把它吓跑。",
  "这句够了。",
  "先看时间。",
  "空着也行。",
  "不要猜比分。",
  "等它自己来。"
];

const sensoryDialogues = [
  "杯子有点烫。",
  "纸边还湿。",
  "风从湖上来。",
  "山路有水声。",
  "灯光刚刚好。",
  "薄荷味很近。",
  "耳朵有点热。",
  "这个角会反光。",
  "树影压下来了。",
  "溪水在说话。",
  "投影有点亮。",
  "闹钟刚停。",
  "荷叶在晃。",
  "铅笔别太重。"
];

const characterWhispers = {
  rabbit_1: ["这页要留花边。", "我先不擦掉。", "像不像新花。"],
  rabbit_2: ["我真的能解释。", "帽子没歪吧。", "这梗还行。"],
  rabbit_3: ["先压在杯垫下。", "这条消息有糖味。", "别让奶泡塌了。"],
  rabbit_4: ["颜色先别急。", "乔治，呼吸。", "发带别沾灰。"],
  rabbit_5: ["这页需要阴影。", "忧郁也要证据。", "别把盘子端近。"],
  rabbit_6: ["我再分一栏。", "餐盒先扣好。", "这事要稳一点。"],
  rabbit_7: ["快门轻一点。", "这张别动。", "光线刚刚好。"]
};

const locationWhispers = {
  tree_house: ["拖鞋先摆好。", "别吵醒楼上。", "回家再整理。"],
  carrot_square: ["第三个箭头歪了。", "公告要再看一遍。", "纸条压紧一点。"],
  mushroom_cafe: ["杯垫翻过来。", "奶泡先别碰。", "糖罐底下有字。"],
  timothy_farm: ["田埂这边有脚印。", "小萝卜别摆反。", "农具箱先合上。"],
  gear_workshop: ["慢钟又少一拍。", "这枚齿轮不对。", "先听第三声。"],
  acorn_library: ["借阅卡看背面。", "索引页别折角。", "铅笔字还看得见。"],
  botanical_garden: ["薄荷叶又歪了。", "植物牌系紧点。", "花样本分两份。"],
  rainbow_lake: ["倒影是反的。", "贝壳先擦一下。", "水面别碰太重。"],
  carrot_maze: ["转角数到这里。", "面包屑别踩散。", "出口箭头在左边。"],
  rabbit_mountain: ["云影过路牌了。", "风向带还在。", "山路雾没散。"],
  weather_station: ["雨量杯先读数。", "纸条还没干。", "风向仪指偏了。"],
  observatory: ["镜片边有亮点。", "晨星还没走。", "焦距慢慢调。"],
  shell_bay: ["沙线拐向灯塔。", "潮声又近了一点。", "贝壳字是反的。"],
  lighthouse: ["门铃先别再按。", "台阶还是有点松。", "小册子看第一页。"],
  chanson_hall: ["第一排少一号。", "节目单摆齐了。", "前三个音又响了。"]
};

function parseBirthday(text) {
  const match = text.match(/^(\d{1,2})月(\d{1,2})日$/);
  if (!match) return null;
  return { month: Number(match[1]), day: Number(match[2]) };
}

function dateParts(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return { year, month, day };
}

function dayOfYear(year, month, day) {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000) + 1;
}

function daysUntilBirthday(dateText, birthdayText) {
  const birthday = parseBirthday(birthdayText);
  if (!birthday) return null;
  const { year, month, day } = dateParts(dateText);
  const today = dayOfYear(year, month, day);
  const birthdayThisYear = dayOfYear(year, birthday.month, birthday.day);
  const daysInYear = dayOfYear(year, 12, 31);
  return (birthdayThisYear - today + daysInYear + 1) % (daysInYear + 1);
}

function birthdayNote(def) {
  const days = daysUntilBirthday(runDate, def.birthday);
  if (days === 0) return `${def.name}今天生日，大家悄悄把祝福塞进日程里。`;
  if (days !== null && days <= 7) return `${def.name}生日倒数${days}天，大家开始准备小惊喜。`;
  if (days !== null && days >= 358) return `${def.name}生日刚过不久，祝福还在岛上慢慢回响。`;
  if (days !== null && days <= 35) return `${def.name}的生日已经进入远远倒数，礼物灵感开始冒头。`;
  return "";
}

const dailyContext = {
  weather: pickFor("weather", dailyWeather),
  rumor: pickFor("rumor", dailyRumors),
  prop: pickFor("prop", sharedProps)
};

const worldCupProfiles = {
  rabbit_1: {
    team: "巴西",
    reactionMood: "雀跃",
    latestResult: "巴西3比0战胜苏格兰并锁定小组第一",
    upcoming: "等待淘汰赛对手出炉",
    reaction: "她把苏格兰这场三个进球画成三朵更亮的小花，又在旁边留出淘汰赛空白页。",
    liveReaction: "她把黄绿色小旗压在杯垫边，只记录已经发生的镜头。",
    dialogues: ["巴西又三球呀。", "小组第一啦。", "黄绿色很好看。", "空白页留着。"]
  },
  rabbit_2: {
    team: "美国",
    reactionMood: "嘴硬",
    latestResult: "美国2比3不敌土耳其但仍以小组第一晋级",
    upcoming: "等待32强对手确认",
    reaction: "他把输球写得很小，把小组第一写得很大，蓝帽子还是要扶正。",
    liveReaction: "他把蓝帽子扶正，等哨声以后才把比分写进便签。",
    dialogues: ["还是小组第一。", "输球也要扶帽子。", "先别笑我。", "淘汰赛再说。"]
  },
  rabbit_3: {
    team: "比利时",
    reactionMood: "谨慎",
    latestResult: "比利时0比0战平伊朗",
    upcoming: "上海时间6月27日11:00对阵新西兰",
    reaction: "他把两个平局叠在杯垫背面，决定下一场只在真开球时打开投影。",
    liveReaction: "他把咖啡机时间和投影时间对齐，杯垫先留空不写比分。",
    dialogues: ["零比零也要记。", "十一点看比利时。", "杯垫先别丢。"]
  },
  rabbit_4: {
    team: "法国",
    reactionMood: runDate === "2026-06-27" ? "专注" : "明亮",
    latestResult: "法国3比0战胜伊拉克",
    upcoming: "上海时间6月27日03:00对阵挪威",
    reaction: "她把3比0写进浅色发带，想到下一场要和劳伦斯一起看就笑了一下。",
    liveReaction: "她把法国队小旗别在发带盒旁，比分栏先空着。",
    dialogues: ["Allez les Bleus.", "三比零很漂亮。", "三点看法国队。"]
  },
  rabbit_5: {
    team: "荷兰",
    reactionMood: "振奋",
    latestResult: "荷兰3比1战胜突尼斯并以小组第一晋级",
    upcoming: "32强将对阵摩洛哥",
    reaction: "他把3比1画成一条更稳的橙色边框，旁边写下摩洛哥。",
    liveReaction: "他先画一条橙色边框，等比赛结束后再决定明暗。",
    dialogues: ["三比一也够亮。", "下一场摩洛哥。", "橙色先留着。", "这页不加雾。"]
  },
  rabbit_6: {
    team: "挪威",
    reactionMood: runDate === "2026-06-27" ? "专注" : "踏实",
    latestResult: "挪威3比2战胜塞内加尔",
    upcoming: "上海时间6月27日03:00对阵法国",
    reaction: "他把3比2写在战术纸最稳的一栏，又给法国那栏留出晓雪的位置。",
    liveReaction: "他把战术纸分成两栏，开球后只记真实发生的推进。",
    dialogues: ["三比二很紧。", "三点看挪威队。", "零食和战术分开放。"]
  },
  rabbit_7: {
    team: "日本",
    reactionMood: "安定",
    latestResult: "日本1比1战平瑞典并以小组第二晋级",
    upcoming: "32强将对阵巴西",
    reaction: "他把1比1的两张照片并排放好，又给巴西那页先调低曝光。",
    liveReaction: "他把曝光调低一点，等画面出现再轻轻按快门。",
    dialogues: ["一比一也稳。", "下一场巴西呀。", "曝光先调低。", "这张并排放。"]
  }
};

const worldCupMatchesByShanghaiDate = {
  "2026-06-22": [
    { kickoff: "00:00", kickoffTick: 0, home: "西班牙", away: "沙特" },
    { kickoff: "03:00", kickoffTick: 1080, home: "比利时", away: "伊朗" },
    { kickoff: "06:00", kickoffTick: 2160, home: "乌拉圭", away: "佛得角" },
    { kickoff: "09:00", kickoffTick: 3240, home: "新西兰", away: "埃及" }
  ],
  "2026-06-23": [
    { kickoff: "01:00", kickoffTick: 360, home: "阿根廷", away: "奥地利" },
    { kickoff: "05:00", kickoffTick: 1800, home: "法国", away: "伊拉克" },
    { kickoff: "08:00", kickoffTick: 2880, home: "挪威", away: "塞内加尔" },
    { kickoff: "11:00", kickoffTick: 3960, home: "约旦", away: "阿尔及利亚" }
  ],
  "2026-06-25": [
    { kickoff: "03:00", kickoffTick: 1080, home: "瑞士", away: "加拿大" },
    { kickoff: "03:00", kickoffTick: 1080, home: "波黑", away: "卡塔尔" },
    { kickoff: "06:00", kickoffTick: 2160, home: "摩洛哥", away: "海地" },
    { kickoff: "06:00", kickoffTick: 2160, home: "苏格兰", away: "巴西" },
    { kickoff: "09:00", kickoffTick: 3240, home: "南非", away: "韩国" },
    { kickoff: "09:00", kickoffTick: 3240, home: "捷克", away: "墨西哥" }
  ],
  "2026-06-26": [
    { kickoff: "04:00", kickoffTick: 1440, home: "库拉索", away: "科特迪瓦" },
    { kickoff: "04:00", kickoffTick: 1440, home: "厄瓜多尔", away: "德国" },
    { kickoff: "07:00", kickoffTick: 2520, home: "突尼斯", away: "荷兰" },
    { kickoff: "07:00", kickoffTick: 2520, home: "日本", away: "瑞典" },
    { kickoff: "10:00", kickoffTick: 3600, home: "土耳其", away: "美国" },
    { kickoff: "10:00", kickoffTick: 3600, home: "巴拉圭", away: "澳大利亚" }
  ],
  "2026-06-27": [
    { kickoff: "03:00", kickoffTick: 1080, home: "挪威", away: "法国" },
    { kickoff: "03:00", kickoffTick: 1080, home: "塞内加尔", away: "伊拉克" },
    { kickoff: "08:00", kickoffTick: 2880, home: "佛得角", away: "沙特" },
    { kickoff: "08:00", kickoffTick: 2880, home: "乌拉圭", away: "西班牙" },
    { kickoff: "11:00", kickoffTick: 3960, home: "埃及", away: "伊朗" },
    { kickoff: "11:00", kickoffTick: 3960, home: "新西兰", away: "比利时" }
  ],
  "2026-06-28": [
    { kickoff: "05:00", kickoffTick: 1800, home: "巴拿马", away: "英格兰" },
    { kickoff: "05:00", kickoffTick: 1800, home: "克罗地亚", away: "加纳" },
    { kickoff: "07:30", kickoffTick: 2700, home: "哥伦比亚", away: "葡萄牙" },
    { kickoff: "07:30", kickoffTick: 2700, home: "刚果民主共和国", away: "乌兹别克斯坦" },
    { kickoff: "10:00", kickoffTick: 3600, home: "阿尔及利亚", away: "奥地利" },
    { kickoff: "10:00", kickoffTick: 3600, home: "约旦", away: "阿根廷" }
  ]
};

const MATCH_WATCH_TICKS = 600;

const summerGroupDialogues = [
  "荷花开到湖边啦。",
  "下午去溯溪吗。",
  "露营灯记得带。",
  "兔耳山树荫变深了。",
  "今晚看完球再观星。",
  "溪水边要慢慢走。"
];

function worldCupText(char) {
  const profile = worldCupProfiles[char];
  const parts = [profile.latestResult, profile.upcoming, profile.pending].filter(Boolean);
  return parts.join("；");
}

function matchesForRunDate() {
  return worldCupMatchesByShanghaiDate[runDate] || [];
}

function scheduledMatchFor(char) {
  const team = worldCupProfiles[char]?.team;
  return matchesForRunDate().find(match => match.home === team || match.away === team) || null;
}

function fixtureListForRunDate() {
  return matchesForRunDate()
    .map(match => `${match.kickoff} ${match.home}对${match.away}`)
    .join("、");
}

function moodFor(char, fallback) {
  return worldCupProfiles[char]?.reactionMood || fallback;
}

function dailyDetail(seed, fragments) {
  return pickFor(seed, fragments);
}

const moveDetailsByChar = {
  rabbit_1: [
    "{name}穿着蜜蜂服飞向{place}，一路寻找没见过的花。",
    "{name}抱着蜂蜜罐去{place}，差点把路牌当成新花种。",
    "{name}把树叶图鉴夹好，勇敢地往{place}继续探险。",
    "{name}飞过路口时绕了一圈，确认这不是迷路而是探索。",
    "{name}带着一朵稀有小花去{place}，准备晚点给杰拉德看。",
    "{name}沿着{dailyProp}旁边的小爪印去{place}，一路把路牌看了两遍。",
    "{name}听说{dailyRumor}，立刻把{place}列进今日探险。",
    "{name}把翅膀抖得亮亮的，趁着{weatherMood}去{place}找花。",
    "{name}路过一片会发光的草叶，把它夹进图鉴后飞去{place}。"
  ],
  rabbit_2: [
    "{name}戴着蓝帽子去{place}，嘴里还念着新看的手表型号。",
    "{name}去{place}前喊了一声给我劳，然后立刻四处解释。",
    "{name}沿路给植物园的薄荷浇水，顺手想了三个鬼点子。",
    "{name}看见晓雪的方向就放慢脚步，蓝色背带裤晃了一下。",
    "{name}朝{place}跑去，蓝帽子一路晃得很有派头。",
    "{name}把{dailyProp}塞进口袋，假装这也是限量表盒。",
    "{name}听见{dailyRumor}后眼睛一亮，马上拐去{place}。",
    "{name}趁着{weatherMood}巡逻，顺便把薄荷护送到{place}。",
    "{name}在路口练习解释话术，越说越急，只好先去{place}。"
  ],
  rabbit_3: [
    "{name}端着咖啡去{place}，奶泡上还留着乔治吃瘪的表情。",
    "{name}带着新甜点去{place}，顺便收集今天的第一条情报。",
    "{name}路过植物园时拿到薄荷，心里已经想好新品名字。",
    "{name}把报纸夹在手边，优雅地往{place}继续移动。",
    "{name}去{place}前打包了几块甜点，准备留给劳伦斯过节。",
    "{name}把{dailyProp}压在账本里，慢慢往{place}走。",
    "{name}听说{dailyRumor}，把围裙理平后去{place}看一眼。",
    "{name}顺着{weatherMood}的气味调整咖啡配方，再慢慢去{place}。",
    "{name}把今日情报写在账单角上，轻轻夹好后前往{place}。"
  ],
  rabbit_4: [
    "{name}戴着新发带去{place}，薄荷绿色耳朵安静垂着。",
    "{name}带着小悠米采来的花去{place}，准备继续试染发带。",
    "{name}听见乔治远远喊话，已经把浓缩咖啡端稳。",
    "{name}往{place}走得很乖，法语吐槽却已经在心里排队。",
    "{name}整理好小裙子，准备去{place}让Lino再拍一张。",
    "{name}把{dailyProp}别在发带盒上，安静地去{place}配色。",
    "{name}听到{dailyRumor}后轻轻点头，提着小盒子去{place}。",
    "{name}趁{weatherMood}把裙摆整理好，耳朵轻轻晃着走向{place}。",
    "{name}带着新色卡去{place}，每一步都很乖很有主意。"
  ],
  rabbit_5: [
    "{name}抱着画本去{place}，把普通路口想成奇幻城门。",
    "{name}带着小悠米的花稿去{place}，准备给图鉴润色。",
    "{name}一边往{place}走，一边思考忧郁艺术家能不能少吃鲁菜。",
    "{name}把今天的路线画成冒险地图，兴致很高又很忧郁。",
    "{name}去{place}前看了看冬天色卡，给故事页角添了一点雪。",
    "{name}把{dailyProp}画成传奇道具，抱着画本走去{place}。",
    "{name}听说{dailyRumor}，马上觉得这是一段奇幻支线。",
    "{name}在{weatherMood}里寻找阴影形状，慢慢走向{place}。",
    "{name}把路边小石子当作城堡遗迹，郑重前往{place}。"
  ],
  rabbit_6: [
    "{name}穿着厚毛衣往{place}走，山东夏天让耳朵慢慢耷拉。",
    "{name}去{place}前买了煎饼果子，还认真研究大葱蘸酱比例。",
    "{name}听见乔治的声音后沉默了一下，才继续往{place}走。",
    "{name}把给杰拉德的加餐收好，步子沉稳地去{place}。",
    "{name}路过咖啡馆时预订甜点，想着圣诞节要带回北欧。",
    "{name}把{dailyProp}收进口袋，又把口袋边仔细按平。",
    "{name}听见{dailyRumor}后认真判断，也许应该去{place}帮忙。",
    "{name}顶着{weatherMood}继续前进，毛衣和责任感都很厚。",
    "{name}带着给杰拉德的备用餐盒，稳稳走向{place}。"
  ],
  rabbit_7: [
    "{name}背着相机去{place}，一路安静得只剩快门带子轻晃。",
    "{name}去{place}前检查了晓雪的街拍，耳朵差点卷成心形。",
    "{name}一路寻找乔治解释现场的角度，吃瓜吃得很温顺。",
    "{name}把镜头抱好，轻轻往{place}走，连脚步都放慢了。",
    "{name}想起狗狗朋友会喜欢这张照片，脚步也软了一点。",
    "{name}把{dailyProp}放进相机包，准备去{place}拍今日光线。",
    "{name}听说{dailyRumor}，安静地把镜头转向{place}。",
    "{name}趁着{weatherMood}调整曝光，慢慢走向{place}。",
    "{name}在路边试拍一张空镜，确认下一站就是{place}。"
  ]
};

const actionTailsByChar = {
  rabbit_1: [
    "她在旁边标注：可能是世界上第很多很多号花。",
    "蜂蜜罐晃了一下，但她勇敢地稳住了。",
    "她打算晚上把这页讲给杰拉德听。",
    "她觉得这次迷路也很有旅行家的气质。",
    "她把今天的天气画成一条小箭头。",
    "她把{dailyProp}夹进图鉴，假装这是探险徽章。",
    "听见{dailyRumor}后，她把问号画得特别圆。"
  ],
  rabbit_2: [
    "他又小声补了一句：真的只是手表。",
    "他看见晓雪以后，调皮劲立刻少了一半。",
    "植物园的薄荷被他照顾得很神气。",
    "远处的劳伦斯听见后，表情又复杂了一点。",
    "他顺着今天的天气扶了扶帽檐，觉得自己很有派头。",
    "他把{dailyProp}当成新梗道具，差点又解释不清。",
    "听见{dailyRumor}后，他先压低帽檐装作早就知道。"
  ],
  rabbit_3: [
    "咖啡香绕过桌角，带回两条新八卦。",
    "他把报纸翻过一页，假装什么都没听见。",
    "新品照片位已经给晓雪留好。",
    "奶泡里的乔治眉毛越拉越倔。",
    "他把今天的天气写成新品口味旁边的一小行备注。",
    "他在杯垫背面盖了一个{dailyProp}小印章。",
    "听见{dailyRumor}后，他把情报等级悄悄升了一格。"
  ],
  rabbit_4: [
    "她把发带轻轻抚平，甜得很安静。",
    "那句法语吐槽轻轻绕过杯沿。",
    "乔治虽然听不懂，但已经乖乖点头。",
    "她把小悠米带来的花色记进衣帽间标签。",
    "她看了看今天的天色，挑出一条更浅的发带。",
    "她把{dailyProp}收进小盒子，留作下一套穿搭灵感。",
    "听见{dailyRumor}后，她只眨了眨眼，已经想好配色。"
  ],
  rabbit_5: [
    "画面里每只兔兔都被他安排了披风和小路牌。",
    "他把自己的围巾画长一点，好显得更忧郁。",
    "劳伦斯的加餐阴影暂时被他画成山脉。",
    "小悠米带来的花让整页都亮起来。",
    "他把今天的光线压成画纸边缘的一层柔软阴影。",
    "他把{dailyProp}画成主角会捡到的神秘物。",
    "听见{dailyRumor}后，他在页角写下“第二章”。"
  ],
  rabbit_6: [
    "他认真考虑要不要把毛衣换薄一点。",
    "他把大葱蘸酱的味道记成山东生活重点。",
    "他想着杰拉德太瘦，晚点也许还要添一小碟。",
    "他又问了一遍：乔治真的不是在叫我吗。",
    "他摸了摸袖口，认真判断今天到底要不要再多带一件。",
    "他把{dailyProp}仔细包好，准备当作备用礼物。",
    "听见{dailyRumor}后，他认真地把误会和事实分成两栏。"
  ],
  rabbit_7: [
    "照片里刚好有一只正在解释的乔治。",
    "他不说话，只把快门按得很诚实。",
    "耳朵卷成心形时，他自己也有点不好意思。",
    "他给晓雪留了一张最温柔的底片。",
    "他顺着今天的光线按下快门，照片边缘亮了一小圈。",
    "他把{dailyProp}放在镜头旁边，当作今日色彩参考。",
    "听见{dailyRumor}后，他把快门声调得更轻。"
  ]
};

const phaseBeats = {
  morning: {
    label: "清晨",
    details: [
      "开园前的路牌还带着露水。",
      "第一批脚印从树屋慢慢散开。",
      "广场公告牌被擦得很亮。",
      "大家把今天的小任务别在包带上。",
      "树屋台阶边有一排没干透的小脚印。",
      "咖啡馆窗缝先飘出一点甜味。"
    ],
    dialogues: ["早安，开园啦。", "露水还在叶尖。", "今天先看路牌。", "我带了小清单。", "鞋尖有点湿。", "先别吵醒大家。"]
  },
  noon: {
    label: "午间",
    details: [
      "咖啡馆的点心香气绕过主路。",
      "午后的公告把几张纸条钉在同一块板上。",
      "薄荷、旧地图和节目单都被摆上桌。",
      "大家在广场附近短短交换消息。",
      "杯垫被压在账本底下，只露出半个角。",
      "树影慢慢移过胡萝卜广场的边线。"
    ],
    dialogues: ["午间消息来了。", "点心先留一块。", "这张纸先留着。", "我听见公告了。", "杯垫别弄丢。", "先喝口水。"]
  },
  afternoon: {
    label: "午后",
    details: [
      "旧地图把迷宫、海湾和灯塔连成一条线。",
      "海湾风把音乐厅节目单翻开一角。",
      "齿轮工坊的慢钟让大家重新对表。",
      "图书馆借阅卡背面那行字变得更清楚。",
      "兔耳山的云影把路线分成深浅两段。",
      "农场小萝卜排成的箭头被重新摆正。"
    ],
    dialogues: ["旧地图有用。", "海湾那边见。", "慢钟又慢啦。", "这行字很关键。", "箭头摆反啦。", "风把纸吹走了。"]
  },
  night: {
    label: "夜晚",
    details: [
      "香颂音乐厅亮起一排小灯。",
      "灯塔和天文台把夜色分成两种光。",
      "海湾的贝壳把星光反射到节目单上。",
      "夜深后大家把纸条、贝壳和节目单各自收好。",
      "咖啡馆最后一盏小灯还照着吧台边。",
      "树屋窗口一格一格亮起来，又慢慢暗下去。"
    ],
    dialogues: ["小演出开始啦。", "灯塔亮起来了。", "星星排得好齐。", "今天可以收尾。", "门口风小一点。", "回家前数人数。"]
  }
};

const locationActivities = {
  tree_house: [
    { status: "整理背包", detail: "{name}在树屋门口清点{dailyProp}，把皱角纸条按颜色排好，{handMotion}。" },
    { status: "贴小便签", detail: "{name}把一张小便签贴在树屋扶手上，提醒大家看当天钟点回家。" },
    { status: "看开园表", detail: "{name}看了看开园表，发现{phaseDetail}" },
    { status: "收小拖鞋", detail: "{name}把门口歪掉的小拖鞋摆齐，顺手摸到一张夹在鞋底的纸条，旁边{tinyMess}。" }
  ],
  carrot_square: [
    { status: "看公告牌", detail: "{name}在胡萝卜广场读公告，公告上写着：{dailyRumor}。" },
    { status: "换纸条", detail: "{name}把{dailyProp}压在公告牌下，顺手取走一张写着海湾方向的纸条，{handMotion}。" },
    { status: "记路牌", detail: "{name}沿着广场路牌重新确认去农场、山路和海湾的方向。" },
    { status: "数小萝卜", detail: "{name}数了数广场边的小萝卜箭头，发现第三个箭头被谁悄悄转了半圈。" }
  ],
  mushroom_cafe: [
    { status: "试新点心", detail: "{name}在蘑菇咖啡馆试了一小口点心，旁边的杯垫写着{phaseLabel}暗号，{handMotion}。" },
    { status: "听吧台话", detail: "{name}听见咖啡机旁的低声聊天，正好提到{dailyRumor}。" },
    { status: "盖咖啡章", detail: "{name}在节目单角落盖了咖啡印章，香味一路飘到广场。" },
    { status: "擦糖罐", detail: "{name}把糖罐盖擦亮，里面映出一截刚被藏好的路线，吧台边{tinyMess}。" },
    { status: "布置看球桌", detail: "{name}把咖啡馆晚上的桌子朝投影方向挪好，为支持的{team}留下一张小旗。" },
    { status: "讨论世界杯", detail: "{name}和大家核对世界杯消息：{footballUpdate}。{footballReaction}" },
    { status: "准备看球点心", detail: "{name}给夜间看球准备点心，杯垫上写着今天的赛程：{fixtureList}。" }
  ],
  timothy_farm: [
    { status: "查农具箱", detail: "{name}在提摩西农场检查农具箱，里面夹着一片薄荷糖纸，{handMotion}。" },
    { status: "看田埂", detail: "{name}沿田埂看了看脚印，确认这条路会通往齿轮工坊。" },
    { status: "收小萝卜", detail: "{name}把小萝卜排成箭头，给后面来的兔兔指路。" },
    { status: "拍泥点", detail: "{name}发现田埂泥点排得像省略号，于是把后半句留给下一站。" }
  ],
  gear_workshop: [
    { status: "修慢钟", detail: "{name}在齿轮工坊听慢了两拍的钟，认真把时间重新校准。" },
    { status: "试门铃", detail: "{name}试了试灯塔门铃备用齿轮，声音清脆地滚到台阶下。" },
    { status: "擦齿轮", detail: "{name}把齿轮擦亮，发现里面映出一小段旧地图线，{handMotion}。" },
    { status: "找小螺丝", detail: "{name}从工作台边捡起一枚小螺丝，发现它刚好卡住慢钟的第三声，地上{tinyMess}。" }
  ],
  acorn_library: [
    { status: "查借阅卡", detail: "{name}在橡果图书馆翻到借阅卡，背面的铅笔字指向迷宫。" },
    { status: "摊旧地图", detail: "{name}把旧地图摊开，发现海湾、灯塔和音乐厅被同一条虚线连着，{handMotion}。" },
    { status: "找索引页", detail: "{name}在索引页里找到{dailyProp}旁边的编号，轻轻夹进书签。" },
    { status: "吹书页灰", detail: "{name}轻轻吹掉书页灰，灰尘落下时刚好露出半个地点名，书桌上{tinyMess}。" }
  ],
  botanical_garden: [
    { status: "认新叶子", detail: "{name}在植物园认出一片歪成蓝帽子角度的薄荷叶，忍不住多看两眼。" },
    { status: "采花样本", detail: "{name}把花样本装进小纸袋，准备给发带和图鉴都留一份。" },
    { status: "浇薄荷田", detail: "{name}给薄荷田浇水，水珠在{weatherMood}里亮了一下。" },
    { status: "绑植物牌", detail: "{name}把松开的植物牌重新绑好，牌背后写着一行很小的方向，{handMotion}。" }
  ],
  rainbow_lake: [
    { status: "比对倒影", detail: "{name}在彩虹湖边比对倒影，发现迷宫纹样在水面上反过来了。" },
    { status: "捡亮贝壳", detail: "{name}捡到一枚会反光的小贝壳，先在袖口上擦了擦，{handMotion}。" },
    { status: "看湖面光", detail: "{name}看着湖面把今天的光影揉成一条很软的彩带。" },
    { status: "压住倒影", detail: "{name}用指尖轻轻碰了碰水面，倒影散开前露出一截路标颜色，湖边{tinyMess}。" },
    { status: "看初夏荷花", detail: "{name}沿彩虹湖畔慢慢看新开的荷花，花瓣上的露水还没有完全干。" },
    { status: "约大家赏荷", detail: "{name}在湖边给大家留下一张赏荷便签，约好傍晚一起看荷花倒影。" }
  ],
  carrot_maze: [
    { status: "描迷宫纹", detail: "{name}在地下胡萝卜迷宫描下一段奇怪纹样，线条最后拐向灯塔。" },
    { status: "数转角", detail: "{name}一边数转角一边做记号，避免把探险写成迷路。" },
    { status: "找出口箭头", detail: "{name}发现墙边有个小箭头，正好指向旧地图缺口，{handMotion}。" },
    { status: "贴面包屑", detail: "{name}把碎纸片贴在转角上，回头看时像一串很小的星座，墙边{tinyMess}。" }
  ],
  rabbit_mountain: [
    { status: "看山路云", detail: "{name}在兔耳山看云影经过山路，把天气记得更细了一点。" },
    { status: "听远处钟", detail: "{name}在山路上听见工坊慢钟，声音轻轻飘到云里。" },
    { status: "系风向带", detail: "{name}把风向缎带系在路牌上，给去气象站的兔兔看。" },
    { status: "擦山路牌", detail: "{name}把山路牌上的雾擦掉，发现底下还有一层旧箭头，{handMotion}。" },
    { status: "踩初夏溪水", detail: "{name}和同伴沿森林里的浅溪慢慢走，树荫已经浓得盖住半条水面。" },
    { status: "选露营空地", detail: "{name}在郁郁葱葱的森林边挑了一块平整空地，准备下次一起露营。" },
    { status: "整理露营绳", detail: "{name}把露营绳和小灯分开放好，约大家看完球再上山观星。" }
  ],
  weather_station: [
    { status: "记云层", detail: "{name}在云朵气象站记录云层，旁边标注今天是{weatherMood}。" },
    { status: "读雨量杯", detail: "{name}读了读雨量杯，又把数据抄到节目单背面。" },
    { status: "校风向仪", detail: "{name}校准风向仪，发现指针短短指向香颂音乐厅。" },
    { status: "晾小纸条", detail: "{name}把被雨气打湿的小纸条晾在仪器旁，字迹慢慢清楚起来，{handMotion}。" }
  ],
  observatory: [
    { status: "调望远镜", detail: "{name}在星光天文台调望远镜，把夜里的路线提前对准。" },
    { status: "画星象纸", detail: "{name}画了一张星象纸条，准备晚上拿去海湾对星光。" },
    { status: "看晨星", detail: "{name}看见一颗迟到的晨星，把它记成今天的小坐标。" },
    { status: "擦镜片", detail: "{name}擦了擦望远镜镜片，镜面里短短闪过灯塔的光，{handMotion}。" },
    { status: "约夜间观星", detail: "{name}把初夏观星时间写在纸条上，约大家收好当天小事后再来天文台。" }
  ],
  shell_bay: [
    { status: "翻小贝壳", detail: "{name}在贝壳海湾翻看贝壳，找到一枚能反射节目单字迹的。" },
    { status: "听潮声", detail: "{name}听潮声一下一下推向灯塔方向，脚边沙粒也跟着动。" },
    { status: "收贝壳光", detail: "{name}把贝壳光收进小盒子，准备带去音乐厅当舞台灵感。" },
    { status: "抖沙口袋", detail: "{name}把口袋里的细沙抖出来，沙粒排成一条弯弯路线，{handMotion}。" }
  ],
  lighthouse: [
    { status: "试灯塔铃", detail: "{name}在灯塔门口试门铃，声音一路滚到海湾边。" },
    { status: "擦灯罩", detail: "{name}把灯塔灯罩擦亮，发现光线能照出旧地图的一角，{handMotion}。" },
    { status: "看守小册", detail: "{name}翻开等人认领的小册子，第一页夹着{dailyProp}。" },
    { status: "扶小台阶", detail: "{name}扶正门口有点松的小台阶，台阶缝里藏着半枚票根，门边{tinyMess}。" }
  ],
  chanson_hall: [
    { status: "排小演出", detail: "{name}在香颂音乐厅帮忙排小演出，节目单边角闪着贝壳光。" },
    { status: "试开场曲", detail: "{name}听见一段很轻的开场曲，觉得今天的故事终于接上了。" },
    { status: "摆节目单", detail: "{name}把音乐厅节目单摆整齐，给晚上的兔兔们留好座位，{handMotion}。" },
    { status: "数座位号", detail: "{name}数了数前排座位号，发现少掉的那张刚好夹在后台门边。" }
  ]
};

const charExtraDialogues = {
  rabbit_1: ["这片叶子会带路。", "我把花样收好啦。", "我真的没走丢。", "贝壳边边好亮。", "灯塔好高呀。", "我想画进图鉴。", "这条路有弯弯。", "音乐厅会开花吗。"],
  rabbit_2: ["慢钟不是我的锅。", "门铃我会修一点。", "给我劳，是表啦。", "薄荷叶歪得帅。", "晓雪别看我呀。", "我先去解释。", "公告肯定懂我。", "这齿轮很乔老爷。"],
  rabbit_3: ["这消息值一杯。", "节目单别沾奶泡。", "新品叫海湾月光。", "咖啡章盖这里。", "乔治又上新闻。", "甜点留到晚上。", "这张纸条有趣。", "情报先冷萃。"],
  rabbit_4: ["这颜色很适合。", "乔治，慢慢说。", "发带要配海风。", "节目单折整齐。", "Cette couleur est douce.", "我把花色记下。", "灯光好温柔。", "先别弄乱啦。"],
  rabbit_5: ["这就是第二章。", "迷宫纹样会发光。", "我要把钟画歪。", "海湾适合压暗。", "请别端加餐。", "这光线很忧郁。", "灯塔像城堡。", "演出要有雪。"],
  rabbit_6: ["我来检查门铃。", "这份给杰拉德。", "误会先放一放。", "大葱也能庆祝。", "毛衣确实有点热。", "灯塔需要稳一点。", "我把礼物包好。", "乔治是在说表。"],
  rabbit_7: ["这张光很好。", "我拍到公告了。", "先调一下曝光。", "海湾适合长镜头。", "耳朵别卷太快。", "我在听开场曲。", "这张留给晓雪。", "证据很安静。"]
};

const locationDialogues = {
  tree_house: ["晚上记得回家。", "背包已经好了。"],
  carrot_square: ["公告牌更新了。", "广场消息好多。"],
  mushroom_cafe: ["咖啡香到路口。", "杯垫背面有字。"],
  timothy_farm: ["田埂有小脚印。", "农具箱夹着纸。"],
  gear_workshop: ["钟慢了两拍。", "齿轮会唱歌吗。"],
  acorn_library: ["借阅卡翻过来。", "旧地图接上了。"],
  botanical_garden: ["薄荷歪着长。", "花样本要收好。"],
  rainbow_lake: ["倒影反过来了。", "贝壳会反光。"],
  carrot_maze: ["转角要做记号。", "纹样贴着墙走。"],
  rabbit_mountain: ["云影过山啦。", "山路风好清楚。"],
  weather_station: ["风向指音乐厅。", "雨量杯很乖。"],
  observatory: ["星象纸条画好了。", "望远镜对准啦。"],
  shell_bay: ["潮声往灯塔去。", "贝壳边缘亮。"],
  lighthouse: ["门铃声音好远。", "灯罩擦亮啦。"],
  chanson_hall: ["开场曲好轻。", "节目单排好啦。"]
};

function template(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function charLength(text) {
  return [...text].length;
}

function hasLatinText(text) {
  return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(text);
}

function dialogueMaxChars(text) {
  return hasLatinText(text) ? 60 : 20;
}

function assertEvent(event) {
  if (!["move", "action", "dialogue"].includes(event.type)) {
    throw new Error(`Bad event type: ${event.type}`);
  }
  if (event.end_tick <= event.start_tick || event.start_tick < 0 || event.end_tick > MAX_TICK) {
    throw new Error(`Bad event ticks: ${JSON.stringify(event)}`);
  }
  if (charLength(event.status) > 12) {
    throw new Error(`Status too long: ${event.status}`);
  }
  if (event.type === "dialogue" && event.end_tick - event.start_tick > 2) {
    throw new Error(`Dialogue too long: ${JSON.stringify(event)}`);
  }
  if (event.type === "dialogue" && charLength(event.text) > dialogueMaxChars(event.text)) {
    throw new Error(`Dialogue text too long: ${event.text}`);
  }
}

function expandStatus(event) {
  const status = event.status;
  if (charLength(status) >= 8) return status;
  if (event.type === "move") return `慢慢${status}`;
  if (/睡觉|补个觉/.test(status)) return `安静${status}`;
  if (/醒来|出门/.test(status)) return `慢慢${status}`;

  const hash = hashString(`${runDate}:${event.char}:${event.start_tick}:${status}`);

  const existingPrefixes = ["认真", "轻轻", "慢慢", "仔细", "继续", "重新", "安静"];
  if (existingPrefixes.some(prefix => status.startsWith(prefix))) {
    return hash % 6 === 0 && charLength(`正在${status}`) <= 12 ? `正在${status}` : status;
  }

  const prefixes = ["", "认真", "轻轻", "慢慢", "仔细", "继续", "正在"];
  const prefix = prefixes[hash % prefixes.length];
  const nextStatus = `${prefix}${status}`;
  return charLength(nextStatus) <= 12 ? nextStatus : status;
}

function push(event) {
  event.status = expandStatus(event);
  assertEvent(event);
  timeline.push(event);
}

function travelDuration(from, to) {
  const duration = durationByPair.get(`${from}|${to}`);
  if (!duration) throw new Error(`Missing travel duration: ${from} -> ${to}`);
  return duration;
}

function decorate(text, char, def, index, extra = {}) {
  const football = worldCupProfiles[char];
  return template(text, {
    name: def.name,
    weatherMood: dailyContext.weather.mood,
    weatherNote: dailyContext.weather.note,
    dailyProp: dailyContext.prop,
    dailyRumor: extra.dailyRumor || pickFor(`rumor:${char}:${index}:${text}:${extra.phaseLabel || ""}:${extra.place || ""}`, dailyRumors),
    tinyMess: pickFor(`tiny-mess:${char}:${index}:${text}:${extra.phaseLabel || ""}`, tinyMesses),
    handMotion: pickFor(`hand-motion:${char}:${index}:${text}:${extra.phaseLabel || ""}`, handMotions),
    smallWeather: pickFor(`small-weather:${char}:${index}:${text}:${extra.phaseLabel || ""}`, smallWeatherDetails),
    objectCloseup: pickFor(`object-closeup:${char}:${index}:${text}:${extra.phaseLabel || ""}`, objectCloseups),
    bodilyBeat: pickFor(`body-beat:${char}:${index}:${text}:${extra.phaseLabel || ""}`, bodilyBeats),
    team: football.team,
    footballUpdate: worldCupText(char),
    footballReaction: football.reaction,
    fixtureList: fixtureListForRunDate(),
    birthdayNote: birthdayNote(def),
    phaseLabel: extra.phaseLabel || "",
    phaseDetail: extra.phaseDetail || "",
    ...extra
  });
}

function phaseForTick(tick) {
  if (tick < 4320) return "morning";
  if (tick < 5400) return "noon";
  if (tick < 6480) return "afternoon";
  return "night";
}

function phaseContext(tick, seed) {
  const phase = phaseForTick(tick);
  const beat = phaseBeats[phase];
  return {
    phase,
    phaseLabel: beat.label,
    phaseDetail: pickFor(`${seed}:phase-detail:${phase}`, beat.details)
  };
}

const actionUseCount = new Map();
const groundedTails = [
  "旁边的小杯子轻轻碰了一下桌沿。",
  "纸角被风掀起，又被轻轻按了回去。",
  "路牌上的灰被顺手擦掉一点。",
  "远处传来很短的一声门铃。",
  "脚边有片叶子翻了个面。",
  "节目单边缘沾了一点咖啡香。",
  "贝壳在口袋里轻轻磕了一下。",
  "慢钟又晚了一拍，大家都假装没听见。",
  "铅笔头被转了半圈，才继续写下去。",
  "发带尾巴被重新抚平。",
  "旁边谁也没说话，只把那行字又看了一遍。",
  "小纸片在桌面上滑了半寸才停下。",
  "影子压过脚边，又慢慢退回去。",
  "这件事很小，却被认真记到了页角。",
  "空气里留着一点刚刚发生过的声音。"
];

const groundedTailOpeners = [
  "{smallWeather}",
  "{objectCloseup}",
  "{bodilyBeat}",
  "旁边的{dailyProp}被重新放正。",
  "{phaseDetail}",
  "没有谁急着解释，{bodilyBeat}。",
  "这不是大事，只是{objectCloseup}。",
  "一小阵{weatherMood}从路口过来，{smallWeather}。"
];

const groundedTailsByChar = {
  rabbit_1: [
    "她马上在图鉴边角补了一个小箭头。",
    "蜂蜜罐在包里轻轻晃了一下。",
    "她把花瓣夹进树叶书签里。",
    "她给这条路线画了一朵只有自己看得懂的小花。"
  ],
  rabbit_2: [
    "他把蓝帽子扶正，假装刚才很稳。",
    "他又小声练了一遍手表解释。",
    "他顺手摸了摸口袋里的薄荷叶。",
    "他对着反光处确认了一下蓝帽子还很有派头。"
  ],
  rabbit_3: [
    "他把杯垫翻面，记下一行小字。",
    "咖啡勺在杯沿轻轻响了一下。",
    "他把账单角压进报纸里。",
    "他在杯垫旁边留了一个只有熟客懂的小记号。"
  ],
  rabbit_4: [
    "她把发带尾巴重新抚平。",
    "她低声念了一句法语，又忍住笑。",
    "裙摆被她整理成很乖的一折。",
    "她把颜色相近的两张纸悄悄放到一起。"
  ],
  rabbit_5: [
    "他在画纸边缘加了一小块阴影。",
    "他把围巾画得更长了一点。",
    "他悄悄把加餐盘子推远半寸。",
    "他把空白处留给下一段还没发生的故事。"
  ],
  rabbit_6: [
    "他把餐盒扣紧，又检查了一遍。",
    "毛衣袖口被他认真卷起一点。",
    "他把误会和事实在心里重新分开放好。",
    "他确认餐盒没有响，才继续往下想。"
  ],
  rabbit_7: [
    "他把快门声调得更轻。",
    "相机带子在他耳边轻轻晃。",
    "他的耳朵卷了一下，又慢慢放回去。",
    "他拍完没有立刻看照片，只先记住光从哪边来。"
  ]
};

function groundedTail(seed, char) {
  const pool = [...(groundedTailsByChar[char] || []), ...groundedTails, ...pauseTails];
  return pickFor(seed, pool);
}

function sentenceEnd(text) {
  return /[。！？.!?]$/.test(text) ? text : `${text}。`;
}

function routeTail(seed) {
  return pickFor(seed, routeTails);
}

function locationAction(char, def, location, tick, index, i) {
  const phase = phaseContext(tick, `${char}:${i}:${location}`);
  const allOptions = locationActivities[location] || [];
  const isWorldCupOption = option => ["布置看球桌", "讨论世界杯", "准备看球点心"].includes(option.status);
  const options = location === "mushroom_cafe"
    ? allOptions.filter(option => !isWorldCupOption(option))
    : allOptions;
  const useLocation = options.length && intFor(`${char}:use-loc-action:${location}:${i}`, 100) < 72;
  if (!useLocation) return null;
  const start = intFor(`${char}:loc-action:${location}:${i}`, options.length);
  const decorated = options.map((option, optionIndex) => {
    const tailIntro = sentenceEnd(decorate(
      pickFor(`${char}:tail-opener:${location}:${i}:${optionIndex}`, groundedTailOpeners),
      char,
      def,
      index,
      phase
    ));
    return {
      status: option.status,
      detail: `${decorate(option.detail, char, def, index, phase)}${tailIntro}${groundedTail(`${char}:grounded-tail:${location}:${i}:${optionIndex}`, char)}`,
      index: (optionIndex - start + options.length) % options.length
    };
  });
  decorated.sort((a, b) => (actionUseCount.get(a.detail) || 0) - (actionUseCount.get(b.detail) || 0) || a.index - b.index);
  const selected = decorated[0];
  actionUseCount.set(selected.detail, (actionUseCount.get(selected.detail) || 0) + 1);
  return selected;
}

const dialogueUseCount = new Map();

function dialogueFor(char, def, location, tick, i, offset) {
  const phase = phaseForTick(tick);
  const phaseInfo = phaseContext(tick, `${char}:dialogue-phase:${location}:${i}:${offset}`);
  const rawPool = [
    ...def.dialogues,
    ...(charExtraDialogues[char] || []),
    ...(characterWhispers[char] || []),
    ...(worldCupProfiles[char]?.dialogues || []),
    ...summerGroupDialogues,
    ...halfSpokenDialogues,
    ...sensoryDialogues,
    ...(locationWhispers[location] || []),
    ...(locationDialogues[location] || []),
    ...(phaseBeats[phase]?.dialogues || []),
    "{placeShort}那边有动静。",
    "{phaseLabel}这会儿刚好。",
    "{placeShort}先放{dailyProp}。",
    "{weatherMood}适合{placeShort}。",
    "我记下{placeShort}。",
    "等下再去{placeShort}。",
    "{dailyProp}别弄丢。",
    "{placeShort}的纸角还在。",
    "先听门铃。",
    "这条线接上了。",
    ...shortReplies
  ];
  const pool = rawPool
    .map(line => decorate(line, char, def, 0, {
      ...phaseInfo,
      placeShort: locations[location]?.short || "这里"
    }))
    .filter(line => charLength(line) <= dialogueMaxChars(line));
  const start = intFor(`${char}:dialogue:${location}:${tick}:${i}:${offset}`, pool.length);
  const ordered = pool.map((line, index) => ({ line, index: (index - start + pool.length) % pool.length }));
  ordered.sort((a, b) => (dialogueUseCount.get(a.line) || 0) - (dialogueUseCount.get(b.line) || 0) || a.index - b.index);
  const line = ordered[0].line;
  dialogueUseCount.set(line, (dialogueUseCount.get(line) || 0) + 1);
  return line;
}

function nextDestination(route, current, index) {
  for (let offset = 0; offset < route.length; offset += 1) {
    const candidate = route[(index + offset) % route.length];
    if (candidate !== current) return candidate;
  }
  throw new Error(`Route cannot leave ${current}`);
}

function addAction(char, start, duration, mood, status, detail, location) {
  push({
    start_tick: start,
    end_tick: start + duration,
    char,
    type: "action",
    mood,
    status,
    detail,
    location
  });
  return start + duration;
}

function addDialogue(char, start, mood, status, text, location) {
  push({
    start_tick: start,
    end_tick: start + 2,
    char,
    type: "dialogue",
    mood,
    status,
    text,
    location
  });
  return start + 2;
}

function addMove(char, start, from, to, mood, detail) {
  const duration = travelDuration(from, to);
  const travelDetail = `${detail}${routeTail(`${char}:route-tail:${from}:${to}:${start}`)}`;
  push({
    start_tick: start,
    end_tick: start + duration,
    char,
    type: "move",
    from,
    to,
    mood,
    status: `沿路前往${locations[to].short}`,
    detail: travelDetail
  });
  return start + duration;
}

function generateCharacterDay(char, def, index) {
  let current = "tree_house";
  let tick = 0;
  const dailyMood = moodFor(char, def.mood);
  let routeIndex = index + intFor(`${char}:route-offset`, def.route.length);
  let dialogueCount = 0;
  let moveCount = 0;
  const birthdayText = birthdayNote(def);
  const dialogueOffset = intFor(`${char}:dialogue-offset`, def.dialogues.length);
  const actionOffset = intFor(`${char}:action-offset`, def.actionStatuses.length);
  const moveOffset = intFor(`${char}:move-offset`, moveDetailsByChar[char].length);
  const tailOffset = intFor(`${char}:tail-offset`, actionTailsByChar[char].length);
  const birthdaySlot = intFor(`${char}:birthday-slot`, 12);
  const scheduledMatch = scheduledMatchFor(char);
  const cafeTravelTicks = travelDuration("tree_house", "mushroom_cafe");
  const scheduledWakeTick = scheduledMatch
    ? Math.max(0, scheduledMatch.kickoffTick - cafeTravelTicks - 10)
    : null;
  const earlyPlan = scheduledMatch && scheduledMatch.kickoffTick > 0
    ? { wakeTick: scheduledWakeTick, match: scheduledMatch }
    : dailyEarlyRisers.get(char);
  let regularWakeTick = regularWakeTickFor(char, def, index);
  if (scheduledMatch && scheduledMatch.kickoffTick > 0) {
    regularWakeTick = Math.max(
      regularWakeTick,
      scheduledMatch.kickoffTick + MATCH_WATCH_TICKS + cafeTravelTicks + 130
    );
  }
  const sleepReturnTick = bedtimeReturnTickFor(char, index);

  const sleepEnd = earlyPlan?.wakeTick || regularWakeTick;
  tick = addAction(char, 0, sleepEnd, "困倦", "树屋里睡觉中", decorate(`${def.name}在树屋里睡觉，梦里有{dailyProp}和今天要用的小线索。`, char, def, index), "tree_house");

  if (earlyPlan && regularWakeTick > tick) {
    tick = addDialogue(char, tick + 4, dailyMood, "揉揉眼睛醒来", dialogueFor(char, def, current, tick + 4, -3, dialogueOffset), current);
    dialogueCount += 1;
    const firstTarget = earlyPlan.match ? "mushroom_cafe" : nextDestination(def.route, current, routeIndex);
    if (!earlyPlan.match) routeIndex += 1;
    const earlyMoveDetail = earlyPlan.match
      ? `${def.name}按上海时间闹钟起床，赶去蘑菇咖啡馆看${earlyPlan.match.home}对${earlyPlan.match.away}。`
      : decorate(`${def.name}趁天还没亮，沿道路去${locations[firstTarget].name}收集第一段线索。{phaseDetail}`, char, def, index, phaseContext(tick + 4, `${char}:early`));
    tick = addMove(char, tick + 4, current, firstTarget, dailyMood, earlyMoveDetail);
    moveCount += 1;
    current = firstTarget;
    const earlyLocationAction = earlyPlan.match ? null : locationAction(char, def, current, tick, index, -2);
    const earlyStatus = earlyPlan.match ? `直播看${worldCupProfiles[char].team}` : (earlyLocationAction?.status || def.actionStatuses[actionOffset % def.actionStatuses.length]);
    const earlyDetail = earlyPlan.match
      ? `${def.name}从上海时间${earlyPlan.match.kickoff}开始直播观看${earlyPlan.match.home}对${earlyPlan.match.away}，咖啡馆投影和官方开球时间完全同步。${worldCupProfiles[char].liveReaction || worldCupProfiles[char].reaction}`
      : (earlyLocationAction?.detail || decorate(def.actionDetails[actionOffset % def.actionDetails.length], char, def, index, phaseContext(tick, `${char}:early-action`)));
    tick = addAction(char, tick, earlyPlan.match ? MATCH_WATCH_TICKS : 28, dailyMood, earlyStatus, earlyDetail, current);
    const earlyDialogue = earlyPlan.match
      ? `${worldCupProfiles[char].team}这场${earlyPlan.match.kickoff}开球。`
      : dialogueFor(char, def, current, tick + 4, -2, dialogueOffset + 1);
    tick = addDialogue(char, tick + 4, dailyMood, earlyStatus, earlyDialogue, current);
    dialogueCount += 1;
    const backDuration = travelDuration(current, "tree_house");
    const returnDetail = earlyPlan.match
      ? `${def.name}看完开球后的主要比赛时段，把比分记录交给小泽咖啡馆后沿道路回树屋补觉。`
      : decorate(`${def.name}把清晨记录和{dailyProp}收好，沿原路回树屋休息到正式开园。`, char, def, index);
    const earlyReturnStart = earlyPlan.match
      ? tick + 8
      : Math.max(tick + 8, regularWakeTick - backDuration - 120);
    tick = addMove(char, earlyReturnStart, current, "tree_house", "安静", returnDetail);
    moveCount += 1;
    current = "tree_house";
    tick = addAction(char, tick, regularWakeTick - tick, "困倦", "树屋里补个觉", decorate(`${def.name}回到树屋短短打了个盹，把{weatherMood}的早晨藏进心里。`, char, def, index), current);
  }

  tick = Math.max(tick, regularWakeTick);
  tick = addDialogue(char, tick + 4, dailyMood, "准备出门巡游", birthdayText && daysUntilBirthday(runDate, def.birthday) === 0 ? "今天我生日呀。" : dialogueFor(char, def, current, tick + 4, -1, dialogueOffset + 2), current);
  dialogueCount += 1;

  const regularMovesNeeded = 43 - moveCount;
  const dialogueExtrasNeeded = def.dialogueTarget - dialogueCount - regularMovesNeeded;
  const loopStart = tick + 8;
  const available = sleepReturnTick - loopStart - 80;
  const interval = Math.floor(available / regularMovesNeeded);
  if (interval < 40) throw new Error(`Schedule too tight for ${char}`);

  for (let i = 0; i < regularMovesNeeded; i += 1) {
    const plannedStart = Math.max(tick + 4, loopStart + i * interval + intFor(`${char}:jitter:${i}`, 5) * 3);
    const target = nextDestination(def.route, current, routeIndex);
    routeIndex += 1;
    tick = addMove(
      char,
      plannedStart,
      current,
      target,
      dailyMood,
      decorate(moveDetailsByChar[char][(i + moveOffset) % moveDetailsByChar[char].length], char, def, index, {
        place: locations[target].name,
        short: locations[target].short,
        ...phaseContext(plannedStart, `${char}:move:${i}`)
      })
    );
    moveCount += 1;
    current = target;

    const isBirthdayBeat = birthdayText && i === birthdaySlot;
    const locAction = locationAction(char, def, current, tick, index, i);
    const actionStatus = isBirthdayBeat ? (daysUntilBirthday(runDate, def.birthday) === 0 ? "生日小派对" : "准备小惊喜") : (locAction?.status || def.actionStatuses[(i + actionOffset) % def.actionStatuses.length]);
    const baseDetail = locAction?.detail || decorate(`${def.actionDetails[(i + actionOffset) % def.actionDetails.length]}${actionTailsByChar[char][(i + tailOffset) % actionTailsByChar[char].length]}`, char, def, index, phaseContext(tick, `${char}:action:${i}`));
    const actionDetail = `${baseDetail}${isBirthdayBeat ? birthdayText : ""}`;
    tick = addAction(char, tick, 8 + (i % 4), dailyMood, actionStatus, actionDetail, current);

    const line = dialogueFor(char, def, current, tick + 2, i, dialogueOffset);
    tick = addDialogue(char, tick + 2, dailyMood, actionStatus, line, current);
    dialogueCount += 1;

    if (i < dialogueExtrasNeeded) {
      const extraLine = dialogueFor(char, def, current, tick + 2, i, dialogueOffset + 3);
      tick = addDialogue(char, tick + 2, dailyMood, def.actionStatuses[(i + actionOffset + 1) % def.actionStatuses.length], extraLine, current);
      dialogueCount += 1;
    }
  }

  if (current === "tree_house") {
    const target = nextDestination(def.route, current, routeIndex);
    const start = Math.min(tick + 8, sleepReturnTick - travelDuration(target, "tree_house") - travelDuration(current, target) - 2);
    tick = addMove(char, start, current, target, dailyMood, decorate(`${def.name}在睡前又去${locations[target].name}确认最后一个细节，顺手带上{dailyProp}。`, char, def, index));
    moveCount += 1;
    current = target;
  }

  const finalReturnStart = Math.min(sleepReturnTick, MAX_TICK - travelDuration(current, "tree_house") - 1);
  const finalSleepClock = formatTickClock(finalReturnStart);
  tick = addMove(char, finalReturnStart, current, "tree_house", "困倦", decorate(`${def.name}差不多${finalSleepClock}才进入回家睡觉阶段，带着{weatherMood}的一天沿道路回到巨树树屋区。`, char, def, index));
  moveCount += 1;
  current = "tree_house";
  tick = addAction(char, tick, MAX_TICK - tick, "困倦", "树屋里睡觉中", decorate(`${def.name}回到树屋，把{dailyRumor}和今天的故事都收进梦里。`, char, def, index), current);

  if (moveCount !== 44) {
    throw new Error(`${char} move count ${moveCount}, expected 44`);
  }
  if (dialogueCount !== def.dialogueTarget) {
    throw new Error(`${char} dialogue count ${dialogueCount}, expected ${def.dialogueTarget}`);
  }
}

Object.entries(characterDefs).forEach(([char, def], index) => generateCharacterDay(char, def, index));

timeline.sort((a, b) => a.start_tick - b.start_tick || a.end_tick - b.end_tick || a.char.localeCompare(b.char));

for (const char of Object.keys(characterDefs)) {
  const events = timeline.filter(event => event.char === char).sort((a, b) => a.start_tick - b.start_tick || a.end_tick - b.end_tick);
  for (let i = 1; i < events.length; i += 1) {
    if (events[i - 1].end_tick > events[i].start_tick) {
      throw new Error(`Overlapping events for ${char}: ${JSON.stringify(events[i - 1])} / ${JSON.stringify(events[i])}`);
    }
  }
}

const data = {
  date: runDate,
  config: {
    tick_interval_seconds: 10,
    max_tick: MAX_TICK,
    map_regions: Object.fromEntries(Object.entries(locations).map(([id, location]) => [
      id,
      { name: location.name, kind: location.kind, x: location.x, y: location.y }
    ]))
  },
  characters: Object.fromEntries(Object.entries(characterDefs).map(([id, def]) => [
    id,
    {
      name: def.name,
      color: def.color,
      scale: def.scale,
      init_region: "tree_house",
      mood: "困倦",
      status: "树屋里睡觉中"
    }
  ])),
  timeline
};

fs.writeFileSync(path.join(root, "data.json"), `${JSON.stringify(data, null, 2)}\n`);

const indexPath = path.join(root, "index.html");
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf8");
  const nextIndexHtml = indexHtml.replace(
    /const DATA_VERSION = "\d{4}-\d{2}-\d{2}";/,
    `const DATA_VERSION = "${runDate}";`
  );
  if (nextIndexHtml !== indexHtml) {
    fs.writeFileSync(indexPath, nextIndexHtml);
  }
}

const memoryNotes = {
  rabbit_1: [
    "记得白天穿蜜蜂服采蜜，晚上整理树叶鲜花图鉴。",
    "记得植物园、蘑菇咖啡馆和海湾经常串成自己的探险路线。",
    "记得把星象纸条、借阅卡铅笔字和灯塔小册子都当作图鉴素材。",
    "记得贝壳边缘很亮，海湾潮声会一下一下推向灯塔方向。",
    "记得给杰拉德留稀有花，也会把花样本交给晓雪做发带。",
    "记得自己不是迷路，而是在发现新路线。",
    "记得音乐厅开场曲、慢钟和旧地图都可能藏着新花线索。",
    "记得清晨如果被选中巡游，要把错过的路牌、节目单和小贝壳补进图鉴。",
    "记得胡萝卜广场的小萝卜箭头有时会被转半圈，不能只看第一眼。",
    "记得彩虹湖倒影会把迷宫纹样反过来，要把水面和纸面都画一遍。",
    "记得灯塔台阶缝、树屋拖鞋底和咖啡馆糖罐都可能藏纸条。",
    "记得自己生日在3月28日，春天的花样最适合当图鉴封面。",
    "记得新的睡觉时间每天会有一点偏差，回家前要听当天提醒。",
    "记得自己在清晨去过香颂音乐厅，节目单边角的贝壳光适合贴进图鉴。",
    "记得薄荷糖纸可以压在公告牌下，节目单咖啡章和糖罐倒影会把路线接起来。",
    "记得索引页里薄荷糖纸旁边的编号会指向下一站，图书馆动静要先画下来。",
    "记得海湾沙粒排成弯弯路线时，先停下来听半拍，再决定是不是迷路。",
    "记得薄雾里的薄荷水珠和糖罐路线都不一定是线索，但可以先收好。",
    "记得初夏荷花开时支持巴西；3比0战胜苏格兰并锁定小组第一后，要给淘汰赛留空白花页。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_2: [
    "记得自己喜欢晓雪，也记得“给我劳”会让劳伦斯误会。",
    "记得植物园薄荷是自己的巡逻重点，歪成帽檐的薄荷叶尤其要看好。",
    "记得齿轮工坊慢钟、灯塔门铃和路牌都能变成乔老爷的新任务。",
    "记得小泽会把自己吃瘪的表情拉进奶泡，也会收走薄荷做新品。",
    "记得晓雪的法语和浓缩咖啡能让自己先冷静解释。",
    "记得公告牌不一定懂自己，但公告线索总能把大家聚到广场。",
    "记得修门铃时要先说明自己说的是手表，不是叫劳伦斯。",
    "记得薄荷叶、慢钟、小螺丝和门铃声都可能把自己卷进新误会。",
    "记得劳伦斯听见“给我劳”会先沉默，所以解释要比玩笑更快。",
    "记得晓雪让自己慢慢说时，先喝咖啡比继续喊更有用。",
    "记得小泽会把自己上新闻的瞬间收进咖啡馆闲谈和奶泡。",
    "记得自己的生日是11月3日，帽檐和薄荷色很适合当天布置。",
    "记得每天起床和回家时间会有一点浮动，别把钟修得太死。",
    "记得自己在工坊捡到过卡住慢钟第三声的小螺丝，解释手表梗前要先看钟。",
    "记得薄荷田水珠、植物牌背面小字和音乐厅座位号都能帮乔老爷找回派头。",
    "记得有些清晨自己也会被选中短巡，回来补觉前要把手表梗解释清楚。",
    "记得灯塔小册、门铃齿轮和广场公告会把手表解释推到大家面前。",
    "记得音乐厅座位号被换顺序时，先扶正蓝帽子，再确认不是新恶作剧。",
    "记得自己支持美国；2比3输给土耳其后仍以小组第一晋级，蓝帽子要扶正但嘴硬一点。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_3: [
    "记得咖啡馆是Bunnyland情报站，新品要请晓雪拍照。",
    "记得用乔治的薄荷做新品，也记得奶泡很适合画乔治吃瘪脸。",
    "记得杯垫、咖啡印章、公告牌和节目单都能传递当天消息。",
    "记得灯塔门铃、借阅卡背面铅笔字和旧地图能接上海湾线索。",
    "记得香颂音乐厅小演出需要提前留甜点和座位。",
    "记得劳伦斯常把甜点打包回北欧，也常听错乔治的口头禅。",
    "记得自己的生日进入远远倒数时，大家会冒出礼物灵感。",
    "记得咖啡馆糖罐、杯垫背面和后门甜点订单都适合藏情报。",
    "记得乔治的薄荷叶和晓雪的新品照片位能让一天热闹起来。",
    "记得音乐厅节目单如果沾到奶泡，也许反而能留下线索。",
    "记得Lino的安静照片可以帮自己把传闻变成证据。",
    "记得自己的生日是7月12日，新品菜单可以提前写一页生日口味。",
    "记得夜里不一定固定23:50收摊，要看当天兔兔们的回家时间。",
    "记得自己的生日远远倒数开始时，咖啡馆情报等级会悄悄升一格。",
    "记得灯塔门铃声滚到海湾时，要把杯垫翻面那行小字收进情报站。",
    "记得胡萝卜广场的小萝卜箭头也能和杯垫小字接上，不只咖啡馆有情报。",
    "记得糖罐底下折过三次的小票值得收进账本，别让奶泡盖住。",
    "记得植物牌背面小方向、贝壳票根和广场纸条可以拼成当天路线。",
    "记得自己支持比利时；0比0战平伊朗后，下一场上海时间6月27日11:00对新西兰。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_4: [
    "记得自己喜欢乔治，也记得用法语和浓缩咖啡治住他。",
    "记得小悠米带来的花样本适合扎染发带和整理色卡。",
    "记得星象纸条、节目单和海湾光线都能变成穿搭灵感。",
    "记得经常请Lino拍发带街拍，也会给他留最温柔的光线。",
    "记得乔治解释“给我劳”时需要慢慢说，自己会先把咖啡端稳。",
    "记得气象站、天文台和兔耳山的云影能帮助配色。",
    "记得音乐厅节目单要折整齐，开场曲适合温柔颜色。",
    "记得Lino拍街拍时会等自己把发带、裙摆和海湾光都整理好。",
    "记得小悠米的花样本、雨后玻璃珠和树影书签都可以进色卡。",
    "记得乔治一急就会把解释说乱，自己可以先递咖啡再让他开口。",
    "记得劳伦斯误会时不需要急着否认，可以把事实慢慢讲清楚。",
    "记得自己的生日是10月9日，薄荷绿和浅色发带适合当天。",
    "记得起床时间每天有小偏差，衣帽间清单要留一点弹性。",
    "记得风向带、发带尾巴和节目单纸角都要按回原处，画面才会温柔。",
    "记得薄荷糖纸、花样本和咖啡章香味都能变成浅色发带的下一套配色。",
    "记得乔治只会点头时不用急，先把花样本和发带盒收稳再说。",
    "记得星光天文台的路线、气象站纸角和乔治呼吸节奏都要慢慢对齐。",
    "记得对乔治说先呼吸以后，再整理路牌、发带和小票背面的细节。",
    "记得自己支持法国；3比0战胜伊拉克后，上海时间6月27日03:00要和劳伦斯一起看法国对挪威。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_5: [
    "记得小悠米是灵感缪斯，也记得劳伦斯总把自己当弟弟投喂。",
    "记得地下胡萝卜迷宫纹样、旧地图和灯塔光线能组成奇幻第二章。",
    "记得彩虹湖倒影会把迷宫纹样反过来，海湾贝壳适合画成舞台边。",
    "记得香颂音乐厅的小演出需要一点雪、一点忧郁和更梦幻的招牌。",
    "记得小悠米带来的花会让图鉴页亮起来。",
    "记得劳伦斯的加餐阴影可以画成山脉，但自己还是想保持气质。",
    "记得慢钟和门铃声都可以被画进冒险地图。",
    "记得咖啡馆招牌、音乐厅座位号和灯塔票根都能变成第二章线索。",
    "记得小悠米发现贝壳光时，画面要亮一点，别只保持忧郁。",
    "记得劳伦斯的关心很重，但餐盒可以被画成可靠补给。",
    "记得彩虹湖倒影、胡萝卜迷宫纹样和兔耳山云影能组成冒险地图。",
    "记得自己的生日是12月7日，冬天灵感和雪色边框可以提前准备。",
    "记得睡前回树屋时间会浮动，收画稿要给最后一站留空白。",
    "记得座位号、碎纸片星座和糖罐倒影都能被画成第二章的入口。",
    "记得杯沿轻响、面包屑星座和远处门铃声可以让迷宫一页多一点真实感。",
    "记得彩虹湖倒影、咖啡香节目单和门铃短声能让忧郁画面不那么空。",
    "记得清晨短巡到音乐厅时，开场曲可以先接上故事，再回树屋补觉。",
    "记得灯塔门铃、反字贝壳和第一排座位号能连成不需要旁白的一页。",
    "记得自己支持荷兰；3比1战胜突尼斯后小组第一晋级，32强要把摩洛哥画进橙色边框。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_6: [
    "记得山东美食很好，也记得乔治的“给我劳”可能只是手表。",
    "记得要照顾杰拉德，但加餐前最好看看他是否正在保持忧郁气质。",
    "记得灯塔门铃、齿轮工坊慢钟和农场路牌都需要稳稳检查。",
    "记得把甜点、备用礼物和给杰拉德的餐盒包稳。",
    "记得胡萝卜广场、提摩西农场和海湾路线要重新确认。",
    "记得晓雪能温柔解释乔治造成的误会。",
    "记得海湾贝壳和音乐厅节目单可以作为圣诞礼物灵感。",
    "记得给杰拉德加餐前先看他的表情，不要把关心端得太满。",
    "记得乔治的手表梗、慢钟和门铃都要分开判断，别又误会。",
    "记得小泽咖啡馆的甜点订单适合打包回北欧，也适合留给大家。",
    "记得农场田埂、小萝卜箭头和灯塔台阶都需要稳稳检查。",
    "记得自己的生日是1月18日，冬天礼物和围巾都可以提前准备。",
    "记得每日回家睡觉时间会有偏差，太晚时要先确认大家都到齐。",
    "记得田埂泥点像省略号，慢钟第三声和门铃声都要分开检查。",
    "记得薄荷糖纸夹在灯塔小册第一页时，应该先确认是谁留下的再打包甜点。",
    "记得香颂音乐厅前三个音会让误会和事实都需要重新分栏。",
    "记得齿轮里映出旧地图线时，要先扣好餐盒，再判断是不是乔治的误会。",
    "记得工坊第三声卡住时，地上的小齿轮要先捡起，误会可以晚一点处理。",
    "记得自己支持挪威；3比2战胜塞内加尔后，上海时间6月27日03:00会和晓雪一起看挪威对法国。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ],
  rabbit_7: [
    "记得帮晓雪拍发带街拍，也记得拍下乔治向劳伦斯解释现场。",
    "记得自己生日刚过不久，祝福还在岛上慢慢回响。",
    "记得星象纸条、公告牌和咖啡馆杯垫都适合拍成安静证据。",
    "记得有些日期会由不同兔兔负责清晨巡游，自己不必每天半夜起床。",
    "记得耳朵卷成心形时要先调好曝光。",
    "记得海湾长镜头和灯塔光线可以留给晚上的故事。",
    "记得狗狗朋友会喜欢晓雪发带街拍和海湾光。",
    "记得自己是男生，撒娇、安静吃瓜和温顺拍照都不改变这点。",
    "记得小泽杯垫、公告牌和咖啡馆后门订单都适合拍成证据链。",
    "记得乔治解释、晓雪递咖啡、劳伦斯沉默这三个瞬间要连拍。",
    "记得小悠米清晨巡游时，自己可以补拍她错过的路牌。",
    "记得自己的生日是6月2日，刚过不久的祝福还可以留在相册里。",
    "记得起床与就寝每天有小偏差，镜头时间戳要跟着当天走。",
    "记得灯塔灯罩、望远镜镜片和发带尾巴都能反光，拍照前要先调曝光。",
    "记得风向带、望远镜镜片和湖面倒影都适合拍成当天线索的安静证据。",
    "记得乔治解释现场、晓雪发带和风向带可以在同一天形成一组照片。",
    "记得面包屑星座和乔治解释现场都适合轻快门，不要把耳朵卷太快。",
    "记得借阅卡铅笔字、山路云影和晓雪发带可以分别用不同焦距记录。",
    "记得自己支持日本；1比1战平瑞典后小组第二晋级，32强对巴西时要先调低曝光。",
    "记得这一天会活动到当天实际回家时间附近，再回树屋睡觉。"
  ]
};

const longMemory = `long_term_memory:
${Object.entries(memoryNotes).map(([id, notes]) => `  ${id}:
${notes.slice(0, MEMORY_LIMIT).map(note => `    - ${note}`).join("\n")}`).join("\n")}
`;

function limitRelationshipYaml(yaml) {
  let currentRabbit = null;
  let count = 0;
  const lines = yaml.trimEnd().split("\n").filter(line => {
    const owner = line.match(/^  (rabbit_\d+):$/);
    if (owner) {
      currentRabbit = owner[1];
      count = 0;
      return true;
    }
    if (currentRabbit && /^      - /.test(line)) {
      count += 1;
      return count <= RELATIONSHIP_LIMIT;
    }
    return true;
  });
  return `${lines.join("\n")}\n`;
}

const relationships = limitRelationshipYaml(`relationships:
  rabbit_1:
    rabbit_3:
      - 小悠米容易飞到小泽咖啡馆的糖罐上。
      - 小悠米会把咖啡馆杯垫和甜点消息当成探险线索。
      - 小悠米找到索引页编号时，小泽会帮她判断是不是咖啡馆线索。
      - 小悠米听到吧台话时，小泽会提醒她把座位表薄荷叶也画进图鉴。
      - 巴西3比0战胜苏格兰后，小泽会给小悠米准备三朵花形点心，并提醒她淘汰赛还要留空白页。
    rabbit_4:
      - 小悠米把采蜜带回来的花给晓雪扎染发带。
      - 小悠米会把花样本交给晓雪做发带色卡。
      - 小悠米收起薄雾水珠和贝壳票根时，晓雪会帮她分成图鉴与发带两份。
    rabbit_5:
      - 小悠米是杰拉德的灵感缪斯。
      - 小悠米找到稀有花、贝壳和地图线索时会想留给杰拉德画。
      - 杰拉德会把小悠米的清晨巡游和花样本画成冒险章节。
      - 小悠米收集到的薄荷糖纸和咖啡章，也会被杰拉德画进迷宫页角。
      - 小悠米听见灯塔门铃时，会把没说完的花线索留给杰拉德补成画面。
    rabbit_7:
      - Lino会把小悠米在海湾、灯塔和植物园发现的小线索拍下来。
      - 小悠米偶尔清晨出门时，Lino会补拍她错过的路牌和节目单。
      - Lino会用安静镜头帮小悠米确认自己不是迷路。
  rabbit_2:
    rabbit_6:
      - 乔治喊“给我劳”会让劳伦斯误以为在叫他。
      - 乔治修门铃和讲手表梗时，需要先向劳伦斯解释清楚。
      - 劳伦斯沉默时，乔治最好先把手表梗说完整。
      - 乔治试门铃前如果先检查齿轮，劳伦斯就会少误会一次。
    rabbit_3:
      - 乔治给小泽咖啡馆友情提供植物园薄荷。
      - 小泽常把乔治吃瘪的表情做成咖啡奶泡。
      - 小泽会把乔治“又上新闻”的小插曲收进咖啡馆闲谈。
      - 小泽生日倒数时，乔治的薄荷和吃瘪脸都会变成新品灵感。
      - 乔治照看薄荷田时，小泽会把那天的天气写进新品备注。
      - 乔治发现座位号顺序不对时，小泽会先把消息压在杯垫下。
    rabbit_4:
      - 乔治喜欢晓雪，也只有晓雪能治住他。
      - 晓雪会用法语和浓缩咖啡让乔治慢慢解释。
      - 晓雪递咖啡时，乔治会短暂收起调皮劲。
      - 乔治清晨短巡回来补觉前，晓雪会提醒他别把解释留到晚上。
      - 乔治把门铃齿轮弄响时，晓雪会先让他呼吸再解释。
      - 乔治支持美国，2比3输给土耳其但小组第一晋级后，晓雪会提醒他嘴硬前先把蓝帽子扶正。
  rabbit_3:
    rabbit_5:
      - 小泽咖啡馆的招牌是杰拉德画的。
      - 小泽会把音乐厅节目单和咖啡馆情报交给杰拉德当画面素材。
      - 小泽听到灯塔门铃线索时，会留一张杯垫给杰拉德画第二章。
      - 小泽收起糖罐小票时，会把能画成阴影的部分留给杰拉德。
    rabbit_7:
      - 小泽知道Lino总能拍到最关键的吃瓜现场。
      - 小泽会把杯垫背面的线索留给Lino拍成证据。
      - Lino拍到的安静证据常被小泽整理成咖啡馆情报。
      - Lino的照片会帮小泽把零散传闻排成可讲的顺序。
      - 小泽翻到杯垫小字时，会提醒Lino补拍灯塔门铃声传来的方向。
      - Lino清晨拍到雨量杯后，小泽会把时间和杯垫消息排在同一页。
      - 小泽会把比利时赛程写在杯垫上，请支持日本的Lino拍夜间看球照片。
      - 比利时0比0战平伊朗后，Lino会提醒小泽下一场新西兰对比利时是上海时间6月27日11:00。
    rabbit_4:
      - 小泽推出新品时总邀请晓雪拍照推广。
      - 小泽会给晓雪预留新品照片位和温柔灯光。
      - 小泽整理植物牌方向时，晓雪会帮他把纸条和色卡分开放好。
  rabbit_4:
    rabbit_7:
      - 晓雪经常请Lino拍发带穿搭街拍照。
      - Lino会帮晓雪记录发带、海湾光和音乐厅节目单。
      - Lino是男生，晓雪习惯把他的温顺镜头当作可靠街拍。
      - 晓雪整理发带尾巴时，Lino会等光线稳定再按快门。
      - 晓雪换浅色发带时，Lino会先看风向带和镜片反光再拍。
    rabbit_6:
      - 晓雪知道劳伦斯误会乔治时需要一点温柔解释。
      - 晓雪尊重劳伦斯照顾大家，也会提醒他别让误会变重。
      - 晓雪晾气象站纸条时，劳伦斯会安静等字迹清楚再判断路线。
      - 法国与挪威上海时间6月27日03:00正面对赛时，晓雪和劳伦斯会共用一张投影桌但各自留队旗。
    rabbit_2:
      - 晓雪会用法语吐槽和浓缩咖啡治住乔治。
      - 乔治调皮时晓雪会先端稳咖啡，再让他解释。
      - 晓雪知道乔治点头不等于解释完，会把话题慢慢拉回来。
  rabbit_5:
    rabbit_1:
      - 杰拉德把小悠米带回的花当作绘画素材。
      - 杰拉德会把小悠米的探险线索画成奇幻章节。
    rabbit_6:
      - 杰拉德被劳伦斯当亲弟弟过度保护和投喂。
      - 杰拉德想保持忧郁气质时，会悄悄躲开劳伦斯加餐。
      - 劳伦斯的餐盒对杰拉德既是补给，也是需要适量的压力。
      - 杰拉德把劳伦斯的加餐阴影画成山脉，也会把餐盒画成补给。
      - 杰拉德听见门铃声时，劳伦斯会先检查是不是又需要帮忙。
      - 杰拉德凌晨短巡后补觉时，劳伦斯会把加餐先扣好不打扰他。
      - 杰拉德支持荷兰、劳伦斯支持挪威，露营看球时会各自带橙色画纸和北欧围巾。
      - 荷兰3比1战胜突尼斯后，劳伦斯会把早餐放远一点，让杰拉德先把摩洛哥写进橙色边框。
    rabbit_3:
      - 杰拉德给小泽咖啡馆设计了招牌。
      - 杰拉德会从小泽咖啡馆听来的情报里找第二章灵感。
  rabbit_6:
    rabbit_2:
      - 劳伦斯时常误会乔治对自己有不一样的感情。
      - 劳伦斯正在学会把乔治的“给我劳”和手表梗分开。
      - 劳伦斯捡起卡住慢钟的小齿轮后，会等乔治把手表梗讲完再下结论。
    rabbit_4:
      - 劳伦斯尊重晓雪对乔治的管教方式。
      - 劳伦斯会听晓雪解释乔治的玩笑和真正意思。
    rabbit_5:
      - 劳伦斯把杰拉德当亲弟弟照顾。
      - 劳伦斯会给杰拉德准备餐盒和礼物，但需要记得适量。
      - 杰拉德保持忧郁气质时，劳伦斯要先问再投喂。
    rabbit_3:
      - 劳伦斯圣诞节会打包小泽咖啡馆甜点回北欧。
      - 小泽会帮劳伦斯预留适合打包的甜点和节目单灵感。
      - 劳伦斯听到借阅卡铅笔字时，会请小泽先确认它是不是咖啡馆传闻。
  rabbit_7:
    rabbit_1:
      - Lino会记录小悠米把花样本、贝壳和灯塔线索收进图鉴的过程。
      - Lino会补拍小悠米错过的索引页编号和公告牌纸角。
    rabbit_4:
      - Lino常帮晓雪拍发带穿搭街拍。
      - Lino会把晓雪的发带、薄荷色和海湾光拍得很温柔。
      - 晓雪知道Lino是温顺男生，会放心请他记录穿搭细节。
      - Lino拍晓雪时会把路牌、云影和发带分成不同焦距，不抢她整理的节奏。
      - 初夏赏荷和观星时，Lino会拍晓雪的法国队发带与湖面荷花倒影。
    rabbit_3:
      - Lino会在小泽咖啡馆安静整理吃瓜照片。
      - Lino会把小泽杯垫、公告牌和节目单拍成安静证据。
      - Lino拍到面包屑星座后，会把照片交给小泽整理成咖啡馆传闻。
      - 日本1比1战平瑞典后，小泽会给Lino留一盏不刺眼的投影灯，方便他准备巴西那页照片。
    rabbit_2:
      - Lino拍到过乔治向劳伦斯解释“给我劳”的现场。
      - Lino常用镜头记录乔治解释、晓雪递咖啡和劳伦斯误会的瞬间。
`);

fs.writeFileSync(path.join(root, "scaffold/memory/long_memory.yaml"), longMemory);
fs.writeFileSync(path.join(root, "scaffold/memory/relationships.yaml"), relationships);

const counts = timeline.reduce((acc, event) => {
  acc[event.type] = (acc[event.type] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ events: timeline.length, counts }, null, 2));
