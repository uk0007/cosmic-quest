"""Prepare additional original-pack art for the authored level redesign (no synthetic art)."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
src=root/'2D Stylized Adventure Game Asset Pack/Enviroment'
out=root/'assets/adventure/illustrated';out.mkdir(parents=True,exist_ok=True)
items={'ancient_tree':'Trees/Tree_1.png','fork_tree':'Trees/Tree_2.png','root_tree':'Trees/Tree_3.png','arch_tree':'Trees/Tree_4.png','distant_grove':'Trees/Trees.png','rock_stack':'Rocks/Rock_2.png','rock_shelf':'Rocks/Rock_4.png','rock_spire':'Rocks/Rock_6.png','rock_peak':'Rocks/Rock_5.png','rock_low':'Rocks/Stone_3.png','rock_cairn':'Rocks/Stone_9.png','rock_upright':'Rocks/Stone_10.png','earth_a':'Tile/Ground_A.png','earth_b':'Tile/Ground_B.png'}
manifest={}
for key,file in items.items():
 im=Image.open(src/file).convert('RGBA');im.thumbnail((850,1050),Image.Resampling.LANCZOS);im.save(out/(key+'.png'),optimize=True)
 manifest[key]={'source':file,'size':im.size}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Prepared',len(items),'original assets')
