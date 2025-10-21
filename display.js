canvas.height = canvas.clientHeight;
canvas.width = canvas.clientWidth;
const ctx = canvas.getContext("2d");
let s_lines = [];
let ZOOM = 1;
let TRANSLATE_X = 0;
let TRANSLATE_Y = 0;
let borderColor = "#eeeeee";
canvas.addEventListener("wheel",handleScroll);
function handleScroll(event) {
    if (event.deltaY < 0) {
        ZOOM = Math.min(10,ZOOM*1.1);
    } else {
        ZOOM = Math.max(1, ZOOM*0.9);
    }
    display();
}
let dragging = false;
let startDragX = -1;
let startDragY = -1;
canvas.addEventListener("mousedown",function(e){
	dragging = true;
	startDragX = e.x, startDragY = e.y;
});
canvas.addEventListener("mousemove",function(e) {
	if (dragging) {
		TRANSLATE_X += (e.x-startDragX)/ZOOM;
		TRANSLATE_Y += (e.y-startDragY)/ZOOM;
		startDragX = e.x, startDragY = e.y;
		display();
	} else {
		const i = position_f(...transformPointReverse(...getMousePos(canvas,e)));
		displayCellInfo(i);
	}
});
function stopDragging(e) {
	dragging = false;
}
canvas.addEventListener("mouseup",stopDragging);
canvas.addEventListener("mouseleave",stopDragging);
window.addEventListener("keydown",function(e) {
	if (e.key == " ") {
		TRANSLATE_X = 0;
		TRANSLATE_Y = 0;
		ZOOM = 1;
		display();
	}
	else if (e.keyCode == 78 && e.altKey) {
		DEBUG_DISPLAY = !DEBUG_DISPLAY;
		display();
	}
});
function transformPoint(x,y) {
	let finalX = x,finalY = y;
	finalX += TRANSLATE_X;
	finalY += TRANSLATE_Y;
	finalX = (finalX-canvas.width/2)*ZOOM+canvas.width/2;
	finalY = (finalY-canvas.height/2)*ZOOM+canvas.height/2;
	return [finalX,finalY];
}
function transformPointReverse(x,y) {
	let finalX = x,finalY = y;
	finalX = (finalX-canvas.width/2)/ZOOM+canvas.width/2
	finalY = (finalY-canvas.height/2)/ZOOM+canvas.height/2;
	return [finalX-TRANSLATE_X,finalY-TRANSLATE_Y];
}
function resize() {
  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;
  display();
}
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;
    return [
        (evt.clientX - rect.left) * scaleX,
        (evt.clientY - rect.top) * scaleY
    ]
}
let SelectedCell = -1;
function clearDisplay() {
  SelectedCell = -1;
}
function displayMode(mode) {
	DISPLAY_MODE = mode;
	display();
}
const clampColor = (x)=>Math.max(0,Math.min(x,255));
const clamp = (x)=>Math.max(0,Math.min(x,1));
const biomeColors = {
	// Features
	"OCEAN": "#44447a",
	"COAST": "#33335a",
	"LAKESHORE": "#225588",
	"LAKE": "#336699",
	"RIVER": "#225588",
	"MARSH": "#2f6666",
	"ICE": "#99ffff",
	"BEACH": "#a09077",
	"ROAD1": "#442211",
	"ROAD2": "#553322",
	"ROAD3": "#664433",
	"BRIDGE": "#686860",
	"LAVA": "#cc3333",

	// Terrain
	"SNOW": "#ffffff",
	"TUNDRA": "#bbbbaa",
	"BARE": "#888888",
	"SCORCHED": "#555555",
	"TAIGA": "#99aa77",
	"SHRUBLAND": "#889977",
	"TEMPERATE_DESERT": "#c9d29b",
	"TEMPERATE_RAIN_FOREST": "#448855",
	"TEMPERATE_DECIDUOUS_FOREST": "#679459",
	"GRASSLAND": "#88aa55",
	"SUBTROPICAL_DESERT": "#d2b98b",
	"TROPICAL_RAIN_FOREST": "#337755",
	"TROPICAL_SEASONAL_FOREST": "#559944"
};
const biome_name = {};
for (const biome in biomeColors) {
	let final = [];
	for (const part of biome.split("_")) {
		final.push(part[0] + part.slice(1).toLowerCase());
	}
	biome_name[biome] = final.join(" ");
}
function displayCellInfo(i) {
	let final = [];
	if (DISPLAY_MODE == "state") {
		final.push("Name: "+state_name[f_state[i]]);
		final.push("Race: "+nameBases[state_namebase[f_state[i]]].name);
		final.push("Type: "+state_type[f_state[i]]);
		DEBUG_DISPLAY && final.push("Cost gotten: "+Math.round(f_cost[i]));
	}
	else if (DISPLAY_MODE == "biome") {
		final.push("Biome: "+biome_name[f_biome[i]]);
	}
	else if (DISPLAY_MODE == "elevation") {
		final.push("Height: "+Math.round(f_elevation[i]));
	}
	else if (DISPLAY_MODE == "moisture") {
		final.push("Moisture: "+Math.floor(f_moisture[i]*100+0.5)/100);
	}
	document.getElementById("footer").innerHTML = final.join("<br>");
}
function getColor(i) {
    if (i == SelectedCell) {return "#ff0000"}
	if (f_elevation[i] <= SEA_LEVEL && (DISPLAY_MODE!="state"||!DISPLAY_WATER)) {
		return biomeColors[f_biome[i]]
	}
	if (DISPLAY_MODE == "elevation" || DISPLAY_MODE == "moisture" || DISPLAY_MODE == "suitability") {
		let r=g=b=80;
		const c = f_elevation[i]*1.75;
		r += c;
		g += c;
		b += c;
		if (DISPLAY_MODE == "moisture") {
			r -= r*0.7*clamp(f_moisture[i]);
			g -= g*0.7*clamp(f_moisture[i]);
		}
		if (DISPLAY_MODE == "suitability") {
			r -= r*0.7*clamp(f_suitability[i]/70);
			b -= b*0.7*clamp(f_suitability[i]/70);
		}
		return `rgb(${clampColor(r)},${clampColor(g)},${clampColor(b)})`;
	}
	if (DISPLAY_MODE == 'biome') {
		return biomeColors[f_biome[i]];
	}
	if (DISPLAY_MODE == 'state') {
		if (state_capital.includes(i)) {
			return "#ff0000";
		}
		if (DISPLAY_WATER && f_elevation[i] <= SEA_LEVEL) {
			if (!f_state[i]) {
				return biomeColors[f_biome[i]];
			}
			const [r,g,b] = blendColors(f_body[i]==0?[0x44,0x44,0x7a]:[0x33,0x66,0x99],state_color[f_state[i]],0.3);
			return `rgb(${clampColor(r)},${clampColor(g)},${clampColor(b)})`;
		}
		let r=g=b=80;
		const c = f_elevation[i]*1.75;
		r += c;
		g += c;
		b += c;
		if (f_state[i]) {
			[r,g,b] = blendColors([r,g,b],state_color[f_state[i]],0.3);
		}
		return `rgb(${clampColor(r)},${clampColor(g)},${clampColor(b)})`;
	}
}
function drawRoughLine(ctx, startX, startY, endX, endY, amplitude, minLineLength,randFunction) {
    function midPoint(x1, y1, x2, y2) {
        return [(x1 + x2) / 2, (y1 + y2) / 2];
    }

    function randFunctionOffset(amplitude,randFunction) {
        return (randFunction() - 0.5)*2 * amplitude;
    }

    function drawRoughSegment(x1, y1, x2, y2, amplitude, minLineLength, points, randFunction) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = dx * dx + dy * dy;

        if (dist < minLineLength*minLineLength) {
            return;
        }

        const [mx, my] = midPoint(x1, y1, x2, y2);
		const slope = -dx / dy;
        const offsetMx = mx + randFunctionOffset(amplitude,randFunction)*dy/2;
        const offsetMy = my + randFunctionOffset(amplitude,randFunction)*dx/2;

        return [offsetMx,offsetMy];
    }

    let points = [[startX, startY],[endX,endY]];
	let changed = true;
	while (changed) {
		changed = false;
		for (let i = points.length-1;i > 0;i--) {
			const result = drawRoughSegment(...points[i], ...points[i-1], amplitude, minLineLength, points,randFunction);
			if (result) {
				changed=true;
				points.splice(i, 0, result);
				i--;
			}
		}
	}
    return points;
}
function outOfDisplay(i) {
	const {x,y} = f_center[i];
	return (x < minX - gridPartition || x > maxX + gridPartition || y < minY - gridPartition || y > maxY + gridPartition);
}
let minX,minY,maxX,maxY;
function display() {
  ctx.fillStyle = '#44447a';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'black';
  let j = 0;
  [minX,minY] = transformPointReverse(0,0);
  [maxX,maxY] = transformPointReverse(canvas.width,canvas.height);
  for (const cell of f_vs) {
    if ((f_body[j] == 0 && SelectedCell != j && (DISPLAY_MODE!="state"||!DISPLAY_WATER)) || outOfDisplay(j)) {j++;continue;}
    ctx.fillStyle = getColor(j);
    ctx.strokeStyle = CELL_BORDERS?borderColor:ctx.fillStyle;
	ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const points = [];
    for (let i = 1; i < cell.length; i++) {
      let randFunction = seededRandom((vs_pos_e[cell[i-1]][cell[i]]||{added:0}).added);
      if (!ROUGH_LINES) {
        points.push([cell[i][0], cell[i][1]]);
      } else if (cell[i-1] < cell[i]) {
        points.push(...drawRoughLine(ctx,cell[i][0], cell[i][1],cell[i-1][0],cell[i-1][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction).reverse())
      } else {
        points.push(...drawRoughLine(ctx,cell[i-1][0],cell[i-1][1],cell[i][0], cell[i][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction))
      }
    }
    let randFunction = seededRandom((vs_pos_e[cell[cell.length-1]][cell[0]]||{added:0}).added);
    if (!ROUGH_LINES) {
        points.push([cell[0][0], cell[0][1]]);
    } else if (cell[cell.length-1] < cell[0]) {
      points.push(...drawRoughLine(ctx,cell[0][0], cell[0][1],cell[cell.length-1][0],cell[cell.length-1][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction).reverse())
    } else {
      points.push(...drawRoughLine(ctx,cell[cell.length-1][0],cell[cell.length-1][1],cell[0][0], cell[0][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction))
    }
    ctx.moveTo(...transformPoint(...points[0]));
    for (const point of points) {
      ctx.lineTo(...transformPoint(...point));
    }
    ctx.fill();
	ctx.closePath();
    ctx.stroke();
    j++;
  }
  ctx.strokeStyle = "#225588";
  ctx.lineWidth = ZOOM;
  ctx.lineCap = "round";
  const needToDraw = new Set();
  for (let i = 0; i < POINTS; i++) {
	if (f_flow_f[i] == i || f_flow[i] < 3 || (outOfDisplay(i) && outOfDisplay(f_flow_f[i]))) {continue;}
	ctx.beginPath()
	ctx.moveTo(...transformPoint(f_center[i].x,f_center[i].y));
	const points = drawRoughLine(ctx,f_center[i].x,f_center[i].y,f_center[f_flow_f[i]].x,f_center[f_flow_f[i]].y,0.5,MIN_LINES_LENGTH/ZOOM,seededRandom(i));
	for (let j = 1;j<points.length;j++) {
		ctx.lineTo(...transformPoint(...points[j]));
	}
	// const control = seededRandom(i)() < 0.5?f_f_e[i][f_flow_f[i]].va:f_f_e[i][f_flow_f[i]].vb; // Curves
	// ctx.quadraticCurveTo(...transformPoint(control.x,control.y),...transformPoint(f_center[f_flow_f[i]].x,f_center[f_flow_f[i]].y)); // Curves
	// ctx.lineTo(...transformPoint(f_center[f_flow_f[i]].x,f_center[f_flow_f[i]].y)); // Lines
	for (const j of f_bordering_fs[i]) {
		if (f_elevation[j] <= SEA_LEVEL) {
			needToDraw.add(j);
		}
	}
	ctx.stroke();
  }
  for (const j of needToDraw) {
	cell = f_vs[j];
    ctx.fillStyle = getColor(j);
    ctx.strokeStyle = (CELL_BORDERS&&f_body[j] > 0)?borderColor:ctx.fillStyle;
    ctx.lineWidth = (f_body[j] === 0)?0.01:1;
    ctx.lineCap = "butt";
    ctx.beginPath();
    const points = [];
    for (let i = 1; i < cell.length; i++) {
      let randFunction = seededRandom((vs_pos_e[cell[i-1]][cell[i]]||{added:0}).added);
      if (!ROUGH_LINES) {
        points.push([cell[i][0], cell[i][1]]);
      } else if (cell[i-1] < cell[i]) {
        points.push(...drawRoughLine(ctx,cell[i][0], cell[i][1],cell[i-1][0],cell[i-1][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction).reverse())
      } else {
        points.push(...drawRoughLine(ctx,cell[i-1][0],cell[i-1][1],cell[i][0], cell[i][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction))
      }
    }
    let randFunction = seededRandom((vs_pos_e[cell[cell.length-1]][cell[0]]||{added:0}).added);
    if (!ROUGH_LINES) {
        points.push([cell[0][0], cell[0][1]]);
    } else if (cell[cell.length-1] < cell[0]) {
      points.push(...drawRoughLine(ctx,cell[0][0], cell[0][1],cell[cell.length-1][0],cell[cell.length-1][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction).reverse())
    } else {
      points.push(...drawRoughLine(ctx,cell[cell.length-1][0],cell[cell.length-1][1],cell[0][0], cell[0][1],0.5,MIN_LINES_LENGTH/ZOOM,randFunction))
    }
    ctx.moveTo(...transformPoint(...points[0]));
    for (const point of points) {
      ctx.lineTo(...transformPoint(...point));
    }
    ctx.fill();
	ctx.closePath();
    ctx.stroke();
  }
}
window.addEventListener("resize", resize);