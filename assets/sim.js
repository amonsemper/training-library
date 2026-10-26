/* Shared sand-table animation engine. Each scene: {tab, duration, aspect, captions:[[t,label,text]], draw(g,t)}.
   Drawing space is 100 units wide; height = 100 * aspect (default 0.75). */
(function(){
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const KEYS=["bg","panel","floor","ink","muted","line","accent","friend","friend2","threat","wall","cone","vis"];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,u)=>a+(b-a)*u;
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
function seg(t,a,b){return clamp((t-a)/(b-a),0,1)}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function keys(k,t){if(t<=k[0][0])return k[0].slice(1);for(let i=1;i<k.length;i++){const a=k[i-1],b=k[i];if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]);return a.slice(1).map((v,j)=>lerp(v,b[j+1],u))}}return k[k.length-1].slice(1)}

function makeG(ctx,C,W,H){
  const col=c=>c==null?null:(C[c]||c);
  const g={ctx,C,W,H,clamp,lerp,ease,seg,rng,gauss,keys,col,
    clear(grid=true){ctx.fillStyle=C.panel;ctx.fillRect(0,0,W,H);if(grid)g.grid(5)},
    grid(s){ctx.strokeStyle=C.line;ctx.lineWidth=.12;ctx.beginPath();for(let x=0;x<=W+.01;x+=s){ctx.moveTo(x,0);ctx.lineTo(x,H)}for(let y=0;y<=H+.01;y+=s){ctx.moveTo(0,y);ctx.lineTo(W,y)}ctx.stroke()},
    line(x1,y1,x2,y2,o={}){ctx.save();ctx.globalAlpha=o.alpha??1;ctx.strokeStyle=col(o.c||"ink");ctx.lineWidth=o.w||.4;ctx.lineCap=o.cap||"round";if(o.dash)ctx.setLineDash(o.dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()},
    path(pts,o={}){if(pts.length<2)return;ctx.save();ctx.globalAlpha=o.alpha??1;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);if(o.close)ctx.closePath();
      if(o.fill){ctx.fillStyle=col(o.fill);ctx.fill()}if(o.c||!o.fill){ctx.strokeStyle=col(o.c||"ink");ctx.lineWidth=o.w||.4;ctx.lineJoin="round";ctx.lineCap="round";if(o.dash)ctx.setLineDash(o.dash);ctx.stroke()}ctx.restore()},
    circle(x,y,r,o={}){ctx.save();ctx.globalAlpha=o.alpha??1;ctx.beginPath();ctx.arc(x,y,Math.max(r,.01),o.a0||0,o.a1??Math.PI*2);if(o.fill){ctx.fillStyle=col(o.fill);ctx.fill()}if(o.c){ctx.strokeStyle=col(o.c);ctx.lineWidth=o.w||.3;if(o.dash)ctx.setLineDash(o.dash);ctx.stroke()}ctx.restore()},
    rect(x,y,w,h,o={}){ctx.save();ctx.globalAlpha=o.alpha??1;ctx.beginPath();if(o.r&&ctx.roundRect)ctx.roundRect(x,y,w,h,o.r);else ctx.rect(x,y,w,h);if(o.fill){ctx.fillStyle=col(o.fill);ctx.fill()}if(o.c){ctx.strokeStyle=col(o.c);ctx.lineWidth=o.w||.3;if(o.dash)ctx.setLineDash(o.dash);ctx.stroke()}ctx.restore()},
    wedge(x,y,r,h,half,o={}){ctx.save();ctx.globalAlpha=o.alpha??1;ctx.fillStyle=col(o.fill||"cone");ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r,(h-half)*Math.PI/180,(h+half)*Math.PI/180);ctx.closePath();ctx.fill();ctx.restore()},
    text(s,x,y,o={}){ctx.save();ctx.globalAlpha=o.alpha??1;ctx.fillStyle=col(o.c||"muted");ctx.font=`${o.weight||600} ${(o.size||2.4)*(g.fs||1)}px ${o.font==="display"?'"Saira Condensed",sans-serif':o.font==="body"?'Barlow,sans-serif':'"JetBrains Mono",monospace'}`;ctx.textAlign=o.align||"center";ctx.textBaseline=o.base||"alphabetic";ctx.fillText(s,x,y);ctx.restore()},
    arrow(x1,y1,x2,y2,o={}){g.line(x1,y1,x2,y2,o);const a=Math.atan2(y2-y1,x2-x1),s=o.head||1.6;g.path([[x2-Math.cos(a-.45)*s,y2-Math.sin(a-.45)*s],[x2,y2],[x2-Math.cos(a+.45)*s,y2-Math.sin(a+.45)*s]],{c:o.c,w:o.w})},
    person(x,y,h,o={}){const c=o.c||"friend";g.circle(x,y,1.9,{fill:c});if(h!=null){g.line(x,y,x+Math.cos(h*Math.PI/180)*3.6,y+Math.sin(h*Math.PI/180)*3.6,{c:o.muzzleOff?"muted":c,w:.5,cap:"butt"})}if(o.n!=null)g.text(String(o.n),x,y+.1,{c:"panel",size:2.2,weight:700,base:"middle"})},
    rot(x,y,a,fn){ctx.save();ctx.translate(x,y);ctx.rotate(a*Math.PI/180);fn();ctx.restore()},
    clip(x,y,w,h,fn){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();fn();ctx.restore()}
  };
  return g;
}

window.Sim=function(id,scenes){
  const host=document.getElementById(id);if(!host)return;
  if(!Array.isArray(scenes))scenes=[scenes];
  let scene=scenes[0];
  if(scenes.length>1){const tabs=document.createElement("div");tabs.className="tabs";tabs.setAttribute("role","tablist");
    scenes.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("role","tab");b.id=id+"-tab"+i;b.textContent=s.tab;b.setAttribute("aria-selected",i?"false":"true");
      b.onclick=()=>{tabs.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected","false"));b.setAttribute("aria-selected","true");scene=s;t=reduce?s.duration:0;hold=0;size()};tabs.append(b)});
    host.append(tabs)}
  const canvas=document.createElement("canvas");canvas.setAttribute("role","img");canvas.setAttribute("aria-label",(host.dataset.label||"Animated diagram"));
  const ctrl=document.createElement("div");ctrl.className="ctrl";
  ctrl.innerHTML=`<button id="${id}-play" type="button">Pause</button><button id="${id}-rst" type="button">Restart</button><button id="${id}-spd" type="button">Speed 1×</button><input id="${id}-scrub" type="range" min="0" max="1000" value="0" aria-label="Scrub timeline"><span class="t"></span>`;
  const cap=document.createElement("div");cap.className="cap";cap.innerHTML='<span class="ph"></span><span class="tx"></span>';
  host.append(canvas,ctrl,cap);
  const ctx=canvas.getContext("2d");
  const playB=ctrl.querySelector("#"+id+"-play"),rst=ctrl.querySelector("#"+id+"-rst"),spdB=ctrl.querySelector("#"+id+"-spd"),scrub=ctrl.querySelector("input"),tEl=ctrl.querySelector(".t");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t=reduce?scene.duration:0,playing=!reduce,speed=1,last=null,hold=0,visible=true;
  if(!playing)playB.textContent="Play";
  function size(){const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;if(!r.width)return;const asp=scene.aspect||.75;canvas.style.aspectRatio=(1/asp).toFixed(4);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.width*asp*d);draw()}
  playB.onclick=()=>{playing=!playing;playB.textContent=playing?"Pause":"Play";if(playing&&t>=scene.duration)t=0};
  rst.onclick=()=>{t=0;hold=0;playing=true;playB.textContent="Pause"};
  spdB.onclick=()=>{speed=speed===1?.5:speed===.5?.25:1;spdB.textContent="Speed "+speed+"×"};
  scrub.oninput=()=>{t=scrub.value/1000*scene.duration;playing=false;playB.textContent="Play";draw()};
  function draw(){if(!canvas.width)return;const W=100,H=100*(scene.aspect||.75);const s=canvas.width/W;ctx.setTransform(s,0,0,s,0,0);
    const C={};for(const k of KEYS)C[k]=css("--"+k);
    const g=makeG(ctx,C,W,H);g.t=t;g.fs=canvas.clientWidth<520?1.18:1;scene.draw(g,t);
    let c=scene.captions[0];for(const k of scene.captions)if(t>=k[0])c=k;
    cap.querySelector(".ph").textContent=c[1];cap.querySelector(".tx").textContent=c[2];
    scrub.value=Math.round(t/scene.duration*1000);tEl.textContent=t.toFixed(1)+" s"}
  function frame(ts){if(last==null)last=ts;const dt=Math.min(.05,(ts-last)/1000);last=ts;
    if(playing&&visible){if(t<scene.duration)t=Math.min(scene.duration,t+dt*speed);else{hold+=dt;if(hold>(scene.hold||1.8)){hold=0;t=0}}draw()}
    requestAnimationFrame(frame)}
  new ResizeObserver(size).observe(canvas);
  if("IntersectionObserver"in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(host);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",draw);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
  requestAnimationFrame(frame);
};
})();
/* library nav drop-downs: click or tap toggles, hover opens on desktop, Esc or an outside click closes */
(function(){const nav=document.querySelector("nav.site");if(!nav)return;const dds=[...nav.querySelectorAll(".dd")];
  const close=x=>dds.forEach(d=>{if(d!==x){d.classList.remove("open");d.querySelector(".dt").setAttribute("aria-expanded","false")}});
  dds.forEach(d=>{const b=d.querySelector(".dt");b.addEventListener("click",e=>{e.stopPropagation();const o=!d.classList.contains("open");close(d);d.classList.toggle("open",o);b.setAttribute("aria-expanded",o?"true":"false")});
    d.addEventListener("mouseleave",()=>{if(matchMedia("(hover:hover)").matches){d.classList.remove("open");b.setAttribute("aria-expanded","false")}})});
  document.addEventListener("click",e=>{if(!nav.contains(e.target))close()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){const o=nav.querySelector(".dd.open");close();if(o)o.querySelector(".dt").focus()}});
})();
