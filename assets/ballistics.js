/* Point-mass trajectory solver using the standard G1 drag function, plus a selectable load calculator.
   Load figures are typical published values; barrel length and lot change them. */
(function(){
const G1=[[0,.2629],[.05,.2558],[.1,.2487],[.15,.2413],[.2,.2344],[.25,.2278],[.3,.2214],[.35,.2155],[.4,.2104],[.45,.2061],[.5,.2032],[.55,.202],[.6,.2034],[.7,.2165],[.725,.223],[.75,.2313],[.775,.2417],[.8,.2546],[.825,.2706],[.85,.2901],[.875,.3136],[.9,.3415],[.925,.3734],[.95,.4084],[.975,.4448],[1,.4805],[1.025,.5136],[1.05,.5427],[1.075,.5677],[1.1,.5883],[1.125,.6053],[1.15,.6191],[1.2,.6393],[1.25,.6518],[1.3,.6589],[1.35,.6621],[1.4,.6625],[1.45,.6607],[1.5,.6573],[1.55,.6528],[1.6,.6474],[1.65,.6413],[1.7,.6347],[1.75,.628],[1.8,.621],[1.85,.6141],[1.9,.6072],[1.95,.6003],[2,.5934],[2.05,.5867],[2.1,.5804],[2.15,.5743],[2.2,.5685],[2.25,.563],[2.3,.5577],[2.35,.5527],[2.4,.5481],[2.45,.5438],[2.5,.5397],[2.6,.5325],[2.7,.5264],[2.8,.5211],[2.9,.5168],[3,.5133],[3.1,.5105],[3.2,.5084],[3.3,.5067],[3.4,.5054],[3.5,.504],[3.6,.503],[3.7,.5022],[3.8,.5016],[3.9,.501],[4,.5006]];
function cd(m){if(m<=0)return G1[0][1];for(let i=1;i<G1.length;i++){if(m<=G1[i][0]){const a=G1[i-1],b=G1[i];return a[1]+(b[1]-a[1])*(m-a[0])/(b[0]-a[0])}}return G1[G1.length-1][1]}

const SHOT_NOTE="Shot loads plot one pellet's path with an estimated drag figure for a round ball. The pattern spreads roughly 1 inch per yard from an open choke; past the distances shown, pellets carry too little energy to rely on.";
const LOADS={
 /* Rimfire */
 "22lr":{group:"Rimfire",label:".22 LR",sh:1.5,zero:50,max:200,step:25,loads:[
  ["40 gr lead round nose, standard velocity, 18\"",40,.138,1070],["40 gr lead round nose, high velocity, 18\"",40,.138,1255],["36 gr copper-plated hollow point, 18\"",36,.126,1280],["32 gr hyper-velocity hollow point, 18\"",32,.091,1640]]},
 "22wmr":{group:"Rimfire",label:".22 WMR",sh:1.5,zero:100,max:200,step:25,loads:[
  ["30 gr V-Max, 20\"",30,.095,2200],["40 gr JHP, 20\"",40,.110,1910]]},
 "17hmr":{group:"Rimfire",label:".17 HMR",sh:1.5,zero:100,max:250,step:25,loads:[
  ["17 gr V-Max, 22\"",17,.125,2550],["20 gr XTP, 22\"",20,.107,2375],["15.5 gr NTX lead-free, 22\"",15.5,.10,2525]]},
 /* Handgun and PCC */
 "380":{group:"Handgun & pistol-caliber carbine",label:".380 ACP",sh:.5,zero:15,max:50,step:5,loads:[
  ["90 gr JHP, 3.75\" pistol",90,.099,1000],["95 gr FMJ, 3.75\" pistol",95,.083,955]]},
 "9mm":{group:"Handgun & pistol-caliber carbine",label:"9mm Luger",sh:.6,zero:25,max:100,step:10,loads:[
  ["115 gr FMJ, 4\" pistol",115,.142,1150],["124 gr FMJ, 4\" pistol",124,.150,1110],["124 gr +P JHP, 4\" pistol",124,.150,1200],["147 gr JHP, 4\" pistol",147,.200,990],
  ["115 gr FMJ, 16\" carbine",115,.142,1350],["124 gr JHP, 16\" carbine",124,.150,1300],["147 gr JHP, 16\" carbine",147,.200,1120]]},
 "40":{group:"Handgun & pistol-caliber carbine",label:".40 S&W",sh:.6,zero:25,max:100,step:10,loads:[
  ["165 gr JHP, 4\" pistol",165,.138,1130],["180 gr JHP, 4\" pistol",180,.164,1000],["180 gr FMJ, 4\" pistol",180,.164,990]]},
 "10mm":{group:"Handgun & pistol-caliber carbine",label:"10mm Auto",sh:.6,zero:25,max:100,step:10,loads:[
  ["155 gr JHP, 5\" pistol",155,.138,1400],["180 gr JHP, 5\" pistol",180,.169,1250]]},
 "45":{group:"Handgun & pistol-caliber carbine",label:".45 ACP",sh:.6,zero:25,max:100,step:10,loads:[
  ["230 gr FMJ, 5\" pistol",230,.195,850],["230 gr JHP, 5\" pistol",230,.170,875],["185 gr JHP, 5\" pistol",185,.150,1000],["230 gr +P JHP, 5\" pistol",230,.170,950],["230 gr FMJ, 16\" carbine",230,.195,960]]},
 "57":{group:"Handgun & pistol-caliber carbine",label:"5.7×28 mm",sh:.6,zero:25,max:200,step:25,loads:[
  ["40 gr V-Max (SS197SR), 4.8\" pistol",40,.200,1650],["40 gr V-Max, 16\" carbine",40,.200,2000]]},
 /* Intermediate rifle */
 "223":{group:"Intermediate rifle",label:".223 Remington",sh:2.6,zero:100,max:600,step:50,loads:[
  ["40 gr V-Max varmint, 24\"",40,.200,3800],["50 gr V-Max, 24\"",50,.242,3410],["55 gr FMJ, 20\"",55,.243,3150],["55 gr soft point, 20\"",55,.250,3100],
  ["60 gr bonded soft point, 20\"",60,.265,3000],["69 gr HPBT match, 24\"",69,.301,2950],["75 gr ELD Match, 24\"",75,.467,2790],["77 gr OTM, 24\"",77,.372,2750]]},
 "556":{group:"Intermediate rifle",label:"5.56×45 NATO",sh:2.6,zero:100,max:600,step:50,loads:[
  ["55 gr FMJ (M193), 20\" barrel",55,.243,3240],["55 gr FMJ (M193), 16\" barrel",55,.243,3050],
  ["62 gr steel-core FMJ (M855), 20\"",62,.304,3020],["62 gr steel-core FMJ (M855), 16\"",62,.304,2900],
  ["64 gr bonded soft point, 16\"",64,.30,2900],["69 gr HPBT match, 20\"",69,.301,2850],
  ["75 gr OTM, 16\"",75,.395,2650],["77 gr OTM (Mk 262), 18\"",77,.372,2750]]},
 "22arc":{group:"Intermediate rifle",label:".22 ARC",sh:2.6,zero:100,max:1000,step:100,loads:[
  ["62 gr ELD-VT varmint, 24\"",62,.382,3300],["75 gr ELD Match, 24\"",75,.467,3000],["88 gr ELD Match, 24\"",88,.545,2820],["88 gr ELD Match, 18\"",88,.545,2650]]},
 "6arc":{group:"Intermediate rifle",label:"6mm ARC",sh:2.6,zero:100,max:1000,step:100,loads:[
  ["103 gr ELD-X hunting, 24\"",103,.512,2800],["105 gr BTHP, 24\"",105,.500,2750],["108 gr ELD Match, 24\"",108,.536,2750],["108 gr ELD Match, 18\"",108,.536,2600]]},
 "65g":{group:"Intermediate rifle",label:"6.5 Grendel",sh:2.6,zero:100,max:800,step:100,loads:[
  ["123 gr ELD Match, 24\"",123,.510,2580],["123 gr ELD Match, 18\"",123,.510,2400],["120 gr bonded soft point, 20\"",120,.40,2450]]},
 "300blk":{group:"Intermediate rifle",label:".300 Blackout",sh:2.6,zero:100,max:400,step:50,loads:[
  ["110 gr V-Max supersonic, 16\"",110,.290,2350],["125 gr OTM supersonic, 16\"",125,.337,2200],["190 gr subsonic expanding, 16\"",190,.290,1050],["220 gr OTM subsonic, 16\"",220,.608,1000]]},
 "86blk":{group:"Intermediate rifle",label:"8.6 Blackout",sh:2.6,zero:50,max:300,step:25,loads:[
  ["300 gr HPBT subsonic, 16\"",300,.75,960],["200 gr supersonic (SAAMI reference velocity; BC estimated)",200,.40,2200]]},
 "762x39":{group:"Intermediate rifle",label:"7.62×39 mm",sh:2.6,zero:100,max:400,step:50,loads:[
  ["123 gr FMJ (steel case), 16\"",123,.275,2350],["123 gr SST, 16\"",123,.295,2350]]},
 /* Long range and hunting rifle */
 "243":{group:"Hunting & long-range rifle",label:".243 Winchester",sh:1.75,zero:100,max:800,step:100,loads:[
  ["58 gr V-Max varmint, 24\"",58,.250,3750],["95 gr SST, 24\"",95,.355,3185],["100 gr soft point, 24\"",100,.356,2960]]},
 "224v":{group:"Hunting & long-range rifle",label:".224 Valkyrie",sh:2.6,zero:100,max:1200,step:100,loads:[
  ["60 gr V-Max, 24\"",60,.265,3300],["88 gr ELD Match, 24\"",88,.545,2675],["90 gr SMK, 24\"",90,.563,2700]]},
 "65cm":{group:"Hunting & long-range rifle",label:"6.5 Creedmoor",sh:1.75,zero:100,max:1000,step:100,loads:[
  ["140 gr ELD Match, 24\"",140,.646,2710],["143 gr ELD-X hunting, 24\"",143,.625,2700],["147 gr ELD Match, 24\"",147,.697,2695],["130 gr bonded soft point, 22\"",130,.47,2850]]},
 "65prc":{group:"Hunting & long-range rifle",label:"6.5 PRC",sh:1.75,zero:100,max:1200,step:100,loads:[
  ["143 gr ELD-X hunting, 24\"",143,.625,2960],["147 gr ELD Match, 24\"",147,.697,2910]]},
 "308":{group:"Hunting & long-range rifle",label:".308 Win / 7.62 NATO",sh:1.75,zero:100,max:1000,step:100,loads:[
  ["147 gr FMJ (M80), 22\"",147,.40,2750],["150 gr soft point, 22\"",150,.314,2820],
  ["165 gr bonded soft point, 22\"",165,.40,2700],["168 gr HPBT match, 24\"",168,.462,2650],
  ["175 gr HPBT (M118LR), 22\"",175,.505,2600],["178 gr low-drag match, 24\"",178,.547,2600]]},
 "3006":{group:"Hunting & long-range rifle",label:".30-06 Springfield",sh:1.75,zero:100,max:800,step:100,loads:[
  ["150 gr soft point, 22\"",150,.314,2910],["165 gr bonded soft point, 22\"",165,.40,2800],["180 gr soft point, 22\"",180,.383,2700],["168 gr HPBT match, 24\"",168,.462,2750]]},
 "300wm":{group:"Hunting & long-range rifle",label:".300 Win Mag",sh:1.75,zero:100,max:1200,step:100,loads:[
  ["180 gr bonded soft point, 24\"",180,.48,2960],["190 gr HPBT match, 24\"",190,.533,2900],["215 gr hybrid match, 26\"",215,.691,2850]]},
 /* Lever and straight-wall */
 "3030":{group:"Lever-action & straight-wall",label:".30-30 Winchester",sh:1.5,zero:100,max:300,step:25,loads:[
  ["150 gr flat-nose soft point, 20\"",150,.218,2390],["170 gr flat-nose soft point, 20\"",170,.254,2200],["160 gr FTX, 20\"",160,.330,2400]]},
 "350l":{group:"Lever-action & straight-wall",label:".350 Legend",sh:1.75,zero:100,max:300,step:25,loads:[
  ["150 gr expanding, 22\"",150,.223,2325],["180 gr soft point, 22\"",180,.21,2100]]},
 "360bh":{group:"Lever-action & straight-wall",label:".360 Buckhammer",sh:1.5,zero:100,max:300,step:25,loads:[
  ["180 gr Core-Lokt, 20\"",180,.178,2400],["200 gr Core-Lokt, 20\"",200,.181,2200]]},
 "450bm":{group:"Lever-action & straight-wall",label:".450 Bushmaster",sh:1.75,zero:100,max:300,step:25,loads:[
  ["250 gr FTX, 20\"",250,.210,2200],["260 gr Core-Lokt, 20\"",260,.171,2040]]},
 /* Shotgun */
 "12shot":{group:"Shotgun",label:"12 gauge shot & buckshot",sh:.5,zero:25,max:60,step:5,note:SHOT_NOTE,loads:[
  ["1⅛ oz #8 target (per pellet), 1,200 ft/s",1.07,.011,1200],["1⅛ oz #7½ target (per pellet)",1.25,.012,1200],["1¼ oz #6 field (per pellet)",1.95,.0135,1330],["1¼ oz #4 field (per pellet)",3.24,.016,1300],
  ["2¾\" 00 buck, 9 pellets (per pellet)",53.8,.042,1325],["2¾\" 00 buck reduced recoil (per pellet)",53.8,.042,1145],["2¾\" #1 buck, 16 pellets (per pellet)",40,.037,1250],["2¾\" #4 buck, 27 pellets (per pellet)",20.7,.030,1325]]},
 "12slug":{group:"Shotgun",label:"12 gauge slug",sh:.9,zero:50,max:150,step:25,loads:[
  ["1 oz (437 gr) rifled Foster slug",437,.105,1600],["7/8 oz (383 gr) reduced-recoil slug",383,.095,1300],["1 oz Brenneke-style slug",437,.11,1600],["300 gr sabot slug (rifled barrel)",300,.20,2000]]},
 "16slug":{group:"Shotgun",label:"16 gauge slug",sh:.9,zero:50,max:150,step:25,loads:[
  ["4/5 oz (350 gr) rifled Foster slug",350,.09,1600],["1 oz Brenneke-style slug",437,.11,1450]]},
 "20shot":{group:"Shotgun",label:"20 gauge shot & buckshot",sh:.5,zero:25,max:60,step:5,note:SHOT_NOTE,loads:[
  ["⅞ oz #8 target (per pellet), 1,200 ft/s",1.07,.011,1200],["1 oz #6 field (per pellet)",1.95,.0135,1220],["3\" #3 buck, 20 pellets (per pellet)",23.4,.031,1200]]},
 "20slug":{group:"Shotgun",label:"20 gauge slug",sh:.9,zero:50,max:150,step:25,loads:[
  ["3/4 oz (328 gr) rifled Foster slug",328,.08,1600],["250 gr sabot slug (rifled barrel)",250,.19,1800]]}
};

function run(p,angle,until){/* p: mv fps, bc, sh in, temp F, alt ft; returns samples every yard */
  const Tr=p.temp+459.67,rho=Math.pow(1-6.8756e-6*p.alt,5.2559)*518.67/Tr,snd=49.0223*Math.sqrt(Tr);
  const K=0.0764*rho*Math.PI/(8*144*p.bc);let x=0,y=-p.sh/12,vx=p.mv*Math.cos(angle),vy=p.mv*Math.sin(angle),t=0;const dt=.0004;const out=[[0,y,p.mv,0]];let next=3;
  while(x<until*3+1&&t<10){const v=Math.hypot(vx,vy);const a=K*cd(v/snd)*v;vx-=a*vx*dt;vy-=(a*vy+32.174)*dt;x+=vx*dt;y+=vy*dt;t+=dt;
    while(x>=next){out.push([next/3,y,Math.hypot(vx,vy),t]);next+=3}}
  return out}
function solve(p){/* p: mv, bc, w, sh, zero, max, step, wind mph, clock, temp, alt */
  let lo=-.02,hi=.05;for(let i=0;i<40;i++){const m=(lo+hi)/2;const s=run(p,m,p.zero);const yz=s[Math.min(s.length-1,Math.round(p.zero))][1];if(yz>0)hi=m;else lo=m}
  const s=run(p,(lo+hi)/2,p.max);const wc=p.wind*1.46667*Math.sin((p.clock%12)*Math.PI/6);
  return s.map(([yd,y,v,t])=>{const din=y*12,dr=-wc*(t-yd*3/p.mv)*12;return{yd,din,v,t,e:p.w*v*v/450436,drift:dr,moa:yd?din/(1.0472*yd/100):0,mil:yd?din/(.036*yd):0,dmil:yd?dr/(.036*yd):0}})}

function el(h){const d=document.createElement("div");d.innerHTML=h.trim();return d.firstChild}
function mount(host){
  const keys=(host.dataset.cartridges==="all"?Object.keys(LOADS):(host.dataset.cartridges||"556,308,9mm,45").split(",")).filter(k=>LOADS[k]);
  const opt=k=>`<option value="${k}">${LOADS[k].label}</option>`;const groups=[...new Set(keys.map(k=>LOADS[k].group||""))];
  const cartOpts=groups.length>1?groups.map(g=>`<optgroup label="${g}">${keys.filter(k=>(LOADS[k].group||"")===g).map(opt).join("")}</optgroup>`).join(""):keys.map(opt).join("");const id=host.id;
  host.classList.add("bal");
  host.innerHTML=`<form class="bal-form" onsubmit="return false">
   <label for="${id}-cart" class="wide">Cartridge<select id="${id}-cart">${cartOpts}</select></label>
   <label for="${id}-load" class="wide">Load<select id="${id}-load"></select></label>
   <label for="${id}-w">Bullet (gr)<input id="${id}-w" type="number" step="1"></label>
   <label for="${id}-mv">Muzzle vel. (ft/s)<input id="${id}-mv" type="number" step="10"></label>
   <label for="${id}-bc">G1 BC<input id="${id}-bc" type="number" step=".005"></label>
   <label for="${id}-sh">Sight height (in)<input id="${id}-sh" type="number" step=".05"></label>
   <label for="${id}-zero">Zero (yd)<input id="${id}-zero" type="number" step="5"></label>
   <label for="${id}-wind">Wind (mph)<input id="${id}-wind" type="number" step="1" value="10"></label>
   <label for="${id}-clock">Wind from<select id="${id}-clock">${[12,1,2,3,4,5,6,7,8,9,10,11].map(h=>`<option value="${h}"${h===3?" selected":""}>${h} o'clock</option>`).join("")}</select></label>
   <label for="${id}-temp">Temp (°F)<input id="${id}-temp" type="number" step="1" value="59"></label>
   <label for="${id}-alt">Altitude (ft)<input id="${id}-alt" type="number" step="100" value="0"></label>
   <label for="${id}-max">Max range (yd)<input id="${id}-max" type="number" step="25"></label>
   <label for="${id}-step">Step (yd)<input id="${id}-step" type="number" step="5"></label>
   <label for="${id}-at">Hold at (yd)<input id="${id}-at" type="number" step="5"></label>
  </form>
  <p class="note bal-cnote" id="${id}-cnote" hidden></p>
  <div class="bal-hold" id="${id}-hold" aria-live="polite"></div>
  <canvas class="bal-chart" id="${id}-chart" role="img" aria-label="Trajectory chart"></canvas>
  <div class="tbl"><table class="bal-table"><thead><tr><th>Range (yd)</th><th class="num">Drop (in)</th><th class="num">Elev. hold (MOA)</th><th class="num">Elev. hold (mil)</th><th class="num">Wind (in)</th><th class="num">Wind (mil)</th><th class="num">Vel. (ft/s)</th><th class="num">Energy (ft-lb)</th><th class="num">Time (s)</th></tr></thead><tbody></tbody></table></div>
  <p class="note">Drop is relative to the line of sight; negative means below. Elevation hold is the correction to dial or hold: U = up, D = down. Wind from 1–5 o'clock pushes the bullet left (L); from 7–11 o'clock, right (R). Standard G1 drag model; load data are typical published figures. Chronograph your own gun and confirm on paper.</p>`;
  const $=s=>host.querySelector("#"+id+"-"+s);let rows=[],P=null;
  function fillLoads(reset){const c=LOADS[$("cart").value];const cn=$("cnote");cn.textContent=c.note||"";cn.hidden=!c.note;$("load").innerHTML=c.loads.map((l,i)=>`<option value="${i}">${l[0]}</option>`).join("");if(reset){$("sh").value=c.sh;$("zero").value=c.zero;$("max").value=c.max;$("step").value=c.step;$("at").value=c.zero*2}pickLoad()}
  function pickLoad(){const l=LOADS[$("cart").value].loads[+$("load").value];$("w").value=l[1];$("bc").value=l[2];$("mv").value=l[3];calc()}
  function calc(){const n=s=>+$(s).value;P={mv:n("mv"),bc:n("bc"),w:n("w"),sh:n("sh"),zero:n("zero"),max:Math.max(n("max"),n("at")||0,n("zero")),step:n("step")||25,wind:n("wind"),clock:n("clock"),temp:n("temp"),alt:n("alt")};
    if(!(P.mv>0&&P.bc>0&&P.zero>0&&P.max>0))return;rows=solve(P);
    const tb=host.querySelector("tbody");const fmt=(v,d=1)=>Math.abs(v)<.5*Math.pow(10,-d)?(0).toFixed(d):(v>0?"+":"")+v.toFixed(d);const ud=(v,d=1)=>Math.abs(v)<.5*Math.pow(10,-d)?(0).toFixed(d):Math.abs(v).toFixed(d)+(v<0?" U":" D");const lr=v=>Math.abs(v)<.05?"0.0":Math.abs(v).toFixed(1)+(v<0?" L":" R");
    const sel=[];for(let yd=0;yd<=n("max");yd+=P.step)sel.push(rows[Math.min(rows.length-1,yd)]);
    tb.innerHTML=sel.map(r=>`<tr${Math.abs(r.yd-P.zero)<.5?' class="zero"':""}><td class="num">${r.yd}</td><td class="num">${fmt(r.din)}</td><td class="num">${r.yd?ud(r.moa):"—"}</td><td class="num">${r.yd?ud(r.mil,2):"—"}</td><td class="num">${lr(r.drift)}</td><td class="num">${r.yd?lr(r.dmil):"—"}</td><td class="num">${Math.round(r.v)}</td><td class="num">${Math.round(r.e)}</td><td class="num">${r.t.toFixed(3)}</td></tr>`).join("");
    hold();chart()}
  function hold(){const at=+$("at").value,o=$("hold");const r=rows[Math.round(at)];if(!r||!at){o.textContent="";return}
    const up=-r.mil,upM=-r.moa;o.innerHTML=`<span>At <b>${at} yd</b>:</span> <span>hold <b>${Math.abs(up).toFixed(1)} mil ${up>=0?"up":"down"}</b> (${Math.abs(upM).toFixed(1)} MOA, ${Math.abs(r.din).toFixed(1)}" ${r.din<0?"low":"high"} if uncorrected)</span> <span>wind <b>${Math.abs(r.dmil).toFixed(1)} mil ${r.dmil<0?"right":"left"}</b> (${Math.abs(r.drift).toFixed(1)}")</span> <span>${Math.round(r.v)} ft/s · ${Math.round(r.e)} ft-lb</span>`}
  function chart(){const cv=$("chart"),d=window.devicePixelRatio||1,w=cv.clientWidth;if(!w)return;const h=Math.round(w*.32);cv.width=w*d;cv.height=h*d;cv.style.height=h+"px";const c=cv.getContext("2d");c.setTransform(d,0,0,d,0,0);
    const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();const max=+$("max").value||P.max;
    const vis=rows.filter(r=>r.yd<=max);let lo=Math.min(...vis.map(r=>r.din)),hi=Math.max(...vis.map(r=>r.din),1);lo=Math.min(lo,-3);const padL=46,padR=12,padT=12,padB=24;
    const X=yd=>padL+yd/max*(w-padL-padR),Y=v=>padT+(hi-v)/(hi-lo)*(h-padT-padB);
    c.fillStyle=css("--panel");c.fillRect(0,0,w,h);c.strokeStyle=css("--line");c.lineWidth=1;c.font="11px 'JetBrains Mono',monospace";c.fillStyle=css("--muted");
    const ys=Math.pow(10,Math.floor(Math.log10((hi-lo)/4)));const yt=[1,2,5,10].map(m=>m*ys).find(s=>(hi-lo)/s<=6)||ys*10;
    for(let v=Math.ceil(lo/yt)*yt;v<=hi;v+=yt){c.beginPath();c.moveTo(padL,Y(v));c.lineTo(w-padR,Y(v));c.stroke();c.textAlign="right";c.fillText((v>0?"+":"")+v+'"',padL-6,Y(v)+4)}
    const xs=+$("step").value||P.step;for(let yd=0;yd<=max;yd+=xs*(max/xs>12?2:1)){c.textAlign="center";c.fillText(yd,X(yd),h-6)}
    c.strokeStyle=css("--accent");c.lineWidth=1.5;c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(max),Y(0));c.stroke();
    c.strokeStyle=css("--friend");c.lineWidth=2.2;c.beginPath();vis.forEach((r,i)=>i?c.lineTo(X(r.yd),Y(r.din)):c.moveTo(X(r.yd),Y(r.din)));c.stroke();
    const at=+$("at").value;if(at&&at<=max&&rows[at]){c.fillStyle=css("--threat");c.beginPath();c.arc(X(at),Y(rows[at].din),4,0,7);c.fill()}}
  $("cart").addEventListener("change",()=>fillLoads(true));$("load").addEventListener("change",pickLoad);
  host.querySelectorAll("input,select").forEach(e=>{if(e!==$("cart")&&e!==$("load"))e.addEventListener("input",calc)});
  new ResizeObserver(()=>{if(rows.length)chart()}).observe($("chart"));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>rows.length&&chart());
  fillLoads(true);
  return{holdAt(yd){$("at").value=Math.round(yd);calc();return rows[Math.round(yd)]},get cartridge(){return LOADS[$("cart").value].label},get load(){return $("load").selectedOptions[0].textContent}};
}
window.Ballistics={solve,mount,LOADS};
})();
