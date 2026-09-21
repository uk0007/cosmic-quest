/* Authored scenery for the 21 illustrated sections. Coordinates are world pixels.
 * Each tuple: original-pack texture, x, scale, optional ground-relative y, optional flip.
 * These are placements, not procedural scatter; movement/collision remain in AdventureLevelScene.
 */
window.CosmicIllustratedScenes = {
  1: {
    palette: {night:[0.76,0.72,0.61],haze:[1.0,0.98,0.91]},
    sections: [
      {name:'Oldroot Clearing', landmark:['ancient_tree',70,0.94], decor:[['fork_tree',690,0.98,14,true],['rock_low',350,0.70],['ground_4',400,0.8]]},
      {name:'Rune Brook Crossing',landmark:['rune_spiral',1090,1.65],decor:[['root_tree',1000,0.72,10],['rock_shelf',1180,0.85],['rock_low',1575,0.65]]},
      {name:'Whispering Grove',landmark:['arch_tree',2140,1.12],decor:[['fork_tree',1850,0.88,15],['ancient_tree',2290,0.66,18,true],['ground_1',1990,0.8]]},
      {name:'Broken Root Bridge',landmark:['root_tree',2510,0.90],decor:[['rock_shelf',2520,0.9],['rock_stack',2940,0.75],['ground_3',3000,0.7]]},
      {name:'Fallen Stone Hollow',landmark:['rock_stack',3400,1.55],decor:[['arch_tree',3260,0.8,15,true],['mossy_rock',3890,0.85],['ground_4',3350,0.7]]},
      {name:'Twilight Rootway',landmark:['ancient_tree',4160,0.95],decor:[['root_tree',4470,0.9,15,true],['rock_low',4550,0.75],['ground_3',4640,0.6]]},
      {name:'Moonlit Grove Gate',landmark:['fork_tree',5010,0.95],decor:[['rock_spire',5610,0.46],['arch_tree',5830,0.9,15,true],['ground_5',5710,0.65]]}
    ],
    distant:[['distant_grove',500,0.78],['distant_grove',2240,0.70],['fork_tree',3600,0.85],['distant_grove',4950,0.75]],
    groundPatches:[['ground_1',230,1],['ground_3',960,1],['ground_4',1780,0.9],['ground_1',2290,1],['ground_5',3190,0.8],['ground_3',3940,1],['ground_4',4500,0.8],['ground_1',5540,1]]
  },
  2: {
    palette:{night:[0.055,0.065,0.10],haze:[0.21,0.21,0.28]},
    sections:[
      {name:'The Cavern Mouth',landmark:['cave_anim',280,0.95],decor:[['rock_peak',30,0.64],['rock_stack',470,1.25],['crystal_cluster',420,0.70]]},
      {name:'Amethyst Lantern Chamber',landmark:['crystal_cluster',1080,1.8],decor:[['rock_spire',960,0.64],['rock_low',1180,1.1],['crystal_cluster',1540,0.9]]},
      {name:'The Crystal Shaft',landmark:['rock_peak',2250,0.58],decor:[['rock_stack',1910,1.35],['crystal_cluster',2180,1.45],['rune_tablet',2320,1.0]]},
      {name:'Falling Stone Narrows',landmark:['rune_tablet',2490,1.60],decor:[['rock_spire',2540,0.55],['rock_stack',2910,1.1],['crystal_cluster',2940,0.85]]},
      {name:'The Deep Lift',landmark:['crystal_cluster',3890,1.9],decor:[['rock_peak',3330,0.58],['cavern_rock',3450,0.70],['rock_spire',3940,0.55]]},
      {name:'Chamber of Old Runes',landmark:['rune_spiral',4270,1.9],decor:[['rock_stack',4220,1.4],['rock_spire',4570,0.64],['rune_pillar',4660,1.35]]},
      {name:'The Silver Tunnel',landmark:['crystal_cluster',5730,1.7],decor:[['rock_peak',5060,0.52],['rock_spire',6080,0.65],['rock_low',5740,0.9]]}
    ],
    distant:[['rock_peak',340,1],['rock_spire',1450,1.15],['rock_peak',2380,0.95],['rock_spire',3370,1.1],['rock_peak',4490,0.95],['rock_spire',5700,1.1]],
    groundPatches:[['ground_cavern',200,0.95],['ground_5',1040,0.85],['ground_cavern',1910,1],['ground_5',2970,0.8],['ground_cavern',3350,0.9],['ground_5',4210,0.8],['ground_cavern',5540,1]],
    ceiling:[['rock_peak',160,0.68,-420],['rock_spire',970,0.60,-440],['rock_peak',1730,0.55,-570],['rock_stack',2250,1.65,-440],['rock_peak',2900,0.56,-460],['rock_spire',3490,0.64,-480],['rock_peak',4390,0.57,-440],['rock_stack',5030,1.8,-450],['rock_peak',5710,0.55,-460]]
  },
  3: {
    palette:{night:[0.14,0.20,0.28],haze:[0.48,0.55,0.62]},
    sections:[
      {name:'Skyward Cairns',landmark:['rock_cairn',280,1.65],decor:[['rock_spire',20,0.62],['rune_pillar',380,1.1],['ground_5',350,0.55]]},
      {name:'Suspended Stone Crossing',landmark:['rock_spire',1030,0.63],decor:[['rune_tablet',1120,1.2],['rock_shelf',1600,1.1],['rock_low',1690,0.6]]},
      {name:'The Wind Terrace',landmark:['rune_arch',2270,1.8],decor:[['rock_stack',2010,1.4],['rock_cairn',2380,1],['ground_3',2230,0.7]]},
      {name:'Ruins Above the Clouds',landmark:['rock_spire',2520,0.73],decor:[['rune_spiral',2550,1.65],['rock_peak',3090,0.45],['rock_low',3120,0.6]]},
      {name:'Crumbling Sky Ledge',landmark:['rock_peak',3400,0.53],decor:[['rock_shelf',3490,0.95],['rock_cairn',3910,1.0],['ground_5',3960,0.6]]},
      {name:'The High Sanctuary',landmark:['rune_pillar',4470,2],decor:[['rock_spire',4230,0.66],['rock_upright',4400,1.7],['rock_stack',4640,1.2],['rock_cairn',4720,0.85]]},
      {name:'Gateway of the Constellations',landmark:['rock_spire',5750,0.76],decor:[['rune_spiral',5610,1.55],['rock_peak',6170,0.53],['ground_5',5910,0.68]]}
    ],
    distant:[['mountains_summit',600,0.9],['mountains_4',2050,0.65],['mountains_summit',3610,1.05],['mountains_3',5270,0.80]],
    groundPatches:[['ground_5',250,0.85],['ground_3',920,0.9],['ground_5',2070,0.7],['ground_3',3180,0.75],['ground_5',4010,0.6],['ground_3',4600,0.8],['ground_5',5680,0.85]]
  }
};
