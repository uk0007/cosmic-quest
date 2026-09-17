// Isolated reachability fixtures. Gates are open; terrain, hazards and jump physics remain active.
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,ignoreHTTPSErrors:true,serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/index.html');
 await page.waitForFunction(()=>window.CosmicAdventureEngine);
 const results=[];
 for(let level=1;level<=3;level++){
  await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);
  await page.waitForFunction(l=>window.currentAdventureScene?.levelConfig?.id===l&&currentAdventureScene.dog?.body,level);
  await page.waitForTimeout(800);
  await page.evaluate(()=>{const s=currentAdventureScene;for(let i=0;i<7;i++)s.unlockGate(i);});
  const targets=await page.evaluate(()=>[...currentAdventureScene.levelConfig.boneOffsets.map(b=>({...b,kind:'bone'})),...currentAdventureScene.levelConfig.crystalOffsets.map(b=>({...b,kind:'crystal'}))]);
  await page.evaluate(()=>{const s=currentAdventureScene;window.__routeSprites=new Map([...s.bonesGroup.getChildren().map(b=>['bone:'+b.x,b]),...s.crystalsGroup.getChildren().map(b=>['crystal:'+b.x,b])]);});
  const checks=[];
  for(const target of targets){
   const result=await page.evaluate(async target=>{
    const s=currentAdventureScene;
    const bone=window.__routeSprites.get(target.kind+':'+target.x);
    if(!bone)throw new Error('Missing collectible fixture '+JSON.stringify(target));
    if(!bone.active)return {target,alreadyCollected:true};
    const pit=s.levelConfig.trenches.find(t=>target.x>=t.startX&&target.x<=t.endX);
    const startX=pit?pit.startX-75:target.x;
    s.clearTouchInputs();s.dog.body.reset(startX,s.groundY-80);
    s.isFallingInTrench=false;s.dog.body.setAllowGravity(true);
    let first=false,second=false,lastJump=0;
    return await new Promise(resolve=>{
      const begin=s.time.now;
      const step=()=>{
       const d=s.dog,b=d.body;
       const dx=bone.x-d.x;
       s.touchRight=dx>12;s.touchLeft=dx< -12;
       s.tryFireCosmicPulse();
       if(!first&&(b.blocked.down||b.touching.down)){
        if(target.y<-70||pit){s.queueJump();first=true;lastJump=s.time.now;}
       }
       if(first&&!second&&s.time.now-lastJump>350&&s.jumpsLeft===1){s.queueJump();second=true;}
       if(!bone.active||s.time.now-begin>4500){s.events.off('postupdate',step);s.clearTouchInputs();resolve({target,collected:!bone.active,x:d.x,y:d.y});}
      };
      s.events.on('postupdate',step);
    });
   },target);
   checks.push(result);console.log(level,JSON.stringify(result));
  }
  results.push({level,checks});
 }
 fs.writeFileSync('artifacts/phase8h/optional-routes.json',JSON.stringify({results,errors},null,2));
 await browser.close();
 if(errors.length||results.some(r=>r.checks.some(c=>!c.collected&&!c.alreadyCollected)))process.exitCode=1;
})();
