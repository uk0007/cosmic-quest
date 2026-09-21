const {chromium}=require('playwright');const assert=require('assert');const fs=require('fs');
(async()=>{
 const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:844,height:390}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const out='artifacts/cave-and-banks';fs.mkdirSync(out,{recursive:true});
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForFunction(()=>window.CosmicAdventureEngine);await p.evaluate(()=>CosmicAdventureEngine.startAdventure(1));await p.waitForFunction(()=>window.currentAdventureScene?.dog?.body);await p.waitForTimeout(5500);
 await p.evaluate(()=>{const s=currentAdventureScene;s.physics.pause();s.cameras.main.stopFollow();s.cameras.main.centerOn(2740,s.groundY-130);});await p.screenshot({path:out+'/ravine.png'});
 await p.evaluate(()=>{const s=currentAdventureScene;for(let i=0;i<7;i++)s.unlockGate(i);s.dog.body.reset(s.levelConfig.exitX-120,s.groundY-48.45);s.cameras.main.centerOn(s.levelConfig.exitX-80,s.groundY-130);s.handleDogEnterCave();});
 await p.waitForTimeout(350);const walk=await p.evaluate(()=>{const s=currentAdventureScene;return {alpha:s.dog.alpha,depth:s.dog.depth,caveDepth:s.finishPortal.depth,visible:s.dog.visible};});assert.equal(walk.alpha,1);assert(walk.visible&&walk.depth>walk.caveDepth);await p.screenshot({path:out+'/entry-walk.png'});
 await p.waitForFunction(()=>currentAdventureScene.dog.scaleX<=0.551);const inside=await p.evaluate(()=>({alpha:currentAdventureScene.dog.alpha,scale:currentAdventureScene.dog.scaleX,x:currentAdventureScene.dog.x,door:currentAdventureScene.finishPortal.x}));assert(Math.abs(inside.x-inside.door)<30);assert(inside.scale<=0.551);await p.screenshot({path:out+'/entry-inside.png'});
 await p.waitForTimeout(1300);const hidden=await p.evaluate(()=>!currentAdventureScene.dog.visible);assert(hidden);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/checks.json',JSON.stringify({walk,inside,hidden,errors},null,2));await b.close();console.log('Cave remains visible through approach and fades only inside: PASS');
})().catch(e=>{console.error(e);process.exit(1)});
