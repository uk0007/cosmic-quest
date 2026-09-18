const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:844,height:390},serviceWorkers:'block',ignoreHTTPSErrors:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/index.html');
await page.waitForFunction(()=>window.CosmicAdventureEngine&&window.gameState);
assert.ok(await page.evaluate(()=>[1,2,3,4].every(i=>gameState.adventureLevels[i].unlocked)));
await page.reload();await page.waitForFunction(()=>window.CosmicAdventureEngine&&window.gameState);
assert.ok(await page.evaluate(()=>[1,2,3,4].every(i=>gameState.adventureLevels[i].unlocked)));
await page.locator('#btn-title-new-game').click();
await page.locator('#btn-newgame-proceed').click();
await page.waitForFunction(()=>window.currentAdventureScene?.dog?.body);
assert.ok(await page.evaluate(()=>[1,2,3,4].every(i=>gameState.adventureLevels[i].unlocked)));
for(const [level,type,direction] of [[1,'ground',1],[1,'ground',-1],[1,'armored',1],[1,'fly',1],[4,'ground',1]]){
await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);
await page.waitForFunction(l=>window.currentAdventureScene?.levelConfig?.id===l&&currentAdventureScene.dog?.body,level);
await page.waitForTimeout(700);
const fixture=await page.evaluate(({type,direction})=>{
const s=currentAdventureScene;for(let i=0;i<7;i++)s.unlockGate(i);
const e=s.enemiesGroup.getChildren().find(e=>e.enemyType===type);
if(!e)throw Error('Missing '+type);
for(const other of s.enemiesGroup.getChildren())if(other!==e)other.disableBody(true,true);
s.dog.body.reset(direction===1?180:500,s.groundY-50);s.dog.setFlipX(direction<0);
e.body.reset(direction===1?440:240,s.groundY-(type==='fly'?160:50));e.startY=e.y;e.patrolMinX=210;e.patrolMaxX=500;
window.combatEnemy=e;return {hp:e.hp};
},{type,direction});
await page.waitForTimeout(350);
const scale=await page.evaluate(()=>combatEnemy.scaleX);assert.ok(scale>=1.3);
for(let shot=0;shot<fixture.hp;shot++){
console.log('FIRE',await page.evaluate(()=>{const s=currentAdventureScene;const fired=s.tryFireCosmicPulse();return {fired,dog:[s.dog.x,s.dog.y],enemy:[combatEnemy.body.center.x,combatEnemy.body.center.y],pulses:s.pulsePool.group.getChildren().filter(p=>p.active).map(p=>({x:p.x,y:p.y,vx:p.body.velocity.x,vy:p.body.velocity.y,ay:p.body.acceleration.y}))};}));await page.waitForTimeout(1400);
}
const result=await page.evaluate(()=>({hp:combatEnemy.hp,defeated:combatEnemy.isDefeated}));
assert.ok(result.defeated,JSON.stringify({level,type,direction,result}));console.log('HIT',level,type,direction,scale);
}
assert.deepEqual(errors,[]);console.log('Unlock persistence, enlarged enemies, and aimed arc hits PASS');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
