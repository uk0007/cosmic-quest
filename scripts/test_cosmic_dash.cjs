const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.runInNewContext(fs.readFileSync('scripts/cosmic_dash.js','utf8'),context);const Run=context.window.CosmicDashModel;
const advance=(r,n)=>{for(let i=0;i<n;i++)r.step(1/60);};
for(const type of ['train','barrier','arch','gap']){const r=new Run();r.start();r.spawnIn=100;r.objects=[{lane:1,z:3,type}];advance(r,1);assert.equal(r.lives,2,type+' hits');advance(r,10);assert.equal(r.lives,2,'Hit once');}
for(const [type,action] of [['barrier','jump'],['gap','jump'],['arch','slide']]){const r=new Run();r.start();r.spawnIn=100;r.action(action);advance(r,20);r.objects=[{lane:1,z:3,type}];advance(r,1);assert.equal(r.lives,3,type+' cleared');}
{const r=new Run();r.start();r.spawnIn=100;r.action('left');advance(r,20);r.objects=[{lane:1,z:3,type:'train'}];advance(r,1);assert.equal(r.lives,3);assert.equal(r.lane,0);r.action('left');assert.equal(r.lane,0);}
{const r=new Run();r.start();r.spawnIn=100;r.shield=1;r.objects=[{lane:1,z:3,type:'train'}];advance(r,1);assert.equal(r.lives,3);assert.equal(r.shield,0);r.magnet=2;r.objects=[{lane:0,z:100,type:'star'}];advance(r,1);assert.equal(r.stars,1);r.mode='paused';const distance=r.distance;advance(r,60);assert.equal(r.distance,distance);r.start();assert.equal(r.stars,0);assert.equal(r.lives,3);}
{const r=new Run();r.start();r.spawnIn=100;for(let i=0;i<3;i++){r.invulnerable=0;r.objects=[{lane:1,z:3,type:'train'}];advance(r,1);}assert.equal(r.mode,'over');const distance=r.distance;advance(r,60);assert.equal(r.distance,distance);}
let seed=941;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const r=new Run(rand);r.start();const patterns=new Set();for(let i=0;i<1000;i++){r.objects=[];r.spawn();const hazards=r.objects.filter(o=>['barrier','arch','train','gap'].includes(o.type));if(i%2===0){assert.equal(new Set(hazards.map(o=>o.lane)).size,3);assert.equal(new Set(hazards.map(o=>o.type)).size,1);assert(['arch','barrier'].includes(hazards[0].type),'Full rows share one clear action');}else assert(new Set(hazards.map(o=>o.lane)).size<3,'Dodge rows retain a clear lane');patterns.add(hazards.map(o=>o.lane+o.type).join());}assert(patterns.size>30,'Varied rows');
console.log('Runner: collisions, jump/slide clearance, lane changes, powers, pause/retry/game over and 1,000 fair rows PASS');

for(const required of ['jump','slide'])for(const type of ['star','shield','magnet','bonus']){
 const r=new Run();r.start();r.spawnIn=100;r.magnet=5;r.objects=[{lane:1,z:3,type,required}];advance(r,1);assert.equal(r.stars,0);assert.equal(r.shield,0);assert.equal(r.bonus,0);assert.equal(r.celebrations.length,0,'No power without required action');
 r.action(required);advance(r,20);r.objects=[{lane:1,z:3,type,required}];advance(r,1);assert(type==='star'?r.stars===1:r.celebrations.includes(type),'Action unlocks reward');
}
for(const type of ['barrier','arch'])for(const lane of [0,1,2]){const r=new Run();r.start();r.spawnIn=100;r.lane=r.laneX=lane;r.objects=[0,1,2].map(lane=>({lane,z:3,type}));advance(r,1);assert.equal(r.lives,2,'Lane changes alone cannot clear full-width row');}
{const r=new Run();r.start();r.spawnIn=100;r.collectPower('bonus');r.objects=[{lane:1,z:3,type:'star'}];advance(r,1);assert.equal(r.stars,2);advance(r,610);assert.equal(r.bonus,0);}
console.log('Required jump/slide rewards, full-width challenges and double-star timer PASS');

{const r=new Run();r.start();r.spawnIn=100;r.lane=r.laneX=.5;r.objects=[0,1,2].map(lane=>({lane,z:3,type:'barrier',fullWidth:true}));advance(r,1);assert.equal(r.lives,2,'Cannot dodge full-width row between lanes');}
