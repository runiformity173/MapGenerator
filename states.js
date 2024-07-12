let f_state = [];
let state_color = [];
let state_type = [];
let state_expansionism = [];
let state_capital = [];
let state_cells = [];
let queue = [];
function assignStates() {
	assignCellSuitabilities();
	f_state = [];
	f_cost = [];
	state_cells = [];
	const states = [[]];
	const suitabilitySorted = allPoints.sort((a,b)=>f_suitability[b]-f_suitability[a]);
	let k = 0;
	while (states.length <= STATE_NUMBER) {
		const j = suitabilitySorted[k];
		k++;
		if (f_elevation[j] <= SEA_LEVEL) {continue;}
		let works = true;
		for (let i = 1;i<states.length;i++) {
			if ((f_center[j].x-f_center[states[i]].x)**2 + (f_center[j].y-f_center[states[i]].y)**2 < (WIDTH*HEIGHT/100)) {
				works = false;
				break;
			}
		}
		if (works) {
			const biomes = new Set();
			biomes.add(f_biome[j]);
			let highCount = 0;
			for (const i of f_bordering_fs[j]) {
				if (f_elevation[i] > SEA_LEVEL) {
					biomes.add(f_biome[i]);
					if (f_elevation[i] > 62) {
						highCount++;
					}
				}
			}
			if (biomes.size > 1 || (f_elevation[j] > 62 && highCount < 2)) {
				works = false;
			}
		}
		if (works) {
			states.push(j);
		}
	}
	queue = new PriorityQueue((a,b)=>a[0] < b[0]); // const
	for (let i = 1;i < states.length;i++) {
		state_type[i] = defineStateType(states[i]);
		queue.push([0,i,states[i],f_biome[states[i]],state_type[i],0]);
		state_color[i] = hslToRgb(i/STATE_NUMBER,1.0,0.5);
		state_expansionism[i] = defineStateExpansionism(state_type[i]);
		state_capital[i] = states[i];
		state_cells[i] = 0;
	}
	advance();
	// while (queue.size() > 0) {
	// 	const [cost,state,cell,b,type] = queue.pop();
	// 	if (f_state[cell]) {continue;}
	// 	f_state[cell] = state;
	// 	for (const neighbor of f_bordering_fs[cell]) {
	// 		if (!f_state[neighbor]) {
	// 			// const cultureCost = culture === cells.culture[e] ? -9 : 100;
	// 			// const populationCost = cells.h[e] < 20 ? 0 : cells.s[e] ? Math.max(20 - cells.s[e], 0) : 5000;
	// 			const biomeCost = getBiomeCost(b, f_biome[neighbor], f_elevation[neighbor], type);
	// 			const heightCost = getHeightCost(f_body[neighbor], f_elevation[neighbor], type);
	// 			const riverCost = getRiverCost(f_flow[neighbor]>=3, neighbor, type);
	// 			const typeCost = getTypeCost(neighbor, type);
	// 			const cellCost = Math.max(biomeCost + heightCost + riverCost + typeCost - 9, 0);
	// 			if (isNaN(cellCost)) {alert("NO");}
	// 			queue.push([cost+10+cellCost/state_expansionism[state],state,neighbor,b,type]);
	// 		}
	// 	}
	// }
}
let focusState = "None";
/*
Hunting
Nomadic
-- Naval
-- Lake
-- River
Generic
Highland --
*/
let f_cost = [];
function advance() {
	if (queue.size() == 0) return;
	while (queue.size() > 0) {
		const [cost,state,cell,b,type,l] = queue.pop();
		if (f_state[cell]) {continue;}
		f_state[cell] = state;
		state_cells[state]++;
		f_cost[cell] = l;
		for (const neighbor of f_bordering_fs[cell]) {
			if (!f_state[neighbor]) {
				const biomeCost = getBiomeCost(b, f_biome[neighbor], f_elevation[neighbor], type);
				const heightCost = getHeightCost(f_body[neighbor], f_elevation[neighbor], type);
				const riverCost = getRiverCost(f_flow[neighbor]>=3, neighbor, type);
				const typeCost = getTypeCost(neighbor, type);
				const cellCost = Math.max(biomeCost + heightCost + riverCost + typeCost - 9, 0);
				if (isNaN(cellCost)) {alert("NO");}
				queue.push([cost+10+cellCost/state_expansionism[state],state,neighbor,b,type,10+cellCost/state_expansionism[state]]);
			}
		}
		if (f_elevation[cell] > SEA_LEVEL && state_type[state] == focusState) {display();return;}
	}
	// display();
}
// setInterval(advance,100);
function getBiomeCost(b, biome, h, type) {
	if (b === biome) return 10; // tiny penalty for native biome
	if (type === "Highland" && h > 62) return biome_cost[biome] / 2; // less penalty for highland biomes and highlanders
	if (type === "Hunting") return biome_cost[biome] * 2; // non-native biome penalty for hunters
	if (type === "Nomadic" && ["TROPICAL_RAIN_FOREST","TROPICAL_SEASONAL_FOREST","TEMPERATE_DECIDUOUS_FOREST","TEMPERATE_RAIN_FOREST","TAIGA"].includes(biome) ) return biome_cost[biome] * 3; // forest biome penalty for nomads
	if (type === "Nomadic" && ["TEMPERATE_DESERT","SUBTROPICAL_DESERT","GRASSLAND"].includes(biome)) return biome_cost[biome] / 2; // less penalty for open biomes for nomads
	return biome_cost[biome]; // general non-native biome penalty
  }
  function getHeightCost(f, h, type) {
	if (type === "Lake" && h <= SEA_LEVEL && f !== 0) return 10; // low lake crossing penalty for Lake cultures
	if (type === "Naval" && h <= SEA_LEVEL) return 300; // low sea crossing penalty for Navals
	if (type === "Nomadic" && h <= SEA_LEVEL) return 20000; // giant sea crossing penalty for Nomads
	if (h <= SEA_LEVEL) return 1000; // general sea crossing penalty
	if (type === "Highland" && h <= 62) return 1100; // penalty for highlanders on lowlands
	if (type === "Highland") return 0; // no penalty for highlanders on highlands
	if (h > 67) return 2200; // general mountains crossing penalty
	if (h > 44) return 300; // general hills crossing penalty
	return 0;
  }

  function getRiverCost(r, i, type) {
	if (type === "River") return r ? -20 : 100; // penalty for river cultures
	if (!r) return 0; // no penalty for others if there is no river
	return (Math.min(1,Math.max((f_flow[i]-3) / 10,0))*80)+20; // river penalty from 20 to 100 based on flux
  }

  function getTypeCost(t, type) {
	if (f_coast[t]) return type === "Naval" || type === "Lake" ? 0 : type === "Nomadic" ? 60 : 20; // penalty for coastline
	if (body_cells[f_body[t]] < 0.02*POINTS && f_elevation[t] > SEA_LEVEL) return type === "Naval" || type === "Nomadic" ? 30 : 0; // low penalty for land level 2 for Navals and nomads
	if (body_cells[f_body[t]] >= 0.02*POINTS && f_elevation[t] > SEA_LEVEL) return type === "Naval" || type === "Lake" ? 100 : 0; // penalty for mainland for navals
	return 0;
  }
  function defineStateExpansionism(type) {
	let base = 1; // Generic
	if (type === "Lake") base = 0.8;
	else if (type === "Naval") base = 1.5;
	else if (type === "River") base = 0.9;
	else if (type === "Nomadic") base = 1.5;
	else if (type === "Hunting") base = 0.7;
	else if (type === "Highland") base = 1.2;
	return rn(((random() * 1) / 2 + 1) * base, 1);
  }
  function rn(v, d = 0) {
	const m = Math.pow(10, d);
	return Math.round(v * m) / m;
  }
  function defineStateType(i) {
	if (f_elevation[i] < 70 && ["SUBTROPICAL_DESERT","TEMPERATE_DESERT","GRASSLAND"].includes(f_biome[i]) && body_cells[f_body[i]] >= 0.02*POINTS) return "Nomadic"; // high penalty in forest biomes and near coastline
	if (f_elevation[i] > 62) return "Highland"; // no penalty for hills and moutains, high for other elevations
	let f = -1;
	let c = 0;
	for (const j of f_bordering_fs[i]) {
		if (f_elevation[j] <= SEA_LEVEL) {
			f = f_body[j];
			c++;
		}
	}
	if (f > 0 && body_cells[f] > 5) return "Lake"; // low water cross penalty and high for growth not along coastline
	if (
	  (f == 0 && random() <= 0.1) ||
	  (f == 0 && c == 1 && random() <= 0.6) ||
	  (body_cells[f_body[i]] < 0.02*POINTS && random() <= 0.5)
	)
	  return "Naval"; // low water cross penalty and high for non-along-coastline growth
	if (f_flow[i] > 40) return "River"; // no River cross penalty, penalty for non-River growth
	if (["TEMPERATE_RAIN_FOREST","TROPICAL_RAIN_FOREST", "SHRUBLAND","TAIGA", "TUNDRA"].includes(f_biome[i])) return "Hunting"; // high penalty in non-native biomes cells.t[i] > 2
	return "Generic";
  }

let f_suitability = [];
function assignCellSuitabilities() {
	console.time("cellValues");
	f_suitability = [];
	const sorted = f_flow.filter((o,i)=>(f_elevation[i]>SEA_LEVEL&&o>=3)).sort((a,b)=>a-b);
	const flowMedian = sorted.length&1?sorted[Math.floor(sorted.length/2)]:(sorted[Math.floor(sorted.length/2)]+sorted[Math.floor(sorted.length/2)-1])/2;
	const flowMax = sorted[sorted.length-1];
	for (let i = 0;i<POINTS;i++) {
	  if (f_elevation[i] < 20) {f_suitability[i] = 0;continue;}
	  let s = biome_suitability[f_biome[i]];
	  if (!s) {f_suitability[i] = 0;continue;}
	  if (flowMedian) s += normalize(f_flow[i], flowMedian, flowMax) * 100; // big rivers are good
	//   s -= (f_elevation[i] - 50) / 5;
	  if (f_elevation[i] > 62) s += 20; // highland bonus
	  if (f_coast[i]) {
		let f = -1;
		let c = 0;
		for (const j of f_bordering_fs[i]) {
			if (f_elevation[j] <= SEA_LEVEL) {
				f = f_body[j];
				c++;
			}
		}
		if (f > 0) {
		  s += 30;
		} else {
		  s += 5;
		  if (c === 1) s += 15; // harbor
		}
	  }
  
	  f_suitability[i] = s*random();
	}
	console.timeEnd("cellValues");
  }
// setTimeout(function(){displayMode("suitability")},2000);