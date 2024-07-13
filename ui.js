function sidebarLoad() {
	document.getElementById("elevationSeedInput").value = 474481; //Math.floor(Math.random()*1000000);
	document.getElementById("featureSeedInput").value = 654309; //Math.floor(Math.random()*1000000);
	document.getElementById("stateSeedInput").value = 31502; //Math.floor(Math.random()*1000000);
}
sidebarLoad();
function regenerate() {
	ELEVATION_SEED = Number(document.getElementById("elevationSeedInput").value);
	FEATURE_SEED = Number(document.getElementById("featureSeedInput").value);
	STATE_SEED = Number(document.getElementById("stateSeedInput").value);
	console.log(ELEVATION_SEED,FEATURE_SEED);
	totalRegenerate();
}