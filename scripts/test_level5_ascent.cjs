// Isolated route fixture: enemies and hazards disabled; original jump and platform physics.
const {chromium}=require('playwright');const fs=require('fs');
const level=Number(process.env.ADVENTURE_QA_LEVEL||5),out=`artifacts/level${level}-ascent`;
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/index.html');await page.waitForFunction(()=>window.CosmicAdventureEngine);await page.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);await page.waitForFunction(()=>window.currentAdventureScene?.dog?.body);await page.waitForTimeout(1200);
 await page.evaluate(()=>{const s=currentAdventureScene;for(let i=0;i<7;i++)s.unlockGate(i);s.enemiesGroup.clear(true,true);s.handleDogHazardCollision=()=>{};});
 const results=[];
 for(let i=0;i<7;i++){
 const result=await page.evaluate(async i=>{const s=currentAdventureScene,r=s.levelConfig.ascentRoutes[i];s.clearTouchInputs();s.dog.body.reset(r[0].x-110,s.groundY-80);s.isFallingInTrench=false;
 let target=0,lastJump=-9999,second=false;const began=s.time.now;
 return await new Promise(resolve=>{const step=()=>{const d=s.dog,b=d.body,p=r[target];const grounded=b.blocked.down||b.touching.down;
 if(grounded&&Math.abs(d.x-p.x)<65&&Math.abs(b.bottom-(s.groundY+p.y-43))<95){target++;lastJump=-9999;second=false;if(target===r.length){s.events.off('postupdate',step);s.clearTouchInputs();resolve({section:i+1,landed:target});return;}}
 const next=r[target];const dx=next.x-d.x;s.touchRight=dx>15;s.touchLeft=dx< -15;
 if(grounded&&s.time.now-lastJump>450){s.queueJump();lastJump=s.time.now;second=false;}
 else if(!second&&s.time.now-lastJump>260&&s.jumpsLeft===1){s.queueJump();second=true;}
 if(s.time.now-began>22000||d.y>s.groundY+100){s.events.off('postupdate',step);s.clearTouchInputs();resolve({section:i+1,landed:target,failed:true,x:d.x,y:d.y});}
 };s.events.on('postupdate',step);});},i);results.push(result);console.log(result);}
 await page.evaluate(()=>{const s=currentAdventureScene,p=s.levelConfig.ascentRoutes[3][2];s.dog.body.reset(p.x,s.groundY+p.y-100);s.cameras.main.centerOn(p.x,s.groundY-260);});await page.waitForTimeout(600);
 fs.mkdirSync(out,{recursive:true});await page.screenshot({path:out+'/design.png'});fs.writeFileSync(out+'/routes.json',JSON.stringify({results,errors},null,2));if(errors.length||results.some(r=>r.failed))process.exitCode=1;
 }finally{await browser.close();}})();
