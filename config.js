// Sizing
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientHeight;
const BUFFER = 0;
let POINTS = 10000;
let NOISE_SCALE = Math.max(WIDTH,HEIGHT)/10;
// Seeds
let POINTS_SEED = 0;
let ELEVATION_SEED = Math.floor(Math.random()*1000000);
let FEATURE_SEED = Math.floor(Math.random()*1000000);
let STATE_SEED = Math.floor(Math.random()*1000000);
// Shaping
let RELAXES = 2;
let SEA_LEVEL = 20;
let TEMPERATURE_NORTH = 0;
let TEMPERATURE_SOUTH = 1.2;
let PRECIPITATION = 11.0;
let WIND_DIRECTIONS = ["random"];
// States
let STATE_NUMBER = 7;
// Display
let DISPLAY_MODE = "state";
let DISPLAY_WATER = false;
let ROUGH_LINES = false;
let CELL_BORDERS = false;
let MIN_LINES_LENGTH = 5;
let DEBUG_DISPLAY = false;