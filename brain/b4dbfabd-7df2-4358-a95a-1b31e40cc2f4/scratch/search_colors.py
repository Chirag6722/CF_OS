import urllib.request
import re
import sys

# Set standard output encoding to utf-8 to avoid charmap errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

css_files = [
    "0e03fcfaba77cdc7.css",
    "123ac3b67b88b27b.css",
    "f906f25b6bbcaa55.css",
    "cf197699e26a2095.css"
]

for css in css_files:
    url = f"https://codolio.com/_next/static/css/{css}"
    print(f"Downloading {url}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print(f"File size: {len(content)} bytes")
            
            # Find class definitions or CSS rules with codolioBase or codolioBase colors
            matches = list(re.finditer(r"codolioBase", content))
            if matches:
                print(f"[FOUND] codolioBase in {css}!")
                for m in matches:
                    start = max(0, m.start() - 150)
                    end = min(len(content), m.end() + 150)
                    # replace potential unicode characters in output
                    snippet = content[start:end].encode('ascii', 'ignore').decode('ascii')
                    print(snippet)
                    print("=" * 60)
            
            # Search for background colors or colors defined under codolioBase
            # Let's search for tailwind color variables or specific background colors in the first file
            if "0e03fcfaba77cdc7.css" in url:
                # search for codolioBase hex color directly
                # .bg-codolioBase{background-color:#xxxxxx}
                res = re.findall(r"\.[a-zA-Z0-9_-]*codolioBase[a-zA-Z0-9_-]*\{[^\}]*\}", content)
                if res:
                    print("Found codolioBase CSS rule:")
                    for r in res:
                        print(r.encode('ascii', 'ignore').decode('ascii'))
                
                # Also find text-codolioBase
                res_text = re.findall(r"\.[a-zA-Z0-9_-]*text-codolioBase[a-zA-Z0-9_-]*\{[^\}]*\}", content)
                if res_text:
                    print("Found text-codolioBase CSS rule:")
                    for r in res_text:
                        print(r.encode('ascii', 'ignore').decode('ascii'))
                        
    except Exception as e:
        print(f"Error: {e}")
