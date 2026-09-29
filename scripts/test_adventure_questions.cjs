const fs=require('fs'),assert=require('assert');require('./adventure_questions.js');
for(const name of ['questions','iso_questions','ieo_questions']){
 const bank=JSON.parse(fs.readFileSync(`data/${name}.json`));const seen=new Set();
 for(const level of [1,2,3,4,5,6,7,8]){
  const pool=getAdventureQuestionPool(bank,level);assert(pool.length>=7);
  for(const q of pool){const k=adventureQuestionKey(q);assert(!seen.has(k),`${name} repeated across levels: ${k}`);seen.add(k);}
  assert.deepEqual(getAdventureQuestionPool([...bank].reverse(),level),pool,'Stable after reordering');
  assert.deepEqual(getAdventureQuestionPool([...bank,bank[0]],level),pool,'Duplicate ignored');
 }
 assert.equal(seen.size,new Set(bank.map(adventureQuestionKey)).size);console.log(name+': eight disjoint pools, at least seven questions each PASS');
 const short=bank.slice(0,3);for(const level of [1,2,3,4,5,6,7,8])assert(getAdventureQuestionPool(short,level,bank).length>=7);
}
// Reload the helper between draws to verify persistence, not merely in-memory state.
const vm=require('node:vm'),source=fs.readFileSync('scripts/adventure_questions.js','utf8'),stored=new Map();
const bank=JSON.parse(fs.readFileSync('data/questions.json'));
const fresh=()=>{const context={localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}};vm.createContext(context);vm.runInContext(source,context);return context;};
for(const level of [1,2,3,4,5,6,7,8]){
 const pool=getAdventureQuestionPool(bank,level),draws=[];
 for(let i=0;i<pool.length;i++){const api=fresh();draws.push(adventureQuestionKey(api.drawAdventureQuestion(pool,'persistence-test',level)));}
 assert.equal(new Set(draws).size,pool.length,'No repeat before pool exhaustion across reloads');
 const next=adventureQuestionKey(fresh().drawAdventureQuestion(pool,'persistence-test',level));assert.notEqual(next,draws.at(-1),'Cycle boundary must not repeat last question');
 const used=new Set();for(let i=0;i<7;i++){const q=fresh().drawAdventureQuestion(pool,'persistence-test',level,used);assert(q);const k=adventureQuestionKey(q);assert(!used.has(k));used.add(k);}
}
console.log('Persistent shuffled decks, reloads, cycle boundaries and seven-gate uniqueness PASS');
