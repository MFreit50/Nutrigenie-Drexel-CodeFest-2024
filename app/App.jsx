
import axios from 'axios';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useState, useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './components/Home'
import Welcome from './components/Welcome'
import Camera from './components/Camera'
import Rundown from './components/Breakdown'
import Nutrition from './components/Nutrition'
import Alternatives from './components/Alternatives'
import { FoodsContext } from './contexts/FoodsContext'

const Stack = createNativeStackNavigator();

const App = () => {

  const [ foods, setFoods ] = useState([]); // ["apple, "banana", "orange]
  const [recommendations, setRecommendations] = useState([{name: "apple", score: 0.5}, {name: "banana", score: 0.3}, {name: "orange", score: 0.2}]);

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const url = 'https://drexel-codefest-2024-3.onrender.com'
        const endpoint = '/'
        const response = await axios.get(`${url}${endpoint}`)
        console.log("RESPONSE", response.data)
      } catch (error) {
        console.log("ERROR", error)
      }
    }
    wakeUpServer()
  }, [])

  return (
    <FoodsContext.Provider value={{ foods, setFoods }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen 
            name="Camera" 
            component={Camera}  
          />
          <Stack.Screen name="Rundown" component={Rundown} foods={foods}/>
          <Stack.Screen name="Nutrition" component={Nutrition} />
          <Stack.Screen name="Alternatives" component={Alternatives} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </FoodsContext.Provider>
  );
}


const styles = StyleSheet.create({

});

export default App;
