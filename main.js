// Coastline and lakes should be curves
// UI
// Doing state type distribution and placement now
let random = 0;
function totalRegenerate(points=false,displayResults=true) {
	console.time("whole regenerate");
  random = seededRandom(FEATURE_SEED);
  if (WIND_DIRECTIONS.includes("random")) {
	WIND_DIRECTIONS = [["random",0],["random",0,1],["random",1],["random",1,2],["random",2],["random",2,3],["random",3],["random",3,0]][Math.floor(random()*8)];
  }
  random = seededRandom(POINTS_SEED);
  clearDisplay();
  console.time("voronoi");
  if (points) {
	generateVoronoi();
  }
  console.timeEnd("voronoi");
console.time("heightmap");
random = seededRandom(ELEVATION_SEED);
  generateHeightmap();
console.timeEnd("heightmap");
console.time("floodfill");
  floodFillBodies();
console.timeEnd("floodfill");
console.time("depressions");
  resolveDepressions();
console.timeEnd("depressions");
console.time("temperatures");
random = seededRandom(FEATURE_SEED);
  assignTemperatures();
console.timeEnd("temperatures");
console.time("moistures");
  assignMoistures();
console.timeEnd("moistures");
console.time("rivers");
  assignRivers();
console.timeEnd("rivers");
console.time("biomes");
  assignBiomes();
console.timeEnd("biomes");
random = seededRandom(STATE_SEED);
console.time("states");
  assignStates();
console.timeEnd("states");
// alert((new Set(state_type.slice(1))).size + " | "+ state_type.includes("Lake"));
console.time("display");
  displayResults && display();
console.timeEnd("display");
console.timeEnd("whole regenerate");
}
function search() {
	while ((new Set(state_type.slice(1))).size < 7) {
	// while (state_type.filter(o=>o==focusState).length != 1) {
		STATE_SEED++;
		random = seededRandom(STATE_SEED);
		assignStates();
	}
	display();
}
function getStateDistribution(it = 100) {
	const results = {"Highland":0,"Generic":0,"Nomadic":0,"Hunting":0,"Naval":0,"River":0,"Lake":0};
	const cells = structuredClone(results);
	alert("Starting...");
	for (let i = 0;i<it;i++) {
		if (i%100 == 0 && i > 0) alert(i);
		totalRegenerate(displayResults=false);
		for (let j = 1;j <= STATE_NUMBER;j++) {
			results[state_type[j]]++;
			cells[state_type[j]] += state_cells[j];
		}
		ELEVATION_SEED++;
		FEATURE_SEED++;
		STATE_SEED++;
	}
	console.log(Object.fromEntries(Object.entries(results).map(o=>[o[0],o[1]/it])));
	console.log(Object.fromEntries(Object.entries(cells).map(o=>[o[0],Math.round(o[1]/results[o[0]])])));
	alert("Done!");
}
// setTimeout(getStateDistribution,2000);
const distributionYo = {
    "Highland": 0.178,
    "Generic": 1.475,
    "Nomadic": 2.946,
    "Hunting": 1.314,
    "Naval": 0.609,
    "River": 0.428,
    "Lake": 0.05
};