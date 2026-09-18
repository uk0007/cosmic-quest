// Rendered sky coverage/animation, responsive panorama, and legacy campaign migration.
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:844,height:390},ignoreHTTPSErrors:true,serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('cosmic_quest_state',JSON.stringify({adventureLevels:{1:{unlocked:true,stars:3},2:{unlocked:true,stars:3},3:{unlocked:true,stars:2,highScore:300}}})));
 await page.goto('http://127.0.0.1:8765/index.html');
 await page.waitForFunction(()=>window.CosmicAdventureEngine&&window.gameState);
 const campaign=await page.evaluate(()=>{renderAdventureLevelSelect();return {count:AdventureCampaign.length,cards:document.querySelectorAll('.adv-level-card').length,legacyUnlock:gameState.adventureLevels[4].unlocked};});
 assert.equal(campaign.count,4);assert.equal(campaign.cards,4);assert.equal(campaign.legacyUnlock,true);
 await page.evaluate(()=>CosmicAdventureEngine.startAdventure(4));
 await page.waitForFunction(()=>window.currentAdventureScene?.dog?.body);
 await page.waitForTimeout(1000);
 const coverage=[];
 for(const size of [{width:844,height:390},{width:390,height:844},{width:1280,height:720}]){
  await page.setViewportSize(size);await page.waitForTimeout(400);
  const result=await page.evaluate(()=>{const s=currentAdventureScene,b=s.viewportBackdrop,c=s.cameras.main;return {width:innerWidth,height:innerHeight,bw:b.width,bh:b.height,zoom:c.zoom,sw:s.scale.width,sh:s.scale.height,canvas:[document.getElementById('adventure-three-canvas'),document.querySelector('#phaser-game-container canvas')].every(e=>{const r=e.getBoundingClientRect();return Math.abs(r.width-innerWidth)<2&&Math.abs(r.height-innerHeight)<2;}),panorama:b.width*c.zoom>=c.width&&b.height*c.zoom>=c.height,aspectPreserved:b.tileScaleX===b.tileScaleY};});
  console.log('coverage',result);assert.ok(result.canvas&&result.panorama&&result.aspectPreserved);coverage.push(result);
 }
 // Isolate the actual shader framebuffer, so animated characters cannot mask a static sky.
 await page.evaluate(()=>{CosmicAdventureEngine.game.loop.sleep();document.querySelector('#phaser-game-container').style.visibility='hidden';const b=AdventureBackground3D;for(const obj of b.scene.children)obj.visible=obj===b.atmosphere;});
 await page.waitForTimeout(150);
 const before=PNG.sync.read(await page.screenshot());
 await page.waitForTimeout(2500);
 const after=PNG.sync.read(await page.screenshot());
 let changed=0,sampled=0;
 for(let y=90;y<before.height-90;y++)for(let x=10;x<before.width-10;x++){
  const p=(y*before.width+x)*4;sampled++;
  if([0,1,2].some(c=>Math.abs(before.data[p+c]-after.data[p+c])>2))changed++;
 }
 assert.ok(changed/sampled>0.05,'Sky must visibly animate without character or camera movement');
 assert.deepEqual(errors,[]);
 fs.mkdirSync('artifacts/level4',{recursive:true});
 fs.writeFileSync('artifacts/level4/background-campaign.json',JSON.stringify({campaign,coverage,animation:{changed,sampled,fraction:changed/sampled},errors},null,2));
 console.log({campaign,coverage,animatedFraction:changed/sampled});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
