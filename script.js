function findCentroid(vertices) {
    let x = 0, y = 0, area = 0;
    const numPoints = vertices.length;
    const found = [];
    for (let i = 0; i < numPoints; i++) {
        const [x1, y1] = vertices[i];
        const [x2, y2] = vertices[(i + 1) % numPoints];

        const crossProduct = x1 * y2 - x2 * y1;
        area += crossProduct;
        x += (x1 + x2) * crossProduct;
        y += (y1 + y2) * crossProduct;
    }

    area /= 2;
    x /= (6 * area);
    y /= (6 * area);
    if (area == 0) {return false;}
    return { x: x, y: y };
}
function order(vertices) {
  const center = vertices.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  center[0] /= vertices.length;
  center[1] /= vertices.length;
  vertices.sort(([x1, y1], [x2, y2]) => {
    const angle1 = Math.atan2(y1 - center[1], x1 - center[0]);
    const angle2 = Math.atan2(y2 - center[1], x2 - center[0]);
    return angle1 - angle2;
  });
  return vertices;
}
function includes(arr,el) {
  let c = true;
  for (const i of arr) {
    if (el.length != i.length) continue;
    c = true;
    for (let j = 0;j<i.length;j++) {
      if (el[j] != i[j]) {c=false;break;}
    }
    if (c) return true;
  } return false;
}
includes([[1,2],[2,3]],[1,2]);
let f_center = [];
let edges = [];
let f_vs = [];
let f_bordering_fs = [];
let f_bordering_es = [];
let e_bordering_fs = [];
let vs_pos_e = [];
let vs_e = [];
let grid_f = [];
let border_fs = [];
let f_f_e = [];
let graph = [];
let gridPartition = 0;
const allPoints = [];
for (let i = 0;i<POINTS;i++) allPoints.push(i);
let voronoi;
var diagram;
function generateVoronoi() {
  voronoi = new Voronoi();
  if (diagram) {diagram = {}}
  f_center = [];
  edges = [];
  f_vs = [];
  f_bordering_fs = [];
  f_f_e = Array.from({length:POINTS},()=>[]);
  f_bordering_es = [];
  f_bordering_vs = [];
  e_bordering_fs = [];
  border_fs = [new Set(),new Set(),new Set(),new Set()];
  graph = Array.from({length:POINTS});
  vs_pos_e = {};
  vs_e = [];
  const sampler = mySampler(Math.sqrt(WIDTH*HEIGHT)/15);
  for (let i = 0;i<POINTS;i++) {
    f_center.push(sampler());
  }
  const bbox = {xl: BUFFER, xr: WIDTH-BUFFER, yt: BUFFER, yb: HEIGHT-BUFFER};
  f_vs = [];
  for (let relax = 0;relax<RELAXES;relax++) {
    f_vs = [];
    diagram = voronoi.compute(f_center,bbox);
    for (const j of f_center) {
      cell = diagram.cells[j.voronoiId];
      if (cell.halfedges.length == 0) continue;
      const currentPoints = [];
      for (const f of cell.halfedges) {
        if (!(currentPoints.includes([f.edge.va.x,f.edge.va.y]))) {
          currentPoints.push([f.edge.va.x,f.edge.va.y]);
        }
        if (!(currentPoints.includes([f.edge.vb.x,f.edge.vb.y]))) {
          currentPoints.push([f.edge.vb.x,f.edge.vb.y]);
        }
      }
      order(currentPoints);
      f_vs.push(currentPoints);
    }
    voronoi.recycle(diagram);
      const oldPoints = [];
      let i = 0;
      for (const point of f_center) {oldPoints[point.voronoiId] = i++;}
      for (let j = 0;j<f_vs.length;j++) {
        const old = f_center[oldPoints[j]];
        f_center[oldPoints[j]] = findCentroid(f_vs[j]);
        if (!f_center[oldPoints[j]]) {
          console.log("reverted");
          f_center[oldPoints[j]] = old;
        }
      }
  }
  f_vs = [];
  diagram = voronoi.compute(f_center,bbox);
  let vertexCounter = 0;
  for (const j of f_center) {
    i = j.voronoiId;
    f_bordering_fs[i] = [];
    cell = diagram.cells[i];
    if (!f_bordering_es[i]) {f_bordering_es[i] = [];}
    if (cell.halfedges.length == 0) continue;
    const currentPoints = [];
    for (const f of cell.halfedges) {
      if (!f.edge.va.index) {
        f.edge.va.index = vertexCounter++;
        vs_pos_e[[f.edge.va.x,f.edge.va.y]] = {};
        vs_e[f.edge.va.index] = {};
      }
      if (!f.edge.vb.index) {
        f.edge.vb.index = vertexCounter++;
        vs_pos_e[[f.edge.vb.x,f.edge.vb.y]] = {};
        vs_e[f.edge.vb.index] = {};
      }
      if (!(includes(currentPoints,[f.edge.va.x,f.edge.va.y]))) {
        currentPoints.push([f.edge.va.x,f.edge.va.y]);
      }
      if (!(includes(currentPoints,[f.edge.vb.x,f.edge.vb.y]))) {
        currentPoints.push([f.edge.vb.x,f.edge.vb.y]);
      }
      f_bordering_es[i].push(f.edge);
      const t = f.edge.lSite.voronoiId==i?f.edge.rSite?.voronoiId:f.edge.lSite.voronoiId;
      if (t !== undefined) f_bordering_fs[i].push(t);
      if (f.edge.added === undefined) {
        f.edge.added = edges.length;
        edges.push(f.edge);
		const ax = f.edge.va.x, ay = f.edge.va.y, bx = f.edge.vb.x, by = f.edge.vb.y;
		if (f.edge.lSite == null || f.edge.rSite == null) {
			if (Math.abs(ax - bx) < 1e-9) {
				border_fs[1 + 2*(bx<WIDTH/2)].add((f.edge.lSite || f.edge.rSite).voronoiId);
			} else if (Math.abs(ay - by) < 1e-9) {
				border_fs[2*(by>HEIGHT/2)].add((f.edge.lSite || f.edge.rSite).voronoiId);
			} else {
				console.log(f.edge);
			}
		} else {
			f_f_e[f.edge.lSite.voronoiId][f.edge.rSite.voronoiId] = f.edge;
			f_f_e[f.edge.rSite.voronoiId][f.edge.lSite.voronoiId] = f.edge;
		}
        vs_pos_e[[bx,by]][[ax,ay]] = f.edge;
        vs_pos_e[[ax,ay]][[bx,by]] = f.edge;
		vs_e[f.edge.va.index][f.edge.vb.index] = f.edge;
        vs_e[f.edge.vb.index][f.edge.va.index] = f.edge;
      }
    }
    order(currentPoints);
    f_vs[i] = currentPoints;
  }

  // for (let i = 0;i < POINTS;i++) {
  //   f_center[i] = [f_center[i].x,f_center[i].y];
  // }
  f_center.sort((a,b)=>a.voronoiId-b.voronoiId);
  gridPartition = 0;
  for (const cell of f_vs) {
	let lx = WIDTH, ly = HEIGHT, hx = 0, hy = 0;
	for (const v of cell) {
		lx = Math.min(lx,v[0]);
		hx = Math.max(hx,v[0]);
		ly = Math.min(ly,v[1]);
		hy = Math.max(hy,v[1]);
	}
	if (Math.max(hy-ly,hx-lx)/2 > gridPartition) {
		gridPartition = Math.ceil(Math.max(hy-ly,hx-lx)/2);
	}

  }
  console.log(gridPartition);
  grid_f = [];
  for (let i = 0;i <= HEIGHT;i += gridPartition) {
	grid_f.push([]);
	for (let j = 0;j <= WIDTH;j += gridPartition) {
	  grid_f[Math.floor(i/gridPartition)].push([]);
	}
  }
  for (const cell of f_center) {
	grid_f[Math.floor(cell.y/gridPartition)][Math.floor(cell.x/gridPartition)].push(cell.voronoiId);
  }
}
function position_f(x,y) {
	const gridX = Math.floor(x/gridPartition), gridY = Math.floor(y/gridPartition);
    let minDist = WIDTH*WIDTH+HEIGHT*HEIGHT;
	let final = 0;
    for (let i = -1;i<2;i++) {
        for (let j = -1;j<2;j++) {
            try {
            for (const k of grid_f[gridY+i][gridX+j]) {
                const dist = (f_center[k].x-x)**2 + (f_center[k].y-y)**2;
                if (dist < minDist) {minDist = dist;final = k;}
            }} catch (e) {
            }
        }
    }
	return final;
}