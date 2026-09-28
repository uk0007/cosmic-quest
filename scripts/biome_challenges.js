/* Distinct movement problems for each biome, authored on existing safe routes. */
window.BiomeChallengeTypes={
  1:{kind:'log',name:'Rolling roots',hint:'JUMP OVER THE ROLL',color:0xc29762,period:4200,warning:900,active:1700},
  2:{kind:'beam',name:'Crystal beams',hint:'CROSS WHEN THE BEAM FADES',color:0xc7a0ff,period:4600,warning:950,active:1900},
  3:{kind:'lightning',name:'Thunder strikes',hint:'WAIT FOR THE STRIKE · THEN GO',color:0xc2f4ff,period:3300,warning:1000,active:330},
  4:{kind:'spore',name:'Bouncing spores',hint:'WATCH THE BOUNCE · JUMP PAST',color:0xb4e76a,period:4400,warning:800,active:2200},
  5:{kind:'pendulum',name:'Orbital pendulums',hint:'CROSS AS THE ORB SWINGS AWAY',color:0xf0c77e,period:3400,warning:0,active:3400},
  6:{kind:'lava',name:'Lava vents',hint:'WAIT FOR THE VENT TO COOL',color:0xff9955,period:3800,warning:1100,active:1300},
  7:{kind:'icicle',name:'Falling icicles',hint:'BAIT THE FALL · THEN LAND',color:0xb5f3ff,period:3400,warning:1100,active:750}
};
window.configureBiomeChallenges=function(cfg){
 if(cfg.authoredTraversal)return;
 const info=window.BiomeChallengeTypes[cfg.id];
 const old=cfg.cutterSpots||[];
 cfg.signatureHazards=[];
 if(cfg.ascentRoutes){
  cfg.ascentRoutes.forEach((route,i)=>{
   const p=route[cfg.id===7?3:4];
   cfg.signatureHazards.push({x:cfg.id===5?(route[3].x+route[4].x)/2:p.x,y:p.y-43,section:i});
   if(i>=4&&cfg.id===7){const q=route[6];cfg.signatureHazards.push({x:q.x,y:q.y-43,section:i});}
  });
 }else{
  cfg.gateLocations.forEach((gate,i)=>{
   const start=i?cfg.gateLocations[i-1]+360:250;
   let x=old.find(x=>x>=start+120&&x<gate-340&&!cfg.trenches.some(t=>x-160<t.endX&&x+160>t.startX));
   if(x===undefined){for(let candidate=start+180;candidate<gate-340;candidate+=90){if(!cfg.trenches.some(t=>candidate-180<t.endX&&candidate+180>t.startX)){x=candidate;break;}}}
   if(x!==undefined)cfg.signatureHazards.push({x,y:0,section:i});
  });
 }
 // Mechanical guns and blades belong to the observatory; other worlds get their own hazards.
 cfg.cutterSpots=[];cfg.timingTrials=[];cfg.sweepSpots=[];
 if(cfg.id!==5)cfg.cannonSpots=[];
 if(cfg.id!==5)cfg.hazards=(cfg.hazards||[]).filter(h=>h.type==='wind'||h.type==='geyser');
 cfg.enemies.forEach(e=>{
  if(cfg.id===3)return;
  delete e.sprite;delete e.hops;delete e.dives;
  e.skin='biome-'+cfg.id+'-'+e.type;e.behavior=['','charger','sentinel','','slime','drone','wisp','frost'][cfg.id];
  if(cfg.id===4&&e.type!=='fly')e.hops=true;
  if(cfg.id===6&&e.type==='fly')e.hoverRadius=65;
  if(cfg.id===7&&e.type==='fly'){e.dives=true;e.hoverRadius=20;}
 });
};
