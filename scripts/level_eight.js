/* A continuous 3,920-pixel descent through an abandoned glacial shaft. */
window.buildFrostfallChasm=function(configs,sections,scenes){
 const copy=x=>JSON.parse(JSON.stringify(x)),cfg=copy(configs[6]),art=copy(scenes[6]);
 cfg.id=8;cfg.name='Frostfall Chasm';cfg.subtitle='Frozen Depths & Falling Bridges';cfg.levelWidth=18000;cfg.exitX=17600;cfg.descentDepth=3920;cfg.themeColor='#9be9ff';cfg.caveTint=0x91d9ff;
 cfg.gateLocations=[2200,4600,7000,9400,11800,14200,16900];
 for(const key of ['platformSpots','movingSpots','collapsingRocks','trenches','enemies','hazards','thorns','cutterSpots','cannonSpots','sweepSpots','timingTrials','boneOffsets','crystalOffsets','ascentRoutes'])cfg[key]=[];
 cfg.gateHeights=cfg.gateLocations.map((_,i)=>(i+1)*560);
 const names=['Icefall Entrance','Drifting Shelves','Brittle Descent','Pendulum Hollow','Frozen Crossfire','Shattered Stair','The Silent Abyss'];
 cfg.gateLocations.forEach((gate,i)=>{
  const start=i?cfg.gateLocations[i-1]+430:340,end=gate-350;
  const route=Array.from({length:8},(_,j)=>({x:Math.round(start+j*(end-start)/7),y:i*560+j*70,scale:i>=2&&[3,5].includes(j)?0.22:0.35}));
  cfg.ascentRoutes.push(route);cfg.trenches.push({startX:start+35,endX:end-35});
  route.forEach((p,j)=>{
   if(j===2||i>=3&&j===6)cfg.movingSpots.push({...p,distanceX:i>=4?70:45,duration:1800+i*80});
   else if(i>=1&&j===4||i>=4&&j===5)cfg.collapsingRocks.push({...p,warningMs:850,resetMs:2700});
   else cfg.platformSpots.push(p);
  });
  cfg.boneOffsets.push({x:route[1].x,y:route[1].y-65},{x:route[6].x,y:route[6].y-65});
  if(i<5)cfg.crystalOffsets.push({x:route[4].x,y:route[4].y-65});
  cfg.enemies.push({type:'fly',x:route[3].x,y:route[3].y-100,minX:route[3].x-70,maxX:route[3].x+70,speed:85+i*5});
  if(i>0)cfg.enemies.push({type:'fly',x:route[6].x,y:route[6].y-105,minX:route[6].x-70,maxX:route[6].x+70,speed:80+i*5});
  cfg.sweepSpots.push({x:(route[4].x+route[5].x)/2,y:route[4].y-40,range:80});
  if(i>=2)cfg.cannonSpots.push({x:route[6].x+75,y:route[6].y-75,minX:route[5].x-80,maxX:route[6].x+90,period:1550-i*35});
 });
 cfg.boneOffsets.push({x:cfg.exitX-210,y:cfg.descentDepth-65});
 art.palette={night:[0.018,0.04,0.095],haze:[0.07,0.23,0.30]};
 art.sections.forEach((s,i)=>{s.name=names[i];s.landmark=['rock_peak',cfg.ascentRoutes[i][3].x,1];});
 configs[8]=cfg;scenes[8]=art;sections[8]=names.map((name,i)=>[name,'rock_peak',cfg.ascentRoutes[i][3].x,'Descending ice shelves, drifting bridges and crossfire','Downward route / safe gate terrace']);
};
