const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{
 const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:844,height:390}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/index.html',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('window.CosmicAdventureEngine = {','window.__qaState=AdventureState; window.CosmicAdventureEngine = {')});});
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForFunction(()=>window.CosmicAdventureEngine);await p.evaluate(()=>CosmicAdventureEngine.startAdventure(1));await p.waitForFunction(()=>window.currentAdventureScene?.gates?.length);
 await p.evaluate(()=>{Sound.init();currentAdventureScene.triggerGateArrival(currentAdventureScene.gates[0]);});
 const answer=await p.evaluate(()=>__qaState.activeQuestion.answerIndex);await p.locator('.adv-gate-option-btn').nth(answer).click();
 await p.waitForSelector('#answer-celebration-badge');
 const result=await p.evaluate(()=>{const c=document.getElementById('confetti-canvas'),m=document.getElementById('adv-gate-modal');const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let pixels=0;for(let i=3;i<a.length;i+=4)if(a[i]>0)pixels++;return {pixels,canvasZ:+getComputedStyle(c).zIndex,modalZ:+getComputedStyle(m).zIndex,badge:document.getElementById('answer-celebration-badge').textContent};});
 assert(result.canvasZ>result.modalZ);assert(result.pixels>100);fs.mkdirSync('artifacts/answer-celebration',{recursive:true});await p.screenshot({path:'artifacts/answer-celebration/correct.png'});await p.waitForTimeout(2600);assert.equal(await p.locator('#answer-celebration-badge').count(),0);assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/answer-celebration/checks.json',JSON.stringify({result,errors},null,2));console.log(result);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
