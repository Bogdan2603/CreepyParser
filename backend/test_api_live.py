import requests
import time
import sys

# Wait a bit for the server to fully start if this runs immediately
time.sleep(2)

url = "http://127.0.0.1:8000/analyze"
payload = {
    "url": "https://www.reddit.com/r/creepypasta/comments/1pq064y/every_year_we_have_someone_new_for_christmas/"
}

print(f"Testing API endpoint: {url}")
try:
    response = requests.post(url, json=payload, timeout=20)
    response.raise_for_status()
    
    data = response.json()
    
    print("Status Code: 200 OK")
    print(f"Status in Body: {data.get('status')}")
    
    preview = data.get('extracted_text_preview', '')
    print(f"Extracted Text Preview length: {len(preview)}")
    print(f"Preview snippet: {preview[:100]}...")
    
    analysis = data.get('data', {})
    print("Analysis Results:")
    print(f"- Authors found: {analysis.get('authors')}")
    print(f"- Dialogue stats: {analysis.get('dialogue_stats')}")
    
    if data.get('status') == 'success' and len(preview) > 0:
        print("\nTEST PASSED: Backend successfully scraped and analyzed the Reddit story.")
    else:
        print("\nTEST FAILED: Invalid response structure.")
        sys.exit(1)

except Exception as e:
    print(f"\nTEST FAILED: {e}")
    sys.exit(1)
