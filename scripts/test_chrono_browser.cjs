const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 const mobile=process.argv.includes('--touch'),p=await browser.newPage({ignoreHTTPSErrors:true,viewport:mobile?{width:844,height:390}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/index.html',async r=>{const res=await r.fetch();await r.fulfill({response:res,body:(await res.text()).replace('window.CosmicAdventureEngine = {','window.__qaState=AdventureState;window.CosmicAdventureEngine = {')});});
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForFunction(()=>window.CosmicAdventureEngine);await p.evaluate(()=>CosmicAdventureEngine.startAdventure(9));await p.waitForFunction(()=>window.currentAdventureScene?.chronoRift?.orbs.length>0);await p.waitForTimeout(3000);
 await p.screenshot({path:`/tmp/chrono-start-${mobile?'touch':'keyboard'}.png`});
 if(process.argv.includes('--fixtures')){
 const result=await p.evaluate(()=>{const s=currentAdventureScene,r=s.chronoRift,q=__qaState;q.isPaused=false;
  const h=r.orbs[0];s.dog.body.reset(h.p.x,s.groundY+h.p.y-150);h.delay=0;h.model.reset();r.update(300);const warning=h.previous==='WARNING'&&!h.sprite.body.enable;r.update(850);
  const hit=()=>{q.energy=100;s.isInvulnerable=false;s.handleDogHazardCollision(s.dog,h.sprite);return q.energy;};q.activePowers.superUntil=0;q.activePowers.shield=false;const damage=hit()===92;q.activePowers.shield=true;const shield=hit()===100&&!q.activePowers.shield;q.activePowers.superUntil=s.time.now+3000;const superMode=hit()===100;q.activePowers.superUntil=0;
  const z=r.zones[0];s.dog.body.reset(z.x+100,z.y+200);r.update(1000);const low=r.gravity<.67&&s.dog.body.gravity.y<0;s.dog.body.reset(140,s.groundY-80);r.update(1000);const normal=r.gravity>.99;
  const phase=r.phases[0];phase.sprite.body.enable=false;phase.model.clock=10;s.dog.body.position.set(phase.sprite.body.x+30,phase.sprite.body.y-10);s.dog.body.updateCenter();r.update(0);const noPop=!phase.sprite.body.enable;
  q.checkpointX=s.levelConfig.gateLocations[3]-70;q.checkpointY=s.groundY+s.levelConfig.gateHeights[3]-80;s.respawnDog();const reset=r.orbs.every(o=>!o.sprite.body.enable)&&r.gravity===1&&s.dog.body.gravity.y===0&&r.phases.every(h=>h.model.clock===0);
  const checkpoints=s.levelConfig.gateLocations.every((x,i)=>{q.checkpointX=x-70;q.checkpointY=s.groundY+s.levelConfig.gateHeights[i]-80;s.respawnDog();return s.dog.x===x-70&&s.dog.body.gravity.y===0&&!r.orbs.some(h=>h.sprite.body.enable)&&s.levelConfig.solidSegments.some(t=>s.dog.x>t.startX&&s.dog.x<t.endX);});
  const energy=r.energy;const beforeEnergy=70;q.energy=beforeEnergy;s.dog.body.position.set(energy.body.center.x-s.dog.body.width/2,energy.body.center.y-s.dog.body.height/2);s.dog.body.updateCenter();s.physics.world.colliders.getActive().filter(c=>c.object2===energy).forEach(c=>s.physics.overlap(s.dog,energy,c.collideCallback,c.processCallback,c.callbackContext));const energyCrystal=!energy.active&&q.energy===85;

  return {warning,damage,shield,superMode,low,normal,noPop,reset,checkpoints,energyCrystal,gates:s.gates.length,diamonds:s.specialDiamonds.filter(Boolean).length,sky:AdventureBackground3D.chronoSky.visible&&!s.viewportBackdrop};});for(const [k,v]of Object.entries(result))assert(k==='gates'?v===7:k==='diamonds'?v===3:v,k);console.log('Rift fixtures PASS',result);assert.deepEqual(errors,[]);
 await p.evaluate(()=>{const s=currentAdventureScene;__qaState.isPaused=true;clearInterval(__qaState.gateTimerInterval);document.getElementById('adv-gate-modal').style.display='none';s.physics.pause();s.dog.body.reset(14420,s.groundY-390);s.dog.setVelocity(0,0);s.cameras.main.stopFollow();s.cameras.main.centerOn(14950,s.groundY-400);AdventureBackground3D.update(14500);});await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/chrono-heart.png'});return;
 }
 await p.evaluate(mobile=>{
 const s=currentAdventureScene,c=s.levelConfig;window.__run={index:0,falls:0,jumpAt:0,air:false,keys:{},doubles:0,phaseLandings:0,orbitLandings:0,gravityFrames:0,phaseContacts:new Set(),orbitContacts:new Set()};const r=__run;
 r.path=[...c.ascentRoutes.flat().map(p=>({...p,floor:s.groundY+p.y-43})),...c.solidSegments.flatMap(seg=>[{x:Math.max(140,seg.startX+100),floor:s.groundY+seg.y,ground:true},{x:Math.min(c.exitX+20,seg.endX-50),floor:s.groundY+seg.y,ground:true}])].sort((a,b)=>a.x-b.x).filter(p=>p.x<=c.exitX+20);
 const fall=s.handleTrenchFall.bind(s);s.handleTrenchFall=()=>{if(!s.isFallingInTrench)r.falls++;fall();};
 const button=(action,down)=>{if(action!=='jump'&&r.keys[action]===down)return;r.keys[action]=down;if(mobile){const el=document.getElementById('btn-touch-'+action);if(el)el.dispatchEvent(new PointerEvent(down?'pointerdown':'pointerup',{pointerId:action==='right'?1:action==='left'?3:2,bubbles:true}));}else{const code={right:39,left:37,jump:32,shoot:70}[action];window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:action==='jump'?' ':action==='shoot'?'f':action==='left'?'ArrowLeft':'ArrowRight',keyCode:code,which:code,code:action==='jump'?'Space':action==='shoot'?'KeyF':action==='left'?'ArrowLeft':'ArrowRight',bubbles:true}));}};
 r.press=button;const jump=()=>{button('jump',true);button('jump',false);};
 s.events.on('postupdate',()=>{
  if(__qaState.isPaused||s.isEnteringCave){button('right',false);button('left',false);return;}
  const d=s.dog,b=d.body,ground=b.blocked.down||b.touching.down;
  if(s.chronoRift.gravity<.8)r.gravityFrames++;
  if(ground){for(const h of s.chronoRift.phases){const p=h.sprite.body;if(p.enable&&Math.abs(b.bottom-p.top)<12&&b.right>p.left&&b.left<p.right)r.phaseContacts.add(h.p.x);}for(const h of s.chronoRift.orbits){const p=h.sprite.body;if(Math.abs(b.bottom-p.top)<12&&b.right>p.left&&b.left<p.right)r.orbitContacts.add(h.p.x);}}

  if(r.lastX!==undefined&&d.x<r.lastX-300){r.index=r.path.findIndex(p=>p.x>d.x+50);r.air=false;}r.lastX=d.x;
  let target=r.path[r.index];if(!target)return;
  const actual=s.movingPlatforms.getChildren().find(p=>Math.abs(p.x-target.x)<115&&Math.abs(p.y-(target.floor+43))<150);
  const tx=actual&&!target.ground?actual.x:target.x,tf=actual&&!target.ground?actual.body.top:target.floor;
  if(ground&&Math.abs(d.x-tx)<65&&b.bottom<=tf+22){if(target.kind==='phase'&&Math.abs(b.bottom-tf)<22)r.phaseLandings++;if(target.kind==='orbit')r.orbitLandings++;r.index++;r.air=false;return;}
  const phase=s.chronoRift.phases.find(h=>h.p.x===target.x);const canLand=!phase||phase.state==='SOLID'||phase.state==='RETURNING';
  const currentSeg=c.solidSegments.find(t=>d.x>=t.startX&&d.x<=t.endX),sameGround=target.ground&&currentSeg&&target.x>=currentSeg.startX&&target.x<=currentSeg.endX;
  if(ground&&!sameGround&&!r.air&&!canLand){button('right',false);button('left',false);return;}
  button('right',tx-d.x>12);button('left',tx-d.x< -12);
  if(ground&&!sameGround&&!r.air){jump();r.jumpAt=s.time.now;r.air=true;r.second=false;}
  if(!ground&&r.air&&!r.second&&s.time.now-r.jumpAt>480&&s.jumpsLeft===1){jump();r.second=true;r.doubles++;}
  if(ground&&r.air&&s.time.now-r.jumpAt>600&&Math.abs(d.x-tx)>65)r.air=false;
  if(s.time.now-(r.lastShot||0)>400){if(mobile){const el=document.getElementById('btn-touch-pulse');if(el){el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:4,bubbles:true}));el.dispatchEvent(new PointerEvent('pointerup',{pointerId:4,bubbles:true}));}}else{button('shoot',true);button('shoot',false);}r.lastShot=s.time.now;}
 });
 },mobile);
 const begin=Date.now();let logged=0;
 while(Date.now()-begin<300000){await p.waitForTimeout(150);const state=await p.evaluate(()=>({x:currentAdventureScene.dog.x,y:currentAdventureScene.dog.y,index:__run.index,target:__run.path[__run.index],falls:__run.falls,gates:__qaState.gatesCleared,paused:__qaState.isPaused,answer:__qaState.activeQuestion?.answerIndex,victory:document.getElementById('screen-adventure-victory').classList.contains('active')}));
 if(Date.now()-logged>10000){console.log(JSON.stringify(state));logged=Date.now();}if(state.victory)break;
 if(state.paused){const option=p.locator('#adv-gate-options-grid button').nth(state.answer||0);if(await option.isVisible()&&await option.isEnabled())await option.click();const next=p.locator('#btn-adv-capsule-next');if(await next.isVisible())await next.click();}
 }
 const result=await p.evaluate(()=>({victory:document.getElementById('screen-adventure-victory').classList.contains('active'),gates:__qaState.gatesCleared,diamonds:__qaState.diamonds,falls:__run.falls,doubles:__run.doubles,phaseLandings:__run.phaseContacts.size,orbitLandings:__run.orbitContacts.size,gravityFrames:__run.gravityFrames}));await p.screenshot({path:`/tmp/chrono-finish-${mobile?'touch':'keyboard'}.png`});console.log('PLAYTHROUGH',mobile?'touch':'keyboard',result,errors);assert(result.victory);assert.equal(result.gates,7);assert.equal(result.diamonds,3);assert(result.phaseLandings>=5&&result.orbitLandings>=2&&result.gravityFrames>0);assert.deepEqual(errors,[]);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
