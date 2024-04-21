import requests
import json



API_KEY = "AIzaSyDeqX5aOW5LEJVQQn-COQMO6BgcjfTismc"

    
def getSearchImage(SEARCH_QUERY):
    SEARCH_QUERY = SEARCH_QUERY+" regular food"
    url = f"https://www.googleapis.com/customsearch/v1?key={API_KEY}&cx=714eb691b3bfd47ae&q={SEARCH_QUERY}&searchType=image"

    imageUrl = ""

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        imageUrl = data["items"][0]["link"]
    else:
        print("Error:", response.status_code, response.text)
    return imageUrl
