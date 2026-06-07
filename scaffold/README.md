# Bunnyland Daily Data Scaffold

这个文件夹用于提示 agent 生成每天的 `data.json`。

推荐使用顺序：

1. 读取 `characters/characters.yaml`，确认兔兔 id、名字和性格。
2. 读取 `world/map.yaml` 和 `world/roads.yaml`，确认地点 id、中文名和道路关系。
3. 读取 `world/travel_times.yaml`，按地点对查询移动距离、路线和推荐 ticks。
4. 读取 `runtime/event_schema.yaml`、`runtime/movement_rules.yaml` 和 `runtime/validation_rules.yaml`，确认 JSON 结构和硬约束。
5. 读取 `runtime/daily_script_prompt.md`，作为主提示生成当天 `data.json`。
6. 生成后先按 `validation_rules.yaml` 检查，再写入项目根目录的 `data.json`。

关键约束：

- 一天固定 8640 ticks，对应 24 小时。
- `move`、`action`、`dialogue` 必须是小写。
- 所有 `move` 事件必须按 `world/travel_times.yaml` 的地点对推荐 ticks 设置持续时间。
- 当前角色为 7 只兔兔：小悠米、乔治、小泽、晓雪、杰拉德、劳伦斯、Lino。
- 当前地点为 15 个，包含新增的灯塔和香颂音乐厅。

道路坐标变化后，运行：

```bash
node scaffold/tools/generate_travel_times.js
```

它会从 `index.html` 的 `mapConfig.roads` 重新生成 `world/travel_times.yaml`。
