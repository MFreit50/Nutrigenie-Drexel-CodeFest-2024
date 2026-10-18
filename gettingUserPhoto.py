import requests
from urllib.parse import urlencode

def getSearchImage(SEARCH_QUERY, API_KEY):
    params = urlencode({
        "key": API_KEY,
        "cx": "714eb691b3bfd47ae",
        "q": f"an image of a {SEARCH_QUERY}",
        "searchType": "image",
        "num": 1,
    })
    try:
        response = requests.get(f"https://www.googleapis.com/customsearch/v1?{params}", timeout=10)
        response.raise_for_status()
        items = response.json().get("items", [])
        if not items:
            return ""
        item = items[0]
        pagemap = item.get("pagemap", {})
        images = pagemap.get("cse_image", []) or pagemap.get("cse_thumbnail", [])
        return images[0].get("src", "") if images else item.get("link", "")
    except (requests.RequestException, ValueError):
        return ""
