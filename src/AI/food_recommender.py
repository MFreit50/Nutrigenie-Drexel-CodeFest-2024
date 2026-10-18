"""Nutrition based food alternatives from the bundled food dataset."""

from difflib import get_close_matches

from src.AI.food_dataset import dataset


# Demo-only approximation for a generic sushi roll. Based on the FDA Yummi
# Sushi California Roll (Crab Stick, Brown Rice) label: 9 g protein, 42 g
# carbohydrate, and 16 g fat per 216 g package, normalized to 100 g.
# Source: https://www.fda.gov/media/186611/download
# The 3.5 score is a neutral internal ranking value, not an FDA nutrition score.
DEMO_FOOD_PROFILES = {
    "sushi roll": [4.2, 19.4, 7.4, 3.5],
}
FOOD_PROFILES = {**dataset, **DEMO_FOOD_PROFILES}


def _match_food(query: str):
    normalized = " ".join(query.casefold().split())
    if not normalized:
        return None
    if normalized in FOOD_PROFILES:
        return normalized

    # Only correct close spelling variations. Low similarity thresholds can
    # map unrelated foods (for example, "sushi roll" to "swiss roll").
    matches = get_close_matches(normalized, list(FOOD_PROFILES), n=1, cutoff=0.82)
    return matches[0] if matches else None


def recommend_food(input_food_name: str, number_of_recommendations: int = 5):
    query = " ".join(input_food_name.casefold().split())
    match = _match_food(query)
    if match is None:
        return []
    source = FOOD_PROFILES[match]

    # Rank by macro-profile similarity, with a small preference for better
    # nutrition scores (the fourth dataset field is a 1-5 score).
    ranked = []
    for name, values in FOOD_PROFILES.items():
        if name == match or name == query:
            continue
        distance = sum(((float(a) - float(b)) / scale) ** 2 for a, b, scale in zip(source[:3], values[:3], (50.0, 100.0, 100.0))) ** 0.5
        ranked.append((distance, name, float(values[3])))
    healthier = [item for item in ranked if item[2] > float(source[3])]
    if healthier:
        ranked = healthier
    ranked.sort()
    limit = max(0, min(int(number_of_recommendations), 20))
    return [name for _, name, _ in ranked[:limit]]


def get_nutrition(food_name: str):
    match = _match_food(food_name)
    if match is None:
        return {"name": food_name, "protein_g": None, "carbohydrates_g": None, "fat_g": None, "calories_kcal": None, "nutrition_score": None, "serving_basis_g": 100, "is_demo_estimate": False}
    values = FOOD_PROFILES[match]
    is_demo_estimate = match in DEMO_FOOD_PROFILES
    calories_kcal = round(values[0] * 4 + values[1] * 4 + values[2] * 9)
    return {
        "name": match,
        "protein_g": values[0],
        "carbohydrates_g": values[1],
        "fat_g": values[2],
        "calories_kcal": calories_kcal,
        "serving_basis_g": 100,
        "nutrition_score": values[3],
        "is_demo_estimate": is_demo_estimate,
        "profile_note": "Approximate profile based on an FDA California roll label, scaled to 100 g. Calories are estimated from the listed macros." if is_demo_estimate else "Bundled dataset macro values per 100 g; calories are estimated using standard 4/4/9 factors.",
    }
