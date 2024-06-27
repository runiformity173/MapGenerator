function mySampler() {
  return function() {
    return {x:(Math.random()*WIDTH),y:(Math.random()*HEIGHT)};
  }
}