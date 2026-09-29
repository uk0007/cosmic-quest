/* Stable, disjoint level pools. Text keys also catch duplicate IDs/imported copies. */
(function(root){
 const key=q=>String(q.question||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const hash=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
 root.adventureQuestionKey=key;
 root.getAdventureQuestionPool=function(bank,level,fallback=[]){
   const unique=new Map();
   const add=questions=>(questions||[]).forEach(q=>{const k=key(q);if(k&&Array.isArray(q.options)&&!unique.has(k))unique.set(k,q);});
   add(bank);
   // Short custom banks are supplemented from the same subject, never another subject.
   if(unique.size<63)add(fallback);
   return [...unique.entries()].sort((a,b)=>hash(a[0])-hash(b[0])||a[0].localeCompare(b[0]))
     .filter((_,i)=>i%9===[1,2,3,4,5,6,7,8,9].indexOf(level)).map(([,q])=>q);
 };
 // Keep a shuffled draw pile across retries, level restarts and page reloads.
 // A question returns only after the level's complete pool has been used.
 const memory={};
 root.drawAdventureQuestion=function(pool,subject,level,used=new Set()){
   const storageKey='cosmic-question-deck-v3:'+subject+':'+level;
   const keys=pool.map(key),signature=keys.join('|');
   let state=memory[storageKey];
   if(!state){try{state=JSON.parse(root.localStorage?.getItem(storageKey)||'null');}catch{}}
   if(!state||state.signature!==signature||!Array.isArray(state.remaining))state={signature,remaining:[],last:null};
   const shuffle=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
   if(!state.remaining.some(k=>!used.has(k))){
     const candidates=keys.filter(k=>!used.has(k));
     if(!candidates.length)return null;
     // Preserve undrawn entries excluded by this run, then refill eligible entries.
     state.remaining=[...state.remaining.filter(k=>used.has(k)),...shuffle(candidates)];
   }
   let index=state.remaining.findIndex(k=>!used.has(k)&&k!==state.last);
   if(index<0)index=state.remaining.findIndex(k=>!used.has(k));
   const chosen=state.remaining.splice(index,1)[0];state.last=chosen;memory[storageKey]=state;
   try{root.localStorage?.setItem(storageKey,JSON.stringify(state));}catch{}
   return pool.find(q=>key(q)===chosen)||null;
 };
})(typeof window!=='undefined'?window:globalThis);
