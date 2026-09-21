// Check authored visual baselines against Arcade collision surfaces in all four biomes.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:844,height:390},serviceWorkers:'block',ignoreHTTPSErrors:true});
await page.goto('http://127.0.0.1:8765/index.html');await page.waitForFunction(()=>window.CosmicAdventureEngine);
const results=[];
for(let level=1;level<=4;level++){
await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);
await page.waitForFunction(l=>window.currentAdventureScene?.levelConfig.id===l&&currentAdventureScene.dog?.body,level);
await page.waitForFunction(()=>currentAdventureScene.dog.body.blocked.down);
const r=await page.evaluate(()=>{const s=currentAdventureScene,d=s.dog,c=s.finishPortal;return {
level:s.levelConfig.id,pawGap:s.groundY-(d.y+(121-d.displayOriginY)*d.scaleY),
bodyGap:s.groundY-d.body.bottom,caveGap:s.groundY-(c.y+(462-c.displayOriginY)*c.scaleY),
ledgeGaps:s.platforms.getChildren().filter(p=>p.visible).map(p=>p.body.y-(p.y-p.displayOriginY*p.scaleY)),
mossGates:s.levelConfig.id!==4||s.gates.every(g=>g.texture.key==='moss_monolith'&&g.isQuestionDoor)
};});
assert.ok(Math.abs(r.pawGap)<1&&Math.abs(r.bodyGap)<1&&Math.abs(r.caveGap)<1,JSON.stringify(r));
assert.ok(r.ledgeGaps.every(g=>Math.abs(g)<1)&&r.mossGates,JSON.stringify(r));results.push(r);
}
fs.mkdirSync('artifacts/terrain-refinement',{recursive:true});fs.writeFileSync('artifacts/terrain-refinement/alignment.json',JSON.stringify(results,null,2));console.log('Paws, cave floors, ledge surfaces, and themed gates PASS',results);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
