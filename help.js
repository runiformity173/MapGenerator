const helpText = ``;
window.portfolioText = `<h1>Instructions</h1>
Click and drag to move the map around.<br>
Scroll up or down to zoom in or out.<br>
Hover over a cell to see information about it depending on the current view mode.<br>
<h3>View Settings</h3>
Use the selector to switch between viewing States, Biomes, Elevation, and Moisture.<br>
When <strong>View State Waterway Control</strong> is checked, bodies of water will also be shown as the color of the state that controls them.<br>
When <strong>Rough Edges</strong> is checked, the edges of every cell look more natural instead of being straight lines. Turn this off to see the true cells or if it is causing performance issues.<br>
When <strong>Cell Borders</strong> is checked, a border is added to make individual cells easier to differentiate.<br>
<h3>Regenerating</h3>
To get an entirely new map, press <strong>Regenerate All</strong>.<br>
To keep the shape but regenerate the biomes, press <strong>Regenerate Moisture</strong>. Since states choose habitable places based off of biomes and moisture, this will completely change the states too!<br>
To regenerate only the countries, press <strong>Regenerate States</strong>.<br><br>
`;
const help = document.createElement("div");
const overlay = document.createElement("div");
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.opacity = 0.0;
overlay.style.transition = "opacity 0.2s ease-out";
overlay.style.backgroundColor = "#212529";
overlay.style.cursor = "pointer";
overlay.style.color = "#ffffff";
overlay.style.textAlign = "center";
overlay.style.display = "none";
overlay.style.position = "absolute";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.zIndex = 100000000;
overlay.innerHTML = "<p style='font-family:verdana;font-size:16px;line-height: normal;'>"+helpText.replaceAll("\n","<br>")+"</p>"
// overlay.firstElementChild.style.opacity = "1.0";
let helpIsDisplayed = false;
document.onkeyup = function(e) {
  if (e.keyCode == 72 && e.altKey) {
  
    if (!helpIsDisplayed) {
      overlay.style.opacity = 0.0;
      overlay.style.display = "block";
      setTimeout(function(){overlay.style.opacity = 1.0;},0);
    } else {
      overlay.style.opacity = 0.0;
      setTimeout(function(){overlay.style.display = "none";},200);
    }
    helpIsDisplayed = !helpIsDisplayed;
  }
};
overlay.addEventListener("click",function(){
  overlay.style.opacity = 0.0;
  setTimeout(function(){overlay.style.display = "none";},200);
  helpIsDisplayed = false;
})
help.id="help";
help.style.backgroundColor = "#39332d";
help.style.cursor = "pointer";
help.style.borderRadius = "100px";
help.style.position = "absolute";
help.style.right = "10px";
help.style.top = "10px";
help.style.width = "50px";
help.style.height = "50px";
help.innerHTML = '<img src="/images/help.png" style="width:100%;height:100%;opacity:0.5;border-radius:100px;">';
help.addEventListener("click",function(){
  overlay.style.display = "block";
  overlay.style.transition = "opacity 0.2s ease-out";
  setTimeout(function(){overlay.style.opacity = 0.5;},0);
  helpIsDisplayed = true;
})
// document.body.appendChild(help);
window.addEventListener("load",function(){document.body.appendChild(overlay)});
if (window.portfolioText && window.location.hash == "#portfolio") {
  console.log("AYYYY");
  const container = document.createElement("div");
  const blur = document.createElement("div");
  try {document.getElementById("container").style.filter = "blur(2px)";}
  catch {}
  container.id = "portfolio-instructions-container";
  blur.id = "blur-screen-instructions";
  blur.innerHTML = `<div style="z-index:999998;width:100%;height:1000%;position:fixed;top:0;left:0;background-color:rgba(0,0,0,0.5);">
  </div>`;
  container.innerHTML = `<div style="z-index:999999;border-radius:20px;background-color:#212529;width:max(50vw,min(100vw,400px));height:90%;position:fixed;left:50%;top:5%;transform:translateX(-50%);overflow-y: scroll;">
    <div class="text-light" style="margin:10px">${window.portfolioText}
    <div class="text-center"><button class="btn btn-outline-light" onclick="document.getElementById('blur-screen-instructions').remove();this.closest('#portfolio-instructions-container').remove();document.getElementById('container').style.filter = ''">Close</button></div>
    </div>
  </div>`;
  document.body.appendChild(blur);
  document.body.appendChild(container);
}