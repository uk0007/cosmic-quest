/* Cosmic Dash: independent, fixed-step runner simulation and canvas presentation. */
(() => {
  'use strict';
  class DashRun {
    constructor(random=Math.random){this.random=random;this.reset();}
    reset(){Object.assign(this,{mode:'ready',lane:1,laneX:1,jump:0,slide:0,time:0,distance:0,stars:0,lives:3,shield:0,magnet:0,bonus:0,celebrations:[],invulnerable:0,speed:350,spawnIn:1,row:0,objects:[],effects:[],event:null});}
    start(){this.reset();this.mode='playing';}
    action(action){
      if(this.mode!=='playing')return;
      if(action==='left')this.lane=Math.max(0,this.lane-1);
      if(action==='right')this.lane=Math.min(2,this.lane+1);
      if(action==='jump'&&this.jump===0){this.jump=.95;this.slide=0;this.event='jump';}
      if(action==='slide'){this.jump=0;this.slide=.85;}
    }
    get height(){return this.jump>0?Math.sin(Math.PI*(1-this.jump/.95))*145:0;}
    get score(){return Math.floor(this.distance)+this.stars*25;}
    spawn(){
      const r=this.row++,safe=Math.floor(this.random()*3),z=1800;
      // Full-width jump and slide rows cannot be bypassed by changing lanes.
      // They alternate with dodge rows, separated by at least 1.5 seconds at top speed.
      const required=r%4===0?'jump':r%4===2?'slide':null;
      if(required){
        for(let lane=0;lane<3;lane++)this.objects.push({lane,z,type:required==='jump'?'barrier':'arch',fullWidth:true});
      }else for(let lane=0;lane<3;lane++)if(lane!==safe){
        const types=['barrier','arch','train','gap'];
        this.objects.push({lane,z,type:types[Math.floor(this.random()*types.length)]});
      }
      if(required){
        for(let lane=0;lane<3;lane++)this.objects.push({lane,z,type:'star',required});
      }else for(let j=0;j<4;j++)this.objects.push({lane:safe,z:z-320+j*65,type:'star'});
      // Diamonds share the obstacle plane: perform the indicated action to claim them.
      if(required&&r%4===0)this.objects.push({lane:safe,z,type:['magnet','shield','bonus'][(r/4)%3],required});
      if(required&&r%4===2&&r%8===6)this.objects.push({lane:safe,z,type:'shield',required});
    }
    eligible(o){return !o.required||(o.required==='jump'?this.height>65:this.slide>0);}
    collectPower(type){
      if(type==='magnet')this.magnet=9;
      if(type==='shield')this.shield=1;
      if(type==='bonus')this.bonus=10;
      this.celebrations.push(type);
    }

    step(dt){
      if(this.mode!=='playing')return;
      this.time+=dt;this.speed=Math.min(720,350+this.distance*.12);this.distance+=this.speed*dt*.035;
      this.laneX+=(this.lane-this.laneX)*(1-Math.exp(-dt*18));
      this.jump=Math.max(0,this.jump-dt);this.slide=Math.max(0,this.slide-dt);
      this.bonus=Math.max(0,this.bonus-dt);this.magnet=Math.max(0,this.magnet-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
      this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=Math.max(1.5,2.4-this.distance/2500);}
      for(const o of this.objects){
        const previous=o.z;o.z-=this.speed*dt;
        if(o.done)continue;
        const aligned=Math.abs(o.lane-this.laneX)<.42;
        if(o.type==='star'&&this.magnet>0&&o.z<240&&o.z>0&&!o.required){o.done=true;this.stars+=this.bonus>0?2:1;this.event='star';continue;}
        if(previous>=0&&o.z<=0){
          o.done=true;
          if(!aligned&&!o.fullWidth)continue;
          if(o.type==='star'){if(this.eligible(o)){this.stars+=this.bonus>0?2:1;this.event='star';}}
          else if(['magnet','shield','bonus'].includes(o.type)){if(this.eligible(o))this.collectPower(o.type);}
          else{
            const cleared=(o.type==='barrier'&&this.height>65)||(o.type==='gap'&&this.height>45)||(o.type==='arch'&&this.slide>0);
            if(!cleared&&this.invulnerable<=0){
              if(this.shield){this.shield=0;this.event='blocked';}else{this.lives--;this.event='hit';}
              this.invulnerable=1.7;if(this.lives<=0){this.mode='over';break;}
            }
          }
        }
      }
      this.objects=this.objects.filter(o=>o.z>-150&&!o.done);
    }
  }
  window.CosmicDashModel=DashRun;
  if(typeof document==='undefined')return;
  const css=document.createElement('style');css.textContent=`
    #cosmic-dash{position:fixed;inset:0;z-index:2000;background:#070e25;color:#f1f7ff;font-family:system-ui,sans-serif;overflow:hidden;touch-action:none;}
    #cosmic-dash[hidden]{display:none}#cosmic-dash canvas{display:block;width:100%;height:100%;}
    .dash-hud{position:absolute;inset:16px 20px auto;display:flex;justify-content:space-between;gap:12px;pointer-events:none;}
    .dash-hud>div{display:flex;gap:9px;align-items:center}.dash-pill,.dash-button{color:#ecf7ff;background:#101d3be8;border:1px solid #75cbe866;border-radius:14px;padding:10px 16px;font:700 14px system-ui;backdrop-filter:blur(12px)}
    .dash-button{cursor:pointer;pointer-events:auto}.dash-button:hover{background:#244668}.dash-button:focus-visible{outline:3px solid #ffdf80;outline-offset:3px}
    .dash-pill small{display:block;font-size:9px;letter-spacing:2px;color:#90b7ce;margin-bottom:3px}.dash-pill b{font-size:21px;font-variant-numeric:tabular-nums}
    #dash-hearts{color:#ffb0b9;letter-spacing:3px}#dash-power{position:absolute;top:100px;left:50%;transform:translateX(-50%);color:#ffe39b;font-size:14px;font-weight:750;text-align:center;pointer-events:none}
    .dash-cover{position:absolute;inset:0;display:grid;place-items:center;padding:18px;background:linear-gradient(#060b2280,#060b22cc);backdrop-filter:blur(5px)}.dash-cover[hidden]{display:none}
    .dash-panel{max-width:600px;width:100%;text-align:center;border:1px solid #79d8eb55;border-radius:30px;padding:32px;background:linear-gradient(145deg,#112a44ee,#15162fee);box-shadow:0 35px 90px #0008;box-sizing:border-box}
    .dash-eyebrow{font-size:11px;letter-spacing:3px;color:#83e5ef;font-weight:800}.dash-panel h1{font-size:clamp(34px,6vw,58px);line-height:1;margin:17px 0 12px;letter-spacing:-2px}.dash-panel p{color:#b2c7dc;line-height:1.6;font-size:14px;margin:10px 0 18px}.dash-panel h1 span{color:#ffdf93}
    .dash-lessons{display:flex;gap:10px;margin:20px 0}.dash-lessons>div{flex:1;padding:12px 6px;border:1px solid #8ad3e52a;border-radius:14px;background:#ffffff05;font-size:12px;color:#aec5d8}.dash-lessons strong{display:block;color:white;font-size:17px;margin-bottom:6px}
    .dash-primary{background:linear-gradient(120deg,#7ce6ec,#b6f4df);color:#112b40;border:0;font-size:16px;padding:15px 28px;border-radius:15px;font-weight:850;cursor:pointer;min-width:200px}.dash-secondary{background:none;border:0;color:#bcd0e0;cursor:pointer;padding:13px;font-size:13px;display:block;margin:8px auto 0}
    .dash-controls{position:absolute;bottom:max(16px,env(safe-area-inset-bottom));left:20px;right:20px;display:flex;justify-content:space-between;pointer-events:none}.dash-controls>div{display:flex;gap:9px}.dash-controls button{font-size:20px;min-width:55px;min-height:50px;background:#122542b8;user-select:none}
    body:has(#screen-welcome.active) .title-actions-menu{display:grid;grid-template-columns:1fr 1fr;max-width:370px}#btn-title-new-game,#btn-title-continue,#dash-main-launch{grid-column:1/-1}#dash-zone{position:absolute;bottom:25px;left:50%;transform:translateX(-50%);pointer-events:none;font-size:11px;letter-spacing:2px;color:#eefaff;background:#203451cc;border:1px solid #a7e9ff66;border-radius:30px;padding:8px 15px;text-align:center}@media(max-width:600px){#dash-zone{bottom:78px;font-size:10px}}
    #dash-main-launch{background:linear-gradient(120deg,#7b3edb,#157fba);color:#fff3b9;box-shadow:0 5px 24px #aa63ff66}
    #dash-celebration{position:absolute;top:23%;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none;width:min(88%,480px);color:#fff5bc;text-shadow:0 3px 15px #412370;font-weight:900;font-size:clamp(22px,4vw,38px);letter-spacing:2px}#dash-celebration small{display:block;font-size:14px;letter-spacing:1px;color:#edeeff;margin-top:8px}#dash-celebration[hidden]{display:none}
    #dash-launch{border:1px solid #8edfe7;background:linear-gradient(120deg,#183c64,#552d75);color:#fff0b9;border-radius:14px;padding:10px 14px;cursor:pointer;font-weight:800;white-space:nowrap}
    @media(max-width:600px){.dash-hud{inset:10px 8px auto;gap:4px}.dash-hud>div{gap:4px}.dash-pill,.dash-hud .dash-button{padding:8px}.dash-pill b{font-size:17px}.dash-pill small{font-size:8px;letter-spacing:1px}.dash-panel{padding:24px 18px}.dash-controls{left:10px;right:10px}.dash-lessons{gap:5px}.dash-lessons strong{font-size:14px}#dash-launch{font-size:11px;padding:9px 8px}#dash-power{top:86px}}
    @media(max-height:520px){.dash-panel{padding:15px;max-width:570px}.dash-panel h1{font-size:32px;margin:9px}.dash-lessons{margin:10px 0}.dash-panel p{margin:5px}.dash-controls button{min-height:40px}}
  `;document.head.append(css);
  const root=document.createElement('section');root.id='cosmic-dash';root.hidden=true;root.setAttribute('aria-label','Cosmic Dash special endless runner');root.innerHTML=`
    <canvas aria-label="Three-lane cosmic railway. Use arrow keys or swipe to dodge, jump and slide."></canvas>
    <div class="dash-hud"><div><button class="dash-button" id="dash-exit" aria-label="Return to journey map">‹ Map</button><div class="dash-pill"><small>DISTANCE</small><b id="dash-distance">0 m</b></div><div class="dash-pill"><small>STARS</small><b id="dash-stars">0</b></div></div><div><div class="dash-pill"><small>ENERGY</small><b id="dash-hearts">♥♥♥</b></div><button class="dash-button" id="dash-pause" aria-label="Pause run">Ⅱ</button></div></div>
    <div id="dash-zone"></div><div id="dash-celebration" role="status" aria-live="polite" hidden></div><div id="dash-power" role="status" aria-live="polite"></div>
    <div class="dash-controls"><div><button class="dash-button" data-action="left" aria-label="Move left">←</button><button class="dash-button" data-action="right" aria-label="Move right">→</button></div><div><button class="dash-button" data-action="slide" aria-label="Slide">↓</button><button class="dash-button" data-action="jump" aria-label="Jump">↑</button></div></div>
    <div class="dash-cover"><div class="dash-panel"><div class="dash-eyebrow">SPECIAL EXPEDITION · ENDLESS RUNNER</div><h1 id="dash-title">COSMIC <span>DASH</span></h1><p id="dash-description">Race the starlight railway with Cosmo.<br>Dodge hover-trains, leap over breaks and slide beneath energy gates.</p><div class="dash-lessons"><div><strong>← → Dodge</strong>Arrows / A D</div><div><strong>↑ Jump</strong>Space / W</div><div><strong>↓ Slide</strong>Down / S</div></div><p id="dash-best"></p><button class="dash-primary" id="dash-start">Let’s run →</button><button class="dash-secondary" id="dash-back">Back to the journey</button></div></div>`;
  document.body.append(root);
  const launch=document.createElement('button');launch.id='dash-launch';launch.textContent='✦ Cosmic Dash';launch.addEventListener('click',()=>open());document.querySelector('.adventure-select-header')?.append(launch);
  const mainLaunch=document.createElement('button');mainLaunch.id='dash-main-launch';mainLaunch.className='title-btn';mainLaunch.innerHTML='<span class="title-btn-icon">💎</span><span class="title-btn-text">COSMIC DASH</span>';mainLaunch.onclick=()=>open();document.querySelector('.title-actions-menu')?.insertBefore(mainLaunch,document.querySelector('#btn-title-settings'));
  const $=id=>root.querySelector('#'+id),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),cover=root.querySelector('.dash-cover'),run=new DashRun();
  let width=0,height=0,raf=0,last=0,accumulator=0,best=0,notice='',noticeUntil=0,previousFocus=null,inertScreens=[],celebration=null;
  try{best=Math.max(0,Number(localStorage.getItem('cosmicDashBest'))||0);}catch{}
  function resize(){width=root.clientWidth;height=root.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function open(){if(!root.hidden)return;previousFocus=document.activeElement;const fromMain=previousFocus?.id==='dash-main-launch';$('dash-exit').textContent=fromMain?'‹ Menu':'‹ Map';$('dash-exit').setAttribute('aria-label',fromMain?'Return to main menu':'Return to journey map');$('dash-back').textContent=fromMain?'Back to the main menu':'Back to the journey';inertScreens=[...document.querySelectorAll('.screen')].map(el=>({el,inert:el.inert}));inertScreens.forEach(({el})=>el.inert=true);root.hidden=false;run.reset();celebration=null;$('dash-celebration').hidden=true;resize();panel('ready');last=performance.now();accumulator=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
  function close(){inertScreens.forEach(({el,inert})=>el.inert=inert);inertScreens=[];root.hidden=true;cancelAnimationFrame(raf);run.mode='ready';root.querySelectorAll('button').forEach(b=>b.blur());if(location.hash==='#cosmic-dash'){history.replaceState(null,'',location.pathname+location.search);window.showScreen?.('screen-adventure-select');}previousFocus?.focus();}
  function panel(mode){cover.hidden=false;root.querySelector('.dash-lessons').hidden=mode==='over';$('dash-title').innerHTML=mode==='paused'?'TAKE A <span>BREATHER</span>':mode==='over'?'STELLAR <span>RUN!</span>':'COSMIC <span>DASH</span>';$('dash-description').innerHTML=mode==='over'?`${Math.floor(run.distance)} metres · ${run.stars} stars · <strong>${run.score.toLocaleString()} points</strong><br>Every run is a new route. Ready for another?`:mode==='paused'?'Your run is safely paused.':'Race the starlight railway with Cosmo.<br>Jump full-width gold barriers. Slide beneath pink arches.<br>Raised stars and diamonds need a jump; low ones need a slide.<br>On mobile, swipe or use the buttons.';$('dash-best').textContent=`Personal best · ${best.toLocaleString()} points`;$('dash-start').textContent=mode==='paused'?'Resume run →':mode==='over'?'Run again →':'Let’s run →';$('dash-start').focus();}
  function pause(){if(run.mode==='playing'){run.mode='paused';panel('paused');}}
  $('dash-start').onclick=()=>{if(run.mode==='paused')run.mode='playing';else run.start();celebration=null;$('dash-celebration').hidden=true;notice='Jump gold barriers · Slide pink arches · Diamonds need an action!';noticeUntil=run.time+5;cover.hidden=true;canvas.tabIndex=0;canvas.focus();window.Sound?.init();};
  $('dash-exit').onclick=$('dash-back').onclick=close;$('dash-pause').onclick=pause;
  root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();run.action(b.dataset.action);}));
  const keys={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'jump',w:'jump',' ':'jump',ArrowDown:'slide',s:'slide'};
  document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'||e.key.toLowerCase()==='p'){e.preventDefault();if(run.mode==='playing')pause();else if(run.mode==='paused')$('dash-start').click();else close();return;}const action=keys[e.key]||keys[e.key.toLowerCase()];if(action&&run.mode==='playing'){e.preventDefault();if(!e.repeat)run.action(action);}});
  let touch=null;canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>25)run.action(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy<0?'jump':'slide');});canvas.addEventListener('pointercancel',()=>touch=null);
  window.addEventListener('resize',()=>{if(!root.hidden)resize();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&!root.hidden)pause();});window.addEventListener('blur',()=>{if(!root.hidden)pause();});
  function project(lane,z){const scale=230/(Math.max(-60,z)+230),horizon=height*.27;return {x:width*.5+(lane-1)*Math.min(width*.245,240)*scale,y:horizon+(height*.82-horizon)*scale,s:scale};}
  function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function star(x,y,r,color){ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function dog(){const p=project(run.laneX,0),scale=Math.min(width/430,1.2),jump=run.height*scale,y=p.y-jump,x=p.x;ellipse(x,p.y+4,29*scale,9*scale,'#050d2699');ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(run.invulnerable>0&&Math.floor(run.time*12)%2===0)ctx.globalAlpha=.45;const sliding=run.slide>0;ctx.scale(1,sliding?.48:1);const stride=Math.sin(run.time*19)*8,lean=(run.lane-run.laneX)*.2;ctx.rotate(lean);
    if(run.shield){ctx.strokeStyle='#8df4ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-43,46,64,0,0,Math.PI*2);ctx.stroke();}
    ellipse(-18,-10+stride,10,17,'#c8c6c0');ellipse(18,-10-stride,10,17,'#f8f0df');
    ellipse(0,-36,30,35,'#dfddcf');ellipse(0,-42,27,31,'#fff7e6');
    ctx.strokeStyle='#fff8e8';ctx.lineCap='round';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-17,-34);ctx.quadraticCurveTo(-46,-50,-32+Math.sin(run.time*11)*7,-64);ctx.stroke();
    ellipse(-22,-70,12,22,'#d3d0c4');ellipse(22,-70,12,22,'#eae4d5');ellipse(0,-76,26,25,'#fff7e7');
    for(let i=0;i<7;i++)polygon([[-22+i*7,-89],[-26+i*7,-106+(i%2)*7],[-12+i*7,-94]],'#fff7e7');
    ctx.fillStyle='#54dce7';ctx.fillRect(-21,-60,42,7);ellipse(0,-54,5,6,'#ffe297');ctx.restore();
  }
  function object(o){const p=project(o.lane,o.z),s=p.s,w=Math.min(width*.18,160)*s,x=p.x,y=p.y;ctx.save();ctx.globalAlpha=Math.min(1,s*7);
    if(o.type==='star'){star(x,y-(o.required==='jump'?135:o.required==='slide'?24:40)*s,18*s,'#ffe598');ctx.restore();return;}
    if(['shield','magnet','bonus'].includes(o.type)){
      const color={shield:'#57efff',magnet:'#f08aff',bonus:'#ffda57'}[o.type],dy=y-(o.required==='jump'?175:o.required==='slide'?32:65)*s;
      ctx.shadowColor=color;ctx.shadowBlur=22*s+5;ellipse(x,dy,34*s,34*s,color+'33');
      polygon([[x,dy-30*s],[x+24*s,dy-6*s],[x,dy+30*s],[x-24*s,dy-6*s]],color,'#ffffff');
      polygon([[x,dy-30*s],[x,dy+30*s],[x-24*s,dy-6*s]],'#ffffff55');ctx.shadowBlur=0;
      ctx.fillStyle='#243257';ctx.font=`bold ${19*s}px system-ui`;ctx.textAlign='center';ctx.fillText({shield:'S',magnet:'M',bonus:'2×'}[o.type],x,dy+3*s);
      ctx.restore();return;
    }
    if(o.type==='gap'){polygon([[x-w*.6,y-13*s],[x+w*.6,y-13*s],[x+w*.75,y+23*s],[x-w*.75,y+23*s]],'#020611','#eb85bd');ctx.restore();return;}
    if(o.type==='train'){
      polygon([[x-w*.5,y],[x+w*.5,y],[x+w*.5,y-165*s],[x-w*.5,y-165*s]],'#345275','#83c7e2');polygon([[x-w*.5,y-165*s],[x-w*.35,y-190*s],[x+w*.35,y-190*s],[x+w*.5,y-165*s]],'#667ba0');
      ctx.fillStyle='#0a213a';ctx.fillRect(x-w*.36,y-145*s,w*.72,60*s);ctx.fillStyle='#8df4ff';ctx.fillRect(x-w*.38,y-70*s,w*.76,7*s);ellipse(x-w*.3,y-25*s,7*s,7*s,'#ffeba4');ellipse(x+w*.3,y-25*s,7*s,7*s,'#ffeba4');
    }else if(o.type==='barrier'){
      polygon([[x-w*.52,y],[x+w*.52,y],[x+w*.45,y-55*s],[x-w*.45,y-55*s]],'#c68a53','#ffdc92');ctx.strokeStyle='#392947';ctx.lineWidth=10*s;for(let i=-1;i<2;i++){ctx.beginPath();ctx.moveTo(x+i*w*.28-8*s,y-9*s);ctx.lineTo(x+i*w*.28+10*s,y-43*s);ctx.stroke();}
    }else{
      ctx.fillStyle='#8b72d8';ctx.fillRect(x-w*.6,y-135*s,12*s,135*s);ctx.fillRect(x+w*.6-12*s,y-135*s,12*s,135*s);ctx.fillStyle='#f3a6ff';ctx.fillRect(x-w*.6,y-140*s,w*1.2,53*s);ctx.fillStyle='#473563';ctx.font=`bold ${24*s}px system-ui`;ctx.textAlign='center';ctx.fillText('SLIDE ↓',x,y-104*s);
    }if(o.type==='barrier'&&o.fullWidth&&o.lane===1){ctx.fillStyle='#fff7c1';ctx.font=`bold ${24*s}px system-ui`;ctx.textAlign='center';ctx.fillText('JUMP ↑',x,y-75*s);}ctx.restore();
  }
  function draw(){
    const zone=Math.floor(run.distance/600)%3,palettes=[['#297ad1','#a5e9f6','#6bbda8'],['#232163','#8874da','#216d94'],['#774abb','#ffb486','#69aabe']],palette=palettes[zone];$('dash-zone').textContent=['STARLIGHT GARDENS','PRISM LAB','SUNSET SKYWAY'][zone];
    const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,palette[0]);gradient.addColorStop(.48,palette[1]);gradient.addColorStop(1,palette[2]);ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
    const glow=ctx.createRadialGradient(width*.5,height*.25,10,width*.5,height*.25,width*.5);glow.addColorStop(0,'#ffb46a88');glow.addColorStop(1,'#925d9a00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=0;i<65;i++){const x=((i*137.51)%997)/997*width,y=((i*83)%431)/431*height*.44;ellipse(x,y,i%4===0?1.8:1,1,'#d2e5f8');}ellipse(width*.78,height*.16,42,42,'#ffdba8');ellipse(width*.8,height*.14,38,38,'#713b86');
    for(let i=0;i<18;i++){
      const side=i<9?-1:1,j=i%9,bw=width*(.035+j*.002),bx=width*.5+side*(width*.1+j*width*.058),base=height*.32,bh=height*(.06+(j*7%5)*.024);
      ctx.fillStyle=j%2?'#5435a2':'#276b98';ctx.fillRect(bx-bw/2,base-bh,bw,bh);
      ctx.fillStyle='#ffd99caa';for(let row=0;row<4;row++)ctx.fillRect(bx-bw*.25,base-bh+10+row*12,bw*.5,3);
    }
    const landY=project(0,2200).y;
    ctx.fillStyle=zone===1?'#4852a2':zone===2?'#77b8ba':'#66bfa2';ctx.fillRect(0,landY,width,height-landY);
    const farLeft=project(-.65,2000),farRight=project(2.65,2000),nearLeft=project(-.65,-60),nearRight=project(2.65,-60);
    polygon([[farLeft.x,farLeft.y],[farRight.x,farRight.y],[nearRight.x,nearRight.y],[nearLeft.x,nearLeft.y]],'#293d6b','#ce9afa');
    const travel=run.distance/.035;
    for(let i=14;i>=0;i--){const z=i*145-(travel%145);if(z<0)continue;const a=project(-.52,z),b=project(2.52,z);ctx.strokeStyle='#94c9ed55';ctx.lineWidth=Math.max(1,7*a.s);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    for(let lane=0;lane<3;lane++)for(const d of [-.39,.39]){const a=project(lane+d,2000),b=project(lane+d,-60);ctx.strokeStyle=['#ff8fde','#7cffee','#ffd47d'][lane];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    for(let i=9;i>=0;i--){const z=i*220-(travel%220);if(z<0)continue;for(const lane of [-1.2,3.2]){const p=project(lane,z);ctx.fillStyle='#463b8e';ctx.fillRect(p.x-23*p.s,p.y-210*p.s,46*p.s,210*p.s);ctx.fillStyle=i%2?'#ffa2de':'#76ffdf';ctx.fillRect(p.x-5*p.s,p.y-185*p.s,10*p.s,120*p.s);}}
    // Chunky roadside scenery uses the same perspective as the running surface.
    for(let i=10;i>=0;i--){
      const z=i*250-(travel%250);if(z<20)continue;
      for(const side of [-1,1]){
        const p=project(1+side*2.25,z),s=p.s,x=p.x,y=p.y,bw=Math.min(150,width*.27)*s,bh=(170+(i%3)*35)*s;
        if(zone===1){
          polygon([[x-bw*.5,y],[x+bw*.5,y],[x+bw*.5,y-bh],[x-bw*.5,y-bh]],i%2?'#5b4ab3':'#307da7','#a7e7ff');
          ctx.fillStyle='#67ffee';ctx.fillRect(x-bw*.35,y-bh+15*s,bw*.7,18*s);ctx.fillStyle='#e09bff';ctx.fillRect(x-bw*.2,y-bh+55*s,bw*.4,bh*.6);
        }else if(i%3!==0){
          ellipse(x+20*s,y+5*s,85*s,15*s,'#1c75664d');
          polygon([[x+bw*.5,y],[x+bw*.5+30*s,y-30*s],[x+bw*.5+30*s,y-bh-25*s],[x+bw*.5,y-bh]],i%2?'#e6ad99':'#bb83b1');
          polygon([[x-bw*.5,y],[x+bw*.5,y],[x+bw*.5,y-bh],[x-bw*.5,y-bh]],i%2?'#ffe8c2':'#f2c3dd','#fff1db');
          polygon([[x-bw*.6,y-bh],[x,y-bh-70*s],[x+bw*.6,y-bh]],i%2?'#df6c86':'#8a5bb5','#ffddae');
          ctx.fillStyle='#3f6999';ctx.fillRect(x-15*s,y-65*s,30*s,65*s);
          for(const dx of [-42,25]){ctx.fillStyle='#66bbd7';ctx.fillRect(x+dx*s,y-bh+25*s,23*s,36*s);ctx.strokeStyle='#fff2d6';ctx.lineWidth=3*s;ctx.strokeRect(x+dx*s,y-bh+25*s,23*s,36*s);}
        }else{
          ctx.fillStyle='#86735c';ctx.fillRect(x-9*s,y-130*s,18*s,130*s);ellipse(x,y-143*s,57*s,65*s,'#289c8e');ellipse(x-20*s,y-163*s,35*s,41*s,'#74d8a7');
          for(let j=0;j<4;j++)star(x+(j-1.5)*25*s,y-10*s,8*s,['#ffd880','#ffa4d7','#ac92ff','#eeffb1'][j]);
        }
      }
      if(zone===1&&i%3===0){const a=project(-.65,z),b=project(2.65,z);ctx.strokeStyle='#9ceaf9';ctx.lineWidth=12*a.s;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x,a.y-240*a.s);ctx.lineTo(b.x,b.y-240*b.s);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    run.objects.slice().sort((a,b)=>b.z-a.z).forEach(object);dog();drawCelebration();
    if(run.invulnerable>1.4){ctx.fillStyle='#ff9bb51c';ctx.fillRect(0,0,width,height);}
    $('dash-distance').textContent=Math.floor(run.distance)+' m';$('dash-stars').textContent=run.stars;$('dash-hearts').textContent='♥'.repeat(run.lives)+'♡'.repeat(3-run.lives);
    const status=run.bonus>0?`DOUBLE STARS · ${Math.ceil(run.bonus)}s`:run.magnet>0?`STAR MAGNET · ${Math.ceil(run.magnet)}s`:run.shield?'SHIELD READY':run.time<noticeUntil?notice:'';if($('dash-power').textContent!==status)$('dash-power').textContent=status;
  }
  function celebrate(type){
    const names={magnet:['STAR MAGNET','Violet diamond · attracts free stars for 9 seconds'],shield:['COSMIC SHIELD','Cyan diamond · protects you from one impact'],bonus:['DOUBLE STARS','Gold diamond · double star rewards for 10 seconds']};
    celebration={time:run.time,particles:Array.from({length:90},(_,i)=>({x:i%2?.15:.85,y:.5,vx:(Math.random()-.5)*.8,vy:-.2-Math.random()*.6,size:5+Math.random()*9,color:['#ff92d7','#72ffee','#ffe880','#bda1ff','#ffb276'][i%5],angle:Math.random()*6}))};
    $('dash-celebration').innerHTML=`POWER UP!<small>${names[type][0]}<br>${names[type][1]}</small>`;$('dash-celebration').hidden=false;window.Sound?.playCorrect();
  }
  function drawCelebration(){
    if(!celebration)return;const age=run.time-celebration.time;
    if(age>2.8){celebration=null;$('dash-celebration').hidden=true;return;}
    ctx.save();ctx.globalAlpha=Math.min(1,(2.8-age)*1.5);
    for(const p of celebration.particles){ctx.save();ctx.translate((p.x+p.vx*age)*width,(p.y+p.vy*age+.23*age*age)*height);ctx.rotate(p.angle+age*3);star(0,0,p.size,p.color);ctx.restore();}ctx.restore();
  }
  function frame(now){if(root.hidden)return;accumulator+=Math.min((now-last)/1000,.1);last=now;while(accumulator>=1/60){run.step(1/60);accumulator-=1/60;}
    for(const power of run.celebrations.splice(0))celebrate(power);
    if(run.event){const event=run.event;run.event=null;if(event==='jump')window.Sound?.playJump();if(event==='star')window.Sound?.playBonePickup();if(['hit','blocked','magnet','shield'].includes(event)){notice={hit:'Watch your lane! A brief shield gives you time to recover.',blocked:'Shield absorbed the impact!',magnet:'Star magnet activated!',shield:'Shield ready!'}[event];noticeUntil=run.time+3;}}
    if(run.mode==='over'&&cover.hidden){best=Math.max(best,run.score);try{localStorage.setItem('cosmicDashBest',String(best));}catch{}panel('over');}draw();raf=requestAnimationFrame(frame);
  }
  window.CosmicDash={open,close,run};
  if(location.hash==='#cosmic-dash')open();
  window.addEventListener('hashchange',()=>{if(location.hash==='#cosmic-dash')open();});
})();
