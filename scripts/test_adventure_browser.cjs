/* Browser QA: read-only state instrumentation is inserted into the served HTML only.
 * Gameplay runs via movement/jump/fire inputs and quiz button clicks, never teleportation.
 * Snapshot mode moves the camera/player for composition inspection and is reported separately.
 * Run with NODE_PATH pointing to an installation of Playwright and a localhost server on 8765.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const {PNG} = require('pngjs');
const path = require('node:path');
const out = path.resolve(process.env.ADVENTURE_QA_OUTPUT || 'artifacts/phase8h');
fs.mkdirSync(out, {recursive:true});
(async () => {
 const browser = await chromium.launch({headless:true});
 const errors=[], failedAssets=[];
 const mobile=process.argv.includes('--mobile');
 const context=await browser.newContext({viewport: mobile ? {width:844,height:390}:{width:1280,height:720}, isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:true,serviceWorkers:'block'});
 const page=await context.newPage();
 page.on('pageerror', e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)failedAssets.push([r.status(),r.url()]);});
 await page.route('**/index.html', async route=>{
   const response=await route.fetch();let html=await response.text();
   html=html.replace('window.CosmicAdventureEngine = {','window.__qaState = AdventureState; window.CosmicAdventureEngine = {');
   await route.fulfill({response,body:html});
 });
 await page.goto('http://127.0.0.1:8765/index.html');
 await page.waitForFunction(()=>window.CosmicAdventureEngine && window.Phaser);
 const results=[];
 for(const level of (process.env.ADVENTURE_QA_LEVELS || '1,2,3,4').split(',').map(Number)){
   await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);
   await page.waitForFunction(l=>window.currentAdventureScene?.levelConfig?.id===l && window.currentAdventureScene?.dog?.body,level);
   await page.waitForTimeout(5500);
   if(process.argv.includes('--components')){
     const checks=[];
     await page.evaluate(()=>{for(let i=0;i<7;i++)currentAdventureScene.unlockGate(i);});
     // Isolated fixtures start above each platform, then use unmodified physics and controls.
     const platforms=await page.evaluate(()=>currentAdventureScene.movingPlatforms.getChildren().map((p,i)=>({i,x:p.x,y:p.y})));
     for(const {i} of platforms){
       await page.evaluate(i=>{const s=currentAdventureScene,p=s.movingPlatforms.getChildren()[i];s.dog.body.reset(p.x,p.y-130);s.clearTouchInputs();},i);
       await page.waitForFunction(i=>currentAdventureScene.ridingPlatform===currentAdventureScene.movingPlatforms.getChildren()[i],i,{timeout:6000});
       const before=await page.evaluate(()=>({x:currentAdventureScene.dog.x,y:currentAdventureScene.dog.y}));
       await page.waitForTimeout(350);
       const after=await page.evaluate(()=>({x:currentAdventureScene.dog.x,y:currentAdventureScene.dog.y}));
       checks.push({moving:i,rides:Math.hypot(before.x-after.x,before.y-after.y)>1});
     }
     for(let i=0;i<3;i++){
       await page.evaluate(i=>{const s=currentAdventureScene,p=s.collapsingRocks.getChildren()[i];p.reset();s.dog.body.reset(p.x,p.y-140);s.clearTouchInputs();},i);
       await page.waitForFunction(i=>currentAdventureScene.collapsingRocks.getChildren()[i].state==='shaking',i,{timeout:6000});
       const warning=await page.evaluate(i=>currentAdventureScene.collapsingRocks.getChildren()[i].warningMs,i);
       // Leave by an ordinary jump; observe fall and timed return without standing underneath it.
       await page.evaluate(()=>{const s=currentAdventureScene;s.queueJump();s.touchLeft=true;});
       await page.waitForTimeout(450);
       await page.evaluate(()=>currentAdventureScene.clearTouchInputs());
       await page.waitForFunction(i=>['falling','disabled'].includes(currentAdventureScene.collapsingRocks.getChildren()[i].state),i,{timeout:3000});
       await page.waitForFunction(i=>currentAdventureScene.collapsingRocks.getChildren()[i].state==='idle',i,{timeout:6000});
       checks.push({collapsing:i,warning,fallsAndReturns:true});
     }
     const geysers=await page.evaluate(()=>currentAdventureScene.levelHazards.map((h,i)=>h.plume?i:-1).filter(i=>i>=0));
     for(const i of geysers){
       await page.evaluate(i=>{const s=currentAdventureScene,h=s.levelHazards[i];s.dog.body.reset(h.x,s.groundY-50);s.clearTouchInputs();},i);
       await page.waitForFunction(()=>currentAdventureScene.dog.body.velocity.y < -500,null,{timeout:6000});
       const anchored=await page.evaluate(i=>Math.abs(currentAdventureScene.levelHazards[i].plume.y-(currentAdventureScene.groundY-4))<1,i);
       checks.push({geyser:i,launches:true,anchored});
     }
     // All checkpoints are on solid terrain with no overlapping thorns / patrolling enemies.
     const checkpointChecks=await page.evaluate(()=>{
       const c=currentAdventureScene.levelConfig;
       return c.gateLocations.map(g=>({x:g-70,solid:!c.trenches.some(t=>g-100<t.endX&&g-40>t.startX),safe:!c.enemies.some(e=>e.type!=='fly'&&g-70>e.minX-45&&g-70<e.maxX+45)&&!c.thorns.some(t=>Math.abs(t.x-(g-70))<65)}));
     });
     checks.push({checkpoints:checkpointChecks});
     // Touch input is an independent fixture: earlier geyser jumps may reach a locked gate.
     await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);
     await page.waitForTimeout(800);
     await page.locator('#btn-touch-right').dispatchEvent('pointerdown',{pointerId:1});
     await page.waitForTimeout(120);
     const right=await page.evaluate(()=>currentAdventureScene.dog.body.velocity.x>0);
     await page.locator('#btn-touch-jump').dispatchEvent('pointerdown',{pointerId:2});
     await page.waitForTimeout(120);
     const jump=await page.evaluate(()=>currentAdventureScene.dog.body.velocity.y<0);
     await page.locator('#btn-touch-right').dispatchEvent('pointerup',{pointerId:1});
     await page.locator('#btn-touch-jump').dispatchEvent('pointerup',{pointerId:2});
     checks.push({touch:{right,jump}});
     const groundBefore=await page.evaluate(()=>currentAdventureScene.groundY);
     await page.setViewportSize({width:390,height:844});
     await page.waitForTimeout(350);
     const portrait=await page.evaluate(()=>({ground:currentAdventureScene.groundY,covered:[document.getElementById('adventure-three-canvas'),document.querySelector('#phaser-game-container canvas')].every(c=>{const r=c.getBoundingClientRect();return Math.abs(r.width-innerWidth)<2&&Math.abs(r.height-innerHeight)<2;})}));
     await page.setViewportSize(mobile?{width:844,height:390}:{width:1280,height:720});
     await page.waitForTimeout(350);
     checks.push({resize:{stableGround:portrait.ground===groundBefore,fullViewport:portrait.covered}});
     results.push({level,checks});console.log('COMPONENTS',JSON.stringify(results.at(-1)));
     continue;
   }
   if(process.argv.includes('--snapshots')){
     const positions=await page.evaluate(()=>[140, currentAdventureScene.levelConfig.trenches[2].startX-130, currentAdventureScene.levelConfig.exitX-300]);
     const starVisibility=[];
     for(let i=0;i<positions.length;i++){
       await page.evaluate(x=>{const s=currentAdventureScene;s.physics.world.pause();s.dog.setPosition(x,s.groundY-48);s.cameras.main.stopFollow();s.cameras.main.centerOn(x+200,s.groundY-125);},positions[i]);
       await page.waitForTimeout(1800);
       await page.evaluate(()=>{CosmicAdventureEngine.game.loop.sleep();cancelAnimationFrame(AdventureBackground3D.animFrameId);});
       const visible=PNG.sync.read(await page.screenshot({path:path.join(out,`level-${level}-${['start','middle','exit'][i]}${mobile?'-mobile':''}.png`)}));
       await page.evaluate(()=>{const b=AdventureBackground3D;b.starPoints.visible=false;b.renderer.render(b.scene,b.camera);});
       const hidden=PNG.sync.read(await page.screenshot());
       let changed=0;
       for(let y=80;y<visible.height-80;y++)for(let x=0;x<visible.width;x++){
         const p=(y*visible.width+x)*4;
         if(Math.max(...[0,1,2].map(c=>Math.abs(visible.data[p+c]-hidden.data[p+c])))>4)changed++;
       }
       starVisibility.push({position:i,visibleStarPixels:changed});
       await page.evaluate(()=>{AdventureBackground3D.starPoints.visible=true;AdventureBackground3D.animate();CosmicAdventureEngine.game.loop.wake();});
     }
     results.push(await page.evaluate(()=>({level:currentAdventureScene.levelConfig.id,children:currentAdventureScene.children.length,stars:AdventureBackground3D.starPoints.geometry.attributes.position.count,collapsing:currentAdventureScene.collapsingRocks?.getLength(),thorns:currentAdventureScene.thorns?.getLength(),fps:CosmicAdventureEngine.game.loop.actualFps})));
     results.at(-1).starVisibility=starVisibility;
     continue;
   }
   await page.evaluate(()=>{
     const s=currentAdventureScene;
     window.__run={falls:0,landedMoving:0,landedCollapsing:0,frames:[],lastJump:0};
     const fall=s.handleTrenchFall.bind(s);s.handleTrenchFall=()=>{if(!s.isFallingInTrench)__run.falls++;fall();};
     s.events.on('postupdate',()=>{
       const q=window.__qaState,r=window.__run;
       r.frames.push(s.game.loop.delta);
       if(q.isPaused||s.isEnteringCave)return;
       if(!s.touchRight)document.getElementById('btn-touch-right').dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,bubbles:true}));
       const d=s.dog,b=d.body,onGround=b.blocked.down||b.touching.down;
       if(s.ridingPlatform)r.landedMoving++;
       if(s.collapsingRocks?.getChildren().some(x=>x.state==='shaking'))r.landedCollapsing++;
       const pit=s.levelConfig.trenches.find(t=>d.x>t.startX-115&&d.x<t.endX-20);
       const thorn=s.levelConfig.thorns?.find(t=>Math.abs(t.x-d.x)<100);
       if(onGround&&(pit||thorn)&&s.time.now-r.lastJump>400){document.getElementById('btn-touch-jump').dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,bubbles:true}));document.getElementById('btn-touch-jump').dispatchEvent(new PointerEvent('pointerup',{pointerId:2,bubbles:true}));r.lastJump=s.time.now;}
       if(pit&&!onGround&&b.velocity.y>50&&s.jumpsLeft===1&&d.x<pit.endX-50){document.getElementById('btn-touch-jump').dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,bubbles:true}));document.getElementById('btn-touch-jump').dispatchEvent(new PointerEvent('pointerup',{pointerId:2,bubbles:true}));r.lastJump=s.time.now;}
       s.tryFireCosmicPulse();
     });
   });
   const begin=Date.now();let lastLog=0;
   while(Date.now()-begin<100000){
     await page.waitForTimeout(120);
     const state=await page.evaluate(()=>({x:currentAdventureScene.dog.x,y:currentAdventureScene.dog.y,gate:__qaState.activeGateIndex,paused:__qaState.isPaused,cleared:__qaState.gatesCleared,answer:__qaState.activeQuestion?.answerIndex,entering:currentAdventureScene.isEnteringCave,victory:document.getElementById('screen-adventure-victory').classList.contains('active')}));
     if(Date.now()-lastLog>5000){console.log('progress',level,JSON.stringify(state));lastLog=Date.now();}
     if(state.victory)break;
     if(state.paused&&!state.entering){
       const option=page.locator('#adv-gate-options-grid button').nth(state.answer??0);
       if(await option.isVisible() && await option.isEnabled())await option.click();
       const next=page.locator('#btn-adv-capsule-next');
       if(await next.isVisible())await next.click();
     }
   }
   const result=await page.evaluate(()=>({level:currentAdventureScene.levelConfig.id,x:currentAdventureScene.dog.x,gates:__qaState.gatesCleared,diamonds:__qaState.diamonds,energy:__qaState.energy,victory:document.getElementById('screen-adventure-victory').classList.contains('active'),savedProgress:JSON.parse(localStorage.getItem('cosmic_quest_state')||'{}').adventureLevels?.[currentAdventureScene.levelConfig.id],nextButtonVisible:document.getElementById('btn-adv-next-level').style.display!=='none',falls:__run.falls,movingContactFrames:__run.landedMoving,collapsingContactFrames:__run.landedCollapsing,renderer:AdventureBackground3D.renderer.getContext().getParameter(AdventureBackground3D.renderer.getContext().getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL),fps:CosmicAdventureEngine.game.loop.actualFps,frameP95:__run.frames.sort((a,b)=>a-b)[Math.floor(__run.frames.length*0.95)]}));
   results.push(result);console.log('RESULT',result);
   await page.screenshot({path:path.join(out,`level-${level}-playthrough${mobile?'-mobile':''}.png`)});
 }
 fs.writeFileSync(path.join(out,`${process.argv.includes('--components')?'components':process.argv.includes('--snapshots')?'visual':'playthrough'}${mobile?'-mobile':''}.json`),JSON.stringify({results,errors,failedAssets},null,2));
 await browser.close();
 if(results.some(r=>r.starVisibility?.some(s=>s.visibleStarPixels<20))||results.some(r=>r.checks?.some(c=>c.rides===false||c.anchored===false||c.resize&&(!c.resize.stableGround||!c.resize.fullViewport)||c.checkpoints?.some(p=>!p.safe||!p.solid)||c.touch&&(!c.touch.right||!c.touch.jump)))||errors.length||failedAssets.length||(!process.argv.includes('--snapshots')&&!process.argv.includes('--components')&&results.some(r=>!r.victory)))process.exitCode=1;
})();
