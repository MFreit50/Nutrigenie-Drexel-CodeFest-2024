
import { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './components/Home'
import Welcome from './components/Welcome'
import Camera from './components/Camera'
import Rundown from './components/Breakdown'
import Alternatives from './components/Alternatives'
import Nutrition from './components/Nutrition'
import { FoodsContext } from './contexts/FoodsContext'

const Stack = createNativeStackNavigator();

const App = () => {

  const [ foods, setFoods ] = useState([]); // [{ name: 'apple', category: 'Fruit' }]
  const [mealPhotoUri, setMealPhotoUri] = useState(null);
  const [mealDetails, setMealDetails] = useState([]);
  const [selectedAlternatives, setSelectedAlternatives] = useState({});

  return (
    <FoodsContext.Provider value={{ foods, setFoods, mealPhotoUri, setMealPhotoUri, mealDetails, setMealDetails, selectedAlternatives, setSelectedAlternatives }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen 
            name="Camera" 
            component={Camera}  
          />
          <Stack.Screen name="Rundown" component={Rundown} />
          <Stack.Screen name="Nutrition" component={Nutrition} />
          <Stack.Screen name="Alternatives" component={Alternatives} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </FoodsContext.Provider>
  );
}


export default App;
