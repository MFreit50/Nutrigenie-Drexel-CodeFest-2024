import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './components/Home'
import Welcome from './components/Welcome'
import Camera from './components/Camera'
import Rundown from './components/Rundown'
import Nutrition from './components/Nutrition'
import Alternatives from './components/Alternatives'

//const [nutritionFacts, setNutritionFacts] = useState({});

const Stack = createNativeStackNavigator();

const App = () => {

  const [ foods, setFoods ] = useState([]); // ["apple, "banana", "orange]
  const [recommendations, setRecommendations] = useState([{name: "apple", score: 0.5}, {name: "banana", score: 0.3}, {name: "orange", score: 0.2}]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen 
          name="Camera" 
          component={Camera} 
          setFoods={setFoods} 
        />
        <Stack.Screen name="Rundown" component={Rundown} foods={foods}/>
        <Stack.Screen name="Nutrition" component={Nutrition} />
        <Stack.Screen name="Alternatives" component={Alternatives} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({

});

export default App;
