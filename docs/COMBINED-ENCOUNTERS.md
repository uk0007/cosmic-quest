# Combined late woodland encounters

Before Gates 6 and 7, combat and movement now overlap rather than relying only on a timed barrier.

- Six additional enemies: a ground patrol, flying attacker, and armored landing guard in each encounter (13 enemies in Level 1 total).
- Four continuously repeating cannons: lower lanes before the ravines and elevated lanes after them. Intervals range from 1.25 to 1.85 seconds, with a 350 ms muzzle warning. Shots move at 320 pixels/second and deal 8 damage.
- Two horizontal sweeping cutters threaten the elevated approach routes, while the existing vertical cutters and timed ravine barriers remain.
- Two extra raised platforms offer alternatives to ground-level cannon fire. Players can fight from a safe bank, jump the low shots, or take the upper route and evade its cutter.
- Cannon lanes stop before question/checkpoint areas and do not fire through the timed ravine opening. The armored guards make the landing a combat beat with room before the question gate.

The level remains 14,600 pixels long with seven question gates and three diamonds. Other levels are unchanged. Cannon shots use a fixed pool of 24 objects; movement and firing pause with gameplay, and shots retire at their lane boundary.

Checks: all four static level/checkpoint audits pass. Cannon fixtures verify movement, bounded pool recycling, four cannons, two sweeping cutters and thirteen enemies. The full touch playthrough completed seven gates and three diamonds with no falls and 100% final energy; results are stored under `artifacts/combined-encounters/`. This verifies one successful route and timing sequence, not every possible timing. Software-rendered average was 12.7 FPS; physical-device performance remains unverified. The fixture disables physics for isolated inspection; the playthrough retains combat.
