function hslToRgb(h, s, l) {
	let r, g, b;
	if (s === 0) {
	  r = g = b = l;
	} else {
	  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	  const p = 2 * l - q;
	  r = hueToRgb(p, q, h + 1/3);
	  g = hueToRgb(p, q, h);
	  b = hueToRgb(p, q, h - 1/3);
	}
	return [Math.round(r * 255), Math.round(g * 255), Math. round(b * 255)];
  }
function hueToRgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 1/2) return q;
	if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	return p;
}
function colorChannelMixer(colorChannelA, colorChannelB, amountToMix){
    var channelA = colorChannelA*amountToMix;
    var channelB = colorChannelB*(1-amountToMix);
    return parseInt(channelA+channelB);
}
function blendColors(rgbB, rgbA, amountToMix){
    var r = colorChannelMixer(rgbA[0],rgbB[0],amountToMix);
    var g = colorChannelMixer(rgbA[1],rgbB[1],amountToMix);
    var b = colorChannelMixer(rgbA[2],rgbB[2],amountToMix);
    return [r,g,b];
}