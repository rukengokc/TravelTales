// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SaveRouteScreen from './screens/SaveRouteScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import BottomTabs from './navigation/BottomTabs';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="SaveRoute" component={SaveRouteScreen} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Route Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
