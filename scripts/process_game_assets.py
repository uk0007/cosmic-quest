#!/usr/bin/env python3
"""
Process and optimize assets from '2D Stylized Adventure Game Asset Pack'
into web-ready sprites and spritesheets under 'assets/adventure/'.
"""

import os
import re
from PIL import Image

SRC_DIR = "2D Stylized Adventure Game Asset Pack"
DEST_DIR = "assets/adventure"

os.makedirs(DEST_DIR, exist_ok=True)

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def build_spritesheet(folder_path, dest_filename, target_frames_count=12, frame_size=(171, 128)):
    """
    Samples frames evenly from folder_path, resizes them, and stitches into a horizontal spritesheet.
    """
    files = sorted([f for f in os.listdir(folder_path) if f.endswith('.png')], key=natural_sort_key)
    if not files:
        print(f"Warning: No PNGs found in {folder_path}")
        return 0

    total_files = len(files)
    step = max(1, total_files // target_frames_count)
    selected_files = [files[i] for i in range(0, total_files, step)][:target_frames_count]

    sheet_w = frame_size[0] * len(selected_files)
    sheet_h = frame_size[1]
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    for idx, fname in enumerate(selected_files):
        im = Image.open(os.path.join(folder_path, fname)).convert("RGBA")
        im_resized = im.resize(frame_size, Image.LANCZOS)
        sheet.paste(im_resized, (idx * frame_size[0], 0))

    out_path = os.path.join(DEST_DIR, dest_filename)
    sheet.save(out_path, "PNG", optimize=True)
    print(f"Created spritesheet {dest_filename}: {len(selected_files)} frames, size {sheet_w}x{sheet_h} ({os.path.getsize(out_path)//1024} KB)")
    return len(selected_files)

def optimize_single(src_rel, dest_filename, max_width=None, max_height=None):
    src_path = os.path.join(SRC_DIR, src_rel)
    if not os.path.exists(src_path):
        print(f"Warning: {src_path} not found")
        return False

    im = Image.open(src_path)
    if max_width and max_height:
        im.thumbnail((max_width, max_height), Image.LANCZOS)

    out_path = os.path.join(DEST_DIR, dest_filename)
    # Save as PNG or JPEG depending on alpha
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im.save(out_path, "PNG", optimize=True)
    else:
        im.convert("RGB").save(out_path, "JPEG", quality=85, optimize=True)

    print(f"Optimized {dest_filename}: size {im.size} ({os.path.getsize(out_path)//1024} KB)")
    return True

def main():
    print("=== Processing 2D Stylized Adventure Game Asset Pack ===")

    # 1. Dog Spritesheets (Frame size: 171x128, which maintains the 228x170 ratio 1.34)
    frame_w, frame_h = 171, 128
    idle_count = build_spritesheet(
        os.path.join(SRC_DIR, "Animation/Dog/Dog_Idle"),
        "dog_idle.png",
        target_frames_count=12,
        frame_size=(frame_w, frame_h)
    )
    walk_count = build_spritesheet(
        os.path.join(SRC_DIR, "Animation/Dog/Dog_Walk"),
        "dog_walk.png",
        target_frames_count=14,
        frame_size=(frame_w, frame_h)
    )
    sniff_count = build_spritesheet(
        os.path.join(SRC_DIR, "Animation/Dog/Dog_Sniffing"),
        "dog_sniff.png",
        target_frames_count=12,
        frame_size=(frame_w, frame_h)
    )

    # 2. Environment Elements
    optimize_single("Enviroment/Ground/Ground_1.png", "ground_1.png", max_width=800, max_height=400)
    optimize_single("Enviroment/Ground/Platforms .png", "platform.png", max_width=900, max_height=160)
    optimize_single("Enviroment/Trees/Tree_1.png", "tree_1.png", max_width=450, max_height=560)
    optimize_single("Enviroment/Trees/Tree_2.png", "tree_2.png", max_width=450, max_height=560)
    optimize_single("Enviroment/Rocks/Rock_1.png", "rock_1.png", max_width=250, max_height=200)
    optimize_single("Enviroment/Rocks/Stone_1.png", "stone_1.png", max_width=200, max_height=180)
    optimize_single("Enviroment/Mountains/Mountains_1.png", "mountains.png", max_width=1000, max_height=400)
    optimize_single("Enviroment/Cloud.png", "cloud.png", max_width=400, max_height=250)
    optimize_single("Enviroment/Door.png", "gate_door.png", max_width=350, max_height=420)
    optimize_single("Enviroment/Bone_B.png", "bone.png", max_width=80, max_height=30)
    optimize_single("Enviroment/Crystal_ground.png", "crystal.png", max_width=80, max_height=100)
    optimize_single("Enviroment/Rune stone/Symbol_Stone_1.png", "rune_stone.png", max_width=140, max_height=160)

    # 3. UI Icons
    optimize_single("UI/Bone.png", "ui_bone.png", max_width=60, max_height=25)
    optimize_single("UI/Crystal.png", "ui_crystal.png", max_width=40, max_height=80)
    optimize_single("UI/Paw_1.png", "ui_paw.png", max_width=60, max_height=60)
    optimize_single("UI/Health_Bar..png", "ui_health_bar.png", max_width=280, max_height=45)
    optimize_single("UI/Health_Green.png", "ui_health_fill.png", max_width=240, max_height=36)

    # Write asset manifest json
    manifest = {
        "frame_width": frame_w,
        "frame_height": frame_h,
        "idle_frames": idle_count,
        "walk_frames": walk_count,
        "sniff_frames": sniff_count,
    }
    with open(os.path.join(DEST_DIR, "manifest.json"), "w") as mf:
        import json
        json.dump(manifest, mf, indent=2)

    print("=== Asset processing complete! Manifest saved. ===")

if __name__ == '__main__':
    main()
