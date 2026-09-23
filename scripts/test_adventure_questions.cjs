const fs=require('fs'),assert=require('assert');require('./adventure_questions.js');
for(const name of ['questions','iso_questions','ieo_questions']){
 const bank=JSON.parse(fs.readFileSync(`data/${name}.json`));const seen=new Set();
 for(let level=1;level<=4;level++){
  const pool=getAdventureQuestionPool(bank,level);assert(pool.length>=7);
  for(const q of pool){const k=adventureQuestionKey(q);assert(!seen.has(k),`${name} repeated across levels: ${k}`);seen.add(k);}
  assert.deepEqual(getAdventureQuestionPool([...bank].reverse(),level),pool,'Stable after reordering');
  assert.deepEqual(getAdventureQuestionPool([...bank,bank[0]],level),pool,'Duplicate ignored');
 }
 assert.equal(seen.size,new Set(bank.map(adventureQuestionKey)).size);console.log(name+': four disjoint pools, at least seven questions each PASS');
 const short=bank.slice(0,3);for(let level=1;level<=4;level++)assert(getAdventureQuestionPool(short,level,bank).length>=7);
}
