function mySampler() {
  return function() {
    return {x:(random()*WIDTH),y:(random()*HEIGHT)};
  }
}
function seededRandom(seed) {
    let currentSeed = seed;
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    // Function to generate random number in [0,1)
    function nextRandom() {
        // LCG formula: X(n+1) = (a * X(n) + c) % m
        currentSeed = (a * currentSeed + c) % m;
        // Normalize to [0,1)
        return currentSeed / m;
    }
    return nextRandom;
}