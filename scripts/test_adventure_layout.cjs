const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('scripts/adventure_game.js', 'utf8');
const profile = {}; new Function('window', fs.readFileSync('scripts/illustrated_levels.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_five.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_six.js','utf8'))(profile);
new Function('window',fs.readFileSync('scripts/level_eight.js','utf8'))(profile);
const configs = new Function('window', source.slice(source.indexOf('  const LEVEL_CONFIGS ='), source.indexOf('  const AdventureState =')) + '\nreturn LEVEL_CONFIGS;')(profile);
for (const cfg of Object.values(configs)) {
  assert.equal(cfg.sections.length, 7);
  assert.equal(cfg.gateLocations.length, 7);
  assert.equal(cfg.enemies.length, [3,4].includes(cfg.id)?16:13, 'Authored enemy count');
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
  for (const p of [...cfg.platformSpots,...cfg.movingSpots,...cfg.collapsingRocks]) assert(cfg.id===8?(p.y>=0&&p.y<3920):(p.y>=(cfg.id>=5?-550:-300) && p.y<=-40));
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
