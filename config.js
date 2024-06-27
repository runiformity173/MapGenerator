// Sizing
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientHeight;
const BUFFER = 0;
let POINTS = 10000;
let NOISE_SCALE = Math.max(WIDTH,HEIGHT)/10;
// Seeds
let ELEVATION_SEED = 1203 // + 8
let FEATURE_SEED = 1000;
Math.random = alea(FEATURE_SEED);
// Shaping
let RELAXES = 2;
let SEA_LEVEL = 0;
let TEMPERATURE_NORTH = 0.5;
let TEMPERATURE_SOUTH = 0.5;