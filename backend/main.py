from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from regex_engine import CreepyRegexEngine
import requests
from bs4 import BeautifulSoup # Importăm "curățătorul" de HTML

app = FastAPI(title="CreepyParser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelul acceptă acum text SAU url (opționale ambele, dar unul e obligatoriu logic)
class StoryInput(BaseModel):
    text: str | None = None
    url: str | None = None

engine = CreepyRegexEngine()

def scrape_url(url: str):
    """
    Descarcă pagina și extrage textul.
    Are logică specifică pentru Reddit pentru a evita comentariile.
    """
    try:
        # Ne prefacem că suntem un browser real, altfel Reddit ne blochează
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parsăm HTML-ul
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # --- STRATEGIE SPECIFICĂ REDDIT ---
        # Reddit modern folosește <shreddit-post> și pune textul în slot="text-body"
        shreddit_post = soup.find('shreddit-post')
        if shreddit_post:
            content_slot = shreddit_post.find('div', slot="text-body")
            if content_slot:
                paragraphs = content_slot.find_all('p')
                return "\n\n".join([p.get_text() for p in paragraphs])
        
        # --- STRATEGIE GENERICĂ (FALLBACK) ---
        # Extragem textul din toate tag-urile <p> (paragrafe)
        # Aceasta este o strategie generică bună pentru Wiki-uri
        paragraphs = soup.find_all('p')
        text_content = "\n\n".join([p.get_text() for p in paragraphs])
        
        return text_content
    except Exception as e:
        raise Exception(f"Failed to scrape URL: {str(e)}")

@app.post("/analyze")
async def analyze_story(story: StoryInput):
    content_to_analyze = ""

    # Logica de decizie: URL sau Text?
    if story.url:
        try:
            content_to_analyze = scrape_url(story.url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif story.text:
        content_to_analyze = story.text
    else:
        raise HTTPException(status_code=400, detail="Please provide either 'text' or 'url'.")

    # Trimitem textul obținut la motorul tău de Regex
    data = engine.analyze_text(content_to_analyze)
    
    # Returnăm și textul extras (ca preview) + datele
    return {
        "status": "success", 
        "extracted_text_preview": content_to_analyze[:200] + "...", 
        "data": data
    }