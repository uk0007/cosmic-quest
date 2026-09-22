const {chromium}=require('playwright');
const fs=require('fs');const assert=require('assert');
(async()=>{
 const out=process.env.ADVENTURE_QA_OUTPUT || 'artifacts/level1-traps';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:844,height:390}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/index.html');await page.waitForFunction(()=>window.CosmicAdventureEngine);
 await page.evaluate(()=>CosmicAdventureEngine.startAdventure(1));await page.waitForFunction(()=>window.currentAdventureScene?.woodlandTraps?.length===16);
 const result=await page.evaluate(()=>{
  const s=currentAdventureScene; s.physics.pause();
  const r=s.woodlandTraps[0],c=s.woodlandTraps.find(t=>t.kind==='cutter');
  const sample=ms=>{s.woodlandTrapClock=ms;s.updateWoodlandTraps(0);return {shot:r.sprite.body.enable,y:r.sprite.y,cutterY:c.sprite.y};};
  return {width:s.levelConfig.levelWidth,warning:sample(500),burst:sample(1400),safe:sample(3000),raised:sample(0),lowered:sample(2800),retracted:sample(4300),clearances:s.levelConfig.trenches.map(t=>Math.min(...s.levelConfig.gateLocations.filter(x=>x>t.endX).map(x=>x-t.endX)))};
 });
 assert.equal(result.width,14600);assert(!result.warning.shot&&result.burst.shot&&!result.safe.shot);assert(result.lowered.cutterY-result.raised.cutterY>200);assert.equal(result.retracted.cutterY,result.raised.cutterY);assert(result.clearances.every(x=>x>=300));
 const positions=await page.evaluate(()=>{const s=currentAdventureScene;return [['gap',s.levelConfig.trenches[1].startX-100],['cutters',s.levelConfig.cutterSpots[2]-100]];});
 for(const [name,x] of positions){
  await page.evaluate(x=>{const s=currentAdventureScene;s.dog.body.reset(x,s.groundY-50);s.cameras.main.stopFollow();s.cameras.main.centerOn(x+220,s.groundY-140);},x);
  await page.waitForTimeout(100);await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/trap-checks.json',JSON.stringify({result,errors},null,2));console.log(result);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
