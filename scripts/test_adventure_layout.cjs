const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('scripts/adventure_game.js', 'utf8');
const profile = {}; new Function('window', fs.readFileSync('scripts/illustrated_levels.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_five.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_six.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_seven.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/biome_challenges.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_two_three.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_six_seven_traversal.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_eight.js','utf8'))(profile);
const configs = new Function('window', source.slice(source.indexOf('  const LEVEL_CONFIGS ='), source.indexOf('  const AdventureState =')) + '\nreturn LEVEL_CONFIGS;')(profile);
for (const cfg of Object.values(configs)) {
  assert.equal(cfg.sections.length, 7);
  assert.equal(cfg.gateLocations.length, 7);
  assert.equal(cfg.enemies.length, cfg.id===2?4:cfg.id===3?3:cfg.id===4?16:cfg.id===6?5:cfg.id===7?4:cfg.id===8?21:13, 'Authored enemy count');
  assert.equal(cfg.diamondGateIndices.length, 3);
  assert.equal(cfg.boneOffsets.length, cfg.totalBones);
  assert.equal(cfg.crystalOffsets.length, cfg.totalCrystals);
  assert.equal(cfg.cave.flipX, true, 'Left approach requires mirrored pack doorway');
  assert(cfg.exitX > cfg.gateLocations[6] + 300);
  for (let i=0;i<cfg.sections.length;i++) {
    const section=cfg.sections[i];
    assert(section.landmarkX >= section.startX && section.landmarkX < (i===6?cfg.exitX:section.gateX), `Landmark outside section ${cfg.id}/${i}`);
    assert(cfg.boneOffsets.some(b=>b.x >= section.startX && b.x <= section.gateX), `No collectible route ${cfg.id}/${i}`);
    const x=section.gateX-70;
    assert(!cfg.trenches.some(t=>x-32<t.endX && x+32>t.startX), `Unsafe checkpoint ${cfg.id}/${i}`);
    assert(!cfg.enemies.some(e=>e.type!=='fly' && x>e.minX-45 && x<e.maxX+45), `Enemy at checkpoint ${cfg.id}/${i}`);
    if(cfg.diamondGateIndices.includes(i))assert(!cfg.trenches.some(t=>section.gateX<t.endX&&section.gateX+280>t.startX), 'Vault must rest entirely on solid ground');
  }
  for (const p of [...cfg.platformSpots,...cfg.movingSpots,...cfg.collapsingRocks]) assert(cfg.id===8?(p.y>=-900&&p.y<=100):cfg.id===7?(p.y>=0&&p.y<3920):(p.y>=(cfg.authoredTraversal?-900:cfg.id>=5?-550:-300) && p.y<=-40));
  console.log(`Level ${cfg.id}: seven section routes, landmarks, gates, vaults, and checkpoints PASS`);
}
for (const name of ['ambientButterflies','ambientBubbles','ambientFlies','collapsingRocks','thorns']) assert(source.includes(`cfg.${name}.forEach`), `${name} not wired to scene`);
assert(source.includes('this.obstacles[idx] = obstacle'));
console.log('Authored ambience/hazards and sparse vault indexing PASS');

const sky=configs[5];
assert.equal(sky.ascentRoutes.length,7);
assert.equal(sky.trenches.length,7);
for(const route of sky.ascentRoutes){
 assert(Math.min(...route.map(p=>p.y))<=-375,'Each crossing requires a high climb');
 for(let i=1;i<route.length;i++){
  assert(route[i].x-route[i-1].x<=360,'Horizontal landing reach');
  assert(Math.abs(route[i].y-route[i-1].y)<=125,'Step rise');
 }
}
console.log('Seven mandatory elevated routes and step spacing PASS');

// Other biomes must retain exactly their previous authored configuration.
const {execFileSync}=require('node:child_process');
const baseline=execFileSync('git',['show','b057835:scripts/adventure_game.js'],{encoding:'utf8'});
new Function('window',fs.readFileSync('scripts/illustrated_levels.js','utf8'))(profile);
const before=new Function('window',baseline.slice(baseline.indexOf('  const LEVEL_CONFIGS ='),baseline.indexOf('  const AdventureState ='))+'\nreturn LEVEL_CONFIGS;')(profile);
for(const id of [1,2,3,4,5])assert.deepEqual(configs[id],before[id],`Unrelated level ${id} changed`);
console.log('Levels 1–5 configurations unchanged PASS');

const thermal=configs[6],glacial=configs[7];
assert(thermal.movingSpots.some(p=>p.distanceX>=700),'Long ferry crossing required');
assert(thermal.heatedSpots.length>=6&&thermal.hazards.filter(h=>h.type==='geyser').length===2,'Thermal decisions present');
assert.equal(glacial.iceTraversal,true);
assert(glacial.shardSpots.some(p=>p.direction===1)&&glacial.shardSpots.some(p=>p.direction===-1),'Both glacial volley directions');
assert(new Set(glacial.gateHeights.map((h,i)=>h-(i?glacial.gateHeights[i-1]:0))).size>4,'Descent must not reuse equal-height sections');
for(const c of [thermal,glacial]){
 assert.equal(c.totalBones,c.boneOffsets.length);
 for(const x of c.gateLocations){
  assert([...c.heatedSpots,...c.shardSpots,...c.signatureHazards].every(h=>Math.abs(h.x-x)>350),'Gate rest clear of local traps');
 }
 assert(c.trenches.every(t=>t.fallY>=Math.max(...c.solidSegments.filter(s=>s.endX===t.startX||s.startX===t.endX).map(s=>s.y))+250),'Pit recovery below both ledges');
}
console.log('Thermal ferry/heat routes and irregular glacial descent invariants PASS');

const glacier=configs[8];
assert(glacier.fallingHazards.length>=14);
assert.equal(glacier.gateLocations.length,7);
for(const route of glacier.ascentRoutes)for(let i=1;i<route.length;i++){
 assert(route[i].x-route[i-1].x<=320,'Glacier horizontal step within jump reach');
 assert(route[i-1].y-route[i].y<=140,'Glacier upward step within double jump reach');
 assert(route[i].y-route[i-1].y<=240,'Glacier controlled descent');
}
console.log('Glacier climb/drop spacing and icefall coverage PASS');
