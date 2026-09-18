#!/usr/bin/env python3
"""Extract selected source art and aspect-preserving, union-cropped animation sheets.
Reads archives in place; never expands arbitrary archive paths onto the filesystem.
"""
from pathlib import Path
from PIL import Image
import io, json, zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/adventure/mossy';OUT.mkdir(parents=True,exist_ok=True)
manifest={}
def read(z,n): return Image.open(io.BytesIO(z.read(n))).convert('RGBA')
def static(key,file,box,size):
 with zipfile.ZipFile(ROOT/'New assets/Mossy Assets.zip') as z: im=read(z,'Mossy Tileset/Mossy - '+file+'.png').crop(box)
 alpha=im.getchannel('A');bands=[];start=None
 for y in range(im.height+1):
  occupied=y<im.height and alpha.crop((0,y,im.width,y+1)).getbbox() is not None
  if occupied and start is None:start=y
  if not occupied and start is not None:bands.append((start,y));start=None
 top,bottom=max(bands,key=lambda b:b[1]-b[0]);im=im.crop((0,top,im.width,bottom))
 im=im.crop(im.getbbox());im.thumbnail(size,Image.Resampling.LANCZOS);im.save(OUT/(key+'.png'),optimize=True);manifest[key]={'width':im.width,'height':im.height,'source':file}
def sheet(key,archive,folder,size,count=16):
 with zipfile.ZipFile(ROOT/'New assets'/archive) as z:
  names=sorted(n for n in z.namelist() if n.rsplit('/',1)[0]==folder and n.endswith('.png'))
  frames=[read(z,n) for n in names]
  boxes=[im.getbbox() for im in frames];box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
  scale=min(size[0]/(box[2]-box[0]),size[1]/(box[3]-box[1]))
  dims=(round((box[2]-box[0])*scale),round((box[3]-box[1])*scale))
  out=Image.new('RGBA',(size[0]*count,size[1]))
  for i in range(count):
   im=frames[i*len(frames)//count].crop(box).resize(dims,Image.Resampling.LANCZOS)
   out.alpha_composite(im,(i*size[0]+(size[0]-dims[0])//2,size[1]-dims[1]))
  out.save(OUT/(key+'.png'),optimize=True);manifest[key]={'frameWidth':size[0],'frameHeight':size[1],'frames':count,'source':folder}
static('moss_platform','FloatingPlatforms',(420,0,1580,520),(480,190))
static('moss_hill','MossyHills',(650,0,1950,650),(650,325))
static('moss_ridge','MossyHills',(0,1460,1450,2048),(725,294))
static('moss_column','BackgroundDecoration',(0,0,1100,4096),(260,970))
static('moss_hanging','Hanging Plants',(0,0,450,1200),(160,425))
static('moss_rock','Decorations&Hazards',(0,0,1580,1050),(240,160))
static('moss_monolith','Decorations&Hazards',(2800,0,4096,1050),(250,205))
static('moss_surface','TileSet',(512,0,1024,210),(256,105))
for key,folder,size in [('moss_flower','BlueFlower1',(128,160)),('moss_grass','Plant 3',(128,128)),('moss_fern','Plant Wind 1',(128,128)),('moss_spring','PlantJump',(96,80))]:sheet(key,'Plant Animations.zip','Plant Animations/'+folder,size)
for key,folder in [('moss_slime_green','SlimeGreen'),('moss_slime_orange','SlimeOrange')]:sheet(key,'Slimes.zip',folder,(96,72))
sheet('moss_wizard_idle','BlueWizard Animations.zip','BlueWizard/2BlueWizardIdle',(96,128))
sheet('moss_wizard_walk','BlueWizard Animations.zip','BlueWizard/2BlueWizardWalk',(96,128))
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Processed {len(manifest)} mossy assets; {sum(p.stat().st_size for p in OUT.glob("*.png"))//1024} KiB')
