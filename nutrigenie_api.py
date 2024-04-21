from fastapi import FastAPI, File, UploadFile
from food_recommender import recommend_food
from gettingUserPhoto import getSearchImage
import requests
import uuid

app = FastAPI()

@app.get("/recommendations/")
async def get_recommendations(food_name: str, number_of_recommendations: int):
    recommendations = recommend_food(food_name, number_of_recommendations)
    return {"recommendations": recommendations}


@app.get("/search_image/")
async def get_search_image(query: str):
    image_url = getSearchImage(query)
    return {"image_url": image_url}

@app.post("/picture/")
async def analyze_image(file: UploadFile = File(...)):
    KEY = "mVkygYer.GwE3M2FHfVR2nygpqEiCejHQsp8niPIS"

    file.filename = f"{uuid.uuid4()}.jpg"
    img = await file.read()



    url = "https://vision.foodvisor.io/api/1.0/en/analysis/"
    headers = {"Authorization": f"Api-Key {KEY}"}

    response = requests.post(url, headers=headers, files={"image": img})
    response.raise_for_status()
    data = response.json()

    foodArray = [item["food"][0]["food_info"]["display_name"] for item in data["items"] if item["food"]]

    return { "foods", foodArray }