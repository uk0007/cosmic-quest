#!/usr/bin/env python3
"""
Parser to convert ISO_questions.txt and IEO_questions.txt into structured JSON files for Cosmic Quest IQ.
"""

import json
import re

ISO_SECTOR_MAP = {
    1: {"name": "Logical Reasoning & Patterns", "badge": "Logic Pioneer", "icon": "🧩"},
    2: {"name": "Physics, Light & Electricity", "badge": "Photon Master", "icon": "⚡"},
    3: {"name": "Chemistry, Matter & Changes", "badge": "Alchemist Titan", "icon": "🧪"},
    4: {"name": "Biology, Living Organisms & Habitats", "badge": "Bio Explorer", "icon": "🌱"},
    5: {"name": "Science Achievers & HOTS Mastery", "badge": "Science Grandmaster", "icon": "🔬"}
}

IEO_SECTOR_MAP = {
    1: {"name": "Word Power & Vocabulary", "badge": "Lexicon Wizard", "icon": "📖"},
    2: {"name": "Grammar & Sentence Structure", "badge": "Grammar Guru", "icon": "✒️"},
    3: {"name": "Reading Comprehension & Context", "badge": "Story Navigator", "icon": "🔍"},
    4: {"name": "Spoken & Written Expression", "badge": "Eloquent Voice", "icon": "💬"},
    5: {"name": "English Achievers & HOTS Mastery", "badge": "Linguistic Titan", "icon": "👑"}
}

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

        opt_pattern = re.compile(r'\((A|B|C|D)\)\s*(.*?)(?=\((?:A|B|C|D)\)|Answer:|$)', re.DOTALL)
        
        stem_match = re.search(r'^(.*?)(?=\([A-D]\))', q_text_block, re.DOTALL)
        stem = stem_match.group(1).strip() if stem_match else q_text_block
        
        stem = re.sub(r'^\d+\s*Mark[^\n]*\n*', '', stem).strip()

        options = []
        for opt_m in opt_pattern.finditer(q_text_block):
            if opt_m.group(1) in ['A', 'B', 'C', 'D']:
                opt_text = opt_m.group(2).strip()
                opt_text = re.split(r'Answer:', opt_text)[0].strip()
                options.append(opt_text)

        if len(options) > 4:
            options = options[:4]

        ans_match = re.search(r'Answer:\s*\(([A-D])\)', q_text_block)
        ans_letter = ans_match.group(1) if ans_match else 'A'
        ans_idx = ['A', 'B', 'C', 'D'].index(ans_letter)

        expl_match = re.search(r'Explanation:\s*(.*?)$', q_text_block, re.DOTALL)
        explanation = expl_match.group(1).strip() if expl_match else ""
        explanation = re.sub(r'\n+', ' ', explanation).strip()

        sector_id = min(5, ((q_num - 1) // 10) + 1)
        sec_info = sector_map[sector_id]

        hint = f"Carefully consider option ({ans_letter}) - {options[ans_idx][:45]}!"
        if "starch" in explanation.lower():
            hint = "Think about iodine turning blue-black with starch!"
        elif "series" in explanation.lower():
            hint = "Check the mathematical pattern or circuit connection!"
        elif "plural" in explanation.lower() or "singular" in explanation.lower():
            hint = "Look at whether the subject is singular or plural!"
        elif "superlative" in explanation.lower():
            hint = "Notice 'the' before the blank — it calls for a superlative!"

        questions.append({
            "id": q_num,
            "subject": subject_tag,
            "sector": sector_id,
            "sectorName": sec_info["name"],
            "sectorBadge": sec_info["badge"],
            "sectorIcon": sec_info["icon"],
            "topic": sec_info["name"].split("&")[0].strip(),
            "question": stem,
            "options": options,
            "answerIndex": ans_idx,
            "answerLetter": ans_letter,
            "explanation": explanation or f"The correct answer is ({ans_letter}) {options[ans_idx]}.",
            "hint": hint
        })

    return questions

def main():
    iso_q = parse_questions('ISO_questions.txt', ISO_SECTOR_MAP, 'ISO')
    with open('data/iso_questions.json', 'w', encoding='utf-8') as f:
        json.dump(iso_q, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated data/iso_questions.json with {len(iso_q)} questions!")

    ieo_q = parse_questions('IEO_questions.txt', IEO_SECTOR_MAP, 'IEO')
    with open('data/ieo_questions.json', 'w', encoding='utf-8') as f:
        json.dump(ieo_q, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated data/ieo_questions.json with {len(ieo_q)} questions!")

if __name__ == '__main__':
    main()
