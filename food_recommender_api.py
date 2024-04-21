import sys
import os
from fastapi import FastAPI
from food_recommender import recommend_food

app = FastAPI()

@app.get("/recommendations/")
async def get_recommendations(food_name: str, number_of_recommendations: int):
    recommendations = recommend_food(food_name, number_of_recommendations)
    return {"recommendations": recommendations}