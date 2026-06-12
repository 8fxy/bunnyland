# Bunnyland

Bunnyland 是一个静态的 24 小时像素剧场。页面读取 `data.json`，按一天 8640 个 tick 播放 7 只兔兔在岛上的移动、活动和对白。

项目当前托管为静态站，可直接部署到 Vercel、GitHub Pages 或任意静态文件服务。

## 功能

- 24 小时剧情时间轴：`move`、`action`、`dialogue` 三类事件按 tick 播放。
- 7 只兔兔角色：小悠米、乔治、小泽、晓雪、杰拉德、劳伦斯、Lino。
- 15 个地图地点：树屋、广场、咖啡馆、农场、工坊、图书馆、植物园、彩虹湖、迷宫、兔耳山、气象站、天文台、海湾、灯塔、香颂音乐厅。
- 白天/夜晚地图自动切换，地图资源使用 WebP。
- 状态栏显示兔兔头像、心情和当前状态。
- 本地调试模式可查看地图区域、道路和活动范围。
- scaffold 记录角色、地图、移动规则、长期记忆和人物关系，用于每日生成 `data.json`。

## 项目结构

```text
.
├── index.html                         # 静态前端入口
├── data.json                          # 当天剧情数据
├── debug.js                           # 本地或 ?debug=1 时加载的调试入口
├── UPDATE_LOG.md                      # 最近更新日志
├── assets/
│   ├── map_day.webp                   # 白天地图
│   ├── map_night.webp                 # 夜晚地图
│   └── characters/                    # 兔兔角色图片素材
└── scaffold/
    ├── characters/characters.yaml     # 角色基础设定
    ├── memory/                        # 长期记忆和人物关系
    ├── runtime/                       # 事件结构、移动和校验规则
    ├── world/                         # 地图、道路、天气、旅行时间
    └── tools/
        ├── generate_day_from_scaffold.js
        └── generate_travel_times.js
```

## 本地运行

这是纯静态站，不需要安装依赖。

```bash
python3 -m http.server 4180
```

然后打开：

```text
http://127.0.0.1:4180/index.html
```

直接双击 `index.html` 可能会因为浏览器限制 `file://` 下的 JSON 读取而失败，推荐使用本地静态服务。

## 调试模式

生产环境默认不显示调试按钮，也不会加载 `debug.js`。

以下情况会启用调试入口：

- 本地访问：`localhost` 或 `127.0.0.1`
- URL 显式带上：`?debug=1`

示例：

```text
http://127.0.0.1:4180/index.html?debug=1
```

## 数据模型

`data.json` 顶层字段：

- `date`: 剧情日期。
- `config`: tick 间隔、最大 tick、地图地点。
- `characters`: 角色初始状态。
- `timeline`: 按 `start_tick` 排序的事件数组。

事件类型：

- `move`: 角色从一个地点移动到另一个地点。
- `action`: 角色在地点内活动。
- `dialogue`: 角色短对白。

时间规则：

- 一天为 `8640` ticks。
- `tick_interval_seconds` 为 `10`，即 1 tick = 10 秒。
- 同一只兔兔的事件不能重叠。
- 移动耗时来自 `scaffold/world/travel_times.yaml`。

## 生成每日剧情

生成下一天或指定日期的数据：

```bash
node scaffold/tools/generate_day_from_scaffold.js 2026-06-14
```

脚本会更新：

- `data.json`
- `index.html` 中的 `DATA_VERSION`
- `scaffold/memory/long_memory.yaml`
- `scaffold/memory/relationships.yaml`

当前生成逻辑包含：

- 日期 seed，保证同一天可复现。
- 起床和回家就寝时间随机偏差。
- 清晨巡游兔兔轮换，也可能当天没有兔兔早起。
- 角色生日联动。
- 长期记忆和人物关系写入上限，当前每只兔兔最多 20 条。

## 更新道路旅行时间

如果修改了 `index.html` 里的道路配置，重新生成旅行时间：

```bash
node scaffold/tools/generate_travel_times.js
```

这会更新：

```text
scaffold/world/travel_times.yaml
```

## 验证

推荐在提交前至少运行：

```bash
node --check scaffold/tools/generate_day_from_scaffold.js
```

检查 `index.html` 内联脚本语法：

```bash
node -e 'const fs=require("fs"); const html=fs.readFileSync("index.html","utf8"); const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]); for (const script of scripts) new Function(script); console.log(`checked ${scripts.length} inline script(s)`);'
```

检查 `data.json` 基本结构：

```bash
node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync("data.json","utf8")); console.log(d.date, d.timeline.length);'
```

## 性能说明

普通生产访问主要加载：

- `index.html`
- `data.json?v=<DATA_VERSION>`
- 当前时段的一张地图 WebP
- 7 张兔兔 stage 图片

地图资源已从 PNG 切换为 WebP：

- `assets/map_day.webp`
- `assets/map_night.webp`

旧的 `assets/map_day.png` 和 `assets/map_night.png` 已不再需要。

## 部署

项目可直接作为静态站部署。当前工作流：

```bash
git checkout dev
# 修改并验证
git commit -m "..."
git push origin dev

git checkout main
git merge --no-ff dev -m "merge: ..."
git push origin main
```

Vercel 监听 `main` 分支时，推送 `main` 后会自动触发生产部署。

## 维护约定

- 生成 `data.json` 前，先根据最新剧情更新 scaffold 记忆和关系。
- 前端生产代码不要默认暴露调试模式。
- 新增大图优先使用 WebP 或同等压缩格式。
- 不要提交无关的 `.DS_Store`、临时截图或本地压缩包。
- Lino 是男生，叙事中保持代词一致。
