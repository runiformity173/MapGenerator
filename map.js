let f_elevation = [];
let f_temperature = [];
let f_body = [];
let f_coast = [];
let f_moisture = [];
let f_biome = [];
let f_flow_f = [];
let f_flow = [];
let waterCells = 0;
let landCells = 0;
let mainland_body = 1;
function assignElevations() {
  f_elevation = [];
  const noise = createNoise2D(seededRandom(ELEVATION_SEED));
  let elevationMax = -2;
  for (let i = 0;i < POINTS;i++) {
    let final = noise(f_center[i].x/NOISE_SCALE,f_center[i].y/NOISE_SCALE);
    const centerDist = Math.min(f_center[i].x/WIDTH,1-f_center[i].x/WIDTH,f_center[i].y/HEIGHT,1-f_center[i].y/HEIGHT);
    const mask = centerDist*5 - 1.3;
    f_elevation[f_center[i].voronoiId] = final+mask;
	if (final+mask > elevationMax) elevationMax = final+mask;
  }
  for (let i = 0;i < POINTS; i++) {
	f_elevation[i] /= elevationMax;
  }
}
let land;
function resolveDepressions() {
  land = f_center.filter(function(e) {
    return (f_elevation[e.voronoiId] > SEA_LEVEL);
  });
  var depression = 1, minCell, minHigh;
    while (depression > 0) {
      depression = 0;
      for (var i = 0; i < land.length; i++) {
      minHigh = 1000;
      f_bordering_fs[land[i].voronoiId].forEach(function(e) {
        if (f_elevation[e] <= minHigh) {
          minHigh = f_elevation[e];
          minCell = e;
        }
      });
      if (f_elevation[land[i].voronoiId] <= f_elevation[minCell]) {
        depression += 1;
        f_elevation[land[i].voronoiId] = f_elevation[minCell] + 1;
      }
    }
  }
}
function assignRivers() {
	f_flow_f = [];
	for (let i = 0; i < POINTS;i++) {
		if (f_elevation[i] <= SEA_LEVEL) {f_flow_f[i] = i;continue;}
		if (f_coast[i]) {
			const possible = [];
			for (const neighbor of f_bordering_fs[i]) {
				if (f_elevation[neighbor] <= SEA_LEVEL) {possible.push(neighbor);}
			}
			f_flow_f[i] = possible[Math.floor(random()*possible.length)];
			continue;
		}
		let lowest = 1000;
		let lowestIndex = 0;
		for (const neighbor of f_bordering_fs[i]) {
			if (f_elevation[neighbor] < lowest) {
				lowest = f_elevation[neighbor];
				lowestIndex = neighbor;
			}
		}
		f_flow_f[i] = lowestIndex;
	}
	f_flow = structuredClone(f_moisture);
	f_center.map(i=>i.voronoiId).sort((a,b)=>f_elevation[b]-f_elevation[a]).forEach(function (i) {
		f_flow[f_flow_f[i]] += f_flow[i];
	});
	f_center.forEach(function (i) {
		if (f_flow[i.voronoiId] >= 3) {
			f_moisture[i.voronoiId] += 0.3;
		}
	});
}
function compareHeight(a, b) {if (f_elevation[a] < f_elevation[b]) {return -1;}return 0;}
let coastlineVertices = [];
let lakeVertices = [];
let body_cells = [];
let body_type = [];
function floodFillBodies() {
  waterCells = 0;
  landCells = 0;
  body_cells = [];
  f_body = [];
  f_coast = [];
  coastlineVertices = [];
  lakeVertices = [];
  let assigned = 0;
  let current = -1;
  while (assigned < POINTS) {
    let c = ++current;
	body_cells[current] = 1;
    while (f_body[c] !== undefined) {c++;}
    let og = f_elevation[c] <= SEA_LEVEL;
	body_type[current] = og;
	if (og && current>0) {
		lakeVertices[current] = [];
	}
    const queue = [c];
    f_body[c] = current;
    assigned++;
    while (queue.length) {
      const j = queue.shift();
      for (const i of f_bordering_fs[j]) {
        if (f_body[i]!==undefined || ((f_elevation[i] <= SEA_LEVEL) != og)) {
			if (f_elevation[j] <= SEA_LEVEL) {
				f_coast[i] = true;
				if (current === 0) {
					
				}
				else {
					lakeVertices[current].push(0);
				}
			}
			if (og) waterCells++;
			else landCells++;
			continue;
		}
        f_body[i] = current;
        queue.push(i);
        assigned++;
		body_cells[current]++;
      }
    }
	if (!og && body_cells[current] > body_cells[mainland_body]) {
		mainland_body = current;
	}
	if (og) {
		if (current > 0) lakeVertices[current].push(lakeVertices[current][0]);
		else coastlineVertices.push(coastlineVertices[0]);
	}
  }
}

function assignTemperatures() {
  f_temperature = [];
  for (let i = 0;i<POINTS;i++) {
    f_temperature[i] = mix(TEMPERATURE_NORTH, TEMPERATURE_SOUTH, f_center[i].y/HEIGHT) - (f_elevation[i]-SEA_LEVEL)/2/(100-SEA_LEVEL);
  }
}

function biome(cell) {
	const temperature = f_temperature[cell];
	const moisture = f_moisture[cell];
    if (f_body[cell] == 0) {
        return 'OCEAN';
    } else if (f_elevation[cell] <= SEA_LEVEL) {
        if (temperature > 0.9) return 'MARSH';
        if (temperature < 0.2) return 'ICE';
        return 'LAKE';
    // } else if (f_coast[cell]) {
    //     return 'BEACH';
    } else if (temperature < 0.2) {
        if (moisture > 0.50) return 'SNOW';
        else if (moisture > 0.33) return 'TUNDRA';
        else if (moisture > 0.16) return 'BARE';
        else return 'SCORCHED';
    } else if (temperature < 0.4) {
        if (moisture > 0.66) return 'TAIGA';
        else if (moisture > 0.33) return 'SHRUBLAND';
        else return 'TEMPERATE_DESERT';
    } else if (temperature < 0.7) {
        if (moisture > 0.83) return 'TEMPERATE_RAIN_FOREST';
        else if (moisture > 0.50) return 'TEMPERATE_DECIDUOUS_FOREST';
        else if (moisture > 0.16) return 'GRASSLAND';
        else return 'TEMPERATE_DESERT';
    } else {
        if (moisture > 0.66) return 'TROPICAL_RAIN_FOREST';
        else if (moisture > 0.33) return 'TROPICAL_SEASONAL_FOREST';
        else if (moisture > 0.16) return 'GRASSLAND';
        else return 'SUBTROPICAL_DESERT';
    }
}
function assignBiomes() {
	f_biome = [];
	for (let i = 0;i < POINTS;i++) {
		f_biome[i] = biome(i);
	}
	const smoothed_biomes = [];
	for (let i = 0;i < POINTS;i++) {
		if (f_elevation[i] <= SEA_LEVEL || f_flow[i] >= 3) {smoothed_biomes[i] = f_biome[i];continue;}
		const t = {};
		t[f_biome[i]] = 1;
		for (const j of f_bordering_fs[i]) {
			if (f_elevation[j] <= SEA_LEVEL) {continue;}
			if (f_biome[j] in t) {
				t[f_biome[j]]++;
			} else {
				t[f_biome[j]] = 1;
			}
		}
		smoothed_biomes[i] = f_elevation[i]<=SEA_LEVEL?f_biome[i]:Object.entries(t).sort((a,b)=>(b[1]-a[1]))[0][0];
	}
	f_biome = smoothed_biomes;
}
const biome_cost = {
	"BEACH": 30,
	"MARSH": 150,
	"LAKE": 0,
	"OCEAN": 0,
	"SNOW": 200,
	"TUNDRA": 300,
	"BARE": 500,
	"SCORCHED": 1000,
	"TAIGA": 200,
	"SHRUBLAND": 60,
	"TEMPERATE_DESERT": 150,
	"TEMPERATE_RAIN_FOREST": 90,
	"TEMPERATE_DECIDUOUS_FOREST": 70,
	"GRASSLAND": 50,
	"SUBTROPICAL_DESERT": 200,
	"TROPICAL_RAIN_FOREST": 80,
	"TROPICAL_SEASONAL_FOREST": 70
}
const biome_suitability = {
	"MARSH": 12,
	"LAKE": 0,
	"OCEAN": 0,
	"SNOW": 120,
	"TUNDRA": 4,
	"BARE": 20,
	"SCORCHED": 10,
	"TAIGA": 40,
	"SHRUBLAND": 22,
	"TEMPERATE_DESERT": 20,
	"TEMPERATE_RAIN_FOREST": 60,
	"TEMPERATE_DECIDUOUS_FOREST": 50,
	"GRASSLAND": 45,
	"SUBTROPICAL_DESERT": 8,
	"TROPICAL_RAIN_FOREST": 50,
	"TROPICAL_SEASONAL_FOREST": 40
}