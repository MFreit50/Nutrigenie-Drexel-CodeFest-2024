import { createContext } from 'react';

const FoodsContext = createContext({
    foods: [],
    setFoods: () => {},
    mealPhotoUri: null,
    setMealPhotoUri: () => {},
    mealDetails: [],
    setMealDetails: () => {},
    selectedAlternatives: {},
    setSelectedAlternatives: () => {},
});

export { FoodsContext };
