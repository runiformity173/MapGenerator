let f_elevation = [];
let f_temperature = [];
let f_body = [];
let f_coast = [];
function assignElevations() {
  f_elevation = [];
  const noise = createNoise2D(alea(ELEVATION_SEED));
  for (let i = 0;i < POINTS;i++) {
    let final = noise(f_center[i].x/NOISE_SCALE,f_center[i].y/NOISE_SCALE);
    const centerDist = Math.min(f_center[i].x/WIDTH,1-f_center[i].x/WIDTH,f_center[i].y/HEIGHT,1-f_center[i].y/HEIGHT);
    const mask = centerDist*5 - 1.3;
    f_elevation[f_center[i].voronoiId] = (final+mask);
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
      minHigh = 10;
      f_bordering_fs[land[i].voronoiId].forEach(function(e) {
        if (f_elevation[e] <= minHigh) {
          minHigh = f_elevation[e];
          minCell = e;
        }
      });
      if (f_elevation[land[i].voronoiId] <= f_elevation[minCell]) {
        depression += 1;
        f_elevation[land[i].voronoiId] = f_elevation[minCell] + 0.01;
      }
    }
  }
  land.sort(compareHeight);
}

function compareHeight(a, b) {if (f_elevation[a] < f_elevation[b]) {return -1;}return 0;}
function floodFillBodies() {
  f_body = [];
  f_coast = [];
  let assigned = 0;
  let current = -1;
  while (assigned < POINTS) {
    let c = ++current;
    while (f_body[c] !== undefined) {c++;}
    let og = f_elevation[c] <= SEA_LEVEL;
    const queue = [c];
    f_body[c] = current;
    assigned++;
    while (queue.length) {
      const j = queue.shift();
      for (const i of f_bordering_fs[j]) {
        if (f_body[i]!==undefined || ((f_elevation[i] <= SEA_LEVEL) != og)) {
        if (current === 0) {f_coast[i] = true;}
        continue;}
        f_body[i] = current;
        queue.push(i);
        assigned++;
      }
    }
  }
}

function assignTemperatures() {
  f_temperature = [];
  for (let i = 0;i<POINTS;i++) {
    f_temperature[i] = 1.0 - f_elevation[i] + mix(TEMPERATURE_NORTH, TEMPERATURE_SOUTH, f_center[i].y/HEIGHT);
  }
}
function biome(water, coast, temperature, moisture) {
    if (ocean) {
        return 'OCEAN';
    } else if (water) {
        if (temperature > 0.9) return 'MARSH';
        if (temperature < 0.2) return 'ICE';
        return 'LAKE';
    } else if (coast) {
        return 'BEACH';
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

}