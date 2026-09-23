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
   if(unique.size<28)add(fallback);
   return [...unique.entries()].sort((a,b)=>hash(a[0])-hash(b[0])||a[0].localeCompare(b[0]))
     .filter((_,i)=>i%4===level-1).map(([,q])=>q);
 };
})(typeof window!=='undefined'?window:globalThis);
