/* Obsidian Observatory: summit-derived physics, independently composed ruins and encounters. */
window.buildObsidianObservatory=function(configs,sections,scenes){
 const copy=x=>JSON.parse(JSON.stringify(x)),cfg=copy(configs[3]),art=copy(scenes[3]);
 const sx=x=>Math.round(x*1.125);
 cfg.id=5;cfg.name='Obsidian Observatory';cfg.subtitle='Eclipse Ruins & Clockwork Bridges';cfg.levelWidth=18000;cfg.exitX=sx(cfg.exitX);cfg.themeColor='#e6b76c';cfg.caveTint=0xc5a3ff;
 ['platformSpots','movingSpots','collapsingRocks','boneOffsets','crystalOffsets','enemies','hazards','thorns','cannonSpots','sweepSpots','timingTrials'].forEach(key=>(cfg[key]||[]).forEach(item=>{
  ['x','minX','maxX','startX','endX'].forEach(k=>{if(typeof item[k]==='number')item[k]=sx(item[k]);});
 }));
 cfg.gateLocations=cfg.gateLocations.map(sx);cfg.cutterSpots=cfg.cutterSpots.map(sx);
 cfg.trenches.forEach(t=>{t.startX=sx(t.startX);t.endX=sx(t.endX);});
 cfg.movingSpots.forEach((p,i)=>{p.duration=Math.max(2000,p.duration-100);if(i%3===0){p.distanceY=-85;p.distanceX=45;}});
 cfg.cannonSpots.forEach(c=>c.period=Math.max(1050,c.period-50));
 const middle=cfg.trenches[3];
 cfg.timingTrials.unshift({startX:middle.startX,endX:middle.endX,x:(middle.startX+middle.endX)/2,period:5600,closed:3400,label:'ECLIPSE BRIDGE'});
 cfg.timingTrials[1].label='ORBITAL LOCK';cfg.timingTrials[2].label='OBSERVATORY CORE';
 // Two extra vertical cutters guard the mid-level approach; solid ground leaves waiting space.
 cfg.cutterSpots.push(middle.startX-230,middle.endX+180);
 const names=['Eclipse Courtyard','Suspended Archive','Astral Liftworks','Clockwork Causeway','Meteor Gallery','Orbital Engine','Observatory Heart'];
 const keys=['rock_cairn','rune_tablet','rock_spire','rune_arch','rock_peak','rune_pillar','rock_spire'];
 art.palette={night:[0.12,0.09,0.20],haze:[0.38,0.32,0.42]};
 art.sections.forEach((s,i)=>{
  const x=sx(s.landmark[1]);s.name=names[i];s.landmark=[keys[i],x,i===6?0.8:1.1];
  const start=i?cfg.gateLocations[i-1]+320:180;
  s.decor=[['rock_spire',start,0.65],['rune_spiral',start+340,1.35],['crystal_cluster',start+680,0.9],['rock_stack',cfg.gateLocations[i]-300,1.1]];
 });
 ['distant','groundPatches'].forEach(key=>art[key].forEach(item=>item[1]=sx(item[1])));
 configs[5]=cfg;scenes[5]=art;sections[5]=sections[3].map((s,i)=>[names[i],keys[i],art.sections[i].landmark[1],'Clockwork lifts, cutter timing and combat','Upper archive route / gate reward']);
};
