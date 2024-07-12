function assignMoistures() {
	f_moisture = [];
	let f_moisture2 = Array.from({length:POINTS});
	f_moisture2.fill(0);
	const sides = WIND_DIRECTIONS.length;
	for (let i = 0;i < POINTS;i++) {
		for (const j of f_bordering_fs[i]) {
			if (f_elevation[j] <= SEA_LEVEL) {f_moisture2[i] += 0.3;break;}
		}
	}
	if (WIND_DIRECTIONS.includes(0)) {
		const selection = 0.04*HEIGHT/sides;
		var frontier = f_center.filter(function(i) {
			return i.y < selection && i.x > 0.1*WIDTH && i.x < 0.9*WIDTH;
		});
		frontier.map(function(i){
			var x = i.x, y = i.y
			var precipitation = PRECIPITATION/sides;
			while (y < HEIGHT) {
				y += 10;
				x += random() * 20 - 10;
				var nearest = position_f(x,y);
				var height = f_elevation[nearest]/100;
				if (height > SEA_LEVEL/100 && precipitation > 0) {
					if (height < 0.8) {
						var rain = random() * (height);
						f_moisture2[nearest] += rain;
						precipitation -= rain;
					} else {
						f_moisture2[nearest] += precipitation;
						precipitation -= precipitation;
					}
				} else if (height <= SEA_LEVEL/100) {precipitation += 0.5;}
			}
		});
	}
	if (WIND_DIRECTIONS.includes(1)) {
		const selection = WIDTH-0.04*WIDTH/sides;
		var frontier = f_center.filter(function(i) {
			return i.x > selection && i.y > 0.1*HEIGHT && i.y < 0.9*HEIGHT;
		});
		frontier.map(function(i){
			var x = i.x, y = i.y
			var precipitation = PRECIPITATION/sides;
			while (x > 0) {
				x -= 10;
				y += random() * 20 - 10;
				var nearest = position_f(x,y);
				var height = f_elevation[nearest]/100;
				if (height > SEA_LEVEL/100 && precipitation > 0) {
					if (height < 0.8) {
						var rain = random() * (height);
						f_moisture2[nearest] += rain;
						precipitation -= rain;
					} else {
						f_moisture2[nearest] += precipitation;
						precipitation -= precipitation;
					}
				} else if (height <= SEA_LEVEL/100) {precipitation += 0.5;}
			}
		});
	}
	if (WIND_DIRECTIONS.includes(2)) {
		const selection = HEIGHT-0.04*HEIGHT/sides;
		var frontier = f_center.filter(function(i) {
			return i.y > selection && i.x > 0.1*WIDTH && i.x < 0.9*WIDTH;
		});
		frontier.map(function(i){
			var x = i.x, y = i.y
			var precipitation = PRECIPITATION/sides;
			while (y > 0) {
				y -= 10;
				x += random() * 20 - 10;
				var nearest = position_f(x,y);
				var height = f_elevation[nearest]/100;
				if (height > SEA_LEVEL/100 && precipitation > 0) {
					if (height < 0.8) {
						var rain = random() * (height);
						f_moisture2[nearest] += rain;
						precipitation -= rain;
					} else {
						f_moisture2[nearest] += precipitation;
						precipitation -= precipitation;
					}
				} else if (height <= SEA_LEVEL/100) {precipitation += 0.5;}
			}
		});
	}
	if (WIND_DIRECTIONS.includes(3)) {
		const selection = 0.04*WIDTH/sides;
		var frontier = f_center.filter(function(i) {
			return i.x < selection && i.y > 0.1*HEIGHT && i.y < 0.9*HEIGHT;
		});
		frontier.map(function(i){
			var x = i.x, y = i.y
			var precipitation = PRECIPITATION/sides;
			while (x < WIDTH) {
				x += 10;
				y += random() * 20 - 10;
				var nearest = position_f(x,y);
				var height = f_elevation[nearest]/100;
				if (height > SEA_LEVEL/100 && precipitation > 0) {
					if (height < 0.8) {
						var rain = random() * (height);
						f_moisture2[nearest] += rain;
						precipitation -= rain;
					} else {
						f_moisture2[nearest] += precipitation;
						precipitation -= precipitation;
					}
				} else if (height <= SEA_LEVEL/100) {precipitation += 0.5;}
			}
		});
	}
	for (let _ = 0;_<1;_++) {
		maxMoisture = 0;
		for (let i = 0;i<POINTS;i++) {
			f_moisture[i] = f_moisture2[i];
			for (const j of f_bordering_fs[i]) {
				f_moisture[i] += f_moisture2[j];
			}
			f_moisture[i] /= f_bordering_fs[i].length + 1;
			maxMoisture = Math.max(f_moisture[i],maxMoisture);
		}
		if (_ != 0) f_moisture2 = f_moisture;
	}
}