#!/usr/bin/env python3
"""
Parser to convert ISO_simple_questions.txt and IEO_questions.txt into structured JSON files for Cosmic Quest IQ.
"""

import json
import re

ISO_SECTOR_MAP = {
    1: {"name": "Logical Reasoning & Patterns", "badge": "Logic Pioneer", "icon": "🧩", "topic": "Logic"},
    2: {"name": "Living World, Food & Plants", "badge": "Bio Explorer", "icon": "🌱", "topic": "Biology"},
    3: {"name": "Physics, Motion & Electricity", "badge": "Photon Master", "icon": "⚡", "topic": "Physics"},
    4: {"name": "Matter, Magnets & Changes", "badge": "Alchemist Titan", "icon": "🧪", "topic": "Chemistry"},
    5: {"name": "Science Achievers & HOTS Mastery", "badge": "Science Grandmaster", "icon": "🔬", "topic": "HOTS Science"}
}

IEO_SECTOR_MAP = {
    1: {"name": "Word Power & Vocabulary", "badge": "Lexicon Wizard", "icon": "📖", "topic": "Vocabulary"},
    2: {"name": "Grammar & Sentence Structure", "badge": "Grammar Guru", "icon": "✒️", "topic": "Grammar"},
    3: {"name": "Reading Comprehension & Context", "badge": "Story Navigator", "icon": "🔍", "topic": "Reading"},
    4: {"name": "Spoken & Written Expression", "badge": "Eloquent Voice", "icon": "💬", "topic": "Expression"},
    5: {"name": "English Achievers & HOTS Mastery", "badge": "Linguistic Titan", "icon": "👑", "topic": "HOTS English"}
}

def clean_latex(s):
    if not s:
        return ''
    s = re.sub(r'\\text\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\xrightarrow\{([^}]*)\}', r'(\1) -> ', s)
    s = s.replace(r'\to', '->')
    s = s.replace(r'\times', '×')
    s = s.replace('$', '')
    s = re.sub(r'[ \t]+', ' ', s).strip()
    return s

def parse_questions(filepath, sector_map, subject_tag):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean non-breaking spaces and strange unicode spaces
    content = content.replace('\u2028', '\n').replace('\xa0', ' ').replace('\u200b', '')

    pattern = re.compile(r'(?:^|\n)(?:(?:Section\s+\d+.*?|\d+\s+Mark.*?)\n)*(\d+)\.\s+', re.MULTILINE)
    matches = list(pattern.finditer(content))
    
    expected = 1
    valid_matches = []
    for m in matches:
        num = int(m.group(1))
        if num == expected and num <= 50:
            valid_matches.append((num, m.start(1), m.end()))
            expected += 1
            if expected > 50:
                break

    questions = []
    for i in range(len(valid_matches)):
        q_num, start_pos, content_start = valid_matches[i]
        end_pos = valid_matches[i+1][1] if i + 1 < len(valid_matches) else len(content)
        q_text_block = content[content_start:end_pos].strip()

        # Cleanly split stem/options from answer/explanation
        parts = re.split(r'\n*Answer:\s*', q_text_block, maxsplit=1)
        opt_block = parts[0]
        ans_expl_block = parts[1] if len(parts) > 1 else ''

        # Extract Stem
        stem_match = re.search(r'^(.*?)(?=\([A-D]\))', opt_block, re.DOTALL)
        stem = stem_match.group(1).strip() if stem_match else opt_block
        stem = re.sub(r'^\d+\s*Mark[^\n]*\n*', '', stem).strip()
        stem = clean_latex(stem)

        # Extract 4 Options
        opt_pattern = re.compile(r'\(([A-D])\)\s*(.*?)(?=\([A-D]\)|$)', re.DOTALL)
        options = []
        for opt_m in opt_pattern.finditer(opt_block):
            options.append(clean_latex(opt_m.group(2).strip()))

        if len(options) > 4:
            options = options[:4]

        # Extract Answer Letter & Index
        ans_match = re.search(r'^\(([A-D])\)', ans_expl_block.strip())
        if not ans_match:
            ans_match = re.search(r'\(([A-D])\)', ans_expl_block)
        ans_letter = ans_match.group(1) if ans_match else 'A'
        ans_idx = ['A', 'B', 'C', 'D'].index(ans_letter)

        # Extract Explanation
        expl_match = re.search(r'Explanation:\s*(.*?)$', ans_expl_block, re.DOTALL)
        explanation = expl_match.group(1).strip() if expl_match else ans_expl_block
        explanation = clean_latex(explanation)
        # Remove trailing Section header if present
        explanation = re.split(r'Section\s+\d+:', explanation)[0].strip()

        sector_id = min(5, ((q_num - 1) // 10) + 1)
        sec_info = sector_map[sector_id]

        hint = f"Carefully consider option ({ans_letter}) - {options[ans_idx][:45]}!"
        if "starch" in explanation.lower() or "iodine" in explanation.lower():
            hint = "Think about iodine turning blue-black when it touches starch!"
        elif "circuit" in explanation.lower() or "switch" in explanation.lower():
            hint = "Think about whether electric current can flow when the switch is open!"
        elif "magnet" in explanation.lower():
            hint = "Remember how opposite poles attract and Earth's magnetic poles guide compasses!"
        elif "photosynthesis" in explanation.lower():
            hint = "Remember the sun-powered process plants use to produce their own food!"
        elif "rectilinear" in explanation.lower() or "periodic" in explanation.lower():
            hint = "Check whether the movement is along a straight line or repeating in cycles!"

        questions.append({
            "id": q_num,
            "subject": subject_tag,
            "sector": sector_id,
            "sectorName": sec_info["name"],
            "sectorBadge": sec_info["badge"],
            "sectorIcon": sec_info["icon"],
            "topic": sec_info.get("topic", sec_info["name"].split("&")[0].strip()),
            "question": stem,
            "options": options,
            "answerIndex": ans_idx,
            "answerLetter": ans_letter,
            "explanation": explanation or f"The correct answer is ({ans_letter}) {options[ans_idx]}.",
            "hint": hint
        })

    return questions

def main():
    # Use the new ISO-simple question bank!
    iso_q = parse_questions('ISO_simple_questions.txt', ISO_SECTOR_MAP, 'ISO')
    with open('data/iso_questions.json', 'w', encoding='utf-8') as f:
        json.dump(iso_q, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated data/iso_questions.json with {len(iso_q)} questions from ISO-simple!")

    ieo_q = parse_questions('IEO_questions.txt', IEO_SECTOR_MAP, 'IEO')
    with open('data/ieo_questions.json', 'w', encoding='utf-8') as f:
        json.dump(ieo_q, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated data/ieo_questions.json with {len(ieo_q)} questions from IEO!")

if __name__ == '__main__':
    main()
