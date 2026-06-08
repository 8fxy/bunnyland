const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const travelText = fs.readFileSync(path.join(root, "scaffold/world/travel_times.yaml"), "utf8");

const MAX_TICK = 8640;
const RETURN_HOME_TICK = 8580; // 23:50

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
      "世界鲜花还差好多页。"
    ],
    memory: "记得白天穿蜜蜂服采蜜，晚上整理树叶鲜花图鉴。"
  },
  rabbit_2: {
    name: "乔治",
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
      "我真没那个意思啊。"
    ],
    memory: "记得自己喜欢晓雪，也记得“给我劳”会让劳伦斯误会。"
  },
  rabbit_3: {
    name: "小泽",
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
      "今天的奶泡像乔治。",
      "晓雪来拍新品吗？",
      "薄荷是乔治友情赞助。",
      "咖啡馆消息很灵的。",
      "劳伦斯又听错了吗。",
      "甜点给北欧也打包。"
    ],
    memory: "记得咖啡馆是Bunnyland情报站，新品要请晓雪拍照。"
  },
  rabbit_4: {
    name: "晓雪",
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
      "乔治又只会点头了。"
    ],
    memory: "记得自己喜欢乔治，也记得用法语和浓缩咖啡治住他。"
  },
  rabbit_5: {
    name: "杰拉德",
    color: "#cdb4db",
    scale: 0.8,
    mood: "忧郁",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["chanson_hall", "mushroom_cafe", "botanical_garden", "carrot_maze", "rainbow_lake", "acorn_library", "mushroom_cafe", "lighthouse", "shell_bay", "chanson_hall"],
    actionStatuses: ["画奇幻冒险", "润色鲜花图鉴", "设计咖啡招牌", "躲开鲁菜加餐", "保持忧郁气质", "寻找冬天灵感"],
    actionDetails: [
      "杰拉德把大家今天的日常画成奇幻冒险，乔治的手表被画成神秘宝物。",
      "杰拉德帮小悠米润色鲜花图鉴，又偷偷把花瓣画得像冬天的雪。",
      "杰拉德看见劳伦斯端来鲁菜，认真思考艺术家忧郁气质该怎么减肥。"
    ],
    dialogues: [
      "这段日常像史诗。",
      "小悠米是我的缪斯。",
      "我真的吃不下鲁菜了。",
      "冬天才有忧郁光线。",
      "招牌要再梦幻一点。",
      "减肥也要保持气质。"
    ],
    memory: "记得小悠米是灵感缪斯，也记得劳伦斯总把自己当弟弟投喂。"
  },
  rabbit_6: {
    name: "劳伦斯",
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
      "我可能误会了吗。"
    ],
    memory: "记得山东美食很好，也记得乔治的“给我劳”可能只是手表。"
  },
  rabbit_7: {
    name: "Lino",
    color: "#9b7653",
    scale: 1,
    mood: "温顺",
    wakeTick: 300,
    restUntil: 2880,
    dialogueTarget: 52,
    route: ["observatory", "weather_station", "botanical_garden", "mushroom_cafe", "carrot_square", "rainbow_lake", "chanson_hall", "mushroom_cafe", "rabbit_mountain", "lighthouse", "botanical_garden"],
    actionStatuses: ["拍发带街拍", "记录解释现场", "轻轻撒个娇", "耳朵卷心形", "安静调镜头", "整理吃瓜照片"],
    actionDetails: [
      "Lino安静地帮晓雪拍发带穿搭，镜头把薄荷绿色和小裙子都收得很温柔。",
      "Lino看起来像背景板，却精准拍下了乔治向劳伦斯解释的现场。",
      "Lino撒娇时耳朵卷成两个心形，连快门声都变得软软的。"
    ],
    dialogues: [
      "晓雪，这张很好看。",
      "我拍到解释现场了。",
      "耳朵不要自己卷呀。",
      "狗狗也会喜欢这张。",
      "我只是安静吃瓜。",
      "再让我撒娇一下。"
    ],
    memory: "记得帮晓雪拍发带街拍，也记得拍下乔治向劳伦斯解释现场。"
  }
};

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

const moveDetailsByChar = {
  rabbit_1: [
    "{name}穿着蜜蜂服飞向{place}，一路寻找没见过的花。",
    "{name}抱着蜂蜜罐去{place}，差点把路牌当成新花种。",
    "{name}把树叶图鉴夹好，勇敢地往{place}继续探险。",
    "{name}飞过路口时绕了一圈，确认这不是迷路而是探索。",
    "{name}带着一朵稀有小花去{place}，准备晚点给杰拉德看。"
  ],
  rabbit_2: [
    "{name}戴着蓝帽子去{place}，嘴里还念着新看的手表型号。",
    "{name}去{place}前喊了一声给我劳，然后立刻四处解释。",
    "{name}沿路给植物园的薄荷浇水，顺手想了三个鬼点子。",
    "{name}看见晓雪的方向就放慢脚步，蓝色背带裤晃了一下。",
    "{name}朝{place}跑去，像乔老爷准备宣布一件大事。"
  ],
  rabbit_3: [
    "{name}端着咖啡去{place}，奶泡上还留着乔治吃瘪的表情。",
    "{name}带着新甜点去{place}，顺便收集今天的第一条情报。",
    "{name}路过植物园时拿到薄荷，心里已经想好新品名字。",
    "{name}把报纸夹在手边，优雅地往{place}继续移动。",
    "{name}去{place}前打包了几块甜点，准备留给劳伦斯过节。"
  ],
  rabbit_4: [
    "{name}戴着新发带去{place}，薄荷绿色耳朵安静垂着。",
    "{name}带着小悠米采来的花去{place}，准备继续试染发带。",
    "{name}听见乔治远远喊话，已经把浓缩咖啡端稳。",
    "{name}往{place}走得很乖，法语吐槽却已经在心里排队。",
    "{name}整理好小裙子，准备去{place}让Lino再拍一张。"
  ],
  rabbit_5: [
    "{name}抱着画本去{place}，把普通路口想成奇幻城门。",
    "{name}带着小悠米的花稿去{place}，准备给图鉴润色。",
    "{name}一边往{place}走，一边思考忧郁艺术家能不能少吃鲁菜。",
    "{name}把今天的路线画成冒险地图，兴致很高又很忧郁。",
    "{name}去{place}前看了看冬天色卡，决定给故事加一点雪。"
  ],
  rabbit_6: [
    "{name}穿着厚毛衣往{place}走，山东夏天让耳朵慢慢耷拉。",
    "{name}去{place}前买了煎饼果子，还认真研究大葱蘸酱比例。",
    "{name}听见乔治的声音后沉默了一下，才继续往{place}走。",
    "{name}把给杰拉德的加餐收好，步子沉稳地去{place}。",
    "{name}路过咖啡馆时预订甜点，想着圣诞节要带回北欧。"
  ],
  rabbit_7: [
    "{name}背着相机去{place}，像背景板一样安静又可靠。",
    "{name}去{place}前检查了晓雪的街拍，耳朵差点卷成心形。",
    "{name}一路寻找乔治解释现场的角度，吃瓜吃得很温顺。",
    "{name}把镜头抱好，轻轻往{place}走，像怕惊动照片。",
    "{name}想起狗狗朋友会喜欢这张照片，脚步也软了一点。"
  ]
};

const actionTailsByChar = {
  rabbit_1: [
    "她在旁边标注：可能是世界上第很多很多号花。",
    "蜂蜜罐晃了一下，但她勇敢地稳住了。",
    "她决定晚上把这页讲给杰拉德听。",
    "她觉得这次迷路也很有旅行家的气质。"
  ],
  rabbit_2: [
    "他又小声补了一句：真的只是手表。",
    "他看见晓雪以后，调皮劲立刻少了一半。",
    "植物园的薄荷被他照顾得很神气。",
    "远处的劳伦斯听见后，表情又复杂了一点。"
  ],
  rabbit_3: [
    "咖啡香绕过桌角，带回两条新八卦。",
    "他把报纸翻过一页，假装什么都没听见。",
    "新品照片位已经给晓雪留好。",
    "奶泡里的乔治表情越来越像本人。"
  ],
  rabbit_4: [
    "她把发带轻轻抚平，甜得很安静。",
    "那句法语吐槽优雅得像一条丝带。",
    "乔治虽然听不懂，但已经乖乖点头。",
    "她把小悠米带来的花色记进衣帽间标签。"
  ],
  rabbit_5: [
    "画面里每只兔兔都像要踏上冒险。",
    "他决定把自己画瘦一点，但不失忧郁。",
    "劳伦斯的加餐阴影暂时被他画成山脉。",
    "小悠米带来的花让整页都亮起来。"
  ],
  rabbit_6: [
    "他认真考虑要不要把毛衣换薄一点。",
    "他把大葱蘸酱的味道记成山东生活重点。",
    "他想着杰拉德太瘦，决定晚点再端一盘菜。",
    "他又问了一遍：乔治真的不是在叫我吗。"
  ],
  rabbit_7: [
    "照片里刚好有一只正在解释的乔治。",
    "他安静得像没在吃瓜，但快门声很诚实。",
    "耳朵卷成心形时，他自己也有点不好意思。",
    "他给晓雪留了一张最温柔的底片。"
  ]
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

  const seed = `${event.char}:${event.start_tick}:${status}`;
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;

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
  push({
    start_tick: start,
    end_tick: start + duration,
    char,
    type: "move",
    from,
    to,
    mood,
    status: `沿路前往${locations[to].short}`,
    detail
  });
  return start + duration;
}

function generateCharacterDay(char, def, index) {
  let current = "tree_house";
  let tick = 0;
  let routeIndex = index;
  let dialogueCount = 0;
  let moveCount = 0;

  const sleepEnd = def.wakeTick;
  tick = addAction(char, 0, sleepEnd, "困倦", "树屋里睡觉中", `${def.name}在树屋里睡觉，梦里还留着今天要用的小线索。`, "tree_house");

  if (def.restUntil && def.restUntil > tick) {
    tick = addDialogue(char, tick + 4, def.mood, "揉揉眼睛醒来", def.dialogues[0], current);
    dialogueCount += 1;
    const firstTarget = nextDestination(def.route, current, routeIndex);
    routeIndex += 1;
    tick = addMove(char, tick + 4, current, firstTarget, def.mood, `${def.name}趁天还没亮，沿道路去${locations[firstTarget].name}收集第一段线索。`);
    moveCount += 1;
    current = firstTarget;
    tick = addAction(char, tick, 28, def.mood, def.actionStatuses[0], def.actionDetails[0], current);
    tick = addDialogue(char, tick + 4, def.mood, def.actionStatuses[1], def.dialogues[1], current);
    dialogueCount += 1;
    const backDuration = travelDuration(current, "tree_house");
    tick = addMove(char, Math.max(tick + 8, def.restUntil - backDuration - 120), current, "tree_house", "安静", `${def.name}把清晨记录收好，沿原路回树屋休息到正式开园。`);
    moveCount += 1;
    current = "tree_house";
    tick = addAction(char, tick, def.restUntil - tick, "困倦", "树屋里补个觉", `${def.name}回到树屋短短打了个盹，把早晨的光藏进心里。`, current);
  }

  tick = Math.max(tick, def.restUntil || def.wakeTick);
  tick = addDialogue(char, tick + 4, def.mood, "准备出门巡游", def.dialogues[2 % def.dialogues.length], current);
  dialogueCount += 1;

  const regularMovesNeeded = 43 - moveCount;
  const dialogueExtrasNeeded = def.dialogueTarget - dialogueCount - regularMovesNeeded;
  const loopStart = tick + 8;
  const available = RETURN_HOME_TICK - loopStart - 80;
  const interval = Math.floor(available / regularMovesNeeded);
  if (interval < 40) throw new Error(`Schedule too tight for ${char}`);

  for (let i = 0; i < regularMovesNeeded; i += 1) {
    const plannedStart = Math.max(tick + 4, loopStart + i * interval + ((i + index) % 5) * 3);
    const target = nextDestination(def.route, current, routeIndex);
    routeIndex += 1;
    tick = addMove(
      char,
      plannedStart,
      current,
      target,
      def.mood,
      template(moveDetailsByChar[char][i % moveDetailsByChar[char].length], {
        name: def.name,
        place: locations[target].name,
        short: locations[target].short
      })
    );
    moveCount += 1;
    current = target;

    const actionStatus = def.actionStatuses[i % def.actionStatuses.length];
    const actionDetail = `${def.actionDetails[i % def.actionDetails.length]}${actionTailsByChar[char][i % actionTailsByChar[char].length]}`;
    tick = addAction(char, tick, 8 + (i % 4), def.mood, actionStatus, actionDetail, current);

    const line = def.dialogues[i % def.dialogues.length];
    tick = addDialogue(char, tick + 2, def.mood, actionStatus, line, current);
    dialogueCount += 1;

    if (i < dialogueExtrasNeeded) {
      const extraLine = def.dialogues[(i + 3) % def.dialogues.length];
      tick = addDialogue(char, tick + 2, def.mood, def.actionStatuses[(i + 1) % def.actionStatuses.length], extraLine, current);
      dialogueCount += 1;
    }
  }

  if (current === "tree_house") {
    const target = nextDestination(def.route, current, routeIndex);
    const start = Math.min(tick + 8, RETURN_HOME_TICK - travelDuration(target, "tree_house") - travelDuration(current, target) - 2);
    tick = addMove(char, start, current, target, def.mood, `${def.name}在睡前又去${locations[target].name}确认最后一个细节。`);
    moveCount += 1;
    current = target;
  }

  tick = addMove(char, RETURN_HOME_TICK, current, "tree_house", "困倦", `${def.name}等到23:50才进入回家睡觉阶段，沿道路回到巨树树屋区。`);
  moveCount += 1;
  current = "tree_house";
  tick = addAction(char, tick, MAX_TICK - tick, "困倦", "树屋里睡觉中", `${def.name}回到树屋，把今天的性格和故事都收进梦里。`, current);

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
  date: "2026-06-07",
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

const longMemory = `long_term_memory:
${Object.entries(characterDefs).map(([id, def]) => `  ${id}:
    - ${def.memory}
    - 记得这一天一直活动到23:50才开始回树屋睡觉。
    - 记得自己的说话方式和行动习惯变得更清楚了。`).join("\n")}
`;

const relationships = `relationships:
  rabbit_1:
    rabbit_3:
      - 小悠米容易飞到小泽咖啡馆的糖罐上。
    rabbit_4:
      - 小悠米把采蜜带回来的花给晓雪扎染发带。
    rabbit_5:
      - 小悠米是杰拉德的灵感缪斯。
  rabbit_2:
    rabbit_6:
      - 乔治喊“给我劳”会让劳伦斯误以为在叫他。
    rabbit_3:
      - 乔治给小泽咖啡馆友情提供植物园薄荷。
    rabbit_4:
      - 乔治喜欢晓雪，也只有晓雪能治住他。
  rabbit_3:
    rabbit_5:
      - 小泽咖啡馆的招牌是杰拉德画的。
    rabbit_7:
      - 小泽知道Lino总能拍到最关键的吃瓜现场。
    rabbit_4:
      - 小泽推出新品时总邀请晓雪拍照推广。
  rabbit_4:
    rabbit_7:
      - 晓雪经常请Lino拍发带穿搭街拍照。
    rabbit_6:
      - 晓雪知道劳伦斯误会乔治时需要一点温柔解释。
    rabbit_2:
      - 晓雪会用法语吐槽和浓缩咖啡治住乔治。
  rabbit_5:
    rabbit_1:
      - 杰拉德把小悠米带回的花当作绘画素材。
    rabbit_6:
      - 杰拉德被劳伦斯当亲弟弟过度保护和投喂。
    rabbit_3:
      - 杰拉德给小泽咖啡馆设计了招牌。
  rabbit_6:
    rabbit_2:
      - 劳伦斯时常误会乔治对自己有不一样的感情。
    rabbit_4:
      - 劳伦斯尊重晓雪对乔治的管教方式。
    rabbit_5:
      - 劳伦斯把杰拉德当亲弟弟照顾。
    rabbit_3:
      - 劳伦斯圣诞节会打包小泽咖啡馆甜点回北欧。
  rabbit_7:
    rabbit_4:
      - Lino常帮晓雪拍发带穿搭街拍。
    rabbit_3:
      - Lino会在小泽咖啡馆安静整理吃瓜照片。
    rabbit_2:
      - Lino拍到过乔治向劳伦斯解释“给我劳”的现场。
`;

fs.writeFileSync(path.join(root, "scaffold/memory/long_memory.yaml"), longMemory);
fs.writeFileSync(path.join(root, "scaffold/memory/relationships.yaml"), relationships);

const counts = timeline.reduce((acc, event) => {
  acc[event.type] = (acc[event.type] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ events: timeline.length, counts }, null, 2));
