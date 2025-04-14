// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CreateRouteScreen from './screens/CreateRouteScreen';
import SaveRouteScreen from './screens/SaveRouteScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import MyDraftRouteScreen from './screens/MyDraftRouteScreen';
import MySharedRoutesScreen from './screens/MySharedRoutesScreen';



const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
        />
        <Stack.Screen 
          name="CreateRoute" 
          component={CreateRouteScreen} 
        />
        <Stack.Screen 
          name="SaveRoute" 
          component={SaveRouteScreen} 
        />
        <Stack.Screen 
          name="RouteDetail" 
          component={RouteDetailScreen} 
          options={{ title: 'Route Details' }} 
        />
        <Stack.Screen
          name="MyDraftRoutes"
          component={MyDraftRouteScreen}
        />
          <Stack.Screen
          name="MySharedRoutes"
          component={MySharedRoutesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
