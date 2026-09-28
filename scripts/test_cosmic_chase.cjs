const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const ctx={window:{}};vm.runInNewContext(fs.readFileSync('scripts/cosmic_dash.js','utf8'),ctx);const Run=ctx.window.CosmicDashModel;
const fresh=()=>{const r=new Run(()=>.5,'chase');r.start();r.spawnIn=10000;return r;};
const step=(r,seconds)=>{for(let i=0;i<Math.round(seconds*60);i++)r.step(1/60);};
let r=fresh();step(r,59.9);assert.equal(r.mode,'playing');step(r,.1);assert.equal(r.mode,'over');assert(Math.abs(r.time-60)<.02);assert.equal(r.lead,0);
r=fresh();r.step(1/60);const slow=r.speed;r.collectEnergy();r.step(1/60);assert(r.speed>=slow+99);assert(r.lead>59.98);
r=fresh();for(let i=0;i<120*60;i++){if(i%360===0)r.collectEnergy();r.step(1/60);}assert.equal(r.mode,'cleared');assert.equal(r.time,120);assert.equal(r.energy,20);assert.equal(r.hits,0);
r=fresh();r.lead=100;r.collectEnergy();for(let i=0;i<4;i++){r.collectEnergy();r.takeHit();}assert.equal(r.mode,'over');assert.equal(r.hits,4);assert.equal(r.lead,0);
r=fresh();step(r,20);r.mode='paused';const before=[r.time,r.lead,r.boost];step(r,20);assert.deepEqual([r.time,r.lead,r.boost],before);
r=fresh();r.time=119.99;r.lead=40;r.energy=19;r.step(1/60);assert.equal(r.mode,'over');assert(r.reason.includes('20 energy'));
r=fresh();r.collectEnergy();r.takeHit();r.start();assert.equal(r.lead,60);assert.equal(r.hits,0);assert.equal(r.energy,0);assert.equal(r.boost,0);
r=fresh();r.spawn();assert(r.objects.some(o=>o.type==='energy'&&o.required==='jump'));r.row=2;r.objects=[];r.spawn();assert(r.objects.some(o=>o.type==='energy'&&o.required==='slide'));
r=fresh();r.spawnIn=10000;r.objects=[{lane:1,z:1,type:'energy',required:'jump'}];r.step(1/60);assert.equal(r.energy,0);r.action('jump');step(r,.3);r.objects=[{lane:1,z:1,type:'energy',required:'jump'}];r.step(1/60);assert.equal(r.energy,1);
console.log('Hunter chase: 60s capture, speed boost, 120s/20-orb victory, repeated-hit capture, pause, insufficient energy and retry PASS');
// Drive the generated course with real model actions, not removed obstacles.
for(let seed=1;seed<=10;seed++){
 let rng=seed;const rand=()=>((rng=(rng*1664525+1013904223)>>>0)/4294967296);const bot=new Run(rand,'chase');bot.start();
 for(let frame=0;frame<7300&&bot.mode==='playing';frame++){
  const hazards=bot.objects.filter(o=>['barrier','arch','train','gap'].includes(o.type)&&o.z>0).sort((a,b)=>a.z-b.z);
  if(hazards.length){const first=hazards[0],row=hazards.filter(o=>Math.abs(o.z-first.z)<1);let lane;
   if(first.fullWidth){lane=bot.objects.find(o=>o.type==='energy'&&Math.abs(o.z-first.z)<1)?.lane??1;}
   else lane=[0,1,2].find(l=>!row.some(o=>o.lane===l));
   if(lane!==undefined&&lane!==bot.lane)bot.action(lane<bot.lane?'left':'right');
   if(first.fullWidth&&first.z<bot.speed*.4){if(first.type==='barrier'&&bot.jump===0)bot.action('jump');if(first.type==='arch'&&bot.slide===0)bot.action('slide');}
  }
  bot.step(1/60);
 }
 assert.equal(bot.mode,'cleared',`Generated seed ${seed}: ${bot.reason}, energy ${bot.energy}, hits ${bot.hits}`);assert.equal(bot.hits,0);assert(bot.energy>=20);
}
console.log('Ten seeded complete generated courses: 120-second no-hit escape with sufficient energy PASS');
