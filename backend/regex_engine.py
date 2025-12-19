import re

class CreepyRegexEngine:
    def analyze_text(self, text: str):
        if not text:
            return self._empty_result()

        return {
            "authors": self._extract_authors(text),
            "subreddit": self._extract_subreddit(text),
            "trigger_warnings": self._extract_warnings(text),
            "emails": self._extract_emails(text),
            "dates": self._extract_dates(text),
            "dialogue_stats": self._analyze_dialogue(text),
            "spoilers": self._extract_spoilers(text),
            "zalgo_glitch": self._detect_zalgo(text),
            "entities": self._extract_entities(text), # <-- NOU
            "creepiness_score": self._calculate_creepiness(text) # <-- NOU
        }

    def _empty_result(self):
        return {
            "authors": [], "subreddit": "Unknown", "trigger_warnings": [], 
            "emails": [], "dates": [], 
            "dialogue_stats": {"dialogue_count": 0, "percentage": 0.0},
            "spoilers": [], "zalgo_glitch": False,
            "entities": [], "creepiness_score": 0.0
        }

    def _extract_authors(self, text):
        pattern = r'(?i)(?:Written by:?\s*(?:u\/)?|u\/)([\w\-\.]+)'
        return list(set(re.findall(pattern, text)))

    def _extract_subreddit(self, text):
        # Regex pentru a găsi sursa: "Subreddit: r/nume"
        pattern = r'(?i)(?:Subreddit:?\s*)(r\/[\w]+)'
        match = re.search(pattern, text)
        return match.group(1) if match else "Unknown Frequency"

    def _extract_warnings(self, text):
        pattern = r'(?i)(?:TW|CW|Trigger Warning)[\s:]+([^\n]+)'
        return re.findall(pattern, text)

    def _extract_dates(self, text):
        pattern = r'(?:\d{1,2}[-/th|st|nd|rd\s]*\w+[-/,\s]*\d{2,4})|(?:\d+\s+(?:hours?|minutes?|days?|years?)\s+ago)'
        return re.findall(pattern, text, re.IGNORECASE)

    def _extract_emails(self, text):
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return list(set(re.findall(pattern, text)))

    def _analyze_dialogue(self, text):
        pattern = r'"([^"]*)"|“([^”]*)”'
        matches = re.findall(pattern, text)
        dialogue_content = [m[0] or m[1] for m in matches if m[0] or m[1]]
        dialogue_len = sum(len(d) for d in dialogue_content)
        total_len = len(text) if len(text) > 0 else 1
        return {
            "dialogue_count": len(dialogue_content),
            "percentage": round((dialogue_len / total_len) * 100, 2)
        }

    def _extract_spoilers(self, text):
        pattern = r'>!(.*?)!<'
        return re.findall(pattern, text)

    def _detect_zalgo(self, text):
        pattern = r'[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]+'
        return bool(re.search(pattern, text))

    def _extract_entities(self, text):
        # Simplistic Entity Extraction: Capitalized words inside sentences
        # Exclude common sentence starters via lookbehind or simple logic
        # We look for Capitalized words that are NOT at the start of a line/sentence
        pattern = r'(?<!^)(?<!\.\s)(?<!\?\s)(?<!\!\s)\b[A-Z][a-z]+\b'
        candidates = re.findall(pattern, text)
        
        # Filtrăm cuvinte comune (hardcoded stoplist minimal)
        stopwords = {"The", "A", "An", "And", "But", "Or", "If", "When", "Then", "He", "She", "It", "They", "We", "You", "I", "Me", "My", "His", "Her", "Their", "Our", "Your", "This", "That", "These", "Those"}
        entities = [word for word in candidates if word not in stopwords and len(word) > 2]
        
        # Returnăm top 5 cele mai frecvente
        from collections import Counter
        return [item[0] for item in Counter(entities).most_common(5)]

    def _calculate_creepiness(self, text):
        creepy_words = [
            "blood", "death", "dead", "die", "kill", "murder", "scream", "shout", "whisper",
            "shadow", "dark", "darkness", "night", "black", "dim", "gloom",
            "ghost", "spirit", "demon", "monster", "beast", "creature", "entity",
            "fear", "scared", "afraid", "terrified", "terror", "horror", "panic",
            "eye", "watch", "stare", "glance", "look", "saw", "seen",
            "run", "ran", "fled", "escape", "hide", "hiding", "chase",
            "strange", "weird", "odd", "unsettling", "creepy", "eerie", "unnatural",
            "pain", "hurt", "ache", "agony", "suffering", "torture",
            "bone", "flesh", "skin", "body", "corpse", "remains", "skeleton"
        ]
        
        text_lower = text.lower()
        word_count = len(re.findall(r'\w+', text))
        if word_count == 0:
            return 0.0
            
        creepy_hits = sum(1 for word in creepy_words if word in text_lower)
        
        # Scorul este relativ la lungimea textului, normalizat arbitrar
        score = (creepy_hits / word_count) * 100 * 5  # Factor de multiplicare 5 pentru vizibilitate
        return round(min(score, 100), 2)  # Cap la 100