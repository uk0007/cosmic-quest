/* Glacier Crown: alternating ascents, exposed ridges and measured descents. */
window.buildGlacierCrown=function(levels,sections,scenes){
 const c=JSON.parse(JSON.stringify(levels[7]));
 Object.assign(c,{id:8,name:'Glacier Crown',subtitle:'Snowbound Ascents · Icefall Ridges',levelWidth:17400,exitX:17050,exitHeight:-180,descentDepth:650,worldTop:-1500,themeColor:'#d3fbff',caveTint:0x8deaff,glacier:true,iceTraversal:true,authoredTraversal:true});
 for(const key of ['platformSpots','movingSpots','collapsingRocks','phaseSpots','fallingHazards','heatedSpots','shardSpots','hazards','enemies','thorns','scenery','plants','cutterSpots','timingTrials','sweepSpots','cannonSpots','signatureHazards','ambientButterflies','ambientGrass','ambientBubbles','ambientFlies','boneOffsets','crystalOffsets'])c[key]=[];
 c.gateLocations=[2100,4400,6800,9200,11700,14200,16600];c.gateHeights=[-460,-160,-720,-260,-850,-80,-180];
 const names=['Snowstep Rise','Blue Crevasse','Crown Elevator','Icefall Descent','The Knife Ridge','Glacier Basin','Aurora Crossing'];
 // Different elevation profiles: stairs, bowl, lift shaft, falling ledges, ridge, basin, final saddle.
 const routes=[
 [[540,-60],[820,-150],[1100,-245],[1380,-340],[1680,-440]],
 [[2580,-400],[2830,-270],[3090,-100],[3380,80],[3680,-20],[3950,-120]],
 [[4900,-240],[5150,-345],[5430,-455],[5730,-570],[6030,-675],[6320,-720]],
 [[7300,-665],[7560,-520],[7820,-380],[8100,-190],[8390,-100],[8690,-225]],
 [[9700,-350],[9970,-455],[10250,-565],[10540,-670],[10830,-780],[11150,-840]],
 [[12200,-730],[12470,-555],[12730,-370],[13030,-190],[13320,40],[13610,-30]],
 [[14700,-170],[14970,-280],[15240,-395],[15530,-320],[15810,-225],[16100,-180]]
 ];
 c.solidSegments=[{startX:-100,endX:380,y:0},...c.gateLocations.map((x,i)=>({startX:x-200,endX:i===6?17600:x+350,y:c.gateHeights[i]}))];
 c.trenches=c.solidSegments.slice(1).map((s,i)=>({startX:c.solidSegments[i].endX,endX:s.startX,fallY:Math.max(s.y,c.solidSegments[i].y,...routes[i].map(p=>p[1]))+360}));
 const moving=new Set([1100,3090,5430,6030,8390,10540,12730,15240,15810]),brittle=new Set([2830,7820,8100,10250,13030,15530]);
 c.ascentRoutes=routes.map((route,i)=>route.map(([x,y],j)=>{
  const p={x,y,scale:j===route.length-1?.55:.35};
  if(moving.has(x))c.movingSpots.push({...p,distanceY:i===2?-80:0,distanceX:i===2?0:65,duration:2200+(i%3)*350});
  else if(brittle.has(x))c.collapsingRocks.push({...p,warningMs:900,resetMs:3200});
  else c.platformSpots.push(p);
  if(j%2===0)c.boneOffsets.push({x,y:y-100});
  // Clear landing markers warn before each shard falls; gate terraces remain safe.
  if(j===1||j===route.length-1||i>=3&&j===3)c.fallingHazards.push({x:x+45,y:y-43,period:3400+(i%3)*450});
  if(j===2||j===route.length-1)c.enemies.push({type:'fly',skin:'biome-8-fly',x:x-50,y:y-190,minX:x-135,maxX:x+125,speed:65+i*6,behavior:'frost',dives:i>=2,hoverRadius:22});
  if(j===route.length-1){c.enemies.push({type:i%2?'armored':'ground',skin:'biome-8-ground',x:x+50,y:y-95,minX:x-130,maxX:x+130,speed:45+i*3});c.crystalOffsets.push({x:x-60,y:y-105});}
  return p;
 }));
 c.totalBones=c.boneOffsets.length;c.totalCrystals=c.crystalOffsets.length;
 levels[8]=c;scenes[8]={...JSON.parse(JSON.stringify(scenes[7])),palette:{night:[.045,.13,.23],haze:[.26,.54,.66]}};
 sections[8]=names.map((name,i)=>[name,'rock_peak',routes[i][2][0],'Climb, brake and watch the icefall warning','Safe snow terrace']);
};

window.paintGlacierCrown=function(scene,cfg,groundY){
 const key='glacier-crown-panorama';
 if(!scene.textures.exists(key)){
  const tex=scene.textures.createCanvas(key,2048,1024),c=tex.context;
  const sky=c.createLinearGradient(0,0,0,1024);sky.addColorStop(0,'#183758');sky.addColorStop(.48,'#609eb9');sky.addColorStop(1,'#d7f7fc');c.fillStyle=sky;c.fillRect(0,0,2048,1024);
  // Soft aurora curtains above an uninterrupted, layered glacier skyline.
  for(let j=0;j<5;j++){c.beginPath();for(let x=0;x<=2048;x+=16){const y=130+j*22+Math.sin(x*Math.PI*2/2048+j*.2)*80;x?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=['#90ffe622','#b5f4ff22','#c4a9ff22'][j%3];c.lineWidth=27;c.stroke();}
  for(let layer=0;layer<3;layer++)for(let n=0;n<6;n++)for(const wrap of [-2048,0,2048]){
   const x=n*2048/6+layer*80+wrap,peak=270+layer*115+(n*71%140),base=900+layer*65;
   c.beginPath();c.moveTo(x-280,base);c.lineTo(x+35,peak);c.lineTo(x+365,base);c.closePath();c.fillStyle=['#7aacc2','#a3d0dd','#5797b4'][layer];c.fill();
   c.beginPath();c.moveTo(x+35,peak);c.lineTo(x-55,peak+190);c.lineTo(x+8,peak+155);c.lineTo(x+58,peak+216);c.lineTo(x+91,peak+163);c.lineTo(x+136,peak+194);c.closePath();c.fillStyle=['#ceeef3','#f0fdff','#d3f9ff'][layer];c.fill();
   c.beginPath();c.moveTo(x+35,peak);c.lineTo(x+95,base);c.lineTo(x+365,base);c.closePath();c.fillStyle=['#5b8daa55','#639fba55','#346c9555'][layer];c.fill();
  }
  tex.refresh();
 }
 scene.viewportBackdrop=scene.add.tileSprite(0,0,1,1,key).setScrollFactor(0).setDepth(8);scene.fitViewportBackdrop(scene.scale.width,scene.scale.height);
 cfg.solidSegments.forEach((seg,i)=>{
  const g=scene.add.graphics().setDepth(23),y=groundY+seg.y;
  for(let j=0;j<3;j++){const x=seg.startX+35+j*50;g.fillStyle(0x8acde0,.9);g.fillTriangle(x-24,y,x,y-90-j*32,x+31,y);g.lineStyle(2,0xddffff,.8);g.lineBetween(x,y-90-j*32,x+5,y-12);}
  if(i)scene.add.text(seg.startX+30,y-175,cfg.sections[i-1].name,{fontSize:'18px',color:'#f1ffff',stroke:'#285879',strokeThickness:4}).setDepth(25);
 });
 scene.add.text(100,groundY-190,'GLACIER CROWN\nWatch the gold markers before ice falls',{fontSize:'20px',color:'#efffff',stroke:'#284d6d',strokeThickness:4}).setDepth(35);
 // A bounded screen-space snowfall layer follows the camera through every elevation.
 const snow=scene.add.graphics().setScrollFactor(0).setDepth(76);
 const flakes=Array.from({length:85},(_,i)=>({x:(i*137.7)%1,y:(i*.618)%1,size:1+i%3,speed:18+i%29}));
 const update=(_time,delta)=>{
  const cam=scene.cameras.main,z=cam.zoom||1,w=scene.scale.width/z,h=scene.scale.height/z;
  snow.clear();snow.setPosition(scene.scale.width/2-w/2,scene.scale.height/2-h/2);
  flakes.forEach((f,i)=>{f.y=(f.y+delta*.001*f.speed/h)%1;f.x=(f.x+delta*.000012)%1;snow.fillStyle(0xf1ffff,.35+(i%3)*.18);snow.fillCircle(f.x*w,f.y*h,f.size/z);});
 };
 scene.events.on('update',update);scene.events.once('shutdown',()=>scene.events.off('update',update));
};
