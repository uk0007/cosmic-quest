#!/usr/bin/env python3
"""
Parser to convert gk_questions.txt into structured JSON data for Cosmic Quest IQ.
Can be adapted to parse future question packs as well.
"""

import json
import re

SECTOR_MAP = {
    1: {"name": "Biosphere & Living World", "badge": "Nature Scout", "icon": "🌿"},
    2: {"name": "Cosmos & Human Ingenuity", "badge": "Star Voyager", "icon": "🚀"},
    3: {"name": "Culture, Sports & Logic", "badge": "Logic Master", "icon": "🏆"},
    4: {"name": "Orbit of the Present (2024)", "badge": "Global Citizen", "icon": "🛰️"},
    5: {"name": "Mind Mastery & HOTS Achievers", "badge": "Olympiad Titan", "icon": "👑"}
}

TOPIC_HINTS = {
    1: ("Botany", "This famous plant has 'fly' in its name and snaps shut like jaws!"),
    2: ("Zoology", "This fuzzy bird is also the famous nickname for people from New Zealand!"),
    3: ("Biology", "Snakes do this regularly to shed their old skin for a shiny new one!"),
    4: ("Botany", "The prefix 'epi-' means upon or above; think of orchids perching on branches!"),
    5: ("Earth Science", "It begins with 'Strato-' and sits right above where clouds and weather happen!"),
    6: ("Astronomy", "Think of a word that means 'end' or 'boundary' — also a famous movie robot!"),
    7: ("Geography", "This massive desert stretches across North Africa and starts with 'S'!"),
    8: ("Ecology", "Bio- plus a word meaning to enlarge or magnify toxins up the food chain!"),
    9: ("Astronomy", "The second planet from the Sun, named after the Roman goddess of beauty!"),
    10: ("Human Anatomy", "This essential metal is found in spinach and makes our red blood cells red!"),
    11: ("Inventions", "Sir Tim Berners-Lee created this at CERN in 1989 so computers could talk!"),
    12: ("Astronomy", "It orbits the largest gas giant planet in our solar system!"),
    13: ("Instruments", "The word root 'baro' relates to weight/pressure — hence barometric pressure!"),
    14: ("Geography", "Named after Robert Palk, a former British governor of Madras!"),
    15: ("World Currencies", "A three-letter currency that shares its first letter with Japan!"),
    16: ("Indian History", "Sardar Vallabhbhai Patel has the tallest statue in the world dedicated to him!"),
    17: ("Global Organizations", "The romantic City of Lights with the Eiffel Tower!"),
    18: ("Geography", "Located in South America, stretching along seven countries!"),
    19: ("Ancient Civilizations", "The great civilization that flourished in the Andes mountains of Peru!"),
    20: ("Indian Civics", "Dr. B.R. Ambedkar, revered as the Father of the Indian Constitution!"),
    21: ("World Geography", "A Scandinavian country known for fjords where the sun barely sets in summer!"),
    22: ("Children's Literature", "C.S. Lewis was a close friend of J.R.R. Tolkien, who wrote Lord of the Rings!"),
    23: ("Idioms & Language", "Think about staying up late to study or work with an oil lamp!"),
    24: ("Literature", "Arundhati Roy won the Booker Prize in 1997 for this masterpiece set in Kerala!"),
    25: ("Sports", "It is often called a shuttle or bird, shaped like a feathered cone!"),
    26: ("Sports", "The 2024 Olympic flame burned on the River Seine in Paris, France!"),
    27: ("Sports", "Tennis and Golf both have prestigious major championships called Grand Slams!"),
    28: ("Arts & Cinema", "The golden statuette given in Hollywood for outstanding films!"),
    29: ("Logical Reasoning", "Notice the rotation: South-West rotates 135 degrees clockwise to become North!"),
    30: ("Mental Math", "Look closely: 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63... what is next?"),
    31: ("Space Exploration", "India's historic third lunar exploration mission launched by ISRO!"),
    32: ("Global Alliances", "The homeland of IKEA and ABBA, which joined NATO after Finland!"),
    33: ("Sports", "Led by Rohit Sharma, the Men in Blue triumphed in a thrilling final in Barbados!"),
    34: ("Solar Science", "Aditya is the Sanskrit word for the Sun!"),
    35: ("Sports", "Milan and Cortina d'Ampezzo in Italy will host the 2026 Winter Games!"),
    36: ("World Peace", "Nihon Hidankyo is the Japanese grassroots movement of atomic bomb survivors!"),
    37: ("Literature", "The home of K-pop and Seoul — South Korea!"),
    38: ("Sports", "The City of Angels in California, USA!"),
    39: ("Space Exploration", "Named after the twin sister of Apollo and Greek goddess of the Moon!"),
    40: ("Engineering Wonders", "The Chenab Bridge spans a scenic gorge in Jammu & Kashmir!"),
    41: ("Life Skills - Teamwork", "Great teammates listen, combine ideas, and build win-win solutions together!"),
    42: ("Cyber Safety", "It sounds like 'fishing' because scammers dangle fake bait to catch passwords!"),
    43: ("Digital Literacy", "Always verify with trusted sources before spreading alarming viral claims!"),
    44: ("Health & Well-being", "Good sleep, healthy breaks, and deep breathing recharge your brain power!"),
    45: ("Emotional Intelligence", "Empathy means putting yourself in someone else's shoes!"),
    46: ("Olympiad HOTS", "Fleming noticed mold killing bacteria (penicillin); Jenner used cowpox for smallpox!"),
    47: ("Olympiad HOTS", "Shah Jahan built the Taj Mahal for Mumtaz Mahal, not Akbar!"),
    48: ("Olympiad HOTS", "Beirut is the capital, and the Cedar tree is on its red-and-white flag!"),
    49: ("Olympiad HOTS", "The liver is the heaviest internal organ and can regrow part of itself!"),
    50: ("Olympiad HOTS", "Earth Day is celebrated in April (22nd), and World Environment Day is in June (5th)!")
}

def parse_all():
    with open("gk_questions.txt", "r", encoding="utf-8") as f:
        content = f.read()

    # Find question indices
    pos = 0
    q_starts = []
    for i in range(1, 51):
        pattern = rf"(?:^|\n){i}\.\s+"
        m = re.search(pattern, content[pos:])
        if not m:
            raise ValueError(f"Could not find question {i}")
        actual_pos = pos + m.start()
        if content[actual_pos] == "\n":
            actual_pos += 1
        q_starts.append(actual_pos)
        pos = actual_pos + len(str(i)) + 2

    questions = []

    for i in range(50):
        q_num = i + 1
        start = q_starts[i]
        end = q_starts[i+1] if i < 49 else len(content)
        block = content[start:end].strip()

        # Remove leading "X. "
        block = re.sub(rf"^{q_num}\.\s*", "", block)

        # Sector calculation
        sector_id = ((q_num - 1) // 10) + 1
        sector_info = SECTOR_MAP[sector_id]

        # Extract answer and explanation
        ans_match = re.search(r"Answer:\s*\(([A-D])\)\.?\s*(.*?)(?=\n\n|\Z)", block, re.DOTALL)
        if not ans_match:
            # Fallback for questions where answer is formatted differently
            ans_match = re.search(r"Answer:\s*\(([A-D])\)(.*)", block, re.DOTALL)

        if not ans_match:
            raise ValueError(f"Could not find answer for question {q_num}")

        ans_letter = ans_match.group(1).strip()
        raw_explanation = ans_match.group(2).strip()

        # Also check if there is an explicit "Explanation:" line
        exp_match = re.search(r"Explanation:\s*(.*)", block, re.DOTALL)
        if exp_match:
            raw_explanation += " " + exp_match.group(1).strip()

        ans_index = ord(ans_letter) - ord('A')

        # Split block into question text + options part
        # Options start at (A)
        opt_start = re.search(r"\([A-D]\)", block)
        if not opt_start:
            raise ValueError(f"Could not find options for question {q_num}")

        q_text = block[:opt_start.start()].strip()

        # Extract options (A), (B), (C), (D)
        opts_raw = block[opt_start.start():ans_match.start()].strip()

        # Parse options
        opt_matches = list(re.finditer(r"\(([A-D])\)\s*(.*?)(?=\([A-D]\)|\Z)", opts_raw, re.DOTALL))
        options = []
        for om in opt_matches:
            opt_text = om.group(2).strip()
            # Clean up trailing whitespace and dots if needed
            options.append(opt_text)

        if len(options) != 4:
            raise ValueError(f"Question {q_num} has {len(options)} options instead of 4: {options}")

        # Clean explanation
        explanation = raw_explanation.replace("\n", " ").strip()
        explanation = re.sub(r"\s+", " ", explanation)
        if not explanation.endswith("."):
            explanation += "."

        # Topic & hint
        topic, hint = TOPIC_HINTS.get(q_num, ("General Knowledge", "Think carefully about the key words!"))

        q_item = {
            "id": q_num,
            "sector": sector_id,
            "sectorName": sector_info["name"],
            "sectorBadge": sector_info["badge"],
            "sectorIcon": sector_info["icon"],
            "topic": topic,
            "question": q_text,
            "options": options,
            "answerIndex": ans_index,
            "answerLetter": ans_letter,
            "explanation": explanation,
            "hint": hint
        }
        questions.append(q_item)

    # Save to data/questions.json
    with open("data/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated data/questions.json with {len(questions)} questions across 5 sectors!")

if __name__ == "__main__":
    parse_all()
