from fastapi import FastAPI
from food_recommender import recommend_food
from gettingUserPhoto import getSearchImage

app = FastAPI()


@app.get("/recommendations/")
async def get_recommendations(food_name: str, number_of_recommendations: int):
    recommendations = recommend_food(food_name, number_of_recommendations)
    return {"recommendations": recommendations}


@app.get("/search_image/")
async def get_search_image(query: str):
    image_url = getSearchImage(query)
    return {"image_url": image_url}
