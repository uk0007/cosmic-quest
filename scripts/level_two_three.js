/* Authored independently: positions are landing centers, not repeated section templates. */
window.buildDistinctTraversal=function(levels,sections){
 const make=(id,name,gates,heights,width)=>{
  const c=levels[id];Object.assign(c,{name,authoredTraversal:true,levelWidth:width,exitX:width-240,gateLocations:gates,gateHeights:heights,exitHeight:heights[6],worldTop:-1100,platformSpots:[],movingSpots:[],collapsingRocks:[],phaseSpots:[],fallingHazards:[],hazards:[],enemies:[],thorns:[],scenery:[],plants:[],cutterSpots:[],timingTrials:[],sweepSpots:[],cannonSpots:[],signatureHazards:[],ambientButterflies:[],ambientGrass:[],ambientBubbles:[],ambientFlies:[]});
  c.solidSegments=[{startX:-100,endX:340,y:0},...gates.map((x,i)=>({startX:x-170,endX:i===6?width+200:x+330,y:heights[i]}))];
  c.trenches=c.solidSegments.slice(1).map((s,i)=>({startX:c.solidSegments[i].endX,endX:s.startX}));
  return c;
 };
 const p=(x,y)=>({x,y,scale:.22});
 const cave=make(2,'Crystal Caverns',[1550,3000,4400,6100,7620,9020,10700],[-420,-700,-280,-580,-180,-650,-400],11300);
 cave.subtitle='Lift Wells · Geyser Shafts · Falling Stone';
 cave.platformSpots=[[480,-80],[640,-225],[800,-365],[1000,-470],[1200,-420],[2000,-500],[2250,-650],[2650,-710],[3500,-600],[3720,-430],[3920,-300],[4950,-380],[5200,-520],[5620,-620],[6680,-500],[6900,-370],[7180,-220],[8100,-270],[8280,-435],[8600,-620],[9560,-570],[9940,-430],[10300,-430]].map(a=>p(...a));
 cave.movingSpots=[{...p(760,-190),distanceY:-290,duration:2500},{...p(2090,-480),distanceY:-270,duration:3000},{...p(2440,-700),distanceX:170,duration:1900},{...p(5450,-565),distanceX:230,duration:2400},{...p(8450,-390),distanceY:-290,duration:2100},{...p(9780,-640),distanceY:190,duration:2600}];
 cave.collapsingRocks=[[3260,-670],[4140,-280],[6450,-550],[7050,-280],[10120,-410]].map(a=>({...p(...a),warningMs:720,resetMs:2600}));
 cave.hazards=[{type:'geyser',x:4950,y:-423,launchVelocity:-900},{type:'geyser',x:8100,y:-313,launchVelocity:-880}];
 cave.fallingHazards=[{x:3560,y:-640,period:3300},{x:6840,y:-440,period:2600},{x:8590,y:-665,period:3000},{x:9970,y:-475,period:2300}];
 cave.enemies=[{type:'fly',x:1130,y:-620,minX:1010,maxX:1260,speed:65},{type:'fly',x:3820,y:-580,minX:3620,maxX:3950,speed:90},{type:'fly',x:5550,y:-790,minX:5350,maxX:5730,speed:80},{type:'fly',x:9720,y:-800,minX:9460,maxX:10030,speed:110}].map(e=>({...e,skin:'biome-2-fly',behavior:'sentinel',hoverRadius:35}));
 const sky=make(3,'Starlight Summit',[1780,3570,5160,6900,8600,10350,12200],[0,-100,-260,-80,-340,-160,0],12800);
 sky.subtitle='Crosswinds · Vanishing Steps · Meteor Rain';
 sky.platformSpots=[[510,-70],[760,-160],[1030,-65],[1300,-130],[2280,-80],[2570,-160],[2910,-85],[3210,-110],[4100,-200],[4550,-280],[4780,-300],[5710,-220],[6410,-150],[7440,-110],[7730,-240],[8030,-340],[9160,-340],[9480,-270],[9900,-190],[10850,-130],[11130,-240],[11700,-90]].map(a=>p(...a));
 sky.movingSpots=[{...p(4290,-180),distanceX:170,distanceY:-110,duration:2000},{...p(6110,-240),distanceY:160,duration:1900},{...p(9630,-230),distanceX:160,duration:1700},{...p(11400,-180),distanceX:150,duration:1800}];
 sky.phaseSpots=[[5930,-190,0],[6660,-95,900],[8270,-350,1600],[11000,-200,600],[11570,-160,1200]].map(([x,y,phase])=>({...p(x,y),phase,period:3800,solidMs:2700}));
 sky.hazards=[{type:'wind',minX:2210,maxX:3350,forceX:-65},{type:'wind',minX:7290,maxX:8220,forceX:55},{type:'wind',minX:10800,maxX:11970,forceX:-45}];
 sky.fallingHazards=[{x:7670,y:-283,period:2900},{x:8040,y:-383,period:3400},{x:9450,y:-313,period:2500},{x:11140,y:-283,period:2900},{x:11710,y:-133,period:2400}];
 sky.thorns=[{x:9170,y:-383,scale:.45,damage:8}];
 sky.enemies=[{type:'fly',x:2820,y:-320,minX:2600,maxX:3040,speed:100},{type:'fly',x:4640,y:-460,minX:4490,maxX:4780,speed:75},{type:'fly',x:9830,y:-390,minX:9610,maxX:10040,speed:115}].map(e=>({...e,skin:'storm-ray',dives:true,hoverRadius:25}));
 const names={2:['Crystal Stairwell','Deep Lift Well','Crumbling Descent','Geyser Chimney','Unstable Gallery','Bubble Shaft','Stonefall Escape'],3:['Broken Constellation','Headwind Crossing','Orbit Ferry','Blinking Causeway','Meteor Shower','Thorn Needle','Final Crosswind']};
 for(const c of [cave,sky]){
  sections[c.id]=c.gateLocations.map((x,i)=>[names[c.id][i],c.id===2?'crystal_cluster':'rune_pillar',x-140,names[c.id][i],'Follow the landing lights']);
  c.boneOffsets=c.platformSpots.map(s=>({x:s.x,y:s.y-90}));c.totalBones=c.boneOffsets.length;
  c.crystalOffsets=c.movingSpots.map(s=>({x:s.x,y:s.y-100}));c.totalCrystals=c.crystalOffsets.length;
  if(c.id===2){c.ambientFlies=[{x:3450,y:-720},{x:7000,y:-480}];c.ambientBubbles=c.platformSpots.filter((_,i)=>i%3===0).map(s=>({x:s.x,y:s.y}));}
 }
};
