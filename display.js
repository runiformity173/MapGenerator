canvas.height = canvas.clientHeight;
canvas.width = canvas.clientWidth;
const ctx = canvas.getContext("2d");
let s_lines = [];
function resize() {
  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;
  display();
}
function getColor(i) {
  let r=g=b=80;
  if (f_elevation[i] <= 0) {
    return "#336699";
  } else if (f_coast[i]){
    return "#a09077";
  } 
  else {
    const c = f_elevation[i]*100;
    r += c;
    g += c;
    b += c;
  }
  return `rgb(${r},${g},${b})`;
}
function drawRoughLine(ctx, startX, startY, endX, endY, amplitude, minLineLength,random) {
    function midPoint(x1, y1, x2, y2) {
        return [(x1 + x2) / 2, (y1 + y2) / 2];
    }

    function randomOffset(amplitude,random) {
        return (random() - 0.5)*2 * amplitude;
    }

    function drawRoughSegment(x1, y1, x2, y2, amplitude, minLineLength, points) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = dx * dx + dy * dy;

        if (dist < minLineLength*minLineLength) {
            points.push([x2, y2]);
            return;
        }

        const [mx, my] = midPoint(x1, y1, x2, y2);
        const offsetMx = mx + randomOffset(amplitude,random)*dx;
        const offsetMy = my + randomOffset(amplitude,random)*dy;

        drawRoughSegment(x1, y1, offsetMx, offsetMy, amplitude, minLineLength, points,random);
        drawRoughSegment(offsetMx, offsetMy, x2, y2, amplitude, minLineLength, points,random);
    }

    let points = [[startX, startY]];
    drawRoughSegment(startX, startY, endX, endY, amplitude, minLineLength, points,random);
    for (let i = 1; i < points.length; i++) {
    }
    return points;
}
function display() {
  ctx.fillStyle = '#44447a';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'black';
  let j = 0;
  for (const cell of f_vs) {
    if (f_body[j] == 0) {j++;continue;}
    ctx.fillStyle = getColor(j);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.strokeWidth = 1;
    ctx.beginPath();
    const points = [];
    for (let i = 1; i < cell.length; i++) {
      let random = alea((vs_e[cell[i-1]][cell[i]]||{added:0}).added);
      if (cell[i-1] < cell[i]) {
        points.push(...drawRoughLine(ctx,cell[i][0], cell[i][1],cell[i-1][0],cell[i-1][1],0.5,5,random).reverse())
      } else {
        points.push(...drawRoughLine(ctx,cell[i-1][0],cell[i-1][1],cell[i][0], cell[i][1],0.5,5,random))
      }
    }
    let random = alea((vs_e[cell[cell.length-1]][cell[0]]||{added:0}).added);
    if (cell[cell.length-1] < cell[0]) {
      points.push(...drawRoughLine(ctx,cell[0][0], cell[0][1],cell[cell.length-1][0],cell[cell.length-1][1],0.5,5,random).reverse())
    } else {
      points.push(...drawRoughLine(ctx,cell[cell.length-1][0],cell[cell.length-1][1],cell[0][0], cell[0][1],0.5,5,random))
    }
    ctx.moveTo(...points[0]);
    for (const point of points) {
      ctx.lineTo(...point);
    }
    ctx.fill();
    ctx.stroke();
    j++;
  }
}
window.addEventListener("resize", resize);
const steps = [[]];
function stepThrough() {
  let i = 0;
  let k = setInterval(function() {
    if (i == steps.length-1) {clearInterval(k);return;}
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(...steps[i]);
    ctx.lineTo(...steps[i+1]);
    ctx.stroke();
    i += 1;
  },1000);
}