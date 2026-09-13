#!/usr/bin/env python3
"""
Script to parse GK-50-100 questions and merge them into data/questions.json (making 100 total questions).
"""

import json
import re

HINTS = {
    1: "This foul-smelling botanical giant is native to Southeast Asian rainforests!",
    2: "One partner photosynthesizes while the other provides shelter and water!",
    3: "This tiny jewel of a bird can hover in mid-air and beat its wings in a figure-eight!",
    4: "Think of chameleons or polar bears blending invisibly into their habitat!",
    5: "Located in the western Pacific Ocean near Guam, its deepest point is the Challenger Deep!",
    6: "This massive basin is encircled by roughly 75% of the world's active volcanoes!",
    7: "This gas (CH₄) is produced in waterlogged paddy fields and livestock digestion!",
    8: "Rated 10 on the Mohs scale, it is made of pure crystallized carbon!",
    9: "He also created the rabies vaccine and has milk heating named after him!",
    10: "Launched by the Soviet Union in October 1957, emitting radio beeps!",
    11: "Think of rust! Its soil is rich in oxidized iron minerals.",
    12: "A red dwarf star located just 4.24 light-years from our Sun in the Alpha Centauri system!",
    13: "Last visible in 1986, this famous periodic comet will return in 2061!",
    14: "Surrounded by Central Asian mountains, its elevation exceeds 4,500 meters!",
    15: "Neither Sydney nor Melbourne, this planned capital was chosen as a compromise!",
    16: "Symbolized by '£', it is one of the world's oldest currencies still in use.",
    17: "This Swiss city hosts the UN European headquarters, WHO, and Red Cross.",
    18: "Located in Gujarat, it possessed a massive tidal dockyard connected to the Sabarmati river.",
    19: "He was also the first non-European to win the Nobel Prize in Literature in 1913.",
    20: "Flowing northwards through northeastern Africa for over 6,650 km into the Mediterranean!",
    21: "Right to Equality, Freedom, Against Exploitation, Religion, Culture & Education, and Constitutional Remedies.",
    22: "Born in Mumbai, this British author wrote about Mowgli, Bagheera, and Baloo.",
    23: "It means revealing confidential information or letting a secret out by mistake!",
    24: "Created by Sir Arthur Conan Doyle, he lived at 221B Baker Street in London.",
    25: "Named after the pioneer of Indian cinema who directed 'Raja Harishchandra' in 1913.",
    26: "Including the goalkeeper, each team has this standard number of players on the field.",
    27: "Originating from the Persian phrase 'Shah Mat' meaning 'the king is helpless'.",
    28: "Examples include 'MADAM', 'RACECAR', and 'ROTATOR'.",
    29: "Look at the differences: +4, +6, +8, +10... what comes next?",
    30: "At 6:00, the hour hand points at 6 and the minute hand points directly opposite at 12.",
    31: "ISRO's mission to send a 3-member crew to a 400 km low Earth orbit for 3 days.",
    32: "This tri-national tournament across North America will feature 48 participating teams.",
    33: "Leader of the Labour Party who won a landslide majority in the UK general election.",
    34: "At age 17, he won the FIDE Candidates Tournament in Toronto to challenge Ding Liren.",
    35: "This major UAE city hosted over 80,000 delegates at Expo City in late 2023.",
    36: "Built in the vast Rann of Kutch salt desert, spanning over 72,000 hectares.",
    37: "Led by Smriti Mandhana, they defeated Delhi Capitals in the final in New Delhi.",
    38: "Developed by NPCI, scanning QR codes uses this real-time payment network.",
    39: "Following Hangzhou 2022/2023, this Japanese prefecture and city will host in 2026.",
    40: "This Gulf energy powerhouse joined alongside UAE, Egypt, Iran, and Ethiopia in 2024.",
    41: "A strong password combines multiple words, symbols, and numbers without personal details.",
    42: "Cool running water relieves pain and reduces tissue damage—never apply ice or butter!",
    43: "Documenting evidence and reporting to trusted adults stops cyber harassment safely.",
    44: "Wet organic waste can be composted, while dry waste can be processed and recycled.",
    45: "Open communication in a private space resolves tension constructively without rumors.",
    46: "An anemometer measures wind, a lactometer checks milk, and a seismograph records tremors.",
    47: "Saturn's rings are made of billions of ice chunks, water ice, and cosmic dust particles!",
    48: "The Colosseum is in Rome, Italy, while the rose-red rock city of Petra is in Jordan.",
    49: "366 days = 52 weeks and 2 extra days. If day 1 is Sunday, day 366 advances by 1 day!",
    50: "Vitamin A deficiency leads to night blindness, while Vitamin C deficiency causes scurvy."
}

TOPIC_MAP = {
    1: 'Botany', 2: 'Symbiosis & Ecology', 3: 'Zoology', 4: 'Animal Adaptations', 5: 'Oceanography',
    6: 'Geology', 7: 'Environment & Climate', 8: 'Minerals & Geology', 9: 'Microbiology & Chemistry', 10: 'Space History',
    11: 'Planetary Science', 12: 'Astronomy', 13: 'Celestial Mechanics', 14: 'World Geography', 15: 'World Capitals',
    16: 'Global Currencies', 17: 'International Organizations', 18: 'Ancient History', 19: 'National Heritage', 20: 'Physical Geography',
    21: 'Indian Constitution', 22: 'Classic Literature', 23: 'Idioms & Phrases', 24: 'Mystery & Detective Fiction', 25: 'Cinema & Arts',
    26: 'Sports Rules', 27: 'Mind Games & Chess', 28: 'Language & Wordplay', 29: 'Number Sequences', 30: 'Clock Angles',
    31: 'Space Missions (2024)', 32: 'Global Sports (FIFA 2026)', 33: 'World Leadership (2024)', 34: 'Chess Champions (2024)', 35: 'Climate Summits (COP28)',
    36: 'Renewable Energy', 37: 'Cricket & WPL', 38: 'Digital Infrastructure', 39: 'Asian Games', 40: 'Geopolitics & BRICS',
    41: 'Cyber Safety', 42: 'Emergency First Aid', 43: 'Anti-Bullying & Values', 44: 'Waste Management', 45: 'Conflict Resolution',
    46: 'Scientific Instruments', 47: 'Solar System Analysis', 48: 'World Heritage Sites', 49: 'Calendar Reasoning', 50: 'Vitamins & Health'
}

SECTOR_MAP = {
    1: {'sector': 1, 'sectorName': 'Biosphere & Living World', 'sectorBadge': 'Nature Scout', 'sectorIcon': '🌿'},
    2: {'sector': 2, 'sectorName': 'Cosmos & Human Ingenuity', 'sectorBadge': 'Star Voyager', 'sectorIcon': '🚀'},
    3: {'sector': 3, 'sectorName': 'Culture, Sports & Logic', 'sectorBadge': 'Logic Master', 'sectorIcon': '🏆'},
    4: {'sector': 4, 'sectorName': 'Orbit of the Present (2024)', 'sectorBadge': 'Global Citizen', 'sectorIcon': '🛰️'},
    5: {'sector': 5, 'sectorName': 'Mind Mastery & HOTS Achievers', 'sectorBadge': 'Olympiad Titan', 'sectorIcon': '👑'},
}

def clean_text(text):
    text = text.replace('\u2028', '\n').replace('\u2029', '\n').replace('\r\n', '\n').replace('\r', '\n')
    return text

def parse_questions():
    with open('GK_50_100_questions.txt', 'r', encoding='utf-8') as f:
        raw = f.read()

    text = clean_text(raw)

    pattern = re.compile(
        r'(?:^|\n)(\d+)\.\s+(.*?)\n\s*\(A\)\s+(.*?)\n\s*\(B\)\s+(.*?)\n\s*\(C\)\s+(.*?)\n\s*\(D\)\s+(.*?)\n\s*Answer:\s*\(([A-D])\)\s*(.*?)\.\s*\n\s*Explanation:\s*(.*?)(?=(?:\n\d+\.|\nSection|\Z))',
        re.DOTALL
    )

    matches = list(pattern.finditer(text))
    assert len(matches) == 50, f"Expected 50 questions, found {len(matches)}"

    new_questions = []
    for m in matches:
        local_id = int(m.group(1))
        global_id = local_id + 50
        sec_num = (local_id - 1) // 10 + 1
        sec_info = SECTOR_MAP[sec_num]
        topic = TOPIC_MAP.get(local_id, 'General Knowledge')

        q_text = m.group(2).strip()
        # Clean internal line breaks or excessive spaces
        q_text = re.sub(r'\n{3,}', '\n\n', q_text)

        options = [m.group(3).strip(), m.group(4).strip(), m.group(5).strip(), m.group(6).strip()]
        ans_letter = m.group(7).strip()
        ans_idx = ord(ans_letter) - ord('A')
        explanation = m.group(9).strip()
        # Clean latex if present
        explanation = explanation.replace(r'($52\text{ weeks} + 2\text{ odd days}$)', '(52 weeks + 2 odd days)')
        hint = HINTS.get(local_id, f"Think carefully about {topic} concepts!")

        q_obj = {
            "id": global_id,
            "sector": sec_info["sector"],
            "sectorName": sec_info["sectorName"],
            "sectorBadge": sec_info["sectorBadge"],
            "sectorIcon": sec_info["sectorIcon"],
            "topic": topic,
            "question": q_text,
            "options": options,
            "answerIndex": ans_idx,
            "answerLetter": ans_letter,
            "explanation": explanation,
            "hint": hint
        }
        new_questions.append(q_obj)

    return new_questions

def main():
    new_qs = parse_questions()
    print(f"Parsed {len(new_qs)} new questions (IDs {new_qs[0]['id']} to {new_qs[-1]['id']})")

    # Load existing questions
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        existing_qs = json.load(f)

    print(f"Existing questions count: {len(existing_qs)}")
    # Filter to first 50 if already had more
    existing_50 = [q for q in existing_qs if q['id'] <= 50]

    all_100 = existing_50 + new_qs
    print(f"Total questions after merge: {len(all_100)}")

    with open('data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(all_100, f, indent=2, ensure_ascii=False)
    print("Saved data/questions.json with 100 questions successfully!")

if __name__ == '__main__':
    main()
