# 🕵️‍♂️ CreepyParser: Reddit Forensics Tool

**Versiune:** 4.2.0 (Forensics Unit)
**Tip Aplicație:** Full-Stack Web Scraper & Regex Analyzer
**Tematică:** Horror / Digital Forensics / Terminal
**Curs:** Programarea Translatoarelor (2025)

---

## 📖 1. Descriere Generală

**CreepyParser** este o unealtă software avansată destinată analizei textelor horror (Creepypasta) provenite de pe Reddit (r/nosleep, r/creepypasta). Aplicația simulează o interfață de "investigație digitală" (Forensics) și transformă poveștile neformatate în **Dosare de Caz** structurate.

Spre deosebire de un simplu "reader", această aplicație folosește un motor complex de **Expresii Regulate (Regex)** și algoritmi de procesare a limbajului natural (NLP simplificat) pentru a extrage metadate ascunse, a detecta entități și a calcula un "Scor de Groază" (Creepiness Index).

### ✨ Funcționalități Cheie
* **Web Scraping Automat:** Interoghează API-ul Reddit pentru a extrage textul, autorul, titlul și etichetele, ocolind reclamele și comentariile.
* **Analiză Regex Profundă:** Extrage automat 10 tipuri diferite de metadate din text.
* **Scoring Algoritmic:** Calculează cât de înfricoșător este textul și timpul estimat de "supraviețuire" (citire).
* **Detecție Anomalii:** Identifică text corupt (Zalgo/Glitch) și spoilere ascunse.
* **Export Dosare:** Permite descărcarea analizei în formatele `.TXT`, `.JSON`, `.MD` și `.HTML`.
* **Interfață Imersivă:** Design responsive cu temă Dark/Light, efecte CRT (scanlines), animații neon și sunete vizuale de terminal.

---

## ⚙️ 2. Arhitectură Tehnică

Aplicația este construită pe o arhitectură modernă Client-Server:

### Backend (Python FastAPI)
* **Rol:** Procesare date, Scraping, Logică Regex.
* **Biblioteci:** `fastapi`, `uvicorn`, `requests`, `datetime`, `re` (modulul nativ Python pentru Regex).
* **Logică:** Primește un URL, îl transformă în JSON (API Reddit), injectează metadate într-un header standardizat, apoi rulează motorul `CreepyRegexEngine`.

### Frontend (Next.js + Tailwind CSS)
* **Rol:** Interfață utilizator, Vizualizare date, Export fișiere.
* **Biblioteci:** `react`, `next`, `tailwindcss`, `framer-motion`, `next-themes`.
* **Design:** Utilizează fonturi Google (`VT323`, `Creepster`) și variabile CSS pentru efecte de strălucire (Glow/Neon).

---

## 🧠 3. Motorul de Regex (Expresii Regulate)

Nucleul aplicației este clasa `CreepyRegexEngine`. Iată lista completă a pattern-urilor utilizate și explicația lor:

| Categorie | Ce Extrage | Expresie Regulată (Simplificată / Logică) |
| :--- | :--- | :--- |
| **Autori** | Numele utilizatorului Reddit | `(?i)(?:Written by:?\s*(?:u\/)?\|u\/)([\w\-\.]+)` <br> *Caută semnături de tip "u/User" sau "Written by User".* |
| **Subreddit** | Sursa (ex: r/nosleep) | `(?i)(?:Subreddit:?\s*)(r\/[\w]+)` |
| **Date / Timp** | Data postării sau referințe temporale | `(?:\d{1,2}[-/th]*\w+[-/,\s]*\d{2,4})\|(?:\d+\s+(?:hours?|days?)\s+ago)` <br> *Detectează formate ca "10th Oct 2023" sau "2 days ago".* |
| **Trigger Warnings** | Avertismente (Gore, Blood) | `(?i)(?:TW\|CW\|Trigger Warning)[\s:]+([^\n]+)` |
| **Email-uri** | Adrese ascunse (pt. ARG-uri) | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` |
| **Dialog** | Vorbire directă | `"([^"]*)"\|“([^”]*)”` <br> *Folosit pentru a calcula procentul de dialog din text.* |
| **Entități** | Nume proprii / Locații | `(?<!^)(?<!\.\s)\b[A-Z][a-z]+\b` <br> *Caută cuvinte cu majusculă care NU sunt la început de propoziție.* |
| **Spoilers** | Text ascuns pe Reddit | `>!(.*?)!<` |
| **Zalgo** | Text corupt/glitch | `[\u0300-\u036F]+` <br> *Detectează caractere Unicode diacritice suprapuse.* |
---

## 📊 4. Algoritmi Speciali

### A. Creepiness Index (Scorul de Groază)
Un algoritm care scanează textul după o listă de cuvinte cheie ("blood", "shadow", "whisper", "bones", etc.).
* **Formula:** `(Număr_Cuvinte_Horror / Total_Cuvinte) * Factor_Multiplicare`.
* Rezultatul este normalizat pe o scară de la 0 la 100.

### B. Dialogue Ratio
Calculează raportul dintre narațiune și dialog.
* Ajută la determinarea stilului poveștii (dacă este alertă/conversatională sau descriptivă).

### C. Survival Time
Estimează timpul necesar pentru a citi dosarul.
* **Formula:** `Număr_Cuvinte / 200` (viteza medie de citire a unui adult).

---

## 🛠️ 5. Ghid de Instalare

Pentru a rula aplicația local, ai nevoie de **Node.js** și **Python** instalate.

### Pasul 1: Backend (Serverul)
1.  Deschide un terminal în folderul `backend`.
2.  (Opțional) Creează un mediu virtual: `python -m venv venv`.
3.  Instalează dependențele:
    ```bash
    pip install fastapi uvicorn requests beautifulsoup4
    ```
4.  Pornește serverul:
    ```bash
    uvicorn main:app --reload
    ```
    *Serverul va rula pe http://127.0.0.1:8000*

### Pasul 2: Frontend (Interfața)
1.  Deschide un terminal nou în folderul `frontend`.
2.  Instalează pachetele:
    ```bash
    npm install
    ```
3.  Pornește aplicația:
    ```bash
    npm run dev
    ```
4.  Accesează aplicația în browser la: **http://localhost:3000**

---

## 🖥️ 6. Tutorial de Utilizare

1.  **Găsirea Țintei:**
    * Mergi pe Reddit (ex: `r/nosleep` sau `r/creepypasta`).
    * Copiază link-ul unei povești (URL-ul din browser).

2.  **Inițierea Scanării:**
    * În CreepyParser, lipește link-ul în câmpul `TARGET_URL://`.
    * Apasă butonul **EXECUTE** (sau tasta Enter).

3.  **Analiza Rezultatelor (Dashboard):**
    * **Subject:** Vezi cine a scris povestea.
    * **Threat Assessment:** Verifică dacă există Trigger Warnings (TW) extrase din Flair sau text.
    * **Anomalies:** Verifică dacă textul este "blestemat" (Zalgo) sau are spoilere.
    * **Entities:** Vezi lista personajelor sau locațiilor detectate.

4.  **Citirea Poveștii:**
    * Derulează jos la secțiunea `FULL_DECRYPTED_STORY_LOG`.
    * Apasă `[+] EXPAND` pentru a citi povestea într-un format curat, fără reclame.

5.  **Exportarea Dosarului:**
    * Apasă pe butonul **DOWNLOAD DOSSIER** (iconița 📁).
    * Alege formatul dorit:
        * **HTML:** Pentru un raport vizual, colorat.
        * **JSON:** Pentru date brute (programatic).
        * **MD/TXT:** Pentru notițe simple.
