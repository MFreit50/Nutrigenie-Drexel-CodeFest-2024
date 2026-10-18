import base64
import json
import logging
import os

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from gettingUserPhoto import getSearchImage
from src.AI.food_recommender import get_nutrition, recommend_food

load_dotenv()
logger = logging.getLogger(__name__)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

app = FastAPI(title="NutriGenie API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "WEB_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to NutriGenie API", "status": "ok"}


@app.get("/recommendations")
async def get_recommendations(food_name: str, number_of_recommendations: int = Query(5, ge=1, le=20)):
    return {"recommendations": recommend_food(food_name, number_of_recommendations)}


@app.get("/nutrition")
async def nutrition(food_name: str):
    return get_nutrition(food_name)


@app.get("/search_image")
async def get_search_image(query: str):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=503, detail="Image search is not configured (set GOOGLE_API_KEY).")
    image_url = getSearchImage(query, GOOGLE_API_KEY)
    return {"image_url": image_url}


@app.post("/picture")
async def analyze_image(file: UploadFile = File(...)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Food recognition is not configured (set GEMINI_API_KEY).")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")

    image = await file.read()
    if not image:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 15 MB.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    categories = ["Fruit", "Vegetable", "Protein", "Grain", "Dairy", "Legume", "Beverage", "Dessert", "Condiment", "Mixed dish", "Other"]
    prompt = (
        "Identify the distinct foods clearly visible in this meal photo. For each food, return a concise, plain name "
        "and one broad category from the provided category list. Use Mixed dish for a prepared dish with multiple "
        "ingredients (such as pizza or curry), and Other only when no category fits. Do not guess hidden ingredients, "
        "quantities, or nutrition. Return an empty foods array if no food is visible."
    )
    payload = {
        "contents": [{"parts": [
            {"text": prompt},
            {"inline_data": {"mime_type": file.content_type, "data": base64.b64encode(image).decode("ascii")}},
        ]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "foods": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": {"type": "STRING"},
                                "category": {"type": "STRING", "enum": categories},
                            },
                            "required": ["name", "category"],
                        },
                    },
                },
                "required": ["foods"],
            },
            "temperature": 0.1,
        },
    }
    try:
        response = requests.post(url, headers={"x-goog-api-key": GEMINI_API_KEY}, json=payload, timeout=45)
        response.raise_for_status()
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
        foods = parsed.get("foods", [])
        if not isinstance(foods, list):
            raise ValueError("foods must be a list")
        cleaned = []
        seen = set()
        allowed_categories = set(categories)
        for item in foods:
            if not isinstance(item, dict):
                continue
            name = item.get("name", "").strip() if isinstance(item.get("name"), str) else ""
            category = item.get("category", "Other")
            if name and name.casefold() not in seen:
                normalized_category = category if isinstance(category, str) and category in allowed_categories else "Other"
                cleaned.append({"name": name, "category": normalized_category})
                seen.add(name.casefold())
        foods = cleaned
        return {"foods": foods}
    except requests.Timeout as exc:
        logger.warning("Gemini image analysis timed out (model=%s).", GEMINI_MODEL)
        raise HTTPException(status_code=504, detail="Gemini took too long to analyze this image. Please try again.") from exc
    except requests.HTTPError as exc:
        upstream_status = exc.response.status_code if exc.response is not None else None
        logger.warning("Gemini image analysis returned HTTP %s (model=%s).", upstream_status, GEMINI_MODEL)
        if upstream_status in (401, 403):
            detail = "Food recognition credentials were rejected. Check GEMINI_API_KEY and its Gemini API access."
        elif upstream_status == 404:
            detail = f"The configured Gemini model '{GEMINI_MODEL}' is unavailable. Check GEMINI_MODEL."
        elif upstream_status == 429:
            detail = "Gemini rate limit or quota reached. Check your AI Studio usage and try again later."
        elif upstream_status == 400:
            detail = "Gemini rejected the image request. Try another image or check the backend logs."
        else:
            detail = f"Gemini returned an upstream error (HTTP {upstream_status}). Please try again."
        raise HTTPException(status_code=502, detail=detail) from exc
    except requests.RequestException as exc:
        logger.warning("Could not reach Gemini during image analysis: %s", type(exc).__name__)
        raise HTTPException(status_code=502, detail="The backend could not reach Gemini. Check its network connection and try again.") from exc
    except (KeyError, IndexError, ValueError, json.JSONDecodeError) as exc:
        logger.exception("Gemini returned an unexpected image-analysis response.")
        raise HTTPException(status_code=502, detail="Gemini returned an unexpected response. Check the backend logs and try again.") from exc
