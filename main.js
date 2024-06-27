// Moisture by prevailing winds
// Rivers
// Biomes
function totalRegenerate() {
  generateVoronoi();
  assignElevations();
  floodFillBodies();
  resolveDepressions();
  assignTemperatures();
  // assignMoistures();
  assignBiomes();
  display();
  stepThrough();
}
try {totalRegenerate();} catch (e) {alert(e.stack);}