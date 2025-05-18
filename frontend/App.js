// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SaveRouteScreen from './screens/SaveRouteScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import BottomTabs from './navigation/BottomTabs';
import EditProfileScreen from './screens/EditProfileScreen';
import ManageUsersScreen from './screens/ManageUsersScreen';
import DeleteRoutesScreen from './screens/DeleteRoutesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen 
          name="EditProfile"  
          component={EditProfileScreen} 
          options={{ headerShown: true, title: "Edit Profile" }} 
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
        <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
        <Stack.Screen name="DeleteRoutes" component={DeleteRoutesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


