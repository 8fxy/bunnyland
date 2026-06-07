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
    color: "#ff8fab",
    scale: 0.8,
    mood: "好奇",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["carrot_square", "botanical_garden", "acorn_library", "shell_bay", "chanson_hall", "mushroom_cafe", "rainbow_lake", "carrot_square", "lighthouse", "botanical_garden"],
    actionStatuses: ["认真写花影便签", "追着光影找线索", "贴好开园小旗", "画下一朵小花", "拼起今日线索", "记录亮亮颜色"],
    actionDetails: [
      "小悠米把新发现折成小便签，贴在能被大家看见的地方。",
      "小悠米沿着光影慢慢比对，给每个小变化起了轻快的名字。",
      "小悠米把地点里的细节画成小图标，像在做一张会呼吸的地图。"
    ],
    dialogues: [
      "这里有一个新发现，我先贴住。",
      "这束光像在偷偷指路。",
      "我想给它起个很小的名字。",
      "等一下，我要把颜色记准。",
      "这张便签应该贴在最亮处。",
      "如果线索会唱歌，它会很轻。"
    ],
    memory: "把花影、灯塔光和音乐厅便签连成一条线。"
  },
  rabbit_2: {
    name: "乔治",
    color: "#7bdff2",
    scale: 1,
    mood: "平静",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["timothy_farm", "gear_workshop", "mushroom_cafe", "lighthouse", "chanson_hall", "carrot_square", "timothy_farm", "gear_workshop", "shell_bay", "acorn_library"],
    actionStatuses: ["仔细检查螺丝", "更换柔软垫圈", "把灯架调稳", "慢慢打磨边角", "写下维修记录", "测试弹簧回弹"],
    actionDetails: [
      "乔治蹲下来检查接口，确认每一处小松动都能被及时修好。",
      "乔治把工具排成整齐一列，做完一项就轻轻点一下头。",
      "乔治把灯和木件调到刚刚好，语气平稳得像一把尺子。"
    ],
    dialogues: [
      "这里松了一点，我来处理。",
      "别急，先看接缝。",
      "工具够用，问题不大。",
      "这样会稳很多。",
      "我留一枚备用垫圈。",
      "声音正常，可以继续。"
    ],
    memory: "记得用稳定的小维修守住大家的节奏。"
  },
  rabbit_3: {
    name: "小泽",
    color: "#f9c74f",
    scale: 1,
    mood: "热情",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["mushroom_cafe", "carrot_square", "chanson_hall", "shell_bay", "mushroom_cafe", "timothy_farm", "rainbow_lake", "chanson_hall", "lighthouse", "carrot_square"],
    actionStatuses: ["烤一盘蜂蜜点心", "倒好一杯热饮", "摆好小圆盘子", "贴上今日菜单", "分发甜甜点心", "试试新香气"],
    actionDetails: [
      "小泽把点心盘摆成弧线，保证每只兔兔路过时都能闻到甜香。",
      "小泽忙着给杯口系细绳，笑声像刚出炉的热气一样冒出来。",
      "小泽把今日菜单改成更热闹的版本，还给最后一行画了糖霜。"
    ],
    dialogues: [
      "先吃一口，灵感会来。",
      "这杯热饮留给晚到的。",
      "香味已经跑到门口啦。",
      "点心要配今天的光。",
      "我给大家多留了一盘。",
      "甜一点，路就不累。"
    ],
    memory: "记得用点心和热饮把大家聚到音乐厅。"
  },
  rabbit_4: {
    name: "晓雪",
    color: "#95d5b2",
    scale: 1,
    mood: "专注",
    wakeTick: 2880,
    dialogueTarget: 53,
    route: ["rabbit_mountain", "weather_station", "observatory", "acorn_library", "shell_bay", "lighthouse", "chanson_hall", "weather_station", "observatory", "botanical_garden"],
    actionStatuses: ["认真记录风向", "重新校准星图", "查阅旧天气册", "描下云层细线", "测量灯塔光角", "归档线索地图"],
    actionDetails: [
      "晓雪把风向、云影和地点时间写成整齐的小格，不漏掉任何一笔。",
      "晓雪安静地核对星图，确认每条线都能和今天的天气对上。",
      "晓雪把旧记录翻到空白处，补上一行非常准确的注释。"
    ],
    dialogues: [
      "风向变了，我记一下。",
      "这条线要再核对。",
      "云层比早上薄一点。",
      "星图和灯塔能对上。",
      "资料够写一页了。",
      "先别动，我量角度。"
    ],
    memory: "把风向、星图、灯塔刻痕整理进同一本档案。"
  },
  rabbit_5: {
    name: "杰拉德",
    color: "#cdb4db",
    scale: 0.8,
    mood: "兴奋",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["carrot_maze", "rainbow_lake", "shell_bay", "lighthouse", "chanson_hall", "carrot_maze", "botanical_garden", "rainbow_lake", "acorn_library", "lighthouse"],
    actionStatuses: ["拓下迷宫花纹", "比对湖面倒影", "寻找弯弯贝壳", "讲起奇怪线索", "画出秘密箭头", "摸摸灯塔刻痕"],
    actionDetails: [
      "杰拉德把纹样看成一场小冒险，越看越觉得每个弯都藏着入口。",
      "杰拉德拿着拓片来回比对，眼睛亮得像刚发现一扇暗门。",
      "杰拉德把贝壳、湖光和迷宫线条摆成一排，开心得差点跳起来。"
    ],
    dialogues: [
      "这个弯像秘密入口！",
      "等下，它在指灯塔。",
      "我梦里见过这条线。",
      "迷宫肯定听见音乐了。",
      "贝壳刚好补上缺口。",
      "这不是巧合，是邀请！"
    ],
    memory: "确认迷宫纹样、贝壳和灯塔刻痕能互相补全。"
  },
  rabbit_6: {
    name: "劳伦斯",
    color: "#f4a261",
    scale: 1.2,
    mood: "可靠",
    wakeTick: 2880,
    dialogueTarget: 52,
    route: ["gear_workshop", "timothy_farm", "lighthouse", "shell_bay", "chanson_hall", "gear_workshop", "carrot_square", "lighthouse", "timothy_farm", "shell_bay"],
    actionStatuses: ["认真巡完整圈", "安装轻巧齿轮", "仔细测试水压", "准时点亮灯塔", "收好厚厚手套", "稳住转动灯光"],
    actionDetails: [
      "劳伦斯按顺序检查一遍，确认每个地方都能撑到夜里。",
      "劳伦斯把大手套放在一边，动作稳得像在给地图压住边角。",
      "劳伦斯听完灯声才点头，决定把最后一次巡检排到更晚。"
    ],
    dialogues: [
      "我再确认一遍。",
      "灯能撑到夜里。",
      "水压稳，放心。",
      "这里我来收尾。",
      "别急，先把路让开。",
      "最后一圈不能省。"
    ],
    memory: "记得把灯塔、农场和工坊都巡到夜里才安心。"
  },
  rabbit_7: {
    name: "Lino",
    color: "#9ca3af",
    scale: 1,
    mood: "安静",
    wakeTick: 300,
    restUntil: 2880,
    dialogueTarget: 52,
    route: ["observatory", "weather_station", "rabbit_mountain", "carrot_square", "observatory", "rainbow_lake", "shell_bay", "chanson_hall", "weather_station", "lighthouse", "rabbit_mountain"],
    actionStatuses: ["拍下清晨星轨", "轻轻收好镜头", "安静等风停下", "冲洗小张照片", "拍下最后尾光", "叠好灰色底片"],
    actionDetails: [
      "Lino安静地调整镜头，把光线留在最灰也最柔的位置。",
      "Lino没有急着说话，只把照片边角压平，等颜色慢慢显出来。",
      "Lino站在稍远处按下快门，像把今天的一小块安静收进口袋。"
    ],
    dialogues: [
      "光刚好停在这里。",
      "我想再等一秒。",
      "这张适合放最后。",
      "云影很轻，别惊动它。",
      "照片会记得声音。",
      "灰色也可以很亮。"
    ],
    memory: "用照片记录清晨星轨、白天云影和夜晚尾光。"
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

function charLength(text) {
  return [...text].length;
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
      `${def.name}沿着道路前往${locations[target].name}，一路保持着自己熟悉的节奏。`
    );
    moveCount += 1;
    current = target;

    const actionStatus = def.actionStatuses[i % def.actionStatuses.length];
    const actionDetail = `${def.actionDetails[i % def.actionDetails.length]}地点是${locations[current].name}，这让今天的故事更像${def.name}自己。`;
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
      - 小悠米会把小泽的点心香写成便签。
    rabbit_4:
      - 小悠米把发现交给晓雪归档。
    rabbit_5:
      - 小悠米相信杰拉德的奇想能变成线索。
  rabbit_2:
    rabbit_6:
      - 乔治和劳伦斯用维修和巡检互相补位。
    rabbit_3:
      - 乔治常帮小泽把灯和桌面调稳。
  rabbit_3:
    rabbit_5:
      - 小泽愿意把杰拉德的奇想变成热闹节目。
    rabbit_7:
      - 小泽觉得Lino的照片让甜点更有故事。
  rabbit_4:
    rabbit_7:
      - 晓雪和Lino会共享云影、星光和照片时间。
    rabbit_6:
      - 晓雪信任劳伦斯的灯塔巡检。
  rabbit_5:
    rabbit_1:
      - 杰拉德喜欢看小悠米整理复杂线索。
    rabbit_6:
      - 杰拉德把劳伦斯修好的灯塔当作冒险终点。
  rabbit_6:
    rabbit_2:
      - 劳伦斯和乔治配合维修时几乎不用多说话。
    rabbit_4:
      - 劳伦斯会等晓雪确认风向后再点灯。
  rabbit_7:
    rabbit_4:
      - Lino安静地补上晓雪需要的照片证据。
    rabbit_3:
      - Lino觉得小泽的热饮能让夜景照片更暖。
`;

fs.writeFileSync(path.join(root, "scaffold/memory/long_memory.yaml"), longMemory);
fs.writeFileSync(path.join(root, "scaffold/memory/relationships.yaml"), relationships);

const counts = timeline.reduce((acc, event) => {
  acc[event.type] = (acc[event.type] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ events: timeline.length, counts }, null, 2));
