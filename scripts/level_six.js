/* Emberfall Caldera: volcanic stepping ridges and alternating thermal lifts. */
window.buildEmberfallCaldera=function(configs,sections,scenes){
 const copy=x=>JSON.parse(JSON.stringify(x)),cfg=copy(configs[5]),art=copy(scenes[5]);
 cfg.id=6;cfg.name='Emberfall Caldera';cfg.subtitle='Lava Rivers & Shattered Basalt';cfg.levelWidth=19000;cfg.exitX=18600;cfg.themeColor='#ffb165';cfg.caveTint=0xffb078;
 cfg.gateLocations=[2350,4850,7350,9850,12350,14850,17850];
 for(const key of ['platformSpots','movingSpots','collapsingRocks','trenches','enemies','hazards','thorns','cutterSpots','cannonSpots','sweepSpots','timingTrials','boneOffsets','crystalOffsets','ascentRoutes'])cfg[key]=[];
 const names=['Ashen Shore','Thermal Steps','Fractured Ridge','Ember Rapids','Basalt Teeth','Furnace Crossing','Heart of the Caldera'];
 const patterns=[[-90,-180,-270,-180,-270,-180,-90],[-90,-200,-310,-210,-320,-200,-90],[-95,-210,-320,-220,-330,-210,-95],[-100,-220,-340,-220,-340,-220,-100],[-100,-220,-340,-460,-340,-220,-100],[-100,-220,-340,-225,-350,-225,-100],[-100,-225,-350,-475,-350,-225,-100]];
 cfg.gateLocations.forEach((gate,i)=>{
  const start=i?cfg.gateLocations[i-1]+420:370,end=gate-380;
  // Nine stepping stones in the final river shorten the horizontal jumps while increasing timing demands.
  const ys=i===6?[-100,-210,-325,-440,-475,-440,-325,-210,-100]:patterns[i];
  const route=ys.map((y,j)=>({x:Math.round(start+j*(end-start)/(ys.length-1)),y,scale:0.35}));
  cfg.ascentRoutes.push(route);cfg.trenches.push({startX:start+40,endX:end-40});
  route.forEach((p,j)=>{
   if((i>=1&&j===2)||(i>=3&&j===route.length-3))cfg.movingSpots.push({...p,distanceY:-55,duration:2100+i*70});
   else if((i>=2&&j===3)||(i===6&&j===5))cfg.collapsingRocks.push({...p,warningMs:1000,resetMs:2600});
   else cfg.platformSpots.push(p);
  });
  cfg.boneOffsets.push({x:route[1].x,y:route[1].y-70},{x:route.at(-2).x,y:route.at(-2).y-70});
  if(i<5)cfg.crystalOffsets.push({x:route[3].x,y:route[3].y-70});
  cfg.enemies.push({type:'fly',x:route[4].x,y:route[4].y-110,minX:route[4].x-65,maxX:route[4].x+65,speed:70+i*4});
  if(i>0)cfg.enemies.push({type:'fly',x:route[1].x,y:route[1].y-120,minX:route[1].x-65,maxX:route[1].x+65,speed:70});
  if(i>=2)cfg.sweepSpots.push({x:(route[3].x+route[4].x)/2,y:route[3].y-50,range:60});
  if(i>=3)cfg.cannonSpots.push({x:route.at(-2).x+75,y:route.at(-2).y-80,minX:route.at(-3).x-50,maxX:route.at(-2).x+90,period:1900-i*45});
 });
 cfg.boneOffsets.push({x:cfg.exitX-210,y:-65});
 art.palette={night:[0.19,0.045,0.035],haze:[0.55,0.19,0.08]};
 art.sections.forEach((s,i)=>{s.name=names[i];s.landmark=['rock_peak',cfg.ascentRoutes[i][3].x,1];});
 configs[6]=cfg;scenes[6]=art;sections[6]=names.map((name,i)=>[name,'rock_peak',cfg.ascentRoutes[i][3].x,'Alternating volcanic ridges, thermal lifts and brittle rock','Ember route / gate reward']);
};
