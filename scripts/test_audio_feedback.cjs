const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{
 const b=await chromium.launch({headless:true});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForFunction(()=>window.Sound);
 const results={};fs.mkdirSync('artifacts/audio-refresh',{recursive:true});
 for(const method of ['playCorrect','playWrong']){
 const pcm=await p.evaluate(async method=>{
  const s=new window.Sound.constructor();s.ctx=new OfflineAudioContext(1,44100*3,44100);s.sfxGain=s.ctx.createGain();s.sfxGain.gain.value=.32;s.sfxGain.connect(s.ctx.destination);s.bgmGain=s.ctx.createGain();s[method]();const rendered=await s.ctx.startRendering();return Array.from(rendered.getChannelData(0));
 },method);
 const peak=pcm.reduce((peak,v)=>Math.max(peak,Math.abs(v)),0);assert(peak>.01&&peak<1);results[method]={peak,samples:pcm.length};
 const wav=Buffer.alloc(44+pcm.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(44100,24);wav.writeUInt32LE(88200,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>wav.writeInt16LE(Math.round(v*32767),44+i*2));fs.writeFileSync(`artifacts/audio-refresh/${method}.wav`,wav);
 }
 await p.evaluate(()=>{Sound.init();Sound.playCorrect();Sound.playWrong();});await p.waitForTimeout(2200);
 const settings=await p.evaluate(()=>{Sound.toggleBgm();const off=Sound.bgmInterval===null;Sound.toggleBgm();const on=Sound.bgmInterval!==null;Sound.stopUpbeatMusic();return {off,on};});assert(settings.off&&settings.on);assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/audio-refresh/checks.json',JSON.stringify({results,settings,errors},null,2));console.log(results,settings);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
