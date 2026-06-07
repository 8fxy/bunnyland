const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const indexPath = path.join(root, "index.html");
const outputPath = path.join(root, "scaffold", "world", "travel_times.yaml");

const roadMeta = {
  tree_to_square: ["tree_house", "carrot_square"],
  square_to_cafe: ["carrot_square", "mushroom_cafe"],
  square_to_farm: ["carrot_square", "timothy_farm"],
  farm_to_workshop: ["timothy_farm", "gear_workshop"],
  workshop_to_library: ["gear_workshop", "acorn_library"],
  library_to_garden: ["acorn_library", "botanical_garden"],
  garden_to_lake: ["botanical_garden", "rainbow_lake"],
  lake_to_maze: ["rainbow_lake", "carrot_maze"],
  square_to_mountain: ["carrot_square", "rabbit_mountain"],
  mountain_to_weather: ["rabbit_mountain", "weather_station"],
  mountain_to_observatory: ["rabbit_mountain", "observatory"],
  square_to_beach: ["carrot_square", "shell_bay"],
  beach_to_lighthouse: ["shell_bay", "lighthouse"],
  beach_to_chanson: ["shell_bay", "chanson_hall"]
};

const locationOrder = [
  "tree_house",
  "carrot_square",
  "mushroom_cafe",
  "timothy_farm",
  "gear_workshop",
  "acorn_library",
  "botanical_garden",
  "rainbow_lake",
  "carrot_maze",
  "rabbit_mountain",
  "weather_station",
  "observatory",
  "shell_bay",
  "lighthouse",
  "chanson_hall"
];

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
}

function durationTicks(distancePx) {
  return Math.max(4, Math.round(distancePx / 35));
}

function shortestPaths(source, adjacency) {
  const dist = Object.fromEntries(locationOrder.map(id => [id, Infinity]));
  const previous = {};
  const visited = new Set();
  dist[source] = 0;

  while (visited.size < locationOrder.length) {
    let current = null;
    let best = Infinity;
    for (const id of locationOrder) {
      if (!visited.has(id) && dist[id] < best) {
        current = id;
        best = dist[id];
      }
    }
    if (!current) break;
    visited.add(current);

    for (const edge of adjacency[current]) {
      const nextDistance = dist[current] + edge.distance;
      if (nextDistance < dist[edge.to]) {
        dist[edge.to] = nextDistance;
        previous[edge.to] = { from: current, road: edge.id };
      }
    }
  }

  return { dist, previous };
}

function reconstructRoute(previous, source, target) {
  const roads = [];
  const locations = [target];
  let current = target;

  while (current !== source) {
    const step = previous[current];
    if (!step) return null;
    roads.unshift(step.road);
    current = step.from;
    locations.unshift(current);
  }

  return { locations, roads };
}

function formatArray(items) {
  return `[${items.join(", ")}]`;
}

const indexText = fs.readFileSync(indexPath, "utf8");
const match = indexText.match(/const mapConfig = \{[\s\S]*?\n    \};/);
if (!match) {
  throw new Error("Cannot find mapConfig in index.html");
}

const mapConfigSource = match[0]
  .replace(/^\s*const mapConfig = /, "")
  .replace(/;\s*$/, "");
const mapConfig = Function(`return (${mapConfigSource})`)();

const directRoads = mapConfig.roads.map(road => {
  const endpoints = roadMeta[road.id];
  if (!endpoints) {
    throw new Error(`Missing road endpoint metadata for ${road.id}`);
  }
  const distancePx = Math.round(polylineLength(road.points));
  return {
    id: road.id,
    from: endpoints[0],
    to: endpoints[1],
    distancePx,
    durationTicks: durationTicks(distancePx),
    points: road.points
  };
});

const adjacency = Object.fromEntries(locationOrder.map(id => [id, []]));
for (const road of directRoads) {
  adjacency[road.from].push({ to: road.to, distance: road.distancePx, id: road.id });
  adjacency[road.to].push({ to: road.from, distance: road.distancePx, id: road.id });
}

let yaml = "";
yaml += "# Generated from index.html mapConfig roads. Update with: node scaffold/tools/generate_travel_times.js\n";
yaml += "travel_time_model:\n";
yaml += "  source: index.html mapConfig.roads polyline length\n";
yaml += "  algorithm: shortest_path_on_road_graph\n";
yaml += "  pixels_per_tick: 35\n";
yaml += "  min_duration_ticks: 4\n";
yaml += "  formula: duration_ticks = max(4, round(distance_px / 35))\n";
yaml += "  tick_interval_seconds: 10\n";
yaml += "  agent_rule: move.end_tick = move.start_tick + duration_ticks from all_pairs for the unordered from/to pair\n\n";
yaml += "direct_roads:\n";

for (const road of directRoads) {
  yaml += `  ${road.id}:\n`;
  yaml += `    from: ${road.from}\n`;
  yaml += `    to: ${road.to}\n`;
  yaml += `    distance_px: ${road.distancePx}\n`;
  yaml += `    duration_ticks: ${road.durationTicks}\n`;
  yaml += `    points: ${JSON.stringify(road.points)}\n`;
}

yaml += "\nall_pairs:\n";
for (let i = 0; i < locationOrder.length; i += 1) {
  const source = locationOrder[i];
  const { dist, previous } = shortestPaths(source, adjacency);
  for (let j = i + 1; j < locationOrder.length; j += 1) {
    const target = locationOrder[j];
    const route = reconstructRoute(previous, source, target);
    const distancePx = Math.round(dist[target]);
    yaml += `  - from: ${source}\n`;
    yaml += `    to: ${target}\n`;
    yaml += `    distance_px: ${distancePx}\n`;
    yaml += `    duration_ticks: ${durationTicks(distancePx)}\n`;
    yaml += `    via: ${formatArray(route.locations)}\n`;
    yaml += `    roads: ${formatArray(route.roads)}\n`;
  }
}

fs.writeFileSync(outputPath, yaml);
