import re

class CreepyRegexEngine:
    def analyze_text(self, text: str):
        """
        Funcția principală care apelează toate regex-urile.
        Primește textul brut și returnează un dicționar cu rezultate.
        """
        # Dacă textul e gol, returnăm structura goală pentru a evita erori
        if not text:
            return {}

        results = {
            "authors": self._extract_authors(text),         # Regex 1
            "trigger_warnings": self._extract_warnings(text), # Regex 2
            "emails": self._extract_emails(text),           # Regex 3 (Lab 3)
            "dates": self._extract_dates(text),             # Regex 4
            "dialogue_stats": self._analyze_dialogue(text), # Regex 5 (Analiză)
            "spoilers": self._extract_spoilers(text),       # Regex 6 (Edge Case)
            "zalgo_glitch": self._detect_zalgo(text)        # Regex 7 (Bonus)
        }
        return results

    def _extract_authors(self, text):
        # Caută pattern-uri de tip 'u/nume' (Reddit) sau 'Written by: Nume'
        # EXPLICATIE REGEX: (?:u\/|Written by:?\s*)([\w\-\.]+)
        # (?:...) -> Grup non-capturing (nu ne interesează textul "Written by", doar ce urmează)
        # u\/     -> Caută literal caracterele "u/"
        # |       -> SAU
        # Written by:? -> Caută "Written by" opțional urmat de ":"
        # \s* -> Zero sau mai multe spații
        # ([\w\-\.]+) -> Grupul de captură (ce extragem efectiv). 
        #                \w (litere/cifre), \- (cratimă), \. (punct). + înseamnă "unul sau mai multe".
        pattern = r'(?:u\/|Written by:?\s*)([\w\-\.]+)'
        return list(set(re.findall(pattern, text, re.IGNORECASE)))

    def _extract_warnings(self, text):
        # Identifică linii de avertizare (TW/CW)
        # EXPLICATIE REGEX: (?i)(?:TW|CW|Trigger Warning)[\s:]+([^\n]+)
        # (?i)    -> Case-insensitive (găsește și "tw", și "TW")
        # [\s:]+  -> Separator: spații sau două puncte
        # ([^\n]+)-> Capturăm orice caracter CARE NU ESTE "linie nouă" (\n).
        #            Adică luăm tot textul de pe acea linie.
        pattern = r'(?i)(?:TW|CW|Trigger Warning)[\s:]+([^\n]+)'
        return re.findall(pattern, text)

    def _extract_emails(self, text):
        # Pattern standard pentru email-uri, util pentru requirements Lab 3
        # EXPLICATIE: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
        # Partea locală @ Domeniu . Extensia (minim 2 litere)
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return list(set(re.findall(pattern, text)))

    def _extract_dates(self, text):
        # Extrage date. Este un regex compus din două părți separate de | (SAU)
        # 1. Format numeric/text: 10/10/2023 sau Oct 31st
        # 2. Format relativ: "2 hours ago"
        pattern = r'(?:\d{1,2}[-/th|st|nd|rd\s]*\w+[-/,\s]*\d{2,4})|(?:\d+\s+(?:hours?|minutes?|days?|years?)\s+ago)'
        return re.findall(pattern, text, re.IGNORECASE)

    def _extract_spoilers(self, text):
        # Edge Case: Extrage text ascuns în tag-uri Reddit >! spoiler !<
        # EXPLICATIE: >!(.*?)!<
        # .*? -> Punctul înseamnă orice caracter. 
        #        Steluța * înseamnă "oricâte". 
        #        Semnul întrebării ? face căutarea "Non-Greedy" (leneșă).
        #        Fără ?, regex-ul ar înghiți tot textul dintre primul >! și ultimul !< din tot fișierul.
        pattern = r'>!(.*?)!<'
        return re.findall(pattern, text)

    def _detect_zalgo(self, text):
        # Bonus Edge Case: Detectează "Zalgo" text (text corupt, horror)
        # Caută caractere din gama Unicode "Combining Diacritical Marks" (\u0300-\u036F etc.)
        # {3,} înseamnă că alertăm doar dacă găsim 3 astfel de semne unul după altul.
        pattern = r'[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]{3,}'
        matches = re.findall(pattern, text)
        return len(matches) > 0 # Returnează True dacă găsește glitch-uri

    def _analyze_dialogue(self, text):
        # Regex pentru text între ghilimele: "text" sau “text” (smart quotes)
        pattern = r'"([^"]*)"|“([^”]*)”'
        matches = re.findall(pattern, text)
        
        # findall returnează o listă de tupluri [('text', ''), ('', 'text2')] din cauza celor 2 grupuri.
        # Trebuie să "aplatizăm" lista.
        dialogue_content = [m[0] or m[1] for m in matches if m[0] or m[1]]
        
        # Calcule statistice
        dialogue_len = sum(len(d) for d in dialogue_content)
        total_len = len(text) if len(text) > 0 else 1
        
        return {
            "dialogue_count": len(dialogue_content),
            "percentage": round((dialogue_len / total_len) * 100, 2) # Formatare cu 2 zecimale
        }