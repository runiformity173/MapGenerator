function sidebarLoad() {
	document.getElementById("elevationSeedInput").value = ELEVATION_SEED;
	document.getElementById("featureSeedInput").value = FEATURE_SEED;
	document.getElementById("stateSeedInput").value = STATE_SEED;
	DISPLAY_MODE = document.getElementById("viewModeSelect").value.toLowerCase().slice(0,-1);
	DISPLAY_WATER = document.getElementById("waterwayControlCheckbox").checked;
	ROUGH_LINES = document.getElementById("roughEdgesCheckbox").checked;
	CELL_BORDERS = document.getElementById("cellBordersCheckbox").checked;
}
function sidebarRegenerate() {
	document.getElementById("elevationSeedInput").value = Math.floor(Math.random()*1000000);
	document.getElementById("featureSeedInput").value = Math.floor(Math.random()*1000000);
	document.getElementById("stateSeedInput").value = Math.floor(Math.random()*1000000);
}
sidebarLoad();
function regenerate() {
	ELEVATION_SEED = Number(document.getElementById("elevationSeedInput").value);
	FEATURE_SEED = Number(document.getElementById("featureSeedInput").value);
	STATE_SEED = Number(document.getElementById("stateSeedInput").value);
	console.log(ELEVATION_SEED,FEATURE_SEED);
	totalRegenerate();
}