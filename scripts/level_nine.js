/* The Chrono Rift: authored routes and reusable, deterministic time mechanics. */
(function(root){
 class PhasePlatform {
  constructor(config){Object.assign(this,{solidDuration:4200,warningDuration:1100,phasedDuration:1700,returnDuration:650,phaseOffset:0},config);this.reset();}
  reset(){this.clock=0;this.state='SOLID';}
  sample(delta){this.clock+=delta;const total=this.solidDuration+this.warningDuration+this.phasedDuration+this.returnDuration,t=((this.clock+this.phaseOffset)%total+total)%total;
   if(t<this.solidDuration)return {state:'SOLID',alpha:1,solid:true};
   if(t<this.solidDuration+this.warningDuration)return {state:'WARNING',alpha:.65+.3*Math.sin(t/65),solid:true};
   if(t<total-this.returnDuration)return {state:'PHASED',alpha:.12,solid:false};
   const progress=(t-(total-this.returnDuration))/this.returnDuration;return {state:'RETURNING',alpha:.15+.85*progress,solid:progress>=.85};
  }
 }
 class GravityZone {
  constructor(config){Object.assign(this,config);}
  contains(x,y){return x>=this.x&&x<=this.x+this.width&&y>=this.y&&y<=this.y+this.height;}
 }
 class CosmicFallingOrb {
  constructor(config){Object.assign(this,{warningTime:1100,fallSpeed:620,damage:8,respawnDelay:2300},config);this.reset();}
  reset(){this.clock=0;this.state='WAIT';this.hit=false;}
  sample(delta,nearby){if(!nearby){this.reset();return this.state;}this.clock+=delta;const fallTime=470/this.fallSpeed*1000,total=this.warningTime+fallTime+350+this.respawnDelay,t=this.clock%total;
   const next=t<this.warningTime?'WARNING':t<this.warningTime+fallTime?'FALLING':t<this.warningTime+fallTime+350?'IMPACT':'WAIT';if(next==='WARNING'&&this.state!=='WARNING')this.hit=false;this.state=next;this.progress=next==='FALLING'?(t-this.warningTime)/fallTime:0;return next;
  }
 }
 root.ChronoMechanics={PhasePlatform,GravityZone,CosmicFallingOrb};
 root.buildChronoRift=function(levels,sections,scenes){
  const c=JSON.parse(JSON.stringify(levels[8]));Object.assign(c,{id:9,name:'The Chrono Rift',subtitle:'Phase Bridges · Gravity Chambers · Rotating Ruins',chrono:true,glacier:false,iceTraversal:false,levelWidth:17500,exitX:17200,exitHeight:-240,worldTop:-1500,descentDepth:500,themeColor:'#bb9dff',caveTint:0x82eaff});
  for(const key of ['platformSpots','movingSpots','collapsingRocks','phaseSpots','fallingHazards','heatedSpots','shardSpots','hazards','enemies','thorns','scenery','plants','cutterSpots','timingTrials','sweepSpots','cannonSpots','signatureHazards','ambientButterflies','ambientGrass','ambientBubbles','ambientFlies','boneOffsets','crystalOffsets'])c[key]=[];
  c.diamondGateIndices=[1,3,6];c.riftPhases=[];c.orbitSpots=[];c.orbSpots=[];
  c.gateLocations=[1750,3850,6100,8500,10800,13300,16700];c.gateHeights=[-100,-180,-400,-300,-120,-430,-240];
  const names=['Fractured Entry','Phase Bridge','Gravity Chamber','Rotating Ruins','Cosmic Storm','Time Collapse','Heart of the Rift'];
  const landmarks=['Broken Time Arch','Phase Bridge','Gravity Crystal','Rotating Ruin','Cosmic Storm Obelisk','Time Collapse Tower','Heart of the Rift'];
  c.solidSegments=[{startX:-100,endX:380,y:0},...c.gateLocations.map((x,i)=>({startX:x-210,endX:i===6?17800:x+350,y:c.gateHeights[i]})),{startX:9030,endX:9600,y:-190},{startX:9770,endX:10300,y:-120}].sort((a,b)=>a.startX-b.startX);
  c.trenches=c.solidSegments.slice(1).map((s,i)=>({startX:c.solidSegments[i].endX,endX:s.startX,fallY:Math.max(s.y,c.solidSegments[i].y)+480}));
  const routes=[
   [[540,-40,'stone'],[810,-80,'move'],[1090,-100,'phase'],[1380,-100,'stone']],
   [[2340,-130,'phase'],[2630,-160,'phase'],[2920,-180,'phase'],[3210,-180,'phase'],[3500,-180,'phase']],
   [[4360,-220,'stone'],[4690,-370,'stone'],[5020,-540,'stone'],[5350,-590,'move'],[5680,-440,'stone']],
   [[6640,-380,'stone'],[6940,-410,'orbit'],[7270,-410,'orbit'],[7580,-360,'stone'],[7890,-320,'move'],[8180,-300,'stone']],
   [[8980,-210,'stone'],[9650,-150,'stone'],[10430,-120,'stone']],
   [[11310,-180,'stone'],[11600,-250,'phase'],[11900,-340,'move'],[12230,-510,'stone'],[12570,-490,'phase'],[12900,-430,'stone']],
   [[13820,-380,'stone'],[14120,-330,'move'],[14420,-300,'stone'],[14700,-260,'stone'],[15000,-240,'phase'],[15290,-240,'phase'],[15580,-240,'phase'],[15870,-240,'phase'],[16160,-240,'phase'],[16420,-240,'stone']]
  ];
  c.ascentRoutes=routes.map((r,i)=>r.map(([x,y,kind],j)=>{
   const p={x,y,scale:.35,kind};
   if(kind==='phase')c.riftPhases.push({...p,solidDuration:i===0?6500:5400,warningDuration:1200,phasedDuration:i===6?2200:1800,phaseOffset:i===1?-j*1000:i===6?-(j-4)*1000:0,sequence:i===1?'phase':i===6?'chrono':null});
   else if(kind==='move')c.movingSpots.push({...p,distanceX:50,distanceY:i===2?-35:0,duration:2800});
   else if(kind==='orbit')c.orbitSpots.push({...p,radiusX:55,radiusY:55,period:6800,direction:j%2?1:-1});
   else c.platformSpots.push(p);
   c.boneOffsets.push({x,y:y-100});return p;
  }));
  c.gravityZones=[{x:4250,y:-1150,width:1500,height:1350,gravityMultiplier:.65},{x:11700,y:-1250,width:1050,height:1350,gravityMultiplier:.65}];
  c.platformSpots.push({x:12220,y:-760,scale:.35,optional:true},{x:12520,y:-780,scale:.35,optional:true});
  c.boneOffsets.push({x:12220,y:-840},{x:12370,y:-890},{x:12520,y:-860});c.energyCrystal={x:12520,y:-860};
  c.enemies=[{type:'fly',skin:'biome-5-fly',x:5200,y:-780,minX:5010,maxX:5450,speed:60,hoverRadius:20},{type:'ground',skin:'biome-5-ground',x:10040,y:-180,minX:9850,maxX:10160,speed:55}];
  c.orbSpots=[{x:9170,y:-190},{x:9450,y:-190},{x:9900,y:-120},{x:10230,y:-120},{x:14500,y:-343},{x:16420,y:-283}].map((p,i)=>({...p,warningTime:1100,fallSpeed:580,damage:8,respawnDelay:2600,delay:i<4?i*420:0}));
  c.chase={startX:8920,endX:10500,speed:160};
  c.totalBones=c.boneOffsets.length;c.totalCrystals=0;
  levels[9]=c;scenes[9]={...JSON.parse(JSON.stringify(scenes[8])),palette:{night:[.008,.008,.035],haze:[.16,.035,.27]}};
  sections[9]=names.map((name,i)=>[name,'rune_pillar',routes[i][0][0],landmarks[i],'Follow the bone trail / stable gate terrace']);
 };
})(typeof window==='undefined'?globalThis:window);

window.ChronoRiftSystem=class {
 constructor(scene){
  this.scene=scene;this.clock=0;this.gravity=1;this.zone=null;const s=scene,c=s.levelConfig,g=s.groundY;
  this.audio=(name)=>{s.events.emit('chrono-audio',name);window.Sound?.playChronoEvent?.(name);};
  this.phases=c.riftPhases.map(p=>{const sprite=s.platforms.create(p.x,g+p.y,s.platformTexture(9,p.scale)).setDepth(30).refreshBody();sprite.body.setSize(sprite.width,18).setOffset(0,0);sprite.body.checkCollision.left=sprite.body.checkCollision.right=sprite.body.checkCollision.down=false;const glow=s.add.ellipse(p.x,g+p.y-40,sprite.width+15,22,0xbd8aff,.15).setDepth(29);return {p,sprite,glow,model:new window.ChronoMechanics.PhasePlatform(p),state:'SOLID',activated:!p.sequence};});
  this.zones=c.gravityZones.map(z=>new window.ChronoMechanics.GravityZone({...z,y:g+z.y}));
  this.orbits=c.orbitSpots.map(p=>{const sprite=s.movingPlatforms.create(p.x,g+p.y,s.platformTexture(9,p.scale)).setDepth(30);sprite.body.setSize(sprite.width,18).setOffset(0,0);sprite.body.checkCollision.left=sprite.body.checkCollision.right=sprite.body.checkCollision.down=false;return {p,sprite};});
  const orbKey='chrono-falling-orb';if(!s.textures.exists(orbKey)){const t=s.textures.createCanvas(orbKey,96,96),ctx=t.context,gr=ctx.createRadialGradient(48,48,3,48,48,47);gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,'#b1f9ff');gr.addColorStop(.55,'#965dff');gr.addColorStop(1,'rgba(211,70,255,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,96,96);t.refresh();}
  this.orbs=c.orbSpots.map(p=>{const sprite=s.physics.add.image(p.x,g+p.y-470,orbKey).setDepth(64);sprite.body.setAllowGravity(false);sprite.body.setCircle(24,24,24);sprite.damage=p.damage; sprite.hazardLabel='Cosmic orb';sprite.setVisible(false);sprite.body.enable=false;
   const marker=s.add.graphics().setDepth(62),pulse=s.add.ellipse(p.x,g+p.y,10,6,0xcbaaff,0).setDepth(61);const item={p,sprite,marker,pulse,model:new window.ChronoMechanics.CosmicFallingOrb(p),previous:'WAIT',delay:p.delay||0};
   s.physics.add.overlap(s.dog,sprite,(dog,h)=>{if(!item.model.hit){item.model.hit=true;s.handleDogHazardCollision(dog,h);h.body.enable=false;h.setVisible(false);}});return item;
  });
  this.chase=s.physics.add.image(c.chase.startX-350,g-265,orbKey).setDisplaySize(100,420).setTint(0xff70ec).setDepth(24);this.chase.body.setAllowGravity(false);this.chase.damage=8;this.chase.hazardLabel='Time storm';this.chase.body.enable=false;this.chase.setVisible(false);this.chaseStarted=false;
  s.physics.add.overlap(s.dog,this.chase,(dog,h)=>{s.handleDogHazardCollision(dog,h);this.chase.x-=180;this.chase.body.updateFromGameObject();});
  const e=c.energyCrystal;this.energy=s.physics.add.image(e.x,g+e.y,'crystal').setTint(0x66ffca).setScale(.65).setDepth(50);this.energy.body.setAllowGravity(false);s.physics.add.overlap(s.dog,this.energy,()=>{if(!this.energy.active)return;this.energy.disableBody(true,true);window.CosmicAdventureEngine.gainRiftEnergy();s.showFloatingText(e.x,g+e.y,'+15 ENERGY','#8dffda');window.Sound?.playPowerup?.();});
  this.audio('RIFT_AMBIENCE');this.reset();
 }
 reset(){const s=this.scene;this.clock=0;this.gravity=1;this.zone=null;s.dog.body.setGravityY(0);s.ridingPlatform=null;
  this.phases.forEach(h=>{h.model.reset();h.state='SOLID';h.activated=!h.p.sequence;h.sprite.body.enable=true;h.sprite.setAlpha(1);});
  this.orbs.forEach(h=>{h.model.reset();h.delay=h.p.delay||0;h.previous='WAIT';h.sprite.body.enable=false;h.sprite.setVisible(false);h.marker.clear();h.pulse.setAlpha(0);});
  s.movingPlatforms.getChildren().forEach(mp=>{const p=s.levelConfig.movingSpots.find(p=>p.x===mp.x)||mp.riftOrigin;if(p){mp.riftOrigin=p;s.tweens.getTweensOf(mp).forEach(t=>t.restart());mp.setPosition(p.x,s.groundY+p.y);mp.body.updateFromGameObject();mp.prevX=mp.x;mp.prevY=mp.y;}});
  this.orbits.forEach(({p,sprite})=>{sprite.setPosition(p.x,s.groundY+p.y);sprite.body.updateFromGameObject();sprite.prevX=sprite.x;sprite.prevY=sprite.y;});this.chaseStarted=false;this.chase.setVisible(false);this.chase.body.enable=false;
 }
 update(delta){const s=this.scene,d=s.dog,g=s.groundY;this.clock+=delta;
  const zone=this.zones.find(z=>z.contains(d.x,d.y));if(zone!==this.zone){this.audio(zone?'GRAVITY_ENTER':'GRAVITY_EXIT');this.zone=zone;}
  this.gravity+=( (zone?.gravityMultiplier||1)-this.gravity)*(1-Math.exp(-delta/220));d.body.setGravityY(s.physics.world.gravity.y*(this.gravity-1));
  this.phases.forEach(h=>{if(!h.activated&&d.x>(h.p.sequence==='phase'?2140:14700))h.activated=true;
   const v=h.model.sample(h.activated?delta:0),b=h.sprite.body,db=d.body,inside=db.right>b.left&&db.left<b.right&&db.bottom>b.top+1&&db.top<b.bottom;
   // Enabling a platform within the dog would cause a collision pop; wait until clear.
   b.enable=v.solid&&(b.enable||!inside);h.sprite.setAlpha(v.alpha).setTint(v.state==='WARNING'?0xffd596:v.state==='RETURNING'?0x8cfcff:0xffffff);h.glow.setAlpha(v.state==='WARNING'?.6:v.state==='RETURNING'?v.alpha*.6:.12);
   if(h.state!==v.state){this.audio(v.state==='WARNING'?'PHASE_WARNING':v.state==='PHASED'?'PHASE_DISAPPEAR':v.state==='RETURNING'?'PHASE_RETURN':'PHASE_SOLID');h.state=v.state;}
  });
  this.orbits.forEach(({p,sprite})=>{const a=this.clock/p.period*Math.PI*2*p.direction;sprite.setPosition(p.x+Math.sin(a)*p.radiusX,g+p.y+(Math.cos(a)-1)*p.radiusY);sprite.body.updateFromGameObject();});
  this.orbs.forEach(h=>{const near=Math.abs(d.x-h.p.x)<650&&Math.abs(d.y-(g+h.p.y))<800;if(near&&h.delay>0){h.delay-=delta;return;}const state=h.model.sample(delta,near);h.marker.clear();
   if(state==='WARNING'){h.marker.lineStyle(3,0xffd582,.65+.3*Math.sin(this.clock/90));h.marker.strokeEllipse(h.p.x,g+h.p.y,100,22);h.marker.lineBetween(h.p.x,g+h.p.y-75,h.p.x,g+h.p.y-28);h.marker.lineBetween(h.p.x-10,g+h.p.y-42,h.p.x,g+h.p.y-28);h.marker.lineBetween(h.p.x+10,g+h.p.y-42,h.p.x,g+h.p.y-28);}
   h.sprite.setVisible(state==='FALLING'&&!h.model.hit);h.sprite.body.enable=state==='FALLING'&&!h.model.hit;if(state==='FALLING')h.sprite.body.reset(h.p.x,g+h.p.y-470+h.model.progress*470);
   h.pulse.setAlpha(state==='IMPACT'?.45:0).setDisplaySize(110+(this.clock%350)*.3,18+(this.clock%350)*.06);
   if(state!==h.previous){if(state==='WARNING')this.audio('COSMIC_ORB_WARNING');if(state==='IMPACT')this.audio('COSMIC_ORB_IMPACT');h.previous=state;}
  });
  const c=s.levelConfig.chase;if(d.x>c.startX&&d.x<c.endX){if(!this.chaseStarted){this.chaseStarted=true;this.chase.x=c.startX-300;}this.chase.x+=c.speed*delta/1000;this.chase.y=g-250;this.chase.body.updateFromGameObject();this.chase.setVisible(true);this.chase.body.enable=true;}else{this.chase.setVisible(false);this.chase.body.enable=false;}
 }
};

window.paintChronoRift=function(s,c,g){
 const rune=(x,y,size)=>{const art=s.add.graphics({x,y}).setDepth(18);art.lineStyle(3,0x82e9ff,.65);art.strokeCircle(0,0,size);art.strokeCircle(0,0,size*.78);for(let j=0;j<12;j++){const a=j*Math.PI/6;art.lineBetween(Math.cos(a)*size*.82,Math.sin(a)*size*.82,Math.cos(a)*size,Math.sin(a)*size);}return art;};
 c.sections.forEach((sec,i)=>{
  const x=sec.landmarkX,y=g+(c.ascentRoutes[i][0].y)-230;
  s.add.text(x-140,y-140,sec.traversal.toUpperCase(),{fontSize:'19px',color:'#cff5ff',stroke:'#180d36',strokeThickness:4}).setDepth(25);
  if(i===3){const wheel=rune(7100,g-440,220);s.tweens.add({targets:wheel,rotation:Math.PI*2,duration:18000,repeat:-1});}
  else if(i===2){const crystal=s.add.image(x,y,'crystal').setScale(1.7).setTint(0xb391ff).setAlpha(.75).setDepth(18);s.tweens.add({targets:crystal,y:y-40,duration:2400,yoyo:true,repeat:-1});}
  else if(i===0){const arch=s.add.graphics().setDepth(18);arch.lineStyle(24,0x555575,.8);arch.beginPath();arch.arc(x,y+120,180,Math.PI,Math.PI*1.85);arch.strokePath();arch.lineStyle(3,0x6febff,.8);arch.lineBetween(x-160,y+90,x-180,y-5);}
  else if(i===4||i===5){s.add.image(x,y+160,'rune_pillar').setOrigin(.5,1).setScale(1.2).setTint(0xaa9cfa).setAlpha(.75).setDepth(18);rune(x,y,65);}
  else rune(x,y,i===6?155:95);
 });
 c.gravityZones.forEach(z=>{const a=s.add.graphics().setDepth(15);a.fillStyle(0x947aff,.055);a.fillRect(z.x,g+z.y,z.width,z.height);a.lineStyle(2,0x8eeeff,.35);a.lineBetween(z.x,g+z.y,z.x,g+z.y+z.height);a.lineBetween(z.x+z.width,g+z.y,z.x+z.width,g+z.y+z.height);
  s.add.text(z.x,g-100,'LOW GRAVITY · FLOAT HIGHER',{fontSize:'18px',color:'#b2faff',stroke:'#221446',strokeThickness:4}).setDepth(24);
  for(let i=0;i<24;i++){const dust=s.add.circle(z.x+(i*173)%z.width,g+z.y+(i*97)%z.height,2+i%3,i%2?0x8af1ff:0xc38cff,.45).setDepth(19);s.tweens.add({targets:dust,y:dust.y-120,alpha:.1,duration:2500+i*75,repeat:-1,yoyo:true});}
 });
 s.add.text(870,g-290,'PHASE STONES\nGold flicker = jump soon\nGhost stones cannot hold you',{fontSize:'17px',color:'#e5ddff',stroke:'#201330',strokeThickness:4}).setDepth(25);
 s.add.text(14700,g-480,'CHRONO BRIDGE →\nFollow the returning cyan stones',{fontSize:'18px',color:'#c7fbff',stroke:'#201330',strokeThickness:4}).setDepth(25);
 for(let i=0;i<35;i++){const x=i*490+150,y=g-500+(i%5)*140;const rock=s.add.image(x,y,'rock_low').setScale(.12+(i%3)*.05).setTint(0x736397).setAlpha(.35).setDepth(12);s.tweens.add({targets:rock,y:y-35,angle:i%2?15:-15,duration:4200+i*40,yoyo:true,repeat:-1});}
};
window.setupChronoSky=function(bg){
 if(bg.chronoSky)return;const group=new THREE.Group();bg.scene.add(group);bg.chronoSky=group;
 const vortex=new THREE.Group();vortex.position.set(100,110,-150);group.add(vortex);bg.chronoVortex=vortex;
 for(let j=0;j<5;j++){const points=[];for(let i=0;i<150;i++){const a=i/149*Math.PI*5+j*Math.PI*.4,r=12+i*1.4;points.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,i*.12));}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:j%2?0xb665ff:0x68f3ff,transparent:true,opacity:.35}));vortex.add(line);}
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 uv0;uniform float time;void main(){vec2 p=(uv0-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float arms=pow(.5+.5*sin(a*5.-r*24.+time),5.);float glow=exp(-pow((r-.28)*12.,2.));float fade=smoothstep(1.,.65,r)*smoothstep(.05,.2,r);vec3 color=mix(vec3(.34,.08,.9),vec3(.12,.85,1.),.5+.5*sin(a+r*12.));gl_FragColor=vec4(color,(arms*.22+glow*.45)*fade);}' });
 const veil=new THREE.Mesh(new THREE.PlaneGeometry(520,520),material);veil.position.z=-12;vortex.add(veil);bg.chronoVortexMaterial=material;
 const crackPoints=[[-530,280],[-445,242],[-475,196],[-390,160],[-416,108],[-337,80]].map(([x,y])=>new THREE.Vector3(x,y,-180));
 bg.chronoCrack=new THREE.Line(new THREE.BufferGeometry().setFromPoints(crackPoints),new THREE.LineBasicMaterial({color:0xc677ff,transparent:true,opacity:.1}));group.add(bg.chronoCrack);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(52,8,12,64),new THREE.MeshBasicMaterial({color:0xe381ff,transparent:true,opacity:.4}));vortex.add(ring);
 const debrisGeometry=new THREE.OctahedronGeometry(12),debrisMaterial=new THREE.MeshStandardMaterial({color:0x817fa9,metalness:.5,roughness:.55});
 for(let i=0;i<22;i++){const d=new THREE.Mesh(debrisGeometry,debrisMaterial);d.position.set(Math.sin(i*2.4)*650,Math.cos(i*1.7)*380,-100-i*20);d.scale.setScalar(.4+i%3*.4);group.add(d);}
};
