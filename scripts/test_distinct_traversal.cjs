const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/index.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('window.CosmicAdventureEngine = {','window.__qaState=AdventureState;window.CosmicAdventureEngine = {')});});
 await page.goto('http://127.0.0.1:8765/index.html');await page.waitForFunction(()=>window.CosmicAdventureEngine);
 for(const level of [2,3]){
  await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);await page.waitForFunction(l=>window.currentAdventureScene?.levelConfig?.id===l&&currentAdventureScene.fallingStones?.length,level);await page.waitForTimeout(3500);
  const result=await page.evaluate(()=>{const s=currentAdventureScene,c=s.levelConfig;__qaState.isPaused=false;
   const h=s.fallingStones[0];s.dog.body.reset(h.x-100,h.floor-100);h.clock=0;s.updateAuthoredHazards(200);const warned=h.marker.alpha>.1&&!h.sprite.body.enable;h.clock=1200;s.updateAuthoredHazards(1);const falling=h.sprite.body.enable&&h.sprite.visible;
   const phase=s.phasePlatforms[0];let flicker=true;if(phase){phase.clock=2900;s.updateAuthoredHazards(1);const off=!phase.sprite.body.enable;phase.clock=0;s.updateAuthoredHazards(1);flicker=off&&phase.sprite.body.enable;}
   let wind=true;const w=s.levelHazards.find(h=>h.minX!==undefined);if(w){s.dog.body.reset(w.minX+50,100);s.dog.body.blocked.down=false;s.dog.body.touching.down=false;s.dog.setVelocityX(250);w.update(100,16);wind=s.dog.body.velocity.x!==250;}
   const gates=c.gateLocations.every((x,i)=>c.solidSegments.some(seg=>x-100>=seg.startX&&x+280<=seg.endX&&seg.y===c.gateHeights[i]));
   s.dog.body.reset(140,595);s.dog.setVelocity(0,0);return {warned,falling,flicker,wind,gates,count:s.gates.length,exit:s.exitGroundY===s.groundY+c.exitHeight};
  });Object.entries(result).forEach(([k,v])=>assert(k==='count'?v===7:v,`${level}/${k}`));
  await page.evaluate(()=>{const s=currentAdventureScene;s.dog.body.reset(300,595);s.dog.setVelocity(0,0);s.enemiesGroup.getChildren().forEach(e=>e.disableBody(true,true));});
  await page.waitForFunction(()=>currentAdventureScene.dog.body.blocked.down||currentAdventureScene.dog.body.touching.down);
  const jump=await page.evaluate(async()=>{const s=currentAdventureScene,target=s.levelConfig.platformSpots[0];s.touchRight=true;s.queueJump();const start=s.time.now;let air=false;return new Promise(resolve=>{const tick=()=>{air ||= s.dog.body.velocity.y < -100;if(s.dog.x>=target.x)s.touchRight=false;const landed=air&&s.dog.x>target.x-60&&(s.dog.body.blocked.down||s.dog.body.touching.down)&&Math.abs(s.dog.body.bottom-(s.groundY+target.y-43))<8;if(landed||s.time.now-start>35000){s.events.off('postupdate',tick);s.clearTouchInputs();resolve({landed,air,x:s.dog.x,bottom:s.dog.body.bottom,top:s.groundY+target.y-43,vx:s.dog.body.velocity.x,vy:s.dog.body.velocity.y});}};s.events.on('postupdate',tick);});});assert(jump.landed,'Real input jump '+level+JSON.stringify(jump));console.log('Level '+level+' real first-platform jump PASS');
  await page.screenshot({path:`/tmp/traversal-level-${level}.png`});console.log('Level '+level+' runtime warnings, collisions, wind, gates and exit PASS');
 }
 assert.deepEqual(errors,[]);console.log('No browser exceptions PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
