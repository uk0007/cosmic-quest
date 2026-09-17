// Paired, isolated mobile software-renderer samples; not a physical-device benchmark.
const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,ignoreHTTPSErrors:true,serviceWorkers:'block'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForFunction(()=>window.CosmicAdventureEngine);
 const results=[];
 for(let level=1;level<=3;level++){
  await p.evaluate(l=>CosmicAdventureEngine.startAdventure(l),level);await p.waitForFunction(l=>window.currentAdventureScene?.levelConfig?.id===l&&window.currentAdventureScene?.dog,level);await p.waitForTimeout(4000);
  for(const maxFPS of [60,30,30,60]){
   await p.evaluate(f=>{AdventureBackground3D.maxFPS=f;},maxFPS);await p.waitForTimeout(600);
   results.push(await p.evaluate(async ({level,maxFPS})=>{
    const s=currentAdventureScene,b=AdventureBackground3D;const frames=[];let draws=0;
    const render=b.renderer.render.bind(b.renderer);b.renderer.render=(...args)=>{draws++;return render(...args);};
    return await new Promise(resolve=>{const start=performance.now();const step=(time,delta)=>{
     frames.push(delta);
     if(performance.now()-start>=4000){s.events.off('postupdate',step);b.renderer.render=render;const elapsed=performance.now()-start;frames.sort((a,b)=>a-b);resolve({level,maxFPS,gameFPS:frames.length*1000/elapsed,backgroundDrawsPerSecond:draws*1000/elapsed,p95:frames[Math.floor(frames.length*.95)]});}
    };s.events.on('postupdate',step);});
   },{level,maxFPS}));console.log(results.at(-1));
  }
 }
 fs.writeFileSync('artifacts/phase8h/performance-paired.json',JSON.stringify({results,errors},null,2));await b.close();if(errors.length)process.exitCode=1;
})();
