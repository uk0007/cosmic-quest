/* Suspended Observatory: independently authored seven-stage climbing route. */
window.buildObsidianObservatory=function(configs,sections,scenes){
 const copy=x=>JSON.parse(JSON.stringify(x)),cfg=copy(configs[3]),art=copy(scenes[3]);
 const sx=x=>Math.round(x*1.125);
 cfg.id=5;cfg.name='Obsidian Observatory';cfg.subtitle='Suspended Towers & Astral Ascents';cfg.levelWidth=18000;cfg.exitX=sx(cfg.exitX);cfg.themeColor='#e6b76c';cfg.caveTint=0xc5a3ff;
 cfg.gateLocations=cfg.gateLocations.map(sx);
 // Rebuild traversal entirely: seven suspended ascents, with safe gate islands between them.
 cfg.platformSpots=[];cfg.movingSpots=[];cfg.collapsingRocks=[];cfg.trenches=[];
 cfg.enemies=[];cfg.hazards=[];cfg.thorns=[];cfg.cutterSpots=[];cfg.cannonSpots=[];cfg.sweepSpots=[];cfg.timingTrials=[];
 cfg.boneOffsets=[];cfg.crystalOffsets=[];cfg.ascentRoutes=[];
 const heights=[[-90,-185,-280,-375,-280,-185,-90],[-90,-190,-300,-410,-300,-190,-90],[-95,-205,-315,-425,-315,-205,-95],[-95,-210,-325,-440,-325,-210,-95],[-100,-220,-340,-460,-340,-220,-100],[-100,-225,-350,-475,-350,-225,-100],[-100,-225,-350,-475,-350,-225,-100]];
 cfg.gateLocations.forEach((gate,i)=>{
  const base=i?cfg.gateLocations[i-1]+390:360;
  const end=gate-350,step=(end-base)/6;
  cfg.trenches.push({startX:base+40,endX:end-40});
  const route=[];
  heights[i].forEach((y,j)=>{
   const p={x:Math.round(base+j*step),y,scale:0.35};route.push(p);
   if((i===1&&j===3)||(i===3&&j===2)||(i===5&&j===4)||(i===6&&j===3))
    cfg.movingSpots.push({...p,distanceY:-65,distanceX:i===6?45:0,duration:2200});
   else if((i===2&&j===3)||(i===4&&j===2)||(i===6&&j===5))
    cfg.collapsingRocks.push({...p,warningMs:1100});
   else cfg.platformSpots.push(p);
  });
  cfg.ascentRoutes.push(route);
  cfg.boneOffsets.push({x:route[1].x,y:route[1].y-70},{x:route[5].x,y:route[5].y-70});
  if(i<5)cfg.crystalOffsets.push({x:route[3].x,y:route[3].y-70});
  // Aerial sentries and elevated lanes make the climb itself the encounter.
  cfg.enemies.push({type:'fly',x:route[4].x,y:route[4].y-100,minX:route[4].x-80,maxX:route[4].x+80,speed:65+i*5});
  if(i>0)cfg.enemies.push({type:'fly',x:route[2].x,y:route[2].y-100,minX:route[2].x-70,maxX:route[2].x+70,speed:65});
  if(i>=2)cfg.sweepSpots.push({x:(route[3].x+route[4].x)/2,y:route[3].y-30,range:65});
  if(i>=3)cfg.cannonSpots.push({x:route[5].x+80,y:route[5].y-75,minX:route[4].x-60,maxX:route[5].x+100,period:1850-(i-3)*100});
 });
 cfg.boneOffsets.push({x:cfg.exitX-210,y:-65});
 const names=['First Ascent','Elevator Spires','Crumbling Stairway','Cannon Skywalk','Blade Gallery','Orbital Liftworks','Final Sky Citadel'];
 const keys=['rock_cairn','rune_tablet','rock_spire','rune_arch','rock_peak','rune_pillar','rock_spire'];
 art.palette={night:[0.12,0.09,0.20],haze:[0.38,0.32,0.42]};
 art.sections.forEach((s,i)=>{
  const x=sx(s.landmark[1]);s.name=names[i];s.landmark=[keys[i],x,i===6?0.8:1.1];
  const start=i?cfg.gateLocations[i-1]+320:180;
  s.decor=[['rock_spire',start,0.65],['rune_spiral',start+340,1.35],['crystal_cluster',start+680,0.9],['rock_stack',cfg.gateLocations[i]-300,1.1]];
 });
 ['distant','groundPatches'].forEach(key=>art[key].forEach(item=>item[1]=sx(item[1])));
 configs[5]=cfg;scenes[5]=art;sections[5]=sections[3].map((s,i)=>[names[i],keys[i],art.sections[i].landmark[1],'Mandatory platform ascent, aerial sentries and timed landings','Sky-route collectibles / gate reward']);
};
