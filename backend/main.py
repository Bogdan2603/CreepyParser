from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from regex_engine import CreepyRegexEngine
import requests
import datetime

app = FastAPI(title="CreepyParser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryInput(BaseModel):
    url: str

engine = CreepyRegexEngine()

def scrape_reddit_enhanced(url: str):
    clean_url = url.split('?')[0].rstrip('/')
    if not clean_url.endswith('.json'):
        json_url = f"{clean_url}.json"
    else:
        json_url = clean_url

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CreepyParser/5.0'}

    try:
        response = requests.get(json_url, headers=headers, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Reddit API Error: {response.status_code}")

        data = response.json()
        
        # Robustness check
        if not isinstance(data, list) or not data:
             raise Exception("Invalid Reddit API Response (Not a list)")
             
        children = data[0].get('data', {}).get('children', [])
        if not children:
             raise Exception("No post data found (children empty)")
             
        post_data = children[0]['data']

        # Extragere date
        title = post_data.get('title', 'Unknown Title')
        author = post_data.get('author', 'Unknown')
        selftext = post_data.get('selftext', '')
        
        # Fallback for empty text (e.g. image posts or links)
        if not selftext:
            url_content = post_data.get('url', '')
            if url_content:
                selftext = f"[NO TEXT DETECTED - LINK ONLY]\nURL: {url_content}"
            else:
                selftext = "[NO CONTENT]"
        
        flair = post_data.get('link_flair_text', '')
        subreddit = post_data.get('subreddit_name_prefixed', 'r/Unknown') # <--- Luăm Subreddit-ul
        
        # Conversie Data
        created_utc = post_data.get('created_utc', 0)
        if created_utc:
            dt_object = datetime.datetime.fromtimestamp(created_utc)
            formatted_date = dt_object.strftime("%d/%m/%Y")
        else:
            formatted_date = "Unknown Date"

        # Injectare Header pentru Regex
        injected_header = f"""
        FILE_HEADER_START
        Title: {title}
        Written by: u/{author}
        Posted on: {formatted_date}
        Subreddit: {subreddit}
        Source: Reddit API
        """
        
        if flair:
            injected_header += f"\nTW: {flair}"
            
        injected_header += "\nFILE_HEADER_END\n\n"

        return injected_header + selftext

    except Exception as e:
        raise Exception(f"Extraction Failed: {str(e)}")

@app.post("/analyze")
async def analyze_story(story: StoryInput):
    if "reddit.com" not in story.url:
        raise HTTPException(status_code=400, detail="INVALID TARGET. System accepts only Reddit frequencies.")

    try:
        content_to_analyze = scrape_reddit_enhanced(story.url)
        data = engine.analyze_text(content_to_analyze)
        
        return {
            "status": "success", 
            "full_story": content_to_analyze, # <--- Returnăm TOATĂ povestea
            "data": data
        }
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))