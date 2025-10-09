const lim=(i)=>Math.min(100,Math.max(0,i));
function rand(min, max) {
	if (min === undefined && max === undefined) return random();
	if (max === undefined) {
	  max = min;
	  min = 0;
	}
	const r = random();
	return Math.floor(r * (max - min + 1)) + min;
}
function P(probability) {
	if (probability >= 1) return true;
	if (probability <= 0) return false;
	return random() < probability;
}
function getNumberInRange(r) {
	if (!isNaN(+r)) return ~~r + +P(r - ~~r);
	const sign = r[0] === "-" ? -1 : 1;
	if (isNaN(+r[0])) r = r.slice(1);
	const range = r.includes("-") ? r.split("-") : null;
	const count = rand(range[0] * sign, +range[1]);
	return count;
}
function getPointInRange(range,max) {
	return getNumberInRange(range)/100*max;
}
function getBlobPower(cells) {
    const blobPowerMap = {
		1000: 0.93,
		2000: 0.95,
		5000: 0.97,
		10000: 0.98,
		20000: 0.99,
		30000: 0.991,
		40000: 0.993,
		50000: 0.994,
		60000: 0.995,
		70000: 0.9955,
		80000: 0.996,
		90000: 0.9964,
    	100000: 0.9973
    };
    return blobPowerMap[cells] || 0.98;
}
function getLinePower() {
    const linePowerMap = {
      1000: 0.75,
      2000: 0.77,
      5000: 0.79,
      10000: 0.81,
      20000: 0.82,
      30000: 0.83,
      40000: 0.84,
      50000: 0.86,
      60000: 0.87,
      70000: 0.88,
      80000: 0.91,
      90000: 0.92,
      100000: 0.93
    };

    return linePowerMap[POINTS] || 0.81;
  }
function addHill(count, height, rangeX, rangeY) {
  count = getNumberInRange(count);
  while (count > 0) {
	addOneHill();
	count--;
  }

  function addOneHill() {
	const change = new Uint8Array(f_elevation.length);
	let limit = 0;
	let start;
	let h = lim(getNumberInRange(height));

	do {
	  const x = getPointInRange(rangeX, WIDTH);
	  const y = getPointInRange(rangeY, HEIGHT);
	  start = position_f(x,y);
	  limit++;
	} while (f_elevation[start] + h > 90 && limit < 50);

	change[start] = h;
	const queue = [start];
	while (queue.length) {
	  const q = queue.shift();

	  for (const c of f_bordering_fs[q]) {
		if (change[c]) continue;
		change[c] = change[q] ** blobPower * (random() * 0.2 + 0.9);
		if (change[c] > 1) queue.push(c);
	  }
	}
	f_elevation = f_elevation.map((h, i) => lim(h + change[i]));
  }
};
function addPit(count, height, rangeX, rangeY) {
    count = getNumberInRange(count);
    while (count > 0) {
      addOnePit();
      count--;
    }

    function addOnePit() {
      const used = new Uint8Array(POINTS);
      let limit = 0,
        start;
      let h = lim(getNumberInRange(height));

      do {
        const x = getPointInRange(rangeX, WIDTH);
        const y = getPointInRange(rangeY, HEIGHT);
        start = position_f(x, y);
        limit++;
      } while (f_elevation[start] <= SEA_LEVEL && limit < 50);

      const queue = [start];
      while (queue.length) {
        const q = queue.shift();
        h = h ** blobPower * (random() * 0.2 + 0.9);
        if (h < 1) return;
		f_bordering_fs[q].forEach(function (c, i) {
          if (used[c]) return;
          f_elevation[c] = lim(f_elevation[c] - h * (random() * 0.2 + 0.9));
          used[c] = 1;
          queue.push(c);
        });
      }
    }
  };
function addRange(count, height, rangeX, rangeY, startCell, endCell) {
    count = getNumberInRange(count);
    while (count > 0) {
      addOneRange();
      count--;
    }

    function addOneRange() {
      const used = new Uint8Array(POINTS);
      let h = lim(getNumberInRange(height));

      if (rangeX && rangeY) {
        // find start and end points
        const startX = getPointInRange(rangeX, WIDTH);
        const startY = getPointInRange(rangeY, HEIGHT);

        let dist = 0,
          limit = 0,
          endX,
          endY;

        do {
          endX = random() * WIDTH * 0.8 + WIDTH * 0.1;
          endY = random() * HEIGHT * 0.7 + HEIGHT * 0.15;
          dist = Math.abs(endY - startY) + Math.abs(endX - startX);
          limit++;
        } while ((dist < WIDTH / 8 || dist > WIDTH / 3) && limit < 50);

        startCell = position_f(startX, startY);
        endCell = position_f(endX, endY);
      }

      let range = getRange(startCell, endCell);

      // get main ridge
      function getRange(cur, end) {
        const range = [cur];
        const p = f_center;
        used[cur] = 1;

        while (cur !== end) {
          let min = Infinity;
          f_bordering_fs[cur].forEach(function (e) {
            if (used[e]) return;
            let diff = (p[end].x - p[e].x) ** 2 + (p[end].y - p[e].y) ** 2;
            if (random() > 0.85) diff = diff / 2;
            if (diff < min) {
              min = diff;
              cur = e;
            }
          });
          if (min === Infinity) return range;
          range.push(cur);
          used[cur] = 1;
        }

        return range;
      }

      // add height to ridge and cells around
      let queue = range.slice(),
        i = 0;
      while (queue.length) {
        const frontier = queue.slice();
        (queue = []), i++;
        frontier.forEach(i => {
          f_elevation[i] = lim(f_elevation[i] + h * (random() * 0.3 + 0.85));
        });
        h = h ** linePower - 1;
        if (h < 2) break;
        frontier.forEach(f => {
          f_bordering_fs[f].forEach(i => {
            if (!used[i]) {
              queue.push(i);
              used[i] = 1;
            }
          });
        });
      }

      // generate prominences
      range.forEach((cur, d) => {
        if (d % 6 !== 0) return;
        for (let l = 0; l < i;l++) {
          const min = Array.from(f_bordering_fs[cur]).sort((a, b) => f_elevation[a] - f_elevation[b])[0]; // downhill cell
          f_elevation[min] = (f_elevation[cur] * 2 + f_elevation[min]) / 3;
          cur = min;
        }
      });
    }
  };
function addStrait(width, direction = "vertical") {
    // width = Math.min(getNumberInRange(width), grid.cellsX / 3);
	width = getNumberInRange(width);
    if (width < 1 && P(width)) return;
    const used = new Uint8Array(POINTS);
    const vert = direction === "vertical";
    const startX = vert ? Math.floor(random() * WIDTH * 0.4 + WIDTH * 0.3) : 5;
    const startY = vert ? 5 : Math.floor(random() * HEIGHT * 0.4 + HEIGHT * 0.3);
    const endX = vert
      ? Math.floor(WIDTH - startX - WIDTH * 0.1 + random() * WIDTH * 0.2)
      : WIDTH - 5;
    const endY = vert
      ? HEIGHT - 5
      : Math.floor(HEIGHT - startY - HEIGHT * 0.1 + random() * HEIGHT * 0.2);

    const start = position_f(startX, startY);
    const end = position_f(endX, endY);
    let range = getRange(start, end);
    const query = [];

    function getRange(cur, end) {
      const range = [];
      const p = f_center;

      while (cur !== end) {
        let min = Infinity;
        f_bordering_fs[cur].forEach(function (e) {
          let diff = (p[end].x - p[e].x) ** 2 + (p[end].y - p[e].y) ** 2;
          if (random() > 0.8) diff = diff / 2;
          if (diff < min) {
            min = diff;
            cur = e;
          }
        });
        range.push(cur);
      }

      return range;
    }

    const step = 0.1 / width;

    while (width > 0) {
      const exp = 0.9 - step * width;
      range.forEach(function (r) {
        f_bordering_fs[r].forEach(function (e) {
          if (used[e]) return;
          used[e] = 1;
          query.push(e);
          f_elevation[e] **= exp;
          if (f_elevation[e] > 100) f_elevation[e] = 5;
        });
      });
      range = query.slice();

      width--;
    }
};
function addTrough(count, height, rangeX, rangeY, startCell, endCell) {
    count = getNumberInRange(count);
    while (count > 0) {
      addOneTrough();
      count--;
    }

    function addOneTrough() {
      const used = new Uint8Array(POINTS);
      let h = lim(getNumberInRange(height));

      if (rangeX && rangeY) {
        // find start and end points
        let limit = 0,
          startX,
          startY,
          dist = 0,
          endX,
          endY;
        do {
          startX = getPointInRange(rangeX, WIDTH);
          startY = getPointInRange(rangeY, HEIGHT);
          startCell = position_f(startX, startY);
          limit++;
        } while (f_elevation[startCell] <= SEA_LEVEL && limit < 50);

        limit = 0;
        do {
          endX = random() * WIDTH * 0.8 + WIDTH * 0.1;
          endY = random() * HEIGHT * 0.7 + HEIGHT * 0.15;
          dist = Math.abs(endY - startY) + Math.abs(endX - startX);
          limit++;
        } while ((dist < WIDTH / 8 || dist > WIDTH / 2) && limit < 50);

        endCell = position_f(endX, endY);
      }
      let range = getRange(startCell, endCell);

      // get main ridge
      function getRange(cur, end) {
        const range = [cur];
        const p = f_center;
        used[cur] = 1;

        while (cur !== end) {
          let min = Infinity;
          f_bordering_fs[cur].forEach(function (e) {
            if (used[e]) return;
            let diff = (p[end].x - p[e].x) ** 2 + (p[end].y - p[e].y) ** 2;
            if (random() > 0.8) diff = diff / 2;
            if (diff < min) {
              min = diff;
              cur = e;
            }
          });
          if (min === Infinity) return range;
          range.push(cur);
          used[cur] = 1;
        }

        return range;
      }
      // add height to ridge and cells around
      let queue = range.slice(),
        i = 0;
      while (queue.length) {
        const frontier = queue.slice();
        (queue = []), i++;
        frontier.forEach(i => {
          f_elevation[i] = lim(f_elevation[i] - h * (random() * 0.3 + 0.85));
        });
        h = h ** linePower - 1;
        if (h < 2) break;
        frontier.forEach(f => {
          f_bordering_fs[f].forEach(i => {
            if (!used[i]) {
              queue.push(i);
              used[i] = 1;
            }
          });
        });
      }

      // generate prominences
      range.forEach((cur, d) => {
        if (d % 6 !== 0) return;
        for (let l = 0;l < i;l++) {
          const min = Array.from(f_bordering_fs[cur]).sort((a, b) => f_elevation[a] - f_elevation[b])[0]; // downhill cell
          f_elevation[min] = (f_elevation[cur] * 2 + f_elevation[min]) / 3;
          cur = min;
        }
      });
    }
};
function multiply(p) {
	f_elevation = f_elevation.map(i=>Math.round(i*p))
}
function mean(arr) {
	sum = 0;
	arr.forEach((i)=>sum+=i);
	return sum/arr.length;
}
function smooth(fr = 2, add = 0) {
    f_elevation = f_elevation.map((h, i) => {
      const a = [h];
      f_bordering_fs[i].forEach(c => a.push(f_elevation[c]));
      if (fr === 1) return mean(a) + add;
      return lim((h * (fr - 1) + mean(a) + add) / fr);
    });
};
function mask(power = 1) {
    const fr = power ? Math.abs(power) : 1;

    f_elevation = f_elevation.map((h, i) => {
      const {x, y} = f_center[i];
      const nx = (2 * x) / WIDTH - 1; // [-1, 1], 0 is center
      const ny = (2 * y) / HEIGHT - 1; // [-1, 1], 0 is center
      let distance = (1 - nx ** 2) * (1 - ny ** 2); // 1 is center, 0 is edge
      if (power < 0) distance = 1 - distance; // inverted, 0 is center, 1 is edge
      const masked = h * distance;
      return lim((h * (fr - 1) + masked) / fr);
    });
  };
let blobPower = 0;
let linePower = 0;
function generateHeightmap() {
	blobPower = getBlobPower(POINTS);
	linePower = getLinePower();
	f_elevation = Array.from({length:POINTS});
	f_elevation.fill(0);
	// console.time("hills");
	// console.time("hill");
	addHill("1", "80-85", "60-80", "40-60");
	// console.timeEnd("hill");
	addHill("1", "80-85", "20-30", "40-60");
	addHill("6-7", "15-30", "25-75", "15-85");
	multiply(0.6);
	addHill("8-10","5-10","15-85","20-80");
	// console.timeEnd("hills");
	addRange("1-2","30-60","5-15","25-75");
	addRange("1-2","30-60","80-95","25-75");
	addRange("0-3","30-60","80-90","20-80");
	addStrait("2","vertical");
	addStrait("1","vertical");
	smooth(3);
	addTrough("3-4","15-20","15-85","20-80");
	addTrough("3-4","5-10","45-55","45-55");
	addPit("3-4","10-20","15-85","20-80");
	mask(4);
}
function arrEqual(ar1,ar2) {
    for (let i = 0;i<ar1.length;i++) {
        if (ar1[i] != ar2[i]) return false;
    }
    return true;
}