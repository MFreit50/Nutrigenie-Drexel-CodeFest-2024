import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'https://drexel-codefest-2024-3.onrender.com').replace(/\/$/, '');
const assets = '/assets';

function App() {
  const [screen, setScreen] = useState('Welcome');
  const [foods, setFoods] = useState([]);
  const [mealPhoto, setMealPhoto] = useState(null);
  const [mealDetails, setMealDetails] = useState([]);
  const [selectedAlternatives, setSelectedAlternatives] = useState({});
  const [history, setHistory] = useState([]);

  const navigate = useCallback((next) => {
    setHistory((items) => [...items, screen]);
    setScreen(next);
  }, [screen]);
  const switchTab = useCallback((next) => setScreen(next), []);
  const goBack = useCallback(() => {
    setHistory((items) => {
      if (!items.length) { setScreen('Welcome'); return []; }
      setScreen(items[items.length - 1]);
      return items.slice(0, -1);
    });
  }, []);
  const navigation = { navigate, switchTab, goBack };

  return <main className="app-shell">
    {screen === 'Welcome' && <Welcome navigation={navigation} />}
    {screen === 'Camera' && <Camera navigation={navigation} onFoods={(detected, photo) => {
      setFoods(detected); setMealDetails([]); setSelectedAlternatives({}); setMealPhoto(photo);
    }} />}
    {['Rundown', 'Nutrition', 'Alternatives'].includes(screen) && <Breakdown navigation={navigation} activeTab={screen} foods={foods} mealPhoto={mealPhoto} mealDetails={mealDetails} setMealDetails={setMealDetails} selectedAlternatives={selectedAlternatives} setSelectedAlternatives={setSelectedAlternatives} />}
    {screen === 'Home' && <Home navigation={navigation} />}
  </main>;
}

function Welcome({ navigation }) {
  return <section className="welcome" style={{ backgroundImage: `url(${assets}/imgs/backgroundimg.png)` }}>
    <div className="welcome-brand"><img src={`${assets}/imgs/nutrigenie.png`} alt="NutriGenie logo" /><h1>NutriGenie</h1></div>
    <button className="welcome-cta" onClick={() => navigation.navigate('Camera')}>BEGIN</button>
  </section>;
}

function Camera({ navigation, onFoods }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) return undefined;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        setCameraAvailable(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraAvailable(false));
    return () => { active = false; streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, []);
  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraAvailable]);

  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    if (file) { setPhoto(file); setError(''); }
    event.target.value = '';
  };
  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1400 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => { if (blob) setPhoto(new File([blob], 'meal.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', 0.82);
  };
  const analyze = async () => {
    if (!photo || loading) return;
    setLoading(true); setError('');
    const body = new FormData(); body.append('file', photo, photo.name || 'meal.jpg');
    try {
      const { data } = await axios.post(`${API_URL}/picture`, body, { timeout: 60000 });
      const detected = Array.isArray(data.foods) ? data.foods : [];
      if (!detected.length) { setError('No food was found in this photo. Try another photo.'); return; }
      onFoods(detected.map((food) => typeof food === 'string' ? { name: food, category: 'Other' } : { ...food, category: food.category || 'Other' }), photo);
      navigation.navigate('Rundown');
    } catch (e) {
      const detail = e.response?.data?.detail;
      if (detail) setError(detail);
      else if (e.code === 'ECONNABORTED') setError('The analysis request timed out. The API may be waking up; please try again.');
      else setError('Could not reach the NutriGenie API. Check that it is online and allows this web app origin in WEB_ORIGINS.');
    } finally { setLoading(false); }
  };
  const previewUrl = photo ? URL.createObjectURL(photo) : '';
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  return <section className="camera-page">
    {photo ? <>
      <img className="photo-preview" src={previewUrl} alt="Meal selected for analysis" />
      <div className="camera-controls">
        {error && <p className="camera-error">{error}</p>}
        <button className="secondary-button" onClick={() => { setPhoto(null); setError(''); }} disabled={loading}>Retake</button>
        <button className="primary-button" onClick={analyze} disabled={loading}>{loading ? 'Analyzing…' : 'Analyze meal'}</button>
      </div>
    </> : <>
      {cameraAvailable ? <video className="camera-video" ref={videoRef} autoPlay playsInline muted /> : <div className="camera-placeholder"><img src={`${assets}/imgs/cameraoverlay.png`} alt="" /><p>Use your camera or upload a meal photo</p></div>}
      <div className="camera-message">Center your meal in the frame</div>
      <div className="camera-controls camera-actions">
        {error && <p className="camera-error">{error}</p>}
        {cameraAvailable && <button className="shutter" onClick={capture} aria-label="Take meal photo"><img src={`${assets}/imgs/cameraicon.png`} alt="" /></button>}
        <button className="primary-button" onClick={() => fileRef.current?.click()}>Choose a photo</button>
        <input ref={fileRef} className="file-input" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={chooseFile} />
      </div>
    </>}
  </section>;
}

function FoodImage({ name, className = '' }) {
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/search_image`, { params: { query: name }, timeout: 10000 })
      .then(({ data }) => { if (active && data.image_url) setImageUrl(data.image_url); }).catch(() => {});
    return () => { active = false; };
  }, [name]);
  return <div className={`food-image ${className}`}>
    {imageUrl ? <img src={imageUrl} alt={name} onError={() => setImageUrl('')} /> : <div className="food-placeholder" role="img" aria-label={`No photo available for ${name}`}>
      <span className="placeholder-plate"><span /></span><small>Image unavailable</small>
    </div>}
  </div>;
}

function Breakdown({ navigation, activeTab, foods, mealPhoto, mealDetails, setMealDetails, selectedAlternatives, setSelectedAlternatives }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [servings, setServings] = useState({});
  const [activeFood, setActiveFood] = useState(0);
  const [mealPhotoUrl, setMealPhotoUrl] = useState('');
  useEffect(() => {
    if (!mealPhoto) { setMealPhotoUrl(''); return undefined; }
    const url = URL.createObjectURL(mealPhoto);
    setMealPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mealPhoto]);
  useEffect(() => {
    let active = true;
    if (!foods.length || mealDetails.length) return undefined;
    setLoading(true); setError('');
    Promise.all(foods.map(async (food) => {
      const name = typeof food === 'string' ? food : food.name;
      const category = typeof food === 'string' ? 'Other' : food.category || 'Other';
      try {
        const [nutrition, recommendations] = await Promise.all([
          axios.get(`${API_URL}/nutrition`, { params: { food_name: name }, timeout: 20000 }),
          axios.get(`${API_URL}/recommendations`, { params: { food_name: name, number_of_recommendations: 5 }, timeout: 20000 }),
        ]);
        return { food: { name, category }, nutrition: nutrition.data, recommendations: recommendations.data.recommendations || [] };
      } catch { return { food: { name, category }, nutrition: null, recommendations: [], failed: true }; }
    })).then((results) => {
      if (!active) return;
      setMealDetails(results);
      if (results.every((item) => item.failed)) setError('Could not load meal details. Check your connection and retry.');
      setLoading(false);
    });
    return () => { active = false; };
  }, [foods, mealDetails.length, setMealDetails]);

  const currentFood = mealDetails[activeFood] || mealDetails[0];
  const toggleChoice = (food, choice) => {
    const current = selectedAlternatives[food] || [];
    setSelectedAlternatives({ ...selectedAlternatives, [food]: current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice] });
  };
  const changeTab = (tab) => (navigation.switchTab || navigation.navigate)(tab);
  const handleAnalysisBack = () => {
    if (activeTab === 'Rundown' && activeFood > 0) setActiveFood(activeFood - 1);
    else navigation.goBack();
  };
  const servingCount = currentFood ? servings[currentFood.food.name] || 1 : 1;
  const quantity = (value) => value == null ? '—' : (Number(value) * servingCount).toFixed(1).replace(/\.0$/, '');
  const baseCalories = (nutrition) => {
    if (!nutrition || nutrition.protein_g == null || nutrition.carbohydrates_g == null || nutrition.fat_g == null) return null;
    const perHundredGrams = nutrition.calories_kcal ?? (Number(nutrition.protein_g) * 4 + Number(nutrition.carbohydrates_g) * 4 + Number(nutrition.fat_g) * 9);
    return Math.round(Number(perHundredGrams));
  };
  const calories = (nutrition) => baseCalories(nutrition) == null ? null : Math.round(baseCalories(nutrition) * servingCount);

  return <section className="content-screen analysis-screen">
    <header className="analysis-header">
      <div className="header-tools"><button className="back-button" onClick={handleAnalysisBack} aria-label={activeTab === 'Rundown' && activeFood > 0 ? 'Previous food' : 'Go back'}>‹</button><img className="header-logo" src={`${assets}/imgs/nutrigenie.png`} alt="NutriGenie" /><button className="menu-button" onClick={() => navigation.navigate('Home')} aria-label="Open menu"><span>☰</span></button></div>
      <h1>Untitled Plate</h1>
      <nav className="analysis-tabs" aria-label="Meal details">
        {[['Rundown', 'Overview'], ['Nutrition', 'Nutrition'], ['Alternatives', 'Alternatives']].map(([tab, label]) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => changeTab(tab)}>{label}</button>)}
      </nav>
    </header>
    <div className="scroll-content analysis-content">
      {loading && <div className="loader">Loading meal details…</div>}
      {error && <button className="error-link" onClick={() => setMealDetails([])}>{error} Tap to retry.</button>}
      {!loading && !mealDetails.length && !error && <p className="empty">No meal details yet. Go back and analyze a photo to get started.</p>}
      {activeTab === 'Rundown' && <>
        {mealDetails.filter((_, index) => index === activeFood).map(({ food, nutrition, recommendations }, index) => <article className="overview-food" key={food.name}>
          {mealPhotoUrl ? <img className="overview-image overview-photo" src={mealPhotoUrl} alt="Your analyzed meal" /> : <FoodImage name={food.name} className="overview-image" />}
          <div className="overview-caption"><span className="eyebrow">{food.category}</span><h2>{food.name}</h2></div>
          <div className="glance-heading"><span>At a glance</span><small>Approx. per 100 g</small></div>
          {nutrition?.protein_g == null ? <p className="empty">Nutrition profile unavailable for this food.</p> : <div className="glance-card">
            <Metric label="Calories" value={baseCalories(nutrition) ?? '—'} unit="kcal" tone="calories" />
            <Metric label="Fat" value={nutrition.fat_g} unit="g" tone="fat" />
            <Metric label="Carbs" value={nutrition.carbohydrates_g} unit="g" tone="carbs" />
            <Metric label="Protein" value={nutrition.protein_g} unit="g" tone="protein" />
          </div>}
          {nutrition?.is_demo_estimate && <small className="estimate-note">{nutrition.profile_note}</small>}
          {mealDetails.length > 1 && <div className="food-pagination"><button onClick={() => setActiveFood((index + mealDetails.length - 1) % mealDetails.length)} aria-label="Previous food">‹</button><span>{index + 1} of {mealDetails.length}</span><button onClick={() => setActiveFood((index + 1) % mealDetails.length)} aria-label="Next food">›</button></div>}
          {recommendations.length > 0 && <button className="inline-link" onClick={() => changeTab('Alternatives')}>Explore {recommendations.length} similar food options →</button>}
        </article>)}
      </>}
      {activeTab === 'Nutrition' && currentFood && <>
        <div className="food-selector" aria-label="Foods in this plate">{mealDetails.map(({ food }, index) => <button key={food.name} className={index === activeFood ? 'selected' : ''} onClick={() => setActiveFood(index)}><FoodImage name={food.name} className="selector-image" /><span>{food.name}</span></button>)}</div>
        <article className="nutrition-panel">
          <div className="nutrition-heading"><div><span className="eyebrow">{currentFood.food.category}</span><h2>{currentFood.food.name}</h2></div><span className="data-badge">Estimated</span></div>
          <div className="serving-control"><span>Serving size</span><div><button onClick={() => setServings({ ...servings, [currentFood.food.name]: Math.max(.5, servingCount - .5) })} aria-label="Decrease servings">−</button><strong>{servingCount} × 100 g</strong><button onClick={() => setServings({ ...servings, [currentFood.food.name]: servingCount + .5 })} aria-label="Increase servings">+</button></div></div>
          {currentFood.nutrition?.protein_g == null ? <p className="empty">Nutrition profile unavailable for this food.</p> : <>
            <h3 className="nutrition-subtitle">Estimated nutritional content</h3>
            <div className="nutrition-table">
              <NutritionRow name="Energy" value={calories(currentFood.nutrition)} unit="kcal" />
              <NutritionRow name="Total fat" value={quantity(currentFood.nutrition.fat_g)} unit="g" />
              <NutritionRow name="Total carbohydrate" value={quantity(currentFood.nutrition.carbohydrates_g)} unit="g" />
              <NutritionRow name="Protein" value={quantity(currentFood.nutrition.protein_g)} unit="g" />
            </div>
            <p className="nutrition-footnote">Values are scaled from the available food profile. Calories are estimated from protein, carbohydrate, and fat; detailed micronutrient data is not available.</p>
          </>}
          {currentFood.nutrition?.is_demo_estimate && <small className="estimate-note">{currentFood.nutrition.profile_note}</small>}
        </article>
      </>}
      {activeTab === 'Alternatives' && <>
        <div className="alternative-intro"><span className="eyebrow">Thoughtful swaps</span><h2>Similar nutrition, new ideas</h2><p>Explore foods with a comparable balance of protein, carbohydrates, and fat.</p></div>
        {mealDetails.map(({ food, nutrition, recommendations }) => <section className="recommendation-group alternatives-group" key={food.name}><div className="group-title"><h3>Similar to {food.name}</h3><span>{recommendations.length} ideas</span></div>
          {!recommendations.length ? <p className="empty">{nutrition?.protein_g == null ? 'No reliable nutrition profile is available to find similar foods.' : 'No similar foods were found in the available dataset.'}</p> : <div className="alternative-grid">{recommendations.map((choice, index) => {
            const selected = (selectedAlternatives[food.name] || []).includes(choice);
            return <button className={`alternative-card ${selected ? 'selected' : ''}`} key={choice} onClick={() => toggleChoice(food.name, choice)} aria-pressed={selected}>
              <FoodImage name={choice} className="alternative-image" /><span className="alternative-number">{String(index + 1).padStart(2, '0')}</span><span className="checkmark">{selected ? '✓' : '+'}</span>
              <strong>{choice}</strong><small>{selected ? 'Added to your ideas' : 'Comparable macro profile'}</small>
            </button>;
          })}</div>}
          {(selectedAlternatives[food.name] || []).length > 0 && <p className="selected-summary">Your picks: {selectedAlternatives[food.name].join(', ')}</p>}
        </section>)}
      </>}
    </div>
    <nav className="bottom-tabs" aria-label="Main navigation">
      <button disabled><span>▤</span>Saved plates</button><button disabled className="camera-tab"><span>◎</span>Camera</button><button disabled><span>◯</span>Profile</button>
    </nav>
  </section>;
}

function Metric({ label, value, unit, tone }) {
  return <div className={`metric ${tone}`}><span className="metric-ring"><strong>{value}</strong><small>{unit}</small></span><span className="metric-label">{label}</span></div>;
}

function NutritionRow({ name, value, unit }) {
  return <div className="nutrition-row"><span>{name}</span><strong>{value} <small>{unit}</small></strong></div>;
}

function Home({ navigation }) {
  return <section className="home-screen"><strong>NutriGenie</strong><h1>Make your next meal a little better.</h1>
    <p>Scan a meal to see the foods in it, explore nutrition details, and find similar alternatives.</p>
    <button className="primary-button" onClick={() => navigation.navigate('Camera')}>Scan a meal</button>
    <button className="text-button" onClick={() => navigation.navigate('Welcome')}>Back to welcome</button>
  </section>;
}

export default App;
