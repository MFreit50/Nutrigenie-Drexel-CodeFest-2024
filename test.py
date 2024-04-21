import requests
from fastapi import FastAPI

app = FastAPI()

@app.get('/foods')
def get_foods():
    key = "mVkygYer.GwE3M2FHfVR2nygpqEiCejHQsp8niPIS"
    url = "https://vision.foodvisor.io/api/1.0/en/food/list/"
    headers = {"Authorization": f"Api-Key {key}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    return {"data": data}