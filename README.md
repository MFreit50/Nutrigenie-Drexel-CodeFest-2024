# NutriGenie

NutriGenie is a React Native meal scanning app backed by a FastAPI service. The app identifies foods in a meal photo, shows the available macro profile from its bundled dataset, and suggests foods with a similar macro profile and a better dataset score.

## Backend setup

Python 3.10 or newer is recommended.

```sh
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the repository root:

```env
GEMINI_API_KEY=your_google_ai_studio_key
# Optional, only used by /search_image:
GOOGLE_API_KEY=your_google_custom_search_key
```

Start the API from the repository root:

```sh
uvicorn nutrigenie_api:app --host 0.0.0.0 --port 8000
```

Food recognition uses Google's Gemini API with image input and structured JSON output. Create a Gemini API key in Google AI Studio and keep it on the backend; do not add it to the mobile app. `GEMINI_MODEL` can optionally select another image capable Gemini model (default `gemini-3.8-flash`). See Google's [image understanding guide](https://ai.google.dev/gemini-api/docs/image-understanding) and [model list](https://ai.google.dev/gemini-api/docs/models).

The service provides `/` health, `/picture` image recognition, `/nutrition` bundled food nutrition profiles, `/recommendations` alternatives, and `/search_image` (optional Google Custom Search). `/picture` returns food names with broad category labels (Fruit, Vegetable, Protein, Grain, Dairy, Legume, Beverage, Dessert, Condiment, Mixed dish, or Other). The app uses `/search_image` for food-card images when `GOOGLE_API_KEY` is configured; it uses a bundled fallback image when that optional key is unavailable.

## Mobile app

Set the deployed backend address in [app/config.js](app/config.js). For local development, use `http://10.0.2.2:8000` from the Android emulator or `http://localhost:8000` from the iOS simulator. On a physical phone, use the computer's LAN address and ensure the phone can reach it.

```sh
cd app
npm install
npm start
```

In another terminal, run `npm run android` or `npm run ios` with the corresponding native development environment installed. Camera access is requested by the operating system when the app first opens the camera.

## Web app

The browser version lives in [webapp](webapp/). It keeps the same scan, nutrition breakdown, and alternative selection flow. Use a browser with camera access enabled for live capture, or choose a photo to upload. Camera access requires HTTPS when deployed (localhost is allowed for development).

```sh
cd webapp
npm install
Copy-Item .env.example .env.local
npm run dev
```

For local use, put `GEMINI_API_KEY=your_key` in a root `.env` file. Run `npm run server` from `webapp` to create the root `.venv` if needed, install the backend requirements, and start the API on `http://localhost:8000`. Run `npm run dev` in another terminal. Set `VITE_API_URL=http://localhost:8000` in `webapp/.env.local` for this setup.

For a deployed API, set `VITE_API_URL` to its public URL. The backend must allow the web app's origin through `WEB_ORIGINS` (comma-separated origins); local Vite origins `http://localhost:5173` and `http://127.0.0.1:5173` are allowed by default. Keep API credentials such as `GEMINI_API_KEY` on the backend.

## Notes

Nutrition values are the bundled dataset's per-food macro fields and score; the app does not infer serving sizes or total meal nutrition. Foods missing from the bundled dataset can still be identified, but will have no nutrition profile.
