/* Two independent routes: thermal crossings versus controlled glacial descent. */
window.buildThermalGlacialTraversal=function(levels,sections){
 const p=(x,y,scale=.35)=>({x,y,scale});
 const init=(id,gates,heights,width)=>{
  const c=levels[id];Object.assign(c,{authoredTraversal:true,gateLocations:gates,gateHeights:heights,levelWidth:width,exitX:width-300,exitHeight:heights[6],worldTop:-900});
  for(const key of ['platformSpots','movingSpots','collapsingRocks','phaseSpots','fallingHazards','heatedSpots','shardSpots','hazards','enemies','thorns','scenery','plants','cutterSpots','timingTrials','sweepSpots','cannonSpots','signatureHazards','ambientButterflies','ambientGrass','ambientBubbles','ambientFlies'])c[key]=[];
  c.solidSegments=[{startX:-100,endX:380,y:0},...gates.map((x,i)=>({startX:x-200,endX:i===6?width+200:x+350,y:heights[i]}))];
  c.trenches=c.solidSegments.slice(1).map((seg,i)=>({startX:c.solidSegments[i].endX,endX:seg.startX,fallY:Math.max(seg.y,c.solidSegments[i].y)+300}));
  return c;
 };
 const fire=init(6,[2400,5100,7650,10300,13000,15500,18100],[0,-320,-120,-420,-160,0,-180],19000);
 fire.subtitle='Thermal Launches · Cooling Stones · Lava Ferries';
 fire.platformSpots=[[540,-80],[1800,-110],[2030,-60],[5630,-250],[6040,-210],[7160,-130],[8100,-180],[8600,-170],[9080,-490],[9550,-450],[9880,-440],[10900,-420],[12100,-220],[12500,-200],[13480,-130],[14550,-110],[14930,-65],[16020,-100],[16970,-450],[17670,-200]].map(a=>p(...a));
 fire.movingSpots=[
  {...p(800,-95,.55),distanceX:710,duration:4900},
  {...p(3020,-80),distanceY:-390,duration:3000},
  {...p(3650,-410),distanceX:320,duration:2600},
  {...p(4450,-360),distanceX:230,duration:2100},
  {...p(6280,-160,.55),distanceX:490,duration:3800},
  {...p(11220,-330),distanceX:490,distanceY:100,duration:3800},
  {...p(13800,-140,.55),distanceX:480,duration:3200},
  {...p(17260,-340),distanceY:120,duration:2000}
 ];
 fire.heatedSpots=[
  {...p(3330,-360),period:5200,phase:0}, {...p(4230,-360),period:4400,phase:1400},
  {...p(5820,-235),period:4700,phase:800}, {...p(6950,-130),period:5000,phase:2300},
  {...p(8370,-180),period:4100,phase:400}, {...p(9320,-465),period:4400,phase:1600},
  {...p(11880,-245),period:5000,phase:900}, {...p(16470,-100),period:4500,phase:1800},
  {...p(17470,-240),period:4000,phase:1100}
 ];
 fire.collapsingRocks=[[8750,-160],[12300,-210],[16250,-100]].map(a=>({...p(...a,.22),warningMs:850,resetMs:3300}));
 fire.hazards=[{type:'geyser',x:8600,y:-213,launchVelocity:-930},{type:'geyser',x:16470,y:-143,launchVelocity:-930}];
 // Each vent guards a different decision: launch timing, ferry departure or the next landing.
 fire.signatureHazards=[{x:1580,y:-110,period:5400,warning:1100,active:1600,offset:300},{x:6610,y:-180,period:4900,warning:1000,active:1400,offset:2200},{x:11500,y:-320,period:5800,warning:1300,active:1700,offset:400},{x:14240,y:-130,period:4400,warning:900,active:1100,offset:1200}];
 fire.enemies=[{type:'fly',x:1950,y:-300,minX:1780,maxX:2140,speed:75},{type:'fly',x:6550,y:-330,minX:6320,maxX:6850,speed:100},{type:'fly',x:9700,y:-610,minX:9470,maxX:9920,speed:65},{type:'fly',x:12400,y:-380,minX:12100,maxX:12550,speed:110},{type:'fly',x:17450,y:-530,minX:17000,maxX:17600,speed:125}].map(e=>({...e,skin:'biome-6-fly',behavior:'wisp',hoverRadius:65}));
 const ice=init(7,[2200,4550,7000,9400,11900,14400,17000],[420,1040,1530,2190,2690,3280,3920],18000);
 ice.subtitle='Brake on Ice · Catch the Shelves · Dodge Shard Volleys';ice.descentDepth=3920;ice.iceTraversal=true;
 ice.platformSpots=[[530,40],[820,170],[1500,320],[1770,370],[2780,500],[3400,820],[4110,1010],[5070,1110],[5830,1280],[6500,1470],[7530,1610],[8080,1810],[8860,2150],[9940,2240],[10500,2460],[11420,2650],[12450,2770],[13520,3160],[14920,3340],[15490,3550],[16450,3890]].map(a=>p(...a,.22));
 // Wide shelves are braking zones; narrow shelves demand a measured drop, not another uphill jump.
 for(const x of [820,3400,8080,10500,13520])ice.platformSpots.find(p=>p.x===x).scale=.55;
 ice.movingSpots=[
  {...p(1120,250),distanceX:180,duration:2200},
  {...p(3030,630),distanceY:200,duration:2800},
  {...p(3800,900),distanceX:140,duration:1900},
  {...p(6100,1370),distanceX:130,duration:1700},
  {...p(8370,1950),distanceY:210,duration:2600},
  {...p(10900,2550),distanceX:160,duration:2100},
  {...p(12800,2920),distanceX:350,distanceY:100,duration:3200},
  {...p(15920,3710),distanceX:210,duration:1850}
 ];
 ice.collapsingRocks=[[5540,1200],[6740,1500],[7800,1710],[10190,2330],[12630,2840],[13820,3220],[15210,3440],[16240,3810]].map(a=>({...p(...a,.22),warningMs:620,resetMs:3000}));
 ice.shardSpots=[{x:3340,y:700,direction:1,period:4600},{x:5790,y:1190,direction:-1,period:3900},{x:8680,y:2040,direction:1,period:4300},{x:11280,y:2550,direction:-1,period:3700},{x:15400,y:3450,direction:1,period:3400},{x:16400,y:3790,direction:-1,period:4200}];
 ice.enemies=[{type:'fly',x:4010,y:780,minX:3860,maxX:4160,speed:85},{type:'fly',x:8630,y:1880,minX:8400,maxX:8900,speed:95},{type:'fly',x:13370,y:2900,minX:13150,maxX:13600,speed:100},{type:'fly',x:15750,y:3490,minX:15550,maxX:16050,speed:115}].map(e=>({...e,skin:'biome-7-fly',behavior:'frost',dives:true,hoverRadius:20}));
 const names={6:['Basalt Ferry','Furnace Elevator','Cooling Causeway','Thermal Catapult','Molten Locks','Ember Conveyor','Heartfire Escape'],7:['First Drop','Catch the Elevator','Brittle Run','Deep Icewell','Shard Gallery','Glacier Drift','The Last Descent']};
 for(const c of [fire,ice]){
  const all=[...c.platformSpots,...c.movingSpots,...c.collapsingRocks,...c.heatedSpots].sort((a,b)=>a.x-b.x);
  c.ascentRoutes=c.gateLocations.map((gx,i)=>all.filter(p=>p.x>(i?c.gateLocations[i-1]:0)&&p.x<gx));
  sections[c.id]=c.gateLocations.map((gx,i)=>[names[c.id][i],'rock_peak',gx-160,names[c.id][i],'Landing trail / safe gate terrace']);
  c.boneOffsets=[...c.platformSpots,...c.heatedSpots].map(p=>({x:p.x,y:p.y-90}));c.totalBones=c.boneOffsets.length;
  c.crystalOffsets=c.movingSpots.map(p=>({x:p.x,y:p.y-90}));c.totalCrystals=c.crystalOffsets.length;
 }
};
